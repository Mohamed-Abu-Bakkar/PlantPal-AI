import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const starterSupplies = [
  { name: "Organic Compost", description: "Natural nutrient-rich compost", price: "₹ 250", category: "Fertilizers", emoji: "🟫" },
  { name: "Urea (Nitrogen Fertilizer)", description: "For leafy growth", price: "₹ 180", category: "Fertilizers", emoji: "🟩" },
  { name: "Neem Oil (Organic Pesticide)", description: "Organic garden care", price: "₹ 150", category: "Pesticides", emoji: "🧴" },
  { name: "Tomato Seeds (Hybrid)", description: "High-yield variety", price: "₹ 120", category: "Seeds", emoji: "🍅" },
  { name: "Spinach Seeds", description: "Fast-growing leafy greens", price: "₹ 80", category: "Seeds", emoji: "🥬" },
  { name: "Garden Hand Trowel", description: "Stainless steel garden tool", price: "₹ 199", category: "Tools", emoji: "🛠️" },
  { name: "Watering Can", description: "Indoor and outdoor use", price: "₹ 249", category: "Tools", emoji: "🚿" },
  { name: "Sticky Traps", description: "Monitor flying pests", price: "₹ 99", category: "Pesticides", emoji: "🟨" },
];
const keyFor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function signedIn(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Sign in to edit the shared supplies catalogue.");
  return identity.tokenIdentifier;
}

export const list = query({
  args: { category: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.category) return await ctx.db.query("supplyCatalog").withIndex("by_category", q => q.eq("category", args.category!)).collect();
    return await ctx.db.query("supplyCatalog").collect();
  },
});

// Safe, idempotent initial import of the app's former built-in supply list.
export const seedStarterSupplies = mutation({
  args: {}, returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("supplyCatalog").first();
    if (existing) return null;
    const now = Date.now();
    for (const item of starterSupplies) {
      const productKey = keyFor(item.name);
      const id = await ctx.db.insert("supplyCatalog", { ...item, productKey, createdBy: "system:starter-catalogue", updatedBy: "system:starter-catalogue", updatedAt: now });
      await ctx.db.insert("supplyCatalogAudit", { productId: id, actorId: "system:starter-catalogue", action: "created", snapshot: JSON.stringify(item), createdAt: now });
    }
    return null;
  },
});

export const add = mutation({
  args: { name: v.string(), description: v.string(), price: v.string(), category: v.string(), emoji: v.string(), imageStorageId: v.optional(v.id("_storage")) },
  returns: v.id("supplyCatalog"),
  handler: async (ctx, args) => {
    const actorId = await signedIn(ctx);
    const productKey = keyFor(args.name);
    const duplicate = await ctx.db.query("supplyCatalog").withIndex("by_product_key", q => q.eq("productKey", productKey)).unique();
    if (duplicate) throw new Error("A supply with this name already exists.");
    const id = await ctx.db.insert("supplyCatalog", { ...args, productKey, createdBy: actorId, updatedBy: actorId, updatedAt: Date.now() });
    await ctx.db.insert("supplyCatalogAudit", { productId: id, actorId, action: "created", snapshot: JSON.stringify(args), createdAt: Date.now() });
    return id;
  },
});

export const update = mutation({
  args: { id: v.id("supplyCatalog"), name: v.string(), description: v.string(), price: v.string(), category: v.string(), emoji: v.string(), imageStorageId: v.optional(v.id("_storage")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actorId = await signedIn(ctx);
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Supply not found.");
    const productKey = keyFor(args.name);
    const duplicate = await ctx.db.query("supplyCatalog").withIndex("by_product_key", q => q.eq("productKey", productKey)).unique();
    if (duplicate && duplicate._id !== args.id) throw new Error("Another supply already uses this name.");
    const { id, ...fields } = args;
    const snapshot = { ...current, ...fields, productKey };
    await ctx.db.patch(id, { ...fields, productKey, updatedBy: actorId, updatedAt: Date.now() });
    await ctx.db.insert("supplyCatalogAudit", { productId: id, actorId, action: "updated", snapshot: JSON.stringify(snapshot), createdAt: Date.now() });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("supplyCatalog") }, returns: v.null(),
  handler: async (ctx, args) => {
    const actorId = await signedIn(ctx);
    const current = await ctx.db.get(args.id);
    if (!current) return null;
    await ctx.db.insert("supplyCatalogAudit", { productId: args.id, actorId, action: "deleted", snapshot: JSON.stringify(current), createdAt: Date.now() });
    await ctx.db.delete(args.id);
    return null;
  },
});


const starterPlants = [
  { commonName: "Tomato", scientificName: "Solanum lycopersicum", summary: "A warm-season fruiting plant commonly grown in home gardens.", sunlight: "Full sun; aim for 6–8 hours of direct light where possible.", watering: "Water deeply at soil level when the top layer begins to dry; avoid waterlogging and frequent leaf wetting.", soil: "Loose, fertile, well-draining soil enriched with mature compost.", temperature: "Grows best in warm conditions; protect from frost and extreme heat.", emoji: "🍅" },
  { commonName: "Spinach", scientificName: "Spinacia oleracea", summary: "A leafy green that generally prefers cooler growing conditions.", sunlight: "Full sun in cool weather; partial shade can help in warmer climates.", watering: "Keep soil evenly moist, not saturated; check more often in hot or dry weather.", soil: "Moist, fertile, well-draining soil rich in organic matter.", temperature: "Prefers cool weather; heat can cause premature flowering.", emoji: "🥬" },
  { commonName: "Mango", scientificName: "Mangifera indica", summary: "A tropical evergreen fruit tree that needs space and a warm, sunny site.", sunlight: "Full sun and good air circulation.", watering: "Water young trees regularly while establishing; mature trees need deep watering during prolonged dry periods.", soil: "Deep, well-draining soil; avoid locations where water remains around the roots.", temperature: "Tropical to subtropical warmth; protect young trees from cold.", emoji: "🥭" },
  { commonName: "Basil", scientificName: "Ocimum basilicum", summary: "An aromatic herb grown for its leaves; pinch tips to encourage branching.", sunlight: "At least 6 hours of sun; provide afternoon shade in very hot weather.", watering: "Keep soil lightly and consistently moist while allowing excess water to drain.", soil: "Fertile, loose, well-draining potting mix or garden soil.", temperature: "Warm conditions; sensitive to cold and frost.", emoji: "🌿" },
  { commonName: "Chilli", scientificName: "Capsicum annuum", summary: "A warm-season pepper plant that grows well in containers or garden beds.", sunlight: "Full sun, ideally 6–8 hours daily.", watering: "Water when the surface begins to dry; keep moisture consistent during flowering and fruiting.", soil: "Well-draining, fertile soil with organic matter.", temperature: "Warm conditions; protect from frost and severe heat stress.", emoji: "🌶️" },
];
export const plantList = query({ args: {}, returns: v.array(v.any()), handler: async (ctx) => await ctx.db.query("plantCatalog").collect() });
export const plantByName = query({
  args: { name: v.string() }, returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const all = await ctx.db.query("plantCatalog").collect();
    const target = args.name.trim().toLowerCase();
    return all.find(p => p.commonName.toLowerCase() === target || p.scientificName.toLowerCase() === target) ?? null;
  },
});
export const seedStarterPlants = mutation({
  args: {}, returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("plantCatalog").first();
    if (existing) return null;
    const now = Date.now();
    for (const plant of starterPlants) await ctx.db.insert("plantCatalog", { ...plant, updatedAt: now });
    return null;
  },
});
