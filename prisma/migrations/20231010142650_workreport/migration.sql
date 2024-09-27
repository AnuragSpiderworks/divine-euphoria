-- CreateTable
CREATE TABLE "WorkReport" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "posted_user_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "property_id" BIGINT,

    CONSTRAINT "WorkReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkReportPhoto" (
    "id" BIGSERIAL NOT NULL,
    "work_report_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,

    CONSTRAINT "WorkReportPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkReport" ADD CONSTRAINT "WorkReport_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkReport" ADD CONSTRAINT "WorkReport_posted_user_id_fkey" FOREIGN KEY ("posted_user_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkReportPhoto" ADD CONSTRAINT "WorkReportPhoto_work_report_id_fkey" FOREIGN KEY ("work_report_id") REFERENCES "WorkReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
