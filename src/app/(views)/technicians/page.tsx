"use client";

import { useState } from "react";
import TechnicianListInteractive from "@/components/TechnicianListInteractive";
import { TechnicianFormModal } from "@/components/TechnicianFormModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TechniciansPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTechnicianSubmit = async (data: { name: string; initial: string; specialty: string; employeeCode: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear técnico");
      }

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Técnicos
            </h1>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Técnico
            </Button>
          </div>
          <p className="text-gray-600">
            Crea técnicos, asigna herramientas y gestiona casilleros
          </p>
        </div>

        <div key={refreshKey}>
          <TechnicianListInteractive onTechnicianUpdated={() => setRefreshKey(prev => prev + 1)} />
        </div>

        <TechnicianFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTechnicianSubmit}
        />
      </div>
    </div>
  );
}
