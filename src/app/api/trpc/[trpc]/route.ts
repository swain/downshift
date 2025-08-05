import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { parse as parseCookie } from "cookie";
import { router } from "../../../../api/routes";

export const createTRPCContext = async (req: Request) => {};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router,
    createContext: () => {
      const account = parseCookie(req.headers.get("Cookie") || "").account_key;
      if (!account) {
        throw new Error("no account_key cookie found");
      }
      return { account, request: req };
    },
  });

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
