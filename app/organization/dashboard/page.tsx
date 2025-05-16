import { requireOrganizationAccess } from "@/lib/auth";
import { DashboardOverview } from "./components/dashboard-overview";
import { DashboardSkeleton } from "./components/dashboard-skeleton";
import { getServices, getIncidents, getMaintenances } from "@/app/actions";
import { Suspense } from "react";

export default async function DashboardPage() {
  const organization = await requireOrganizationAccess();

  const [services, incidents, maintenances] = await Promise.all([
    getServices(organization.id),
    getIncidents(organization.id),
    getMaintenances(organization.id),
  ]);

  if (!services || !incidents || !maintenances) {
    throw new Error("Failed to fetch dashboard data");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization&apos;s status page and services
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview
          services={services.services || []}
          incidents={incidents.incidents || []}
          maintenances={maintenances.maintenances || []}
        />
      </Suspense>
    </div>
  );
}
