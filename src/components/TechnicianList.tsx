"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Users } from "lucide-react";
import { toastConfirm, toastSuccess, toastError } from "@/lib/toast";

interface Technician {
  id: string;
  name: string;
  specialty: string;
}

interface TechnicianListProps {
  technicians: Technician[];
  onEdit: (technician: Technician) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function TechnicianList({
  technicians,
  onEdit,
  onDelete,
  isLoading = false,
}: TechnicianListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    toastConfirm("¿Estás seguro de que quieres eliminar este técnico?", async () => {
      setDeletingId(id);
      try {
        await onDelete(id);
        toastSuccess('Técnico eliminado exitosamente');
      } catch (error) {
        toastError('Error al eliminar técnico');
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (technicians.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <Users className="w-12 h-12 text-gray-300" />
            <div>
              <h3 className="font-semibold text-gray-900">
                No hay técnicos registrados
              </h3>
              <p className="text-sm text-gray-600">
                Crea tu primer técnico para comenzar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {technicians.map((tech) => (
        <Card key={tech.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.specialty}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(tech)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(tech.id)}
                  disabled={deletingId === tech.id}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
