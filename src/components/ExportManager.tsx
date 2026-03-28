'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { toastError, toastSuccess } from '@/lib/toast';
import ExcelJS from 'exceljs';

interface EvaluationItem {
    id: string;
    toolId?: string;
    lockerToolId?: string;
    hasItem: boolean;
    isClean: boolean;
    quantityObserved?: number;
    complementObserved?: string;
    observations?: string;
    assignment?: { material?: { name: string } };
    tool?: { toolCatalog: { item: string }; partLabel?: string };
    lockerTool?: { toolCatalog: { item: string }; partLabel?: string };
}

interface Evaluation {
    id: string;
    evaluatorName?: string;
    observations?: string;
    date: string;
    evaluationItems: EvaluationItem[];
}

interface Technician {
    id: string;
    name: string;
    specialty: string;
    employeeCode?: string;
    tools?: {
        id: string;
        quantity: number;
        toolCatalog: { item: string };
        partLabel?: string;
    }[];
    lockers?: {
        id: string;
        number: number;
        name: string;
        tools: {
            id: string;
            quantity: number;
            toolCatalog: { item: string };
            partLabel?: string;
        }[];
    }[];
    evaluations?: Evaluation[];
}

const SPECIALTIES = ['Eléctrico', 'Mecánico', 'Refrigeración'];
const EVALUATION_STATUS = [
    { value: 'all', label: 'Todos' },
    { value: 'evaluated', label: 'Evaluados' },
    { value: 'not_evaluated', label: 'No Evaluados' },
];

export default function ExportManager() {
    const [loading, setLoading] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [evaluationStatus, setEvaluationStatus] = useState<string>('all');
    const [includeDirectTools, setIncludeDirectTools] = useState(true);
    const [includeLockerTools, setIncludeLockerTools] = useState(true);
    const [documentType, setDocumentType] = useState<'single' | 'per_technician'>('single');

    const exportToExcel = async () => {
        if (!includeDirectTools && !includeLockerTools) {
            toastError('Selecciona al menos una opción para exportar');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/technicians');
            if (!response.ok) throw new Error('Error fetching technicians');

            let allTechnicians: Technician[] = await response.json();

            // Filter by specialty
            if (selectedSpecialty) {
                allTechnicians = allTechnicians.filter(t => t.specialty === selectedSpecialty);
            }

            // Filter by evaluation status
            if (evaluationStatus === 'evaluated') {
                allTechnicians = allTechnicians.filter(t => t.evaluations && t.evaluations.length > 0);
            } else if (evaluationStatus === 'not_evaluated') {
                allTechnicians = allTechnicians.filter(t => !t.evaluations || t.evaluations.length === 0);
            }

            if (allTechnicians.length === 0) {
                toastError('No hay técnicos para exportar con los filtros seleccionados');
                return;
            }

            if (documentType === 'single') {
                await exportAllInSingleFile(allTechnicians);
            } else {
                await exportPerTechnician(allTechnicians);
            }

            toastSuccess('Exportación completada exitosamente');
        } catch (error) {
            console.error('Export error:', error);
            toastError('Error al exportar');
        } finally {
            setLoading(false);
        }
    };

    const exportAllInSingleFile = async (allTechnicians: Technician[]) => {
        const workbook = new ExcelJS.Workbook();
        const usedNames = new Set<string>();

        const createUniqueSheetName = (baseName: string): string => {
            let name = baseName.slice(0, 31);
            let counter = 1;
            let finalName = name;

            while (usedNames.has(finalName)) {
                const suffix = `_${counter}`;
                finalName = (baseName + suffix).slice(0, 31);
                counter++;
            }

            usedNames.add(finalName);
            return finalName;
        };

        for (const technician of allTechnicians) {
            const sheetBaseName = `${technician.name}-${technician.employeeCode || technician.id.slice(0, 5)}`;

            if (includeDirectTools) {
                const toolsSheetName = createUniqueSheetName(sheetBaseName + '-Herramientas');
                const toolsSheet = workbook.addWorksheet(toolsSheetName);
                setupTechnicianToolsSheet(toolsSheet, technician);
            }

            if (includeLockerTools && technician.lockers && technician.lockers.length > 0) {
                technician.lockers.forEach((locker, lockerIndex) => {
                    const lockerSheetName = createUniqueSheetName(sheetBaseName + '-Cas' + (technician.lockers!.length > 1 ? `-${lockerIndex + 1}` : ''));
                    const lockersSheet = workbook.addWorksheet(lockerSheetName);
                    setupLockerSheet(lockersSheet, technician, locker);
                });
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        downloadFile(
            buffer,
            `exportacion_tecnicos_${selectedSpecialty || 'todos'}_${new Date().toISOString().split('T')[0]}.xlsx`
        );
    };

    const exportPerTechnician = async (allTechnicians: Technician[]) => {
        for (const technician of allTechnicians) {
            const workbook = new ExcelJS.Workbook();
            const sheetBaseName = `${technician.name}-${technician.employeeCode || technician.id.slice(0, 5)}`;

            if (includeDirectTools) {
                const toolsSheetName = (sheetBaseName + '-Herramientas').slice(0, 31);
                const toolsSheet = workbook.addWorksheet(toolsSheetName);
                setupTechnicianToolsSheet(toolsSheet, technician);
            }

            if (includeLockerTools && technician.lockers && technician.lockers.length > 0) {
                technician.lockers.forEach((locker, lockerIndex) => {
                    const suffix = technician.lockers!.length > 1 ? `-${lockerIndex + 1}` : '';
                    const lockerSheetName = (sheetBaseName + '-Cas' + suffix).slice(0, 31);
                    const lockersSheet = workbook.addWorksheet(lockerSheetName);
                    setupLockerSheet(lockersSheet, technician, locker);
                });
            }

            const buffer = await workbook.xlsx.writeBuffer();
            downloadFile(
                buffer,
                `${technician.name}-${technician.employeeCode || technician.id.slice(0, 5)}_${new Date().toISOString().split('T')[0]}.xlsx`
            );
        }
    };

    const setupTechnicianToolsSheet = (worksheet: ExcelJS.Worksheet, technician: Technician) => {
        // Title
        const titleRow = worksheet.addRow([`Técnico: ${technician.name} (${technician.employeeCode || 'S/C'})`]);
        titleRow.font = { bold: true, size: 14 };
        worksheet.addRow([]);

        // Header
        const headerRow = worksheet.addRow(['N°', 'Parte', 'Item', 'Cantidad', 'Complemento', '¿Tiene?', '¿Está Limpio?', 'Observaciones']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        let rowIndex = 4;
        let counterNum = 1;

        if (technician.tools && technician.tools.length > 0) {
            technician.tools.forEach((tool) => {
                // Find corresponding evaluation item if exists
                let evaluationItem = undefined;
                if (technician.evaluations && technician.evaluations.length > 0) {
                    for (const evaluation of technician.evaluations) {
                        const evalItem = evaluation.evaluationItems.find(item => item.toolId === tool.id);
                        if (evalItem) {
                            evaluationItem = evalItem;
                            break;
                        }
                    }
                }

                const row = worksheet.addRow([
                    counterNum,
                    tool.partLabel || '-',
                    tool.toolCatalog.item,
                    evaluationItem?.quantityObserved || tool.quantity || '-',
                    evaluationItem?.complementObserved || '-',
                    evaluationItem ? (evaluationItem.hasItem ? '✓' : '✗') : '-',
                    evaluationItem ? (evaluationItem.isClean ? '✓' : '✗') : '-',
                    evaluationItem?.observations || '-',
                ]);

                if (rowIndex % 2 === 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
                }
                rowIndex++;
                counterNum++;
            });
        } else {
            const emptyRow = worksheet.addRow(['No hay herramientas directas']);
            emptyRow.font = { italic: true, color: { argb: 'FF999999' } };
        }

        worksheet.columns = [
            { width: 6 },
            { width: 20 },
            { width: 30 },
            { width: 12 },
            { width: 18 },
            { width: 10 },
            { width: 14 },
            { width: 30 },
        ];
    };

    const setupLockerSheet = (
        worksheet: ExcelJS.Worksheet,
        technician: Technician,
        locker: {
            id: string;
            number: number;
            name: string;
            tools: {
                id: string;
                quantity: number;
                toolCatalog: { item: string };
                partLabel?: string;
            }[];
        }
    ) => {
        // Title
        const titleRow = worksheet.addRow([`Técnico: ${technician.name} (${technician.employeeCode || 'S/C'}) - ${locker.name}`]);
        titleRow.font = { bold: true, size: 14 };
        worksheet.addRow([]);

        // Header
        const headerRow = worksheet.addRow(['N°', 'Parte', 'Item', 'Cantidad', 'Complemento', '¿Tiene?', '¿Está Limpio?', 'Observaciones']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9333EA' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        let rowIndex = 4;
        let counterNum = 1;

        if (locker.tools && locker.tools.length > 0) {
            locker.tools.forEach((tool) => {
                // Find corresponding evaluation item if exists
                let evaluationItem = undefined;
                if (technician.evaluations && technician.evaluations.length > 0) {
                    for (const evaluation of technician.evaluations) {
                        const evalItem = evaluation.evaluationItems.find(item => item.lockerToolId === tool.id);
                        if (evalItem) {
                            evaluationItem = evalItem;
                            break;
                        }
                    }
                }

                const row = worksheet.addRow([
                    counterNum,
                    tool.partLabel || '-',
                    tool.toolCatalog.item,
                    evaluationItem?.quantityObserved || tool.quantity || '-',
                    evaluationItem?.complementObserved || '-',
                    evaluationItem ? (evaluationItem.hasItem ? '✓' : '✗') : '-',
                    evaluationItem ? (evaluationItem.isClean ? '✓' : '✗') : '-',
                    evaluationItem?.observations || '-',
                ]);

                if (rowIndex % 2 === 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E5F5' } };
                }
                rowIndex++;
                counterNum++;
            });
        } else {
            const emptyRow = worksheet.addRow(['No hay herramientas en este casillero']);
            emptyRow.font = { italic: true, color: { argb: 'FF999999' } };
        }

        worksheet.columns = [
            { width: 6 },
            { width: 20 },
            { width: 30 },
            { width: 12 },
            { width: 18 },
            { width: 10 },
            { width: 14 },
            { width: 30 },
        ];
    };

    const downloadFile = (buffer: any, filename: string) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Download size={32} className="text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Exportar Datos</h1>
                    <p className="text-gray-600 mt-1">Exporta evaluaciones, herramientas y casilleros de técnicos a Excel (una hoja por técnico)</p>
                </div>
            </div>

            <Card className="p-6 space-y-6">
                {/* Specialty Filter */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Filtrar por Especialidad</h2>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant={selectedSpecialty === null ? 'default' : 'outline'}
                            onClick={() => setSelectedSpecialty(null)}
                            className={selectedSpecialty === null ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                        >
                            Todos
                        </Button>
                        {SPECIALTIES.map((specialty) => (
                            <Button
                                key={specialty}
                                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                                onClick={() => setSelectedSpecialty(specialty)}
                                className={selectedSpecialty === specialty ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                            >
                                {specialty}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Evaluation Status Filter */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Filtrar por Evaluación</h2>
                    <div className="flex flex-wrap gap-3">
                        {EVALUATION_STATUS.map((status) => (
                            <Button
                                key={status.value}
                                variant={evaluationStatus === status.value ? 'default' : 'outline'}
                                onClick={() => setEvaluationStatus(status.value)}
                                className={evaluationStatus === status.value ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                            >
                                {status.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content Options */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Contenido a Exportar</h2>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={includeDirectTools}
                                onChange={() => setIncludeDirectTools(!includeDirectTools)}
                                className="w-4 h-4"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Herramientas directas</p>
                                <p className="text-sm text-gray-600">Herramientas asignadas directamente a técnicos (hoja por técnico)</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={includeLockerTools}
                                onChange={() => setIncludeLockerTools(!includeLockerTools)}
                                className="w-4 h-4"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Casilleros</p>
                                <p className="text-sm text-gray-600">Herramientas almacenadas en casilleros con identificador (hoja por técnico)</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Document Type Options */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Tipo de Documento</h2>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: documentType === 'single' ? '#4F46E5' : '#D1D5DB' }}>
                            <input
                                type="radio"
                                name="documentType"
                                checked={documentType === 'single'}
                                onChange={() => setDocumentType('single')}
                                className="w-4 h-4"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Todo en un solo Excel</p>
                                <p className="text-sm text-gray-600">Todos los técnicos y sus herramientas en un único archivo con múltiples hojas</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: documentType === 'per_technician' ? '#4F46E5' : '#D1D5DB' }}>
                            <input
                                type="radio"
                                name="documentType"
                                checked={documentType === 'per_technician'}
                                onChange={() => setDocumentType('per_technician')}
                                className="w-4 h-4"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Por técnico un archivo Excel</p>
                                <p className="text-sm text-gray-600">Un archivo Excel independiente para cada técnico (descargará múltiples archivos)</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={exportToExcel}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 flex items-center gap-2"
                    >
                        <Download size={20} />
                        {loading ? 'Exportando...' : 'Descargar Excel'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
