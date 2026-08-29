import React, { useState } from 'react';
import Navbar from './components/Navbar';
import IngestionForm from './components/IngestionForm';
import VisualOverlay from './components/VisualOverlay';
import ComplianceChecklist from './components/ComplianceChecklist';
import ComplianceCard from './components/ComplianceCard';
import ExportPanel from './components/ExportPanel';
import SeventhScheduleModal from './components/SeventhScheduleModal';
import HistoryDrawer from './components/HistoryDrawer';
import { auditApi } from './services/api';

export default function App() {
  const [currentScan, setCurrentScan] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMpeModalOpen, setIsMpeModalOpen] = useState(false);

  const handleScanSubmit = async (formData) => {
    try {
      setIsScanning(true);

      // Create preview object URL for immediate canvas rendering
      const fileObj = formData.get('file');
      if (fileObj) {
        setCurrentImageUrl(URL.createObjectURL(fileObj));
      }

      const result = await auditApi.scanPackage(formData);
      setCurrentScan(result);
    } catch (err) {
      console.error('Scan submission error:', err);
      alert('Scanning failed. Please ensure the backend server is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPastScan = (scanData) => {
    setCurrentScan(scanData);
    if (scanData.image_url) {
      setCurrentImageUrl(scanData.image_url);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMpeModal={() => setIsMpeModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Top Split View: Ingestion Form & Interactive Visual Overlay Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <IngestionForm onScanSubmit={handleScanSubmit} isScanning={isScanning} />
          </div>

          <div className="lg:col-span-7">
            <VisualOverlay scanResult={currentScan} imageUrl={currentImageUrl} />
          </div>
        </div>

        {/* Bottom Section: Compliance Card, Checklist & Multi-format Export */}
        {currentScan && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-6">
                <ComplianceCard scanResult={currentScan} />
                <ExportPanel scanResult={currentScan} />
              </div>

              <div className="lg:col-span-7">
                <ComplianceChecklist scanResult={currentScan} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals and Drawers */}
      <SeventhScheduleModal
        isOpen={isMpeModalOpen}
        onClose={() => setIsMpeModalOpen(false)}
        currentScan={currentScan}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectScan={handleSelectPastScan}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <p>Strictly adhering to The Legal Metrology (Packaged Commodities) Rules, 2011.</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Ministry of Consumer Affairs, Food & Public Distribution • Department of Consumer Affairs (DoCA)</p>
      </footer>
    </div>
  );
}
