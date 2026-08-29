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
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [heightMm, setHeightMm] = useState(150);
  const [widthMm, setWidthMm] = useState(80);
  const [depthMm, setDepthMm] = useState(40);
  const [containerType, setContainerType] = useState('rectangular');
  const [category, setCategory] = useState('biscuits');
  const [activePreset, setActivePreset] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setActivePreset(null);
    }
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
      setFile(presetFile);
      setPreviewUrl(URL.createObjectURL(presetFile));
    }, 'image/jpeg');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a product label image or select a demo preset.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
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
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Package Label Image (.jpg, .png)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px] ${
              previewUrl
                ? 'border-sky-500/40 bg-slate-950/60'
                : 'border-slate-700 hover:border-slate-500 bg-slate-950/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="flex items-center space-x-4">
                <img
                  src={previewUrl}
                  alt="Packaging preview"
                  className="w-20 h-24 object-cover rounded-lg border border-slate-700 shadow-md"
                />
                <div className="text-left">
                  <span className="text-xs font-medium text-white block">{file?.name}</span>
                  <span className="text-[11px] text-slate-400">Click to replace image</span>
                  <span className="text-[10px] text-sky-400 block mt-1">Ready for Computer Vision Analysis</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-sky-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-sky-400">Click to upload</span> or drag and drop
                </div>
                <p className="text-[11px] text-slate-500">Multi-angle package frontal / wrapper snapshot</p>
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
              <label className="text-[11px] text-slate-400 block mb-1">Height ($H$) mm</label>
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
              <label className="text-[11px] text-slate-400 block mb-1">Width ($W$) mm</label>
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
              <label className="text-[11px] text-slate-400 block mb-1">Depth ($D$) mm</label>
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
              <option value="rectangular">Rectangular ($A = H \times W$)</option>
              <option value="cylindrical">Cylindrical ($A = 0.40 \times H \times C$)</option>
              <option value="irregular">Irregular ($A = 0.40 \times$ Surface)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Commodity Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="biscuits">Biscuits (2nd Sched)</option>
              <option value="tea">Tea / Coffee (2nd Sched)</option>
              <option value="soap">Soap / Detergent (2nd Sched)</option>
              <option value="edible_oil">Edible Oils (2nd Sched)</option>
              <option value="general">General Packaged Goods</option>
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
