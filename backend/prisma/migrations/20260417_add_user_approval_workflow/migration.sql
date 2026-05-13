-- Add approval fields to User table
ALTER TABLE "User" ADD COLUMN "is_approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "approver_id" TEXT;
ALTER TABLE "User" ADD COLUMN "approved_at" TIMESTAMP(3);

-- Add foreign key for approver relationship
ALTER TABLE "User" ADD CONSTRAINT "User_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
