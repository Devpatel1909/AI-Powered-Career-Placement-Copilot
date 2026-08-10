import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as ai_router

app = FastAPI(
    title="AI Career & Placement Copilot Microservice",
    description="Python FastAPI AI Engine powered by DeepSeek V4 Flash via OpenRouter — Resume Parsing, JD Matching, Learning Roadmaps, Interview Prep, Agent Workflow, and ChromaDB RAG.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router
app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "service": "AI Career & Placement Copilot AI Microservice",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
