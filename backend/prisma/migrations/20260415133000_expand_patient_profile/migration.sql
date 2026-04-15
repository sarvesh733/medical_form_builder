-- AlterTable
ALTER TABLE "Patient"
  ADD COLUMN "pid" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "age" INTEGER,
  ADD COLUMN "dob" TIMESTAMP(3),
  ADD COLUMN "marital_status" TEXT,
  ADD COLUMN "gender" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "aadhar_number" TEXT,
  ADD COLUMN "email" TEXT;

-- Backfill placeholder values if any old rows still exist
UPDATE "Patient"
SET
  "pid" = COALESCE("pid", 'PID-' || SUBSTRING(REPLACE("patient_id", '-', '') FROM 1 FOR 8)),
  "phone" = COALESCE("phone", 'NA'),
  "address" = COALESCE("address", 'NA'),
  "age" = COALESCE("age", 0),
  "dob" = COALESCE("dob", NOW()),
  "marital_status" = COALESCE("marital_status", 'unknown'),
  "gender" = COALESCE("gender", 'unknown'),
  "state" = COALESCE("state", 'unknown'),
  "country" = COALESCE("country", 'unknown'),
  "aadhar_number" = COALESCE("aadhar_number", 'unknown'),
  "email" = COALESCE("email", 'unknown@local.dev')
WHERE
  "pid" IS NULL OR "phone" IS NULL OR "address" IS NULL OR "age" IS NULL OR "dob" IS NULL
  OR "marital_status" IS NULL OR "gender" IS NULL OR "state" IS NULL OR "country" IS NULL
  OR "aadhar_number" IS NULL OR "email" IS NULL;

-- Enforce required constraints
ALTER TABLE "Patient"
  ALTER COLUMN "pid" SET NOT NULL,
  ALTER COLUMN "phone" SET NOT NULL,
  ALTER COLUMN "address" SET NOT NULL,
  ALTER COLUMN "age" SET NOT NULL,
  ALTER COLUMN "dob" SET NOT NULL,
  ALTER COLUMN "marital_status" SET NOT NULL,
  ALTER COLUMN "gender" SET NOT NULL,
  ALTER COLUMN "state" SET NOT NULL,
  ALTER COLUMN "country" SET NOT NULL,
  ALTER COLUMN "aadhar_number" SET NOT NULL,
  ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_pid_key" ON "Patient"("pid");
