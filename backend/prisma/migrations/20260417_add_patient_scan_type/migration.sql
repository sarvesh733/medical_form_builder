-- Add scan_type column to Patient table
ALTER TABLE "Patient" ADD COLUMN "scan_type" TEXT NOT NULL DEFAULT 'Abdomen/Pelvis';
