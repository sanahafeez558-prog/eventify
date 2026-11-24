"use client"

import { useState } from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ZoomableDescriptionProps {
  content: string
}

export function ZoomableDescription({ content }: ZoomableDescriptionProps) {
  const [zoomPercent, setZoomPercent] = useState(100)

  const handleZoomIn = () => {
    setZoomPercent((prev) => Math.min(prev + 15, 160))
  }

  const handleZoomOut = () => {
    setZoomPercent((prev) => Math.max(prev - 15, 85))
  }

  const handleReset = () => {
    setZoomPercent(100)
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <h3 className="text-lg font-semibold text-foreground">About This Event</h3>

        {/* Dedicated Article Text Zoom Controls (+ / - / Reset) */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Text Size:</span>
          <button
            onClick={handleZoomOut}
            title="Zoom Out Text (-)"
            aria-label="Zoom Out Text"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-indigo-400 font-semibold px-1 min-w-[36px] text-center">
            {zoomPercent}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In Text (+)"
            aria-label="Zoom In Text"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            title="Reset to 100%"
            aria-label="Reset Zoom"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors ml-0.5"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div
        className="text-muted-foreground leading-relaxed whitespace-pre-line transition-all duration-200"
        style={{ fontSize: `${zoomPercent}%` }}
      >
        {content}
      </div>
    </div>
  )
}
