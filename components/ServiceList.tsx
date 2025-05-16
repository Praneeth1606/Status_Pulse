import { cn } from "@/lib/utils";
import { ServiceStatus, Service } from "@prisma/client";

interface ServiceListProps {
  services: Service[];
}

const statusConfig: Record<ServiceStatus, { label: string; color: string }> = {
  [ServiceStatus.operational]: {
    label: "Operational",
    color: "bg-green-500",
  },
  [ServiceStatus.degraded]: {
    label: "Degraded",
    color: "bg-yellow-500",
  },
  [ServiceStatus.partialOutage]: {
    label: "Partial Outage",
    color: "bg-orange-500",
  },
  [ServiceStatus.majorOutage]: {
    label: "Major Outage",
    color: "bg-red-500",
  },
  [ServiceStatus.maintenance]: {
    label: "Under Maintenance",
    color: "bg-blue-500",
  },
};

export function ServiceList({ services }: ServiceListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Services</h2>
      <div className="space-y-4">
        {services.map((service) => {
          const config = statusConfig[service.status as ServiceStatus];
          return (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500">{service.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn("h-2 w-2 rounded-full", config.color)} />
                <span className="text-sm text-gray-600">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
