const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function getAccessToken(): string | null {
  return localStorage.getItem("slvsls_access_token");
}

export function setAccessToken(token: string): void {
  localStorage.setItem("slvsls_access_token", token);
}

export function clearAccessToken(): void {
  localStorage.removeItem("slvsls_access_token");
}

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    auth = true,
    headers,
    ...requestOptions
  } = options;

  const finalHeaders = new Headers(headers);

  if (
    requestOptions.body &&
    !finalHeaders.has("Content-Type")
  ) {
    finalHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  if (auth) {
    const token = getAccessToken();

    if (token) {
      finalHeaders.set(
        "Authorization",
        `Bearer ${token}`,
      );
    }
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...requestOptions,
      headers: finalHeaders,
    },
  );

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "detail" in data
        ? String(data.detail)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export { API_BASE_URL };
