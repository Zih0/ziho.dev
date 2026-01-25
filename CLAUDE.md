# Claude Code 프로젝트 규칙

## AI 작업 기록

모든 AI 세션 후 `.history/` 폴더에 작업 기록을 남긴다.

### 파일 형식
- 파일명: `YYYY-MM-DD_작업-요약.md`
- 예시: `2026-01-25_cmdk-keyboard-navigation.md`

### 기록 내용
```markdown
# 작업 제목

**날짜**: YYYY-MM-DD
**커밋**: 커밋 해시
**AI**: 사용된 모델명

## 문제
해결하려던 문제 설명

## 원인 분석
문제의 원인

## 해결 방법
적용한 해결책과 주요 변경사항

## 참조
참고한 문서, 라이브러리 등

## 변경된 파일
수정/생성된 파일 목록
```

### 커밋 규칙
1. 작업 완료 후 코드 변경사항 먼저 커밋
2. `.history/` 기록 파일을 별도 커밋으로 추가
3. 커밋 메시지에 `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` 포함
