-- DropForeignKey
ALTER TABLE "ScanEvent" DROP CONSTRAINT "ScanEvent_template_id_fkey";

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "scan_type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScanEvent" ALTER COLUMN "template_id" DROP NOT NULL,
ALTER COLUMN "visit_date" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "FormTemplate"("template_id") ON DELETE SET NULL ON UPDATE CASCADE;
