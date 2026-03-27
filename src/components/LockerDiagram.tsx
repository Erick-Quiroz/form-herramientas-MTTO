'use client';

export function LockerDiagram() {
    const sections = [
        { label: "A\nLateral", color: "#4A90E2" },
        { label: "B\nCompart. 1", color: "#FFA500" },
        { label: "C\nCentro", color: "#87CEEB" },
        { label: "D\nCompart. 2", color: "#FFA500" },
        { label: "E\nLateral", color: "#4A90E2" }
    ];

    return (
        <div className="w-full bg-white p-4 rounded-lg border border-gray-300 mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Estructura de Casillero</h3>
            <div className="flex flex-col gap-0 w-full rounded border border-gray-400 overflow-hidden">
                {sections.map((section, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-center text-center text-white font-bold text-xs py-4 hover:opacity-80 transition border-b border-gray-400 last:border-b-0"
                        style={{
                            backgroundColor: section.color,
                            fontSize: "11px",
                            minHeight: "50px"
                        }}
                        title={section.label}
                    >
                        <span className="whitespace-pre-line">{section.label}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Estructura vertical del casillero
            </p>
        </div>
    );
}
