-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "partId" TEXT;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
