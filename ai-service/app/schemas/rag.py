from pydantic import BaseModel, Field
from typing import List, Optional

class RAGDocumentUpload(BaseModel):
    document_title: str = Field(description="Name or title of placement doc/experience")
    category: str = Field(description="Interview Experience, Placement Notes, JD, Course Notes")
    text_content: str = Field(description="Full text or chunked content")

class RAGQueryResult(BaseModel):
    query: str = Field(description="Search query")
    retrieved_chunks: List[str] = Field(default_factory=list, description="Top-k matching vector chunks")
    generated_answer: str = Field(description="LLM response synthesized using retrieved context")
    sources: List[str] = Field(default_factory=list, description="Unique source document titles")
