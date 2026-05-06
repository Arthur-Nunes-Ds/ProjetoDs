from fastapi import APIRouter, Depends, Request, Form, Query
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from ..db import get_sesion
from ..model import Usuario
from ..services.jwt import criar_token
from ..services.erros import NoteUserSenha
import uuid
import os
import time
from fastapi.templating import Jinja2Templates
from typing import Optional

Rotas_Auth = APIRouter()

# Configuração de templates local para evitar importação circular
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"))

# Armazenamento temporário de códigos (em produção, use Redis)
auth_codes = {}

@Rotas_Auth.get("/authorize", response_class=HTMLResponse)
async def authorize(
    request: Request,
    client_id: str = Query(...),
    redirect_uri: str = Query(...),
    response_type: str = Query("code"),
    state: Optional[str] = Query(None),
    scope: Optional[str] = Query(None)
):
    """Exibe a página de login para autorização OAuth2."""
    print("="*50)
    print(f"DEBUG OAUTH AUTHORIZE REQUEST RECEIVED")
    print(f"Query Params: client_id={client_id}, redirect_uri={redirect_uri}, state={state}")
    print("="*50)
    
    return templates.TemplateResponse("login_oauth.html", {
        "request": request,
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state or "",
        "response_type": response_type,
        "scope": scope or ""
    })

@Rotas_Auth.post("/login")
async def login_process(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    client_id: str = Form(...),
    redirect_uri: str = Form(...),
    state: Optional[str] = Form(None),
    response_type: str = Form("code"),
    scope: Optional[str] = Form(None),
    session: Session = Depends(get_sesion)
):
    """Processa o login e redireciona de volta com o código de autorização."""
    # Buscar usuário pelo email
    user = session.query(Usuario).filter(Usuario._email == email).first()
    
    if not user or not user.verificarSenha(password):
        # Retorna para a página de login com erro
        return templates.TemplateResponse("login_oauth.html", {
            "request": request,
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": state or "",
            "response_type": response_type,
            "scope": scope or "",
            "error": "E-mail ou senha incorretos."
        })

    # Gerar código de autorização (UUID)
    code = str(uuid.uuid4())
    auth_codes[code] = {
        "user_id": user.id,
        "client_id": client_id,
        "expires_at": time.time() + 600 # 10 minutos
    }

    # Redirecionar para: {redirect_uri}?code={code}&state={state}
    separator = "&" if "?" in redirect_uri else "?"
    redirect_url = f"{redirect_uri}{separator}code={code}"
    if state:
        redirect_url += f"&state={state}"
        
    print(f"DEBUG OAUTH REDIRECT: Redirecting to {redirect_url}")
    return RedirectResponse(url=redirect_url, status_code=303)

@Rotas_Auth.post("/token")
async def token_exchange(
    grant_type: str = Form(...),
    code: str = Form(None),
    client_id: str = Form(None),
    client_secret: Optional[str] = Form(None),
    refresh_token: Optional[str] = Form(None)
):
    """Troca o código de autorização pelo access_token final."""
    
    if grant_type == "authorization_code":
        if not code:
            return JSONResponse(status_code=400, content={"error": "invalid_request", "error_description": "code is missing"})
            
        # Validar o código
        auth_info = auth_codes.get(code)
        if not auth_info:
            return JSONResponse(status_code=400, content={"error": "invalid_grant"})

        if time.time() > auth_info["expires_at"]:
            del auth_codes[code]
            return JSONResponse(status_code=400, content={"error": "invalid_grant", "error_description": "Code expired"})

        user_id = auth_info["user_id"]
        # Remover o código usado
        del auth_codes[code]
        
    elif grant_type == "refresh_token":
        if not refresh_token:
            return JSONResponse(status_code=400, content={"error": "invalid_request", "error_description": "refresh_token is missing"})
        # Em um fluxo real, validaríamos o refresh_token no DB. 
        # Aqui, como é um MVP, vamos gerar um novo token (assumindo user_id 1 se não houver contexto)
        user_id = 1 
    else:
        return JSONResponse(status_code=400, content={"error": "unsupported_grant_type"})

    # Gerar o JWT final
    access_token = criar_token(user_id)
    
    # Formato solicitado pelo usuário
    return {
        "access_token": access_token,
        "refresh_token": str(uuid.uuid4()),
        "expires_in": 3600,
        "token_type": "Bearer"
    }
