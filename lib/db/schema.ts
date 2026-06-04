/* eslint-disable */

import { pgTable, text, timestamp, uuid, jsonb, integer, varchar, boolean, index, foreignKey, customType } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// -----------------------------------------------------------------------------
// CORE & AUTH TABLES
// -----------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Internal Dev ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull().default("member"), // 'owner', 'admin', 'member'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// LIBRO DATA TABLES
// -----------------------------------------------------------------------------

export const endUsers = pgTable("end_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  externalId: varchar("external_id", { length: 255 }).notNull(), // ID in developer's system
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    projectExternalIdIdx: index("end_user_project_ext_idx").on(table.projectId, table.externalId),
  };
});



const customVector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(384)';
  },
  toDriver(value: number[]) {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value as number[];
  }
});

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  endUserId: uuid("end_user_id").notNull().references(() => endUsers.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: customVector("embedding"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  endUserId: uuid("end_user_id").notNull().references(() => endUsers.id, { onDelete: "cascade" }),
  identity: jsonb("identity").default({}),
  skills: jsonb("skills").default([]),
  goals: jsonb("goals").default([]),
  projects: jsonb("projects").default([]),
  preferences: jsonb("preferences").default([]),
  confidenceScore: integer("confidence_score").default(0),
  lastExtractedAt: timestamp("last_extracted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  endUserId: uuid("end_user_id").notNull().references(() => endUsers.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }), // 'milestone', 'shift', 'learning'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contextGraphNodes = pgTable("context_graph_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  endUserId: uuid("end_user_id").notNull().references(() => endUsers.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'skill', 'goal', 'project', 'person'
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contextGraphEdges = pgTable("context_graph_edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceNodeId: uuid("source_node_id").notNull().references(() => contextGraphNodes.id, { onDelete: "cascade" }),
  targetNodeId: uuid("target_node_id").notNull().references(() => contextGraphNodes.id, { onDelete: "cascade" }),
  relationshipType: varchar("relationship_type", { length: 100 }).notNull(), // e.g., 'requires', 'depends_on', 'builds'
  confidenceScore: integer("confidence_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// LOGGING & AUDIT
// -----------------------------------------------------------------------------

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  statusCode: integer("status_code").notNull(),
  durationMs: integer("duration_ms").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  endUserId: uuid("end_user_id").references(() => endUsers.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'accuracy', 'latency', 'other'
  comment: text("comment"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiLogs = pgTable("api_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  method: varchar("method", { length: 10 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestPayload: jsonb("request_payload").default({}),
  responsePayload: jsonb("response_payload").default({}),
  statusCode: integer("status_code").notNull(),
  durationMs: integer("duration_ms").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billing = pgTable("billing", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  planId: varchar("plan_id", { length: 50 }).notNull().default("free"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// CONTEXT PASSPORT MVP TABLES
// -----------------------------------------------------------------------------

export const passports = pgTable("passports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  project: varchar("project", { length: 255 }).notNull(),
  goal: text("goal").notNull(),
  summary: text("summary").notNull(),
  embedding: customVector("embedding"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passportTasks = pgTable("passport_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  passportId: uuid("passport_id").notNull().references(() => passports.id, { onDelete: "cascade" }),
  task: text("task").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passportDecisions = pgTable("passport_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  passportId: uuid("passport_id").notNull().references(() => passports.id, { onDelete: "cascade" }),
  decision: text("decision").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sdkWaitlist = pgTable("sdk_waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  useCase: text("use_case"),
  grantedAccess: boolean("granted_access").default(false).notNull(),
  grantedAt: timestamp("granted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passportsRelations = relations(passports, ({ many }) => ({
  tasks: many(passportTasks),
  decisions: many(passportDecisions),
}));

export const passportTasksRelations = relations(passportTasks, ({ one }) => ({
  passport: one(passports, {
    fields: [passportTasks.passportId],
    references: [passports.id],
  }),
}));

export const passportDecisionsRelations = relations(passportDecisions, ({ one }) => ({
  passport: one(passports, {
    fields: [passportDecisions.passportId],
    references: [passports.id],
  }),
}));

