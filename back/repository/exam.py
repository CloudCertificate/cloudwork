"""시험 조회. SQL 만 있고 판단하지 않는다."""

import asyncpg

from core import database

# available 은 저장하지 않고 계산한다 — 승인된 문제가 있으면 고를 수 있다(docs/schema.md).
# 컬럼으로 두면 문제를 승인해 놓고 플래그를 안 올려 화면에서 안 보이는 어긋남이 생긴다.
_LIST = """
    select e.id,
           c.name,
           e.question_count,
           e.time_limit_minutes,
           exists (select 1 from tbl_question q
                   where q.exam_id = e.id and q.status = 'approved') as available
    from tbl_exam e
    join tbl_certification c on c.id = e.certification_id
    order by c.name, e.certification_type
"""


async def list_all() -> list[asyncpg.Record]:
    return await database.pool().fetch(_LIST)
