import { x_api_key } from "@/lib/apiConfig";

export function authHeaders(isMultipartData: boolean = false): HeadersInit {
  return {
    "x-api-key": x_api_key,
    "ngrok-skip-browser-warning": "69420",
    Accept: "application/json",
    ...(!isMultipartData && {
      "Content-Type": "application/json",
    }),
  };
}

export function headers(isMultipartData: boolean = false): HeadersInit {
  return {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "69420",
    ...(!isMultipartData && {
      "Content-Type": "application/json",
    }),
  };
}
export function formHeaders(isMultipartData: boolean = false): HeadersInit {
  return {
    "ngrok-skip-browser-warning": "69420",
  };
}
