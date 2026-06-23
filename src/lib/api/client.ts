import type { ApiErrorResponse } from "@/types/api";

const DEFAULT_API_BASE_URL = "http://localhost:8080/v1";

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      "응답을 처리할 수 없습니다.",
      "INVALID_JSON_RESPONSE",
      response.status,
    );
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      if (isApiErrorResponse(payload)) {
        throw new ApiError(payload.message, payload.code, response.status);
      }

      throw new ApiError(
        "요청을 처리할 수 없습니다.",
        "API_REQUEST_FAILED",
        response.status,
      );
    }

    return payload as T;
  } catch (error) {
    if (isAbortError(error) || error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "서버와 연결할 수 없습니다.",
      "NETWORK_ERROR",
    );
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "요청을 처리할 수 없습니다.";
}

export function isRequestAbort(error: unknown) {
  return isAbortError(error);
}
