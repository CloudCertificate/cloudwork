"""출제. 유효하지 않은 유형 코드를 걸러 내는 것이 여기서 하는 유일한 판단이다."""

import asyncpg

from core.errors import UnknownDomain
from domain.constants import DOMAIN_CODES
from repository import question as question_repository


async def list_questions(exam_id: int, domain_code: str | None) -> list[asyncpg.Record]:
    # 없는 코드를 그냥 넘기면 "문제가 없는 시험" 과 "오타" 가 똑같이 빈 배열로 보인다.
    if domain_code is not None and domain_code not in DOMAIN_CODES:
        raise UnknownDomain(domain_code)

    return await question_repository.list_approved(exam_id, domain_code)
