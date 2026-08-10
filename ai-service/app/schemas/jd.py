from pydantic import BaseModel, Field
from typing import List

class PrioritySkill(BaseModel):
    skill: str = Field(description="Skill name")
    importance: str = Field(description="High, Medium, or Low requirement for target role")
    reason: str = Field(description="Why this skill is crucial")

class JDMatchResult(BaseModel):
    career_readiness_score: int = Field(description="Match percentage (0-100%)")
    matching_skills: List[str] = Field(default_factory=list, description="Skills present in both resume and JD")
    missing_skills: List[str] = Field(default_factory=list, description="Required JD skills missing in resume")
    strengths: List[str] = Field(default_factory=list, description="Key candidate strengths relevant to the position")
    weaknesses: List[str] = Field(default_factory=list, description="Gaps or areas of concern for recruiters")
    priority_skills: List[PrioritySkill] = Field(default_factory=list, description="Skills prioritized by urgency")
    learning_priority: List[str] = Field(default_factory=list, description="Step-by-step order of what to learn first")
