"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Package } from "lucide-react";
import { toastConfirm, toastSuccess, toastError } from "@/lib/toast";

interface Material {
  id: string;
  number: string;
  category: string;
  item: string;
  defaultQty: number;
  complement?: string;
}

interface MaterialListProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function MaterialList({
  materials,
  onEdit,
  onDelete,
  isLoading = false,
}: MaterialListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    toastConfirm("¿Estás seguro de que quieres eliminar este material?", async () => {
      setDeletingId(id);
      try {
        await onDelete(id);
        toastSuccess('Material eliminado exitosamente');
      } catch (error) {
        toastError('Error al eliminar material');
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <Package className="w-12 h-12 text-gray-300" />
            <div>
              <h3 className="font-semibold text-gray-900">
                No hay materiales registrados
              </h3>
              <p className="text-sm text-gray-600">
                Crea tu primer material para comenzar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-600 text-sm">
                    {material.number}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {material.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {material.item}
                </h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>Cantidad: <strong>{material.defaultQty}</strong></span>
                  {material.complement && (
                    <span>Complemento: <strong>{material.complement}</strong></span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(material)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(material.id)}
                  disabled={deletingId === material.id}
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
