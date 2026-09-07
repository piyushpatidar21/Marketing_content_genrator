from pydantic import BaseModel


class PlatformRuleDetail(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    char_limit: int | None = None
    includes_hashtags: bool
    recommended_hashtags_count: int
    includes_emojis: bool
    requires_visual: bool
    supported_media: list[str]
    best_practices: list[str]


class MediaTypeDetail(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    fields_generated: list[str]
