-- CreateTable
CREATE TABLE "Tag" (
    "id" BIGSERIAL NOT NULL,
    "posted_user_id" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GalleryPhotoToTag" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GalleryPhotoToTag_AB_unique" ON "_GalleryPhotoToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_GalleryPhotoToTag_B_index" ON "_GalleryPhotoToTag"("B");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_posted_user_id_fkey" FOREIGN KEY ("posted_user_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GalleryPhotoToTag" ADD CONSTRAINT "_GalleryPhotoToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "GalleryPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GalleryPhotoToTag" ADD CONSTRAINT "_GalleryPhotoToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
