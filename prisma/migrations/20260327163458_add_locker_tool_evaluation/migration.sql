-- AlterTable
ALTER TABLE "EvaluationItem" ADD COLUMN     "lockerToolId" TEXT;

-- AddForeignKey
ALTER TABLE "EvaluationItem" ADD CONSTRAINT "EvaluationItem_lockerToolId_fkey" FOREIGN KEY ("lockerToolId") REFERENCES "LockerTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
