import httpx
import base64
import hashlib
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization
from fastapi import Request, HTTPException, Header
from typing import Optional
import time

# Cache for public keys
key_cache = {}
KEY_SERVER_URL = "https://key.smartthings.com/key/"

async def fetch_public_key(key_id: str):
    if key_id in key_cache:
        return key_cache[key_id]
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{KEY_SERVER_URL}{key_id}")
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Could not fetch public key from Samsung")
        
        public_key_pem = response.text
        public_key = serialization.load_pem_public_key(public_key_pem.encode())
        key_cache[key_id] = public_key
        return public_key

def parse_signature_header(header: str):
    """Parses the Authorization header which contains the signature info."""
    parts = {}
    for item in header.replace('Signature ', '').split(','):
        if '=' in item:
            key, value = item.split('=', 1)
            parts[key.strip()] = value.strip('"')
    return parts

async def verify_smartthings_signature(request: Request, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Signature '):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    sig_parts = parse_signature_header(authorization)
    key_id = sig_parts.get('keyId')
    headers_list = sig_parts.get('headers', '').split(' ')
    signature_b64 = sig_parts.get('signature')

    if not key_id or not signature_b64:
        raise HTTPException(status_code=401, detail="Invalid signature header components")

    # Reconstruct the signing string
    signing_string_parts = []
    for header_name in headers_list:
        if header_name == '(request-target)':
            signing_string_parts.append(f"(request-target): {request.method.lower()} {request.url.path}")
        else:
            value = request.headers.get(header_name)
            if not value:
                raise HTTPException(status_code=401, detail=f"Missing header required for signature: {header_name}")
            signing_string_parts.append(f"{header_name}: {value}")

    signing_string = "\n".join(signing_string_parts).encode()

    # Verify Digest if present
    if 'digest' in headers_list:
        body = await request.body()
        digest_header = request.headers.get('digest')
        expected_digest = "SHA-256=" + base64.b64encode(hashlib.sha256(body).digest()).decode()
        if digest_header != expected_digest:
            raise HTTPException(status_code=401, detail="Digest mismatch")

    # Verify RSA Signature
    public_key = await fetch_public_key(key_id)
    signature = base64.b64decode(signature_b64)

    try:
        public_key.verify(
            signature,
            signing_string,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Signature verification failed")

    return True
