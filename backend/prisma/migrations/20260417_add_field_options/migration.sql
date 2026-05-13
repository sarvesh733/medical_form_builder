-- Add options_json column to FormField table to store field options
ALTER TABLE "FormField" ADD COLUMN "options_json" JSONB;
