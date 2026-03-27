-- DropForeignKey
ALTER TABLE "EvaluationItem" DROP CONSTRAINT "EvaluationItem_assignmentId_fkey";

-- AlterTable
ALTER TABLE "EvaluationItem" ADD COLUMN     "toolId" TEXT,
ALTER COLUMN "assignmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EvaluationItem" ADD CONSTRAINT "EvaluationItem_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationItem" ADD CONSTRAINT "EvaluationItem_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
