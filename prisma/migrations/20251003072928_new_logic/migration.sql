/*
  Warnings:

  - A unique constraint covering the columns `[marketplaceId,sellerFileId]` on the table `mappings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[filename]` on the table `seller_files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `mappings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `seller_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mappings" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "seller_files" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "mappings_marketplaceId_sellerFileId_key" ON "mappings"("marketplaceId", "sellerFileId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_files_filename_key" ON "seller_files"("filename");
