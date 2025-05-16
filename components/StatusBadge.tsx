import { ServiceStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export default function StatusBadge({
  status,
  size = "md",
  animate = false,
}: StatusBadgeProps) {
  const getStatusColor = (status: ServiceStatus): string => {
    switch (status) {
      case ServiceStatus.operational:
        return "bg-green-500";
      case ServiceStatus.degraded:
        return "bg-yellow-500";
      case ServiceStatus.partialOutage:
        return "bg-orange-500";
      case ServiceStatus.majorOutage:
        return "bg-red-500";
      case ServiceStatus.maintenance:
        return "bg-sky-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSizeClass = (size: string): string => {
    switch (size) {
      case "sm":
        return "w-2 h-2";
      case "lg":
        return "w-4 h-4";
      case "md":
      default:
        return "w-3 h-3";
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={cn(
          "rounded-full",
          getSizeClass(size),
          getStatusColor(status),
          { "animate-pulse": animate }
        )}
      />
      {animate && (
        <div
          className={cn(
            "absolute rounded-full opacity-75",
            getSizeClass(size),
            getStatusColor(status),
            "animate-ping"
          )}
        />
      )}
    </div>
  );
}
