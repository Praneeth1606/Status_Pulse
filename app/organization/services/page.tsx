import { getServices, getServiceGroups } from "@/app/actions";
import { ServicesOverview } from "./components/services-overview";
import { auth } from "@clerk/nextjs/server";

export default async function ServicesPage() {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error("No organization selected");
  }

  const { services } = await getServices(orgId);
  const serviceGroups = await getServiceGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          Manage your services and service groups.
        </p>
      </div>

      <ServicesOverview
        services={services || []}
        serviceGroups={serviceGroups || []}
      />
    </div>
  );
}
