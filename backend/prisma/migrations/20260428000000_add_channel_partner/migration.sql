-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CHANNEL_PARTNER';

-- AlterTable
ALTER TABLE "users" 
ADD COLUMN "approvalToken" TEXT,
ADD COLUMN "isPending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "companyName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_approvalToken_key" ON "users"("approvalToken");
