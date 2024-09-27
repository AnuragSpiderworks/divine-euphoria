-- CreateTable
CREATE TABLE "Document" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "file_name_url" TEXT NOT NULL,
    "posted_user_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_posted_user_id_fkey" FOREIGN KEY ("posted_user_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
