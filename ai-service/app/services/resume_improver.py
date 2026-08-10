import logging
import json
from app.core.llm_client import llm_client
from app.schemas.resume import ResumeAnalysisResult, ResumeImprovementResult

logger = logging.getLogger(__name__)

def improve_resume(resume_data: ResumeAnalysisResult, target_role: str) -> ResumeImprovementResult:
    """
    Module 2: Resume Improvement
    Analyzes extracted resume JSON against target role to give actionable ATS, grammar, and skill recommendations.
    """
    resume_json_str = json.dumps(resume_data.model_dump(), indent=2)
    
    prompt = f"""
    You are an elite Tech Career Coach and Senior Technical Recruiter.
    Evaluate the candidate's resume JSON against the target job role: '{target_role}'.

    CANDIDATE RESUME JSON:
    {resume_json_str}

    Instructions:
    1. Calculate a realistic Resume Score (0-100) based on impact, action verbs, quantified metrics, clarity, and target role relevance.
    2. Identify missing industry keywords crucial for ATS screening for '{target_role}'.
    3. Identify missing technical skills needed to stand out.
    4. Provide grammar, tone, and active phrasing suggestions.
    5. Provide specific ATS formatting and parsing optimization advice.
    6. Provide concrete recommendations on how to upgrade project bullet points (e.g. adding metrics, scale, architecture).
    7. Recommend certifications that would boost credibility for '{target_role}'.
    8. Offer granular section-by-section feedback (Experience, Projects, Education, Skills).
    """

    return llm_client.generate_structured_output(prompt, ResumeImprovementResult)
