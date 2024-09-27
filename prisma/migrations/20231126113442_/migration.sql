-- AddForeignKey
ALTER TABLE "PaymentNotification" ADD CONSTRAINT "PaymentNotification_target_member_id_fkey" FOREIGN KEY ("target_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentNotification" ADD CONSTRAINT "PaymentNotification_posted_member_id_fkey" FOREIGN KEY ("posted_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
