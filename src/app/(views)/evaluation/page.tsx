"use client";

import { useState, useEffect } from "react";
import { EvaluationForm } from "@/components/EvaluationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface Technician {
  id: string;
  name: string;
  specialty: string;
}

interface Assignment {
  id: string;
  Material: {
    id: string;
    number: string;
    item: string;
    defaultQty: number;
  };
}

interface Tool {
  id: string;
  toolCatalog: {
    id: string;
    item: string;
  };
  partLabel?: string;
  quantity: number;
  complement?: string;
}

interface LockerTool {
  id: string;
  toolCatalog: {
    id: string;
    item: string;
  };
  partLabel?: string;
  quantity: number;
  complement?: string;
}

interface Locker {
  id: string;
  number: number;
  name: string;
  tools: LockerTool[];
}

interface Evaluation {
  id: string;
  date: string;
  evaluatorName?: string;
  observations?: string;
  evaluationItems: Array<{
    id: string;
    assignmentId?: string;
    toolId?: string;
    lockerToolId?: string;
    hasItem: boolean;
    isClean: boolean;
    quantityObserved?: number;
    complementObserved?: string;
    observations?: string;
    assignment?: Assignment;
    tool?: Tool;
    lockerTool?: LockerTool;
  }>;
}

interface EvaluationItemState {
  assignmentId?: string;
  toolId?: string;
  lockerToolId?: string;
  hasItem: boolean;
  isClean: boolean;
  quantityObserved?: number;
  complementObserved?: string;
  observations?: string;
}

export default function EvaluationPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<Record<string, Evaluation[]>>({});
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null);
  const [evaluationType, setEvaluationType] = useState<"herramientas" | "casilleros">("herramientas");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch technicians on mount
  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/technicians");
      if (!res.ok) throw new Error("Error fetching technicians");
      const data = await res.json();
      setTechnicians(data);

      // Fetch evaluations for all technicians in parallel
      const evaluationsData: Record<string, Evaluation[]> = {};
      await Promise.all(
        data.map(async (tech: Technician) => {
          try {
            const evalRes = await fetch(`/api/evaluations?technicianId=${tech.id}`);
            if (evalRes.ok) {
              evaluationsData[tech.id] = await evalRes.json();
            }
          } catch (err) {
            console.error(`Error fetching evaluations for ${tech.id}:`, err);
          }
        })
      );
      setAllEvaluations(evaluationsData);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar técnicos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechnicianSelect = async (technicianId: string) => {
    try {
      setError(null);
      setSelectedTechnicianId(technicianId);
      setEvaluationType("herramientas");
      setSelectedLocker(null);
      const tech = technicians.find((t) => t.id === technicianId);
      setSelectedTechnician(tech || null);

      // Fetch assignments, tools, lockers, and last evaluation
      setIsLoading(true);
      const [assignRes, toolsRes, lockersRes, evalRes] = await Promise.all([
        fetch(`/api/assignments?technicianId=${technicianId}`),
        fetch(`/api/technicians/${technicianId}/tools`),
        fetch(`/api/technicians/${technicianId}/lockers`),
        fetch(`/api/evaluations?technicianId=${technicianId}`),
      ]);

      if (!assignRes.ok) throw new Error("Error fetching assignments");
      if (!toolsRes.ok) throw new Error("Error fetching tools");
      if (!lockersRes.ok) throw new Error("Error fetching lockers");

      const assignData = await assignRes.json();
      const toolsData = await toolsRes.json();
      const lockersData = await lockersRes.json();
      const evalData = evalRes.ok ? await evalRes.json() : [];

      setAssignments(assignData);
      setTools(toolsData);
      setLockers(lockersData);
      setEvaluationHistory(evalData);
      setLastEvaluation(evalData.length > 0 ? evalData[0] : null);
      // If there's a previous evaluation, show it in viewing mode
      if (evalData.length > 0) {
        setViewingEvaluation(evalData[0]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar datos del técnico");
      setAssignments([]);
      setEvaluationHistory([]);
      setViewingEvaluation(null);
      setTools([]);
      setLockers([]);
      setLastEvaluation(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to organize technicians
  const getTechnicianEvaluations = (technicianId: string) => {
    return allEvaluations[technicianId] || [];
  };

  const hasEvaluation = (technicianId: string) => {
    return getTechnicianEvaluations(technicianId).length > 0;
  };

  const groupBySpecialty = (techs: Technician[]) => {
    const grouped: Record<string, Technician[]> = {};
    techs.forEach((tech) => {
      if (!grouped[tech.specialty]) {
        grouped[tech.specialty] = [];
      }
      grouped[tech.specialty].push(tech);
    });
    return grouped;
  };

  const techniciansByStatus = {
    notEvaluated: technicians.filter((t) => !hasEvaluation(t.id)),
    evaluated: technicians.filter((t) => hasEvaluation(t.id)),
  };

  const handleExportEvaluation = (evaluation: Evaluation) => {
    if (!selectedTechnician) return;

    const evaluationData = evaluation.evaluationItems.map((item) => ({
      "Parte": item.tool?.partLabel || item.lockerTool?.partLabel || "-",
      "Ítem": item.assignment?.Material?.item || item.tool?.toolCatalog?.item || item.lockerTool?.toolCatalog?.item || "N/A",
      "Cantidad": item.assignment?.Material?.defaultQty || item.tool?.quantity || item.lockerTool?.quantity || "-",
      "Complemento": item.tool?.complement || item.lockerTool?.complement || item.complementObserved || "-",
      "Tiene": item.hasItem ? "Sí" : "No",
      "Limpio": item.isClean ? "Sí" : "No",
      "Observaciones": item.observations || "-",
    }));

    const date = new Date(evaluation.date);
    const fileName = `Evaluacion_${selectedTechnician.name}_${date.toLocaleDateString("es-ES").replace(/\//g, "-")}.xlsx`;

    const ws = XLSX.utils.json_to_sheet(evaluationData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Evaluación");

    // Agregar información del técnico al inicio
    XLSX.writeFile(wb, fileName);
  };

  const handleDeleteEvaluation = async (evaluation: Evaluation) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta evaluación?")) {
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      console.log("Eliminando evaluación:", evaluation.id);

      const res = await fetch(`/api/evaluations?id=${evaluation.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status:", res.status);
      const resData = await res.json();
      console.log("Response data:", resData);

      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Error al eliminar evaluación");
      }

      setSuccess("Evaluación eliminada exitosamente");
      setViewingEvaluation(null);
      
      // Recargar datos del técnico
      if (selectedTechnicianId) {
        setTimeout(() => {
          handleTechnicianSelect(selectedTechnicianId);
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al eliminar evaluación";
      console.error("Error al eliminar:", err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationSubmit = async (items: EvaluationItemState[], observations: string, supervisorName: string) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianId: selectedTechnicianId,
          observations,
          evaluatorName: supervisorName,
          items,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Error al guardar evaluación");
      }

      setSuccess("Evaluación guardada exitosamente");
      setTimeout(() => {
        setSuccess(null);
        setSelectedTechnicianId(null);
        setSelectedTechnician(null);
        setAssignments([]);
        setTools([]);
        setLockers([]);
        setSelectedLocker(null);
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar evaluación";
      console.error("Error:", err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Evaluación de Técnicos
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Evalúa los materiales y herramientas de tu técnico
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}

        {!selectedTechnicianId ? (
          <Card>
            <CardHeader>
              <CardTitle>Selecciona un Técnico</CardTitle>
              <CardDescription>
                Elige al técnico que deseas evaluar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {technicians.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No hay técnicos registrados
                  </p>
                  <Button variant="outline" disabled>
                    Crear Técnico Primero
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Evaluados Section */}
                  {techniciansByStatus.evaluated.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg text-green-700 mb-4 border-b-2 border-green-300 pb-2">
                        Evaluados
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(groupBySpecialty(techniciansByStatus.evaluated)).map(
                          ([specialty, techs]) => (
                            <div key={specialty}>
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                {specialty}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-2">
                                {techs.map((tech) => {
                                  const evals = getTechnicianEvaluations(tech.id);
                                  const lastEval = evals[0];
                                  return (
                                    <button
                                      key={tech.id}
                                      onClick={() => {
                                        handleTechnicianSelect(tech.id);
                                      }}
                                      disabled={isLoading}
                                      className="p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 hover:border-green-400 transition-colors text-left disabled:opacity-50"
                                    >
                                      <p className="font-semibold text-gray-900 text-sm">
                                        {tech.name}
                                      </p>
                                      {lastEval && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {new Date(lastEval.date).toLocaleDateString("es-ES", {
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </p>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Por Evaluar Section */}
                  {techniciansByStatus.notEvaluated.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg text-yellow-700 mb-4 border-b-2 border-yellow-300 pb-2">
                        Por Evaluar
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(groupBySpecialty(techniciansByStatus.notEvaluated)).map(
                          ([specialty, techs]) => (
                            <div key={specialty}>
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                {specialty}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-2">
                                {techs.map((tech) => (
                                  <button
                                    key={tech.id}
                                    onClick={() => {
                                      setViewingEvaluation(null);
                                      handleTechnicianSelect(tech.id);
                                    }}
                                    disabled={isLoading}
                                    className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:border-yellow-400 transition-colors text-left disabled:opacity-50"
                                  >
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {tech.name}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : selectedTechnician ? (
          <div className="space-y-6">
            {/* Last Evaluation Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Última revisión:</span>{" "}
                  {lastEvaluation ? (
                    <>
                      {new Date(lastEvaluation.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      por {lastEvaluation.evaluatorName || "evaluador"}
                    </>
                  ) : (
                    "sin registro"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Previous Evaluations */}
            {evaluationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historial de Evaluaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evaluationHistory.map((evaluation, idx) => (
                    <div
                      key={evaluation.id}
                      className={`p-3 border rounded-lg cursor-pointer transition ${viewingEvaluation?.id === evaluation.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      onClick={() => setViewingEvaluation(evaluation)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {idx === 0 ? "Última evaluación" : `Evaluación ${evaluationHistory.length - idx}`}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(evaluation.date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            por {evaluation.evaluatorName || "evaluador"}
                          </p>
                        </div>
                        {viewingEvaluation?.id === evaluation.id && (
                          <span className="text-blue-600 text-sm font-medium">Viendo</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Technician Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedTechnician.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedTechnician.specialty}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTechnicianId(null);
                  setSelectedTechnician(null);
                  setAssignments([]);
                  setTools([]);
                  setLockers([]);
                  setSelectedLocker(null);
                }}
              >
                Cambiar Técnico
              </Button>
            </div>

            {/* View Previous Evaluation */}
            {viewingEvaluation && (
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Evaluación Anterior</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportEvaluation(viewingEvaluation)}
                      >
                        Descargar Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEvaluation(viewingEvaluation)}
                        disabled={isLoading}
                      >
                        Eliminar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingEvaluation(null)}
                      >
                        Nueva Evaluación
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {new Date(viewingEvaluation.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    por {viewingEvaluation.evaluatorName || "evaluador"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {viewingEvaluation.evaluationItems.length === 0 ? (
                    <p className="text-sm text-gray-600">Sin ítems evaluados</p>
                  ) : (
                    <div className="space-y-3">
                      {viewingEvaluation.evaluationItems.map((item) => {
                        const itemName =
                          item.assignment?.Material?.item ||
                          item.tool?.toolCatalog?.item ||
                          item.lockerTool?.toolCatalog?.item ||
                          "Ítem";
                        const partLabel = item.tool?.partLabel || item.lockerTool?.partLabel || "-";
                        const quantity = item.assignment?.Material?.defaultQty || item.tool?.quantity || item.lockerTool?.quantity || "-";
                        const complement = item.tool?.complement || item.lockerTool?.complement || "-";

                        return (
                          <div key={item.id} className="p-3 border border-amber-200 rounded-lg bg-white text-sm">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{itemName}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                                  <div>
                                    <span className="font-semibold">Parte:</span> {partLabel}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Cantidad:</span> {quantity}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-semibold">Complemento:</span> {complement}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 text-xs ml-2">
                                {item.hasItem ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Tiene</span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded">No tiene</span>
                                )}
                                {item.isClean && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Limpio</span>
                                )}
                              </div>
                            </div>
                            {item.observations && (
                              <p className="text-xs text-gray-700">
                                <strong>Obs:</strong> {item.observations}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {viewingEvaluation.observations && (
                    <div className="pt-3 border-t border-amber-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Observaciones Generales:</p>
                      <p className="text-sm text-gray-700 italic">{viewingEvaluation.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Evaluation Type Tabs */}
            {!viewingEvaluation && (
              <>
                <div className="flex gap-2 border-b border-gray-200 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluationType("herramientas");
                      setSelectedLocker(null);
                    }}
                    className={`px-3 py-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${evaluationType === "herramientas"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Herramientas ({tools.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationType("casilleros")}
                    className={`px-3 py-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${evaluationType === "casilleros"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Casilleros ({lockers.length})
                  </button>
                </div>

                {/* Herramientas Tab */}
                {evaluationType === "herramientas" && (
                  <>
                    {assignments.length === 0 && tools.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <p className="text-gray-600">
                              Este técnico no tiene materiales ni herramientas asignadas
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <EvaluationForm
                        technicianId={selectedTechnicianId}
                        technicianName={selectedTechnician.name}
                        assignments={assignments}
                        tools={tools}
                        onSubmit={handleEvaluationSubmit}
                        isLoading={isLoading}
                      />
                    )}
                  </>
                )}

                {/* Casilleros Tab */}
                {evaluationType === "casilleros" && (
                  <>
                    {lockers.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <p className="text-gray-600">
                              Este técnico no tiene casilleros registrados
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : !selectedLocker ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Selecciona un Casillero</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {lockers.map((locker) => (
                              <button
                                key={locker.id}
                                onClick={() => setSelectedLocker(locker)}
                                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                              >
                                <p className="font-semibold text-gray-900 text-sm">{locker.name}</p>
                                <p className="text-xs text-gray-600">
                                  {locker.tools.length} herramienta{locker.tools.length !== 1 ? "s" : ""}
                                </p>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {selectedLocker.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedLocker.tools.length} herramienta{selectedLocker.tools.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLocker(null)}
                          >
                            Cambiar Casillero
                          </Button>
                        </div>

                        {selectedLocker.tools.length === 0 ? (
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center py-8">
                                <p className="text-gray-600">
                                  Este casillero no tiene herramientas
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <EvaluationForm
                            technicianId={selectedTechnicianId}
                            technicianName={`${selectedTechnician.name} - ${selectedLocker.name}`}
                            assignments={[]}
                            tools={selectedLocker.tools}
                            onSubmit={handleEvaluationSubmit}
                            isLoading={isLoading}
                            useLockerTools={true}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
