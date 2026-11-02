/* eslint-disable */
/**
 * Convex API type declarations.
 * The Convex CLI regenerates this file during backend code generation.
 */
import type * as plants from "../plants.js";
import type * as userData from "../userData.js";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{ plants: typeof plants; userData: typeof userData }>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
export declare const components: {};
