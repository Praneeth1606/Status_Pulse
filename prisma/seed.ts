import {
  ServiceStatus,
  IncidentStatus,
  IncidentImpact,
  MaintenanceStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";

async function main() {
  // Create organization first
  const organization = await prisma.organization.create({
    data: {
      name: "Status Pulse",
      slug: "status-pulse",
    },
  });

  // Create service groups
  const infrastructureGroup = await prisma.serviceGroup.create({
    data: {
      name: "Infrastructure",
      description: "Core infrastructure services",
      organization: {
        connect: { id: organization.id },
      },
    },
  });

  const applicationGroup = await prisma.serviceGroup.create({
    data: {
      name: "Applications",
      description: "Business applications and services",
      organization: {
        connect: { id: organization.id },
      },
    },
  });

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Database Cluster",
        description: "Main database cluster",
        status: ServiceStatus.operational,
        group: {
          connect: { id: infrastructureGroup.id },
        },
        organization: {
          connect: { id: organization.id },
        },
      },
    }),
    prisma.service.create({
      data: {
        name: "API Gateway",
        description: "API Gateway service",
        status: ServiceStatus.operational,
        group: {
          connect: { id: infrastructureGroup.id },
        },
        organization: {
          connect: { id: organization.id },
        },
      },
    }),
    prisma.service.create({
      data: {
        name: "Authentication Service",
        description: "User authentication and authorization",
        status: ServiceStatus.operational,
        group: {
          connect: { id: applicationGroup.id },
        },
        organization: {
          connect: { id: organization.id },
        },
      },
    }),
    prisma.service.create({
      data: {
        name: "File Storage",
        description: "File storage and management service",
        status: ServiceStatus.degraded,
        group: {
          connect: { id: applicationGroup.id },
        },
        organization: {
          connect: { id: organization.id },
        },
      },
    }),
  ]);

  // Create an incident
  await prisma.incident.create({
    data: {
      title: "Database Performance Issues",
      description: "Experiencing slow query response times",
      status: IncidentStatus.investigating,
      impact: IncidentImpact.major,
      organization: {
        connect: { id: organization.id },
      },
      affectedServices: {
        connect: [{ id: services[0].id }],
      },
      updates: {
        create: {
          message: "Investigating increased latency in database queries",
          status: IncidentStatus.investigating,
          createdBy: "System",
        },
      },
    },
  });

  // Create a maintenance
  await prisma.maintenance.create({
    data: {
      title: "Scheduled Database Maintenance",
      description: "Regular database optimization and cleanup",
      status: MaintenanceStatus.scheduled,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // 26 hours from now
      organization: {
        connect: { id: organization.id },
      },
      affectedServices: {
        connect: [{ id: services[0].id }],
      },
      updates: {
        create: {
          message: "Maintenance window scheduled",
          status: MaintenanceStatus.scheduled,
          createdBy: "System",
        },
      },
    },
  });

  console.log("Database has been seeded. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
