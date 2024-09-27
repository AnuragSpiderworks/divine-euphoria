-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "OwnedProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
