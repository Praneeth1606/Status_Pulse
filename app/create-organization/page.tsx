import { CreateOrganization, OrganizationList } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreateOrganizationPage() {
  const { userId, orgId } = await auth();

  // If user is not signed in, redirect to sign in
  if (!userId) {
    redirect("/sign-in");
  }

  // If user already has an organization, redirect to dashboard
  if (orgId) {
    redirect("/organization/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Create Your Organization
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Set up your organization to start monitoring your services and
            managing incidents with ease.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100/50 backdrop-blur-sm">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Organization Details
              </h2>
              <p className="text-gray-600">
                Fill in your organization&apos;s information to get started
              </p>
            </div>

            <CreateOrganization
              skipInvitationScreen={true}
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none",
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200",
                  formFieldInput:
                    "rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  formFieldLabel: "text-gray-700 font-medium",
                },
              }}
            />
            <OrganizationList />
          </div>
        </div>
      </div>
    </div>
  );
}
