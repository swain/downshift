import { Router } from "./util-server";

export const router = new Router().handle("GET /search-foods", async (ctx) => {
  return {
    status: 200,
    data: {},
  };
});
