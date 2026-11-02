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
  scanHistory: defineTable({
    ownerId: v.string(),
    plantName: v.string(),
    scientificName: v.optional(v.string()),
    confidence: v.optional(v.number()),
    visibleClues: v.array(v.string()),
    caveats: v.array(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_owner_and_created", ["ownerId", "createdAt"]),
  chatMessages: defineTable({
    ownerId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_owner_and_created", ["ownerId", "createdAt"]),
  suitabilitySearches: defineTable({
    ownerId: v.string(),
    plantName: v.string(),
    location: v.optional(v.string()),
    result: v.optional(v.string()),
    score: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_owner_and_created", ["ownerId", "createdAt"]),
  healthAssessments: defineTable({
    ownerId: v.string(),
    plantId: v.optional(v.id("plants")),
    plantName: v.string(),
    issue: v.string(),
    confidence: v.optional(v.number()),
    symptoms: v.array(v.string()),
    recommendations: v.array(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_owner_and_created", ["ownerId", "createdAt"]),
  cartItems: defineTable({
    ownerId: v.string(),
    productKey: v.string(),
    name: v.string(),
    price: v.string(),
    emoji: v.string(),
    quantity: v.number(),
    updatedAt: v.number(),
  }).index("by_owner_and_product", ["ownerId", "productKey"]),
  userPreferences: defineTable({
    ownerId: v.string(),
    locationLabel: v.optional(v.string()),
    preferredUnits: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),
});
