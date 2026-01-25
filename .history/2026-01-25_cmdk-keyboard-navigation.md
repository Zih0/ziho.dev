# CMDK 키보드 네비게이션 구현

**날짜**: 2026-01-25
**커밋**: 0b3dd29
**AI**: Claude Opus 4.5

## 문제

CMDK 검색창이 열렸을 때 방향키로 검색 결과를 선택할 수 없음.

## 원인 분석

기존 `SearchPalette.tsx`가 cmdk 라이브러리를 사용하지 않고 직접 구현되어 있어서 키보드 네비게이션이 지원되지 않았음.

## 해결 방법

1. `cmdk` 패키지 설치 (`pnpm add cmdk`)
2. `SearchPalette.tsx`를 cmdk 컴포넌트로 리팩토링

### 주요 변경사항

- `Command.Dialog` - 다이얼로그 형태로 열고 닫기 관리
- `Command.Input` - 검색 입력
- `Command.List` - 결과 목록
- `Command.Empty` - 결과 없음 표시
- `Command.Item` - 각 항목 (방향키 네비게이션 자동 지원)
- `loop` prop - 마지막 항목에서 첫 번째로 순환 네비게이션
- `data-[selected=true]` - cmdk가 선택된 항목에 추가하는 data attribute로 스타일링

## 참조

- Context7 cmdk 문서 활용 (`/pacocoursey/cmdk`)
- cmdk GitHub: https://github.com/pacocoursey/cmdk

## 변경된 파일

- `components/ui/SearchPalette.tsx` - cmdk로 리팩토링
- `package.json` - cmdk 의존성 추가
- `pnpm-lock.yaml` - lock 파일 업데이트
