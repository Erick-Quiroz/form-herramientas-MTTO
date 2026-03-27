'use client';

export function PartDiagram() {
  const parts = [
    { label: "A\nNivel 1", color: "#90EE90", width: "12%" },
    { label: "B\nNivel 2", color: "#FFA500", width: "15%" },
    { label: "C\nParte Inferior", color: "#87CEEB", width: "46%" },
    { label: "D\nNivel 2", color: "#FFA500", width: "15%" },
    { label: "E\nNivel 1", color: "#90EE90", width: "12%" }
  ];

  return (
    <div className="hidden w-full bg-white p-4 rounded-lg border border-gray-300 mb-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Estructura de Partes</h3>
      <div className="flex gap-0 w-full h-20 rounded border border-gray-400">
        {parts.map((part, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center text-center text-white font-bold text-xs whitespace-pre-line hover:opacity-80 transition"
            style={{
              backgroundColor: part.color,
              width: part.width,
              fontSize: "10px"
            }}
            title={part.label}
          >
            {part.label}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Selecciona una parte para crear herramientas asociadas
      </p>
    </div>
  );
}
