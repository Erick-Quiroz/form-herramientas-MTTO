"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Inbox } from "lucide-react";
import { toastConfirm, toastSuccess, toastError } from "@/lib/toast";

interface Locker {
  id: string;
  lockerId: string;
  location: string;
  status?: string;
}

interface LockerListProps {
  lockers: Locker[];
  onEdit: (locker: Locker) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function LockerList({
  lockers,
  onEdit,
  onDelete,
  isLoading = false,
}: LockerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    toastConfirm("¿Estás seguro de que quieres eliminar este casillero?", async () => {
      setDeletingId(id);
      try {
        await onDelete(id);
        toastSuccess('Casillero eliminado exitosamente');
      } catch (error) {
        toastError('Error al eliminar casillero');
      } finally {
        setDeletingId(null);
      }
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "in_use":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "in_use":
        return "En uso";
      case "maintenance":
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
  };

  if (lockers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <Inbox className="w-12 h-12 text-gray-300" />
            <div>
              <h3 className="font-semibold text-gray-900">
                No hay casilleros registrados
              </h3>
              <p className="text-sm text-gray-600">
                Crea tu primer casillero para comenzar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {lockers.map((locker) => (
        <Card key={locker.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    Casillero {locker.lockerId}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                      locker.status
                    )}`}
                  >
                    {getStatusLabel(locker.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Ubicación: {locker.location}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(locker)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(locker.id)}
                  disabled={deletingId === locker.id}
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
