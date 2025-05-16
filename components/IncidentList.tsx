import { IncidentStatus, Incident } from "@prisma/client";
import { cn } from "@/lib/utils";

interface IncidentListProps {
  incidents: (Incident & {
    updates: {
      id: string;
      message: string;
      status: IncidentStatus;
      createdAt: Date;
      createdBy: string;
    }[];
  })[];
}

const statusConfig: Record<IncidentStatus, { label: string; color: string }> = {
  investigating: {
    label: "Investigating",
    color: "bg-yellow-500",
  },
  identified: {
    label: "Identified",
    color: "bg-orange-500",
  },
  monitoring: {
    label: "Monitoring",
    color: "bg-blue-500",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-500",
  },
};

export function IncidentList({ incidents }: IncidentListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Incidents</h2>
      <div className="space-y-4">
        {incidents.map((incident) => {
          const config = statusConfig[incident.status as IncidentStatus];
          return (
            <div key={incident.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{incident.title}</h3>
                <div className="flex items-center space-x-2">
                  <div className={cn("h-2 w-2 rounded-full", config.color)} />
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {incident.description}
              </p>
              <div className="text-xs text-gray-500">
                {new Date(incident.createdAt).toLocaleString()}
              </div>
              {incident.updates && incident.updates.length > 0 && (
                <div className="mt-2 space-y-2">
                  {incident.updates.map((update) => {
                    const updateConfig = statusConfig[update.status];
                    return (
                      <div
                        key={update.id}
                        className="text-sm bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                updateConfig.color
                              )}
                            />
                            <span className="font-medium">
                              {updateConfig.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(update.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{update.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
