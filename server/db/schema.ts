import {
  int,
  mysqlTable,
  text,
  timestamp,
  datetime,
  varchar,
  mysqlEnum,
  boolean,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  user_id: int("user_id").autoincrement().primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  full_name: varchar("full_name", { length: 50 }),
  password: varchar("password", { length: 150 }).notNull(),
  role: mysqlEnum(["vendor", "admin", "super_admin"])
    .default("vendor")
    .notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const vendorProfileTable = mysqlTable("vendor_profiles", {
  vendor_id: int("vendor_id").autoincrement().primaryKey(),
  vendor_code: varchar("vendor_code", { length: 50 }).notNull().unique(),
  vendor_source: mysqlEnum(["direct", "invite"]).default("direct"),
  vendor_status: mysqlEnum(["pending", "rejected", "approved"])
    .default("approved")
    .notNull(),
  vendor_contact: varchar("vendor_contact", { length: 15 }),
  vendor_alt_contact: varchar("vendor_alt_contact", { length: 15 }),
  vendor_pan_number: varchar("vendor_pan_number", { length: 30 }),
  vendor_pan_doc_key: varchar("vendor_pan_doc_key", { length: 200 }),
  vendor_adhar_doc_key: varchar("vendor_adhar_doc_key", { length: 200 }),
  vendor_image_key: varchar("vendor_image_key", { length: 200 }),
  vendor_rejection_reason: text("vendor_rejection_reason"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  user_id: int("user_id")
    .references(() => usersTable.user_id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const businessTable = mysqlTable("businesses", {
  business_id: int("business_id").autoincrement().primaryKey(),
  biz_legal_name: varchar("biz_legal_name", { length: 100 }),
  biz_trade_name: varchar("biz_trade_name", { length: 100 }),
  biz_classification: varchar("biz_classification", { length: 50 }),
  biz_reg_number: varchar("biz_reg_number", { length: 50 }),
  biz_reg_doc_key: varchar("biz_reg_doc_key", { length: 200 }),
  biz_established_year: varchar("biz_established_year", { length: 4 }),
  biz_addr_line1: varchar("biz_addr_line1", { length: 100 }),
  biz_addr_line2: varchar("biz_addr_line2", { length: 100 }),
  biz_locality: varchar("biz_locality", { length: 50 }),
  biz_city: varchar("biz_city", { length: 50 }),
  biz_pin_code: varchar("biz_pin_code", { length: 6 }),
  biz_country: varchar("biz_country", { length: 50 }),
  biz_state: varchar("biz_state", { length: 50 }),
  biz_gst_number: varchar("biz_gst_number", { length: 20 }),
  biz_gst_doc_key: varchar("biz_gst_doc_key", { length: 200 }),
  biz_bank_doc_key: varchar("biz_bank_doc_key", { length: 200 }),
  biz_msme_cert_doc_key: varchar("biz_msme_cert_doc_key", { length: 200 }),
  biz_website: varchar("biz_website", { length: 100 }),
  biz_email: varchar("biz_email", { length: 100 }),
  biz_phone: varchar("biz_phone", { length: 15 }),
  biz_3_year_turnover: varchar("biz_3_year_turnover", { length: 25 }),
  biz_employee_count: int("biz_employee_count"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  vendor_id: int("vendor_id")
    .references(() => vendorProfileTable.vendor_id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const departmentTable = mysqlTable("departments", {
  department_id: int("department_id").autoincrement().primaryKey(),
  div_code: varchar("div_code", { length: 255 }).unique().notNull(),
  division_name: varchar("division_name", { length: 255 }).unique().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const tenderTable = mysqlTable("tenders", {
  tender_id: int("tender_id").autoincrement().primaryKey(),
  tender_department: varchar("tender_department", { length: 100 }),
  tender_number: varchar("tender_number", { length: 50 }),
  tender_type: varchar("tender_type", { length: 50 }),
  tender_scope: varchar("tender_scope", { length: 50 }),
  tender_title: varchar("tender_title", { length: 150 }),
  tender_description: text("tender_description"),
  tender_contract_document: varchar("tender_contract_document", {
    length: 255,
  }),
  tender_doc_fee: varchar("tender_doc_fee", { length: 255 }),
  tender_emd: varchar("tender_emd", { length: 255 }),
  tender_location: varchar("tender_location", { length: 255 }),
  tender_remark: varchar("tender_remark", { length: 255 }),
  tender_query_deadline: datetime("tender_query_deadline"),
  tender_query_response_date: datetime("tender_query_response_date"),
  tender_release_date: datetime("tender_release_date"),
  tender_bid_submission_deadline: datetime("tender_bid_submission_deadline"),
  tender_technical_bid_opening: datetime("tender_technical_bid_opening"),
  tender_financial_bid_opening: datetime("tender_financial_bid_opening"),
  tender_opening_venue: text("tender_opening_venue"),
  tender_project_duration: varchar("tender_project_duration", { length: 50 }),
  tender_is_active: boolean("tender_is_active").default(false).notNull(),
  tender_is_technical_doc: boolean("tender_is_technical_doc")
    .default(false)
    .notNull(),
  tender_is_financial_doc: boolean("tender_is_financial_doc")
    .default(false)
    .notNull(),
  tender_status: mysqlEnum(["draft", "review", "rescheduled", "published"])
    .default("draft")
    .notNull(),
  tender_created_by_id: int("tender_created_by_id").references(
    () => usersTable.user_id,
    { onDelete: "set null" }
  ),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const tenderEmailInvitesTable = mysqlTable("tender_email_invites", {
  invite_id: int("invite_id").autoincrement().primaryKey(),
  tender_id: int("tender_id")
    .references(() => tenderTable.tender_id, { onDelete: "cascade" })
    .notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  sent_at: timestamp("sent_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const vendorDocRequirementTable = mysqlTable("vendor_doc_requirements", {
  vdr_id: int("vdr_id").autoincrement().primaryKey(),
  vdr_name: varchar("vdr_name", { length: 100 }),
  tender_id: int("tender_id")
    .references(() => tenderTable.tender_id, { onDelete: "cascade" })
    .notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const bidsTable = mysqlTable("bids", {
  bid_id: int("bid_id").autoincrement().primaryKey(),
  vendor_id: int("vendor_id")
    .references(() => vendorProfileTable.vendor_id, { onDelete: "cascade" })
    .notNull(),
  tender_id: int("tender_id")
    .references(() => tenderTable.tender_id, { onDelete: "cascade" })
    .notNull(),
  bid_fee_doc_key: varchar("bid_fee_doc_key", { length: 255 }),
  technical_doc_key: varchar("technical_doc_key", { length: 255 }),
  financial_doc_key: varchar("financial_doc_key", { length: 255 }),
  bid_optional_info: text("bid_optional_info"),
  bid_rejection_msg: text("bid_rejection_msg"),
  bid_status: mysqlEnum([
    "selected",
    "ranked",
    "under_review",
    "rejected",
    "approved",
  ])
    .default("under_review")
    .notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Bid vendor documents - stores uploaded documents for each vendor doc requirement
export const bidVendorDocsTable = mysqlTable("bid_vendor_docs", {
  bvd_id: int("bvd_id").autoincrement().primaryKey(),
  bid_id: int("bid_id")
    .references(() => bidsTable.bid_id, { onDelete: "cascade" })
    .notNull(),
  vdr_id: int("vdr_id")
    .references(() => vendorDocRequirementTable.vdr_id, { onDelete: "cascade" })
    .notNull(),
  bvd_doc_key: varchar("bvd_doc_key", { length: 255 }).notNull(),
  bvd_doc_name: varchar("bvd_doc_name", { length: 100 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// In-app notifications shown in the dashboard top bar
export const notificationsTable = mysqlTable("notifications", {
  notif_id: int("notif_id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .references(() => usersTable.user_id, { onDelete: "cascade" })
    .notNull(),
  notif_title: varchar("notif_title", { length: 100 }).notNull(),
  notif_message: text("notif_message").notNull(),
  notif_is_read: boolean("notif_is_read").default(false).notNull(),
  notif_type: mysqlEnum([
    "bid_status",
    "tender_update",
    "account",
    "clarification",
    "system",
  ]).notNull(),
  // App path opened when the notification is clicked, e.g. "/tender/12"
  notif_link: varchar("notif_link", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const adminInvitesTable = mysqlTable("admin_invites", {
  invite_id: int("invite_id").autoincrement().primaryKey(),
  invite_email: varchar("invite_email", { length: 100 }).notNull(),
  invite_token: varchar("invite_token", { length: 255 }).notNull().unique(),
  invite_expires_at: timestamp("invite_expires_at").notNull(),
  invite_is_used: boolean("invite_is_used").default(false).notNull(),
  invited_by: int("invited_by")
    .references(() => usersTable.user_id, { onDelete: "cascade" })
    .notNull(),
  invite_used_at: timestamp("invite_used_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
