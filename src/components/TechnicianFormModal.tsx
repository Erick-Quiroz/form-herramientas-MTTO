'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';

interface TechnicianFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; initial: string; specialty: string; employeeCode: string }) => Promise<void>;
    defaultValues?: {
        id?: string;
        name: string;
        initial?: string;
        specialty: string;
        employeeCode?: string;
    };
    isEditing?: boolean;
}

export function TechnicianFormModal({
    isOpen,
    onClose,
    onSubmit,
    defaultValues,
    isEditing = false,
}: TechnicianFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        initial: '',
        specialty: '',
        employeeCode: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const specialties = [
        'Eléctrico',
        'Mecánico',
        'Refrigeración',
    ];

    useEffect(() => {
        if (defaultValues) {
            setFormData({
                name: defaultValues.name,
                initial: defaultValues.initial ?? '',
                specialty: defaultValues.specialty,
                employeeCode: defaultValues.employeeCode ?? '',
            });
        } else {
            setFormData({ name: '', initial: '', specialty: '', employeeCode: '' });
        }
        setError(null);
    }, [isOpen, defaultValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim() || !formData.initial.trim() || !formData.specialty || !formData.employeeCode.trim()) {
            setError('Todos los campos son requeridos');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar técnico');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Técnico' : 'Nuevo Técnico'}
            description={
                isEditing
                    ? 'Actualiza los datos del técnico'
                    : 'Crea un nuevo técnico en el sistema'
            }
            size="md"
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Juan García"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Inicial
                    </label>
                    <input
                        type="text"
                        value={formData.initial}
                        onChange={(e) => setFormData({ ...formData, initial: e.target.value.toUpperCase() })}
                        placeholder="Ej: Erick"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad
                    </label>
                    <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Selecciona una especialidad</option>
                        {specialties.map((spec) => (
                            <option key={spec} value={spec}>
                                {spec}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Técnico
                    </label>
                    <input
                        type="text"
                        value={formData.employeeCode}
                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                        placeholder="Ej: TEC001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </form>
        </Modal>
    );
}
