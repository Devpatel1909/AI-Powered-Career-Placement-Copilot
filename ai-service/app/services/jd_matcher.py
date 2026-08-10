import logging
from app.core.llm_client import llm_client
from app.schemas.jd import JDMatchResult

logger = logging.getLogger(__name__)

def analyze_resume_vs_jd(resume_text: str, job_description: str) -> JDMatchResult:
    """
    Module 3: Resume vs Job Description
    Compares candidate resume against a specific target Job Description.
    Returns career readiness match %, skill overlap, gaps, priority skills, and learning sequence.
    """
    prompt = f"""
    You are an AI Hiring Manager and Resume Screener.
    Perform a strict, deep gap analysis comparing the candidate's resume against the Target Job Description.

    RESUME CONTENT:
    {resume_text}

    JOB DESCRIPTION:
    {job_description}

    Instructions:
    1. Determine exact 'career_readiness_score' (0-100%) indicating how close the candidate is to qualifying for the role.
    2. Extract 'matching_skills' (skills present in both Resume and JD).
    3. Extract 'missing_skills' (skills explicitly required in JD but absent or weak in Resume).
    4. Highlight candidate 'strengths' and 'weaknesses' relative to this specific job.
    5. Formulate 'priority_skills' list with skill name, importance (High/Medium/Low), and detailed justification.
    6. Provide a recommended 'learning_priority' ordered list of what to study first.
    """

    return llm_client.generate_structured_output(prompt, JDMatchResult)
