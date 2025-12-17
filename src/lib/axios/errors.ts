import { HTTP_STATUS_CODES } from "@/constants/api";
import { ApiErrorData, AxiosErrorType } from "./types";

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: ApiErrorData;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number,
    data: ApiErrorData = {},
    originalError?: AxiosErrorType
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.timestamp = new Date();

    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, data: ApiErrorData = {}) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST, data);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Unauthorized", data: ApiErrorData = {}) {
    super(message, HTTP_STATUS_CODES.UNAUTHORIZED, data);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Forbidden", data: ApiErrorData = {}) {
    super(message, HTTP_STATUS_CODES.FORBIDDEN, data);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Not Found", data: ApiErrorData = {}) {
    super(message, HTTP_STATUS_CODES.NOT_FOUND, data);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Conflict", data: ApiErrorData = {}) {
    super(message, HTTP_STATUS_CODES.CONFLICT, data);
    this.name = "ConflictError";
  }
}

export class ServerError extends ApiError {
  constructor(message: string = "Internal Server Error", data: ApiErrorData = {}) {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, data);
    this.name = "ServerError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = "Network Error", originalError?: AxiosErrorType) {
    super(message, 0, {}, originalError);
    this.name = "NetworkError";
  }
}

export function createApiError(
  status: number,
  message: string,
  data: ApiErrorData = {},
  originalError?: AxiosErrorType
): ApiError {
  switch (status) {
    case HTTP_STATUS_CODES.BAD_REQUEST:
    case HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY:
      return new ValidationError(message, data);
    case HTTP_STATUS_CODES.UNAUTHORIZED:
      return new AuthenticationError(message, data);
    case HTTP_STATUS_CODES.FORBIDDEN:
      return new AuthorizationError(message, data);
    case HTTP_STATUS_CODES.NOT_FOUND:
      return new NotFoundError(message, data);
    case HTTP_STATUS_CODES.CONFLICT:
      return new ConflictError(message, data);
    case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS_CODES.SERVICE_UNAVAILABLE:
      return new ServerError(message, data);
    default:
      return new ApiError(message, status, data, originalError);
  }
}
