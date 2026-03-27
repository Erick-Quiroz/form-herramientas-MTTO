'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ToolAddModal from './ToolAddModal';
import ToolImportExportButtons from './ToolImportExportButtons';
import { toastError } from '@/lib/toast';

interface Part {
    id: string;
    level: string;
    label: string;
    color: string;
}

interface SelectedTool {
    toolId: string;
    item: string;
    partLabel?: string;
    quantity: number;
    complement: string;
}

interface ToolImportData {
    parte: string;
    herramienta: string;
    cantidad: number;
    complemento: string;
}

interface ToolSearchSelectorProps {
    parts: Part[];
    onAddTool: (tool: SelectedTool) => void;
    selectedTools?: SelectedTool[];
    onRemoveTool?: (toolId: string) => void;
    onUpdateTool?: (toolId: string, quantity: number, complement: string) => void;
}

export default function ToolSearchSelector({
    parts,
    onAddTool,
    selectedTools = [],
    onRemoveTool,
    onUpdateTool
}: ToolSearchSelectorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingToolIdx, setEditingToolIdx] = useState<number | null>(null);
    const [editingQuantity, setEditingQuantity] = useState('');
    const [editingComplement, setEditingComplement] = useState('');
    const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

    const handleEditStart = (idx: number) => {
        setEditingToolIdx(idx);
        setEditingQuantity(selectedTools[idx].quantity.toString());
        setEditingComplement(selectedTools[idx].complement);
    };

    const toggleToolSelection = (idx: number) => {
        const newSelected = new Set(selectedIndexes);
        if (newSelected.has(idx)) {
            newSelected.delete(idx);
        } else {
            newSelected.add(idx);
        }
        setSelectedIndexes(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIndexes.size === selectedTools.length) {
            setSelectedIndexes(new Set());
        } else {
            const allIndexes = new Set(selectedTools.map((_, idx) => idx));
            setSelectedIndexes(allIndexes);
        }
    };

    const deleteSelectedTools = () => {
        const toolsToDelete = Array.from(selectedIndexes)
            .sort((a, b) => b - a) // Ordenar descendente para no afectar índices
            .map(idx => selectedTools[idx]);

        toolsToDelete.forEach(tool => {
            onRemoveTool?.(tool.toolId);
        });

        setSelectedIndexes(new Set());
    };

    const handleImportTools = async (importedTools: ToolImportData[]) => {
        // Para cada herramienta importada, buscarla o crearla en el catálogo
        for (const importedTool of importedTools) {
            try {
                // Primero, buscar la herramienta en el catálogo
                const searchResponse = await fetch(`/api/tools?search=${encodeURIComponent(importedTool.herramienta)}`);
                const foundTools = await searchResponse.json();

                let toolId = '';

                // Si la herramienta existe, usar su ID
                if (foundTools.length > 0) {
                    toolId = foundTools[0].id;
                } else {
                    // Si no existe, crearla
                    const createResponse = await fetch('/api/tools', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ item: importedTool.herramienta })
                    });

                    if (createResponse.ok) {
                        const newTool = await createResponse.json();
                        toolId = newTool.id;
                    } else {
                        toastError(`No se pudo crear la herramienta: ${importedTool.herramienta}`);
                        continue;
                    }
                }

                console.log(`Importando herramienta: ${importedTool.herramienta}, Parte: ${importedTool.parte}`);

                // Agregar la herramienta con onAddTool (parte es texto libre, sin validación)
                onAddTool({
                    toolId,
                    item: importedTool.herramienta,
                    partLabel: importedTool.parte || undefined,
                    quantity: importedTool.cantidad,
                    complement: importedTool.complemento
                });
            } catch (error) {
                console.error(`Error processing tool: ${importedTool.herramienta}`, error);
            }
        }
    };

    return (
        <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header with Buttons */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Herramientas</h3>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Agregar Herramienta
                    </Button>
                </div>

                {/* Import/Export Buttons */}
                <div className="border-t pt-3">
                    <ToolImportExportButtons onImport={handleImportTools} />
                </div>
            </div>

            {/* Modal */}
            <ToolAddModal
                parts={parts}
                onAddTool={onAddTool}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Selected Tools List */}
            {selectedTools && selectedTools.length > 0 ? (
                <div className="space-y-3">
                    {/* Selection Header */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedIndexes.size === selectedTools.length && selectedTools.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 cursor-pointer rounded border-gray-300"
                                title="Seleccionar todas"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {selectedIndexes.size > 0 ? (
                                    <span className="text-blue-600">{selectedIndexes.size} seleccionada{selectedIndexes.size !== 1 ? 's' : ''}</span>
                                ) : (
                                    <span>Seleccionar todo</span>
                                )}
                            </span>
                        </div>

                        {selectedIndexes.size > 0 && (
                            <Button
                                onClick={deleteSelectedTools}
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                                title="Eliminar seleccionadas"
                            >
                                <Trash2 size={18} />
                                Eliminar ({selectedIndexes.size})
                            </Button>
                        )}
                    </div>

                    {/* Tools List */}
                    {selectedTools.map((tool, idx) => (
                        <div
                            key={idx}
                            className={`flex items-start justify-between p-4 rounded-lg border transition ${selectedIndexes.has(idx)
                                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                                    : 'bg-gray-50 border-gray-200 hover:shadow-sm'
                                }`}
                        >
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={selectedIndexes.has(idx)}
                                onChange={() => toggleToolSelection(idx)}
                                disabled={editingToolIdx === idx}
                                className="w-4 h-4 mt-1 mr-3 cursor-pointer rounded border-gray-300 flex-shrink-0"
                            />
                            {editingToolIdx === idx ? (
                                // Editing mode
                                <div className="flex-1 space-y-3 mr-4">
                                    <p className="font-semibold text-gray-900">{tool.item}</p>
                                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        {tool.partLabel || 'Sin parte'}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-600 font-medium">Cantidad</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editingQuantity}
                                                onChange={(e) => setEditingQuantity(e.target.value)}
                                                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 font-medium">Complemento</label>
                                            <input
                                                type="text"
                                                value={editingComplement}
                                                onChange={(e) => setEditingComplement(e.target.value)}
                                                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ej: rojo, 2x..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // View mode
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{tool.item}</p>
                                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mt-2">
                                        {tool.partLabel || 'Sin parte'}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3">
                                        <span className="inline-block mr-4">
                                            <span className="text-gray-500">Cantidad:</span> <span className="font-medium">{tool.quantity}</span>
                                        </span>
                                        {tool.complement && (
                                            <span className="inline-block">
                                                <span className="text-gray-500">Complemento:</span> <span className="font-medium">{tool.complement}</span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0 ml-4">
                                {editingToolIdx === idx ? (
                                    <>
                                        <Button
                                            onClick={() => {
                                                if (onUpdateTool) {
                                                    onUpdateTool(tool.toolId, parseInt(editingQuantity) || 1, editingComplement);
                                                }
                                                setEditingToolIdx(null);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                                            title="Guardar cambios"
                                        >
                                            <Check size={18} />
                                        </Button>
                                        <Button
                                            onClick={() => setEditingToolIdx(null)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 p-2"
                                            title="Cancelar"
                                        >
                                            <X size={18} />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => handleEditStart(idx)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </Button>
                                        <Button
                                            onClick={() => onRemoveTool?.(tool.toolId)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
