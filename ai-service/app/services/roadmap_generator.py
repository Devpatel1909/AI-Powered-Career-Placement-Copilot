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

    prompt = f"""
    You are an expert AI Technical Mentor.
    Design a personalized, highly structured learning roadmap for a student aiming for the role of '{target_role}'.

    MISSING SKILLS TO COVER: {skills_str}
    STUDY TIME AVAILABLE: {available_hours_per_week} hours per week
    TARGET TIMEFRAME: {duration_weeks} weeks

    Instructions:
    1. Create a week-by-week curriculum ('weekly_plan') for {duration_weeks} weeks.
    2. For each week, provide specific daily breakdown tasks ('daily_breakdown') with daily focus, estimated hours, and practical exercises.
    3. Curate high-quality learning resources (courses, docs, articles).
    4. Propose portfolio project ideas ('recommended_projects') that demonstrate mastery of these missing skills.
    5. List practice problems (LeetCode/System Design topics).
    6. Include mock interview milestones and an estimated readiness timeline.
    """

    return llm_client.generate_structured_output(prompt, RoadmapResult)
