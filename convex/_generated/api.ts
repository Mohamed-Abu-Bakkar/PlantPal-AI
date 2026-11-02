/* eslint-disable */
/**
 * Convex API bindings. Regenerate with `npx convex codegen` after deployment auth is fixed.
 */
import { anyApi } from "convex/server";
import type * as plants from "../plants.js";
import type * as catalogue from "../catalogue.js";
import type * as userData from "../userData.js";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{ plants: typeof plants; userData: typeof userData; catalogue: typeof catalogue }>;
export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> = anyApi as any;
export const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = anyApi as any;
export const components = {};
