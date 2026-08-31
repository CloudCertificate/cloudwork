"""앱 생성 · 라우터 등록 · lifespan(DB 풀 connect/disconnect)."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core import config, database, errors
from router import exam as exam_router
from router import question as question_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(title="CloudCertificate", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exam_router.router)
app.include_router(question_router.router)

errors.register(app)


@app.get("/health")
async def health():
    """DB 까지 살아 있는지 본다 — 앱만 뜨고 DB 가 끊긴 상태를 정상으로 보고하지 않는다."""
    await database.pool().fetchval("select 1")
    return {"status": "ok"}
