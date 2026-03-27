"use client";

import { useState, useEffect } from "react";
import { LockerForm } from "@/components/LockerForm";
import { LockerList } from "@/components/LockerList";

interface Locker {
  id: string;
  lockerId: string;
  location: string;
  status?: string;
}

export default function LockersPage() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);

  useEffect(() => {
    fetchLockers();
  }, []);

  const fetchLockers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/lockers");
      if (!res.ok) throw new Error("Error fetching lockers");
      const data = await res.json();
      setLockers(data);
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

      const res = await fetch("/api/lockers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error saving locker");

      await fetchLockers();
      setEditingId(null);
      setEditingLocker(null);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleEdit = (locker: Locker) => {
    setEditingId(locker.id);
    setEditingLocker(locker);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/lockers?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error deleting locker");

      await fetchLockers();
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
            Gestión de Casilleros
          </h1>
          <p className="text-gray-600">
            Administra los casilleros de almacenamiento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LockerForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              defaultValues={editingLocker || undefined}
            />
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditingLocker(null);
                }}
                className="mt-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <div className="lg:col-span-2">
            <LockerList
              lockers={lockers}
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
