"""학습·시험 화면이 부르는 출제 목록."""

import json

from fastapi import APIRouter, Query
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from service import question as question_service

router = APIRouter(tags=["question"])


class ChoiceOut(BaseModel):
    """correct·explanation 을 함께 내린다 — 채점과 오답 해설을 앱이 한다(docs/backend-contract.md §2)."""

    marker: str
    content: str
    correct: bool
    explanation: str


class QuestionOut(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
    # 뿌리 유형 code('1'~'4'). 태스크(1.1~4.4)는 내보내지 않는다(docs/question-data.md §3)
    domain_code: str
    content: str
    answer_count: int
    choices: list[ChoiceOut]


@router.get("/exams/{exam_id}/questions", response_model=list[QuestionOut])
async def list_questions(exam_id: int, domain: str | None = Query(default=None)):
    rows = await question_service.list_questions(exam_id, domain)
    # choices 는 jsonb_agg 가 만든 문자열로 온다. asyncpg 는 jsonb 를 풀지 않는다.
    return [{**dict(row), "choices": json.loads(row["choices"])} for row in rows]
