"""시작 화면이 부르는 시험 목록.

응답 모델은 schemas/ 로 빼지 않고 여기 둔다 — 두 라우터가 같은 모델을 쓰게 되면 그때 올린다(CLAUDE.md §3).
"""

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from service import exam as exam_service

router = APIRouter(tags=["exam"])


class ExamOut(BaseModel):
    """DB 는 snake_case, 화면은 camelCase 다. 경계에서 한 번만 바꾼다."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
    name: str
    question_count: int
    time_limit_minutes: int
    available: bool


@router.get("/exams", response_model=list[ExamOut])
async def list_exams():
    # asyncpg.Record 는 pydantic 이 매핑으로 보지 않는다. 경계에서 dict 로 바꾼다.
    return [dict(row) for row in await exam_service.list_exams()]
