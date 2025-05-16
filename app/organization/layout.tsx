import { OrganizationList } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { PropsWithChildren } from "react";
import AdminHeader from "./components/admin-header";
import { redirect } from "next/navigation";

const RequireActiveOrganization = async (props: PropsWithChildren) => {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/create-organization");
  }

  if (orgId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-6">{props.children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <section className="w-full max-w-lg p-8 bg-white rounded-lg shadow-sm">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-sm text-gray-600">
            This part of the application requires the user to select an
            organization in order to proceed. If you are not part of an
            organization, you can accept an invitation or create your own
            organization
          </p>
          <OrganizationList hidePersonal={true} />
        </div>
      </section>
    </div>
  );
};

export default async function OrganizationLayout({
  children,
}: PropsWithChildren) {
  return <RequireActiveOrganization>{children}</RequireActiveOrganization>;
}
