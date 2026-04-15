-- CreateTable
CREATE TABLE "ScanEventHistory" (
    "history_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "old_data" JSONB NOT NULL,
    "new_data" JSONB NOT NULL,
    "edited_by" TEXT NOT NULL,
    "edited_role" TEXT NOT NULL,
    "edited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanEventHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE INDEX "ScanEventHistory_event_id_edited_at_idx" ON "ScanEventHistory"("event_id", "edited_at");

-- CreateIndex
CREATE INDEX "ScanEventHistory_edited_by_idx" ON "ScanEventHistory"("edited_by");

-- AddForeignKey
ALTER TABLE "ScanEventHistory" ADD CONSTRAINT "ScanEventHistory_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "ScanEvent"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanEventHistory" ADD CONSTRAINT "ScanEventHistory_edited_by_fkey" FOREIGN KEY ("edited_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
