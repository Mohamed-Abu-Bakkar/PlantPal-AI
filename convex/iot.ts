import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Sign in required.");
  return identity;
}

// Field and device setup are available only to the signed-in field owner.
export const createField = mutation({
  args: {
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    address: v.optional(v.string()),
    soilType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (!args.name.trim()) throw new Error("Field name is required.");
    if (args.latitude < -90 || args.latitude > 90 || args.longitude < -180 || args.longitude > 180) {
      throw new Error("Invalid field coordinates.");
    }
    return await ctx.db.insert("fields", {
      userId: identity.tokenIdentifier,
      name: args.name.trim(),
      location: { latitude: args.latitude, longitude: args.longitude },
      address: args.address,
      soilType: args.soilType,
      createdAt: Date.now(),
    });
  },
});

export const registerDevice = mutation({
  args: {
    fieldId: v.id("fields"),
    deviceName: v.string(),
    deviceCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== identity.tokenIdentifier) throw new Error("Field not found.");
    const code = args.deviceCode.trim();
    if (code.length < 6 || code.length > 64) throw new Error("Device code must be 6–64 characters.");
    const existing = await ctx.db.query("iotDevices").withIndex("by_device_code", q => q.eq("deviceCode", code)).first();
    if (existing) throw new Error("That device code is already registered.");
    return await ctx.db.insert("iotDevices", {
      userId: identity.tokenIdentifier,
      fieldId: args.fieldId,
      deviceName: args.deviceName.trim() || "ESP32-S3",
      deviceCode: code,
      status: "offline",
      createdAt: Date.now(),
    });
  },
});

export const listFields = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db.query("fields").withIndex("by_user_and_created", q => q.eq("userId", identity.tokenIdentifier)).order("desc").take(100);
  },
});

export const listDevices = query({
  args: { fieldId: v.optional(v.id("fields")) },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (args.fieldId) {
      const field = await ctx.db.get(args.fieldId);
      if (!field || field.userId !== identity.tokenIdentifier) throw new Error("Field not found.");
      const devices = await ctx.db.query("iotDevices").withIndex("by_field", q => q.eq("fieldId", args.fieldId!)).take(100);
      return devices.map(({ deviceCode: _deviceCode, ...device }) => device);
    }
    const devices = await ctx.db.query("iotDevices").withIndex("by_user", q => q.eq("userId", identity.tokenIdentifier)).take(100);
    return devices.map(({ deviceCode: _deviceCode, ...device }) => device);
  },
});

export const latestReadings = query({
  args: { fieldId: v.id("fields"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== identity.tokenIdentifier) throw new Error("Field not found.");
    return await ctx.db.query("sensorReadings")
      .withIndex("by_field_and_time", q => q.eq("fieldId", args.fieldId))
      .order("desc")
      .take(Math.max(1, Math.min(500, Math.floor(args.limit ?? 100))));
  },
});

// Public ingestion endpoint: intentionally does not require Clerk or a device secret.
// The registered device code identifies which field receives the reading.
export const ingest = mutation({
  args: {
    deviceCode: v.string(),
    readingId: v.string(),
    soilTemperatureC: v.number(),
    airTemperatureC: v.number(),
    airHumidity: v.number(),
    recordedAt: v.optional(v.number()),
  },
  returns: v.object({ ok: v.boolean(), receivedAt: v.number() }),
  handler: async (ctx, args) => {
    const code = args.deviceCode.trim();
    const readingId = args.readingId.trim();
    if (!code || code.length > 64) throw new Error("Invalid deviceCode.");
    if (!readingId || readingId.length > 100) throw new Error("Invalid readingId.");
    if (!Number.isFinite(args.soilTemperatureC) || args.soilTemperatureC < -20 || args.soilTemperatureC > 80) throw new Error("soilTemperatureC must be between -20 and 80.");
    if (!Number.isFinite(args.airTemperatureC) || args.airTemperatureC < -20 || args.airTemperatureC > 80) throw new Error("airTemperatureC must be between -20 and 80.");
    if (!Number.isFinite(args.airHumidity) || args.airHumidity < 0 || args.airHumidity > 100) throw new Error("airHumidity must be between 0 and 100.");

    const device = await ctx.db.query("iotDevices")
      .withIndex("by_device_code", q => q.eq("deviceCode", code))
      .first();
    if (!device) throw new Error("Unknown device code.");

    const duplicate = await ctx.db.query("sensorReadings")
      .withIndex("by_reading_id", q => q.eq("readingId", readingId))
      .first();
    if (duplicate) return { ok: true, receivedAt: duplicate.receivedAt };

    const receivedAt = Date.now();
    const previous = await ctx.db.query("sensorReadings")
      .withIndex("by_device_and_received", q => q.eq("deviceId", device._id))
      .order("desc")
      .first();
    if (previous && receivedAt - previous.receivedAt < 25_000) {
      throw new Error("Reading rate limit: wait at least 25 seconds between uploads.");
    }

    const recordedAt = args.recordedAt !== undefined && Number.isFinite(args.recordedAt)
      ? Math.min(receivedAt + 5 * 60_000, Math.max(receivedAt - 24 * 60 * 60_000, args.recordedAt))
      : receivedAt;

    await ctx.db.insert("sensorReadings", {
      userId: device.userId,
      fieldId: device.fieldId,
      deviceId: device._id,
      readingId,
      soilTemperatureC: args.soilTemperatureC,
      airTemperatureC: args.airTemperatureC,
      airHumidity: args.airHumidity,
      recordedAt,
      receivedAt,
    });
    await ctx.db.patch(device._id, { status: "online", lastSeenAt: receivedAt });
    return { ok: true, receivedAt };
  },
});
