"use client";

import type React from "react";
import { ServiceStatus } from "@prisma/client";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  AlertOctagon,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface FilterControlsProps {
  statusFilters: ServiceStatus[];
  setStatusFilters: React.Dispatch<React.SetStateAction<ServiceStatus[]>>;
  groupFilters: string[];
  setGroupFilters: React.Dispatch<React.SetStateAction<string[]>>;
  groups: { id: string; name: string }[];
  clearFilters: () => void;
}

export default function FilterControls({
  statusFilters,
  setStatusFilters,
  groupFilters,
  setGroupFilters,
  groups,
  clearFilters,
}: FilterControlsProps) {
  const toggleStatusFilter = (status: ServiceStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleGroupFilter = (groupId: string) => {
    setGroupFilters((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.operational:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ServiceStatus.degraded:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case ServiceStatus.partialOutage:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case ServiceStatus.majorOutage:
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case ServiceStatus.maintenance:
        return <Clock className="h-4 w-4 text-sky-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.operational:
        return "Operational";
      case ServiceStatus.degraded:
        return "Degraded";
      case ServiceStatus.partialOutage:
        return "Partial Outage";
      case ServiceStatus.majorOutage:
        return "Major Outage";
      case ServiceStatus.maintenance:
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  const hasActiveFilters = statusFilters.length > 0 || groupFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 px-1 min-w-[1.25rem] text-center"
              >
                {statusFilters.length + groupFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuGroup>
            {Object.values(ServiceStatus).map((status) => (
              <DropdownMenuItem
                key={status}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleStatusFilter(status)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(status)}
                  <span>{getStatusLabel(status)}</span>
                </div>
                {statusFilters.includes(status) && (
                  <CheckCircle className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          {groups.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Group</DropdownMenuLabel>
              <DropdownMenuGroup>
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleGroupFilter(group.id)}
                  >
                    <span className="flex-1">{group.name}</span>
                    {groupFilters.includes(group.id) && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                <span>Clear all filters</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filter badges */}
      {statusFilters.map((status) => (
        <Badge
          key={status}
          variant="outline"
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100"
        >
          {getStatusIcon(status)}
          <span>{getStatusLabel(status)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => toggleStatusFilter(status)}
            aria-label={`Remove ${getStatusLabel(status)} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {groupFilters.map((groupId) => {
        const group = groups.find((g) => g.id === groupId);
        return (
          <Badge
            key={groupId}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100"
          >
            <span>{group?.name || "Unknown Group"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1"
              onClick={() => toggleGroupFilter(groupId)}
              aria-label={`Remove ${group?.name || "Unknown Group"} filter`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={clearFilters}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
