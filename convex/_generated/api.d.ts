/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _api_api from "../_api/api.js";
import type * as _api_server from "../_api/server.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as children from "../children.js";
import type * as http from "../http.js";
import type * as mchat from "../mchat.js";
import type * as profiles from "../profiles.js";
import type * as progress from "../progress.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "_api/api": typeof _api_api;
  "_api/server": typeof _api_server;
  ai: typeof ai;
  auth: typeof auth;
  chat: typeof chat;
  children: typeof children;
  http: typeof http;
  mchat: typeof mchat;
  profiles: typeof profiles;
  progress: typeof progress;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
