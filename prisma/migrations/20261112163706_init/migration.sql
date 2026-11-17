-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'ANALYST');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'REVISION_NEEDED', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('PRIMARY', 'BACKUP', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY_EXAM', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "AttachmentKind" AS ENUM ('LINK', 'FILE');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "RevisionSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'BLOCKING');

-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReferenceSourceType" AS ENUM ('NEWS', 'JOURNAL', 'REPORT', 'INTERNAL', 'OTHER');

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "department_id" UUID,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ANALYST',
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "availability" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "availability_note" VARCHAR(280),
    "availability_updated_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT '#2563eb',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_topics" (
    "id" UUID NOT NULL,
    "department_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT,
    "relevance_note" TEXT,
    "status" "ResearchStatus" NOT NULL DEFAULT 'TO_DO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "start_date" DATE NOT NULL,
    "deadline" DATE NOT NULL,
    "created_by_id" UUID NOT NULL,
    "backup_analyst_id" UUID,
    "completed_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "research_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_topic_categories" (
    "topic_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "research_topic_categories_pkey" PRIMARY KEY ("topic_id","category_id")
);

-- CreateTable
CREATE TABLE "research_assignments" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "AssignmentRole" NOT NULL DEFAULT 'PRIMARY',
    "assigned_by_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "note" VARCHAR(280),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "research_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_submissions" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "submitted_by_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "summary" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "research_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_attachments" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "kind" "AttachmentKind" NOT NULL,
    "label" VARCHAR(160) NOT NULL,
    "url" TEXT,
    "storage_key" TEXT,
    "file_name" TEXT,
    "mime_type" VARCHAR(120),
    "size_bytes" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_reviews" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "summary" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_notes" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "submission_id" UUID,
    "review_id" UUID,
    "author_id" UUID NOT NULL,
    "section" VARCHAR(80) NOT NULL,
    "note" TEXT NOT NULL,
    "severity" "RevisionSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "RevisionStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "revision_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_references" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "added_by_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "url" TEXT NOT NULL,
    "source_type" "ReferenceSourceType" NOT NULL DEFAULT 'NEWS',
    "publisher" VARCHAR(160),
    "author" VARCHAR(160),
    "published_at" DATE,
    "accessed_at" DATE,
    "summary" TEXT,
    "relevance_note" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "research_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dod_templates" (
    "id" UUID NOT NULL,
    "department_id" UUID,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dod_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dod_template_items" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dod_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dod_checklists" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "template_id" UUID,
    "applied_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dod_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dod_checklist_items" (
    "id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "template_item_id" UUID,
    "label" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_by_id" UUID,
    "checked_at" TIMESTAMPTZ(6),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dod_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_status_history" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "from_status" "ResearchStatus",
    "to_status" "ResearchStatus" NOT NULL,
    "changed_by_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" VARCHAR(80),
    "metadata" JSONB,
    "ip" VARCHAR(64),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(60) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_availability_idx" ON "users"("availability");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "research_topics_status_deadline_idx" ON "research_topics"("status", "deadline");

-- CreateIndex
CREATE INDEX "research_topics_created_by_id_idx" ON "research_topics"("created_by_id");

-- CreateIndex
CREATE INDEX "research_topics_backup_analyst_id_idx" ON "research_topics"("backup_analyst_id");

-- CreateIndex
CREATE INDEX "research_topics_department_id_idx" ON "research_topics"("department_id");

-- CreateIndex
CREATE INDEX "research_topic_categories_category_id_idx" ON "research_topic_categories"("category_id");

-- CreateIndex
CREATE INDEX "research_assignments_topic_id_is_active_idx" ON "research_assignments"("topic_id", "is_active");

-- CreateIndex
CREATE INDEX "research_assignments_user_id_is_active_idx" ON "research_assignments"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "research_assignments_role_is_active_idx" ON "research_assignments"("role", "is_active");

-- CreateIndex
CREATE INDEX "research_submissions_topic_id_status_idx" ON "research_submissions"("topic_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "research_submissions_topic_id_version_key" ON "research_submissions"("topic_id", "version");

-- CreateIndex
CREATE INDEX "submission_attachments_submission_id_idx" ON "submission_attachments"("submission_id");

-- CreateIndex
CREATE INDEX "research_reviews_submission_id_idx" ON "research_reviews"("submission_id");

-- CreateIndex
CREATE INDEX "revision_notes_topic_id_status_idx" ON "revision_notes"("topic_id", "status");

-- CreateIndex
CREATE INDEX "revision_notes_submission_id_idx" ON "revision_notes"("submission_id");

-- CreateIndex
CREATE INDEX "research_references_topic_id_idx" ON "research_references"("topic_id");

-- CreateIndex
CREATE INDEX "dod_templates_department_id_idx" ON "dod_templates"("department_id");

-- CreateIndex
CREATE INDEX "dod_template_items_template_id_idx" ON "dod_template_items"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "dod_checklists_topic_id_key" ON "dod_checklists"("topic_id");

-- CreateIndex
CREATE INDEX "dod_checklist_items_checklist_id_idx" ON "dod_checklist_items"("checklist_id");

-- CreateIndex
CREATE INDEX "research_status_history_topic_id_created_at_idx" ON "research_status_history"("topic_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_topics" ADD CONSTRAINT "research_topics_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_topics" ADD CONSTRAINT "research_topics_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_topics" ADD CONSTRAINT "research_topics_backup_analyst_id_fkey" FOREIGN KEY ("backup_analyst_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_topic_categories" ADD CONSTRAINT "research_topic_categories_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_topic_categories" ADD CONSTRAINT "research_topic_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_assignments" ADD CONSTRAINT "research_assignments_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_assignments" ADD CONSTRAINT "research_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_assignments" ADD CONSTRAINT "research_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_submissions" ADD CONSTRAINT "research_submissions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_submissions" ADD CONSTRAINT "research_submissions_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_submissions" ADD CONSTRAINT "research_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_attachments" ADD CONSTRAINT "submission_attachments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "research_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_reviews" ADD CONSTRAINT "research_reviews_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "research_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_reviews" ADD CONSTRAINT "research_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_notes" ADD CONSTRAINT "revision_notes_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_notes" ADD CONSTRAINT "revision_notes_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "research_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_notes" ADD CONSTRAINT "revision_notes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "research_reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_notes" ADD CONSTRAINT "revision_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_notes" ADD CONSTRAINT "revision_notes_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_references" ADD CONSTRAINT "research_references_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_references" ADD CONSTRAINT "research_references_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_templates" ADD CONSTRAINT "dod_templates_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_templates" ADD CONSTRAINT "dod_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_template_items" ADD CONSTRAINT "dod_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "dod_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_checklists" ADD CONSTRAINT "dod_checklists_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_checklists" ADD CONSTRAINT "dod_checklists_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "dod_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_checklists" ADD CONSTRAINT "dod_checklists_applied_by_id_fkey" FOREIGN KEY ("applied_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_checklist_items" ADD CONSTRAINT "dod_checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "dod_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_checklist_items" ADD CONSTRAINT "dod_checklist_items_template_item_id_fkey" FOREIGN KEY ("template_item_id") REFERENCES "dod_template_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dod_checklist_items" ADD CONSTRAINT "dod_checklist_items_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_status_history" ADD CONSTRAINT "research_status_history_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "research_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_status_history" ADD CONSTRAINT "research_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Business rule: a topic can only have one active primary analyst.
CREATE UNIQUE INDEX "research_assignments_one_active_primary"
  ON "research_assignments" ("topic_id")
  WHERE "role" = 'PRIMARY' AND "is_active" = true;

-- Business rule: a user can only have one active assignment per topic.
CREATE UNIQUE INDEX "research_assignments_one_active_user"
  ON "research_assignments" ("topic_id", "user_id")
  WHERE "is_active" = true;

-- Business rule: deadline cannot be earlier than the start date.
ALTER TABLE "research_topics"
  ADD CONSTRAINT "research_topics_deadline_after_start"
  CHECK ("deadline" >= "start_date");
