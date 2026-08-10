import logging
from typing import List, Optional

from app.core.llm_client import llm_client
from app.schemas.jobs import JobRecommendationResult

logger = logging.getLogger(__name__)


def _fetch_rag_context(query: str) -> str:
    """Pull placement/job-market context from the RAG knowledge base."""
    try:
        from app.services.rag_pipeline import rag_pipeline

        rag_res = rag_pipeline.query_knowledge_base(query, top_k=3)
        if rag_res.get("retrieved_chunks"):
            return "\n".join(rag_res["retrieved_chunks"])
    except Exception as e:
        logger.warning(f"RAG context unavailable for job recommendations: {e}")
    return ""


def recommend_personalized_jobs(
    resume_text: str,
    target_role: str = "Software Engineer",
    skills: Optional[List[str]] = None,
    missing_skills: Optional[List[str]] = None,
    career_readiness_score: Optional[int] = None,
    preferred_location: str = "Remote / India",
    use_rag: bool = True,
) -> JobRecommendationResult:
    """
    Module 9: Personalized Job Recommendations
    Combines DeepSeek LLM analysis with optional RAG placement context
    to generate tailored job matches from the candidate profile.
    """
    skills = skills or []
    missing_skills = missing_skills or []

    rag_context = ""
    if use_rag:
        rag_query = f"placement jobs career opportunities {target_role} {' '.join(skills[:8])}"
        rag_context = _fetch_rag_context(rag_query)

    readiness_note = (
        f"Current JD match readiness: {career_readiness_score}%"
        if career_readiness_score is not None
        else "JD match not yet performed"
    )

    prompt = f"""
    You are an AI Career Placement Copilot specializing in personalized job matching for tech candidates.

    CANDIDATE RESUME / PROFILE:
    {resume_text}

    TARGET ROLE: {target_role}
    PREFERRED LOCATION: {preferred_location}
    IDENTIFIED SKILLS: {', '.join(skills) if skills else 'Not specified'}
    SKILL GAPS: {', '.join(missing_skills) if missing_skills else 'None identified'}
    {readiness_note}

    PLACEMENT KNOWLEDGE CONTEXT (from RAG vector DB):
    {rag_context or 'No additional placement notes available.'}

    Instructions:
    1. Summarize the candidate profile in 'candidate_summary'.
    2. Suggest 3-5 realistic 'target_roles' the candidate should pursue.
    3. Generate exactly 5 'recommended_jobs' with realistic company names (mix of startups, MNCs, product companies).
       Each job must include match_score (0-100), salary_range appropriate for the location, matching/missing skills, and application_tips.
    4. Provide 3-4 'market_insights' about current hiring trends for this profile.
    5. Provide 3-4 actionable 'next_steps' to improve placement readiness.
    6. Prioritize roles where the candidate has strong skill overlap but also include 1-2 stretch roles.
    7. Use Indian market context (LPA salaries) when location is India; otherwise use USD ranges.
    """

    return llm_client.generate_structured_output(prompt, JobRecommendationResult)
