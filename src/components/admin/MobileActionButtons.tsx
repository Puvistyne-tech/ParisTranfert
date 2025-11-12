"use client";

import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MobileActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
  className?: string;
}

export function MobileActionButtons({
  onEdit,
  onDelete,
  onView,
  editLabel = "Edit",
  deleteLabel = "Delete",
  viewLabel = "View",
  className = "",
}: MobileActionButtonsProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {onView && (
        <>
          {/* Mobile: Icon only */}
          <button
            onClick={onView}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title={viewLabel}
            aria-label={viewLabel}
          >
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          {/* Desktop: Icon + Text */}
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="hidden lg:flex"
          >
            <Eye className="w-4 h-4 mr-1" />
            {viewLabel}
          </Button>
        </>
      )}
      {onEdit && (
        <>
          {/* Mobile: Icon only */}
          <button
            onClick={onEdit}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title={editLabel}
            aria-label={editLabel}
          >
            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          {/* Desktop: Icon + Text */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="hidden lg:flex"
          >
            <Edit className="w-4 h-4 mr-1" />
            {editLabel}
          </Button>
        </>
      )}
      {onDelete && (
        <>
          {/* Mobile: Icon only */}
          <button
            onClick={onDelete}
            className="lg:hidden p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title={deleteLabel}
            aria-label={deleteLabel}
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
          {/* Desktop: Icon + Text */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="hidden lg:flex text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deleteLabel}
          </Button>
        </>
      )}
    </div>
  );
}

