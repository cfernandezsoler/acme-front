import { useState } from "react";
import { API_BASE_URL } from "../utils/constants";

interface IUseApiSave<T, J> {
  save: (path: string, data: T, external?: boolean) => Promise<J | null>;
  loading: boolean;
  error: unknown | null;
}

/**
 * A custom hook that performs a POST request to the API.
 * T is the type of the data to be sent to the API.
 * J is the type of the data to be received from the API.
 * @returns An object containing the save function, loading state and error state.
 */
export function useApiSave<T, J>(): IUseApiSave<T, J> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  async function save(
    path: string,
    data: T,
    external: boolean = false
  ): Promise<J | null> {
    setLoading(true);
    setError(null);

    try {
      const url = !external ? `${API_BASE_URL}${path}` : path;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json: J = await response.json();

      setLoading(false);

      return json;
    } catch (error) {
      setLoading(false);
      setError(error);
      return null;
    }
  }

  return { save, loading, error };
}
