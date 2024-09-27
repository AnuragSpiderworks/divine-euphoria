-- CreateEnum
CREATE TYPE "Action" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "performed_member_id" BIGINT NOT NULL,
    "target_member_id" BIGINT NOT NULL,
    "property_id" BIGINT,
    "action" "Action" NOT NULL,
    "table" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performed_member_id_fkey" FOREIGN KEY ("performed_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_target_member_id_fkey" FOREIGN KEY ("target_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "OwnedProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
