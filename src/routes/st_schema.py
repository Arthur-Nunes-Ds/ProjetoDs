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
import httpx

Rotas_ST = APIRouter()

# --- OAuth2 Endpoints ---

@Rotas_ST.get("/auth/authorize", response_class=HTMLResponse)
async def st_authorize(
    request: Request,
    client_id: Optional[str] = Query(None),
    response_type: Optional[str] = Query("code"),
    redirect_uri: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    scope: Optional[str] = Query(None)
):
    """Redirects to the main OAuth authorize route to maintain a single source of truth."""
    query_params = str(request.query_params)
    target_url = f"/auth/authorize?{query_params}"
    return RedirectResponse(url=target_url)

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
    """Redirects to the main token exchange route."""
    return RedirectResponse(url="/auth/token", status_code=307) # 307 preserves the POST method and data

# --- Webhook Endpoint ---

@Rotas_ST.post("/webhook")
async def st_webhook(request: Request):
    """Main Webhook for SmartThings interactions - Header Echo Version."""
    try:
        payload = await request.json()
        print(f"DEBUG ST PAYLOAD: {payload}")
        
        headers = payload.get("headers", {})
        interaction_type = headers.get("interactionType") or payload.get("interactionType")
        
        # --- NOVO: AUTOMAÇÃO DE CONFIRMAÇÃO DE LIFECYCLE ---
        lifecycle = payload.get("lifecycle")
        if lifecycle == "CONFIRMATION":
            confirmation_url = payload.get("confirmationData", {}).get("confirmationUrl")
            if confirmation_url:
                print(f"AUTOMATIC CONFIRMATION: {confirmation_url}")
                async with httpx.AsyncClient() as client:
                    await client.get(confirmation_url)
                return {"targetUrl": confirmation_url}
        # --------------------------------------------------

        # 1. RESPOSTA DE VERIFICAÇÃO (O que faz o console dar "Verified")
        if interaction_type == "interactionResult":
            return {
                "headers": headers,
                "payload": {}
            }
            
        # 2. DESAFIO DE CONFIRMAÇÃO (Lifecycle)
        if interaction_type == "confirmation":
            return {
                "targetUrl": "https://api.2dsmoca.tech/st/webhook"
            }
            
        # 3. RESPOSTA DE DESCOBERTA (O que faz aparecer no celular)
        if interaction_type == "discoveryRequest":
            response_headers = headers.copy()
            response_headers["interactionType"] = "discoveryResponse"
            
            return {
                "headers": response_headers,
                "devices": [
                    {
                        "externalDeviceId": "sensor-echode-001",
                        "friendlyName": "Consumo EchoDE",
                        "deviceHandlerType": "c2c-energy-meter",
                        "deviceTypeName": "SmartPlug",
                        "manufacturerInfo": {
                            "manufacturerName": "EchoDE",
                            "modelName": "EcoMonitor-V1",
                            "hwVersion": "1.0",
                            "swVersion": "1.0"
                        },
                        "capabilities": [
                            {"capability": "st.energyMeter", "version": 1},
                            {"capability": "st.powerMeter", "version": 1},
                            {"capability": "st.refresh", "version": 1}
                        ],
                        "categories": [{"category": "SmartPlug"}]
                    }
                ]
            }

        # 4. RESPOSTA DE ESTADO (Para os gráficos e valores aparecerem)
        if interaction_type == "stateRefreshRequest":
            response_headers = headers.copy()
            response_headers["interactionType"] = "stateRefreshResponse"
            
            return {
                "headers": response_headers,
                "deviceState": [
                    {
                        "externalDeviceId": "sensor-echode-001",
                        "states": [
                            {
                                "component": "main",
                                "capability": "st.energyMeter",
                                "attribute": "energy",
                                "value": 150.5,
                                "unit": "kWh"
                            },
                            {
                                "component": "main",
                                "capability": "st.powerMeter",
                                "attribute": "power",
                                "value": 45.2,
                                "unit": "W"
                            }
                        ]
                    }
                ]
            }
        
        return {"headers": headers, "payload": {}}
        
    except Exception as e:
        print(f"ERRO WEBHOOK: {e}")
        return JSONResponse(status_code=200, content={"headers": headers, "payload": {}})
