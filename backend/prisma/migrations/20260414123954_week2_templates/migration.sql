/*
  Warnings:

  - Added the required column `section_id` to the `FormField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section_title` to the `FormField` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormField" ADD COLUMN     "section_id" TEXT NOT NULL,
ADD COLUMN     "section_title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "FormField_template_id_section_id_idx" ON "FormField"("template_id", "section_id");
