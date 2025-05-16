"use client"
import StatusBadge from "@/components/StatusBadge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Service, Incident, Maintenance } from "@prisma/client"
import { AlertTriangle, CheckCircle, Clock, Activity, ArrowRight } from "lucide-react"
import type { ServiceStatus } from "@prisma/client";
export function DashboardOverview({
  services,
  incidents,
  maintenances,
}: {
  services: Service[]
  incidents: Incident[]
  maintenances: Maintenance[]
}) {
  const activeIncidents = incidents.filter((inc) => inc.status !== "resolved")
  const activeMaintenances = maintenances.filter((m) => m.status !== "completed")

  // Count services by status
  const serviceStatusCount = {
    operational: services.filter((s) => s.status === "operational").length,
    degraded: services.filter((s) => s.status === "degraded").length,
    partialOutage: services.filter((s) => s.status === "partialOutage").length,
    majorOutage: services.filter((s) => s.status === "majorOutage").length,
    maintenance: services.filter((s) => s.status === "maintenance").length,
  }

  // Function to determine overall system status
  const getOverallStatus = () => {
    if (serviceStatusCount.majorOutage > 0) return "majorOutage"
    if (serviceStatusCount.partialOutage > 0) return "partialOutage"
    if (serviceStatusCount.degraded > 0 || serviceStatusCount.maintenance > 0) return "degraded"
    return "operational"
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "majorOutage":
        return "Major System Outage"
      case "partialOutage":
        return "Partial System Outage"
      case "degraded":
        return "Degraded Performance"
      case "maintenance":
        return "Under Maintenance"
      default:
        return "All Systems Operational"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "majorOutage":
      case "partialOutage":
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "degraded":
        return <Activity className="h-6 w-6 text-yellow-500" />
      case "maintenance":
        return <Clock className="h-6 w-6 text-blue-500" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />
    }
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="space-y-8">
      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="overflow-hidden border-l-4 transition-all hover:shadow-md"
          style={{
            borderLeftColor:
              overallStatus === "operational"
                ? "#10b981"
                : overallStatus === "degraded"
                  ? "#f59e0b"
                  : overallStatus === "partialOutage"
                    ? "#ef4444"
                    : "#dc2626",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              System Status
            </CardTitle>
            <CardDescription>{getStatusMessage(overallStatus)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <StatusBadge status={overallStatus} size="lg" animate={overallStatus !== "operational"} />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Incidents
            </CardTitle>
            <CardDescription>
              {activeIncidents.length === 0
                ? "No active incidents"
                : `${activeIncidents.length} incident${activeIncidents.length > 1 ? "s" : ""} being tracked`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeIncidents.length}</div>
          </CardContent>
          <CardFooter>
            <Link href="/organization/incidents" className="w-full">
              <Button variant="outline" size="sm" className="w-full group">
                Manage Incidents
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Scheduled Maintenance
            </CardTitle>
            <CardDescription>
              {activeMaintenances.length === 0
                ? "No scheduled maintenance"
                : `${activeMaintenances.length} maintenance${activeMaintenances.length > 1 ? "s" : ""} planned`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeMaintenances.length}</div>
          </CardContent>
          <CardFooter>
            <Link href="/organization/maintenance" className="w-full">
              <Button variant="outline" size="sm" className="w-full group">
                Manage Maintenance
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Service Status Overview */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Service Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatusCard status="operational" count={serviceStatusCount.operational} label="Operational" />
          <StatusCard status="degraded" count={serviceStatusCount.degraded} label="Degraded" />
          <StatusCard status="partialOutage" count={serviceStatusCount.partialOutage} label="Partial Outage" />
          <StatusCard status="majorOutage" count={serviceStatusCount.majorOutage} label="Major Outage" />
          <StatusCard status="maintenance" count={serviceStatusCount.maintenance} label="Maintenance" />
        </div>
      </div>

      {/* Incidents and Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Recent Incidents</CardTitle>
              <Link href="/organization/incidents">
                <Button variant="ghost" size="sm" className="group">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.slice(0, 3).map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium mb-1">{incident.title}</h4>
                      <p className="text-sm text-gray-500 truncate">
                        {new Date(incident.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        incident.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : incident.status === "investigating"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}

              {incidents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">No incidents reported</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Upcoming Maintenance</CardTitle>
              <Link href="/organization/maintenance">
                <Button variant="ghost" size="sm" className="group">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeMaintenances.slice(0, 3).map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium mb-1">{maintenance.title}</h4>
                      <p className="text-sm text-gray-500 truncate">
                        {new Date(maintenance.startTime || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        maintenance.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {maintenance.status === "scheduled" ? "Scheduled" : "In Progress"}
                    </span>
                  </div>
                </div>
              ))}

              {activeMaintenances.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming maintenance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Status card component for the service status overview
function StatusCard({ status, count, label }: { status: string; count: number; label: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-50 border-green-200"
      case "degraded":
        return "bg-yellow-50 border-yellow-200"
      case "partialOutage":
        return "bg-orange-50 border-orange-200"
      case "majorOutage":
        return "bg-red-50 border-red-200"
      case "maintenance":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className={`p-4 rounded-lg border shadow-sm transition-all hover:shadow-md ${getStatusColor(status)}`}>
      <div className="flex items-center mb-2">
        <StatusBadge status={status as ServiceStatus} />
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
