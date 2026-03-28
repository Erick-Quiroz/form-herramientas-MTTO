'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  specialty: string;
}

interface Evaluation {
  id: string;
  date: string;
  evaluatorName?: string;
}

interface EvaluationsMap {
  [key: string]: Evaluation[];
}

export default function EvaluationPage() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<EvaluationsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const techRes = await fetch('/api/technicians');
      if (!techRes.ok) throw new Error('Error al cargar técnicos');

      const techData = await techRes.json();
      setTechnicians(techData);

      // Fetch evaluations for all technicians
      const evaluationsData: EvaluationsMap = {};
      await Promise.all(
        techData.map(async (tech: Technician) => {
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
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupBySpecialty = (techs: Technician[]) => {
    const grouped: { [key: string]: Technician[] } = {};
    techs.forEach((tech) => {
      if (!grouped[tech.specialty]) {
        grouped[tech.specialty] = [];
      }
      grouped[tech.specialty].push(tech);
    });
    return grouped;
  };

  const hasEvaluations = (technicianId: string) => {
    return (allEvaluations[technicianId] || []).length > 0;
  };

  const getLastEvaluationDate = (technicianId: string) => {
    const evals = allEvaluations[technicianId];
    if (!evals || evals.length === 0) return null;
    return new Date(evals[0].date).toLocaleDateString('es-ES');
  };

  const techniciansByStatus = {
    evaluated: technicians.filter((t) => hasEvaluations(t.id)),
    notEvaluated: technicians.filter((t) => !hasEvaluations(t.id)),
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="max-w-6xl mx-auto p-6">
          <div className="p-8 text-center text-gray-500">Cargando técnicos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluaciones de Técnicos</h1>
          <p className="text-gray-600">Selecciona un técnico para crear o ver evaluaciones</p>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              {error}
            </div>
          </Card>
        )}

        {technicians.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p className="text-lg">No hay técnicos registrados</p>
            <p className="text-sm mt-2">Crea técnicos primero en la sección de Técnicos</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Evaluados */}
            {techniciansByStatus.evaluated.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-green-300">
                  <CheckCircle2 size={24} className="text-green-600" />
                  <h2 className="text-xl font-bold text-green-700">Evaluados</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(groupBySpecialty(techniciansByStatus.evaluated)).map(
                    ([specialty, techs]) => (
                      <div key={specialty}>
                        <p className="text-sm font-semibold text-gray-700 mb-3">{specialty}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-2">
                          {techs.map((tech) => (
                            <Card
                              key={tech.id}
                              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => router.push(`/evaluation/${tech.id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Última evaluación: {getLastEvaluationDate(tech.id)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/evaluation/${tech.id}`);
                                  }}
                                >
                                  <ArrowRight size={16} />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Por Evaluar */}
            {techniciansByStatus.notEvaluated.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-yellow-300">
                  <AlertCircle size={24} className="text-yellow-600" />
                  <h2 className="text-xl font-bold text-yellow-700">Por Evaluar</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(groupBySpecialty(techniciansByStatus.notEvaluated)).map(
                    ([specialty, techs]) => (
                      <div key={specialty}>
                        <p className="text-sm font-semibold text-gray-700 mb-3">{specialty}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-2">
                          {techs.map((tech) => (
                            <Card
                              key={tech.id}
                              className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-yellow-50 border-yellow-200"
                              onClick={() => router.push(`/evaluation/${tech.id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                                  <p className="text-sm text-yellow-700 mt-1">Sin evaluaciones</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/evaluation/${tech.id}`);
                                  }}
                                >
                                  <ArrowRight size={16} />
                                </Button>
                              </div>
                            </Card>
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
      </div>
    </div>
  );
}
