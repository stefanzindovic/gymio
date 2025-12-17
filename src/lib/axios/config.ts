import { AUTH_TOKEN_KEY } from "@/constants/api";

export type TokenRetriever = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export interface TokenRetrieverConfig {
  getToken: TokenRetriever;
  onError?: (error: Error) => void;
}

const getDefaultTokenRetriever = (): TokenRetriever => {
  return () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  };
};

let currentRetriever: TokenRetriever = getDefaultTokenRetriever();
let errorHandler: ((error: Error) => void) | undefined;

export function configureAxios(config: TokenRetrieverConfig): void {
  currentRetriever = config.getToken;
  errorHandler = config.onError;
}

export function getTokenRetriever(): TokenRetriever {
  return currentRetriever;
}

export function getErrorHandler(): ((error: Error) => void) | undefined {
  return errorHandler;
}
