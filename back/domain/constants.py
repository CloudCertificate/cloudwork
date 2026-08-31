"""유형(도메인) 4개 표. 프런트 사본의 원본이다(docs/backend-contract.md §1).

Exam Guide 의 공식 도메인이고 이름도 비중도 지어내지 않았다(docs/question-data.md §3).
공식 명칭은 전부 '~ 아키텍처 설계' 로 끝나 그래프 축에서 잘리므로 label 을 따로 들고 다닌다.

code 는 tbl_question_category 의 뿌리 code 와 같은 값이다 — 서버가 화면에 내려주는 유형 값이
이 문자열이다. 여기 이름을 DB 에 넣지 않는 이유는 docs/schema.md 에 있다.
"""

DOMAINS = (
    {"code": "1", "name": "보안 아키텍처 설계", "label": "보안", "weight": 30},
    {"code": "2", "name": "복원력을 갖춘 아키텍처 설계", "label": "복원력", "weight": 26},
    {"code": "3", "name": "고성능 아키텍처 설계", "label": "고성능", "weight": 24},
    {"code": "4", "name": "비용에 최적화된 아키텍처 설계", "label": "비용 최적화", "weight": 20},
)
