import * as z from "zod";

export const echoBodySchema = z.object({
  message: z.string(),
});

export type EchoBody = z.infer<typeof echoBodySchema>;
