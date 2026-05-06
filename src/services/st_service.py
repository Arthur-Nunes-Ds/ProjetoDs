from sqlalchemy.orm import Session
from ..model import Iot, Consumo
from datetime import datetime
import uuid

def handle_discovery(session: Session, user_id: int, request_id: str):
    devices = session.query(Iot).filter_by(_USUARIO_id=user_id).all()
    
    st_devices = []
    for dev in devices:
        st_devices.append({
            "externalDeviceId": str(dev.id_iot),
            "friendlyName": "Medidor Principal",
            "deviceHandlerType": "SmartPlug",
            "deviceUniqueId": str(dev.id),
            "capabilities": [
                {"capability": "st.switch", "version": 1},
                {"capability": "st.powerMeter", "version": 1},
                {"capability": "st.energyMeter", "version": 1}
            ],
            "manufacturerInfo": {
                "manufacturerName": "EchoDE",
                "modelName": "EcoMonitor-V1",
                "hwVersion": "1.0",
                "swVersion": "1.0"
            }
        })
    
    return {
        "headers": {
            "schema": "st-schema",
            "version": "1.0",
            "interactionType": "discoveryResponse",
            "requestId": request_id
        },
        "devices": st_devices
    }

def handle_state_refresh(session: Session, user_id: int, request_id: str, devices_requested: list):
    device_states = []
    
    for dev_req in devices_requested:
        external_id = dev_req.get("externalDeviceId")
        # Find latest consumption for this device/user
        # Since Iot and Consumo are linked via User, I'll fetch the latest consumption for the user
        # In a more complex setup, you'd link Consumo to a specific Iot ID.
        latest_consumo = session.query(Consumo).filter_by(_USUARIO_id=user_id).order_by(Consumo._data_registro.desc()).first()
        
        power = latest_consumo.valor if latest_consumo else 0.0
        energy = power * 0.001 # Dummy calculation or fetch from DB if available
        
        device_states.append({
            "externalDeviceId": external_id,
            "deviceState": [
                {
                    "component": "main",
                    "capability": "st.switch",
                    "attribute": "switch",
                    "value": "on" # Simulation
                },
                {
                    "component": "main",
                    "capability": "st.powerMeter",
                    "attribute": "power",
                    "value": power,
                    "unit": "W"
                },
                {
                    "component": "main",
                    "capability": "st.energyMeter",
                    "attribute": "energy",
                    "value": energy,
                    "unit": "kWh"
                }
            ]
        })
        
    return {
        "headers": {
            "schema": "st-schema",
            "version": "1.0",
            "interactionType": "stateRefreshResponse",
            "requestId": request_id
        },
        "deviceState": device_states
    }

def handle_command(session: Session, user_id: int, request_id: str, devices_commands: list):
    results = []
    for dev_cmd in devices_commands:
        external_id = dev_cmd.get("externalDeviceId")
        for cmd in dev_cmd.get("commands", []):
            # Process command (e.g., turn on/off)
            # Here we just acknowledge
            results.append({
                "externalDeviceId": external_id,
                "deviceState": [
                    {
                        "component": "main",
                        "capability": cmd.get("capability"),
                        "attribute": cmd.get("command"), # Usually matches attribute name for simple ones
                        "value": cmd.get("arguments")[0] if cmd.get("arguments") else "on"
                    }
                ]
            })
            
    return {
        "headers": {
            "schema": "st-schema",
            "version": "1.0",
            "interactionType": "commandResponse",
            "requestId": request_id
        },
        "deviceState": results
    }

def save_consumption_from_st(session: Session, user_id: int, value: float, type_id: int = 1):
    """
    Saves consumption data received from a SmartThings interaction.
    """
    new_consumo = Consumo(
        valor=value,
        dt_perioto=datetime.now(),
        TIPO_CONSUMO_id=type_id,
        USUARIO_id=user_id
    )
    session.add(new_consumo)
    session.commit()
    return {"status": "success", "id": new_consumo.id}
