from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from starlette.concurrency import run_in_threadpool
from typing import Optional, List
from pydantic import BaseModel

from app.utils.pdf_extractor import extract_text_from_pdf_bytes
from app.services.resume_parser import parse_resume
from app.services.resume_improver import improve_resume
from app.services.jd_matcher import analyze_resume_vs_jd
from app.services.roadmap_generator import generate_learning_roadmap
from app.services.interview_generator import generate_interview_questions
from app.services.chatbot_service import handle_career_chat
from app.services.agent_workflow import run_agentic_workflow
from app.services.job_recommender import recommend_personalized_jobs
from app.services.rag_pipeline import rag_pipeline

from app.schemas.resume import ResumeAnalysisResult, ResumeImprovementResult
from app.schemas.jd import JDMatchResult
from app.schemas.roadmap import RoadmapResult
from app.schemas.interview import InterviewQuestionsResult
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.agent import AgentRequest, AgentExecutionResult
from app.schemas.rag import RAGDocumentUpload, RAGQueryResult
from app.schemas.jobs import JobRecommendationResult, NormalizedJob, JobExplanationResult
from app.services.job_fetcher import fetch_all_jobs
from app.services.job_matcher import build_resume_profile, match_jobs_to_profile
from app.services.job_explainer import explain_job_match

router = APIRouter(prefix="/api/ai", tags=["AI Copilot Services"])

# Request payload models
class AnalyzeResumeRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = "Software Engineer"

class CompareJDRequest(BaseModel):
    resume_text: str
    job_description: str

class RoadmapRequest(BaseModel):
    missing_skills: List[str]
    target_role: str = "Software Engineer"
    available_hours_per_week: float = 15.0
    duration_weeks: int = 4

class InterviewQuestionsRequest(BaseModel):
    resume_text: str
    job_description: str
    target_role: str = "Software Engineer"

class RAGUploadRequest(BaseModel):
    document_title: str
    category: str
    content: str

class PersonalizedJobsRequest(BaseModel):
    resume_text: str
    target_role: str = "Software Engineer"
    skills: List[str] = []
    missing_skills: List[str] = []
    career_readiness_score: Optional[int] = None
    preferred_location: str = "Remote / India"
    use_rag: bool = True

class JobMatchRequest(BaseModel):
    jobs: List[dict]
    parsed_resume: Optional[dict] = None
    skills: List[str] = []
    target_role: str = "Software Engineer"
    preferred_location: str = "Remote / India"
    employment_type: Optional[str] = None
    search: Optional[str] = None

class JobExplainRequest(BaseModel):
    parsed_resume: dict
    job: dict
    match_result: dict


def _analyze_resume(resume_text: str, target_role: str):
    parsed = parse_resume(resume_text)
    improvement = improve_resume(parsed, target_role)
    return parsed, improvement


# 1. Resume Upload & Text Extraction
@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        content = await file.read()
        extracted_text = extract_text_from_pdf_bytes(content)
        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "char_count": len(extracted_text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction error: {str(e)}")

# 2. Module 1 & 2: Resume Analysis & Improvement
@router.post("/analyze-resume")
async def analyze_resume_endpoint(req: AnalyzeResumeRequest):
    try:
        parsed, improvement = await run_in_threadpool(
            _analyze_resume,
            req.resume_text,
            req.target_role or "Software Engineer",
        )
        return {
            "parsed_resume": parsed,
            "improvement_analysis": improvement
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Module 3: Resume vs Job Description Analysis
@router.post("/compare-jd", response_model=JDMatchResult)
async def compare_jd_endpoint(req: CompareJDRequest):
    try:
        return await run_in_threadpool(analyze_resume_vs_jd, req.resume_text, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Module 4: Learning Roadmap
@router.post("/roadmap", response_model=RoadmapResult)
async def generate_roadmap_endpoint(req: RoadmapRequest):
    try:
        return await run_in_threadpool(
            generate_learning_roadmap,
            missing_skills=req.missing_skills,
            target_role=req.target_role,
            available_hours_per_week=req.available_hours_per_week,
            duration_weeks=req.duration_weeks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Module 5: Interview Questions
@router.post("/generate-questions", response_model=InterviewQuestionsResult)
async def generate_questions_endpoint(req: InterviewQuestionsRequest):
    try:
        return await run_in_threadpool(
            generate_interview_questions,
            resume_text=req.resume_text,
            job_description=req.job_description,
            target_role=req.target_role
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. Module 6: Career Chatbot
@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        return await run_in_threadpool(
            handle_career_chat,
            query=req.query,
            history=req.history,
            use_rag=req.use_rag,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7. Module 7: Agentic AI Tool Workflow
@router.post("/agent", response_model=AgentExecutionResult)
async def agent_endpoint(req: AgentRequest):
    try:
        return await run_in_threadpool(run_agentic_workflow, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 8. Module 8: RAG Ingestion & Query
@router.post("/rag/ingest")
async def rag_ingest_endpoint(req: RAGUploadRequest):
    try:
        chunks_count = rag_pipeline.add_document(req.document_title, req.category, req.content)
        return {"status": "success", "chunks_indexed": chunks_count, "document_title": req.document_title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rag/query", response_model=RAGQueryResult)
async def rag_query_endpoint(query: str = Body(..., embed=True)):
    try:
        res = await run_in_threadpool(rag_pipeline.query_knowledge_base, query)
        return RAGQueryResult(
            query=res["query"],
            retrieved_chunks=res["retrieved_chunks"],
            generated_answer=res["generated_answer"],
            sources=res["sources"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 9. Module 9: Personalized Job Recommendations (legacy LLM-generated)
@router.post("/personalized-jobs", response_model=JobRecommendationResult)
async def personalized_jobs_endpoint(req: PersonalizedJobsRequest):
    try:
        return await run_in_threadpool(
            recommend_personalized_jobs,
            resume_text=req.resume_text,
            target_role=req.target_role,
            skills=req.skills,
            missing_skills=req.missing_skills,
            career_readiness_score=req.career_readiness_score,
            preferred_location=req.preferred_location,
            use_rag=req.use_rag,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 10. Dynamic Job Board — fetch from public sources
@router.post("/jobs/refresh")
async def jobs_refresh_endpoint():
    try:
        jobs = fetch_all_jobs()
        return {
            "jobs": [j.model_dump() for j in jobs],
            "count": len(jobs),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 11. Deterministic job matching against stored jobs
@router.post("/jobs/match")
async def jobs_match_endpoint(req: JobMatchRequest):
    try:
        profile = build_resume_profile(req.parsed_resume, req.skills)
        if req.target_role and req.target_role not in profile.get("target_roles", []):
            profile["target_roles"] = [req.target_role] + profile.get("target_roles", [])

        matched = match_jobs_to_profile(
            jobs=req.jobs,
            resume_profile=profile,
            target_role=req.target_role,
            preferred_location=req.preferred_location,
            employment_type=req.employment_type,
            search=req.search,
        )
        return {"jobs": matched, "total": len(matched)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 12. LLM explanation for a single job match (on demand)
@router.post("/jobs/explain", response_model=JobExplanationResult)
async def jobs_explain_endpoint(req: JobExplainRequest):
    try:
        return await run_in_threadpool(
            explain_job_match,
            req.parsed_resume,
            req.job,
            req.match_result,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
