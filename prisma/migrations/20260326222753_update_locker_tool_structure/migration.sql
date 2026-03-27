/*
  Warnings:

  - You are about to drop the column `toolId` on the `LockerTool` table. All the data in the column will be lost.
  - Added the required column `item` to the `LockerTool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partId` to the `LockerTool` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LockerTool" DROP CONSTRAINT "LockerTool_toolId_fkey";

-- DropIndex
DROP INDEX "LockerTool_lockerId_toolId_key";

-- AlterTable
ALTER TABLE "LockerTool" DROP COLUMN "toolId",
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "item" TEXT NOT NULL,
ADD COLUMN     "partId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LockerTool" ADD CONSTRAINT "LockerTool_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
