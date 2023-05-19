import type { Request } from "miragejs";

export function mockRequest(
  url = "",
  params = {},
  queryParams = {},
  requestBody = "",
  requestHeaders = {}
): Request {
  return {
    params,
    queryParams,
    requestBody,
    requestHeaders,
    url,
  };
}
