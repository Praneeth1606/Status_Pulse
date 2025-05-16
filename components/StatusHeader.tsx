import { cn } from "@/lib/utils";
import { ServiceStatus } from "@prisma/client";
interface StatusHeaderProps {
  status: ServiceStatus;
}

const statusConfig = {
  [ServiceStatus.operational]: {
    label: "All Systems Operational",
    color: "bg-green-500",
  },
  [ServiceStatus.degraded]: {
    label: "Degraded Performance",
    color: "bg-yellow-500",
  },
  [ServiceStatus.partialOutage]: {
    label: "Partial System Outage",
    color: "bg-orange-500",
  },
  [ServiceStatus.majorOutage]: {
    label: "Major System Outage",
    color: "bg-red-500",
  },
  [ServiceStatus.maintenance]: {
    label: "Under Maintenance",
    color: "bg-blue-500",
  },
};

export function StatusHeader({ status }: StatusHeaderProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={cn("h-3 w-3 rounded-full", config.color)} />
        <h1 className="text-2xl font-semibold">{config.label}</h1>
      </div>
      <div className="text-sm text-gray-500">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
