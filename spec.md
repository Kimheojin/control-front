# Bus Control Frontend Spec

- 구현 화면
  - `/`: 버스 목록 관제 대시보드
  - `/buses/[busId]`: 버스 상세, 현재 위치 지도, 최근 이벤트

- 사용 API
  - `GET {NEXT_PUBLIC_API_BASE_URL}/buses`
  - `GET {NEXT_PUBLIC_API_BASE_URL}/buses/{busId}`
  - `GET {NEXT_PUBLIC_API_BASE_URL}/buses/{busId}/events`
  - `NEXT_PUBLIC_API_BASE_URL`은 `/v1` 포함 값을 사용하며 프론트엔드에서 `/v1`을 추가하지 않음

- 제외 API
  - `endpoint.md` 6번 `POST /v1/internal/telemetry`는 Simulator/Internal 전용이라 구현 및 호출 제외
  - 전체 이벤트 화면이 없으므로 `GET /events` 제외

- 목록 기능
  - 버스번호, 노선명, 현재속도, 현재상태, 마지막 통신시간 표시
  - 버스번호/노선명 검색은 300ms debounce 적용
  - `ONLINE` / `OFFLINE` / 전체 상태 필터 제공
  - 검색어 또는 상태 변경 시 `page=0`으로 초기화
  - API 응답의 `page`, `totalPages`, `totalElements` 기반 Pagination 제공
  - 행 클릭 시 `/buses/{busId}`로 이동

- 상세 기능
  - 버스 요약 카드, 현재 위치 지도, 최근 이벤트 목록 표시
  - 상세 정보와 이벤트는 독립적으로 조회 및 갱신
  - 이벤트는 기본 `limit=10` 사용
  - 이벤트는 `occurredAt` 기준 최신순 표시
  - 이벤트 조회 실패 시 기존 상세 요약과 지도 유지

- 지도
  - Leaflet / React Leaflet 사용
  - `BusMap`은 Client Component이며 `ssr: false` 동적 import 사용
  - 현재 위치가 있으면 Marker 표시
  - 위치가 없으면 안내 상태 표시
  - Marker 위치 갱신 시 지도 인스턴스를 재생성하지 않음

- Polling
  - 마운트 직후 즉시 조회
  - 기본 5초 주기
  - 이전 요청 진행 중 중복 요청 방지
  - 언마운트 시 timer와 `AbortController` 정리
  - 탭 비활성화 시 중지, 활성화 시 즉시 재조회
  - 실패 시 마지막 정상 데이터 유지
  - 백오프 순서: 5초, 10초, 20초, 30초
  - 성공 시 5초 주기로 초기화

- 오류 및 상태 처리
  - 로딩, 오류, 빈 데이터 상태를 별도 컴포넌트로 표시
  - HTTP 오류는 `{ code, message }` 구조를 파싱
  - 네트워크/JSON 파싱 실패는 사용자 표시 가능한 메시지로 변환
  - `AbortError`는 사용자 오류 메시지로 표시하지 않음
  - 서버 내부 정보는 오류 메시지에 노출하지 않음

- 검증
  - `npm run lint`: 통과
  - `npx tsc --noEmit`: 통과
  - `npm run build`: 통과
