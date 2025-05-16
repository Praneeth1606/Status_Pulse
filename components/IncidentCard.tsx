"use client";

import React from "react";
import type { Incident } from "@prisma/client";
import { IncidentStatus, IncidentImpact } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface IncidentCardProps {
  incident: Omit<Incident, "status" | "impact"> & {
    status: IncidentStatus;
    impact: IncidentImpact;
    affectedServices: { id: string }[];
    updates: {
      id: string;
      message: string;
      status: IncidentStatus;
      createdAt: Date;
      createdBy: string;
    }[];
  };
}

export default function IncidentCard({ incident }: IncidentCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getImpactBadge = (impact: IncidentImpact) => {
    switch (impact) {
      case IncidentImpact.critical:
        return <Badge variant="destructive">Critical</Badge>;
      case IncidentImpact.major:
        return <Badge variant="destructive">Major</Badge>;
      case IncidentImpact.minor:
        return <Badge variant="secondary">Minor</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.investigating:
        return (
          <Badge variant="destructive" className="font-medium px-2.5 py-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
            Investigating
          </Badge>
        );
      case IncidentStatus.identified:
        return (
          <Badge
            variant="secondary"
            className="font-medium px-2.5 py-1 bg-yellow-500 hover:bg-yellow-600"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
            Identified
          </Badge>
        );
      case IncidentStatus.monitoring:
        return (
          <Badge variant="secondary" className="font-medium px-2.5 py-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
            Monitoring
          </Badge>
        );
      case IncidentStatus.resolved:
        return (
          <Badge
            variant="outline"
            className="font-medium px-2.5 py-1 text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
            Resolved
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

  return (
    <Card
      className={cn("border-l-4", {
        "border-l-red-500": incident.impact === IncidentImpact.critical,
        "border-l-orange-500": incident.impact === IncidentImpact.major,
        "border-l-yellow-500": incident.impact === IncidentImpact.minor,
      })}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className={cn("h-5 w-5 mt-0.5", {
                "text-red-500": incident.impact === IncidentImpact.critical,
                "text-orange-500": incident.impact === IncidentImpact.major,
                "text-yellow-500": incident.impact === IncidentImpact.minor,
              })}
            />
            <div>
              <CardTitle className="text-lg">{incident.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-1">
                {getImpactBadge(incident.impact)}
                {getStatusBadge(incident.status)}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(incident.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="text-sm text-gray-700 mb-2">
            {incident.description}
          </div>

          {incident.updates.length > 0 && (
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
                      Show updates ({incident.updates.length})
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                  {incident.updates.map((update) => (
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
