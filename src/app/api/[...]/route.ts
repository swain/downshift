import { parse as parseCookie } from "cookie";
import { AutoRouter } from "itty-router";
import { APIContract } from "../../../api/contract";
import { router } from "../../../api/routes";

const _router = AutoRouter();

for (const [route, handler] of Object.entries(router.routes)) {
  const [method, path] = route.split(" ");

  _router[method.toLowerCase() as "get"](`/api${path}`, async (request) => {
    const account = parseCookie(
      request.headers.get("Cookie") || "",
    ).account_key;
    if (!account) {
      return Response.json(
        { error: "No account_key cookie value found" },
        { status: 401 },
      );
    }
    console.log("found account", account);

    // @ts-expect-error
    const contract = APIContract[route];

    const payload = ["GET", "DELETE"].includes(request.method)
      ? request.query
      : await request.json();

    const parseResult = contract.request.safeParse(payload);
    if (!parseResult.success) {
      console.error(
        "Request parse failure for route",
        route,
        parseResult.error,
        "actual",
        payload,
      );
      return Response.json(
        { error: parseResult.error.message },
        { status: 400 },
      );
    }

    try {
      const result = await handler({
        account,
        params: request.params,
        data: parseResult.data,
        request,
      });
      const parsed = contract.response.safeParse(result.data);
      if (!parsed.success) {
        console.error("Response parse failure for route", route, parsed.error);
        return Response.json(
          { code: "internal_error", error: "Failed response parsing" },
          { status: 500 },
        );
      }
      return Response.json(parsed.data, { status: result.status });
    } catch (err) {
      console.error(`Something went wrong in route handler ${route}`, err);
      return Response.json(
        {
          code: "internal_error",
          error: "Something went wrong",
        },
        { status: 500 },
      );
    }
  });
}

export const GET = _router.fetch;
export const PUT = _router.fetch;
export const POST = _router.fetch;
export const PATCH = _router.fetch;
export const DELETE = _router.fetch;
