"""INO interaction type classifier for Ignet."""

# Map common INO phrases to broad categories
_POSITIVE = {
    "activate",
    "increase",
    "upregulate",
    "enhance",
    "induce",
    "promote",
    "stimulate",
    "positive regulation",
    "positively regulate",
}
_NEGATIVE = {
    "inhibit",
    "decrease",
    "downregulate",
    "suppress",
    "repress",
    "block",
    "negative regulation",
    "negatively regulate",
    "reduce",
}
_BINDING = {"bind", "binding", "interact", "association", "complex", "attach"}
_PHOSPHORYLATION = {"phosphorylate", "phosphorylation", "dephosphorylate"}


def classify_ino(phrase: str) -> str:
    """Classify an INO matching_phrase into a broad category."""
    if not phrase:
        return "unknown"
    lower = phrase.lower().strip()
    for term in _POSITIVE:
        if term in lower:
            return "positive_regulation"
    for term in _NEGATIVE:
        if term in lower:
            return "negative_regulation"
    for term in _BINDING:
        if term in lower:
            return "binding"
    for term in _PHOSPHORYLATION:
        if term in lower:
            return "phosphorylation"
    return "other"


# Color mapping for frontend use
INO_COLORS: dict[str, str] = {
    "positive_regulation": "#38a169",  # green
    "negative_regulation": "#e53e3e",  # red
    "binding": "#3182ce",              # blue
    "phosphorylation": "#9f7aea",      # purple
    "other": "#a0aec0",               # gray
    "unknown": "#cbd5e0",             # light gray
}
