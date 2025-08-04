import type z from "zod";
import type { PathParamsOf } from "../utils/api-client";
import type { APIContract } from "./contract";

export type APIContext<Params, Data> = {
  account: string;
  params: Params;
  data: Data;
  request: Request;
};

export type APIHandler<Route extends keyof typeof APIContract> = (
  context: APIContext<
    PathParamsOf<Route>,
    z.infer<(typeof APIContract)[Route]["request"]>
  >,
) => Promise<{
  status: number;
  data: z.infer<(typeof APIContract)[Route]["response"]>;
}>;

export class Router {
  routes: Record<string, APIHandler<any>> = {};

  handle<Route extends keyof typeof APIContract>(
    route: Route,
    handler: APIHandler<Route>,
  ) {
    this.routes[route] = handler;
    return this;
  }
}
