-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD', 'BDE');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('DEFAULT', 'LOST', 'YET_TO_CALL', 'NOT_INTERESTED', 'DNP', 'CALL_BACK', 'DND', 'SWITCHED_OFF', 'MEETING_SCHEDULED', 'MEETING_POSTPONED', 'PROPOSAL_SHARED', 'HANDED_OVER', 'PAYMENT_COMPLETED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BDE',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvalToken" TEXT NOT NULL,
    "teamLeadEmail" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "designation" TEXT,
    "industry" TEXT,
    "source" TEXT,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stage" "LeadStage" NOT NULL DEFAULT 'YET_TO_CALL',
    "remarks" TEXT,
    "linkedIn" TEXT,
    "location" TEXT,
    "companyName" TEXT,
    "companyWebsite" TEXT,
    "product" TEXT,
    "state" TEXT,
    "city" TEXT,
    "assignedToId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "nextFollowUp" TIMESTAMP(3),
    "lastFollowUp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registration_requests_email_key" ON "registration_requests"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registration_requests_approvalToken_key" ON "registration_requests"("approvalToken");

-- CreateIndex
CREATE INDEX "leads_stage_idx" ON "leads"("stage");

-- CreateIndex
CREATE INDEX "leads_assignedToId_idx" ON "leads"("assignedToId");

-- CreateIndex
CREATE INDEX "activities_leadId_idx" ON "activities"("leadId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
