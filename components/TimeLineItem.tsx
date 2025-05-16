import React from "react";
import { formatTimeAgo } from "@/utils/dateUtils";
import {
  getIncidentStatusColor,
  getMaintenanceStatusColor,
} from "@/utils/statusUtils";
import { IncidentStatus, MaintenanceStatus } from "@prisma/client";

interface TimelineItemProps {
  title: string;
  message: string;
  timestamp: string;
  status?: IncidentStatus | MaintenanceStatus;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  message,
  timestamp,
  status,
}) => {
  const getStatusColor = (status: IncidentStatus | MaintenanceStatus) => {
    if (Object.values(IncidentStatus).includes(status as IncidentStatus)) {
      return getIncidentStatusColor(status as IncidentStatus);
    }
    return getMaintenanceStatusColor(status as MaintenanceStatus);
  };

  const getStatusText = (status: IncidentStatus | MaintenanceStatus) => {
    if (Object.values(IncidentStatus).includes(status as IncidentStatus)) {
      return (
        (status as IncidentStatus).charAt(0).toUpperCase() +
        (status as IncidentStatus).slice(1)
      );
    }
    switch (status as MaintenanceStatus) {
      case MaintenanceStatus.scheduled:
        return "Scheduled";
      case MaintenanceStatus.in_progress:
        return "In Progress";
      case MaintenanceStatus.completed:
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className="pb-6 relative">
      <div className="absolute top-0 bottom-0 left-2.5 w-px bg-gray-200"></div>
      <div className="flex items-start">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 border-2 border-white z-10">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        </div>
        <div className="ml-4 bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">{title}</h4>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(timestamp)}
            </span>
          </div>
          {status && (
            <div className="mb-2">
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                  status
                )}`}
              >
                {getStatusText(status)}
              </span>
            </div>
          )}
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
