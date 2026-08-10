import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.schemas.jobs import NormalizedJob

INTERNSHIP_KEYWORDS = ("intern", "internship", "co-op", "co op", "trainee")
FULL_TIME_KEYWORDS = ("full time", "full-time", "fulltime")
PART_TIME_KEYWORDS = ("part time", "part-time", "parttime")

TECH_SKILL_PATTERNS = [
    r"\bpython\b", r"\bjava\b", r"\bc\+\+\b", r"\bjavascript\b", r"\btypescript\b",
    r"\breact\b", r"\bnode\.?js\b", r"\baws\b", r"\bdocker\b", r"\bkubernetes\b",
    r"\bmongodb\b", r"\bsql\b", r"\bpostgresql\b", r"\bgolang\b", r"\brust\b",
    r"\bmachine learning\b", r"\bdeep learning\b", r"\bgenai\b", r"\bllm\b",
    r"\bfastapi\b", r"\bflask\b", r"\bdjango\b", r"\brest\b", r"\bapi\b",
    r"\bdata structures\b", r"\bdsa\b", r"\bsystem design\b", r"\bkafka\b",
    r"\bredis\b", r"\bterraform\b", r"\bci/cd\b", r"\bgit\b",
]


def _detect_employment_type(title: str, description: str) -> str:
    text = f"{title} {description}".lower()
    if any(kw in text for kw in INTERNSHIP_KEYWORDS):
        return "Internship"
    if any(kw in text for kw in PART_TIME_KEYWORDS):
        return "Part-time"
    if any(kw in text for kw in FULL_TIME_KEYWORDS):
        return "Full-time"
    return "Full-time"


def _extract_skills_from_text(text: str) -> List[str]:
    if not text:
        return []
    found = set()
    lower = text.lower()
    for pattern in TECH_SKILL_PATTERNS:
        matches = re.findall(pattern, lower, re.IGNORECASE)
        for m in matches:
            found.add(m.strip().title() if m.islower() else m)
    # Normalize common variants
    normalized = []
    for skill in found:
        s = skill.lower()
        if s == "node.js" or s == "nodejs":
            normalized.append("Node.js")
        elif s == "c++":
            normalized.append("C++")
        elif s == "dsa":
            normalized.append("Data Structures")
        else:
            normalized.append(skill.title() if skill.islower() else skill)
    return sorted(set(normalized))


def _parse_graduation_year(text: str) -> Optional[int]:
    if not text:
        return None
    matches = re.findall(r"(?:graduat|class of|batch)\s*(?:in\s*)?(\d{4})", text.lower())
    if matches:
        return int(matches[0])
    year_matches = re.findall(r"\b(20\d{2})\b", text)
    for year in year_matches:
        y = int(year)
        if 2024 <= y <= 2035:
            return y
    return None


def normalize_greenhouse_job(raw: Dict[str, Any]) -> Optional[NormalizedJob]:
    """Convert a Greenhouse API job record to NormalizedJob."""
    board_token = raw.get("board_token", "")
    job = raw.get("job", {})
    if not job:
        return None

    job_id = str(job.get("id", ""))
    title = job.get("title", "").strip()
    if not title or not job_id:
        return None

    location_obj = job.get("location") or {}
    location = location_obj.get("name", "Remote") if isinstance(location_obj, dict) else str(location_obj)
    content = job.get("content", "") or ""
    plain = re.sub(r"<[^>]+>", " ", content)
    plain = re.sub(r"\s+", " ", plain).strip()

    departments = job.get("departments") or []
    dept_text = " ".join(d.get("name", "") for d in departments if isinstance(d, dict))
    skill_source = f"{title} {dept_text} {plain}"

    employment_type = _detect_employment_type(title, skill_source)
    all_skills = _extract_skills_from_text(skill_source)
    required_skills = all_skills[:8]
    preferred_skills = all_skills[8:12]

    company = board_token.replace("-", " ").title()

    job_url = job.get("absolute_url") or f"https://boards.greenhouse.io/{board_token}/jobs/{job_id}"
    updated_at = job.get("updated_at") or job.get("created_at")

    return NormalizedJob(
        source="greenhouse",
        source_job_id=job_id,
        company=company,
        title=title,
        location=location,
        employment_type=employment_type,
        description=plain[:8000],
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        education_requirements=_extract_education(plain),
        experience_requirements=_extract_experience(plain),
        graduation_year=_parse_graduation_year(plain),
        job_url=job_url,
        posted_at=job.get("created_at"),
        last_updated=updated_at or datetime.utcnow().isoformat(),
        is_active=True,
    )


def _extract_education(text: str) -> List[str]:
    reqs = []
    lower = text.lower()
    if "bachelor" in lower or "b.tech" in lower or "b.e." in lower:
        reqs.append("Bachelor's degree")
    if "master" in lower or "m.tech" in lower:
        reqs.append("Master's degree")
    return reqs


def _extract_experience(text: str) -> List[str]:
    reqs = []
    for match in re.findall(r"(\d+)\+?\s*years?\s*(?:of\s*)?experience", text.lower()):
        reqs.append(f"{match}+ years experience")
    return reqs[:3]
