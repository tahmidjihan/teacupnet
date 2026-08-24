import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://teacup.website",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
});

export const { useSession } = authClient;
