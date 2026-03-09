import process from "process";

import { z } from "zod";

import { APP_ENV, appEnvSchema } from "./app-env";

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: appEnvSchema,

  NEXT_PUBLIC_APP_URL: z.url(),
});
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_ENV: process.env["NEXT_PUBLIC_APP_ENV"],

  NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
});

export const isLocal = () => clientEnv.NEXT_PUBLIC_APP_ENV === APP_ENV.LOCAL;
