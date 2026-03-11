import os
import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import router as api_router

load_dotenv()

app = FastAPI(title="Conversational BI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Conversational BI API"}

if __name__ == "__main__":
    # Explicitly run the app on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
