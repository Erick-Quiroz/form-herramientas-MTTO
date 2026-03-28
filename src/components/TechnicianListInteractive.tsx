'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TechnicianFormModal } from './TechnicianFormModal';
import { Edit2, Trash2, ArrowRight, Search, X } from 'lucide-react';
import { toastConfirm, toastError, toastSuccess } from '@/lib/toast';

interface Technician {
  id: string;
  name: string;
  initial?: string;
  specialty: string;
  employeeCode?: string;
  assignments?: { id: string; materialId: string; material: { id: string; name: string; quantity: number } }[];
  tools?: { id: string; quantity: number }[];
  lockers?: {
    id: string;
    number: number;
    name: string;
    tools: { id: string; quantity: number }[];
    materials: { id: string; quantity: number }[];
  }[];
}

interface TechnicianListInteractiveProps {
  onTechnicianUpdated?: () => void;
}

const SPECIALTIES = ['Eléctrico', 'Mecánico', 'Refrigeración'];

export default function TechnicianListInteractive({ onTechnicianUpdated }: TechnicianListInteractiveProps) {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

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

  const getStats = (tech: Technician) => {
    const itemsCount = tech.assignments?.length || 0;
    const lockersCount = tech.lockers?.length || 0;
    const directToolsCount = tech.tools?.reduce((sum, tool) => sum + (tool.quantity || 1), 0) || 0;
    const lockerToolsCount = tech.lockers?.reduce((sum, locker) => {
      return sum + (locker.tools?.reduce((lockerSum, tool) => lockerSum + (tool.quantity || 1), 0) || 0);
    }, 0) || 0;
    const totalToolsCount = directToolsCount + lockerToolsCount;

    return {
      itemsCount,
      lockersCount,
      directToolsCount,
      lockerToolsCount,
      totalToolsCount,
    };
  };

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || tech.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar técnicos por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Specialty Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">Especialidad:</span>
          <Button
            variant={selectedSpecialty === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSpecialty(null)}
            className={selectedSpecialty === null ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            Todos
          </Button>
          {SPECIALTIES.map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty)}
              className={selectedSpecialty === specialty ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {specialty}
            </Button>
          ))}
        </div>

        {/* Technician List */}
        <div className="space-y-3">
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">
                {technicians.length === 0 ? 'No hay técnicos registrados' : 'No se encontraron técnicos que coincidan con los filtros'}
              </p>
              {technicians.length > 0 && (
                <p className="text-sm">Intenta cambiar los filtros de búsqueda</p>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTechnicians.map((tech) => (
                <Card
                  key={tech.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
                      onClick={() => router.push(`/technicians/${tech.id}`)}
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

                      {/* Stats Section */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                          <div className="bg-purple-50 rounded p-2">
                            <p className="font-medium text-purple-900">Casilleros:</p>
                            <p className="text-purple-700">{getStats(tech).lockersCount}</p>
                          </div>
                          <div className="bg-amber-50 rounded p-2">
                            <p className="font-medium text-amber-900">Herramientas:</p>
                            <p className="text-amber-700">{getStats(tech).directToolsCount}</p>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded p-2 text-xs">
                          <p className="font-medium text-green-900">Total herramientas + casillero:</p>
                          <p className="text-green-700">{getStats(tech).totalToolsCount}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/technicians/${tech.id}`);
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
