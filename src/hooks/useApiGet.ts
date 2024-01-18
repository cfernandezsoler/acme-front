import { useState } from "react";
import { API_BASE_URL } from "../utils/constants";

interface IUseApiGet<T> {
  get: (path: string, external?: boolean) => Promise<T | null>;
  loading: boolean;
  error: unknown | null;
}

/**
 * A custom hook that performs a GET request to the API.
 * @returns An object containing the get function, loading state and error state.
 */
export function useApiGet<T>(): IUseApiGet<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  async function get(
    path: string,
    external: boolean = false
  ): Promise<T | null> {
    setLoading(true);
    setError(null);

    try {
      const url = !external ? `${API_BASE_URL}${path}` : path;
      const response = await fetch(url);
      const data: T = await response.json();

      setLoading(false);

      return data;
    } catch (error) {
      setLoading(false);
      setError(error);
      return null;
    }
  }

  return { get, loading, error };
}
