from fastapi import APIRouter, Depends, Request, Form, Query
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from ..db import get_sesion
from ..config import ST_CLIENT_ID, ST_CLIENT_SECRET
from ..services.jwt import criar_token, verificar_jwt
from ..services.st_security import verify_smartthings_signature
from ..services import st_service
from typing import Optional
import uuid

Rotas_ST = APIRouter()

# --- OAuth2 Endpoints ---

@Rotas_ST.get("/auth/authorize", response_class=HTMLResponse)
async def st_authorize(
    client_id: str,
    response_type: str,
    redirect_uri: str,
    state: Optional[str] = None,
    scope: Optional[str] = None
):
    """Simple login page for SmartThings OAuth2."""
    if client_id != ST_CLIENT_ID:
        return HTMLResponse(content="<h1>Invalid Client ID</h1>", status_code=400)

    html_content = f"""
    <html>
        <head><title>EchoDE - SmartThings Login</title></head>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f0f2f5;">
            <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 300px;">
                <h2 style="color: #1a73e8; margin-bottom: 1.5rem;">EchoDE Login</h2>
                <form action="/st/auth/login" method="post">
                    <input type="hidden" name="redirect_uri" value="{redirect_uri}">
                    <input type="hidden" name="state" value="{state or ""}">
                    <div style="margin-bottom: 1rem;">
                        <label>User ID:</label><br/>
                        <input type="text" name="user_id" style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;" required>
                    </div>
                    <button type="submit" style="width: 100%; padding: 0.75rem; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Authorize SmartThings
                    </button>
                </form>
            </div>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@Rotas_ST.post("/auth/login")
async def st_login_process(
    user_id: int = Form(...),
    redirect_uri: str = Form(...),
    state: str = Form(...)
):
    """Processes login and redirects back to SmartThings with a code."""
    # In a real app, verify password here. For now, we trust the ID.
    code = f"code_{user_id}_{uuid.uuid4().hex[:8]}"
    # Ideally store this code in DB/Redis with user_id. 
    # For simulation, we'll just pass it.
    separator = "&" if "?" in redirect_uri else "?"
    return RedirectResponse(url=f"{redirect_uri}{separator}code={code}&state={state}", status_code=303)

@Rotas_ST.post("/auth/token")
async def st_token(request: Request):
    """Exchanges code for access token."""
    form_data = await request.form()
    grant_type = form_data.get("grant_type")
    client_id = form_data.get("client_id")
    client_secret = form_data.get("client_secret")

    # Validate client credentials
    if client_id != ST_CLIENT_ID or client_secret != ST_CLIENT_SECRET:
        return JSONResponse(status_code=401, content={"error": "invalid_client"})
    
    if grant_type == "authorization_code":
        code = form_data.get("code")
        # Extract user_id from our simulated code format "code_{user_id}_{hex}"
        try:
            user_id = int(code.split("_")[1])
        except Exception:
            return JSONResponse(status_code=400, content={"error": "invalid_grant"})
            
        access_token = criar_token(user_id)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": f"refresh_{user_id}_{uuid.uuid4().hex[:8]}"
        }
    
    return JSONResponse(status_code=400, content={"error": "unsupported_grant_type"})

# --- Webhook Endpoint ---

@Rotas_ST.post("/webhook", dependencies=[Depends(verify_smartthings_signature)])
async def st_webhook(
    request: Request,
    session: Session = Depends(get_sesion)
):
    """Main Webhook for SmartThings interactions."""
    payload = await request.json()
    headers = payload.get("headers", {})
    
    # Busca o interactionType no header (padrão Schema) ou na raiz (fallback)
    interaction_type = headers.get("interactionType") or payload.get("interactionType")
    request_id = headers.get("requestId")
    
    # A Samsung testa o seu servidor assim:
    if interaction_type == "interactionResult":
        return JSONResponse(status_code=200, content={})
        
    # Se for o desafio inicial (Lifecycle Challenge):
    if interaction_type == "confirmation":
        return JSONResponse(
            status_code=200, 
            content={"targetUrl": "https://api.2dsmoca.tech/st/webhook"}
        )
    
    # Get user_id from the access token provided in the callbackAuthentication
    # Note: SmartThings sends the token in authentication.token
    auth = payload.get("authentication", {})
    token = auth.get("token")
    
    if not token:
        return JSONResponse(status_code=401, content={"error": "Missing token in payload"})
    
    try:
        # Reusing your existing JWT verification
        # verificar_jwt returns (id, is_login, is_admin, is_rest_senha, jit)
        user_id, _, _, _, _ = verificar_jwt(token)
    except Exception:
        return JSONResponse(status_code=401, content={"error": "Invalid token"})

    if interaction_type == "discoveryRequest":
        return st_service.handle_discovery(session, user_id, request_id)
    
    elif interaction_type == "stateRefreshRequest":
        devices = payload.get("devices", [])
        return st_service.handle_state_refresh(session, user_id, request_id, devices)
    
    elif interaction_type == "commandRequest":
        devices_commands = payload.get("devices", [])
        return st_service.handle_command(session, user_id, request_id, devices_commands)
    
    return JSONResponse(status_code=400, content={"error": "Unsupported interaction type"})
