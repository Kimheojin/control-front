# API Endpoint Specification

## 공통 규칙

- Base URL: `/v1`
- Content-Type: `application/json`
- 시간 형식: ISO-8601 UTC
- 속도 단위: `km/h`
- 차량 상태는 서버에서 마지막 통신시간 기준으로 계산
  - 5분 이하: `ONLINE`
  - 5분 초과: `OFFLINE`
- 공개 API는 조회 API만 제공
- 초기 기준 데이터는 Backend Seed로 관리하고, 운행 Mock 데이터는 `bus-simulator`가 Internal API로 전송

------

## 1. 버스 목록 조회

```http
GET /v1/buses
```

### Query Parameters

| 이름      | 타입   | 필수 | 설명                      |
| --------- | ------ | ---- | ------------------------- |
| `status`  | string | N    | `ONLINE`, `OFFLINE` 필터  |
| `routeId` | number | N    | 노선 ID 필터              |
| `keyword` | string | N    | 버스번호 또는 노선명 검색 |
| `page`    | number | N    | 기본값 `0`                |
| `size`    | number | N    | 기본값 `20`, 최대 `100`   |

### Response: `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "busNumber": "서울74사1234",
      "routeId": 1001,
      "routeName": "271번",
      "currentSpeed": 42,
      "status": "ONLINE",
      "lastCommunicatedAt": "2026-06-23T01:20:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

------

## 2. 버스 상세 조회

```http
GET /v1/buses/{busId}
```

### Path Parameters

| 이름    | 타입   | 설명    |
| ------- | ------ | ------- |
| `busId` | number | 버스 ID |

### Response: `200 OK`

```json
{
  "id": 1,
  "busNumber": "서울74사1234",
  "route": {
    "id": 1001,
    "name": "271번"
  },
  "currentSpeed": 42,
  "status": "ONLINE",
  "lastCommunicatedAt": "2026-06-23T01:20:00Z",
  "currentLocation": {
    "latitude": 37.5665,
    "longitude": 126.9780,
    "recordedAt": "2026-06-23T01:20:00Z"
  }
}
```

### Response: `404 Not Found`

```json
{
  "code": "BUS_NOT_FOUND",
  "message": "버스를 찾을 수 없습니다."
}
```

------

## 3. 버스 최근 이벤트 조회

```http
GET /v1/buses/{busId}/events
```

### Query Parameters

| 이름    | 타입   | 필수 | 설명                    |
| ------- | ------ | ---- | ----------------------- |
| `limit` | number | N    | 기본값 `10`, 최대 `100` |

### Response: `200 OK`

```json
{
  "busId": 1,
  "events": [
    {
      "id": 501,
      "type": "SUDDEN_BRAKE",
      "occurredAt": "2026-06-23T01:18:12Z",
      "location": {
        "latitude": 37.5658,
        "longitude": 126.9772
      },
      "description": "급정거 감지"
    },
    {
      "id": 502,
      "type": "RAPID_ACCELERATION",
      "occurredAt": "2026-06-23T01:10:30Z",
      "location": {
        "latitude": 37.5649,
        "longitude": 126.9755
      },
      "description": "급가속 감지"
    }
  ]
}
```

### Event Type

| 값                   | 설명   |
| -------------------- | ------ |
| `SUDDEN_BRAKE`       | 급정거 |
| `RAPID_ACCELERATION` | 급가속 |
| `IMPACT`             | 충격   |
| `OTHER`              | 기타   |

------

## 4. 전체 최근 이벤트 조회

```http
GET /v1/events
```

### Query Parameters

| 이름    | 타입   | 필수 | 설명                    |
| ------- | ------ | ---- | ----------------------- |
| `limit` | number | N    | 기본값 `20`, 최대 `100` |
| `type`  | string | N    | 이벤트 유형 필터        |

### Response: `200 OK`

```json
{
  "events": [
    {
      "id": 501,
      "bus": {
        "id": 1,
        "busNumber": "서울74사1234",
        "routeName": "271번"
      },
      "type": "SUDDEN_BRAKE",
      "occurredAt": "2026-06-23T01:18:12Z",
      "location": {
        "latitude": 37.5658,
        "longitude": 126.9772
      },
      "description": "급정거 감지"
    }
  ]
}
```

------

## 5. Polling 정책

Frontend는 아래 API를 기본 5초 주기로 호출한다.

| 화면                  | Polling API                    |
| --------------------- | ------------------------------ |
| 버스 목록 화면        | `GET /v1/buses`                |
| 버스 상세 화면        | `GET /v1/buses/{busId}`        |
| 버스 상세 이벤트 영역 | `GET /v1/buses/{busId}/events` |
| 전체 이벤트 영역      | `GET /v1/events`               |

- 브라우저 HTTP Keep-Alive 연결 재사용
- 페이지 비활성화 시 Polling 중지 또는 주기 증가
- API 오류 시 지수 백오프 적용
- 상태값은 API 응답값을 그대로 사용

------

## 6. Internal 텔레메트리 수신

```http
POST /v1/internal/telemetry
```

Simulator 또는 실제 차량 단말은 이 API로 운행 텔레메트리를 전송한다.

### Request Body

```json
{
  "busId": 1,
  "latitude": 37.5665,
  "longitude": 126.9780,
  "speedKph": 42,
  "recordedAt": "2026-06-23T01:20:00Z",
  "event": {
    "type": "SUDDEN_BRAKE",
    "description": "급정거 감지"
  }
}
```

| 이름                | 타입   | 필수 | 설명                               |
| ------------------- | ------ | ---- | ---------------------------------- |
| `busId`             | number | Y    | 버스 ID                            |
| `latitude`          | number | Y    | 위도                               |
| `longitude`         | number | Y    | 경도                               |
| `speedKph`          | number | Y    | 현재 속도                          |
| `recordedAt`        | string | Y    | 텔레메트리 기록 시각, ISO-8601 UTC |
| `event`             | object | N    | 이벤트 정보                        |
| `event.type`        | string | Y    | 이벤트 유형                        |
| `event.description` | string | N    | 이벤트 설명                        |

### 처리 규칙

1. 버스 존재 여부 확인
2. `bus_locations`에 위치 이력 저장
3. `buses.current_speed_kph`, `buses.last_communicated_at` 갱신
4. `event`가 존재하면 `bus_events` 저장
5. 처리 결과 반환

### Response: `200 OK`

```json
{
  "busId": 1,
  "received": true
}
```

### Response: `404 Not Found`

```json
{
  "code": "BUS_NOT_FOUND",
  "message": "버스를 찾을 수 없습니다."
}
```

------

## 7. 공통 오류 응답

모든 API 오류는 아래 JSON 구조로 응답한다.

```json
{
  "code": "INVALID_REQUEST",
  "message": "요청 값이 올바르지 않습니다."
}
```

| HTTP Status | Code                    | 설명                                             |
| ----------- | ----------------------- | ------------------------------------------------ |
| `400`       | `INVALID_REQUEST`       | 잘못된 Query Parameter, Path Variable, 요청 본문 |
| `404`       | `BUS_NOT_FOUND`         | 존재하지 않는 버스                               |
| `500`       | `INTERNAL_SERVER_ERROR` | 서버 내부 오류                                   |

처리 기준:

* 요청 파라미터, Path Variable, 요청 본문 파싱, 타입 변환, 검증 오류는 `INVALID_REQUEST`로 응답한다.
* 서비스나 도메인에서 식별 가능한 애플리케이션 오류는 공통 예외 코드에 매핑해 응답한다.
* 서버 내부 미처리 예외는 `INTERNAL_SERVER_ERROR`로 응답하며, 스택트레이스나 내부 구현 정보는 응답에 포함하지 않는다.