'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';

interface Part {
    id: string;
    level: string;
    label: string;
    color: string;
}

interface AddToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { partId: string; item: string; quantity: number; complement: string }) => Promise<void>;
    parts: Part[];
}

export function AddToolModal({
    isOpen,
    onClose,
    onSubmit,
    parts,
}: AddToolModalProps) {
    const [formData, setFormData] = useState({
        partId: '',
        item: '',
        quantity: 1,
        complement: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({ partId: '', item: '', quantity: 1, complement: '' });
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.partId || !formData.item.trim()) {
            setError('Parte e Item son requeridos');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            setFormData({ partId: '', item: '', quantity: 1, complement: '' });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al agregar herramienta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agregar Herramienta"
            description="Agrega una nueva herramienta al técnico"
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
                        disabled={loading || !formData.partId || !formData.item}
                    >
                        {loading ? 'Agregando...' : 'Agregar'}
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
                        Parte *
                    </label>
                    <select
                        value={formData.partId}
                        onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Selecciona una parte</option>
                        {parts.map((part) => (
                            <option key={part.id} value={part.id}>
                                {part.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item *
                    </label>
                    <input
                        type="text"
                        value={formData.item}
                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                        placeholder="Ej: MASCARA PARA AMONÍACO"
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
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento (Opcional)
                    </label>
                    <input
                        type="text"
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        placeholder="Ej: talla M"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </form>
        </Modal>
    );
}
