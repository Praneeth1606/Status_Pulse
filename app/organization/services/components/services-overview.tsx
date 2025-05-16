"use client"

import { useState } from "react"
import StatusBadge from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ServiceForm from "@/components/ServiceForm"
import ServiceGroupForm from "@/components/ServiceGroupForm"
import { formatTimeAgo } from "@/utils/dateUtils"
import type { Service, ServiceGroup } from "@prisma/client"
import { ServiceStatus } from "@prisma/client"
import { deleteService, deleteServiceGroup } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Plus, Edit, Trash2, AlertCircle, Server, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ServicesOverviewProps {
  services: Service[]
  serviceGroups: ServiceGroup[]
}

export function ServicesOverview({ services, serviceGroups }: ServicesOverviewProps) {
  const [showAddServiceForm, setShowAddServiceForm] = useState(false)
  const [showEditServiceForm, setShowEditServiceForm] = useState(false)
  const [showAddGroupForm, setShowAddGroupForm] = useState(false)
  const [showEditGroupForm, setShowEditGroupForm] = useState(false)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isDeletingService, setIsDeletingService] = useState<string | null>(null)
  const [isDeletingGroup, setIsDeletingGroup] = useState<string | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null)
  const router = useRouter()

  // Get selected service data
  const serviceToEdit = selectedService ? services.find((s) => s.id === selectedService) : null

  // Get selected group data
  const groupToEdit = selectedGroup ? serviceGroups.find((g) => g.id === selectedGroup) : null

  // Group services by their group
  const groupedServices = serviceGroups.map((group) => ({
    group,
    services: services.filter((service) => service.groupId === group.id),
  }))

  // Get services without a group
  const ungroupedServices = services.filter((service) => !service.groupId)

  // Calculate overall status
  const hasIssues = services.some((service) => service.status !== ServiceStatus.operational)

  const handleDeleteService = async (id: string) => {
    setIsDeletingService(id)
    try {
      await deleteService(id)
      toast.success("Service deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete service. Please try again.")
    } finally {
      setIsDeletingService(null)
      setServiceToDelete(null)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    setIsDeletingGroup(id)
    try {
      await deleteServiceGroup(id)
      toast.success("Service group deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete service group. Please try again.")
    } finally {
      setIsDeletingGroup(null)
      setGroupToDelete(null)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Services Dashboard</CardTitle>
                <CardDescription className="mt-1">Manage and monitor your services and service groups</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {hasIssues ? (
                  <Badge variant="destructive" className="px-3 py-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Issues Detected</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-green-500 hover:bg-green-600 px-3 py-1 flex items-center gap-1"
                  >
                    <span>All Systems Operational</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-sm border-none">
          <CardContent className="p-6">
            <Tabs defaultValue="services" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="services"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Server className="h-4 w-4" />
                    <span>Services</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Layers className="h-4 w-4" />
                    <span>Service Groups</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex space-x-2 w-full sm:w-auto">
                  <TabsContent value="services" className="mt-0 w-full sm:w-auto">
                    <Button
                      onClick={() => setShowAddServiceForm(true)}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </TabsContent>
                  <TabsContent value="groups" className="mt-0 w-full sm:w-auto">
                    <Button
                      onClick={() => setShowAddGroupForm(true)}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  </TabsContent>
                </div>
              </div>

              <TabsContent value="services">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-6">
                    {/* Grouped services */}
                    {groupedServices.map(({ group, services }) => (
                      <div key={group.id} className="mb-6">
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
                          <Badge variant="outline" className="ml-3 text-xs">
                            {services.length} service{services.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="bg-white overflow-hidden rounded-xl border shadow-sm">
                          <Table className="table-fixed w-full">
                            <TableHeader>
                              <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="h-10 py-2 whitespace-nowrap w-[240px] font-medium">
                                  Name
                                </TableHead>
                                <TableHead className="h-10 py-2 whitespace-nowrap w-[120px] text-center font-medium">
                                  Status
                                </TableHead>
                                <TableHead className="h-10 py-2 whitespace-nowrap w-[160px] font-medium">
                                  Last Updated
                                </TableHead>
                                <TableHead className="h-10 py-2 text-right whitespace-nowrap w-[140px] font-medium">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {services.map((service) => (
                                <TableRow key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                  <TableCell className="py-3 font-medium whitespace-nowrap truncate w-[240px]">
                                    {service.name}
                                  </TableCell>
                                  <TableCell className="py-3 w-[120px] text-center">
                                    <StatusBadge
                                      status={service.status as ServiceStatus}
                                      animate={service.status !== ServiceStatus.operational}
                                    />
                                  </TableCell>
                                  <TableCell className="py-3 text-muted-foreground whitespace-nowrap truncate w-[160px]">
                                    {formatTimeAgo(service.updatedAt.toISOString())}
                                  </TableCell>
                                  <TableCell className="py-3 text-right whitespace-nowrap w-[140px]">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedService(service.id)
                                        setShowEditServiceForm(true)
                                      }}
                                      className="h-8 w-8 p-0 mr-1"
                                      title="Edit service"
                                    >
                                      <Edit className="h-4 w-4 text-gray-500" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setServiceToDelete(service.id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      disabled={isDeletingService === service.id}
                                      title="Delete service"
                                    >
                                      {isDeletingService === service.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}

                    {/* Ungrouped services */}
                    {ungroupedServices.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-medium text-gray-800">Other Services</h3>
                          <Badge variant="outline" className="ml-3 text-xs">
                            {ungroupedServices.length} service{ungroupedServices.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="bg-white overflow-hidden rounded-xl border shadow-sm">
                          <Table className="table-fixed w-full">
                            <TableHeader>
                              <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="h-10 py-2 whitespace-nowrap w-[240px] font-medium">
                                  Name
                                </TableHead>
                                <TableHead className="h-10 py-2 whitespace-nowrap w-[120px] text-center font-medium">
                                  Status
                                </TableHead>
                                <TableHead className="h-10 py-2 whitespace-nowrap w-[160px] font-medium">
                                  Last Updated
                                </TableHead>
                                <TableHead className="h-10 py-2 text-right whitespace-nowrap w-[140px] font-medium">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ungroupedServices.map((service) => (
                                <TableRow key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                  <TableCell className="py-3 font-medium whitespace-nowrap truncate w-[240px]">
                                    {service.name}
                                  </TableCell>
                                  <TableCell className="py-3 w-[120px] text-center">
                                    <StatusBadge
                                      status={service.status as ServiceStatus}
                                      animate={service.status !== ServiceStatus.operational}
                                    />
                                  </TableCell>
                                  <TableCell className="py-3 text-muted-foreground whitespace-nowrap truncate w-[160px]">
                                    {formatTimeAgo(service.updatedAt.toISOString())}
                                  </TableCell>
                                  <TableCell className="py-3 text-right whitespace-nowrap w-[140px]">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedService(service.id)
                                        setShowEditServiceForm(true)
                                      }}
                                      className="h-8 w-8 p-0 mr-1"
                                      title="Edit service"
                                    >
                                      <Edit className="h-4 w-4 text-gray-500" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setServiceToDelete(service.id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      disabled={isDeletingService === service.id}
                                      title="Delete service"
                                    >
                                      {isDeletingService === service.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {services.length === 0 && (
                      <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Server className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No services available</h3>
                        <p className="text-muted-foreground mb-4">
                          Add your first service to start monitoring your infrastructure.
                        </p>
                        <Button onClick={() => setShowAddServiceForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="groups">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {serviceGroups.length > 0 ? (
                    <div className="bg-white overflow-hidden rounded-xl border shadow-sm">
                      <Table className="table-fixed w-full">
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="h-10 py-2 whitespace-nowrap w-[240px] font-medium">Name</TableHead>
                            <TableHead className="h-10 py-2 whitespace-nowrap w-[120px] text-center font-medium">
                              Services
                            </TableHead>
                            <TableHead className="h-10 py-2 text-right whitespace-nowrap w-[140px] font-medium">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceGroups.map((group) => {
                            const serviceCount = services.filter((s) => s.groupId === group.id).length
                            const hasGroupIssues = services.some(
                              (s) => s.groupId === group.id && s.status !== ServiceStatus.operational,
                            )

                            return (
                              <TableRow key={group.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="py-3 font-medium whitespace-nowrap truncate w-[240px]">
                                  <div className="flex items-center">
                                    {group.name}
                                    {hasGroupIssues && (
                                      <Badge variant="destructive" className="ml-2 px-1.5 py-0">
                                        <AlertCircle className="h-3 w-3" />
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 text-center whitespace-nowrap truncate w-[120px]">
                                  <Badge variant="secondary" className="font-normal">
                                    {serviceCount}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-right whitespace-nowrap w-[140px]">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedGroup(group.id)
                                      setShowEditGroupForm(true)
                                    }}
                                    className="h-8 w-8 p-0 mr-1"
                                    title="Edit group"
                                  >
                                    <Edit className="h-4 w-4 text-gray-500" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setGroupToDelete(group.id)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    disabled={isDeletingGroup === group.id}
                                    title="Delete group"
                                  >
                                    {isDeletingGroup === group.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No service groups available</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your first service group to organize your services.
                      </p>
                      <Button onClick={() => setShowAddGroupForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service Group
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showAddServiceForm} onOpenChange={setShowAddServiceForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>Create a new service to monitor in your dashboard.</DialogDescription>
          </DialogHeader>
          <ServiceForm onCancel={() => setShowAddServiceForm(false)} serviceGroups={serviceGroups} />
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditServiceForm && !!serviceToEdit} onOpenChange={setShowEditServiceForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the details of your service.</DialogDescription>
          </DialogHeader>
          {serviceToEdit && (
            <ServiceForm
              editMode
              initialData={serviceToEdit}
              onCancel={() => {
                setShowEditServiceForm(false)
                setSelectedService(null)
              }}
              serviceGroups={serviceGroups}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={showAddGroupForm} onOpenChange={setShowAddGroupForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Service Group</DialogTitle>
            <DialogDescription>Create a new group to organize your services.</DialogDescription>
          </DialogHeader>
          <ServiceGroupForm onCancel={() => setShowAddGroupForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditGroupForm && !!groupToEdit} onOpenChange={setShowEditGroupForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service Group</DialogTitle>
            <DialogDescription>Update the details of your service group.</DialogDescription>
          </DialogHeader>
          {groupToEdit && (
            <ServiceGroupForm
              editMode
              initialData={groupToEdit}
              onCancel={() => {
                setShowEditGroupForm(false)
                setSelectedGroup(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Service Confirmation */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => serviceToDelete && handleDeleteService(serviceToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeletingService ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Confirmation */}
      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => groupToDelete && handleDeleteGroup(groupToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeletingGroup ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
