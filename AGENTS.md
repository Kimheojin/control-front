# AGENTS.md

## 1. 프로젝트 목적

Next.js 기반 버스 관제 프론트엔드 구현.

필수 화면 범위:

- 버스 목록 화면: `/`
- 버스 상세 화면: `/buses/[busId]`

핵심 기능:

- 버스 상태 및 현재 속도 조회
- 버스번호·노선명 검색
- `ONLINE` / `OFFLINE` 상태 필터
- 5초 Polling 기반 데이터 갱신
- 상세 지도 위치 Marker 표시
- 버스별 최근 이벤트 표시

------

## 2. 기술 스택 및 제약

- Next.js
- TypeScript
- App Router
- Fetch API
- Leaflet / React Leaflet
- CSS Module 또는 Tailwind CSS
- 전역 상태관리 라이브러리 사용 금지
  - Redux, Zustand, Jotai 등 제외
- 서버 조회 데이터는 페이지 단위 상태로 관리
- API 호출 함수는 `src/lib/api`에 분리
- API 응답 타입에 `any` 사용 금지
- 기존 프로젝트 스타일링 방식 우선 적용

------

## 3. API 기준

API 명세의 Base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/v1
```

환경 변수에 이미 `/v1`이 포함되어 있으므로, API 함수에서는 아래처럼 호출한다.

```ts
getBuses() // GET {BASE_URL}/buses
getBusDetail(busId) // GET {BASE_URL}/buses/{busId}
getBusEvents(busId) // GET {BASE_URL}/buses/{busId}/events
```

금지 예시:

```ts
// /v1 중복 금지
fetch(`${API_BASE_URL}/v1/buses`);
```

프론트엔드 호출 대상:

| API                         | 사용 여부 | 용도                          |
| --------------------------- | --------- | ----------------------------- |
| `GET /buses`                | 필수      | 목록 조회                     |
| `GET /buses/{busId}`        | 필수      | 상세 및 현재 위치 조회        |
| `GET /buses/{busId}/events` | 필수      | 상세 이벤트 조회              |
| `GET /events`               | 선택      | 전체 이벤트 영역 추가 시 사용 |
| `POST /internal/telemetry`  | 금지      | Simulator/Internal 전용       |

------

## 4. 권장 디렉터리 구조

```text
src/
  app/
    page.tsx
    buses/
      [busId]/
        page.tsx

  components/
    bus/
      BusTable.tsx
      BusTableRow.tsx
      BusStatusBadge.tsx
      BusSummaryCard.tsx

    map/
      BusMap.tsx
      BusMarker.tsx

    event/
      EventList.tsx
      EventItem.tsx

    common/
      Loading.tsx
      ErrorMessage.tsx
      EmptyState.tsx
      SearchInput.tsx

  lib/
    api/
      client.ts
      buses.ts
      events.ts
    polling.ts
    format.ts

  types/
    api.ts
    bus.ts
    event.ts
```

`lib/api/client.ts` 책임:

- Base URL 조합
- 공통 Fetch 처리
- JSON 파싱
- API 오류 응답 파싱
- `ApiError` 생성

------

## 5. 타입 규칙

필수 타입 예시:

```ts
export type BusStatus = "ONLINE" | "OFFLINE";

export interface BusSummary {
  id: number;
  busNumber: string;
  routeId: number;
  routeName: string;
  currentSpeed: number;
  status: BusStatus;
  lastCommunicatedAt: string;
}

export interface BusPage {
  content: BusSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BusListParams {
  status?: BusStatus;
  routeId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface BusLocation {
  latitude: number;
  longitude: number;
  recordedAt: string;
}

export interface BusDetail {
  id: number;
  busNumber: string;
  route: {
    id: number;
    name: string;
  };
  currentSpeed: number;
  status: BusStatus;
  lastCommunicatedAt: string;
  currentLocation: BusLocation | null;
}

export type BusEventType =
  | "SUDDEN_BRAKE"
  | "RAPID_ACCELERATION"
  | "IMPACT"
  | "OTHER";

export interface BusEvent {
  id: number;
  type: BusEventType;
  occurredAt: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
}

export interface BusEventResponse {
  busId: number;
  events: BusEvent[];
}

export interface ApiErrorResponse {
  code: string;
  message: string;
}
```

규칙:

- 날짜는 ISO-8601 UTC 문자열로 유지
- 날짜 표시 형식 변환은 `lib/format.ts`에서만 처리
- 속도는 `km/h` 단위로 표기
- 상태값은 서버 응답값을 그대로 사용
- 이벤트 목록은 `occurredAt` 기준 최신순 표시

------

## 6. API 호출 규칙

필수 API 함수:

```ts
export async function getBuses(
  params?: BusListParams,
): Promise<BusPage>;

export async function getBusDetail(
  busId: number,
): Promise<BusDetail>;

export async function getBusEvents(
  busId: number,
  limit?: number,
): Promise<BusEventResponse>;
```

규칙:

- Query String은 `URLSearchParams` 사용
- 빈 문자열 검색어는 Query Parameter에서 제외
- `page`는 0 이상
- 목록 `size`는 1~100 범위 유지
- 이벤트 `limit`는 1~100 범위 유지
- HTTP 오류 응답은 `{ code, message }` 구조 파싱
- JSON 파싱 실패 또는 네트워크 오류도 사용자 표시 가능한 오류로 변환
- 오류 메시지에 서버 내부 정보 노출 금지
- 요청 취소 시 AbortError는 사용자 오류 메시지로 표시하지 않음

------

## 7. 버스 목록 화면

경로:

```text
/
```

필수 표시 항목:

- 버스번호
- 노선명
- 현재속도
- 현재상태
- 마지막 통신시간

필수 기능:

- 버스번호 또는 노선명 검색
- `ONLINE` / `OFFLINE` 상태 필터
- 필터 및 검색어 변경 시 즉시 재조회
- 검색어 변경 시 페이지 번호 `0`으로 초기화
- 버스 행 클릭 시 `/buses/[busId]` 이동
- 5초 Polling 갱신
- 상태별 Badge 표시
- 로딩, 오류, 빈 데이터 상태 구분
- Pagination UI 제공

Pagination 규칙:

- 기본 `page=0`, `size=20`
- API 응답의 `page`, `totalPages`, `totalElements` 사용
- 페이지 변경 시 기존 검색어 및 상태 필터 유지
- Polling은 현재 페이지와 현재 조건을 유지한 채 재조회

검색 규칙:

- 검색어는 300ms debounce 적용
- 검색 중 기존 목록을 즉시 제거하지 않음
- 검색 결과가 없으면 `EmptyState` 표시

------

## 8. 버스 상세 화면

경로:

```text
/buses/[busId]
```

필수 표시 항목:

- 버스번호
- 노선명
- 현재속도
- 현재상태
- 마지막 통신시간
- 현재 위치 지도
- 최근 이벤트 목록

필수 기능:

- 목록 화면 이동 링크 제공
- 상세 정보 및 이벤트 각각 독립적으로 조회
- 5초 Polling으로 상세 정보와 이벤트 갱신
- 위치 정보 변경 시 지도 Marker 위치 갱신
- 위치 정보가 없으면 지도 영역 안내 문구 표시
- 버스가 존재하지 않는 경우 `BUS_NOT_FOUND` 오류 표시

이벤트 규칙:

- 기본 `limit=10`
- 이벤트 유형별 라벨 또는 아이콘 표시
- 최신순 표시
- 이벤트 조회 실패 시 기존 정상 이벤트 목록 유지
- 이벤트 목록만 실패해도 상세 요약 및 지도는 계속 표시

------

## 9. 지도 구현 규칙

- `BusMap`은 Client Component로 구현
- Leaflet은 SSR 비활성화 동적 Import 사용

```tsx
const BusMap = dynamic(() => import("@/components/map/BusMap"), {
  ssr: false,
});
```

기본 중심 좌표:

```ts
const SEOUL_CITY_HALL = {
  latitude: 37.5663,
  longitude: 126.9779,
};
```

규칙:

- `currentLocation`이 존재하면 해당 좌표에 Marker 표시
- 위치 갱신 시 지도 인스턴스 재생성 금지
- Marker 좌표만 갱신
- 필요 시 지도 중심을 최신 위치로 이동
- 위치가 없으면 지도 대신 안내 상태 표시
- Leaflet CSS 누락 여부 확인
- `window`, `document` 접근은 Client Component 내부에서만 허용

------

## 10. Polling 정책

기본 주기:

```text
5초
```

대상:

| 화면             | Polling 대상                |
| ---------------- | --------------------------- |
| 버스 목록        | `GET /buses`                |
| 버스 상세        | `GET /buses/{busId}`        |
| 버스 상세 이벤트 | `GET /buses/{busId}/events` |

정책:

- 마운트 직후 즉시 조회
- 이전 요청 진행 중이면 중복 요청 금지
- 언마운트 시 Timer 및 AbortController 정리
- 탭 비활성화 시 Polling 중지
- 탭 활성화 시 즉시 재조회 후 Polling 재개
- 오류 발생 시 마지막 정상 데이터 유지
- 연속 실패 시 지수 백오프 적용

Backoff 순서:

```text
5초 → 10초 → 20초 → 30초
```

성공한 요청 이후:

```text
5초 주기로 초기화
```

Polling 구현은 `src/lib/polling.ts`에 분리한다.

------

## 11. UI 규칙

- 목록 화면은 테이블 중심 관제 대시보드 구성
- 상세 화면은 요약 카드 + 지도 + 이벤트 목록 구성
- 데스크톱 우선 설계
- 태블릿 해상도 대응
- `ONLINE`과 `OFFLINE`은 시각적으로 명확히 구분
- 상태 표현은 색상만으로 구분하지 않음
- 버튼, 링크, 검색 입력에는 접근 가능한 이름 제공
- 로딩, 오류, 빈 상태를 각각 별도 컴포넌트로 처리
- API 오류 발생 시 기존 정상 데이터를 제거하지 않음

------

## 12. 구현 제외 범위

아래 기능은 현재 프론트엔드 범위에서 제외.

- Internal Telemetry 전송
- 버스 생성, 수정, 삭제
- 인증 및 권한 관리
- WebSocket 또는 SSE 실시간 연결
- 전체 이벤트 화면
  - 별도 UI 요구사항이 추가될 경우 `GET /events` 사용

------

## 13. 완료 기준

다음 조건을 모두 만족해야 완료로 판단.

- `/` 목록 화면 구현
- `/buses/[busId]` 상세 화면 구현
- 검색 및 상태 필터 동작
- Pagination 동작
- 목록 및 상세 Polling 동작
- Polling cleanup 및 중복 요청 방지
- 오류 발생 시 이전 정상 데이터 유지
- 지수 백오프 적용
- Leaflet 지도 및 현재 위치 Marker 동작
- 위치 없음, 로딩, 오류, 빈 상태 처리
- 환경 변수 기반 API Base URL 사용
- `/v1` 경로 중복 없음
- Internal Telemetry API 미호출
- TypeScript 오류 없음
- ESLint 통과
- Production build 통과
- 구현 변경 파일 및 검증 결과 요약