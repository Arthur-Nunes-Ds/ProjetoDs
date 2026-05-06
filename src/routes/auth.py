from fastapi import APIRouter, Depends, Request, Form, Query
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
import time
import json
import uuid
import os
from ..db import get_sesion, redis_conection
from ..model import Usuario
from ..services.jwt import criar_token
from ..services.erros import NoteUserSenha
from fastapi.templating import Jinja2Templates
from typing import Optional

Rotas_Auth = APIRouter()

# Configuração de templates local para evitar importação circular
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"))

# Armazenamento temporário de códigos (em produção, use Redis)
# auth_codes = {} # Removido conforme BUG 3

@Rotas_Auth.get("/authorize", response_class=HTMLResponse)
async def authorize(
    request: Request,
    client_id: Optional[str] = Query(None),
    redirect_uri: Optional[str] = Query(None),
    response_type: Optional[str] = Query("code"),
    state: Optional[str] = Query(None),
    scope: Optional[str] = Query(None)
):
    """Exibe a página de login para autorização OAuth2."""
    print("="*50)
    print(f"DEBUG OAUTH AUTHORIZE REQUEST RECEIVED")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {request.headers}")
    print(f"Query Params: client_id={client_id}, redirect_uri={redirect_uri}, state={state}, response_type={response_type}")
    print("="*50)
    
    if not client_id or not redirect_uri:
        print("WARNING: client_id or redirect_uri missing. Rendering for testing purposes.")
        # We can still render the page for testing, but it won't be a valid OAuth request
        return templates.TemplateResponse("login_oauth.html", {
            "request": request,
            "client_id": client_id or "TEST_CLIENT",
            "redirect_uri": redirect_uri or "https://c2c-us.smartthings.com/login/callback",
            "state": state or "TEST_STATE",
            "response_type": response_type or "code",
            "scope": scope or "",
            "error": "AVISO: Parâmetros OAuth ausentes. Esta página está em modo de teste."
        })

    return templates.TemplateResponse("login_oauth.html", {
        "request": request,
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state or "",
        "response_type": response_type or "code",
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
    user = session.query(Usuario).filter(
        Usuario._email == email,
        Usuario._email_verificado == True
    ).first()
    
    if not user or not user.verificarSenha(password):
        # Retorna para a página de login com erro
        return templates.TemplateResponse("login_oauth.html", {
            "request": request,
            "client_id": client_id or "",
            "redirect_uri": redirect_uri or "",
            "state": state or "",
            "response_type": response_type or "code",
            "scope": scope or "",
            "error": "E-mail ou senha incorretos."
        })

    # Gerar código de autorização
    code = str(uuid.uuid4())
    # Redis para persistência (BUG 3)
    redis_conection.setex(
        f"oauth_code:{code}", 
        600, 
        json.dumps({"user_id": user.id, "client_id": client_id})
    )

    # Redirecionar de volta para o app
    separator = "&" if "?" in redirect_uri else "?"
    redirect_url = f"{redirect_uri}{separator}code={code}"
    if state:
        redirect_url += f"&state={state}"
        
    print(f"DEBUG OAUTH REDIRECT: Redirecting to {redirect_url}")
    return RedirectResponse(url=redirect_url, status_code=303)

@Rotas_Auth.post("/token")
async def token_exchange(
    grant_type: str = Form(...),
    code: str = Form(...),
    client_id: str = Form(...),
    client_secret: Optional[str] = Form(None),
    redirect_uri: Optional[str] = Form(None)
):
    """Troca o código de autorização pelo access_token final."""
    if grant_type != "authorization_code":
        return JSONResponse(status_code=400, content={"error": "unsupported_grant_type"})

    # Validar o código (BUG 3)
    auth_info_raw = redis_conection.get(f"oauth_code:{code}")
    if not auth_info_raw:
        return JSONResponse(status_code=400, content={"error": "invalid_grant"})

    auth_info = json.loads(auth_info_raw)

    # Em um fluxo real, validaríamos o client_id e client_secret aqui
    # Para o app do Guilherme, permitiremos se o code for válido
    
    user_id = auth_info["user_id"]
    
    # Gerar o JWT final
    access_token = criar_token(user_id)
    
    # Remover o código usado (BUG 3)
    redis_conection.delete(f"oauth_code:{code}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "refresh_token": str(uuid.uuid4()), # SmartThings usually requires this
        "user_id": user_id
    }
