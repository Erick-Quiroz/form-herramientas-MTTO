// Navigation constants
export const NAVIGATION_ITEMS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/technicians", label: "Técnicos", icon: "users" },
  { href: "/materials", label: "Materiales", icon: "package" },
  { href: "/lockers", label: "Casilleros", icon: "inbox" },
  { href: "/evaluation", label: "Evaluación", icon: "clipboard-check" },
  { href: "/reports", label: "Reportes", icon: "bar-chart" },
];

// Evaluation status
export const EVALUATION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

// Locker status
export const LOCKER_STATUS = {
  AVAILABLE: "available",
  IN_USE: "in_use",
  MAINTENANCE: "maintenance",
} as const;
