"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LockerFormProps {
  onSubmit: (data: {
    lockerId: string;
    location: string;
    status?: string;
  }) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: {
    lockerId: string;
    location: string;
    status?: string;
  };
}

export function LockerForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: LockerFormProps) {
  const [formData, setFormData] = useState({
    lockerId: defaultValues?.lockerId || "",
    location: defaultValues?.location || "",
    status: defaultValues?.status || "available",
  });
  const [error, setError] = useState<string | null>(null);

  const locations = [
    "Almacén A",
    "Almacén B",
    "Taller 1",
    "Taller 2",
    "Oficina",
    "Campamento",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.lockerId.trim() || !formData.location) {
      setError("ID de casillero y ubicación son requeridos");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ lockerId: "", location: "", status: "available" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar casillero"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {defaultValues ? "Editar Casillero" : "Nuevo Casillero"}
        </CardTitle>
        <CardDescription>
          {defaultValues
            ? "Actualiza los datos del casillero"
            : "Registra un nuevo casillero"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Casillero
            </label>
            <input
              type="text"
              value={formData.lockerId}
              onChange={(e) =>
                setFormData({ ...formData, lockerId: e.target.value })
              }
              placeholder="Ej: LOC-001 o 101"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <select
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una ubicación</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="available">Disponible</option>
              <option value="in_use">En uso</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
