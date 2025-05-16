import {
  getServices,
  getIncidents,
  getMaintenances,
  getServiceGroups,
} from "@/app/actions";
import StatusDashboard from "./components/StatusDashboard";
import {
  ServiceStatus,
  IncidentStatus,
  MaintenanceStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export default async function Page({params}:{params:Promise<{slug:string}>}) {
  const slug = (await params).slug;
  
  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const [{ services }, { incidents }, { maintenances }, serviceGroups] =
    await Promise.all([
      getServices(organization.id),
      getIncidents(organization.id),
      getMaintenances(organization.id),
      getServiceGroups(organization.id),
    ]);

  if (!services || !incidents || !maintenances) {
    throw new Error("Failed to fetch required data");
  }

  // Ensure proper typing of the data
  const typedServices = services.map((service) => ({
    ...service,
    status: service.status as ServiceStatus,
  }));

  const typedIncidents = incidents.map((incident) => ({
    ...incident,
    status: incident.status as IncidentStatus,
    impact: incident.impact as "none" | "minor" | "major" | "critical",
  }));

  const typedMaintenances = maintenances.map((maintenance) => ({
    ...maintenance,
    status: maintenance.status as MaintenanceStatus,
  }));

  return (
    <StatusDashboard
      slug={slug}
      services={typedServices}
      incidents={typedIncidents}
      maintenances={typedMaintenances}
      serviceGroups={serviceGroups || []}
    />
  );
}
