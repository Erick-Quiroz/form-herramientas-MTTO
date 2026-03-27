'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TechnicianDetail from './TechnicianDetail';
import { TechnicianFormModal } from './TechnicianFormModal';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';
import { toastConfirm, toastError, toastSuccess } from '@/lib/toast';

interface Technician {
  id: string;
  name: string;
  initial?: string;
  specialty: string;
  employeeCode?: string;
}

interface TechnicianListInteractiveProps {
  onTechnicianUpdated?: () => void;
}

export default function TechnicianListInteractive({ onTechnicianUpdated }: TechnicianListInteractiveProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/technicians');
      if (response.ok) {
        setTechnicians(await response.json());
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toastConfirm('¿Está seguro de eliminar este técnico?', async () => {
      try {
        const response = await fetch(`/api/technicians/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchTechnicians();
          if (selectedTechnicianId === id) {
            setSelectedTechnicianId(null);
          }
          toastSuccess('Técnico eliminado exitosamente');
        } else {
          toastError('Error al eliminar técnico');
        }
      } catch (error) {
        console.error('Error deleting technician:', error);
        toastError('Error al eliminar técnico');
      }
    });
  };

  const handleEditSubmit = async (data: { name: string; initial: string; specialty: string; employeeCode: string }) => {
    if (!editingTechnician) return;

    try {
      const response = await fetch(`/api/technicians/${editingTechnician.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchTechnicians();
        setEditingTechnician(null);
        setIsEditModalOpen(false);
        onTechnicianUpdated?.();
      }
    } catch (error) {
      console.error('Error updating technician:', error);
      throw error;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando técnicos...</div>;
  }

  if (selectedTechnicianId) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setSelectedTechnicianId(null)}
          variant="outline"
          className="mb-4"
        >
          ← Volver a la lista
        </Button>
        <TechnicianDetail
          technicianId={selectedTechnicianId}
          onClose={() => setSelectedTechnicianId(null)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {technicians.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No hay técnicos registrados</p>
            <p className="text-sm">Crea uno usando el botón "Nuevo Técnico"</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {technicians.map((tech) => (
              <Card
                key={tech.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
                    onClick={() => setSelectedTechnicianId(tech.id)}
                  >
                    <h3 className="font-semibold text-lg text-gray-900">{tech.name}</h3>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      {tech.initial && (
                        <p>
                          <span className="font-medium">Inicial:</span> {tech.initial}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Especialidad:</span> {tech.specialty}
                      </p>
                      {tech.employeeCode && (
                        <p>
                          <span className="font-medium">Código:</span> {tech.employeeCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTechnicianId(tech.id);
                      }}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ArrowRight size={16} />
                      Ver
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTechnician(tech);
                        setIsEditModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tech.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TechnicianFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        defaultValues={editingTechnician || undefined}
        isEditing={true}
      />
    </>
  );
}
