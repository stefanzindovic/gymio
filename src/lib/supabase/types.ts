import { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {
  id: string;
  email: string;
}

export interface AuthSession extends Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
