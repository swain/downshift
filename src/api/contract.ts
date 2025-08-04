import z from "zod";

export const APIContract = {
  "GET /search-foods": {
    request: z.object({}),
    response: z.object({}),
  },
} satisfies Record<string, { request: z.ZodType; response: z.ZodType }>;
