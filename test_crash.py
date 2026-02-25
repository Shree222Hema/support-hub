import sys
import traceback

try:
    from backend.main import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    res = client.get("/api/v1/tickets/")
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    traceback.print_exc()
