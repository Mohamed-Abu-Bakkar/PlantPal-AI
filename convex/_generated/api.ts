/* eslint-disable */
/**
 * Generated-style Convex API references.
 * Run `npx convex dev` to refresh this file from the live deployment.
 */
import { anyApi, componentsGeneric } from "convex/server";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import * as plants from "../plants.js";

const fullApi: ApiFromModules<{ plants: typeof plants }> = { plants };
export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> = anyApi;
export const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = anyApi;
export const components = componentsGeneric();
