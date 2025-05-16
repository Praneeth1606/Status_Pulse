import React from "react";
import { MaintenanceStatus, Maintenance, Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { addMaintenance, updateMaintenance } from "@/app/actions/maintenance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MaintenanceFormProps {
  editMode?: boolean;
  initialData?: Maintenance & {
    affectedServices: { id: string }[];
  };
  onCancel: () => void;
  services: Service[];
}

const statusOptions = [
  { value: MaintenanceStatus.scheduled, label: "Scheduled" },
  { value: MaintenanceStatus.in_progress, label: "In Progress" },
  { value: MaintenanceStatus.completed, label: "Completed" },
] as const;

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  editMode = false,
  initialData,
  onCancel,
  services,
}) => {
  const router = useRouter();
  const { orgId } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  );
  const [status, setStatus] = React.useState<MaintenanceStatus>(
    (initialData?.status as MaintenanceStatus) || MaintenanceStatus.scheduled
  );
  const [startTime, setStartTime] = React.useState<string>(
    initialData?.startTime
      ? new Date(initialData.startTime).toISOString().slice(0, 16)
      : ""
  );
  const [endTime, setEndTime] = React.useState<string>(
    initialData?.endTime
      ? new Date(initialData.endTime).toISOString().slice(0, 16)
      : ""
  );
  const [affectedServices, setAffectedServices] = React.useState<string[]>(
    initialData?.affectedServices?.map((s) => s.id) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!orgId) {
        toast.error("No organization selected");
        return;
      }

      const maintenanceData = {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        affectedServices,
      };

      if (editMode && initialData) {
        const result = await updateMaintenance(
          orgId,
          initialData.id,
          maintenanceData
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Maintenance updated successfully");
      } else {
        const result = await addMaintenance(orgId, maintenanceData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Maintenance scheduled successfully");
      }

      router.refresh();
      onCancel();
    } catch (error) {
      console.error("Error submitting maintenance:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as MaintenanceStatus;
    setStatus(value);
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setAffectedServices(selectedOptions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Maintenance title"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the maintenance"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={handleStatusChange}
          className="w-full p-2 border rounded-md"
          disabled={isSubmitting}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Time
        </label>
        <input
          required
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Time
        </label>
        <input
          required
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Affected Services
        </label>
        <select
          multiple
          value={affectedServices}
          onChange={handleServiceChange}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Hold Ctrl (Windows) or Command (Mac) to select multiple services
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editMode ? "Update Maintenance" : "Schedule Maintenance"}
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceForm;
