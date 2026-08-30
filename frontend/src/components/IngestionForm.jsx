import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Box, Cylinder, HelpCircle, Layers, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function IngestionForm({ onScanSubmit, isScanning }) {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [heightMm, setHeightMm] = useState(150);
  const [widthMm, setWidthMm] = useState(80);
  const [depthMm, setDepthMm] = useState(40);
  const [containerType, setContainerType] = useState('rectangular');
  const [category, setCategory] = useState('biscuits');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      const newUrls = selectedFiles.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };
  
  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    
    const updatedUrls = [...previewUrls];
    window.URL.revokeObjectURL(updatedUrls[index]);
    updatedUrls.splice(index, 1);
    setPreviewUrls(updatedUrls);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    // Auto-select geometry based on category heuristic
    if (['aerated_drinks', 'mineral_water'].includes(selectedCategory)) {
      setContainerType('cylindrical');
    } else if (['baby_food', 'milk_powder', 'coffee', 'paint_varnish'].includes(selectedCategory)) {
      setContainerType('cylindrical');
    } else {
      setContainerType('rectangular');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload at least one product label image.');
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('package_height_mm', heightMm);
    formData.append('package_width_mm', widthMm);
    formData.append('package_depth_mm', containerType === 'irregular' ? depthMm : 0);
    formData.append('surface_area_cm2', containerType === 'irregular' ? depthMm : 0);
    formData.append('container_type', containerType);
    formData.append('category', category);

    onScanSubmit(formData);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <span>Stage 1: Multi-Surface Ingestion & Dimensions</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload packaged commodity imagery and enter verified physical dimensions for pixel-to-millimeter metric calibration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Upload Zone */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex justify-between">
            <span>Package Images (.jpg, .png)</span>
            {files.length > 0 && <span className="text-sky-400">{files.length} Selected</span>}
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col min-h-[140px] ${
              files.length > 0
                ? 'border-sky-500/40 bg-slate-950/60'
                : 'border-slate-700 hover:border-slate-500 bg-slate-950/30 cursor-pointer justify-center items-center'
            }`}
            onClick={(e) => {
              if (files.length === 0) fileInputRef.current?.click();
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {files.length > 0 ? (
              <div className="w-full">
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative flex-shrink-0 group">
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-20 h-24 object-cover rounded-lg border border-slate-700 shadow-md"
                      />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                        {idx === 0 ? 'PDP (Front)' : `Side ${idx}`}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-lg hover:bg-rose-600 z-10"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="w-20 h-24 flex-shrink-0 rounded-lg border border-dashed border-sky-500/50 bg-sky-500/10 flex flex-col items-center justify-center text-sky-400 hover:bg-sky-500/20 transition"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Add Image</span>
                  </button>
                </div>
                <div className="text-left mt-2 text-[10px] text-sky-400">
                  Ready for Computer Vision Analysis. Ensure the first image is the Principal Display Panel (Front).
                </div>
                <div className="text-left mt-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2 rounded">
                  ⚠️ STRICT RULE: Every photo uploaded MUST show the FULL height of the product (top to bottom). Do NOT upload zoomed-in macro crops of text, or the physical font size measurements will be mathematically corrupted.
                </div>
              </div>
            ) : (
              <div className="space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-sky-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-sky-400">Click to upload</span> or drag and drop
                </div>
                <p className="text-[11px] text-slate-500">Multi-angle package frontal / wrapper snapshot. Upload multiple files at once.</p>
              </div>
            )}
          </div>
        </div>

        {/* Physical Dimension Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Physical Dimensions (Metric mm)
            </label>
            <span className="text-[11px] text-slate-400">For Rule 7 PDP & Scale S = px/mm</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">PDP Height (H) mm</label>
              <input
                type="number"
                step="1"
                min="10"
                value={heightMm}
                onChange={(e) => setHeightMm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {containerType === 'cylindrical' ? 'PDP Diameter (W) mm' : 'PDP Width (W) mm'}
              </label>
              <input
                type="number"
                step="1"
                min="10"
                value={widthMm}
                onChange={(e) => setWidthMm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {containerType === 'irregular' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Total Surface Area (cm²)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={depthMm}
                  onChange={(e) => setDepthMm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Container Geometry & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Commodity Category</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="general">General Packaged Goods</option>
              <option value="baby_food">1. Baby food</option>
              <option value="weaning_food">2. Weaning food</option>
              <option value="biscuits">3. Biscuits</option>
              <option value="bread">4. Bread</option>
              <option value="butter_margarine">5. Butter and Margarine</option>
              <option value="cereals_pulses">6. Cereals and Pulses</option>
              <option value="coffee">7. Coffee</option>
              <option value="tea">8. Tea</option>
              <option value="beverage_materials">9. Materials for beverages</option>
              <option value="edible_oil_ghee">10. Edible Oils, Vanaspati, Ghee</option>
              <option value="milk_powder">11. Milk Powder</option>
              <option value="non_soapy_detergents">12. Non-soapy detergents (powder)</option>
              <option value="rice_flour_atta">13. Rice, flour, atta, rawa, suji</option>
              <option value="salt">14. Salt</option>
              <option value="soaps">15. Soaps (Laundry, Toilet, Detergent bars)</option>
              <option value="aerated_drinks">16. Aerated soft drinks, non-alcoholic beverages</option>
              <option value="mineral_water">17. Mineral / Drinking water</option>
              <option value="cement">18. Cement in bags</option>
              <option value="paint_varnish">19. Paint, varnish etc.</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Container Geometry [Rule 7(4)]</label>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="rectangular">Rectangular</option>
              <option value="cylindrical">Cylindrical</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>
        </div>

        {/* Submit Scan Button */}
        <button
          type="submit"
          disabled={isScanning}
          className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Metrology & Statutory Rules...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Automated Compliance Inspection</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
