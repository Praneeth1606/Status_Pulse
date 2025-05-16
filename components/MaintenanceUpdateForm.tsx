import React from "react";
import { MaintenanceStatus, Maintenance } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { addMaintenanceUpdate } from "@/app/actions/maintenance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MaintenanceUpdateFormProps {
  maintenance: Maintenance;
  onCancel: () => void;
}

const statusOptions = [
  { value: MaintenanceStatus.scheduled, label: "Scheduled" },
  { value: MaintenanceStatus.in_progress, label: "In Progress" },
  { value: MaintenanceStatus.completed, label: "Completed" },
] as const;

const MaintenanceUpdateForm: React.FC<MaintenanceUpdateFormProps> = ({
  maintenance,
  onCancel,
}) => {
  const router = useRouter();
  const { orgId } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<MaintenanceStatus>(
    maintenance.status as MaintenanceStatus
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!orgId) {
        toast.error("No organization selected");
        return;
      }

      const result = await addMaintenanceUpdate(
        orgId,
        maintenance.id,
        message,
        status
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Update added successfully");
      router.refresh();
      onCancel();
    } catch (error) {
      console.error("Error adding maintenance update:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as MaintenanceStatus;
    setStatus(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the update"
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
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
          Add Update
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceUpdateForm;
