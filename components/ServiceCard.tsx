import { ServiceStatus, Service, ServiceGroup } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServiceCardProps {
  service: Omit<Service, "status"> & { status: ServiceStatus } & {
    group?: ServiceGroup | null;
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const getStatusDetails = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.operational:
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: "Operational",
          color: "border-green-500 bg-green-50",
          textColor: "text-green-700",
          description: "This service is operating normally",
        };
      case ServiceStatus.degraded:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          text: "Degraded",
          color: "border-yellow-500 bg-yellow-50",
          textColor: "text-yellow-700",
          description: "This service is experiencing performance issues",
        };
      case ServiceStatus.partialOutage:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
          text: "Partial Outage",
          color: "border-orange-500 bg-orange-50",
          textColor: "text-orange-700",
          description: "Some components of this service are unavailable",
        };
      case ServiceStatus.majorOutage:
        return {
          icon: <AlertOctagon className="h-5 w-5 text-red-500" />,
          text: "Major Outage",
          color: "border-red-500 bg-red-50",
          textColor: "text-red-700",
          description: "This service is currently unavailable",
        };
      case ServiceStatus.maintenance:
        return {
          icon: <Clock className="h-5 w-5 text-sky-500" />,
          text: "Maintenance",
          color: "border-sky-500 bg-sky-50",
          textColor: "text-sky-700",
          description: "This service is undergoing scheduled maintenance",
        };
      default:
        return {
          icon: <CheckCircle className="h-5 w-5 text-gray-500" />,
          text: "Unknown",
          color: "border-gray-500 bg-gray-50",
          textColor: "text-gray-700",
          description: "Status information is unavailable",
        };
    }
  };

  const statusDetails = getStatusDetails(service.status);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "border-l-4 hover:shadow-md transition-all duration-200 cursor-pointer group",
              {
                "border-l-green-500":
                  service.status === ServiceStatus.operational,
                "border-l-yellow-500":
                  service.status === ServiceStatus.degraded,
                "border-l-orange-500":
                  service.status === ServiceStatus.partialOutage,
                "border-l-red-500":
                  service.status === ServiceStatus.majorOutage,
                "border-l-sky-500":
                  service.status === ServiceStatus.maintenance,
              }
            )}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors flex items-center gap-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {service.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ml-2 transition-all",
                    statusDetails.color,
                    statusDetails.textColor,
                    "group-hover:shadow-sm"
                  )}
                >
                  {statusDetails.icon}
                  <span>{statusDetails.text}</span>
                </div>
              </div>

              {service.status !== ServiceStatus.operational && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs w-full justify-start text-gray-500 hover:text-gray-700 p-0 h-auto"
                  >
                    View incident details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div>
            <div className="font-medium">{statusDetails.text}</div>
            <p className="text-sm text-gray-500">{statusDetails.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
