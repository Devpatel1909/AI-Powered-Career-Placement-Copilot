from pydantic import BaseModel, Field
from typing import List, Optional

class ProjectItem(BaseModel):
    title: str = Field(description="Project title")
    description: str = Field(description="Summary of project work and impact")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies used")
    link: Optional[str] = Field(default=None, description="Repository or live URL if available")

class ExperienceItem(BaseModel):
    company: str = Field(description="Company or organization name")
    role: str = Field(description="Job title or position")
    duration: str = Field(description="Time period (e.g. Jun 2023 - Present)")
    highlights: List[str] = Field(default_factory=list, description="Key achievements or responsibilities")

class EducationItem(BaseModel):
    institution: str = Field(description="College or university name")
    degree: str = Field(description="Degree name (e.g. B.Tech in CSE)")
    year: str = Field(description="Graduation year or duration")
    score: Optional[str] = Field(default=None, description="GPA or percentage")

class ResumeAnalysisResult(BaseModel):
    name: str = Field(description="Candidate's full name")
    email: str = Field(description="Candidate's email address")
    phone: str = Field(description="Candidate's contact phone number")
    skills: List[str] = Field(default_factory=list, description="General skills")
    programming_languages: List[str] = Field(default_factory=list, description="Programming languages")
    frameworks: List[str] = Field(default_factory=list, description="Frameworks and libraries")
    databases: List[str] = Field(default_factory=list, description="Database systems")
    projects: List[ProjectItem] = Field(default_factory=list, description="Projects list")
    education: List[EducationItem] = Field(default_factory=list, description="Education background")
    experience: List[ExperienceItem] = Field(default_factory=list, description="Work experience or internships")
    achievements: List[str] = Field(default_factory=list, description="Honors, awards, or hackathon wins")
    certifications: List[str] = Field(default_factory=list, description="Professional certifications")
    soft_skills: List[str] = Field(default_factory=list, description="Soft skills and interpersonal traits")

class SectionFeedback(BaseModel):
    section: str = Field(description="Section name e.g. Experience, Projects, Skills")
    status: str = Field(description="Good, Needs Improvement, Critical")
    feedback: str = Field(description="Detailed actionable feedback")

class ResumeImprovementResult(BaseModel):
    resume_score: int = Field(description="Overall calculated ATS & content quality score out of 100")
    missing_keywords: List[str] = Field(default_factory=list, description="Industry keywords missing from resume")
    missing_skills: List[str] = Field(default_factory=list, description="Critical technical skills missing for target role")
    grammar_suggestions: List[str] = Field(default_factory=list, description="Grammar, tone, and action verb improvements")
    ats_suggestions: List[str] = Field(default_factory=list, description="Formatting and ATS parsing optimization tips")
    project_improvements: List[str] = Field(default_factory=list, description="How to frame project bullets with metrics")
    certification_suggestions: List[str] = Field(default_factory=list, description="Recommended certifications to add credibility")
    section_feedback: List[SectionFeedback] = Field(default_factory=list, description="Per-section assessment")
