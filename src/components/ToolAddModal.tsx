'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Search } from 'lucide-react';
import { toastError, toastSuccess } from '@/lib/toast';

interface Part {
    id: string;
    level: string;
    label: string;
    color: string;
}

interface ToolCatalog {
    id: string;
    item: string;
    partId: string | null;
}

interface SelectedTool {
    toolId: string;
    item: string;
    partLabel?: string;
    quantity: number;
    complement: string;
}

interface ToolAddModalProps {
    parts: Part[];
    onAddTool: (tool: SelectedTool) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ToolAddModal({ parts, onAddTool, isOpen, onClose }: ToolAddModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [toolCatalog, setToolCatalog] = useState<ToolCatalog[]>([]);
    const [filteredTools, setFilteredTools] = useState<ToolCatalog[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const [selectedToolId, setSelectedToolId] = useState<string>('');
    const [selectedPartText, setSelectedPartText] = useState<string>('');
    const [quantity, setQuantity] = useState('1');
    const [complement, setComplement] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchToolCatalog();
    }, []);

    const fetchToolCatalog = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tools');
            const data = await response.json();
            setToolCatalog(data);
            setFilteredTools(data);
        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setFilteredTools(toolCatalog);
            setShowDropdown(false);
            setShowCreateForm(false);
            return;
        }

        const trimmedTerm = term.trim().toLowerCase();
        const filtered = toolCatalog.filter((tool) =>
            tool.item.toLowerCase().includes(trimmedTerm)
        );

        setFilteredTools(filtered);
        setShowDropdown(true);
        setShowCreateForm(filtered.length === 0);
    };

    const handleSelectTool = (tool: ToolCatalog) => {
        setSelectedToolId(tool.id);
        setSearchTerm(tool.item);
        setShowDropdown(false);
        setShowCreateForm(false);
    };

    const handleCreateNewTool = async () => {
        if (!searchTerm.trim()) {
            toastError('Por favor ingresa el nombre de la herramienta');
            return;
        }

        try {
            const response = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: searchTerm.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                const newTool = data;
                setToolCatalog([...toolCatalog, newTool]);
                setSelectedToolId(newTool.id);
                setSearchTerm('');
                setShowDropdown(false);
                setShowCreateForm(false);
                toastSuccess(`✓ Herramienta "${newTool.item}" creada exitosamente`);
            } else {
                toastError(data.error || 'Error al crear la herramienta');
            }
        } catch (error) {
            console.error('Error creating tool:', error);
            toastError('Error al crear la herramienta');
        }
    };

    const handleAddTool = () => {
        if (!selectedToolId) {
            toastError('Por favor selecciona una herramienta');
            return;
        }

        const selected = toolCatalog.find((t) => t.id === selectedToolId);
        if (!selected) return;

        onAddTool({
            toolId: selected.id,
            item: selected.item,
            partLabel: selectedPartText.trim() || undefined,
            quantity: parseInt(quantity) || 1,
            complement: complement.trim()
        });

        // Reset form
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setSelectedToolId('');
        setSelectedPartText('');
        setQuantity('1');
        setComplement('');
        setSearchTerm('');
        setShowDropdown(false);
        setShowCreateForm(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const selectedTool = toolCatalog.find((t) => t.id === selectedToolId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Agregar Herramienta</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    {/* Tool Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Herramienta <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Busca o crea una herramienta..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => {
                                        if (searchTerm) setShowDropdown(true);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                />
                            </div>

                            {/* Dropdown */}
                            {showDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {/* Create New Tool Option */}
                                    {showCreateForm && (
                                        <button
                                            onClick={handleCreateNewTool}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 flex items-center gap-2"
                                        >
                                            <Plus size={18} className="text-blue-600" />
                                            <span className="text-blue-600 font-medium">
                                                Crear "{searchTerm}"
                                            </span>
                                        </button>
                                    )}

                                    {/* Tool Options */}
                                    {filteredTools.length > 0 ? (
                                        filteredTools.map((tool) => (
                                            <button
                                                key={tool.id}
                                                onClick={() => handleSelectTool(tool)}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-0 transition"
                                            >
                                                <span className="font-medium text-gray-900">{tool.item}</span>
                                            </button>
                                        ))
                                    ) : (
                                        !showCreateForm && (
                                            <div className="px-4 py-3 text-gray-500 text-sm">
                                                No hay herramientas
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedTool && (
                            <p className="mt-2 text-sm text-green-600 font-medium">
                                ✓ {selectedTool.item}
                            </p>
                        )}
                    </div>

                    {/* Part Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Parte / Nivel
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: A1, B2, C1..."
                            value={selectedPartText}
                            onChange={(e) => setSelectedPartText(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                    </div>

                    {/* Quantity and Complement */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Cantidad
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Complemento
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: rojo, 2x, grande..."
                                value={complement}
                                onChange={(e) => setComplement(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                    <Button
                        onClick={handleClose}
                        variant="outline"
                        className="px-6 py-2"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAddTool}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Agregar
                    </Button>
                </div>
            </div>
        </div>
    );
}
