import json
import logging
from typing import List, Dict, Any, Optional
from app.schemas.agent import AgentRequest, AgentExecutionResult, AgentStep
from app.services.resume_parser import parse_resume
from app.services.resume_improver import improve_resume
from app.services.jd_matcher import analyze_resume_vs_jd
from app.services.roadmap_generator import generate_learning_roadmap
from app.services.interview_generator import generate_interview_questions
from app.core.llm_client import llm_client

logger = logging.getLogger(__name__)

# Define Tool Catalog
TOOLS_CATALOG = {
    "Resume Tool": "Parses and extracts structured sections (skills, projects, education) from raw resume text.",
    "JD Tool": "Compares candidate resume against job description to generate career readiness % and skill overlap.",
    "Skill Gap Tool": "Identifies critical missing technical skills and weak areas required for target role.",
    "Resume Improvement Tool": "Provides actionable ATS suggestions, score, grammar improvements, and bullet formatting.",
    "Roadmap Tool": "Generates a personalized week-by-week and day-by-day learning schedule and project ideas.",
    "Interview Tool": "Generates technical, behavioral, resume, and project interview questions with ideal answers."
}

def execute_agent_tool(tool_name: str, args: Dict[str, Any], context: Dict[str, Any]) -> str:
    """Executes a specific tool given parameters and context."""
    resume_text = context.get("resume_text", "")
    job_description = context.get("job_description", "")
    target_role = context.get("target_role", "Software Engineer")

    try:
        if tool_name == "Resume Tool":
            parsed = parse_resume(resume_text or "Candidate: Software Engineer with Python, React, and Node.js experience.")
            return f"Resume Analysis Complete: Name={parsed.name}, Skills={', '.join(parsed.skills[:10])}, Projects={len(parsed.projects)}"

        elif tool_name in ["JD Tool", "Skill Gap Tool"]:
            jd_res = analyze_resume_vs_jd(
                resume_text or "Candidate with full-stack web and AI interest.",
                job_description or f"Role: {target_role}. Required skills: Python, React, Cloud, System Design, Microservices."
            )
            return f"JD Match Analysis: Match Score={jd_res.career_readiness_score}%, Missing Skills={', '.join(jd_res.missing_skills[:5])}, Priority Skills={len(jd_res.priority_skills)}"

        elif tool_name == "Resume Improvement Tool":
            parsed = parse_resume(resume_text or "Candidate with Python and Web development.")
            improved = improve_resume(parsed, target_role)
            return f"Resume Improvement Assessment: ATS Score={improved.resume_score}/100, Missing Keywords={', '.join(improved.missing_keywords[:5])}"

        elif tool_name == "Roadmap Tool":
            missing = args.get("missing_skills", ["System Design", "Docker", "FastAPI"])
            roadmap = generate_learning_roadmap(missing_skills=missing, target_role=target_role)
            return f"Roadmap Generated: {roadmap.timeframe_weeks} weeks plan with {len(roadmap.weekly_plan)} weekly milestones and {len(roadmap.recommended_projects)} portfolio projects."

        elif tool_name == "Interview Tool":
            questions = generate_interview_questions(
                resume_text or "Candidate with Python and web experience.",
                job_description or f"Target role: {target_role}",
                target_role=target_role
            )
            return f"Interview Questions Generated: {questions.total_questions} total questions across Technical, Behavioral, and Project categories."

        else:
            return f"Tool '{tool_name}' not found."

    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {e}")
        return f"Tool Execution Warning: {str(e)}"

def run_agentic_workflow(request: AgentRequest) -> AgentExecutionResult:
    """
    Module 7: Agentic AI Workflow (Plan -> Tool Call -> Execute -> Observe -> Answer)
    Dynamically plans tool invocations, executes appropriate tools, and synthesizes final answer.
    """
    user_query = request.user_query
    context = {
        "resume_text": request.resume_text,
        "job_description": request.job_description,
        "target_role": request.target_role or "Software Engineer"
    }

    # Step 1: Agent Reasoning & Planning Prompt
    planning_prompt = f"""
    You are an Agentic AI Career Copilot Router.
    Analyze the user request and determine which tools from the tool catalog should be invoked to fulfill the user's intent.

    USER QUERY: "{user_query}"
    TARGET ROLE: "{context['target_role']}"
    
    AVAILABLE TOOLS:
    {json.dumps(TOOLS_CATALOG, indent=2)}

    Respond with JSON in this format:
    {{
      "thought": "Reasoning on why specific tools are needed to answer the user query",
      "planned_tools": ["Tool Name 1", "Tool Name 2"]
    }}
    """

    trace: List[AgentStep] = []
    tools_used: List[str] = []
    observations: List[str] = []

    try:
        raw_plan = llm_client.generate_text(planning_prompt)
        cleaned_plan = llm_client.clean_json_response(raw_plan)
        plan_data = json.loads(cleaned_plan)
        thought = plan_data.get("thought", "Determined appropriate tools to answer candidate request.")
        planned_tools = plan_data.get("planned_tools", ["Skill Gap Tool", "Roadmap Tool"])
    except Exception:
        thought = "Directing user request to skill assessment and roadmap planning."
        planned_tools = ["Skill Gap Tool", "Roadmap Tool"]

    # Step 2: Loop through planned tools
    step_num = 1
    for tool_name in planned_tools:
        if tool_name in TOOLS_CATALOG:
            tools_used.append(tool_name)
            tool_input = {"query": user_query, "target_role": context["target_role"]}
            
            obs = execute_agent_tool(tool_name, tool_input, context)
            observations.append(f"[{tool_name}]: {obs}")

            trace.append(AgentStep(
                step_number=step_num,
                thought=f"Executing {tool_name} to gather required technical insights.",
                action_tool=tool_name,
                tool_input=tool_input,
                observation=obs
            ))
            step_num += 1

    # Step 3: Synthesis Prompt
    synthesis_prompt = f"""
    You are the Agentic AI Career Copilot.
    Synthesize a polished, professional response for the user query using the tools execution observations below.

    USER QUERY: "{user_query}"
    AGENT REASONING: "{thought}"
    OBSERVATIONS:
    {chr(10).join(observations)}

    Provide a clear, empowering, and actionable final response to the user.
    """

    final_answer = llm_client.generate_text(synthesis_prompt)

    return AgentExecutionResult(
        user_query=user_query,
        execution_trace=trace,
        final_answer=final_answer,
        tools_used=tools_used
    )
