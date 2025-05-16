"use client"

import { ServiceStatus, type Service, type ServiceGroup } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Clock, AlertOctagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface ServiceCardProps {
  service: Omit<Service, "status"> & { status: ServiceStatus } & {
    group?: ServiceGroup | null
  }
  lastUpdated?: Date
}

export default function ServiceCard({ service, lastUpdated }: ServiceCardProps) {
  const getStatusDetails = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.operational:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: "Operational",
          color: "border-green-500 bg-green-50 dark:bg-green-950/30",
          textColor: "text-green-700 dark:text-green-400",
          badgeColor:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
          description: "This service is operating normally",
        }
      case ServiceStatus.degraded:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          text: "Degraded",
          color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
          textColor: "text-yellow-700 dark:text-yellow-400",
          badgeColor:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
          description: "This service is experiencing performance issues",
        }
      case ServiceStatus.partialOutage:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          text: "Partial Outage",
          color: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
          textColor: "text-orange-700 dark:text-orange-400",
          badgeColor:
            "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800",
          description: "Some components of this service are unavailable",
        }
      case ServiceStatus.majorOutage:
        return {
          icon: <AlertOctagon className="h-5 w-5" />,
          text: "Major Outage",
          color: "border-red-500 bg-red-50 dark:bg-red-950/30",
          textColor: "text-red-700 dark:text-red-400",
          badgeColor: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
          description: "This service is currently unavailable",
        }
      case ServiceStatus.maintenance:
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "Maintenance",
          color: "border-sky-500 bg-sky-50 dark:bg-sky-950/30",
          textColor: "text-sky-700 dark:text-sky-400",
          badgeColor: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800",
          description: "This service is undergoing scheduled maintenance",
        }
      default:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: "Unknown",
          color: "border-gray-500 bg-gray-50 dark:bg-gray-800/50",
          textColor: "text-gray-700 dark:text-gray-400",
          badgeColor:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
          description: "Status information is unavailable",
        }
    }
  }

  const statusDetails = getStatusDetails(service.status)
  const formattedDate = lastUpdated
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(lastUpdated)
    : null


  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "border-l-4 transition-all duration-200 group max-w-2xl",
              "hover:shadow-md hover:translate-y-[-2px]",
              {
                "border-l-green-500": service.status === ServiceStatus.operational,
                "border-l-yellow-500": service.status === ServiceStatus.degraded,
                "border-l-orange-500": service.status === ServiceStatus.partialOutage,
                "border-l-red-500": service.status === ServiceStatus.majorOutage,
                "border-l-sky-500": service.status === ServiceStatus.maintenance,
              },
            )}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {service.group && <div className="text-xs text-gray-500 mb-1">{service.group.name}</div>}
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3
                              className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-white transition-colors truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
                              style={{ lineHeight: '1.2' }}
                              title={service.name}
                            >
                              {service.name}
                            </h3>
                          </TooltipTrigger>
                          <div className="sr-only">{service.name}</div>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex-shrink-0 max-w-full">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap overflow-hidden text-ellipsis",
                          statusDetails.badgeColor,
                          "group-hover:shadow-sm",
                        )}
                        title={statusDetails.text}
                      >
                        <span className={statusDetails.textColor}>{statusDetails.icon}</span>
                        <span className="truncate max-w-[100px]">{statusDetails.text}</span>
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 break-words max-w-full overflow-hidden text-ellipsis" style={{wordBreak: 'break-word'}}>{service.description}</p>

                  {formattedDate && (
                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">Last updated: {formattedDate}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}
