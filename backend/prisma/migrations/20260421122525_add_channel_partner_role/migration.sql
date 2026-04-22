/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CHANNEL_PARTNER';

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "registration_requests" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE INDEX "leads_createdById_idx" ON "leads"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
