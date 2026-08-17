import {
  apiFetch,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./api";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  user_id: number;
  username: string;
  role: string;
  status: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const result = await apiFetch<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );

  setAccessToken(result.access_token);

  return result;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/auth/me");
}

export function logout(): void {
  clearAccessToken();
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
