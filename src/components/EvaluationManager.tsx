'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EvaluationForm } from './EvaluationForm';
import { CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

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
    quantity: number;
    partLabel?: string;
    complement?: string;
    fromLocker?: boolean;
    lockerToolId?: string;
    lockerName?: string;
}

interface LockerTool {
    id: string;
    toolCatalog: {
        item: string;
    };
    quantity: number;
    partLabel?: string;
    complement?: string;
}

interface Locker {
    id: string;
    name: string;
    tools: LockerTool[];
}

interface Evaluation {
    id: string;
    date: string;
    evaluatorName?: string;
    observations?: string;
}

interface EvaluationManagerProps {
    technicianId: string;
    technicianName: string;
}

export default function EvaluationManager({ technicianId, technicianName }: EvaluationManagerProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [lockers, setLockers] = useState<Locker[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [technicianId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [assignRes, toolsRes, lockersRes, evalRes] = await Promise.all([
                fetch(`/api/assignments?technicianId=${technicianId}`),
                fetch(`/api/technicians/${technicianId}/tools`),
                fetch(`/api/technicians/${technicianId}/lockers`),
                fetch(`/api/evaluations?technicianId=${technicianId}`),
            ]);

            if (assignRes.ok) {
                const data = await assignRes.json();
                setAssignments(data || []);
            }

            if (toolsRes.ok) {
                const data = await toolsRes.json();
                setTools(data || []);
            }

            if (lockersRes.ok) {
                const data = await lockersRes.json();
                setLockers(data || []);
            }

            if (evalRes.ok) {
                const data = await evalRes.json();
                setEvaluations(data || []);
            }
        } catch (err) {
            console.error('Error fetching evaluation data:', err);
            setError('Error al cargar datos para la evaluación');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluationSubmit = async (
        items: any[],
        observations: string,
        supervisorName: string
    ) => {
        try {
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/evaluations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    technicianId,
                    evaluatorName: supervisorName,
                    observations,
                    evaluationItems: items,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al guardar evaluación');
            }

            setSuccess('Evaluación guardada exitosamente');
            setIsEvaluating(false);
            await fetchData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            console.error('Error submitting evaluation:', err);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando evaluaciones...</div>;
    }

    if (isEvaluating) {
        return (
            <div className="space-y-6">
                <Button
                    onClick={() => setIsEvaluating(false)}
                    variant="outline"
                    className="mb-4"
                >
                    ← Volver
                </Button>

                {error && (
                    <Card className="p-4 bg-red-50 border-red-200">
                        <p className="text-red-700">{error}</p>
                    </Card>
                )}

                <EvaluationForm
                    technicianId={technicianId}
                    technicianName={technicianName}
                    assignments={assignments}
                    tools={tools}
                    onSubmit={handleEvaluationSubmit}
                    isLoading={false}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                </Card>
            )}

            {success && (
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 size={20} />
                        {success}
                    </div>
                </Card>
            )}

            <div className="flex justify-end">
                <Button
                    onClick={() => setIsEvaluating(true)}
                    className="flex items-center gap-2"
                >
                    ✓ Nueva Evaluación
                </Button>
            </div>

            {evaluations.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>No hay evaluaciones registradas para este técnico</p>
                    <p className="text-sm mt-2">Crea una nueva evaluación para comenzar</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Historial de Evaluaciones</h3>
                    {evaluations.map((evaluation) => (
                        <Card key={evaluation.id} className="p-4">
                            <button
                                onClick={() => setExpandedEvaluation(expandedEvaluation === evaluation.id ? null : evaluation.id)}
                                className="w-full flex items-center justify-between hover:bg-gray-50 rounded p-2 -m-2"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <CheckCircle2 size={20} className="text-green-600" />
                                    <div className="text-left">
                                        <p className="font-semibold">
                                            {new Date(evaluation.date).toLocaleDateString('es-ES')}
                                        </p>
                                        {evaluation.evaluatorName && (
                                            <p className="text-sm text-gray-600">Evaluador: {evaluation.evaluatorName}</p>
                                        )}
                                    </div>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`transition-transform ${expandedEvaluation === evaluation.id ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {expandedEvaluation === evaluation.id && evaluation.observations && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Observaciones:</span>
                                    </p>
                                    <p className="text-gray-700 mt-2">{evaluation.observations}</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
                <Card className="p-4 bg-blue-50">
                    <p className="font-semibold text-blue-900">{assignments.length}</p>
                    <p className="text-blue-700">Materiales Asignados</p>
                </Card>
                <Card className="p-4 bg-purple-50">
                    <p className="font-semibold text-purple-900">{tools.length}</p>
                    <p className="text-purple-700">Herramientas</p>
                </Card>
            </div>
        </div>
    );
}
