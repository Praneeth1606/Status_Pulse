"use client";

import React, { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceForm from "@/components/ServiceForm";
import ServiceGroupForm from "@/components/ServiceGroupForm";
import { formatTimeAgo } from "@/utils/dateUtils";
import { Service, ServiceGroup } from "@prisma/client";
import { ServiceStatus } from "@prisma/client";
import { deleteService, deleteServiceGroup } from "@/app/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServicesOverviewProps {
  services: Service[];
  serviceGroups: ServiceGroup[];
}

export function ServicesOverview({
  services,
  serviceGroups,
}: ServicesOverviewProps) {
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [showEditServiceForm, setShowEditServiceForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [showEditGroupForm, setShowEditGroupForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isDeletingService, setIsDeletingService] = useState<string | null>(
    null
  );
  const [isDeletingGroup, setIsDeletingGroup] = useState<string | null>(null);
  const router = useRouter();

  // Get selected service data
  const serviceToEdit = selectedService
    ? services.find((s) => s.id === selectedService)
    : null;

  // Get selected group data
  const groupToEdit = selectedGroup
    ? serviceGroups.find((g) => g.id === selectedGroup)
    : null;

  // Group services by their group
  const groupedServices = serviceGroups.map((group) => ({
    group,
    services: services.filter((service) => service.groupId === group.id),
  }));

  // Get services without a group
  const ungroupedServices = services.filter((service) => !service.groupId);

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    setIsDeletingService(id);
    try {
      await deleteService(id);
      toast.success("Service deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete service. Please try again."
      );
    } finally {
      setIsDeletingService(null);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service group?")) return;

    setIsDeletingGroup(id);
    try {
      await deleteServiceGroup(id);
      toast.success("Service group deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete service group. Please try again."
      );
    } finally {
      setIsDeletingGroup(null);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="groups">Service Groups</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <TabsContent value="services" className="mt-0">
                <Button onClick={() => setShowAddServiceForm(true)}>
                  Add Service
                </Button>
              </TabsContent>
              <TabsContent value="groups" className="mt-0">
                <Button onClick={() => setShowAddGroupForm(true)}>
                  Add Group
                </Button>
              </TabsContent>
            </div>
          </div>

          <TabsContent value="services">
            <div className="space-y-8">
              {/* Grouped services */}
              {groupedServices.map(({ group, services }) => (
                <div key={group.id} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    {group.name}
                  </h3>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Last Updated
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((service) => (
                          <tr key={service.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {service.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {service.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge
                                status={service.status as ServiceStatus}
                                animate={
                                  service.status !== ServiceStatus.operational
                                }
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimeAgo(service.updatedAt.toISOString())}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedService(service.id);
                                  setShowEditServiceForm(true);
                                }}
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteService(service.id)}
                                disabled={isDeletingService === service.id}
                              >
                                {isDeletingService === service.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Ungrouped services */}
              {ungroupedServices.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Other Services
                  </h3>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Last Updated
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ungroupedServices.map((service) => (
                          <tr key={service.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {service.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {service.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge
                                status={service.status as ServiceStatus}
                                animate={
                                  service.status !== ServiceStatus.operational
                                }
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimeAgo(service.updatedAt.toISOString())}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedService(service.id);
                                  setShowEditServiceForm(true);
                                }}
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteService(service.id)}
                                disabled={isDeletingService === service.id}
                              >
                                {isDeletingService === service.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {services.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    No services available. Add your first service.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Services Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceGroups.map((group) => {
                    const serviceCount = services.filter(
                      (s) => s.groupId === group.id
                    ).length;

                    return (
                      <tr key={group.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {group.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {serviceCount} service{serviceCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGroup(group.id);
                              setShowEditGroupForm(true);
                            }}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={isDeletingGroup === group.id}
                          >
                            {isDeletingGroup === group.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {serviceGroups.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No service groups available. Add your first group.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showAddServiceForm} onOpenChange={setShowAddServiceForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <ServiceForm
            onCancel={() => setShowAddServiceForm(false)}
            serviceGroups={serviceGroups}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog
        open={showEditServiceForm && !!serviceToEdit}
        onOpenChange={setShowEditServiceForm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {serviceToEdit && (
            <ServiceForm
              editMode
              initialData={serviceToEdit}
              onCancel={() => {
                setShowEditServiceForm(false);
                setSelectedService(null);
              }}
              serviceGroups={serviceGroups}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={showAddGroupForm} onOpenChange={setShowAddGroupForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Group</DialogTitle>
          </DialogHeader>
          <ServiceGroupForm onCancel={() => setShowAddGroupForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog
        open={showEditGroupForm && !!groupToEdit}
        onOpenChange={setShowEditGroupForm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service Group</DialogTitle>
          </DialogHeader>
          {groupToEdit && (
            <ServiceGroupForm
              editMode
              initialData={groupToEdit}
              onCancel={() => {
                setShowEditGroupForm(false);
                setSelectedGroup(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
