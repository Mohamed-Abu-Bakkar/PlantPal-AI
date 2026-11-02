import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("You must be signed in to access your garden.");
  return identity;
}

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const rows = await ctx.db
      .query("plants")
      .withIndex("by_owner_and_created", (q) => q.eq("ownerId", identity.tokenIdentifier))
      .order("desc")
      .take(100);
    // Older records may have optional fields unset or legacy blank names.
    // Do not let incomplete rows break the My Plants screen.
    const plants = rows.filter((plant) => typeof plant.name === "string" && plant.name.trim().length > 0);
    return await Promise.all(plants.map(async (plant) => ({
      ...plant,
      species: plant.species?.trim() || undefined,
      location: plant.location?.trim() || undefined,
      notes: plant.notes?.trim() || undefined,
      imageUrl: plant.imageStorageId ? await ctx.storage.getUrl(plant.imageStorageId) : null,
    })));
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    species: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    plantedAt: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("plants"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Plant name cannot be empty.");

    // Make confirmation idempotent: if the user already has this plant,
    // enrich the existing record rather than rejecting the save or duplicating it.
    const existingRows = await ctx.db
      .query("plants")
      .withIndex("by_owner_and_created", (q) => q.eq("ownerId", identity.tokenIdentifier))
      .order("desc")
      .take(100);
    const existing = existingRows.find((plant) =>
      typeof plant.name === "string" && plant.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase()
    );

    const clean = {
      species: args.species?.trim() || undefined,
      location: args.location?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      plantedAt: args.plantedAt,
      imageStorageId: args.imageStorageId,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        species: clean.species || existing.species,
        location: clean.location || existing.location,
        notes: clean.notes || existing.notes,
        plantedAt: existing.plantedAt ?? clean.plantedAt,
        imageStorageId: clean.imageStorageId || existing.imageStorageId,
      });
      return existing._id;
    }

    return await ctx.db.insert("plants", {
      name,
      ...clean,
      ownerId: identity.tokenIdentifier,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("plants") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const plant = await ctx.db.get(args.id);
    if (!plant || plant.ownerId !== identity.tokenIdentifier) {
      throw new Error("Plant not found.");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const tasks = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query("careTasks")
      .withIndex("by_owner_and_due", (q) => q.eq("ownerId", identity.tokenIdentifier))
      .order("asc")
      .take(100);
  },
});

export const addTask = mutation({
  args: {
    plantId: v.optional(v.id("plants")),
    title: v.string(),
    dueAt: v.number(),
    category: v.string(),
  },
  returns: v.id("careTasks"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (args.plantId) {
      const plant = await ctx.db.get(args.plantId);
      if (!plant || plant.ownerId !== identity.tokenIdentifier) {
        throw new Error("Plant not found.");
      }
    }
    return await ctx.db.insert("careTasks", {
      ...args,
      ownerId: identity.tokenIdentifier,
      completed: false,
    });
  },
});

export const completeTask = mutation({
  args: { id: v.id("careTasks"), completed: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.ownerId !== identity.tokenIdentifier) {
      throw new Error("Task not found.");
    }
    await ctx.db.patch(args.id, { completed: args.completed });
    return null;
  },
});
