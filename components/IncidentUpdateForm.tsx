import React from "react";
import { IncidentStatus, Incident } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { addIncidentUpdate } from "@/app/actions";
import { useRouter } from "next/navigation";

interface IncidentUpdateFormProps {
  incident: Incident;
  onCancel: () => void;
}

const statusOptions = [
  { value: IncidentStatus.investigating, label: "Investigating" },
  { value: IncidentStatus.identified, label: "Identified" },
  { value: IncidentStatus.monitoring, label: "Monitoring" },
  { value: IncidentStatus.resolved, label: "Resolved" },
] as const;

const IncidentUpdateForm: React.FC<IncidentUpdateFormProps> = ({
  incident,
  onCancel,
}) => {
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<IncidentStatus>(
    incident.status as IncidentStatus
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await addIncidentUpdate({
      incidentId: incident.id,
      message,
      status,
    });

    if (!result.error) {
      router.refresh();
      onCancel();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as IncidentStatus;
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
          className="w-full p-2 border rounded-md"
          placeholder="Describe the update"
          rows={3}
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
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Update</Button>
      </div>
    </form>
  );
};

export default IncidentUpdateForm;
