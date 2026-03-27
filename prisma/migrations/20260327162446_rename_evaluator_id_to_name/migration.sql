/*
  Warnings:

  - You are about to drop the column `evaluatorId` on the `Evaluation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "evaluatorId",
ADD COLUMN     "evaluatorName" TEXT;
