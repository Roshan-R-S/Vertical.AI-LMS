CREATE TABLE "targets" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "month"     INTEGER NOT NULL,
  "year"      INTEGER NOT NULL,
  "amount"    DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "targets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "targets_userId_month_year_key" ON "targets"("userId", "month", "year");
CREATE INDEX "targets_userId_idx" ON "targets"("userId");

ALTER TABLE "targets" ADD CONSTRAINT "targets_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
