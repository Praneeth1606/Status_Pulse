import {
  ServiceStatus,
  IncidentStatus,
  IncidentImpact,
  MaintenanceStatus,
} from "@prisma/client";

export const getStatusColor = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.operational:
      return "bg-status-operational";
    case ServiceStatus.degraded:
      return "bg-status-degraded";
    case ServiceStatus.partialOutage:
      return "bg-status-partialOutage";
    case ServiceStatus.majorOutage:
      return "bg-status-majorOutage";
    case ServiceStatus.maintenance:
      return "bg-status-maintenance";
    default:
      return "bg-gray-400";
  }
};

export const getStatusText = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.operational:
      return "Operational";
    case ServiceStatus.degraded:
      return "Degraded Performance";
    case ServiceStatus.partialOutage:
      return "Partial Outage";
    case ServiceStatus.majorOutage:
      return "Major Outage";
    case ServiceStatus.maintenance:
      return "Maintenance";
    default:
      return "Unknown";
  }
};

export const getStatusTextColor = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.operational:
      return "text-status-operational";
    case ServiceStatus.degraded:
      return "text-status-degraded";
    case ServiceStatus.partialOutage:
      return "text-status-partialOutage";
    case ServiceStatus.majorOutage:
      return "text-status-majorOutage";
    case ServiceStatus.maintenance:
      return "text-status-maintenance";
    default:
      return "text-gray-400";
  }
};

export const getIncidentImpactColor = (impact: IncidentImpact): string => {
  switch (impact) {
    case IncidentImpact.none:
      return "bg-green-100 text-green-800";
    case IncidentImpact.minor:
      return "bg-yellow-100 text-yellow-800";
    case IncidentImpact.major:
      return "bg-orange-100 text-orange-800";
    case IncidentImpact.critical:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getIncidentStatusColor = (status: IncidentStatus): string => {
  switch (status) {
    case IncidentStatus.investigating:
      return "bg-red-100 text-red-800";
    case IncidentStatus.identified:
      return "bg-orange-100 text-orange-800";
    case IncidentStatus.monitoring:
      return "bg-blue-100 text-blue-800";
    case IncidentStatus.resolved:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getMaintenanceStatusColor = (
  status: MaintenanceStatus
): string => {
  switch (status) {
    case MaintenanceStatus.scheduled:
      return "bg-blue-100 text-blue-800";
    case MaintenanceStatus.in_progress:
      return "bg-yellow-100 text-yellow-800";
    case MaintenanceStatus.completed:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getOverallStatusText = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.operational:
      return "All Systems Operational";
    case ServiceStatus.degraded:
      return "Some Systems Experiencing Degraded Performance";
    case ServiceStatus.partialOutage:
      return "Some Systems Experiencing Outages";
    case ServiceStatus.majorOutage:
      return "Major System Outage";
    case ServiceStatus.maintenance:
      return "Systems Under Maintenance";
    default:
      return "Unknown Status";
  }
};
