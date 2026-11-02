import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  plants: defineTable({
    ownerId: v.optional(v.string()),
    name: v.string(),
    species: v.optional(v.string()),
    location: v.optional(v.string()),
    plantedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_owner_and_created", ["ownerId", "createdAt"]),
  careTasks: defineTable({
    ownerId: v.optional(v.string()),
    plantId: v.optional(v.id("plants")),
    title: v.string(),
    dueAt: v.number(),
    completed: v.boolean(),
    category: v.string(),
  })
    .index("by_due", ["dueAt"])
    .index("by_owner_and_due", ["ownerId", "dueAt"]),
});
