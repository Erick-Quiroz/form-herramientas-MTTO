/*
  Warnings:

  - You are about to drop the column `code` on the `Locker` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Tool` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tool` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tool` table. All the data in the column will be lost.
  - Added the required column `name` to the `Locker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Locker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item` to the `Tool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partId` to the `Tool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Locker" DROP COLUMN "code",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "item" TEXT NOT NULL,
ADD COLUMN     "partId" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'gray',

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Part_level_key" ON "Part"("level");

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
