import React from "react";
import { ServiceGroup } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createServiceGroup, updateServiceGroup } from "@/app/actions";

interface ServiceGroupFormProps {
  editMode?: boolean;
  initialData?: ServiceGroup;
  onCancel: () => void;
}

const ServiceGroupForm: React.FC<ServiceGroupFormProps> = ({
  editMode = false,
  initialData,
  onCancel,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editMode && initialData) {
        await updateServiceGroup(initialData.id, {
          name,
          description,
        });
        toast.success("Service group updated successfully");
      } else {
        await createServiceGroup({
          name,
          description,
        });
        toast.success("Service group added successfully");
      }

      router.refresh();
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save service group. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
          placeholder="Service group name"
          disabled={isSubmitting}
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
          placeholder="Describe this service group"
          rows={3}
          disabled={isSubmitting}
        />
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
            "Update Service Group"
          ) : (
            "Add Service Group"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceGroupForm;
