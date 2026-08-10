from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# --- Stored / normalized job from external sources ---

class NormalizedJob(BaseModel):
    source: str = Field(description="greenhouse, ashby, etc.")
    source_job_id: str
    company: str
    title: str
    location: str = "Remote"
    employment_type: str = Field(default="Full-time", description="Internship, Full-time, Part-time")
    description: str = ""
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    education_requirements: List[str] = Field(default_factory=list)
    experience_requirements: List[str] = Field(default_factory=list)
    graduation_year: Optional[int] = None
    job_url: str
    posted_at: Optional[str] = None
    last_updated: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    is_active: bool = True


class JobMatchBreakdown(BaseModel):
    required_skills_pct: float = 0
    preferred_skills_pct: float = 0
    role_relevance_pct: float = 0
    education_pct: float = 0
    graduation_pct: float = 0
    location_pct: float = 0


class JobMatchResult(BaseModel):
    score: int = Field(ge=0, le=100)
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    partial_matches: List[str] = Field(default_factory=list)
    recommendation: str = ""
    breakdown: JobMatchBreakdown = Field(default_factory=JobMatchBreakdown)


class JobExplanationResult(BaseModel):
    recommendation: str = Field(description="Strong Match, Good Match, etc.")
    strengths: List[str] = Field(default_factory=list)
    missing_skill_explanation: List[str] = Field(default_factory=list)
    priority_skills: List[str] = Field(default_factory=list)
    reason: str = ""
    preparation_advice: List[str] = Field(default_factory=list)


class JobRefreshStats(BaseModel):
    sources_checked: int = 0
    jobs_fetched: int = 0
    new_jobs: int = 0
    updated_jobs: int = 0
    unchanged_jobs: int = 0


# --- Legacy LLM-generated recommendations (kept for backward compatibility) ---

class JobListing(BaseModel):
    title: str = Field(description="Job title e.g. Software Engineer")
    company: str = Field(description="Company or organization name")
    location: str = Field(description="City, country, or Remote")
    work_mode: str = Field(description="Remote, Hybrid, or On-site")
    match_score: int = Field(description="Fit score 0-100 based on candidate profile")
    salary_range: str = Field(description="Estimated salary range e.g. ₹8-12 LPA or $80k-110k")
    required_skills: List[str] = Field(default_factory=list)
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    why_recommended: str = Field(description="Why this role fits the candidate")
    application_tips: List[str] = Field(default_factory=list)


class JobRecommendationResult(BaseModel):
    candidate_summary: str = Field(description="Brief profile summary used for matching")
    target_roles: List[str] = Field(default_factory=list, description="Best-fit role titles")
    recommended_jobs: List[JobListing] = Field(default_factory=list, description="Top personalized job matches")
    market_insights: List[str] = Field(default_factory=list, description="Placement market trends from analysis")
    next_steps: List[str] = Field(default_factory=list, description="Actionable steps to improve job readiness")
