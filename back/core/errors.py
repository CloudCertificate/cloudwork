"""도메인 예외와 HTTP 변환.

서비스는 HTTPException 을 던지지 않는다 — 도메인 예외를 던지고 여기 핸들러가 상태 코드로 바꾼다
(docs/backend-contract.md §1). 그래야 서비스가 HTTP 를 모르는 채로 테스트된다.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class DomainError(Exception):
    """도메인 규칙 위반. 상태 코드는 하위 클래스가 정한다."""

    status_code = 400

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class UnknownDomain(DomainError):
    status_code = 400

    def __init__(self, code: str):
        super().__init__(f"유형 코드 '{code}' 는 없는 값입니다.")


def register(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def handle(request: Request, exc: DomainError) -> JSONResponse:
        # AJAX 는 리다이렉트하지 않는다. 상태 코드 + 구조화 JSON 으로 돌려준다.
        return JSONResponse(status_code=exc.status_code, content={"message": exc.message})
