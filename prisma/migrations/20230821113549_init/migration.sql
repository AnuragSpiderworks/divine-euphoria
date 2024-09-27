-- CreateTable
CREATE TABLE "Member" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "facebook" TEXT,
    "linkedin" TEXT,
    "address" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" BIGSERIAL NOT NULL,
    "member_id" BIGINT NOT NULL,
    "login_date" TIMESTAMP(3) NOT NULL,
    "login_ip_address" TEXT NOT NULL,
    "success_status" BOOLEAN NOT NULL,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" BIGSERIAL NOT NULL,
    "sector" TEXT NOT NULL,
    "plot_number" INTEGER NOT NULL,
    "old_plot_number" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "fenced" BOOLEAN NOT NULL,
    "has_cottage" BOOLEAN NOT NULL,
    "electricity_connection" BOOLEAN NOT NULL,
    "water_connection" BOOLEAN NOT NULL,
    "current_owner_id" BIGINT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "filename" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyOwner" (
    "id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "member_id" BIGINT NOT NULL,
    "date_of_agreement" TIMESTAMP(3) NOT NULL,
    "date_of_registration" TIMESTAMP(3) NOT NULL,
    "ownership_status" TEXT NOT NULL,

    CONSTRAINT "PropertyOwner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_current_owner_id_fkey" FOREIGN KEY ("current_owner_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOwner" ADD CONSTRAINT "PropertyOwner_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOwner" ADD CONSTRAINT "PropertyOwner_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
