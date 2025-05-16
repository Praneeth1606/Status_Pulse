import React from "react";
import { Incident, Service } from "@prisma/client";
import { IncidentStatus, IncidentImpact } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { addIncident, updateIncident } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface IncidentFormProps {
  editMode?: boolean;
  initialData?: Incident & {
    affectedServices: { id: string }[];
  };
  onCancel: () => void;
  services: Service[];
}

const statusOptions = [
  { value: IncidentStatus.investigating, label: "Investigating" },
  { value: IncidentStatus.identified, label: "Identified" },
  { value: IncidentStatus.monitoring, label: "Monitoring" },
  { value: IncidentStatus.resolved, label: "Resolved" },
] as const;

const impactOptions = [
  { value: IncidentImpact.none, label: "None" },
  { value: IncidentImpact.minor, label: "Minor" },
  { value: IncidentImpact.major, label: "Major" },
  { value: IncidentImpact.critical, label: "Critical" },
] as const;

const IncidentForm: React.FC<IncidentFormProps> = ({
  editMode = false,
  initialData,
  onCancel,
  services,
}) => {
  const router = useRouter();
  const { orgId } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  );
  const [status, setStatus] = React.useState<IncidentStatus>(
    (initialData?.status as IncidentStatus) || IncidentStatus.investigating
  );
  const [impact, setImpact] = React.useState<IncidentImpact>(
    (initialData?.impact as IncidentImpact) || IncidentImpact.none
  );
  const [affectedServices, setAffectedServices] = React.useState<string[]>(
    initialData?.affectedServices?.map((s) => s.id) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editMode && initialData) {
        const result = await updateIncident({
          id: initialData.id,
          title,
          description,
          status,
          impact,
          affectedServices,
        });
        if (result.error) {
          throw new Error(result.error);
        }
        toast(`Incident updated successfully`);
      } else {
        if (!orgId) {
          throw new Error("No organization selected");
        }
        const result = await addIncident(orgId, {
          title,
          description,
          impact,
          affectedServices,
        });
        if (result.error) {
          throw new Error(result.error);
        }
        toast(`Incident created successfully`);
      }
      router.refresh();
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as IncidentStatus;
    setStatus(value);
  };

  const handleImpactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as IncidentImpact;
    setImpact(value);
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
          placeholder="Incident title"
          disabled={isLoading}
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
          placeholder="Describe the incident"
          rows={3}
          disabled={isLoading}
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
          disabled={isLoading}
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
          Impact
        </label>
        <select
          value={impact}
          onChange={handleImpactChange}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {impactOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
          disabled={isLoading}
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
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editMode ? "Update Incident" : "Create Incident"}
        </Button>
      </div>
    </form>
  );
};

export default IncidentForm;
