import z from "zod";

export const APIContract = {
  "GET /search-foods": {
    request: z.object({
      query: z.string(),
    }),
    response: z.any(),
  },
} satisfies Record<string, { request: z.ZodType; response: z.ZodType }>;
