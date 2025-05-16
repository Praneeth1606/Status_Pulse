"use client";

import React from "react";
import type {
  Service,
  Incident,
  Maintenance,
  ServiceGroup,
} from "@prisma/client";
import {
  ServiceStatus,
  IncidentStatus,
  type IncidentImpact,
  MaintenanceStatus,
} from "@prisma/client";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import ServiceCard from "@/components/ServiceCard";
import IncidentCard from "@/components/IncidentCard";
import MaintenanceCard from "@/components/MaintenanceCard";
import FilterControls from "@/components/FireControls";
import { getOverallStatusText } from "@/utils/statusUtils";
import { Button } from "@/components/ui/button";

interface StatusDashboardProps {
  services: (Omit<Service, "status"> & { status: ServiceStatus } & {
    group?: ServiceGroup | null;
  })[];
  incidents: (Omit<Incident, "status" | "impact"> & {
    status: IncidentStatus;
    impact: IncidentImpact;
    affectedServices: { id: string }[];
    updates: {
      id: string;
      message: string;
      status: IncidentStatus;
      createdAt: Date;
      createdBy: string;
    }[];
  })[];
  maintenances: (Omit<Maintenance, "status"> & {
    status: MaintenanceStatus;
    affectedServices: { id: string }[];
    updates: {
      id: string;
      message: string;
      status: MaintenanceStatus;
      createdAt: Date;
      createdBy: string;
    }[];
  })[];
  serviceGroups: ServiceGroup[];
}

export default function StatusDashboard({
  services,
  incidents,
  maintenances,
  serviceGroups,
}: StatusDashboardProps) {
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [statusFilters, setStatusFilters] = React.useState<ServiceStatus[]>([]);
  const [groupFilters, setGroupFilters] = React.useState<string[]>([]);

  const clearFilters = () => {
    setStatusFilters([]);
    setGroupFilters([]);
  };

  const getServiceStatus = (
    service: Omit<Service, "status"> & { status: ServiceStatus }
  ): ServiceStatus => {
    // Check if there are any active incidents affecting this service
    const hasActiveIncidents = incidents.some(
      (incident) =>
        incident.status !== IncidentStatus.resolved &&
        incident.affectedServices.some((s) => s.id === service.id)
    );

    // Check if there are any active maintenances affecting this service
    const hasActiveMaintenance = maintenances.some(
      (maintenance) =>
        maintenance.status === MaintenanceStatus.in_progress &&
        maintenance.affectedServices.some((s) => s.id === service.id)
    );

    if (hasActiveIncidents) {
      return ServiceStatus.degraded;
    }

    if (hasActiveMaintenance) {
      return ServiceStatus.maintenance;
    }

    return service.status;
  };

  const getOverallStatus = (): ServiceStatus => {
    const serviceStatuses = services.map(getServiceStatus);
    if (serviceStatuses.includes(ServiceStatus.majorOutage)) {
      return ServiceStatus.majorOutage;
    }
    if (serviceStatuses.includes(ServiceStatus.partialOutage)) {
      return ServiceStatus.partialOutage;
    }
    if (serviceStatuses.includes(ServiceStatus.degraded)) {
      return ServiceStatus.degraded;
    }
    if (serviceStatuses.includes(ServiceStatus.maintenance)) {
      return ServiceStatus.maintenance;
    }
    return ServiceStatus.operational;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh - in a real app, you would fetch new data here
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const overallStatus = getOverallStatus();
  const activeIncidents = incidents.filter(
    (inc) => inc.status !== IncidentStatus.resolved
  );
  const activeMaintenances = maintenances.filter(
    (mnt) =>
      mnt.status === MaintenanceStatus.scheduled ||
      mnt.status === MaintenanceStatus.in_progress
  );

  // Get services grouped by their group
  const groupedServices = serviceGroups
    .map((group) => ({
      group,
      services: services.filter((service) => service.groupId === group.id),
    }))
    .filter(({ services }) => services.length > 0);

  // Get services without a group
  const ungroupedServices = services.filter((service) => !service.groupId);

  // Get status color class
  const getStatusColorClass = (status: ServiceStatus): string => {
    switch (status) {
      case ServiceStatus.operational:
        return "bg-green-50 text-green-700 border-green-200";
      case ServiceStatus.degraded:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case ServiceStatus.partialOutage:
        return "bg-orange-50 text-orange-700 border-orange-200";
      case ServiceStatus.majorOutage:
        return "bg-red-50 text-red-700 border-red-200";
      case ServiceStatus.maintenance:
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.operational:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ServiceStatus.degraded:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ServiceStatus.partialOutage:
      case ServiceStatus.majorOutage:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case ServiceStatus.maintenance:
        return <Clock className="h-5 w-5 text-sky-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Add keyboard accessibility for service cards
  const handleServiceCardKeyDown = (
    e: React.KeyboardEvent,
    serviceId: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Here you would trigger the same action as clicking the service card
      console.log(`Service ${serviceId} activated via keyboard`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 z-50"
      >
        Skip to main content
      </a>

      {/* Add id to the main content */}
      <div id="main-content">
        {/* Status Header */}
        <Card
          className={cn("mb-8 overflow-hidden border-t-4 shadow-sm", {
            "border-t-green-500": overallStatus === ServiceStatus.operational,
            "border-t-yellow-500": overallStatus === ServiceStatus.degraded,
            "border-t-orange-500":
              overallStatus === ServiceStatus.partialOutage,
            "border-t-red-500": overallStatus === ServiceStatus.majorOutage,
            "border-t-sky-500": overallStatus === ServiceStatus.maintenance,
          })}
        >
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div
                className={cn(
                  "w-full md:w-auto p-6 flex items-center gap-4",
                  getStatusColorClass(overallStatus)
                )}
              >
                {getStatusIcon(overallStatus)}
                <div>
                  <h1 className="text-2xl font-bold">
                    {getOverallStatusText(overallStatus)}
                  </h1>
                  <p className="text-sm opacity-80">
                    System Status as of{" "}
                    <time dateTime={lastUpdated.toISOString()}>
                      {lastUpdated.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </time>
                  </p>
                </div>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="text-sm text-gray-500 hidden md:block">
                  <span className="font-medium">Last checked:</span>{" "}
                  <time dateTime={lastUpdated.toISOString()}>
                    {lastUpdated.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus-visible:ring-offset-2"
                  disabled={isRefreshing}
                  aria-label="Refresh status information"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", { "animate-spin": isRefreshing })}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents & Maintenance */}
        {(activeIncidents.length > 0 || activeMaintenances.length > 0) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-500" />
                Active Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={
                  activeIncidents.length > 0 ? "incidents" : "maintenance"
                }
              >
                <TabsList className="mb-4 p-1 bg-gray-100 border border-gray-200">
                  <TabsTrigger
                    value="incidents"
                    disabled={activeIncidents.length === 0}
                    className={cn(
                      "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                      activeIncidents.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Incidents
                      {activeIncidents.length > 0 && (
                        <Badge variant="destructive" className="ml-1">
                          {activeIncidents.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="maintenance"
                    disabled={activeMaintenances.length === 0}
                    className={cn(
                      "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                      activeMaintenances.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Maintenance
                      {activeMaintenances.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeMaintenances.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="incidents" className="space-y-4 mt-0">
                  {activeIncidents.length > 0 ? (
                    activeIncidents.map((incident) => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No active incidents</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4 mt-0">
                  {activeMaintenances.length > 0 ? (
                    activeMaintenances.map((maintenance) => (
                      <MaintenanceCard
                        key={maintenance.id}
                        maintenance={maintenance}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No scheduled maintenance</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                Services Status
              </CardTitle>

              <FilterControls
                statusFilters={statusFilters}
                setStatusFilters={setStatusFilters}
                groupFilters={groupFilters}
                setGroupFilters={setGroupFilters}
                groups={serviceGroups}
                clearFilters={clearFilters}
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter the services based on the selected filters */}
            {(() => {
              // Apply filters
              let filteredGroups = [...groupedServices];
              let filteredUngrouped = [...ungroupedServices];

              // Apply status filters
              if (statusFilters.length > 0) {
                filteredGroups = filteredGroups
                  .map((group) => ({
                    ...group,
                    services: group.services.filter((service) =>
                      statusFilters.includes(getServiceStatus(service))
                    ),
                  }))
                  .filter((group) => group.services.length > 0);

                filteredUngrouped = filteredUngrouped.filter((service) =>
                  statusFilters.includes(getServiceStatus(service))
                );
              }

              // Apply group filters
              if (groupFilters.length > 0) {
                filteredGroups = filteredGroups.filter((group) =>
                  groupFilters.includes(group.group.id)
                );

                // If group filters are active, don't show ungrouped services
                // unless there's a specific "ungrouped" filter option
                filteredUngrouped = [];
              }

              // Check if we have any services to display after filtering
              const hasServices =
                filteredGroups.length > 0 || filteredUngrouped.length > 0;

              if (!hasServices) {
                return (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">
                      No services match the selected filters
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                );
              }

              return (
                <>
                  {/* Grouped services */}
                  {filteredGroups.map(({ group, services }, index) => (
                    <React.Fragment key={group.id}>
                      {index > 0 && <Separator className="my-6" />}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                          {group.name}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {services.map((service) => (
                            <div
                              key={service.id}
                              tabIndex={0}
                              role="button"
                              onKeyDown={(e) =>
                                handleServiceCardKeyDown(e, service.id)
                              }
                              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 rounded-lg"
                            >
                              <ServiceCard service={service} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Ungrouped services */}
                  {filteredUngrouped.length > 0 && (
                    <>
                      {filteredGroups.length > 0 && (
                        <Separator className="my-6" />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                          Other Services
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {filteredUngrouped.map((service) => (
                            <div
                              key={service.id}
                              tabIndex={0}
                              role="button"
                              onKeyDown={(e) =>
                                handleServiceCardKeyDown(e, service.id)
                              }
                              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 rounded-lg"
                            >
                              <ServiceCard service={service} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
