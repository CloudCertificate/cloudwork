"""환경변수. 없으면 서버가 뜨는 순간 죽는다 — 첫 요청에서 죽으면 원인을 찾기 어렵다."""

import os

from dotenv import load_dotenv

load_dotenv()


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"환경변수 {name} 이 비어 있습니다. back/.env.example 을 참고해 back/.env 를 만드세요.")
    return value


DATABASE_URL = _required("DATABASE_URL")

# 쉼표로 구분한 목록. 와일드카드로 열지 않는다(docs/backend-contract.md §4)
CORS_ORIGINS = [origin.strip() for origin in _required("CORS_ORIGINS").split(",") if origin.strip()]

# LLM 을 붙이기 전까지는 비어 있어도 서버가 뜬다
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
