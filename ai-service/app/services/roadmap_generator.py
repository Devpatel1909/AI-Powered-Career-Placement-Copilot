import logging
from typing import List
from app.core.llm_client import llm_client
from app.schemas.roadmap import RoadmapResult

logger = logging.getLogger(__name__)

def generate_learning_roadmap(
    missing_skills: List[str],
    target_role: str,
    available_hours_per_week: float = 15.0,
    duration_weeks: int = 4
) -> RoadmapResult:
    """
    Module 4: Learning Roadmap Generator
    Generates a personalized daily and weekly study roadmap tailored to missing skills and available hours.
    """
    skills_str = ", ".join(missing_skills) if missing_skills else "Core Software Engineering & System Design"

    weeks = max(1, min(int(duration_weeks or 4), 8))
    prompt = f"""
    You are an expert AI Technical Mentor.
    Design a compact, valid JSON learning roadmap for '{target_role}'.

    MISSING SKILLS TO COVER: {skills_str}
    STUDY TIME AVAILABLE: {available_hours_per_week} hours per week
    TARGET TIMEFRAME: {weeks} weeks

    Hard limits so JSON stays small and valid:
    - weekly_plan: exactly {weeks} weeks
    - each week daily_breakdown: 5 days max
    - each day activities: 2 short items max
    - learning_resources: 5 items max
    - recommended_projects: 2 items max
    - practice_problems: 6 items max
    - mock_interviews: 3 items max
    - every string under 140 characters
    - no trailing commas, no markdown, no comments
    """

    return llm_client.generate_structured_output(prompt, RoadmapResult)
