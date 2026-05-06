import { ViboritaApiClient } from "@/lib/api/viborita";
import { getAuthToken } from "@/lib/state/auth";

export const createApiClient = () =>
  new ViboritaApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    getToken: getAuthToken,
  });
