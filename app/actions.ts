"use server";

import { revalidatePath } from "next/cache";
import {
  ServiceStatus,
  IncidentStatus,
  IncidentImpact,
  MaintenanceStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { currentUser, auth } from "@clerk/nextjs/server";
import { validateOrganizationAccess } from "@/lib/auth";

export async function getUser() {
  const { orgId } = await auth();
  const user = await currentUser();
  if (!user) {
    return { error: "User not found" };
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!existing) {
    return await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        orgId: orgId,
      },
    });
  }

  return existing;
}

async function getCurrentOrganization() {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error("No organization selected");
  }

  // Validate organization access
  await validateOrganizationAccess(orgId);

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return organization;
}

export async function getServices(orgId: string) {
  try {
    await validateOrganizationAccess(orgId);
    const services = await prisma.service.findMany({
      where: {
        orgId,
      },
      include: {
        group: true,
      },
    });
    return { services };
  } catch (e) {
    console.error("Error fetching services:", e);
    return { error: "Failed to fetch services" };
  }
}

export async function getIncidents(orgId: string) {
  try {
    await validateOrganizationAccess(orgId);
    const incidents = await prisma.incident.findMany({
      where: {
        orgId,
      },
      include: {
        updates: {
          orderBy: {
            createdAt: "desc",
          },
        },
        affectedServices: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected types
    const typedIncidents = incidents.map((incident) => ({
      ...incident,
      status: incident.status as IncidentStatus,
      impact: incident.impact as IncidentImpact,
      updates: incident.updates.map((update) => ({
        ...update,
        status: update.status as IncidentStatus,
      })),
    }));

    return { incidents: typedIncidents };
  } catch (e) {
    console.error("Error fetching incidents:", e);
    return { error: "Failed to fetch incidents" };
  }
}

export async function getMaintenances(orgId: string) {
  try {
    await validateOrganizationAccess(orgId);
    const maintenances = await prisma.maintenance.findMany({
      where: {
        orgId,
      },
      include: {
        updates: {
          orderBy: {
            createdAt: "desc",
          },
        },
        affectedServices: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // Transform the data to match the expected types
    const typedMaintenances = maintenances.map((maintenance) => ({
      ...maintenance,
      status: maintenance.status as MaintenanceStatus,
      updates: maintenance.updates.map((update) => ({
        ...update,
        status: update.status as MaintenanceStatus,
      })),
    }));

    return { maintenances: typedMaintenances };
  } catch (e) {
    console.error("Error fetching maintenances:", e);
    return { error: "Failed to fetch maintenances" };
  }
}

export async function getServiceGroups() {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      throw new Error("No organization selected");
    }

    // Validate organization access
    await validateOrganizationAccess(orgId);

    const serviceGroups = await prisma.serviceGroup.findMany({
      where: {
        orgId: orgId,
      },
      include: {
        services: true,
      },
    });

    return serviceGroups;
  } catch (error) {
    console.error("Error fetching service groups:", error);
    throw new Error("Failed to fetch service groups");
  }
}

export async function getServiceStatus() {
  try {
    const organization = await getCurrentOrganization();
    const services = await prisma.service.findMany({
      where: {
        orgId: organization.id,
      },
    });

    if (services.some((s) => s.status === ServiceStatus.majorOutage)) {
      return ServiceStatus.majorOutage;
    } else if (services.some((s) => s.status === ServiceStatus.partialOutage)) {
      return ServiceStatus.partialOutage;
    } else if (
      services.some(
        (s) =>
          s.status === ServiceStatus.degraded ||
          s.status === ServiceStatus.maintenance
      )
    ) {
      return ServiceStatus.degraded;
    } else {
      return ServiceStatus.operational;
    }
  } catch (e) {
    console.error("Error getting service status:", e);
    return ServiceStatus.operational; // Default to operational on error
  }
}

export async function updateServiceStatus(
  orgId: string,
  id: string,
  status: ServiceStatus
) {
  try {
    await validateOrganizationAccess(orgId);

    // Verify the service belongs to the organization
    const service = await prisma.service.findFirst({
      where: {
        id,
        orgId,
      },
    });

    if (!service) {
      throw new Error("Service not found or access denied");
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        group: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/organization/services");
    revalidatePath("/organization/dashboard");

    return { service: updatedService };
  } catch (error) {
    console.error("Error updating service status:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update service status"
    );
  }
}

export async function addIncident(
  orgId: string,
  data: {
    title: string;
    description: string;
    impact: IncidentImpact;
    affectedServices: string[];
  }
) {
  try {
    await validateOrganizationAccess(orgId);

    // Verify all affected services belong to the organization
    const services = await prisma.service.findMany({
      where: {
        id: { in: data.affectedServices },
        orgId,
      },
    });

    if (services.length !== data.affectedServices.length) {
      throw new Error("One or more services not found or access denied");
    }

    const incident = await prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        impact: data.impact,
        status: IncidentStatus.investigating,
        orgId,
        affectedServices: {
          connect: data.affectedServices.map((id) => ({ id })),
        },
        updates: {
          create: {
            message: "Incident created",
            status: IncidentStatus.investigating,
            createdBy: "System", // TODO: Get from auth
          },
        },
      },
      include: {
        updates: true,
        affectedServices: true,
      },
    });
    revalidatePath("/");
    return { incident };
  } catch (error) {
    console.error("Error creating incident:", error);
    return { error: "Failed to create incident" };
  }
}

export async function updateIncident(data: {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  affectedServices: string[];
}) {
  try {
    const incident = await prisma.incident.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        impact: data.impact,
        affectedServices: {
          set: data.affectedServices.map((id) => ({ id })),
        },
      },
      include: {
        updates: true,
        affectedServices: true,
      },
    });
    revalidatePath("/");
    return { incident };
  } catch {
    return { error: "Failed to update incident" };
  }
}

export async function resolveIncident(id: string) {
  try {
    const incident = await prisma.incident.update({
      where: { id },
      data: {
        status: IncidentStatus.resolved,
        resolvedAt: new Date(),
        updates: {
          create: {
            message: "Incident resolved",
            status: IncidentStatus.resolved,
            createdBy: "System", // TODO: Get from auth
          },
        },
      },
      include: {
        updates: true,
        affectedServices: true,
      },
    });
    revalidatePath("/");
    return { incident };
  } catch {
    return { error: "Failed to resolve incident" };
  }
}

export async function deleteIncident(id: string) {
  try {
    await prisma.incident.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete incident" };
  }
}

export async function addIncidentUpdate(data: {
  incidentId: string;
  message: string;
  status: IncidentStatus;
}) {
  try {
    const update = await prisma.incidentUpdate.create({
      data: {
        incidentId: data.incidentId,
        message: data.message,
        status: data.status,
        createdBy: "System", // TODO: Get from auth
      },
    });

    // Update the incident status
    await prisma.incident.update({
      where: { id: data.incidentId },
      data: {
        status: data.status,
        ...(data.status === IncidentStatus.resolved && {
          resolvedAt: new Date(),
        }),
      },
    });

    revalidatePath("/");
    return { update };
  } catch {
    return { error: "Failed to add incident update" };
  }
}

export async function addMaintenance(data: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  affectedServices: string[];
}) {
  const organization = await getCurrentOrganization();
  try {
    const maintenance = await prisma.maintenance.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        status: MaintenanceStatus.scheduled,
        orgId: organization.id,
        affectedServices: {
          connect: data.affectedServices.map((id) => ({ id })),
        },
        updates: {
          create: {
            message: "Maintenance scheduled",
            status: MaintenanceStatus.scheduled,
            createdBy: "System", // TODO: Get from auth
          },
        },
      },
      include: {
        updates: true,
        affectedServices: true,
      },
    });
    revalidatePath("/");
    return { maintenance };
  } catch {
    return { error: "Failed to create maintenance" };
  }
}

export async function addService(data: {
  name: string;
  description: string;
  status: ServiceStatus;
  groupId?: string;
}) {
  try {
    const organization = await getCurrentOrganization();
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        orgId: organization.id,
        groupId: data.groupId,
      },
      include: {
        group: true,
      },
    });
    revalidatePath("/");
    return { service };
  } catch {
    return { error: "Failed to create service" };
  }
}

export async function createServiceGroup(data: {
  name: string;
  description?: string;
}) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      throw new Error("No organization selected");
    }

    // Validate organization access
    await validateOrganizationAccess(orgId);

    const serviceGroup = await prisma.serviceGroup.create({
      data: {
        name: data.name,
        description: data.description,
        orgId: orgId,
      },
    });

    revalidatePath("/organization/services");
    return serviceGroup;
  } catch (error) {
    console.error("Error creating service group:", error);
    throw new Error("Failed to create service group");
  }
}

export async function updateServiceGroup(
  id: string,
  data: {
    name: string;
    description?: string;
  }
) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      throw new Error("No organization selected");
    }

    // Validate organization access
    await validateOrganizationAccess(orgId);

    // Verify the service group belongs to the organization
    const existingGroup = await prisma.serviceGroup.findFirst({
      where: {
        id: id,
        orgId: orgId,
      },
    });

    if (!existingGroup) {
      throw new Error("Service group not found");
    }

    const serviceGroup = await prisma.serviceGroup.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    revalidatePath("/organization/services");
    return serviceGroup;
  } catch (error) {
    console.error("Error updating service group:", error);
    throw new Error("Failed to update service group");
  }
}

export async function deleteServiceGroup(id: string) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      throw new Error("No organization selected");
    }

    // Validate organization access
    await validateOrganizationAccess(orgId);

    // Verify the service group belongs to the organization
    const existingGroup = await prisma.serviceGroup.findFirst({
      where: {
        id: id,
        orgId: orgId,
      },
    });

    if (!existingGroup) {
      throw new Error("Service group not found");
    }

    // First, update all services in this group to remove the group association
    await prisma.service.updateMany({
      where: {
        groupId: id,
      },
      data: {
        groupId: null,
      },
    });

    // Then delete the service group
    await prisma.serviceGroup.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/organization/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service group:", error);
    throw new Error("Failed to delete service group");
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/organization/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete service"
    );
  }
}
