import redis
from ..config import REDIS_PASSWORD

redis_conection = redis.Redis(
    host='redis', 
    port=6379, 
    password=REDIS_PASSWORD,
    decode_responses=True
)

