from pydantic import BaseModel, Field
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str = Field(description="user or assistant or system")
    content: str = Field(description="Message body text")

class Citation(BaseModel):
    source: str = Field(description="Document source or reference title")
    snippet: str = Field(description="Relevant text excerpt")

class ChatResponse(BaseModel):
    reply: str = Field(description="AI response text")
    citations: List[Citation] = Field(default_factory=list, description="RAG reference citations if applicable")

class ChatRequest(BaseModel):
    query: str = Field(description="User question or prompt")
    history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation turns")
    use_rag: bool = Field(default=False, description="Whether to query RAG vector knowledge base")
