-- CreateIndex
CREATE INDEX "Assignment_technicianId_idx" ON "Assignment"("technicianId");

-- CreateIndex
CREATE INDEX "Assignment_materialId_idx" ON "Assignment"("materialId");

-- CreateIndex
CREATE INDEX "Evaluation_technicianId_idx" ON "Evaluation"("technicianId");

-- CreateIndex
CREATE INDEX "Evaluation_date_idx" ON "Evaluation"("date");

-- CreateIndex
CREATE INDEX "EvaluationItem_evaluationId_idx" ON "EvaluationItem"("evaluationId");

-- CreateIndex
CREATE INDEX "EvaluationItem_assignmentId_idx" ON "EvaluationItem"("assignmentId");

-- CreateIndex
CREATE INDEX "EvaluationItem_toolId_idx" ON "EvaluationItem"("toolId");

-- CreateIndex
CREATE INDEX "EvaluationItem_lockerToolId_idx" ON "EvaluationItem"("lockerToolId");

-- CreateIndex
CREATE INDEX "Locker_technicianId_idx" ON "Locker"("technicianId");

-- CreateIndex
CREATE INDEX "LockerMaterial_lockerId_idx" ON "LockerMaterial"("lockerId");

-- CreateIndex
CREATE INDEX "LockerMaterial_materialId_idx" ON "LockerMaterial"("materialId");

-- CreateIndex
CREATE INDEX "LockerTool_lockerId_idx" ON "LockerTool"("lockerId");

-- CreateIndex
CREATE INDEX "LockerTool_toolCatalogId_idx" ON "LockerTool"("toolCatalogId");

-- CreateIndex
CREATE INDEX "Tool_technicianId_idx" ON "Tool"("technicianId");

-- CreateIndex
CREATE INDEX "Tool_toolCatalogId_idx" ON "Tool"("toolCatalogId");

-- CreateIndex
CREATE INDEX "Tool_partId_idx" ON "Tool"("partId");
