import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // UUID
  filename: text("filename").notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  html: text("html"),
  css: text("css"),
  js: text("js"),
  description: text("description"),
  components: json("components").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ createdAt: true });

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ConversionResult = {
  html: string;
  css: string;
  js: string;
  description: string;
  components: string[];
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
