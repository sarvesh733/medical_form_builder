-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "patient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "template_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "scan_type" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "field_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "standard_key" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("field_id")
);

-- CreateTable
CREATE TABLE "ScanEvent" (
    "event_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanEvent_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "ScanFieldValue" (
    "value_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "value_text" TEXT,
    "value_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanFieldValue_pkey" PRIMARY KEY ("value_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FormTemplate_doctor_id_scan_type_idx" ON "FormTemplate"("doctor_id", "scan_type");

-- CreateIndex
CREATE INDEX "FormField_template_id_idx" ON "FormField"("template_id");

-- CreateIndex
CREATE INDEX "ScanEvent_patient_id_created_at_idx" ON "ScanEvent"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "ScanEvent_doctor_id_created_at_idx" ON "ScanEvent"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "ScanEvent_template_id_created_at_idx" ON "ScanEvent"("template_id", "created_at");

-- CreateIndex
CREATE INDEX "ScanFieldValue_field_id_idx" ON "ScanFieldValue"("field_id");

-- CreateIndex
CREATE UNIQUE INDEX "ScanFieldValue_event_id_field_id_key" ON "ScanFieldValue"("event_id", "field_id");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "FormTemplate"("template_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "FormTemplate"("template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanFieldValue" ADD CONSTRAINT "ScanFieldValue_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "ScanEvent"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanFieldValue" ADD CONSTRAINT "ScanFieldValue_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "FormField"("field_id") ON DELETE CASCADE ON UPDATE CASCADE;
