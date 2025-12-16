from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

from agent import raju_agent

app = FastAPI(
    title="Raju's Royal Artifacts API",
    description="Chat with Raju, the bargaining shopkeeper!",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class SessionResponse(BaseModel):
    session_id: str
    message: str


@app.get("/")
def root():
    return {
        "message": "Welcome to Raju's Royal Artifacts API!",
        "endpoints": {
            "/chat": "POST - Send message to Raju",
            "/session/new": "GET - Create new chat session",
            "/session/{session_id}/clear": "DELETE - Clear session",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "shop": "open", "owner": "Raju"}


@app.get("/session/new")
def create_session():
    session_id = str(uuid.uuid4())
    return SessionResponse(
        session_id=session_id,
        message="New session created! Start chatting with Raju!"
    )


@app.post("/chat", response_model=ChatResponse)
def chat_with_raju(request: ChatRequest):
    # Create session if not provided
    session_id = request.session_id or str(uuid.uuid4())

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty, my friend!")

    # Get response from Raju
    response = raju_agent.chat(session_id, request.message)

    return ChatResponse(
        response=response,
        session_id=session_id
    )


@app.delete("/session/{session_id}/clear")
def clear_session(session_id: str):
    success = raju_agent.clear_session(session_id)
    if success:
        return {"message": "Session cleared! Come back soon, my friend!"}
    return {"message": "Session not found, but no worries!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
