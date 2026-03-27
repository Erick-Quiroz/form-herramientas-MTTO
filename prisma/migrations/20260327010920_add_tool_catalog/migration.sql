/*
  Warnings:

  - You are about to drop the column `item` on the `LockerTool` table. All the data in the column will be lost.
  - You are about to drop the column `partId` on the `LockerTool` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `Tool` table. All the data in the column will be lost.
  - You are about to drop the column `partId` on the `Tool` table. All the data in the column will be lost.
  - Added the required column `toolCatalogId` to the `LockerTool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toolCatalogId` to the `Tool` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LockerTool" DROP CONSTRAINT "LockerTool_partId_fkey";

-- DropForeignKey
ALTER TABLE "Tool" DROP CONSTRAINT "Tool_partId_fkey";

-- AlterTable
ALTER TABLE "LockerTool" DROP COLUMN "item",
DROP COLUMN "partId",
ADD COLUMN     "toolCatalogId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "item",
DROP COLUMN "partId",
ADD COLUMN     "toolCatalogId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ToolCatalog" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToolCatalog_item_key" ON "ToolCatalog"("item");

-- AddForeignKey
ALTER TABLE "ToolCatalog" ADD CONSTRAINT "ToolCatalog_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_toolCatalogId_fkey" FOREIGN KEY ("toolCatalogId") REFERENCES "ToolCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockerTool" ADD CONSTRAINT "LockerTool_toolCatalogId_fkey" FOREIGN KEY ("toolCatalogId") REFERENCES "ToolCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
