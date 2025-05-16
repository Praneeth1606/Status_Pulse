import { auth } from "@clerk/nextjs/server";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Welcome to <span className="text-blue-600">Status Pulse</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Monitor your services, manage incidents, and keep your users
            informed with our powerful status page platform.
          </p>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Real-time Monitoring
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Track your services&apos; health in real-time with detailed
                status updates and metrics.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6">
                <Bell className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Incident Management
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Handle incidents efficiently with our comprehensive incident
                management system.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Maintenance Windows
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Schedule and manage maintenance windows to keep your users
                informed.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center space-y-6">
          {!userId ? (
            <div className="inline-flex rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <SignInButton mode="modal">
                <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignInButton>
            </div>
          ) : userId && !orgId ? (
            <>
              <div className="inline-flex rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href="/create-organization">
                  <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                    Create Organization
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-base text-gray-600">
                Already have an organization?{" "}
                <Link
                  href="/organization/dashboard"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Switch to your organization
                </Link>
              </p>
            </>
          ) : (
            <div className="inline-flex rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href="/organization/dashboard">
                <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
