'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Upload, Download, Edit2, Check, X } from 'lucide-react';
import { toastSuccess, toastError, toastConfirm } from '@/lib/toast';
import { toast } from 'sonner';

interface ToolCatalog {
    id: string;
    item: string;
    partId: string | null;
    createdAt: string;
}

export default function ToolsPage() {
    const [tools, setTools] = useState<ToolCatalog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [toolName, setToolName] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const response = await fetch('/api/tools');
            if (response.ok) {
                setTools(await response.json());
            }
        } catch (error) {
            console.error('Error fetching tools:', error);
        }
    };

    const handleCreateTool = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!toolName.trim()) {
            toastError('Por favor ingresa el nombre de la herramienta');
            return;
        }

        try {
            setIsCreating(true);
            const response = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: toolName.trim() })
            });

            if (response.ok) {
                const newTool = await response.json();
                setTools([...tools, newTool]);
                setToolName('');
                setShowForm(false);
                toastSuccess(`✓ Herramienta "${newTool.item}" creada exitosamente`);
            } else {
                const error = await response.json();
                toastError(error.error || 'Error al crear herramienta');
            }
        } catch (error) {
            console.error('Error creating tool:', error);
            toastError('Error al crear herramienta');
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditTool = async (toolId: string, newName: string) => {
        if (!newName.trim()) {
            toastError('Por favor ingresa un nombre válido');
            return;
        }

        try {
            const response = await fetch(`/api/tools/${toolId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: newName.trim() })
            });

            if (response.ok) {
                setTools(tools.map(t =>
                    t.id === toolId ? { ...t, item: newName.trim() } : t
                ));
                setEditingId(null);
                setEditingName('');
                toastSuccess('✓ Herramienta actualizada exitosamente');
            } else {
                toastError('Error al actualizar herramienta');
            }
        } catch (error) {
            console.error('Error editing tool:', error);
            toastError('Error al actualizar herramienta');
        }
    };

    const handleDeleteTool = async (toolId: string) => {
        toastConfirm('¿Estás seguro de que quieres eliminar esta herramienta?', async () => {
            try {
                const response = await fetch(`/api/tools/${toolId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setTools(tools.filter((t) => t.id !== toolId));
                    toastSuccess('✓ Herramienta eliminada exitosamente');
                } else {
                    toastError('Error al eliminar herramienta');
                }
            } catch (error) {
                console.error('Error deleting tool:', error);
                toastError('Error al eliminar herramienta');
            }
        });
    };

    const downloadTemplateExcel = () => {
        // Crear contenido CSV simple
        const csvContent = 'nombre\nEjemplo: Llave Inglesa\nEjemplo: Destornillador\nEjemplo: Martillo';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'plantilla_herramientas.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            const text = await file.text();
            const lines = text.split('\n').map(line => line.trim()).filter(line => line && line !== 'nombre');

            if (lines.length === 0) {
                toastError('El archivo no contiene herramientas válidas');
                return;
            }

            let successCount = 0;
            let errorCount = 0;

            for (const name of lines) {
                try {
                    const response = await fetch('/api/tools', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ item: name })
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                }
            }

            await fetchTools();
            toastSuccess(`✓ Importación completada: ${successCount} creadas, ${errorCount} duplicadas/errores`);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error importing tools:', error);
            toastError('Error al importar herramientas');
        } finally {
            setIsImporting(false);
        }
    };

    const filteredTools = tools.filter((tool) =>
        tool.item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Herramientas</h1>
                <p className="text-gray-600 mb-4">
                    Crea y administra el catálogo central de herramientas (sin asignar a parte específica)
                </p>
                <p className="text-sm text-blue-600">
                    💡 Cuando asignes herramientas a un técnico, selecciona la parte (nivel) en donde va
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    {showForm ? 'Cancelar' : 'Nueva Herramienta'}
                </Button>

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    <Upload size={20} />
                    {isImporting ? 'Importando...' : 'Importar Excel'}
                </Button>

                <Button
                    onClick={downloadTemplateExcel}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Download size={20} />
                    Descargar Plantilla
                </Button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportExcel}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="mb-6 p-6 bg-blue-50 border-blue-200">
                    <form onSubmit={handleCreateTool} className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Crear Nueva Herramienta</h2>
                        <p className="text-sm text-gray-600">
                            Solo ingresa el nombre. La parte se asigna cuando añadas la herramienta a un técnico o casillero.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Herramienta*
                            </label>
                            <input
                                type="text"
                                value={toolName}
                                onChange={(e) => setToolName(e.target.value)}
                                placeholder="Ej: Llave Inglesa, Destornillador, Martillo..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isCreating ? 'Creando...' : 'Crear Herramienta'}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setToolName('');
                                }}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar herramientas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Excel Import Info */}
            <Card className="mb-6 p-4 bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">📋 Formato de Excel / CSV</h3>
                <p className="text-sm text-amber-800 mb-2">El archivo debe contener una columna con encabezado "nombre":</p>
                <pre className="bg-white p-3 rounded border border-amber-200 text-xs overflow-auto">
                    {`nombre
Llave Inglesa
Destornillador
Martillo
Cinta Métrica`}
                </pre>
            </Card>

            {/* Tools Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Herramientas ({filteredTools.length})
                </h2>

                {filteredTools.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No se encontraron herramientas' : 'No hay herramientas aún. ¡Crea una o importa desde Excel!'}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTools.map((tool) => (
                            <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        {editingId === tool.id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleEditTool(tool.id, editingName);
                                                    } else if (e.key === 'Escape') {
                                                        setEditingId(null);
                                                        setEditingName('');
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <h3 className="font-semibold text-gray-900 break-words">{tool.item}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Creado: {new Date(tool.createdAt).toLocaleDateString('es-ES')}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-1 flex-shrink-0">
                                        {editingId === tool.id ? (
                                            <>
                                                <Button
                                                    onClick={() => handleEditTool(tool.id, editingName)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    <Check size={16} />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditingName('');
                                                    }}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => {
                                                        setEditingId(tool.id);
                                                        setEditingName(tool.item);
                                                    }}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteTool(tool.id)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
