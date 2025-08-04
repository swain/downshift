import { usda } from "../utils/usda";
import { Router } from "./util-server";

export const router = new Router().handle("GET /search-foods", async (ctx) => {
  const result = await usda.request("GET /foods/search", {
    query: ctx.data.query,
  });

  return { status: 200, data: result.data };
});
