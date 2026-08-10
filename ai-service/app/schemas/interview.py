from pydantic import BaseModel, Field
from typing import List, Optional

class QuestionItem(BaseModel):
    category: str = Field(description="Technical, Behavioral, Resume-Based, Project, Coding")
    question: str = Field(description="The interview question")
    difficulty: str = Field(description="Easy, Medium, Hard")
    context_or_trigger: Optional[str] = Field(default=None, description="Why this question is asked based on Resume/JD")
    ideal_answer_points: List[str] = Field(default_factory=list, description="Key points candidate must hit")
    follow_up_questions: List[str] = Field(default_factory=list, description="Probing follow-ups interviewer might ask")

class InterviewQuestionsResult(BaseModel):
    target_role: str = Field(description="Role targeted")
    total_questions: int = Field(description="Count of generated questions")
    technical_questions: List[QuestionItem] = Field(default_factory=list)
    behavioral_questions: List[QuestionItem] = Field(default_factory=list)
    resume_based_questions: List[QuestionItem] = Field(default_factory=list)
    project_questions: List[QuestionItem] = Field(default_factory=list)
    coding_questions: List[QuestionItem] = Field(default_factory=list)
