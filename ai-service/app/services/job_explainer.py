import json
import logging
from typing import Any, Dict

from app.core.llm_client import llm_client
from app.schemas.jobs import JobExplanationResult

logger = logging.getLogger(__name__)


def explain_job_match(
    resume_json: Dict[str, Any],
    job_json: Dict[str, Any],
    match_result: Dict[str, Any],
) -> JobExplanationResult:
    """
    LLM qualitative explanation only — score comes from deterministic matcher.
    """
    prompt = f"""
Analyze this job match for a placement candidate.

RESUME:
{json.dumps(resume_json, indent=2)}

JOB:
{json.dumps(job_json, indent=2)}

DETERMINISTIC MATCH RESULT:
{json.dumps(match_result, indent=2)}

Instructions:
1. Use ONLY the supplied resume and job data. Never invent skills, experience, or certifications.
2. Explain why the candidate is or is not a good match.
3. Prioritize missing skills by importance for this role.
4. State whether the candidate should apply.
5. Give concrete interview preparation advice.

Return valid JSON matching the schema.
"""

    return llm_client.generate_structured_output(prompt, JobExplanationResult)
