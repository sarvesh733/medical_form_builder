-- AlterTable
ALTER TABLE "ScanEvent" ADD COLUMN "created_by" TEXT;

-- CreateTable
CREATE TABLE "ScanEventData" (
    "event_data_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanEventData_pkey" PRIMARY KEY ("event_data_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScanEventData_event_id_key" ON "ScanEventData"("event_id");

-- CreateIndex
CREATE INDEX "ScanEventData_event_id_idx" ON "ScanEventData"("event_id");

-- AddForeignKey
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEventData" ADD CONSTRAINT "ScanEventData_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "ScanEvent"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
