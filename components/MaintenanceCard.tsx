"use client";

import React from "react";
import { MaintenanceStatus, Maintenance } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MaintenanceCardProps {
  maintenance: Omit<Maintenance, "status"> & {
    status: MaintenanceStatus;
    affectedServices: { id: string }[];
    updates: {
      id: string;
      message: string;
      status: MaintenanceStatus;
      createdAt: Date;
      createdBy: string;
    }[];
  };
}

export default function MaintenanceCard({ maintenance }: MaintenanceCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.scheduled:
        return (
          <Badge
            variant="secondary"
            className="font-medium px-2.5 py-1 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case MaintenanceStatus.in_progress:
        return (
          <Badge
            variant="secondary"
            className="font-medium px-2.5 py-1 bg-sky-500 hover:bg-sky-600"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
            In Progress
          </Badge>
        );
      case MaintenanceStatus.completed:
        return (
          <Badge
            variant="outline"
            className="font-medium px-2.5 py-1 text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium px-2.5 py-1">
            Unknown
          </Badge>
        );
    }
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const sameDay = start.toDateString() === end.toDateString();

    if (sameDay) {
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
    } else {
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`;
    }
  };

  return (
    <Card className="border-l-4 border-l-sky-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 mt-0.5 text-sky-500" />
            <div>
              <CardTitle className="text-lg">{maintenance.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-1">
                {getStatusBadge(maintenance.status)}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDateRange(maintenance.startTime, maintenance.endTime)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="text-sm text-gray-700 mb-2">
            {maintenance.description}
          </div>

          {maintenance.updates.length > 0 && (
            <>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-sm mt-2 w-full justify-center border-dashed hover:bg-gray-50"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide updates
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show updates ({maintenance.updates.length})
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                  {maintenance.updates.map((update) => (
                    <div key={update.id} className="relative group">
                      <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-white border-2 border-gray-300 group-hover:border-gray-400 transition-colors"></div>
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium text-gray-800 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs">
                              {update.createdBy.charAt(0).toUpperCase()}
                            </span>
                            {update.createdBy}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(update.createdAt).toLocaleString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                        <div className="text-gray-700 mb-2 bg-white p-2 rounded border border-gray-200">
                          {update.message}
                        </div>
                        <div>{getStatusBadge(update.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}
