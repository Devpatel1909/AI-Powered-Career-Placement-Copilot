import logging
from app.core.llm_client import llm_client
from app.schemas.interview import InterviewQuestionsResult

logger = logging.getLogger(__name__)

def generate_interview_questions(
    resume_text: str,
    job_description: str,
    target_role: str = "Software Engineer"
) -> InterviewQuestionsResult:
    """
    Module 5: Interview Question Generator
    Generates targeted technical, behavioral, resume-specific, project deep-dive, and coding questions with ideal answers and follow-ups.
    """
    prompt = f"""
    You are a Principal Tech Interviewer at a top tier tech company.
    Generate a customized placement interview question set tailored specifically to the candidate's resume and the job description for the role '{target_role}'.

    CANDIDATE RESUME:
    {resume_text}

    JOB DESCRIPTION:
    {job_description}

    Instructions:
    Generate structured questions across 5 categories:
    1. Technical Questions (core concepts, algorithms, frameworks)
    2. Behavioral Questions (STAR method, teamwork, conflict, ownership)
    3. Resume-Based Questions (probing past achievements and education listed in resume)
    4. Project Questions (deep dives into technologies and design decisions in their projects)
    5. Coding Questions (algorithmic or system implementation challenges)

    Each question item MUST contain:
    - category, question text, difficulty (Easy, Medium, Hard)
    - context_or_trigger (why this question is asked based on their profile)
    - ideal_answer_points (key bullet points interviewer looks for)
    - follow_up_questions (probing follow-ups)
    """

    return llm_client.generate_structured_output(prompt, InterviewQuestionsResult)
