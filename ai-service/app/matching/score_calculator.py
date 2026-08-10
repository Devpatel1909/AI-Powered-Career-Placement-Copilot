from typing import Dict, List, Optional, Set

from app.matching.skill_normalizer import (
    normalize_skills,
    skills_missing,
    skills_overlap,
)

# Configurable weights (must sum to 100)
DEFAULT_WEIGHTS = {
    "required_skills": 50,
    "preferred_skills": 15,
    "role_relevance": 15,
    "education": 10,
    "graduation_year": 5,
    "location": 5,
}


def _pct(matched: int, total: int) -> float:
    if total <= 0:
        return 100.0
    return (matched / total) * 100.0


def _role_relevance_score(job_title: str, target_roles: List[str]) -> float:
    if not target_roles:
        return 70.0
    title = job_title.lower()
    for role in target_roles:
        role_l = role.lower()
        if role_l in title or title in role_l:
            return 100.0
        # partial word overlap
        role_words = set(role_l.split())
        title_words = set(title.split())
        if role_words & title_words:
            return 75.0
    return 40.0


def _location_score(job_location: str, preferred_location: str) -> float:
    if not preferred_location:
        return 100.0
    job_loc = job_location.lower()
    pref = preferred_location.lower()
    if "remote" in job_loc or "remote" in pref:
        return 100.0
    if pref in job_loc or job_loc in pref:
        return 100.0
    # country-level partial
    if "india" in pref and "india" in job_loc:
        return 90.0
    return 50.0


def _education_score(
    job_education: List[str],
    candidate_education: Optional[str],
) -> float:
    if not job_education:
        return 100.0
    if not candidate_education:
        return 60.0
    cand = candidate_education.lower()
    for req in job_education:
        if any(word in cand for word in req.lower().split() if len(word) > 3):
            return 100.0
    return 50.0


def _graduation_score(
    job_grad_year: Optional[int],
    candidate_grad_year: Optional[int],
) -> float:
    if not job_grad_year or not candidate_grad_year:
        return 80.0
    if candidate_grad_year <= job_grad_year:
        return 100.0
    return 40.0


def calculate_match_score(
    resume_skills: List[str],
    job_required_skills: List[str],
    job_preferred_skills: List[str],
    job_title: str,
    job_location: str,
    job_education: List[str],
    job_graduation_year: Optional[int],
    target_roles: List[str],
    preferred_location: str,
    candidate_education: Optional[str] = None,
    candidate_graduation_year: Optional[int] = None,
    weights: Optional[Dict[str, int]] = None,
) -> Dict:
    """
    Deterministic, reproducible job match score.
    Returns score breakdown and skill lists.
    """
    w = weights or DEFAULT_WEIGHTS

    resume_set = normalize_skills(resume_skills)
    required_set = normalize_skills(job_required_skills)
    preferred_set = normalize_skills(job_preferred_skills)

    req_matching = skills_overlap(resume_set, required_set)
    req_missing = skills_missing(resume_set, required_set)
    pref_matching = skills_overlap(resume_set, preferred_set)
    pref_missing = skills_missing(resume_set, preferred_set)

    required_pct = _pct(len(req_matching), len(required_set)) if required_set else 100.0
    preferred_pct = _pct(len(pref_matching), len(preferred_set)) if preferred_set else 100.0
    role_pct = _role_relevance_score(job_title, target_roles)
    edu_pct = _education_score(job_education, candidate_education)
    grad_pct = _graduation_score(job_graduation_year, candidate_graduation_year)
    loc_pct = _location_score(job_location, preferred_location)

    weighted = (
        (required_pct * w["required_skills"])
        + (preferred_pct * w["preferred_skills"])
        + (role_pct * w["role_relevance"])
        + (edu_pct * w["education"])
        + (grad_pct * w["graduation_year"])
        + (loc_pct * w["location"])
    ) / 100.0

    score = int(round(min(100, max(0, weighted))))

    if score >= 80:
        recommendation = "Strong Match"
    elif score >= 65:
        recommendation = "Good Match"
    elif score >= 50:
        recommendation = "Moderate Match"
    else:
        recommendation = "Stretch Role"

    return {
        "score": score,
        "matching_skills": sorted(req_matching | pref_matching),
        "missing_skills": sorted(req_missing),
        "partial_matches": sorted(pref_matching),
        "recommendation": recommendation,
        "breakdown": {
            "required_skills_pct": round(required_pct, 1),
            "preferred_skills_pct": round(preferred_pct, 1),
            "role_relevance_pct": round(role_pct, 1),
            "education_pct": round(edu_pct, 1),
            "graduation_pct": round(grad_pct, 1),
            "location_pct": round(loc_pct, 1),
        },
    }
