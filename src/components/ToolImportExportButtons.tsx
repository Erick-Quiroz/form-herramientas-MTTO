'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { toastError, toastSuccess, toastConfirm } from '@/lib/toast';

interface ToolImportData {
    parte: string;
    herramienta: string;
    cantidad: number;
    complemento: string;
}

interface ToolImportExportButtonsProps {
    onImport: (tools: ToolImportData[]) => void;
}

export default function ToolImportExportButtons({ onImport }: ToolImportExportButtonsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const downloadTemplate = () => {
        // Crear CSV con headers y ejemplos
        const headers = ['Parte', 'Herramienta', 'Cantidad', 'Complemento'];
        const examples = [
            ['Ejemplo', 'Destornillador Philips', '2', 'Magnético'],
            ['Ejemplo', 'Martillo', '1', 'Cabeza de goma'],
            ['Ejemplo', 'Llave Inglesa', '3', '']
        ];

        // Crear contenido CSV
        let csvContent = headers.join(',') + '\n';
        for (const example of examples) {
            csvContent += example.join(',') + '\n';
        }

        // Agregar BOM para UTF-8 (compatible con Excel en Windows)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'plantilla_herramientas.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toastSuccess('Plantilla descargada exitosamente');
    };

    const parseCSV = (csvContent: string): ToolImportData[] => {
        // Normalizar saltos de línea (manejar \r\n de Windows y \n de Unix)
        let normalized = csvContent.replace(/\r\n/g, '\n').trim();

        // Dividir por líneas
        let lines = normalized.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            console.warn('CSV muy corto, sin datos');
            return [];
        }

        // Detectar delimitador (coma o punto y coma)
        const headerLine = lines[0];
        let delimiter = ',';

        if (headerLine.includes(';') && !headerLine.includes(',')) {
            delimiter = ';';
        } else if (headerLine.includes('\t')) {
            delimiter = '\t';
        }

        console.log('Delimitador detectado:', delimiter);

        // Función para parsear línea CSV correctamente (maneja comillas)
        const parseCSVLine = (line: string, delim: string): string[] => {
            const result: string[] = [];
            let current = '';
            let insideQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];

                if (char === '"') {
                    if (insideQuotes && nextChar === '"') {
                        // Comilla escapada
                        current += '"';
                        i++;
                    } else {
                        // Toggle comilla
                        insideQuotes = !insideQuotes;
                    }
                } else if (char === delim && !insideQuotes) {
                    // Fin de celda
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }

            result.push(current.trim());
            return result;
        };

        // Parsear header
        const header = parseCSVLine(headerLine, delimiter);
        const lowerHeader = header.map(h => h.toLowerCase());

        console.log('Header encontrado:', header);

        // Buscar índices de columnas (pueden estar en cualquier orden)
        const parteIndex = lowerHeader.findIndex(h => h.includes('parte'));
        const herramientaIndex = lowerHeader.findIndex(h => h.includes('herramienta') || h.includes('nombre') || h.includes('item'));
        const cantidadIndex = lowerHeader.findIndex(h => h.includes('cantidad') || h.includes('qty'));
        const complementoIndex = lowerHeader.findIndex(h => h.includes('complemento') || h.includes('observacion') || h.includes('nota'));

        console.log('Índices:', { parteIndex, herramientaIndex, cantidadIndex, complementoIndex });

        if (herramientaIndex === -1) {
            console.error('No se encontró columna de Herramienta');
            return [];
        }

        const tools: ToolImportData[] = [];

        // Parsear datos
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line) continue;

            const cells = parseCSVLine(line, delimiter);

            // Validar que hay suficientes columnas
            if (cells.length < 2) continue;

            const herramienta = cells[herramientaIndex]?.trim() || '';

            // Solo procesar si hay herramienta
            if (!herramienta) {
                console.warn(`Fila ${i}: sin herramienta, saltando`);
                continue;
            }

            const parte = parteIndex >= 0 ? (cells[parteIndex]?.trim() || '') : '';
            const cantidadStr = cantidadIndex >= 0 ? (cells[cantidadIndex]?.trim() || '1') : '1';
            const complemento = complementoIndex >= 0 ? (cells[complementoIndex]?.trim() || '') : '';

            const cantidad = parseInt(cantidadStr) || 1;

            tools.push({
                parte,
                herramienta,
                cantidad,
                complemento
            });

            console.log(`Fila ${i} parseada:`, { parte, herramienta, cantidad, complemento });
        }

        return tools;
    };

    const parseExcel = async (file: File): Promise<ToolImportData[]> => {
        // Para archivos XLSX usamos una aproximación simple si es posible
        // Si es .xlsx, intentamos usar XLSX library o fallback a CSV

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Por ahora, mostrar error - se necesitaría librería externa
            toastError('Para archivos Excel, convierte a CSV primero o copia los datos');
            return [];
        }

        // Para archivos CSV
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const tools = parseCSV(content);
                    resolve(tools);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsText(file);
        });
    };

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                setIsLoading(true);

                const tools = await parseExcel(file);

                if (tools.length === 0) {
                    toastError('No se encontraron herramientas válidas en el archivo');
                    return;
                }

                // Mostrar preview antes de importar
                toastConfirm(
                    `Se encontraron ${tools.length} herramientas. ¿Deseas importarlas?`,
                    () => {
                        onImport(tools);
                        toastSuccess(`${tools.length} herramientas importadas exitosamente`);
                    }
                );
            } catch (error) {
                console.error('Error importing file:', error);
                toastError('Error al importar archivo');
            } finally {
                setIsLoading(false);
            }
        };

        input.click();
    };

    return (
        <div className="flex gap-2">
            <Button
                onClick={downloadTemplate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                disabled={isLoading}
            >
                <Download size={16} />
                Descargar Plantilla
            </Button>
            <Button
                onClick={handleImport}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                disabled={isLoading}
            >
                <Upload size={16} />
                {isLoading ? 'Importando...' : 'Importar CSV/Excel'}
            </Button>
        </div>
    );
}
