-- DropForeignKey
ALTER TABLE "ToolCatalog" DROP CONSTRAINT "ToolCatalog_partId_fkey";

-- AlterTable
ALTER TABLE "ToolCatalog" ALTER COLUMN "partId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ToolCatalog" ADD CONSTRAINT "ToolCatalog_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
