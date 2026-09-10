import React, { useState, useRef } from 'react';
import SearchableSelect from './SearchableSelect';
import { Upload, Sparkles, Box, Cylinder, HelpCircle, Layers, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';


const COMMODITY_CATEGORIES = [
  { value: "general", label: "General Packaged Goods" },
  { value: "baby_food", label: "1. Baby food" },
  { value: "weaning_food", label: "2. Weaning food" },
  { value: "biscuits", label: "3. Biscuits" },
  { value: "bread", label: "4. Bread" },
  { value: "butter_margarine", label: "5. Butter and Margarine" },
  { value: "cereals_pulses", label: "6. Cereals and Pulses" },
  { value: "coffee", label: "7. Coffee" },
  { value: "tea", label: "8. Tea" },
  { value: "beverage_materials", label: "9. Materials for beverages" },
  { value: "edible_oil_ghee", label: "10. Edible Oils, Vanaspati, Ghee" },
  { value: "milk_powder", label: "11. Milk Powder" },
  { value: "non_soapy_detergents", label: "12. Non-soapy detergents (powder)" },
  { value: "rice_flour_atta", label: "13. Rice, flour, atta, rawa, suji" },
  { value: "salt", label: "14. Salt" },
  { value: "soaps", label: "15. Soaps (Laundry, Toilet, Detergent bars)" },
  { value: "aerated_drinks", label: "16. Aerated soft drinks, non-alcoholic beverages" },
  { value: "mineral_water", label: "17. Mineral / Drinking water" },
  { value: "cement", label: "18. Cement in bags" },
  { value: "paint_varnish", label: "19. Paint, varnish etc." },
];

const GEOMETRY_OPTIONS = [
  { value: "rectangular", label: "Rectangular" },
  { value: "cylindrical", label: "Cylindrical" },
  { value: "irregular", label: "Irregular" },
];

export default function IngestionForm({ onScanSubmit, isScanning, currentScan, onModeChange }) {
  const [mode, setMode] = useState('physical'); // 'physical' or 'url'
  
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [heightMm, setHeightMm] = useState('');
  const [widthMm, setWidthMm] = useState('');
  const [depthMm, setDepthMm] = useState('');
  const [containerType, setContainerType] = useState('');
  const [category, setCategory] = useState('');

  const [url, setUrl] = useState('');
  const [isLooseCommodity, setIsLooseCommodity] = useState(false);

  React.useEffect(() => {
    if (onModeChange) onModeChange(mode);
  }, [mode, onModeChange]);

  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (currentScan) {
      if (currentScan.url) {
        setMode('url');
        setUrl(currentScan.url);
        setIsLooseCommodity(currentScan.is_loose_commodity || false);
        setCategory(currentScan.category || '');
      } else {
        setMode('physical');
        setHeightMm(currentScan.package_height_mm || '');
        setWidthMm(currentScan.package_width_mm || '');
        setDepthMm(currentScan.package_depth_mm || '');
        setContainerType(currentScan.container_type || '');
        setCategory(currentScan.category || '');

        if (currentScan.is_historical) {
          setFiles([]);
          if (currentScan.surfaces && currentScan.surfaces.length > 0) {
            setPreviewUrls(currentScan.surfaces.map(s => s.image_url));
          } else if (currentScan.image_url) {
            setPreviewUrls([currentScan.image_url]);
          } else {
            setPreviewUrls([]);
          }
        }
      }
    } else {
      setFiles([]);
      setPreviewUrls([]);
      setHeightMm('');
      setWidthMm('');
      setDepthMm('');
      setContainerType('');
      setCategory('');
      setUrl('');
      setIsLooseCommodity(false);
    }
  }, [currentScan]);

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

  const handleCategoryChange = (val) => {
    setCategory(val);
    if (['aerated_drinks', 'mineral_water'].includes(val)) {
      setContainerType('cylindrical');
    } else if (['baby_food', 'milk_powder', 'coffee', 'paint_varnish'].includes(val)) {
      setContainerType('cylindrical');
    } else {
      setContainerType('');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'physical') {
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

        onScanSubmit(formData, 'physical');
    } else {
        if (!url) {
            alert('Please enter a product URL.');
            return;
        }
        
        onScanSubmit({ url, is_loose_commodity: isLooseCommodity, category }, 'url');
    }
  };

  return (
    <div className="bg-white shadow-card border-2 border-gray-200 border border-gray-200 rounded-2xl p-6 shadow-xl space-y-6" style={{ colorScheme: 'light' }}>
      <div>
        {!currentScan && (
        <div className="flex border-b border-gray-200 mb-4">
            <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold text-center border-b-2 transition-colors ${mode === 'physical' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setMode('physical')}
            >
                <Layers className="w-4 h-4 inline-block mr-2 -mt-1" />
                Physical Scan
            </button>
            <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold text-center border-b-2 transition-colors ${mode === 'url' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setMode('url')}
            >
                <LinkIcon className="w-4 h-4 inline-block mr-2 -mt-1" />
                E-Comm URL
            </button>
        </div>
        )}

        <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
            {mode === 'physical' ? (
                <>
                    <Layers className="w-5 h-5 text-brand-500" />
                    <span>Multi-Surface Ingestion & Dimensions</span>
                </>
            ) : (
                <>
                    <LinkIcon className="w-5 h-5 text-brand-500" />
                    <span>E-Commerce Listing Scraper</span>
                </>
            )}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
            {mode === 'physical' 
                ? "Upload packaged commodity imagery and enter verified physical dimensions for pixel-to-millimeter metric calibration."
                : "Paste an e-commerce product URL. The engine will scrape the web DOM and cross-verify with gallery images."
            }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {mode === 'physical' && (
            <>
                {/* Upload Zone */}
                <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2 flex justify-between">
                <span>Package Images (.jpg, .png)</span>
                {(files.length > 0 || previewUrls.length > 0) && <span className="text-brand-500">{Math.max(files.length, previewUrls.length)} Selected</span>}
                </label>
                <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col min-h-[140px] ${
                (files.length > 0 || previewUrls.length > 0)
                ? 'border-brand-500/50 bg-white'
                : 'border-gray-200 hover:border-gray-200 bg-shell-900/30 cursor-pointer justify-center items-center'
                }`}
                onClick={(e) => {
                if (files.length === 0 && previewUrls.length === 0) fileInputRef.current?.click();
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

                {(files.length > 0 || previewUrls.length > 0) ? (
                <div className="w-full">
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {previewUrls.map((url, idx) => (
                <div key={idx} className="relative flex-shrink-0 group">
                <img
                src={url}
                alt={`Preview ${idx + 1}`}
                className="w-20 h-24 object-cover rounded-lg border border-gray-200 shadow-md"
                />
                <div className="absolute top-1 left-1 bg-black/60 text-gray-900 text-[9px] px-1.5 py-0.5 rounded">
                {idx === 0 ? 'PDP (Front)' : `Side ${idx}`}
                </div>
                {!currentScan?.is_historical && (
                <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="absolute top-1 right-1 bg-rose-500 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg hover:bg-rose-600 z-10"
                >
                X
                </button>
                )}
                </div>
                ))}
                {!currentScan?.is_historical && (
                <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="w-20 h-24 flex-shrink-0 rounded-lg border border-dashed border-brand-500/50 bg-brand-50 flex flex-col items-center justify-center text-brand-500 hover:bg-brand-100 transition"
                >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Add Image</span>
                </button>
                )}
                </div>
                <div className="text-left mt-2 text-[10px] text-brand-500">
                Ready for Computer Vision Analysis. Ensure the first image is the Principal Display Panel (Front).
                </div>
                <div className="text-left mt-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2 rounded">
                ⚠️ STRICT RULE: Every photo uploaded MUST show the FULL height of the product (top to bottom). Do NOT upload zoomed-in macro crops of text, or the physical font size measurements will be mathematically corrupted.
                </div>
                </div>
                ) : (
                <div className="space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-white shadow-card border border-gray-200 flex items-center justify-center mx-auto text-brand-500" style={{ colorScheme: 'light' }}>
                <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-gray-700">
                <span className=" font-semibold text-brand-500">Click to upload</span> or drag and drop
                </div>
                <p className="text-[11px] text-slate-500">Multi-angle package frontal / wrapper snapshot. Upload multiple files at once.</p>
                </div>
                )}
                </div>
                </div>

                {/* Container Geometry & Category */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Commodity Category</label>
                    <SearchableSelect
                      value={category}
                      onChange={handleCategoryChange}
                      options={COMMODITY_CATEGORIES}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Container Geometry [Rule 7(4)]</label>
                    <SearchableSelect
                      value={containerType}
                      onChange={(val) => setContainerType(val)}
                      options={GEOMETRY_OPTIONS}
                    />
                  </div>
                </div>

                {/* Physical Dimension Inputs */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Physical Dimensions (Metric mm)
                </label>
                <span className="text-[11px] text-gray-500">For Rule 7 PDP & Scale S = px/mm</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                <div>
                <label className="text-[11px] text-gray-500 block mb-1">PDP Height (H) mm</label>
                <input
                type="number"
                step="1"
                min="10"
                value={heightMm}
                onChange={(e) => setHeightMm(e.target.value.replace(/^0+(?=\d)/, ''))}
                className="w-full bg-white shadow-inner border border-brand-500/50 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500/50" style={{ colorScheme: 'light' }}
                required
                />
                </div>

                <div>
                <label className="text-[11px] text-gray-500 block mb-1">
                {containerType === 'cylindrical' ? 'PDP Diameter (W) mm' : 'PDP Width (W) mm'}
                </label>
                <input
                type="number"
                step="1"
                min="10"
                value={widthMm}
                onChange={(e) => setWidthMm(e.target.value.replace(/^0+(?=\d)/, ''))}
                className="w-full bg-white shadow-inner border border-brand-500/50 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500/50" style={{ colorScheme: 'light' }}
                required
                />
                </div>

                {containerType === 'irregular' && (
                <div>
                <label className="text-[11px] text-gray-500 block mb-1">Total Surface Area (cm²)</label>
                <input
                type="number"
                step="1"
                min="0"
                value={depthMm}
                onChange={(e) => setDepthMm(e.target.value.replace(/^0+(?=\d)/, ''))}
                className="w-full bg-white shadow-inner border border-brand-500/50 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500/50" style={{ colorScheme: 'light' }}
                required
                />
                </div>
                )}
                </div>
                </div>
            </>
        )}

        {mode === 'url' && (
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                        Product URL
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g., https://www.amazon.in/dp/..."
                        className="w-full bg-white shadow-inner border border-brand-500/50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50" style={{ colorScheme: 'light' }}
                        required
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="looseCommodity"
                        checked={isLooseCommodity}
                        onChange={(e) => setIsLooseCommodity(e.target.checked)}
                        className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="looseCommodity" className="text-sm text-gray-700">
                        Loose Commodity [Rule 26(g)] (e.g., Garments)
                    </label>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Commodity Category</label>
                  <SearchableSelect
                    value={category}
                    onChange={handleCategoryChange}
                    options={COMMODITY_CATEGORIES}
                  />
                </div>
            </div>
        )}



        {/* Submit Scan Button */}
        <button
          type="submit"
          disabled={isScanning}
          className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-gray-900 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
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
