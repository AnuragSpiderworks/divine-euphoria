-- CreateTable
CREATE TABLE "Contact" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_sequence" INTEGER NOT NULL,
    "posted_user_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_posted_user_id_fkey" FOREIGN KEY ("posted_user_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
