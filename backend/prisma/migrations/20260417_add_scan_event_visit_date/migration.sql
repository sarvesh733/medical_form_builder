-- Add visit_date column to ScanEvent table
ALTER TABLE "ScanEvent" ADD COLUMN "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
