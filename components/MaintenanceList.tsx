import { MaintenanceStatus, Maintenance } from "@prisma/client";

interface MaintenanceListProps {
  maintenances: (Maintenance & {
    updates: {
      id: string;
      message: string;
      status: MaintenanceStatus;
      createdAt: Date;
      createdBy: string;
    }[];
  })[];
}

const statusConfig: Record<
  MaintenanceStatus,
  { label: string; color: string }
> = {
  [MaintenanceStatus.scheduled]: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800",
  },
  [MaintenanceStatus.in_progress]: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
  },
  [MaintenanceStatus.completed]: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
};

export default function MaintenanceList({
  maintenances,
}: MaintenanceListProps) {
  return (
    <div className="space-y-4">
      {maintenances.map((maintenance) => (
        <div
          key={maintenance.id}
          className="bg-white rounded-lg shadow p-4 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{maintenance.title}</h3>
              <p className="text-gray-600">{maintenance.description}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                statusConfig[maintenance.status as MaintenanceStatus].color
              }`}
            >
              {statusConfig[maintenance.status as MaintenanceStatus].label}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Start: {new Date(maintenance.startTime).toLocaleString()}</p>
            <p>End: {new Date(maintenance.endTime).toLocaleString()}</p>
          </div>
          {maintenance.updates.length > 0 && (
            <div className="mt-2 space-y-2">
              <h4 className="font-medium">Updates:</h4>
              {maintenance.updates.map((update) => (
                <div key={update.id} className="bg-gray-50 rounded p-2 text-sm">
                  <p className="text-gray-700">{update.message}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(update.createdAt).toLocaleString()} by{" "}
                    {update.createdBy}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
