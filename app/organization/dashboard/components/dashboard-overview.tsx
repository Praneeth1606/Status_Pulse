"use client";

import React from "react";
import StatusBadge from "@/components/StatusBadge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Service, Incident, Maintenance } from "@prisma/client";

export function DashboardOverview({
  services,
  incidents,
  maintenances,
}: {
  services: Service[];
  incidents: Incident[];
  maintenances: Maintenance[];
}) {
  const activeIncidents = incidents.filter((inc) => inc.status !== "resolved");
  const activeMaintenances = maintenances.filter(
    (m) => m.status !== "completed"
  );

  // Count services by status
  const serviceStatusCount = {
    operational: services.filter((s) => s.status === "operational").length,
    degraded: services.filter((s) => s.status === "degraded").length,
    partialOutage: services.filter((s) => s.status === "partialOutage").length,
    majorOutage: services.filter((s) => s.status === "majorOutage").length,
    maintenance: services.filter((s) => s.status === "maintenance").length,
  };

  // Function to determine overall system status
  const getOverallStatus = () => {
    if (serviceStatusCount.majorOutage > 0) return "majorOutage";
    if (serviceStatusCount.partialOutage > 0) return "partialOutage";
    if (serviceStatusCount.degraded > 0 || serviceStatusCount.maintenance > 0)
      return "degraded";
    return "operational";
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <StatusBadge
                status={overallStatus}
                size="lg"
                animate={overallStatus !== "operational"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeIncidents.length}</div>
          </CardContent>
          <CardFooter>
            <Link href="/organization/incidents">
              <Button variant="outline" size="sm">
                Manage Incidents
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Scheduled Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeMaintenances.length}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/organization/maintenance">
              <Button variant="outline" size="sm">
                Manage Maintenance
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Service Status Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-2">
              <StatusBadge status="operational" />
            </div>
            <div className="text-2xl font-bold">
              {serviceStatusCount.operational}
            </div>
            <div className="text-sm text-gray-500">Operational</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-2">
              <StatusBadge status="degraded" />
            </div>
            <div className="text-2xl font-bold">
              {serviceStatusCount.degraded}
            </div>
            <div className="text-sm text-gray-500">Degraded</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-2">
              <StatusBadge status="partialOutage" />
            </div>
            <div className="text-2xl font-bold">
              {serviceStatusCount.partialOutage}
            </div>
            <div className="text-sm text-gray-500">Partial Outage</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-2">
              <StatusBadge status="majorOutage" />
            </div>
            <div className="text-2xl font-bold">
              {serviceStatusCount.majorOutage}
            </div>
            <div className="text-sm text-gray-500">Major Outage</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-2">
              <StatusBadge status="maintenance" />
            </div>
            <div className="text-2xl font-bold">
              {serviceStatusCount.maintenance}
            </div>
            <div className="text-sm text-gray-500">Maintenance</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Incidents
            </h3>
            <Link href="/organization/incidents">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {incidents.slice(0, 3).map((incident) => (
              <div
                key={incident.id}
                className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{incident.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      incident.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {incident.status.charAt(0).toUpperCase() +
                      incident.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No incidents reported</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Upcoming Maintenance
            </h3>
            <Link href="/organization/maintenance">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {activeMaintenances.slice(0, 3).map((maintenance) => (
              <div
                key={maintenance.id}
                className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{maintenance.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      maintenance.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {maintenance.status === "scheduled"
                      ? "Scheduled"
                      : "In Progress"}
                  </span>
                </div>
              </div>
            ))}

            {activeMaintenances.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No upcoming maintenance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
