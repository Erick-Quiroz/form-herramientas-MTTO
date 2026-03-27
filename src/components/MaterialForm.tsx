"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MaterialFormProps {
  onSubmit: (data: {
    number: string;
    category: string;
    item: string;
    defaultQty: number;
    complement?: string;
  }) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: {
    number: string;
    category: string;
    item: string;
    defaultQty: number;
    complement?: string;
  };
}

export function MaterialForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: MaterialFormProps) {
  const [formData, setFormData] = useState({
    number: defaultValues?.number || "",
    category: defaultValues?.category || "",
    item: defaultValues?.item || "",
    defaultQty: defaultValues?.defaultQty || 1,
    complement: defaultValues?.complement || "",
  });
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Herramientas Manuales",
    "Herramientas Eléctricas",
    "Equipos de Protección",
    "Equipos de Medición",
    "Accesorios",
    "Consumibles",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.number.trim() ||
      !formData.category ||
      !formData.item.trim() ||
      !formData.defaultQty
    ) {
      setError("Todos los campos requeridos deben estar completos");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        number: "",
        category: "",
        item: "",
        defaultQty: 1,
        complement: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar material"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{defaultValues ? "Editar Material" : "Nuevo Material"}</CardTitle>
        <CardDescription>
          {defaultValues
            ? "Actualiza los datos del material"
            : "Agrega un nuevo material al catálogo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número (N°)
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                placeholder="Ej: MAT-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultQty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultQty: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ítem/Nombre
            </label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) =>
                setFormData({ ...formData, item: e.target.value })
              }
              placeholder="Ej: Destornillador de punta"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento (opcional)
            </label>
            <input
              type="text"
              value={formData.complement}
              onChange={(e) =>
                setFormData({ ...formData, complement: e.target.value })
              }
              placeholder="Ej: Tamaño, modelo, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
