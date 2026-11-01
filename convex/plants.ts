import {mutation,query} from "./_generated/server"; import {v} from "convex/values";
export const list=query({args:{},handler:async(ctx)=>ctx.db.query("plants").withIndex("by_created").order("desc").collect()});
export const add=mutation({args:{name:v.string(),species:v.optional(v.string()),location:v.optional(v.string()),notes:v.optional(v.string())},handler:async(ctx,args)=>ctx.db.insert("plants",{...args,createdAt:Date.now()})});
export const remove=mutation({args:{id:v.id("plants")},handler:async(ctx,args)=>ctx.db.delete(args.id)});
export const tasks=query({args:{},handler:async(ctx)=>ctx.db.query("careTasks").withIndex("by_due").order("asc").collect()});
