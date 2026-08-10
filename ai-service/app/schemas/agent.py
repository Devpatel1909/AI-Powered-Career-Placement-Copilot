from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AgentStep(BaseModel):
    step_number: int = Field(description="Step index in agent execution trajectory")
    thought: str = Field(description="Agent's reasoning or plan")
    action_tool: Optional[str] = Field(default=None, description="Tool selected to execute")
    tool_input: Optional[Dict[str, Any]] = Field(default=None, description="Arguments passed to tool")
    observation: Optional[str] = Field(default=None, description="Output returned from tool execution")

class AgentExecutionResult(BaseModel):
    user_query: str = Field(description="Original user query")
    execution_trace: List[AgentStep] = Field(default_factory=list, description="Step-by-step tool invocation trace")
    final_answer: str = Field(description="Synthesized final response")
    tools_used: List[str] = Field(default_factory=list, description="List of tools called")

class AgentRequest(BaseModel):
    user_query: str = Field(description="Prompt e.g. Am I ready for Microsoft? Generate interview questions.")
    resume_text: Optional[str] = Field(default=None)
    job_description: Optional[str] = Field(default=None)
    target_role: Optional[str] = Field(default="Software Engineer")
