'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LockerManager from './LockerManager';
import ToolAssignmentManager from './ToolAssignmentManager';

interface Technician {
  id: string;
  name: string;
  initial?: string;
  specialty: string;
  employeeCode?: string;
}

interface TechnicianDetailProps {
  technicianId: string;
  onClose?: () => void;
}

export default function TechnicianDetail({ technicianId, onClose }: TechnicianDetailProps) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        // Initialize parts in database if not already done
        await fetch('/api/init/parts', { method: 'POST' });

        const response = await fetch(`/api/technicians/${technicianId}`);
        if (response.ok) {
          const data = await response.json();
          setTechnician(data);
        }
      } catch (error) {
        console.error('Error fetching technician:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnician();
  }, [technicianId]);

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!technician) {
    return <div className="p-4 text-red-600">Técnico no encontrado</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{technician.name}</h2>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Especialidad:</span> {technician.specialty}
        </p>
        {technician.employeeCode && (
          <p className="text-gray-600">
            <span className="font-semibold">Código de empleado:</span> {technician.employeeCode}
          </p>
        )}
      </Card>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${selected
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-white/20'
              }`
            }
          >
            Herramientas Asignadas
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${selected
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-white/20'
              }`
            }
          >
            Casilleros
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <ToolAssignmentManager technicianId={technicianId} />
          </Tab.Panel>
          <Tab.Panel>
            <LockerManager technicianId={technicianId} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {onClose && (
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}
