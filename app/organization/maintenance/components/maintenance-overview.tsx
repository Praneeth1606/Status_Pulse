"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatTimeAgo, formatDateRange } from "@/utils/dateUtils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import MaintenanceForm from "@/components/MaintenanceForm"
import MaintenanceUpdateForm from "@/components/MaintenanceUpdateForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Maintenance, Service, MaintenanceStatus } from "@prisma/client"
import { deleteMaintenance } from "@/app/actions/maintenance"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MoreVertical, Plus, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type MaintenanceWithRelations = Maintenance & {
  affectedServices: Service[]
  updates: {
    id: string
    message: string
    status: MaintenanceStatus
    createdAt: Date
    createdBy: string
  }[]
}

interface MaintenanceOverviewProps {
  maintenances: MaintenanceWithRelations[]
  services: Service[]
}

export default function MaintenanceOverview({ maintenances, services }: MaintenanceOverviewProps) {
  const router = useRouter()
  const { orgId } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null)

  const handleDeleteMaintenance = async () => {
    if (!orgId || !maintenanceToDelete) {
      toast.error("No organization or maintenance selected")
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteMaintenance(orgId, maintenanceToDelete)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Maintenance deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting maintenance:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setMaintenanceToDelete(null)
    }
  }

  const confirmDelete = (maintenanceId: string) => {
    setMaintenanceToDelete(maintenanceId)
    setShowDeleteDialog(true)
  }

  // Filter maintenances
  const upcomingMaintenances = maintenances.filter((m) => m.status === "scheduled")
  const inProgressMaintenances = maintenances.filter((m) => m.status === "in_progress")
  const completedMaintenances = maintenances.filter((m) => m.status === "completed")

  const activeMaintenances = [...upcomingMaintenances, ...inProgressMaintenances]

  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4 mr-1" />
      case "in_progress":
        return <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 mr-1" />
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Maintenance Management</CardTitle>
            <CardDescription>Schedule and manage maintenance windows for your services</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Schedule Maintenance</span>
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active" className="text-sm">
                Active Maintenance
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm">
                Completed Maintenance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="pt-2 focus-visible:outline-none focus-visible:ring-0">
              {activeMaintenances.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[30%] font-medium">Title & Description</TableHead>
                        <TableHead className="w-[15%] font-medium">Status</TableHead>
                        <TableHead className="w-[20%] font-medium">Schedule</TableHead>
                        <TableHead className="w-[25%] font-medium">Affected Services</TableHead>
                        <TableHead className="w-[10%] text-right font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMaintenances.map((maintenance) => (
                        <TableRow key={maintenance.id} className="group">
                          <TableCell className="align-top py-4">
                            <div className="font-medium text-foreground">{maintenance.title}</div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {maintenance.description}
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex w-fit items-center gap-1 px-2 py-1 capitalize transition-colors",
                                maintenance.status === "scheduled" && "bg-blue-50 text-blue-700 border-blue-200",
                                maintenance.status === "in_progress" && "bg-amber-50 text-amber-700 border-amber-200",
                                maintenance.status === "completed" && "bg-green-50 text-green-700 border-green-200",
                              )}
                            >
                              {getStatusIcon(maintenance.status)}
                              {maintenance.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatDateRange(
                                  maintenance.startTime.toISOString(),
                                  maintenance.endTime.toISOString(),
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {maintenance.affectedServices.map((service) => (
                                <Badge key={service.id} variant="secondary" className="px-2 py-0.5 text-xs">
                                  {service.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right align-top py-4">
                            <TooltipProvider>
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Actions</p>
                                  </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="end" className="w-[180px]">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedMaintenance(maintenance)
                                      setShowUpdateForm(true)
                                    }}
                                  >
                                    Add Update
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedMaintenance(maintenance)
                                      setShowEditForm(true)
                                    }}
                                  >
                                    Edit Maintenance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => confirmDelete(maintenance.id)}
                                  >
                                    Delete Maintenance
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No scheduled maintenance</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    There are no active maintenance windows scheduled at this time.
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Schedule Maintenance</span>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="pt-2 focus-visible:outline-none focus-visible:ring-0">
              {completedMaintenances.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[30%] font-medium">Title & Description</TableHead>
                        <TableHead className="w-[25%] font-medium">Schedule</TableHead>
                        <TableHead className="w-[25%] font-medium">Affected Services</TableHead>
                        <TableHead className="w-[20%] font-medium">Last Update</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedMaintenances.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell className="align-top py-4">
                            <div className="font-medium text-foreground">{maintenance.title}</div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {maintenance.description}
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatDateRange(
                                  maintenance.startTime.toISOString(),
                                  maintenance.endTime.toISOString(),
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {maintenance.affectedServices.map((service) => (
                                <Badge key={service.id} variant="secondary" className="px-2 py-0.5 text-xs">
                                  {service.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <div className="text-sm">
                              {maintenance.updates.length > 0 ? (
                                <span className="text-muted-foreground">
                                  {formatTimeAgo(maintenance.updates[0].createdAt.toISOString())}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">No updates</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No completed maintenance</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    There are no completed maintenance windows to display.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Maintenance Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>Create a new maintenance window for your services.</DialogDescription>
          </DialogHeader>
          <MaintenanceForm services={services} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Maintenance Dialog */}
      <Dialog open={showEditForm && !!selectedMaintenance} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Maintenance</DialogTitle>
            <DialogDescription>Update the details of this maintenance window.</DialogDescription>
          </DialogHeader>
          {selectedMaintenance && (
            <MaintenanceForm
              editMode
              initialData={selectedMaintenance}
              services={services}
              onCancel={() => {
                setShowEditForm(false)
                setSelectedMaintenance(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={showUpdateForm && !!selectedMaintenance} onOpenChange={setShowUpdateForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Maintenance Update</DialogTitle>
            <DialogDescription>Provide a status update for this maintenance window.</DialogDescription>
          </DialogHeader>
          {selectedMaintenance && (
            <MaintenanceUpdateForm
              maintenance={selectedMaintenance}
              onCancel={() => {
                setShowUpdateForm(false)
                setSelectedMaintenance(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maintenance window and all associated
              updates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMaintenance}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
