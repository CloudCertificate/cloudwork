"""문제·보기 조회. SQL 만 있고 판단하지 않는다."""

import asyncpg

from core import database

# 문제 한 행에 보기 배열을 붙여 온다 — 문제마다 보기를 다시 물으면 N+1 이다.
#
# 유형은 뿌리 code 만 내보낸다. 태스크(1.1~4.4)는 서버 안에만 있다(docs/question-data.md §3).
# 뿌리 자신이면 parent_id 가 비어 있으므로 coalesce 로 자기 id 를 쓴다.
#
# answer_count 는 저장하지 않고 보기에서 센다 — 컬럼으로 두면 보기와 어긋나도 DB 가 못 막는다.
_LIST = """
    select q.id,
           root.code as domain_code,
           q.content,
           count(*) filter (where ch.correct) as answer_count,
           jsonb_agg(
               jsonb_build_object(
                   'marker', ch.marker,
                   'content', ch.content,
                   'correct', ch.correct,
                   'explanation', ch.explanation
               ) order by ch.marker
           ) as choices
    from tbl_question q
    join tbl_question_category c on c.id = q.category_id
    join tbl_question_category root on root.id = coalesce(c.parent_id, c.id)
    join tbl_choice ch on ch.question_id = q.id
    where q.exam_id = $1
      and q.status = 'approved'
      and ($2::text is null or root.code = $2)
    group by q.id, root.code, q.content
    order by q.id
"""


async def list_approved(exam_id: int, domain_code: str | None) -> list[asyncpg.Record]:
    return await database.pool().fetch(_LIST, exam_id, domain_code)
