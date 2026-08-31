"""asyncpg 커넥션 풀. 앱 수명과 함께 열리고 닫힌다(main.py 의 lifespan)."""

import asyncpg

from core import config

_pool: asyncpg.Pool | None = None


async def connect() -> None:
    global _pool
    _pool = await asyncpg.create_pool(config.DATABASE_URL)


async def disconnect() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def pool() -> asyncpg.Pool:
    """리포지토리가 부르는 진입점. 풀이 없으면 lifespan 밖에서 부른 것이다."""
    if _pool is None:
        raise RuntimeError("커넥션 풀이 열려 있지 않습니다. connect() 가 먼저 불려야 합니다.")
    return _pool
