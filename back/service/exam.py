"""시험 목록. 지금은 판단할 것이 없어 리포지토리를 그대로 흘려보낸다."""

import asyncpg

from repository import exam as exam_repository


async def list_exams() -> list[asyncpg.Record]:
    return await exam_repository.list_all()
