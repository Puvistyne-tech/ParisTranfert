"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import DisneylandParisPage from "@/app/[locale]/disneyland-paris/page";

// Dynamically import the Disneyland page to avoid SSR issues
// We need to pass locale as a prop, so we'll create a wrapper
const DisneylandParisPageContent = dynamic(
  () => import("@/app/[locale]/disneyland-paris/page").then((mod) => ({ default: mod.default })),
  { ssr: false }
);

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 0.6;
const ZOOM_STEP = 0.05;
const DEFAULT_ZOOM = 0.3;

export function DisneylandPagePreview() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const locale = useLocale();

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleResetZoom = () => {
    setZoom(DEFAULT_ZOOM);
  };

  const scalePercentage = Math.round(zoom * 100);
  const widthPercentage = (1 / zoom) * 100;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            disabled={zoom <= MIN_ZOOM}
            className="h-8 w-8 p-0"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[50px] text-center">
            {scalePercentage}%
          </span>
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            disabled={zoom >= MAX_ZOOM}
            className="h-8 w-8 p-0"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleResetZoom}
            variant="outline"
            size="sm"
            className="h-8 px-2 ml-2"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="text-xs">Reset</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Preview Container */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 min-h-0 relative">
        <div className="p-4">
          <div
            className="origin-top-left pointer-events-none"
            style={{
              transform: `scale(${zoom})`,
              width: `${widthPercentage}%`,
            }}
          >
            <DisneylandParisPage />
          </div>
        </div>
      </div>
    </div>
  );
}
