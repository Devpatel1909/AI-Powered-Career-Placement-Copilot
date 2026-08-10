from pydantic import BaseModel, Field
from typing import List

class DailyTask(BaseModel):
    day: str = Field(description="Day identifier e.g. Day 1, Day 2")
    focus: str = Field(description="Core concept or topic to learn")
    hours: float = Field(description="Estimated study hours")
    activities: List[str] = Field(default_factory=list, description="Specific practice items")

class WeeklyPlan(BaseModel):
    week_number: int = Field(description="Week number e.g. 1")
    theme: str = Field(description="Weekly milestone or domain focus")
    goals: List[str] = Field(default_factory=list, description="Key deliverables by end of week")
    daily_breakdown: List[DailyTask] = Field(default_factory=list, description="Day by day tasks")

class ResourceItem(BaseModel):
    title: str = Field(description="Resource title or course name")
    type: str = Field(description="Documentation, Video, Book, Interactive Platform")
    url_or_ref: str = Field(description="URL or search title")

class RecommendedProject(BaseModel):
    title: str = Field(description="Project title to add to portfolio")
    key_features: List[str] = Field(default_factory=list, description="Key features to build")
    tech_stack: List[str] = Field(default_factory=list, description="Target technologies")

class RoadmapResult(BaseModel):
    target_role: str = Field(description="Role being targeted")
    timeframe_weeks: int = Field(description="Total weeks duration")
    weekly_plan: List[WeeklyPlan] = Field(default_factory=list, description="Week by week curriculum")
    learning_resources: List[ResourceItem] = Field(default_factory=list, description="Curated study materials")
    recommended_projects: List[RecommendedProject] = Field(default_factory=list, description="Portfolio-building projects")
    practice_problems: List[str] = Field(default_factory=list, description="Recommended LeetCode/Coding topics")
    mock_interviews: List[str] = Field(default_factory=list, description="Suggested mock interview schedule")
    interview_timeline: str = Field(description="Estimated date/readiness milestone for scheduling interviews")
