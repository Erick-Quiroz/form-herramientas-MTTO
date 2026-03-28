'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ToolSearchSelector from './ToolSearchSelector';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
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

interface LockerTool {
  id: string;
  toolCatalogId: string;
  partLabel?: string;
  quantity: number;
  complement?: string;
  toolCatalog?: ToolCatalog;
}

interface Locker {
  id: string;
  number: number;
  name: string;
  location?: string;
  tools: LockerTool[];
}

interface SelectedTool {
  toolId: string;
  item: string;
  partLabel?: string;
  quantity: number;
  complement: string;
}

interface LockerManagerProps {
  technicianId: string;
}

export default function LockerManager({ technicianId }: LockerManagerProps) {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocker, setExpandedLocker] = useState<string | null>(null);
  const [creatingLocker, setCreatingLocker] = useState(false);
  const [editingToolLockerIdx, setEditingToolLockerIdx] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [editingComplement, setEditingComplement] = useState('');
  const [editingPartLabel, setEditingPartLabel] = useState('');
  const [selectedToolsByLocker, setSelectedToolsByLocker] = useState<Map<string, Set<number>>>(new Map());

  useEffect(() => {
    fetchData();
  }, [technicianId]);

  const fetchData = async () => {
    try {
      const [lockersRes, partsRes] = await Promise.all([
        fetch(`/api/technicians/${technicianId}/lockers`),
        fetch('/api/init/parts')
      ]);

      if (lockersRes.ok) {
        setLockers(await lockersRes.json());
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

  const handleCreateLocker = async () => {
    setCreatingLocker(true);
    try {
      const response = await fetch(`/api/technicians/${technicianId}/lockers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating locker:', error);
    } finally {
      setCreatingLocker(false);
    }
  };

  const handleDeleteLocker = async (lockerId: string) => {
    toastConfirm('¿Eliminar este casillero?', async () => {
      try {
        const response = await fetch(`/api/technicians/${technicianId}/lockers/${lockerId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchData();
          toastSuccess('Casillero eliminado exitosamente');
        } else {
          toastError('Error al eliminar casillero');
        }
      } catch (error) {
        console.error('Error deleting locker:', error);
        toastError('Error al eliminar casillero');
      }
    });
  };

  const handleRemoveToolFromLocker = async (lockerId: string, lockerToolId: string) => {
    toastConfirm('¿Eliminar esta herramienta del casillero?', async () => {
      try {
        const response = await fetch(
          `/api/technicians/${technicianId}/lockers/${lockerId}/tools/${lockerToolId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          await fetchData();
          toastSuccess('Herramienta eliminada del casillero exitosamente');
        } else {
          toastError('Error al eliminar herramienta');
        }
      } catch (error) {
        console.error('Error removing tool from locker:', error);
        toastError('Error al eliminar herramienta');
      }
    });
  };

  const toggleToolSelection = (lockerId: string, toolIdx: number) => {
    const newSelections = new Map(selectedToolsByLocker);
    const selected = newSelections.get(lockerId) || new Set();

    if (selected.has(toolIdx)) {
      selected.delete(toolIdx);
    } else {
      selected.add(toolIdx);
    }

    if (selected.size === 0) {
      newSelections.delete(lockerId);
    } else {
      newSelections.set(lockerId, selected);
    }

    setSelectedToolsByLocker(newSelections);
  };

  const toggleSelectAllTools = (lockerId: string, tools: LockerTool[]) => {
    const newSelections = new Map(selectedToolsByLocker);
    const selected = newSelections.get(lockerId) || new Set();

    if (selected.size === tools.length) {
      newSelections.delete(lockerId);
    } else {
      const allIndexes = new Set(tools.map((_, idx) => idx));
      newSelections.set(lockerId, allIndexes);
    }

    setSelectedToolsByLocker(newSelections);
  };

  const deleteSelectedToolsFromLocker = (lockerId: string, tools: LockerTool[]) => {
    const selected = selectedToolsByLocker.get(lockerId);
    if (!selected || selected.size === 0) return;

    const toolsToDelete = Array.from(selected)
      .sort((a, b) => b - a)
      .map(idx => tools[idx]);

    toolsToDelete.forEach(tool => {
      handleRemoveToolFromLocker(lockerId, tool.id);
    });

    const newSelections = new Map(selectedToolsByLocker);
    newSelections.delete(lockerId);
    setSelectedToolsByLocker(newSelections);
  };

  if (loading) {
    return <div className="p-4">Cargando casilleros...</div>;
  }

  return (
    <div>
      <Button
        onClick={handleCreateLocker}
        disabled={creatingLocker}
        className="mb-6 flex items-center gap-2"
      >
        <Plus size={20} />
        {creatingLocker ? 'Creando...' : 'Nuevo Casillero'}
      </Button>

      <div className="space-y-3 mt-4">
        {lockers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay casilleros registrados</p>
          </div>
        ) : (
          lockers.map((locker) => (
            <Card key={locker.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition flex justify-between items-center"
                onClick={() => setExpandedLocker(expandedLocker === locker.id ? null : locker.id)}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{locker.name}</h3>
                  <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                    {locker.location && (
                      <p>
                        <span className="font-medium">Ubicación:</span> {locker.location}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Herramientas:</span> {locker.tools?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLocker(locker.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                  {expandedLocker === locker.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedLocker === locker.id && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  <ToolSearchSelector
                    parts={parts}
                    onAddTool={(selectedTool: SelectedTool) => {
                      const response = fetch(
                        `/api/technicians/${technicianId}/lockers/${locker.id}/tools`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            toolCatalogId: selectedTool.toolId,
                            quantity: selectedTool.quantity,
                            complement: selectedTool.complement,
                            partLabel: selectedTool.partLabel
                          })
                        }
                      ).then(async (res) => {
                        if (res.ok) {
                          await fetchData();
                          toastSuccess('Herramienta agregada al casillero');
                        } else {
                          throw new Error('Error al agregar herramienta');
                        }
                      }).catch((error) => {
                        console.error(error);
                        toastError('Error al agregar herramienta');
                      });
                    }}
                    selectedTools={[]}
                  />

                  <div>
                    {locker.tools && locker.tools.length > 0 && (
                      <div className="space-y-2">
                        {/* Selection Header */}
                        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <input
                            type="checkbox"
                            checked={
                              locker.tools.length > 0 &&
                              selectedToolsByLocker.get(locker.id)?.size === locker.tools.length
                            }
                            onChange={() => toggleSelectAllTools(locker.id, locker.tools)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-gray-600 flex-1">
                            {selectedToolsByLocker.get(locker.id)?.size || 0} de {locker.tools.length} seleccionados
                          </span>
                          {(selectedToolsByLocker.get(locker.id)?.size || 0) > 0 && (
                            <Button
                              onClick={() => deleteSelectedToolsFromLocker(locker.id, locker.tools)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Eliminar ({selectedToolsByLocker.get(locker.id)?.size || 0})
                            </Button>
                          )}
                        </div>

                        {/* Tools List */}
                        {locker.tools.map((tool, toolIdx) => {
                          const isSelected = selectedToolsByLocker.get(locker.id)?.has(toolIdx);
                          const isEditing = editingToolLockerIdx === `${locker.id}-${toolIdx}`;

                          return (
                            <div
                              key={tool.id}
                              className={`flex gap-2 p-3 border rounded-lg transition ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                                }`}
                            >
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={() => toggleToolSelection(locker.id, toolIdx)}
                                className="w-4 h-4 cursor-pointer mt-1"
                              />

                              {/* Content */}
                              <div className="flex-1">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Cantidad</label>
                                      <input
                                        type="number"
                                        value={editingQuantity}
                                        onChange={(e) => setEditingQuantity(e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        min="1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Complemento</label>
                                      <input
                                        type="text"
                                        value={editingComplement}
                                        onChange={(e) => setEditingComplement(e.target.value)}
                                        placeholder="Ej: Con cable, Sin batería..."
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Parte</label>
                                      <input
                                        type="text"
                                        value={editingPartLabel}
                                        onChange={(e) => setEditingPartLabel(e.target.value)}
                                        placeholder="Ej: Zona A, Estante 1, etc."
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-gray-900">
                                        {tool.toolCatalog?.item}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      <span className="font-medium">Cantidad:</span> {tool.quantity}
                                    </p>
                                    {tool.complement && (
                                      <p className="text-xs text-gray-600">
                                        <span className="font-medium">Complemento:</span> {tool.complement}
                                      </p>
                                    )}
                                    {tool.partLabel && (
                                      <p className="text-xs text-gray-600">
                                        <span className="font-medium">Parte:</span> {tool.partLabel}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1">
                                {isEditing ? (
                                  <>
                                    <Button
                                      onClick={() => {
                                        const quantity = parseInt(editingQuantity) || tool.quantity;
                                        fetch(
                                          `/api/technicians/${technicianId}/lockers/${locker.id}/tools/${tool.id}`,
                                          {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              quantity,
                                              complement: editingComplement || null,
                                              partLabel: editingPartLabel || null,
                                            }),
                                          }
                                        )
                                          .then((res) => {
                                            if (res.ok) {
                                              setEditingToolLockerIdx(null);
                                              fetchData();
                                              toastSuccess('Herramienta actualizada');
                                            } else {
                                              throw new Error('Error al actualizar');
                                            }
                                          })
                                          .catch((error) => {
                                            console.error(error);
                                            toastError('Error al actualizar herramienta');
                                          });
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 hover:bg-green-50"
                                    >
                                      <Check size={14} />
                                    </Button>
                                    <Button
                                      onClick={() => setEditingToolLockerIdx(null)}
                                      variant="outline"
                                      size="sm"
                                      className="text-gray-600 hover:bg-gray-100"
                                    >
                                      <X size={14} />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setEditingToolLockerIdx(`${locker.id}-${toolIdx}`);
                                      setEditingQuantity(tool.quantity.toString());
                                      setEditingComplement(tool.complement || '');
                                      setEditingPartLabel(tool.partLabel || '');
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:bg-blue-50"
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
