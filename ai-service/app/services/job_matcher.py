import logging
from typing import Any, Dict, List, Optional

from app.matching.score_calculator import calculate_match_score

logger = logging.getLogger(__name__)


def build_resume_profile(parsed_resume: Optional[Dict[str, Any]] = None, skills: Optional[List[str]] = None) -> Dict[str, Any]:
    """Flatten resume parsed data into a profile for matching."""
    profile_skills: List[str] = list(skills or [])

    if parsed_resume:
        for key in ("skills", "programming_languages", "frameworks", "databases", "soft_skills"):
            profile_skills.extend(parsed_resume.get(key) or [])

        for project in parsed_resume.get("projects") or []:
            profile_skills.extend(project.get("tech_stack") or project.get("techStack") or [])

    # Deduplicate while preserving order
    seen = set()
    unique_skills = []
    for s in profile_skills:
        sl = s.lower().strip()
        if sl and sl not in seen:
            seen.add(sl)
            unique_skills.append(s)

    education_str = ""
    education = parsed_resume.get("education") or [] if parsed_resume else []
    if education:
        first = education[0]
        education_str = f"{first.get('degree', '')} {first.get('institution', '')}".strip()

    grad_year = None
    if education:
        year_str = str(education[0].get("year", ""))
        import re
        year_match = re.search(r"(20\d{2})", year_str)
        if year_match:
            grad_year = int(year_match.group(1))

    return {
        "skills": unique_skills,
        "education": education_str,
        "graduation_year": grad_year,
        "target_roles": parsed_resume.get("target_roles", []) if parsed_resume else [],
    }


def match_jobs_to_profile(
    jobs: List[Dict[str, Any]],
    resume_profile: Dict[str, Any],
    target_role: str = "Software Engineer",
    preferred_location: str = "Remote / India",
    employment_type: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Score and rank jobs against a resume profile.
    Filtering by employment_type and search is applied before scoring.
    """
    target_roles = resume_profile.get("target_roles") or [target_role]
    resume_skills = resume_profile.get("skills", [])

    results = []
    search_l = (search or "").lower().strip()

    for job in jobs:
        if employment_type and job.get("employment_type", "").lower() != employment_type.lower():
            continue

        if not job.get("is_active", True):
            continue

        if search_l:
            haystack = " ".join([
                job.get("title", ""),
                job.get("company", ""),
                job.get("location", ""),
                job.get("description", ""),
                " ".join(job.get("required_skills", [])),
            ]).lower()
            if search_l not in haystack:
                continue

        match = calculate_match_score(
            resume_skills=resume_skills,
            job_required_skills=job.get("required_skills", []),
            job_preferred_skills=job.get("preferred_skills", []),
            job_title=job.get("title", ""),
            job_location=job.get("location", ""),
            job_education=job.get("education_requirements", []),
            job_graduation_year=job.get("graduation_year"),
            target_roles=target_roles,
            preferred_location=preferred_location,
            candidate_education=resume_profile.get("education"),
            candidate_graduation_year=resume_profile.get("graduation_year"),
        )

        results.append({
            **job,
            "match": match,
        })

    results.sort(key=lambda x: x["match"]["score"], reverse=True)
    return results
