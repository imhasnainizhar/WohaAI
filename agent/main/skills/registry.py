"""
agent/skills/registry.py
─────────────────────────
Central map of skill_name → Skill.

To add a new skill:
  1. Create agent/skills/your_skill.py  (follow pdf_skill.py or nextjs_skill.py)
  2. Import it here and add to SKILL_REGISTRY.
"""
from agent.skills.pdf_skill import PDF_SKILL
from agent.skills.nextjs_skill import NEXTJS_SKILL
from agent.skills.base import Skill

# ─── Registry ────────────────────────────────────────────────────────────────
SKILL_REGISTRY: dict[str, Skill] = {
    PDF_SKILL.name: PDF_SKILL,
    NEXTJS_SKILL.name: NEXTJS_SKILL,
    # Add future skills here, e.g.:
    # "django": DJANGO_SKILL,
    # "data_analysis": DATA_ANALYSIS_SKILL,
}

AVAILABLE_SKILL_NAMES: list[str] = list(SKILL_REGISTRY.keys())


def get_skill(name: str) -> Skill | None:
    """Return the Skill for a given name, or None if not found."""
    return SKILL_REGISTRY.get(name)


def get_skills(names: list[str]) -> list[Skill]:
    """Return all valid Skills for a list of names, silently skipping unknowns."""
    return [s for name in names if (s := SKILL_REGISTRY.get(name))]
