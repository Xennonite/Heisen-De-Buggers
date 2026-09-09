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
 <div className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[460px]">
 <div className="w-14 h-14 rounded-2xl bg-white shadow-card border border-gray-200 border border-gray-200 flex items-center justify-center text-slate-500 mb-3">
 <Eye className="w-7 h-7" />
 </div>
 <h3 className="text-sm font-semibold text-gray-700">Spatial Inspection Canvas Awaiting Scan</h3>
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
 let currentImageUrl = currentSurface.image_url;
 if (currentImageUrl && currentImageUrl.startsWith('/uploads')) {
   const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
   currentImageUrl = `${backendUrl}${currentImageUrl}`;
 }
 const original_dimensions = currentSurface.original_dimensions;

 const clearanceBox = clearance_zone?.clearance_box;
 const isClearanceCompliant = clearance_zone?.is_compliant !== false;

 const origW = original_dimensions.width || 600;
 const origH = original_dimensions.height || 800;

 return (
 <div className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
 {/* Top Toolbar */}
 <div className="flex items-center justify-between flex-wrap gap-2">
 <div>
 <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
 <Eye className="w-5 h-5 text-brand-500" />
 <span>Spatial Visual Overlay & Typography</span>
 </h2>
 {!scanResult.url && (
     <p className="text-xs text-gray-500 mt-0.5">
     PDP Area: <span className="text-brand-500 font-semibold">{pdp_area_cm2} cm²</span> | Minimum Required Font Height: <span className="text-amber-400 font-semibold">{required_font_height_mm} mm</span>
     </p>
 )}
 </div>

 {/* Controls */}
 <div className="flex items-center space-x-2">
 {/* Clearance Toggle */}
 {!scanResult.url && (
     <button
     onClick={() => setShowClearance(!showClearance)}
     className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
     showClearance
     ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
     : 'bg-white shadow-card border border-gray-200 text-gray-500 border-gray-200'
     }`}
     >
     <span>Rule 8 Clearance Zone</span>
     </button>
 )}

 {/* Boxes Toggle */}
 <button
 onClick={() => setShowBoxes(!showBoxes)}
 className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
 showBoxes
 ? 'bg-sky-500/20 text-brand-500 border-brand-500/50'
 : 'bg-white shadow-card border border-gray-200 text-gray-500 border-gray-200'
 }`}
 >
 {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
 <span>Bounding Boxes</span>
 </button>

 {/* Zoom Buttons */}
 <div className="flex items-center bg-white shadow-card border border-gray-200 border border-gray-200 rounded-lg p-0.5">
 <button
 onClick={() => setZoom(Math.max(0.75, zoom - 0.15))}
 className="p-1 text-gray-500 hover:text-gray-900"
 >
 <ZoomOut className="w-3.5 h-3.5" />
 </button>
 <span className="text-[10px] text-gray-700 px-1 font-mono">{Math.round(zoom * 100)}%</span>
 <button
 onClick={() => setZoom(Math.min(2.0, zoom + 0.15))}
 className="p-1 text-gray-500 hover:text-gray-900"
 >
 <ZoomIn className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => setZoom(1)}
 className="p-1 text-gray-500 hover:text-gray-900 border-l border-gray-200"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 
 {/* Thumbnail Carousel */}
 {hasSurfaces && surfaces.length > 1 && (
 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-gray-200">
 {surfaces.map((surface, idx) => (
 <button
 key={idx}
 onClick={() => {
 setSurfaceIndex(idx);
 setSelectedBox(null);
 setZoom(1);
 }}
 className={`relative flex-shrink-0 rounded-lg border-2 overflow-hidden transition ${
 surfaceIndex === idx ? 'border-brand-500/50 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
 }`}
 >
 <img src={surface.image_url?.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${surface.image_url}` : surface.image_url} alt={`Surface ${idx}`} className="h-16 w-16 object-cover" />
 <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-gray-900 py-0.5">
 {idx === 0 ? 'PDP (Front)' : `Side ${idx}`}
 </div>
 </button>
 ))}
 </div>
 )}

  {/* Cross-Verification Banner */}
  {scanResult.url && (
      <div className={`p-4 rounded-xl mb-4 flex items-start space-x-3 ${scanResult.discrepancies_detected ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'}`}>
          {scanResult.discrepancies_detected ? <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />}
          <div>
              <h3 className={`text-sm font-bold ${scanResult.discrepancies_detected ? 'text-rose-800' : 'text-emerald-800'}`}>
                  {scanResult.discrepancies_detected ? 'Deceptive Practice Detected!' : 'E-Commerce Cross-Verification Passed'}
              </h3>
              <p className={`text-xs mt-1 ${scanResult.discrepancies_detected ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {scanResult.discrepancies_detected 
                      ? 'The mandatory declarations found in the webpage text do not match the physical labels detected in the product gallery images.' 
                      : 'Webpage text aligns with the physical label image declarations.'}
              </p>
              {scanResult.discrepancies?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                      {scanResult.discrepancies.map((d, i) => (
                          <li key={i} className="text-xs text-rose-700 flex items-center space-x-1.5 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>{d}</span>
                          </li>
                      ))}
                  </ul>
              )}
          </div>
      </div>
  )}

 {/* Main Canvas Viewport */}
 <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center min-h-[460px] p-2">
 {currentImageUrl ? (
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
 {!scanResult.url && showClearance && clearanceBox && (
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
 const isInfo = b.status === 'INFO';
 const strokeColor = isInfo ? '#eab308' : (isPass ? '#22c55e' : '#ef4444'); // eab308 is Tailwind yellow-500
 const fillColor = isInfo ? 'rgba(234, 179, 8, 0.15)' : (isPass ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.22)');

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
 {b.label?.slice(0, 14)} {!scanResult.url && `(${b.measured_height_mm}mm)`}
 </text>
 </g>
 );
 })}
 </svg>
 </div>
 ) : (
 <div className="text-center text-gray-400">
     <EyeOff className="w-10 h-10 mx-auto mb-3 opacity-50 text-gray-300" />
     <p className="text-sm font-medium text-gray-500">No Product Images Found</p>
     <p className="text-xs mt-1">The scraper could not extract any gallery images from this URL.</p>
 </div>
 )}

 {/* Legend */}
 {!scanResult.url && (
 <div className="absolute bottom-4 right-4 z-20 bg-white shadow-card border-2 border-gray-200 backdrop-blur border border-gray-200/50 rounded-lg p-2.5 shadow-xl flex flex-col space-y-1.5 pointer-events-none">
 <div className="flex items-center space-x-2">
 <div className="w-2.5 h-2.5 rounded-sm bg-green-500/20 border border-green-500"></div>
 <span className="text-[10px] text-gray-700 font-medium">Mandatory (Pass)</span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500"></div>
 <span className="text-[10px] text-gray-700 font-medium">Mandatory (Fail)</span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-2.5 h-2.5 rounded-sm bg-amber-400/20 border border-amber-400"></div>
 <span className="text-[10px] text-gray-700 font-medium">Generic Text (No Req)</span>
 </div>
 </div>
 )}
 </div>

 {/* Selected Box Inspection Details */}
 {selectedBox && (
 <div className="bg-white shadow-inner border border-brand-500/50 rounded-xl p-4 flex items-start justify-between">
 <div className="space-y-1">
 <div className="flex items-center space-x-2">
 <span className=" font-semibold text-xs text-gray-900">{selectedBox.label}</span>
 <span
 className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
 selectedBox.status === 'PASS'
 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 border border-emerald-500/30'
 : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
 }`}
 >
 {selectedBox.status}
 </span>
 </div>

 {selectedBox.text && (
 <p className="text-xs text-gray-700 font-mono">"{selectedBox.text}"</p>
 )}

 {!scanResult.url && selectedBox.measured_height_mm && (
 <p className="text-xs text-gray-500">
 Measured Height: <span className="text-gray-900 font-semibold">{selectedBox.measured_height_mm} mm</span> | Statutory Minimum: <span className="text-amber-400 font-semibold">{selectedBox.required_height_mm || required_font_height_mm} mm</span>
 </p>
 )}

 {selectedBox.rule_violation && (
 <p className="text-xs text-rose-400 font-medium">{selectedBox.rule_violation}</p>
 )}
 </div>

 <button
 onClick={() => setSelectedBox(null)}
 className="text-xs text-slate-500 hover:text-gray-700 px-2 py-1 bg-white shadow-card border-2 border-gray-200 rounded border border-gray-200"
 >
 Close
 </button>
 </div>
 )}
 </div>
 );
}
