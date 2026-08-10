import logging
from typing import List
from app.core.llm_client import llm_client
from app.schemas.chat import ChatMessage, ChatResponse, Citation

logger = logging.getLogger(__name__)

def handle_career_chat(query: str, history: List[ChatMessage], use_rag: bool = False) -> ChatResponse:
    """
    Module 6: AI Career Chatbot
    Answers placement, resume, career, roadmap, and interview questions.
    Maintains conversation history and integrates RAG search citations when enabled.
    """
    citations: List[Citation] = []
    rag_context = ""

    if use_rag:
        try:
            from app.services.rag_pipeline import rag_pipeline
            rag_res = rag_pipeline.query_knowledge_base(query, top_k=3)
            rag_context = "\n---\nRELEVANT RAG KNOWLEDGE CONTEXT:\n" + "\n".join(rag_res["retrieved_chunks"])
            for src, chunk in zip(rag_res["sources"], rag_res["retrieved_chunks"]):
                citations.append(Citation(source=src, snippet=chunk[:150] + "..."))
        except Exception as e:
            logger.warning(f"RAG query failed in chatbot: {e}")

    # Build conversation window (limit last 8 turns to stay well within token limits)
    history_window = history[-8:] if len(history) > 8 else history
    formatted_history = ""
    for msg in history_window:
        formatted_history += f"{msg.role.upper()}: {msg.content}\n"

    system_prompt = (
        "You are an empathetic, highly intelligent AI Placement & Career Copilot mentor. "
        "Your mission is to guide students and engineers through placement prep, resume optimization, "
        "interview strategies, and technical learning path decisions. "
        "Provide direct, inspiring, and technically precise advice."
    )

    full_prompt = (
        f"{formatted_history}"
        f"USER: {query}\n"
        f"{rag_context}\n"
        f"ASSISTANT:"
    )

    reply_text = llm_client.generate_text(full_prompt, system_prompt=system_prompt)

    return ChatResponse(
        reply=reply_text,
        citations=citations
    )
