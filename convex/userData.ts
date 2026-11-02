import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function owner(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("You must be signed in to access saved garden data.");
  return identity.tokenIdentifier;
}

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await owner(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await owner(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const saveScan = mutation({
  args: {
    plantName: v.string(),
    scientificName: v.optional(v.string()),
    confidence: v.optional(v.number()),
    visibleClues: v.array(v.string()),
    caveats: v.array(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("scanHistory"),
  handler: async (ctx, args) => {
    const ownerId = await owner(ctx);
    return await ctx.db.insert("scanHistory", { ...args, ownerId, createdAt: Date.now() });
  },
});

export const scans = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const ownerId = await owner(ctx);
    return await ctx.db.query("scanHistory").withIndex("by_owner_and_created", q => q.eq("ownerId", ownerId)).order("desc").take(50);
  },
});

export const saveChatMessage = mutation({
  args: { role: v.union(v.literal("user"), v.literal("assistant")), content: v.string() },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const ownerId = await owner(ctx);
    return await ctx.db.insert("chatMessages", { ...args, ownerId, createdAt: Date.now() });
  },
});

export const chatHistory = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const ownerId = await owner(ctx);
    return await ctx.db.query("chatMessages").withIndex("by_owner_and_created", q => q.eq("ownerId", ownerId)).order("asc").take(100);
  },
});

export const saveSuitability = mutation({
  args: { plantName: v.string(), location: v.optional(v.string()), result: v.optional(v.string()), score: v.optional(v.number()), notes: v.optional(v.string()) },
  returns: v.id("suitabilitySearches"),
  handler: async (ctx, args) => {
    const ownerId = await owner(ctx);
    return await ctx.db.insert("suitabilitySearches", { ...args, ownerId, createdAt: Date.now() });
  },
});

export const suitabilityHistory = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const ownerId = await owner(ctx);
    return await ctx.db.query("suitabilitySearches").withIndex("by_owner_and_created", q => q.eq("ownerId", ownerId)).order("desc").take(50);
  },
});

export const saveHealthAssessment = mutation({
  args: { plantId: v.optional(v.id("plants")), plantName: v.string(), issue: v.string(), confidence: v.optional(v.number()), symptoms: v.array(v.string()), recommendations: v.array(v.string()), imageStorageId: v.optional(v.id("_storage")) },
  returns: v.id("healthAssessments"),
  handler: async (ctx, args) => {
    const ownerId = await owner(ctx);
    if (args.plantId) {
      const plant = await ctx.db.get(args.plantId);
      if (!plant || plant.ownerId !== ownerId) throw new Error("Plant not found.");
    }
    return await ctx.db.insert("healthAssessments", { ...args, ownerId, createdAt: Date.now() });
  },
});

export const healthHistory = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const ownerId = await owner(ctx);
    return await ctx.db.query("healthAssessments").withIndex("by_owner_and_created", q => q.eq("ownerId", ownerId)).order("desc").take(50);
  },
});

export const cart = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const ownerId = await owner(ctx);
    return await ctx.db.query("cartItems").withIndex("by_owner_and_product", q => q.eq("ownerId", ownerId)).collect();
  },
});

export const setCartQuantity = mutation({
  args: { productKey: v.string(), name: v.string(), price: v.string(), emoji: v.string(), quantity: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await owner(ctx);
    const existing = await ctx.db.query("cartItems").withIndex("by_owner_and_product", q => q.eq("ownerId", ownerId)).filter(q => q.eq(q.field("productKey"), args.productKey)).unique();
    if (args.quantity <= 0) {
      if (existing) await ctx.db.delete(existing._id);
      return null;
    }
    if (existing) await ctx.db.patch(existing._id, { quantity: args.quantity, updatedAt: Date.now() });
    else await ctx.db.insert("cartItems", { ...args, ownerId, updatedAt: Date.now() });
    return null;
  },
});

export const preferences = query({
  args: {},
  returns: v.union(v.object({ _id: v.id("userPreferences"), _creationTime: v.number(), ownerId: v.string(), locationLabel: v.optional(v.string()), preferredUnits: v.optional(v.string()), notificationsEnabled: v.optional(v.boolean()), updatedAt: v.number() }), v.null()),
  handler: async (ctx) => {
    const ownerId = await owner(ctx);
    return await ctx.db.query("userPreferences").withIndex("by_owner", q => q.eq("ownerId", ownerId)).unique();
  },
});

export const savePreferences = mutation({
  args: { locationLabel: v.optional(v.string()), preferredUnits: v.optional(v.string()), notificationsEnabled: v.optional(v.boolean()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerId = await owner(ctx);
    const existing = await ctx.db.query("userPreferences").withIndex("by_owner", q => q.eq("ownerId", ownerId)).unique();
    if (existing) await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
    else await ctx.db.insert("userPreferences", { ...args, ownerId, updatedAt: Date.now() });
    return null;
  },
});
