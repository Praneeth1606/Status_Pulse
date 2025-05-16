import React from "react";
import { ServiceStatus, Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { addService, updateServiceStatus } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface ServiceFormProps {
  editMode?: boolean;
  initialData?: Service;
  onCancel: () => void;
  serviceGroups: { id: string; name: string }[];
}

const statusOptions = [
  { value: ServiceStatus.operational, label: "Operational" },
  { value: ServiceStatus.degraded, label: "Degraded" },
  { value: ServiceStatus.partialOutage, label: "Partial Outage" },
  { value: ServiceStatus.majorOutage, label: "Major Outage" },
  { value: ServiceStatus.maintenance, label: "Under Maintenance" },
] as const;

const ServiceForm: React.FC<ServiceFormProps> = ({
  editMode = false,
  initialData,
  onCancel,
  serviceGroups,
}) => {
  const router = useRouter();
  const { orgId } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  );
  const [status, setStatus] = React.useState<ServiceStatus>(
    (initialData?.status as ServiceStatus) || ServiceStatus.operational
  );
  const [groupId, setGroupId] = React.useState<string | null>(
    (initialData?.groupId as string) || null
  );

  if (!orgId) {
    toast.error("No organization selected");
    return null;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editMode && initialData) {
        await updateServiceStatus(orgId, initialData.id, status);
        toast.success("Service status updated successfully");
      } else {
        await addService({
          name,
          description,
          status,
          groupId: groupId || undefined,
        });
        toast.success("Service added successfully");
      }

      router.refresh();
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save service. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ServiceStatus;
    setStatus(value);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupId(e.target.value === "" ? null : e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Service name"
          disabled={editMode || isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Describe this service"
          rows={3}
          disabled={editMode || isSubmitting}
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
          Service Group
        </label>
        <select
          value={groupId || ""}
          onChange={handleGroupChange}
          className="w-full p-2 border rounded-md"
          disabled={editMode || isSubmitting}
        >
          <option value="">None</option>
          {serviceGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Adding..."}
            </>
          ) : editMode ? (
            "Update Service"
          ) : (
            "Add Service"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
