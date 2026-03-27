'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PartDiagram } from './PartDiagram';
import ToolSearchSelector from './ToolSearchSelector';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { toastConfirm, toastError, toastSuccess } from '@/lib/toast';

interface Part {
  id: string;
  level: string;
  label: string;
  color: string;
}

interface ToolCatalog {
  id: string;
  item: string;
  partId: string;
  part: Part;
}

interface Tool {
  id: string;
  toolCatalogId: string;
  quantity: number;
  complement?: string;
  partId?: string;
  partLabel?: string;
  part?: Part;
  toolCatalog?: ToolCatalog;
}

interface SelectedTool {
  toolId: string;
  item: string;
  partLabel?: string;
  quantity: number;
  complement: string;
}

interface ToolAssignmentManagerProps {
  technicianId: string;
}

export default function ToolAssignmentManager({ technicianId }: ToolAssignmentManagerProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [editingComplement, setEditingComplement] = useState('');
  const [editingPartText, setEditingPartText] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [technicianId]);

  const fetchData = async () => {
    try {
      const [toolsRes, partsRes] = await Promise.all([
        fetch(`/api/technicians/${technicianId}/tools`),
        fetch('/api/init/parts')
      ]);

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        console.log('Tools fetched:', toolsData);
        setTools(toolsData);
      }
      if (partsRes.ok) {
        setParts(await partsRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (selectedTool: SelectedTool) => {
    try {
      console.log('[handleAddTool] Agregando herramienta con:', selectedTool);

      const response = await fetch(`/api/technicians/${technicianId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolCatalogId: selectedTool.toolId,
          quantity: selectedTool.quantity,
          complement: selectedTool.complement,
          partLabel: selectedTool.partLabel
        }),
      });

      console.log('[handleAddTool] Response status:', response.status);

      if (response.ok) {
        await fetchData();
        toastSuccess(`Herramienta "${selectedTool.item}" agregada exitosamente`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar herramienta');
      }
    } catch (error) {
      console.error('[handleAddTool] Error:', error);
      toastError('Error al agregar herramienta');
    }
  };

  const handleRemoveTool = async (toolId: string) => {
    toastConfirm('¿Está seguro de que desea eliminar esta herramienta?', async () => {
      try {
        const response = await fetch(`/api/technicians/${technicianId}/tools/${toolId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchData();
          toastSuccess('Herramienta eliminada exitosamente');
        } else {
          toastError('Error al eliminar herramienta');
        }
      } catch (error) {
        console.error('Error removing tool:', error);
        toastError('Error al eliminar herramienta');
      }
    });
  };

  const handleUpdateTool = async (toolId: string, quantity: number, complement: string, partLabel?: string) => {
    try {
      // Guardar el texto de la parte directamente sin validación
      const response = await fetch(`/api/technicians/${technicianId}/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          complement,
          partLabel: partLabel?.trim() || null
        }),
      });

      if (response.ok) {
        await fetchData();
        toastSuccess('Herramienta actualizada exitosamente');
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      toastError('Error al actualizar herramienta');
    }
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div>
      <PartDiagram />

      <ToolSearchSelector
        parts={parts}
        onAddTool={handleAddTool}
        selectedTools={[]}
      />

      {/* Tools List */}
      <div className="space-y-3">
        {tools.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">Sin herramientas asignadas</p>
          </div>
        ) : (
          <>
            {/* Total Counter */}
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900">Herramientas Asignadas</h4>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                Total: {tools.length}
              </span>
            </div>

            {/* Tools Items */}
            {tools.map((tool, index) => {
              const part = tool.part;  // usar tool.part directamente
              const isEditing = editingToolId === tool.id;
              const toolNumber = index + 1;

              // Debug
              console.log(`Tool ${toolNumber}:`, {
                item: tool.toolCatalog?.item,
                partId: tool.partId,
                part: part,
                hasPartData: !!part
              });

              return (
                <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-3">
                    {/* Tool Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{toolNumber}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      {isEditing ? (
                        // Modo edición
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {part && (
                              <span
                                className="px-2 py-1 rounded text-white text-xs font-bold"
                                style={{ backgroundColor: part.color }}
                              >
                                {part.level}
                              </span>
                            )}
                            <h4 className="font-semibold text-gray-900">
                              {tool.toolCatalog?.item}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Parte</label>
                              <input
                                type="text"
                                placeholder="Ej: A1, B2, C1..."
                                value={editingPartText}
                                onChange={(e) => setEditingPartText(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Cantidad</label>
                              <input
                                type="number"
                                min="1"
                                value={editingQuantity}
                                onChange={(e) => setEditingQuantity(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Complemento</label>
                              <input
                                type="text"
                                placeholder="Ej: color, tamaño"
                                value={editingComplement}
                                onChange={(e) => setEditingComplement(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Modo vista
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            {part && (
                              <span
                                className="px-2 py-1 rounded text-white text-xs font-bold"
                                style={{ backgroundColor: part.color }}
                                title={`${part.level} - ${part.label}`}
                              >
                                {part.level}
                              </span>
                            )}
                            <h4 className="font-semibold text-gray-900">
                              {tool.toolCatalog?.item}
                            </h4>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1 ml-0">
                            <p>
                              <span className="font-medium text-gray-700">Parte:</span> <span className="text-gray-600">{tool.partLabel || part?.label || 'No asignada'}</span>
                            </p>
                            <p>
                              <span className="font-medium text-gray-700">Cantidad:</span> <span className="text-gray-600">{tool.quantity}</span>
                            </p>
                            {tool.complement && (
                              <p>
                                <span className="font-medium text-gray-700">Complemento:</span> <span className="text-gray-600">{tool.complement}</span>
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => {
                              handleUpdateTool(tool.id, parseInt(editingQuantity) || tool.quantity, editingComplement, editingPartText);
                              setEditingToolId(null);
                              setEditingQuantity('');
                              setEditingComplement('');
                              setEditingPartText('');
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingToolId(null);
                              setEditingQuantity('');
                              setEditingComplement('');
                              setEditingPartText('');
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <X size={16} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              setEditingToolId(tool.id);
                              setEditingQuantity(tool.quantity.toString());
                              setEditingComplement(tool.complement || '');
                              setEditingPartText(tool.partLabel || '');
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            onClick={() => handleRemoveTool(tool.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
