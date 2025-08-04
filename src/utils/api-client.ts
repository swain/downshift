import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Extracts the path parameters from a route.
 *
 * @example
 *
 * type Type1 = PathParamsOf<'GET /v1/items'>
 *   // -> { }
 * type Type2 = PathParamsOf<'GET /v1/items/:id'>
 *   // -> { id: string }
 * type Type3 = PathParamsOf<'GET /v1/items/:id/:something'>
 *   // -> { id: string; something: string }
 */
export type PathParamsOf<Route> =
  // First, filter out the leading method and space (e.g. the "GET ")
  Route extends `${string} ${infer Path}`
    ? PathParamsOf<Path>
    : // Now, split by the "/", and check the strings before + after.
      Route extends `${infer Before}/${infer After}`
      ? PathParamsOf<Before> & PathParamsOf<After>
      : // If the path part looks like a param, return the object.
        Route extends `:${infer Param}`
        ? {
            [Key in Param]: string;
          }
        : {};

export type RoughEndpoints = {
  [key: string]: {
    Request: unknown;
    Response: unknown;
  };
};

export type RequestPayloadOf<
  Endpoints extends RoughEndpoints,
  Route extends keyof Endpoints,
> = Endpoints[Route]["Request"] & PathParamsOf<Route>;

type RoughPathParams = Record<string, string>;

/**
 * Substitutes path param values into our route syntax.
 *
 * @example
 * const result = substitutePathParams(
 *   '/items/:id',
 *   {
 *     id: 'something'
 *   }
 * );
 *
 * console.log(result); // "/items/something"
 */
const substitutePathParams = (route: string, params: RoughPathParams): string =>
  Object.entries(params).reduce(
    (url, [name, value]) => url.replace(`:${name}`, encodeURIComponent(value)),
    route,
  );

/**
 * Removes any keys in the request payload that already appear as path
 * parameters in the `route`, and returns the result. We do this because
 * path params should be directly substituded in the URL. Replacement is
 * skipped when the request payload is an array.
 *
 * @example
 * const result = removePathParamsFromRequestPayload(
 *   '/items/:id',
 *   {
 *     id: 'something',
 *     message: 'something-else'
 *   }
 * );
 *
 * console.log(result); // { message: 'something-else' }
 */
const removePathParamsFromRequestPayload = (
  route: string,
  payload: RoughPathParams | RoughPathParams[],
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Object.entries(payload)
    .filter(([, value]) => value !== undefined)
    .reduce(
      (accum, [name, value]) =>
        route.includes(`:${name}`) ? accum : { ...accum, [name]: value },
      {},
    );
};

export class APIClient<Endpoints extends RoughEndpoints> {
  constructor(private readonly axiosClient: AxiosInstance) {}

  /**
   * Makes a request to the API using the provided `route` and `payload`.
   */
  request<Route extends keyof Endpoints & string>(
    route: Route,
    payload: RequestPayloadOf<Endpoints, Route>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Endpoints[Route]["Response"]>> {
    const [method, url] = route.split(" ");

    const requestPayload: Endpoints[Route]["Request"] =
      removePathParamsFromRequestPayload(url, payload);

    return this.axiosClient.request({
      ...config,
      method,
      url: substitutePathParams(url, payload),
      // For GET + DELETE, send the payload as query params.
      ...(["GET", "DELETE"].includes(method)
        ? { params: requestPayload }
        : { data: requestPayload }),
    });
  }
}
