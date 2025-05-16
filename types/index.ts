export type StatusType =
  | "operational"
  | "degraded"
  | "partialOutage"
  | "majorOutage"
  | "maintenance";

export interface Service {
  id: string;
  name: string;
  description: string;
  status: StatusType;
  updatedAt: string;
  groupId?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
}

export interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  impact: "none" | "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  affectedServices: string[];
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  message: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  createdAt: string;
  createdBy: string;
}

export interface Maintenance {
  id: string;
  title: string;
  status: "scheduled" | "in_progress" | "completed";
  scheduledStart: string;
  scheduledEnd: string;
  createdAt: string;
  affectedServices: string[];
  updates: MaintenanceUpdate[];
}

export interface MaintenanceUpdate {
  id: string;
  maintenanceId: string;
  message: string;
  status: "scheduled" | "in_progress" | "completed";
  createdAt: string;
  createdBy: string;
}
