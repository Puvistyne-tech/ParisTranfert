import { Check, CheckCircle, Clock, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "quote_requested"
  | "pending"
  | "quote_sent"
  | "quote_accepted"
  | "confirmed"
  | "completed"
  | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    quote_requested: {
      label: "Quote Requested",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      icon: Clock,
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: Clock,
    },
    quote_sent: {
      label: "Quote Sent",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      icon: Send,
    },
    quote_accepted: {
      label: "Quote Accepted",
      className: "bg-green-100 text-green-800",
      icon: Check,
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    completed: {
      label: "Completed",
      className: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}
