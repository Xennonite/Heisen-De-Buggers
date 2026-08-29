import React, { useState, useRef } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export default function VisualOverlay({ scanResult, imageUrl }) {
  const [showBoxes, setShowBoxes] = useState(true);
  const [showClearance, setShowClearance] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [surfaceIndex, setSurfaceIndex] = useState(0);

  if (!scanResult) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[460px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
          <Eye className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Spatial Inspection Canvas Awaiting Scan</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a preset or upload an image and click "Run Automated Compliance Inspection" to view interactive bounding box overlays and Rule 8 clearance masks.
        </p>
      </div>
    );
  }

  const {
    clearance_zone = {},
    pdp_area_cm2 = 0,
    required_font_height_mm = 2.5,
    surfaces = [],
  } = scanResult;
  
  const hasSurfaces = surfaces && surfaces.length > 0;
  
  const currentSurface = hasSurfaces ? surfaces[surfaceIndex] : {
    bounding_boxes: scanResult.bounding_boxes || [],
    image_url: scanResult.image_url || imageUrl,
    original_dimensions: scanResult.original_dimensions || { width: 600, height: 800 }
  };
  
  const bounding_boxes = currentSurface.bounding_boxes;
  const currentImageUrl = currentSurface.image_url;
  const original_dimensions = currentSurface.original_dimensions;

  const clearanceBox = clearance_zone?.clearance_box;
  const isClearanceCompliant = clearance_zone?.is_compliant !== false;

  const origW = original_dimensions.width || 600;
  const origH = original_dimensions.height || 800;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Eye className="w-5 h-5 text-sky-400" />
            <span>Stage 3: Spatial Visual Overlay & Typography</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            PDP Area: <span className="text-sky-400 font-semibold">{pdp_area_cm2} cm²</span> | Minimum Required Font Height: <span className="text-amber-400 font-semibold">{required_font_height_mm} mm</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Clearance Toggle */}
          <button
            onClick={() => setShowClearance(!showClearance)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
              showClearance
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>Rule 8 Clearance Zone</span>
          </button>

          {/* Boxes Toggle */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
              showBoxes
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Bounding Boxes</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(Math.max(0.75, zoom - 0.15))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-300 px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2.0, zoom + 0.15))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-slate-400 hover:text-white border-l border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Thumbnail Carousel */}
      {hasSurfaces && surfaces.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-800">
          {surfaces.map((surface, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSurfaceIndex(idx);
                setSelectedBox(null);
                setZoom(1);
              }}
              className={`relative flex-shrink-0 rounded-lg border-2 overflow-hidden transition ${
                surfaceIndex === idx ? 'border-sky-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={surface.image_url} alt={`Surface ${idx}`} className="h-16 w-16 object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5">
                {idx === 0 ? 'PDP (Front)' : `Side ${idx}`}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[460px] p-2">
        <div
          className="relative inline-block transition-transform duration-150 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Background Packaging Image */}
          <img
            src={currentImageUrl}
            alt="Packaging inspection"
            className="max-h-[500px] w-auto rounded object-contain shadow-2xl block"
          />

          {/* SVG Overlay Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${origW} ${origH}`}
            preserveAspectRatio="none"
          >
            {/* Rule 8 Clearance Zone Mask */}
            {showClearance && clearanceBox && (
              <g className="pointer-events-auto">
                <rect
                  x={clearanceBox[0]}
                  y={clearanceBox[1]}
                  width={clearanceBox[2]}
                  height={clearanceBox[3]}
                  fill={isClearanceCompliant ? 'rgba(168, 85, 247, 0.15)' : 'rgba(239, 68, 68, 0.25)'}
                  stroke={isClearanceCompliant ? '#a855f7' : '#ef4444'}
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  className="transition-all cursor-pointer"
                  onClick={() => setSelectedBox({
                    label: 'Rule 8(1) Clearance Zone',
                    text: isClearanceCompliant ? 'No objects encroaching mandatory buffer' : `Encroached by: ${clearance_zone.encroaching_objects?.join(', ')}`,
                    status: isClearanceCompliant ? 'PASS' : 'FAIL',
                    rule_violation: isClearanceCompliant ? null : 'Clearance zone encroached by neighboring text/graphics',
                  })}
                />
              </g>
            )}

            {/* Bounding Boxes */}
            {showBoxes && bounding_boxes.map((b, idx) => {
              const [bx, by, bw, bh] = b.box_pixels;
              const isPass = b.status === 'PASS';
              const strokeColor = isPass ? '#22c55e' : '#ef4444';
              const fillColor = isPass ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.22)';

              return (
                <g key={b.id || idx} className="pointer-events-auto cursor-pointer group" onClick={() => setSelectedBox(b)}>
                  <rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                    className="hover:stroke-amber-400 hover:fill-amber-400/20 transition-colors"
                  />
                  {/* Label Pill */}
                  <rect
                    x={bx}
                    y={Math.max(0, by - 16)}
                    width={Math.min(bw + 10, 110)}
                    height="16"
                    fill={strokeColor}
                    rx="3"
                  />
                  <text
                    x={bx + 4}
                    y={Math.max(12, by - 4)}
                    fill="#ffffff"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {b.label?.slice(0, 14)} ({b.measured_height_mm}mm)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Box Inspection Details */}
      {selectedBox && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-white">{selectedBox.label}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedBox.status === 'PASS'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {selectedBox.status}
              </span>
            </div>

            {selectedBox.text && (
              <p className="text-xs text-slate-300 font-mono">"{selectedBox.text}"</p>
            )}

            {selectedBox.measured_height_mm && (
              <p className="text-xs text-slate-400">
                Measured Height: <span className="text-white font-semibold">{selectedBox.measured_height_mm} mm</span> | Statutory Minimum: <span className="text-amber-400 font-semibold">{selectedBox.required_height_mm || required_font_height_mm} mm</span>
              </p>
            )}

            {selectedBox.rule_violation && (
              <p className="text-xs text-rose-400 font-medium">{selectedBox.rule_violation}</p>
            )}
          </div>

          <button
            onClick={() => setSelectedBox(null)}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 bg-slate-900 rounded border border-slate-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
