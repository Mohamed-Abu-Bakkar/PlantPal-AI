/* eslint-disable */
/**
 * Generated Convex API types.
 * This file is normally maintained by the Convex CLI.
 */
import type * as plants from "../plants.js";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{ plants: typeof plants }>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
export declare const components: {};
