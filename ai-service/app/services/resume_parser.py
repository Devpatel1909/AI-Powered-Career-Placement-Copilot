import logging
from app.core.llm_client import llm_client
from app.schemas.resume import ResumeAnalysisResult

logger = logging.getLogger(__name__)

def parse_resume(resume_text: str) -> ResumeAnalysisResult:
    """
    Module 1: Resume Analyzer
    Extracts structured fields from raw resume text using prompt engineering and DeepSeek LLM.
    """
    prompt = f"""
    Analyze the following resume text meticulously and extract all candidate details into structured JSON format.

    RESUME TEXT:
    {resume_text}

    Instructions:
    1. Extract full name, email, phone number.
    2. Categorize technical skills into: general skills, programming languages, frameworks, databases, soft skills.
    3. Extract all projects with title, tech stack, description, and link if present.
    4. Extract education items with university name, degree, year, and GPA/score.
    5. Extract work experience or internships with company name, position, duration, and bullet point highlights.
    6. Extract achievements and certifications.
    7. Ensure all lists are properly populated and non-null.
    """
    
    return llm_client.generate_structured_output(prompt, ResumeAnalysisResult)
