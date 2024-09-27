-- DropForeignKey
ALTER TABLE "WorkReportPhoto" DROP CONSTRAINT "WorkReportPhoto_work_report_id_fkey";

-- AddForeignKey
ALTER TABLE "WorkReportPhoto" ADD CONSTRAINT "WorkReportPhoto_work_report_id_fkey" FOREIGN KEY ("work_report_id") REFERENCES "WorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
