import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Box, Cylinder, HelpCircle, Layers, Image as ImageIcon, Loader2 } from 'lucide-react';

const PRESETS = [
  {
    id: 'biscuit_good_day',
    name: 'Britannia Biscuit (Compliant)',
    category: 'biscuits',
    container_type: 'rectangular',
    height_mm: 120,
    width_mm: 60,
    depth_mm: 35,
    sampleText: 'Britannia Industries Ltd, 5/1A Hungerford Street, Kolkata - 700017\nCountry of Origin: India\nPKD: 07/2026\nFor consumer care contact 1800425444 or feedback@britannia.com\nNet Quantity: 100 g\nMRP Rs. 20.00 (incl. of all taxes)',
    desc: 'Fully compliant standard 100g pack with required font sizes and tax tags.',
  },
  {
    id: 'oil_pouch_encroach',
    name: 'Fortune Sunlite Pouch (Rule 8 Encroachment)',
    category: 'edible_oil',
    container_type: 'rectangular',
    height_mm: 220,
    width_mm: 140,
    depth_mm: 20,
    sampleText: 'Adani Wilmar Ltd, Fortune House, Ahmedabad - 380009\nMade in India\nNet Qty: 1 L\nMRP Rs. 145.00 (incl. of all taxes)\nPacked: 08/2026\nCare: customercare@adaniwilmar.in',
    desc: 'Violates Rule 8(1) with promotional text encroaching clearance boundary.',
  },
  {
    id: 'shampoo_undersized',
    name: 'Herbal Shampoo (Rule 7 Font Breach)',
    category: 'general',
    container_type: 'cylindrical',
    height_mm: 180,
    width_mm: 65,
    depth_mm: 65,
    sampleText: 'Herbal Care India Pvt Ltd, Mumbai - 400001\nCountry of Origin: India\nNet Vol: 200 ml\nMRP Rs. 199.00 (incl. of all taxes)\nPKD 06/2026',
    desc: 'Cylindrical bottle with under-sized 1.2mm font on PDP area > 100 cm².',
  },
  {
    id: 'deceptive_tea_pack',
    name: 'Value Tea Pack (Rule 12 Deceptive "Approx")',
    category: 'tea',
    container_type: 'rectangular',
    height_mm: 150,
    width_mm: 90,
    depth_mm: 50,
    sampleText: 'Supreme Tea Blenders, Assam - 781001, India\nNet Quantity: Approx 250 g\nMRP Rs. 120.00\nPKD 05/2026',
    desc: 'Flags prohibited qualifier "Approx" under Rule 12(6) and missing tax tag.',
  },
];

export default function IngestionForm({ onScanSubmit, isScanning }) {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [heightMm, setHeightMm] = useState(150);
  const [widthMm, setWidthMm] = useState(80);
  const [depthMm, setDepthMm] = useState(40);
  const [containerType, setContainerType] = useState('rectangular');
  const [category, setCategory] = useState('biscuits');
  const [activePreset, setActivePreset] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      const newUrls = selectedFiles.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...newUrls]);
      setActivePreset(null);
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

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.id);
    setHeightMm(preset.height_mm);
    setWidthMm(preset.width_mm);
    setDepthMm(preset.depth_mm);
    setContainerType(preset.container_type);
    setCategory(preset.category);

    // Create a mock canvas image for the preset
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Gradient background representing package
    const grad = ctx.createLinearGradient(0, 0, 600, 800);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 780);

    // Header banner
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(20, 20, 560, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(preset.name.split(' (')[0], 40, 70);

    // Text content
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '18px monospace';
    const lines = preset.sampleText.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 40, 160 + i * 40);
    });

    // Barcode representation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 650, 240, 80);
    ctx.fillStyle = '#000000';
    for (let x = 50; x < 270; x += 6) {
      const w = (x % 12 === 0) ? 4 : 2;
      ctx.fillRect(x, 660, w, 50);
    }
    ctx.font = '12px sans-serif';
    ctx.fillText('8901030829412', 100, 722);

    canvas.toBlob((blob) => {
      const presetFile = new File([blob], `${preset.id}.jpg`, { type: 'image/jpeg' });
      setFiles([presetFile]);
      setPreviewUrls([URL.createObjectURL(presetFile)]);
    }, 'image/jpeg');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload at least one product label image or select a demo preset.');
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('package_height_mm', heightMm);
    formData.append('package_width_mm', widthMm);
    formData.append('package_depth_mm', depthMm);
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

      {/* Demo Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick-Load Demo Presets (Instant Inspection)</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                activePreset === p.id
                  ? 'bg-sky-500/10 border-sky-500/50 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="font-medium text-slate-200">{p.name}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.desc}</div>
            </button>
          ))}
        </div>
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
              <label className="text-[11px] text-slate-400 block mb-1">Height (H) mm</label>
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
              <label className="text-[11px] text-slate-400 block mb-1">Width (W) mm</label>
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

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Depth (D) mm</label>
              <input
                type="number"
                step="1"
                min="0"
                value={depthMm}
                onChange={(e) => setDepthMm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Container Geometry & Category */}
        <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Commodity Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
