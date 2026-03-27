"use client";

import { useState, useEffect } from "react";
import { MaterialForm } from "@/components/MaterialForm";
import { MaterialList } from "@/components/MaterialList";

interface Material {
  id: string;
  number: string;
  category: string;
  item: string;
  defaultQty: number;
  complement?: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/materials");
      if (!res.ok) throw new Error("Error fetching materials");
      const data = await res.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...data } : data;

      const res = await fetch("/api/materials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error saving material");

      await fetchMaterials();
      setEditingId(null);
      setEditingMaterial(null);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setEditingMaterial(material);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/materials?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error deleting material");

      await fetchMaterials();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Materiales
          </h1>
          <p className="text-gray-600">
            Administra el catálogo de herramientas y materiales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MaterialForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              defaultValues={editingMaterial || undefined}
            />
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditingMaterial(null);
                }}
                className="mt-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <div className="lg:col-span-2">
            <MaterialList
              materials={materials}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
