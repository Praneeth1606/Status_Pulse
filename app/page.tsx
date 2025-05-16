import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Activity, Shield, Bell } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { getUser } from "./actions";

export default async function Home() {
  const { userId, orgId } = await auth();

  const user = await getUser();
  if (!user) {
    return <div>User not found</div>;
  }

  if (!orgId) {
    redirect("/create-organization");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-blue-600">Status Pulse</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Monitor your services, manage incidents, and keep your users
            informed with our powerful status page platform.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Real-time Monitoring
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Track your services&apos; health in real-time with detailed
                status updates and metrics.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Incident Management
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Handle incidents efficiently with our comprehensive incident
                management system.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Maintenance Windows
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Schedule and manage maintenance windows to keep your users
                informed.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          {userId ? (
            <>
              <div className="inline-flex rounded-md shadow">
                <Link href="/create-organization">
                  <Button size="lg" className="px-8">
                    Create Organization
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Already have an organization?{" "}
                <Link
                  href="/organization/dashboard"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Switch to your organization
                </Link>
              </p>
            </>
          ) : (
            <div className="inline-flex rounded-md shadow">
              <SignInButton mode="modal">
                <Button size="lg" className="px-8">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
