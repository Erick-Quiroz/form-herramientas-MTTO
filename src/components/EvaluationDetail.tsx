'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EvaluationForm } from '@/components/EvaluationForm';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

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
  fromLocker?: boolean;
  lockerToolId?: string;
  lockerName?: string;
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

interface EvaluationDetailProps {
  technicianId: string;
  onBack: () => void;
}

export default function EvaluationDetail({ technicianId, onBack }: EvaluationDetailProps) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [lockers, setLockers] = useState<any[]>([]);
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null);
  const [isCreatingEvaluation, setIsCreatingEvaluation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [technicianId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [techRes, assignRes, toolsRes, lockersRes, evalRes] = await Promise.all([
        fetch(`/api/technicians/${technicianId}`),
        fetch(`/api/assignments?technicianId=${technicianId}`),
        fetch(`/api/technicians/${technicianId}/tools`),
        fetch(`/api/technicians/${technicianId}/lockers`),
        fetch(`/api/evaluations?technicianId=${technicianId}`),
      ]);

      if (techRes.ok) {
        setTechnician(await techRes.json());
      }

      if (assignRes.ok) {
        setAssignments(await assignRes.json());
      }

      let allTools: Tool[] = [];

      if (toolsRes.ok) {
        const directTools = await toolsRes.json();
        allTools = [...directTools];
      }

      if (lockersRes.ok) {
        const lockersData = await lockersRes.json();
        console.log('Casilleros cargados:', lockersData);
        setLockers(lockersData);

        // Extraer herramientas de casilleros y combinar con herramientas asignadas
        const lockerTools = lockersData.flatMap((locker: any) => {
          console.log('Procesando casillero:', locker.name, 'herramientas:', locker.tools);
          return locker.tools
            ? locker.tools.map((tool: any) => ({
                ...tool,
                lockerToolId: tool.id,
                fromLocker: true,
                lockerName: locker.name,
              }))
            : [];
        });

        console.log('Herramientas de casilleros extraídas:', lockerTools);
        allTools = [...allTools, ...lockerTools];
      }

      setTools(allTools);
      console.log('Todas las herramientas a mostrar:', allTools);

      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setEvaluationHistory(evalData);
        setLastEvaluation(evalData.length > 0 ? evalData[0] : null);
        if (evalData.length > 0) {
          setViewingEvaluation(evalData[0]);
        }
      }
    } catch (err) {
      setError('Error al cargar datos');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportEvaluation = async (evaluation: Evaluation) => {
    if (!technician) return;

    const workbook = new ExcelJS.Workbook();

    // Separar herramientas directas y de casilleros
    const directTools = evaluation.evaluationItems.filter(item => !item.lockerTool);
    const lockerItems = evaluation.evaluationItems.filter(item => item.lockerTool);
    
    // Agrupar items por casillero
    const itemsByLocker = new Map<string, typeof evaluation.evaluationItems>();
    
    lockerItems.forEach(item => {
      const lockerName = item.lockerTool?.id || 'Unknown';
      if (!itemsByLocker.has(lockerName)) {
        itemsByLocker.set(lockerName, []);
      }
      itemsByLocker.get(lockerName)?.push(item);
    });

    // Estilos
    const headerStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } },
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'medium', color: { argb: 'FF4F46E5' } },
        bottom: { style: 'medium', color: { argb: 'FF4F46E5' } },
        left: { style: 'thin', color: { argb: 'FF4F46E5' } },
        right: { style: 'thin', color: { argb: 'FF4F46E5' } },
      },
    };

    const oddRowStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } },
      font: { size: 11, color: { argb: 'FF1F2937' } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      },
    };

    const evenRowStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
      font: { size: 11, color: { argb: 'FF1F2937' } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      },
    };

    // Función helper para crear una hoja
    const createEvaluationSheet = (items: typeof evaluation.evaluationItems, sheetName: string) => {
      const worksheet = workbook.addWorksheet(sheetName);

      // Encabezados
      const headers = ['Ítem', 'Parte', 'Cantidad', 'Complemento', 'Tiene', 'Limpio', 'Observaciones'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle as any;
      });

      // Datos
      items.forEach((item, idx) => {
        const rowData = [
          item.assignment?.Material?.item || item.tool?.toolCatalog?.item || item.lockerTool?.toolCatalog?.item || 'N/A',
          item.tool?.partLabel || item.lockerTool?.partLabel || '-',
          item.assignment?.Material?.defaultQty || item.tool?.quantity || item.lockerTool?.quantity || '-',
          item.tool?.complement || item.lockerTool?.complement || item.complementObserved || '-',
          item.hasItem ? '✓' : '✗',
          item.isClean ? '✓' : '✗',
          item.observations || '-',
        ];

        const row = worksheet.addRow(rowData);
        const style = idx % 2 === 0 ? oddRowStyle : evenRowStyle;
        row.eachCell((cell) => {
          cell.style = style as any;
        });
      });

      // Ajustar ancho de columnas
      worksheet.columns = [
        { width: 25 }, // Ítem
        { width: 12 }, // Parte
        { width: 10 }, // Cantidad
        { width: 15 }, // Complemento
        { width: 8 },  // Tiene
        { width: 8 },  // Limpio
        { width: 30 }, // Observaciones
      ];
    };

    // Crear hoja de herramientas directas
    if (directTools.length > 0) {
      createEvaluationSheet(directTools, 'Herramientas');
    }

    // Crear hojas por casillero
    let lockerNumber = 1;
    itemsByLocker.forEach((items, lockerId) => {
      const sheetName = `Casillero-${lockerNumber}`;
      createEvaluationSheet(items, sheetName);
      lockerNumber++;
    });

    const date = new Date(evaluation.date);
    const fileName = `Evaluacion_${technician.name}_${date.toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`;

    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleDeleteEvaluation = async (evaluation: Evaluation) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evaluación?')) {
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const res = await fetch(`/api/evaluations?id=${evaluation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Error al eliminar evaluación');
      }

      setSuccess('Evaluación eliminada exitosamente');
      setViewingEvaluation(null);
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationSubmit = async (
    items: EvaluationItemState[],
    observations: string,
    supervisorName: string
  ) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId,
          observations,
          evaluatorName: supervisorName,
          items,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al guardar evaluación');
      }

      setSuccess('Evaluación guardada exitosamente');
      setIsCreatingEvaluation(false);
      setTimeout(() => {
        fetchData();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !technician) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  if (!technician) {
    return <div className="p-8 text-center text-red-600">Técnico no encontrado</div>;
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto p-6">
        <Button onClick={onBack} variant="outline" className="mb-6 flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver
        </Button>

        <Card className="p-6 border border-gray-200 bg-white shadow-sm rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{technician.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Especialidad:</span>
                <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {technician.specialty}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl">👤</div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6 flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 mb-6 flex items-start gap-3">
            <span className="text-xl">✓</span>
            <div>
              <p className="font-semibold">Guardado exitosamente</p>
              <p className="text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 bg-amber-50 border-amber-300">
            <CardHeader>
              <CardTitle className="text-sm text-amber-900">🔍 Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-800 space-y-1">
              <p>👤 Técnico: {technician?.name} (ID: {technicianId})</p>
              <p>📋 Materiales: {assignments.length}</p>
              <p>🔧 Herramientas directas: {tools.filter(t => !t.fromLocker).length}</p>
              <p>📦 Casilleros: {lockers.length}</p>
              <p>📦 Herramientas de casilleros: {tools.filter(t => t.fromLocker).length}</p>
              <p>⚙️ Total herramientas: {tools.length}</p>
            </CardContent>
          </Card>
        )}

        {!viewingEvaluation ? (
          <div className="space-y-6">
            {!isCreatingEvaluation && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setIsCreatingEvaluation(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 font-medium shadow-sm"
                >
                  + Nueva Evaluación
                </Button>
              </div>
            )}

            {isCreatingEvaluation ? (
              <div className="space-y-4">
                <Button
                  onClick={() => setIsCreatingEvaluation(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  ← Volver al Historial
                </Button>
                <EvaluationForm
                  technicianId={technicianId}
                  technicianName={technician?.name || ''}
                  assignments={assignments}
                  tools={tools}
                  onSubmit={handleEvaluationSubmit}
                />
              </div>
            ) : (
              <>
                {evaluationHistory.length > 0 ? (
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Historial de Evaluaciones</h3>
                    <div className="space-y-3">
                      {evaluationHistory.map((evaluation, idx) => (
                        <div 
                          key={evaluation.id} 
                          className="p-5 border border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md cursor-pointer transition-all rounded-lg"
                          onClick={() => setViewingEvaluation(evaluation)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold w-12 h-12 flex items-center justify-center rounded-lg shadow-md">
                                {evaluationHistory.length - idx}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {new Date(evaluation.date).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                                {evaluation.evaluatorName && (
                                  <p className="text-sm text-gray-600">Evaluador: <span className="font-semibold text-gray-900">{evaluation.evaluatorName}</span></p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {evaluation.evaluationItems.length} ítems evaluados
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400 transition">Ver Detalles →</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center border border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <p className="text-gray-700 font-semibold mb-2">📋 Sin Evaluaciones</p>
                    <p className="text-gray-600 text-sm">No hay evaluaciones registradas para este técnico</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button onClick={() => setViewingEvaluation(null)} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                ← Volver al historial
              </Button>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleExportEvaluation(viewingEvaluation)} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-medium shadow-sm"
                >
                  📥 Exportar Excel
                </Button>
                <Button 
                  onClick={() => handleDeleteEvaluation(viewingEvaluation)} 
                  className="bg-rose-600 hover:bg-rose-700 text-white border-0 font-medium shadow-sm"
                >
                  🗑️ Eliminar
                </Button>
              </div>
            </div>

            <Card className="p-6 border border-gray-200 bg-white shadow-md rounded-lg">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-bold text-2xl text-gray-900 mb-4">
                  📅 Evaluación del {new Date(viewingEvaluation.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>

                {viewingEvaluation.evaluatorName && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-600 font-medium">👤 Evaluador:</span>
                    <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {viewingEvaluation.evaluatorName}
                    </span>
                  </div>
                )}

                {viewingEvaluation.observations && (
                  <div className="bg-amber-50 p-4 border border-amber-200 rounded-lg mt-4">
                    <p className="font-semibold text-amber-900 mb-2">💡 Observaciones Generales</p>
                    <p className="text-amber-900 text-sm leading-relaxed">{viewingEvaluation.observations}</p>
                  </div>
                )}
              </div>

              {/* Tabla mejorada */}
              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Evaluación de Herramientas</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th className="p-4 text-left font-bold">Ítem</th>
                        <th className="p-4 text-left font-bold">Tipo</th>
                        <th className="p-4 text-left font-bold">Parte</th>
                        <th className="p-4 text-center font-bold">Cantidad</th>
                        <th className="p-4 text-left font-bold">Complemento</th>
                        <th className="p-4 text-center font-bold">Tiene</th>
                        <th className="p-4 text-center font-bold">Limpio</th>
                        <th className="p-4 text-left font-bold">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingEvaluation.evaluationItems.map((item, idx) => {
                        const itemName = item.assignment?.Material?.item || item.tool?.toolCatalog?.item || item.lockerTool?.toolCatalog?.item || 'N/A';
                        const partLabel = item.tool?.partLabel || item.lockerTool?.partLabel || '-';
                        const quantity = item.assignment?.Material?.defaultQty || item.tool?.quantity || item.lockerTool?.quantity || '-';
                        const complement = item.tool?.complement || item.lockerTool?.complement || item.complementObserved || '-';
                        const lockerInfo = item.lockerTool ? '📦 Casillero' : '-';
                        const rowBgColor = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                        return (
                          <tr key={item.id} className={`${rowBgColor} border-b border-gray-200 hover:bg-indigo-50 transition`}>
                            <td className="p-4 text-gray-900 font-semibold">{itemName}</td>
                            <td className="p-4 text-gray-700 text-xs">
                              {item.lockerTool ? (
                                <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  📦 Casillero
                                </span>
                              ) : (
                                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                                  🔧 Directo
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-gray-700">{partLabel}</td>
                            <td className="p-4 text-center text-gray-700 font-semibold">{quantity}</td>
                            <td className="p-4 text-gray-700">{complement}</td>
                            <td className="p-4 text-center">
                              {item.hasItem ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded-lg">✓</span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 font-bold rounded-lg">✗</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {item.isClean ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded-lg">✓</span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-lg">✗</span>
                              )}
                            </td>
                            <td className="p-4 text-gray-600 text-xs max-w-xs truncate" title={item.observations}>
                              {item.observations || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen de evaluación */}
              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Resumen de Evaluación</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 border border-emerald-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">Presentes</p>
                        <p className="text-emerald-900 font-bold text-4xl">
                          {viewingEvaluation.evaluationItems.filter(i => i.hasItem).length}
                        </p>
                      </div>
                      <span className="text-5xl opacity-80">✓</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 border border-rose-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-2">Faltantes</p>
                        <p className="text-rose-900 font-bold text-4xl">
                          {viewingEvaluation.evaluationItems.filter(i => !i.hasItem).length}
                        </p>
                      </div>
                      <span className="text-5xl opacity-80">✗</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-5 border border-sky-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sky-600 text-xs font-semibold uppercase tracking-wider mb-2">Limpios</p>
                        <p className="text-sky-900 font-bold text-4xl">
                          {viewingEvaluation.evaluationItems.filter(i => i.isClean).length}
                        </p>
                      </div>
                      <span className="text-5xl opacity-80">🧹</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-5 border border-violet-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-violet-600 text-xs font-semibold uppercase tracking-wider mb-2">Estado General</p>
                        <p className="text-violet-900 font-bold text-4xl">
                          {Math.round((viewingEvaluation.evaluationItems.filter(i => i.hasItem && i.isClean).length / viewingEvaluation.evaluationItems.length) * 100)}%
                        </p>
                      </div>
                      <span className="text-5xl opacity-80">📊</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
