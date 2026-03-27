"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function ReportsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await fetch("/api/evaluations");
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data);
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let totalEvaluations = evaluations.length;
    let totalItems = 0;
    let conformeItems = 0;

    evaluations.forEach((evaluation: any) => {
      evaluation.evaluationItems?.forEach((item: any) => {
        totalItems++;
        if (item.hasItem && item.isClean) {
          conformeItems++;
        }
      });
    });

    return {
      totalEvaluations,
      totalItems,
      conformeItems,
      nonConformeItems: totalItems - conformeItems,
      conformanceRate: totalItems > 0 ? Math.round((conformeItems / totalItems) * 100) : 0,
    };
  };

  const stats = calculateStats();

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes e Historial
          </h1>
          <p className="text-gray-600">
            Visualiza evaluaciones pasadas y estadísticas generales
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {loading ? "-" : stats.totalEvaluations}
              </div>
              <p className="text-xs text-gray-600 mt-1">evaluaciones realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Ítems Conformes</CardTitle>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loading ? "-" : stats.conformeItems}
              </div>
              <p className="text-xs text-gray-600 mt-1">de {stats.totalItems} ítems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Ítems No Conformes</CardTitle>
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {loading ? "-" : stats.nonConformeItems}
              </div>
              <p className="text-xs text-gray-600 mt-1">requieren atención</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-900">Tasa Conformidad</CardTitle>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {loading ? "-" : `${stats.conformanceRate}%`}
              </div>
              <p className="text-xs text-blue-700 mt-1">conformidad general</p>
            </CardContent>
          </Card>
        </div>

        {/* Evaluations List */}
        {loading ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-gray-500">Cargando evaluaciones...</p>
            </CardContent>
          </Card>
        ) : evaluations.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-gray-500">No hay evaluaciones registradas aún</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Listado de Evaluaciones</h2>
            {evaluations.map((evaluation) => {
              const itemsOk = evaluation.evaluationItems?.filter((item: any) => item.hasItem && item.isClean).length || 0;
              const totalItems = evaluation.evaluationItems?.length || 0;
              const hasIssues = itemsOk < totalItems;

              return (
                <Card
                  key={evaluation.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === evaluation.id ? null : evaluation.id)
                  }
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {evaluation.technician?.name || "Técnico sin información"}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                          <p>
                            <span className="font-medium">Especialidad:</span> {evaluation.technician?.specialty}
                          </p>
                          <p>
                            <span className="font-medium">Fecha:</span>{" "}
                            {new Date(evaluation.date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                          <p className="text-xs text-gray-600">ítems evaluados</p>
                        </div>
                        {hasIssues && (
                          <div className="text-right bg-red-50 px-3 py-1 rounded">
                            <p className="text-lg font-bold text-red-600">{totalItems - itemsOk}</p>
                            <p className="text-xs text-red-700">no conformes</p>
                          </div>
                        )}
                        {!hasIssues && totalItems > 0 && (
                          <div className="text-right bg-green-50 px-3 py-1 rounded">
                            <p className="text-lg font-bold text-green-600">✓</p>
                            <p className="text-xs text-green-700">conforme</p>
                          </div>
                        )}
                        {expandedId === evaluation.id ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedId === evaluation.id && evaluation.evaluationItems && evaluation.evaluationItems.length > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Detalles de Ítems</h4>
                      <div className="space-y-2">
                        {evaluation.evaluationItems.map((item: any, idx: number) => (
                          <div
                            key={item.id}
                            className="p-2 bg-white border border-gray-200 rounded text-sm flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-900">Ítem {idx + 1}</p>
                              <div className="text-xs text-gray-600 mt-1">
                                {item.hasItem && item.isClean ? (
                                  <span className="text-green-600">✓ Presente y limpio</span>
                                ) : (
                                  <>
                                    {!item.hasItem && <span className="block text-red-600">✗ Falta artículo</span>}
                                    {item.hasItem && !item.isClean && <span className="block text-red-600">✗ No está limpio</span>}
                                  </>
                                )}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${item.hasItem && item.isClean
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >
                              {item.hasItem && item.isClean ? "OK" : "PROBLEMA"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
