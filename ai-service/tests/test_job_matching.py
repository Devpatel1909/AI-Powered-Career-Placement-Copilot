import pytest
from app.matching.skill_normalizer import normalize_skill, normalize_skills, skills_overlap, skills_missing
from app.matching.score_calculator import calculate_match_score


def test_skill_alias_normalization():
    assert normalize_skill("JS") == "javascript"
    assert normalize_skill("ReactJS") == "react"
    assert normalize_skill("Node.js") == "nodejs"


def test_skills_overlap_and_missing():
    resume = normalize_skills(["Python", "C++", "React"])
    job = normalize_skills(["Python", "C++", "AWS"])
    assert skills_overlap(resume, job) == {"python", "cpp"}
    assert skills_missing(resume, job) == {"aws"}


def test_deterministic_match_score():
    result = calculate_match_score(
        resume_skills=["Python", "C++", "React"],
        job_required_skills=["Python", "C++", "AWS"],
        job_preferred_skills=["Docker"],
        job_title="Software Engineer Intern",
        job_location="Bangalore, India",
        job_education=["Bachelor's degree"],
        job_graduation_year=2027,
        target_roles=["Software Engineer"],
        preferred_location="India",
    )
    assert "python" in [s.lower() for s in result["matching_skills"]]
    assert any("aws" in s.lower() for s in result["missing_skills"])
    assert 0 <= result["score"] <= 100
    # Same input → same score (deterministic)
    result2 = calculate_match_score(
        resume_skills=["Python", "C++", "React"],
        job_required_skills=["Python", "C++", "AWS"],
        job_preferred_skills=["Docker"],
        job_title="Software Engineer Intern",
        job_location="Bangalore, India",
        job_education=["Bachelor's degree"],
        job_graduation_year=2027,
        target_roles=["Software Engineer"],
        preferred_location="India",
    )
    assert result["score"] == result2["score"]
