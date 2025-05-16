"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IncidentForm from "@/components/IncidentForm";
import IncidentUpdateForm from "@/components/IncidentUpdateForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getIncidentImpactColor,
  getIncidentStatusColor,
} from "@/utils/statusUtils";
import { Incident } from "@prisma/client";
import { resolveIncident, deleteIncident } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Service } from "@prisma/client";

interface IncidentWithRelations extends Incident {
  affectedServices: { id: string }[];
  updates: {
    id: string;
    message: string;
    status: string;
    createdAt: Date;
    createdBy: string;
  }[];
}

export function IncidentsOverview({
  incidents,
  services,
}: {
  incidents: IncidentWithRelations[];
  services: Service[];
}) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  // Get selected incident data
  const incidentToEdit = selectedIncident
    ? incidents.find((inc) => inc.id === selectedIncident)
    : null;

  // Filter incidents
  const activeIncidents = incidents.filter((inc) => inc.status !== "resolved");
  const resolvedIncidents = incidents.filter(
    (inc) => inc.status === "resolved"
  );

  const handleResolveIncident = async (id: string) => {
    const result = await resolveIncident(id);
    if (!result.error) {
      router.refresh();
    }
  };

  const handleDeleteIncident = async (id: string) => {
    const result = await deleteIncident(id);
    if (!result.error) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Incidents Management
        </h2>
        <Button onClick={() => setShowAddForm(true)}>Report Incident</Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Incidents</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="pt-6">
          {activeIncidents.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
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
                      Impact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Affected Services
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reported
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {incident.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getIncidentStatusColor(
                            incident.status
                          )}`}
                        >
                          {incident.status.charAt(0).toUpperCase() +
                            incident.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getIncidentImpactColor(
                            incident.impact
                          )}`}
                        >
                          {incident.impact.charAt(0).toUpperCase() +
                            incident.impact.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {incident.affectedServices.map((service) => (
                            <span
                              key={service.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {services.find((s) => s.id === service.id)
                                ?.name || service.id}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(incident.createdAt.toISOString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident.id);
                            setShowUpdateForm(true);
                          }}
                        >
                          Add Update
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident.id);
                            setShowEditForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveIncident(incident.id)}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteIncident(incident.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">
                No active incidents at the moment.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                Report New Incident
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="pt-6">
          {resolvedIncidents.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Impact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Affected Services
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reported
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Resolved
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resolvedIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {incident.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getIncidentImpactColor(
                            incident.impact
                          )}`}
                        >
                          {incident.impact.charAt(0).toUpperCase() +
                            incident.impact.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {incident.affectedServices.map((service) => (
                            <span
                              key={service.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {services.find((s) => s.id === service.id)
                                ?.name || service.id}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(incident.createdAt.toISOString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {incident.resolvedAt
                          ? formatTimeAgo(incident.resolvedAt.toISOString())
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident.id);
                            setShowUpdateForm(true);
                          }}
                        >
                          Add Update
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteIncident(incident.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No resolved incidents yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Incident Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report New Incident</DialogTitle>
          </DialogHeader>
          <IncidentForm
            onCancel={() => setShowAddForm(false)}
            services={services}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Incident Dialog */}
      <Dialog
        open={showEditForm && !!incidentToEdit}
        onOpenChange={setShowEditForm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Incident</DialogTitle>
          </DialogHeader>
          {incidentToEdit && (
            <IncidentForm
              editMode
              initialData={{
                ...incidentToEdit,
                affectedServices: incidentToEdit.affectedServices || [],
              }}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedIncident(null);
              }}
              services={services}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog
        open={showUpdateForm && !!selectedIncident}
        onOpenChange={setShowUpdateForm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Incident Update</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <IncidentUpdateForm
              incident={incidents.find((inc) => inc.id === selectedIncident)!}
              onCancel={() => {
                setShowUpdateForm(false);
                setSelectedIncident(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
