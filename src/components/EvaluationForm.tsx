"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

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

interface EvaluationItemState {
  assignmentId?: string;
  toolId?: string;
  hasItem: boolean;
  isClean: boolean;
  quantityObserved?: number;
  complementObserved?: string;
  observations?: string;
}

interface EvaluationFormProps {
  technicianId: string;
  technicianName: string;
  assignments: Assignment[];
  tools?: Tool[];
  onSubmit: (items: EvaluationItemState[], observations: string, supervisorName: string) => Promise<void>;
  isLoading?: boolean;
  useLockerTools?: boolean;
}

export function EvaluationForm({
  technicianId,
  technicianName,
  assignments,
  tools = [],
  onSubmit,
  isLoading = false,
  useLockerTools = false,
}: EvaluationFormProps) {
  const [items, setItems] = useState<EvaluationItemState[]>([
    ...assignments.map((a) => ({
      assignmentId: a.id,
      hasItem: false,
      isClean: false,
      observations: "",
    })),
    ...tools.map((t) => ({
      ...(useLockerTools ? { lockerToolId: t.id } : { toolId: t.id }),
      hasItem: false,
      isClean: false,
      observations: "",
    })),
  ]);
  const [supervisorName, setSupervisorName] = useState("");
  const [observations, setObservations] = useState("");
  const [activeTab, setActiveTab] = useState<"materials" | "tools">("materials");
  const [error, setError] = useState<string | null>(null);

  const handleItemChange = (
    itemId: string,
    field: keyof EvaluationItemState,
    value: any,
    isAssignment: boolean
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        const itemKey = isAssignment ? item.assignmentId : item.toolId;
        return itemKey === itemId ? { ...item, [field]: value } : item;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supervisorName.trim()) {
      setError("El nombre del supervisor es requerido");
      return;
    }

    try {
      await onSubmit(items, observations, supervisorName);
      setSupervisorName("");
      setObservations("");
      setItems([
        ...assignments.map((a) => ({
          assignmentId: a.id,
          hasItem: false,
          isClean: false,
          observations: "",
        })),
        ...tools.map((t) => ({
          ...(useLockerTools ? { lockerToolId: t.id } : { toolId: t.id }),
          hasItem: false,
          isClean: false,
          observations: "",
        })),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar evaluación"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{technicianName}</CardTitle>
          <CardDescription>
            {assignments.length} material{assignments.length !== 1 ? "es" : ""} | {tools.length} herramienta{tools.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs for Materials and Tools */}
      {assignments.length > 0 && tools.length > 0 && (
        <div className="flex gap-2 border-b border-gray-200 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={`px-3 py-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${activeTab === "materials"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Materiales ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            className={`px-3 py-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${activeTab === "tools"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Herramientas ({tools.length})
          </button>
        </div>
      )}

      {/* Materials Evaluation */}
      {assignments.length > 0 && (activeTab === "materials" || tools.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluación de Materiales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              if (!item.assignmentId) return null;
              const assignment = assignments.find((a) => a.id === item.assignmentId);
              if (!assignment) return null;

              return (
                <div
                  key={item.assignmentId}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* Header with Material Name */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {assignment.Material.item}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        N°: {assignment.Material.number}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Cantidad</p>
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.Material.defaultQty}
                      </p>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        ¿Tiene el material?
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleItemChange(item.assignmentId!, "hasItem", !item.hasItem, true)
                        }
                        className="focus:outline-none"
                      >
                        {item.hasItem ? (
                          <CheckCircle2 size={24} className="text-green-500" />
                        ) : (
                          <Circle size={24} className="text-gray-300" />
                        )}
                      </button>
                    </div>

                    {item.hasItem && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          ¿Está limpio?
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleItemChange(item.assignmentId!, "isClean", !item.isClean, true)
                          }
                          className="focus:outline-none"
                        >
                          {item.isClean ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <Circle size={24} className="text-gray-300" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Observations for this item */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={item.observations || ""}
                      onChange={(e) =>
                        handleItemChange(item.assignmentId!, "observations", e.target.value, true)
                      }
                      placeholder="Notas sobre este material..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Tools Evaluation */}
      {tools.length > 0 && (activeTab === "tools" || assignments.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluación de Herramientas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              if (!item.toolId) return null;
              const tool = tools.find((t) => t.id === item.toolId);
              if (!tool) return null;

              return (
                <div
                  key={item.toolId}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* Header with Tool Name */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {tool.toolCatalog.item}
                    </h4>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Parte</p>
                      <p className="text-sm font-medium text-gray-900">
                        {tool.partLabel || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Cantidad</p>
                      <p className="text-sm font-medium text-gray-900">
                        {tool.quantity}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600 font-medium">Complemento</p>
                      <p className="text-sm font-medium text-gray-900">
                        {tool.complement || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        ¿Tiene la herramienta?
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleItemChange(item.toolId!, "hasItem", !item.hasItem, false)
                        }
                        className="focus:outline-none"
                      >
                        {item.hasItem ? (
                          <CheckCircle2 size={24} className="text-green-500" />
                        ) : (
                          <Circle size={24} className="text-gray-300" />
                        )}
                      </button>
                    </div>

                    {item.hasItem && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          ¿Está limpia?
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleItemChange(item.toolId!, "isClean", !item.isClean, false)
                          }
                          className="focus:outline-none"
                        >
                          {item.isClean ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <Circle size={24} className="text-gray-300" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Observations for this item */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={item.observations || ""}
                      onChange={(e) =>
                        handleItemChange(item.toolId!, "observations", e.target.value, false)
                      }
                      placeholder="Notas sobre esta herramienta..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Observations Field */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Escribe cualquier observación sobre la evaluación..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Supervisor Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Información del Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Nombre del Supervisor
            </label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || (assignments.length === 0 && tools.length === 0)}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Guardando..." : "Guardar Evaluación"}
      </Button>
    </form>
  );
}
