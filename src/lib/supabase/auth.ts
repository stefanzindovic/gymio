import { supabase } from "./client";
import { LoginCredentials, RegisterCredentials, AuthError } from "./types";

export async function signIn(credentials: LoginCredentials) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw {
        message: error.message || "Login failed",
        status: error.status,
      } as AuthError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as AuthError;
    }
    throw error;
  }
}

export async function signUp(credentials: RegisterCredentials) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw {
        message: error.message || "Registration failed",
        status: error.status,
      } as AuthError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as AuthError;
    }
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw {
        message: error.message || "Logout failed",
        status: error.status,
      } as AuthError;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as AuthError;
    }
    throw error;
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw {
        message: error.message || "Failed to get session",
        status: error.status,
      } as AuthError;
    }

    return data.session;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as AuthError;
    }
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw {
        message: error.message || "Failed to get user",
        status: error.status,
      } as AuthError;
    }

    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as AuthError;
    }
    throw error;
  }
}
