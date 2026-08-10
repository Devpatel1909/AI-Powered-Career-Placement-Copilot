import re
from typing import Dict, List, Set

# Canonical skill aliases for deterministic matching
SKILL_ALIASES: Dict[str, str] = {
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "reactjs": "react",
    "react.js": "react",
    "react": "react",
    "node": "nodejs",
    "node.js": "nodejs",
    "nodejs": "nodejs",
    "py": "python",
    "python": "python",
    "c++": "cpp",
    "cpp": "cpp",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "genai": "generative ai",
    "generative ai": "generative ai",
    "rest api": "restful api",
    "restful api": "restful api",
    "restful apis": "restful api",
    "aws": "aws",
    "amazon web services": "aws",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "sql": "sql",
    "dsa": "data structures",
    "data structures": "data structures",
    "data structures and algorithms": "data structures",
}


def normalize_skill(skill: str) -> str:
    """Normalize a skill string to a canonical form."""
    if not skill:
        return ""
    cleaned = re.sub(r"[^\w\s\+\#\.]", " ", skill.lower()).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return SKILL_ALIASES.get(cleaned, cleaned)


def normalize_skills(skills: List[str]) -> Set[str]:
    """Normalize and deduplicate a list of skills."""
    return {s for s in (normalize_skill(skill) for skill in skills) if s}


def skills_overlap(resume_skills: Set[str], job_skills: Set[str]) -> Set[str]:
    """Return matching skills between resume and job."""
    return resume_skills & job_skills


def skills_missing(resume_skills: Set[str], job_skills: Set[str]) -> Set[str]:
    """Return required job skills not present on resume."""
    return job_skills - resume_skills
