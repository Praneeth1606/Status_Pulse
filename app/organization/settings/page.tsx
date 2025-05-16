"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OrganizationProfile } from "@clerk/nextjs";

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your status page settings and appearance
        </p>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Status Colors</CardTitle>
            <CardDescription>
              Customize the colors used to represent different status states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="color-operational"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <span className="w-4 h-4 inline-block bg-status-operational rounded-full ring-1 ring-border"></span>
                    Operational
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-operational"
                      type="color"
                      defaultValue="#22c55e"
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      type="text"
                      defaultValue="#22c55e"
                      className="flex-1"
                      placeholder="Hex color code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="color-degraded"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <span className="w-4 h-4 inline-block bg-status-degraded rounded-full ring-1 ring-border"></span>
                    Degraded
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-degraded"
                      type="color"
                      defaultValue="#f59e0b"
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      type="text"
                      defaultValue="#f59e0b"
                      className="flex-1"
                      placeholder="Hex color code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="color-partial-outage"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <span className="w-4 h-4 inline-block bg-status-partial-outage rounded-full ring-1 ring-border"></span>
                    Partial Outage
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-partial-outage"
                      type="color"
                      defaultValue="#f97316"
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      type="text"
                      defaultValue="#f97316"
                      className="flex-1"
                      placeholder="Hex color code"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="color-major-outage"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <span className="w-4 h-4 inline-block bg-status-major-outage rounded-full ring-1 ring-border"></span>
                    Major Outage
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-major-outage"
                      type="color"
                      defaultValue="#ef4444"
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      type="text"
                      defaultValue="#ef4444"
                      className="flex-1"
                      placeholder="Hex color code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="color-maintenance"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <span className="w-4 h-4 inline-block bg-status-maintenance rounded-full ring-1 ring-border"></span>
                    Maintenance
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-maintenance"
                      type="color"
                      defaultValue="#3b82f6"
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      type="text"
                      defaultValue="#3b82f6"
                      className="flex-1"
                      placeholder="Hex color code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" className="gap-2 pt-6">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>
              Manage your organization&apos;s profile and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationProfile routing="hash" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
