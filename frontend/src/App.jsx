import React, { useState, useEffect } from 'react';
import {
  Scale, Search, Activity, ArrowRight, Loader2, Plus, Clock,
  FileText, Eye, ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, ShieldAlert,
Trash2, Box } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, SignIn, useUser } from '@clerk/clerk-react';
import IngestionForm from './components/IngestionForm';
import VisualOverlay from './components/VisualOverlay';
import ComplianceChecklist from './components/ComplianceChecklist';
import ComplianceCard from './components/ComplianceCard';
import ExportPanel from './components/ExportPanel';
import SeventhScheduleModal from './components/SeventhScheduleModal';
import { auditApi } from './services/api';

// ─── Live Clock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-shell-700 bg-shell-800 text-shell-600 hover:text-white hover:border-shell-600 transition cursor-default">
      <Clock className="w-3 h-3" />
      <span className="text-[11px] font-medium font-mono">{time.toLocaleString()}</span>
    </div>
  );
}

// ─── Case Sidebar ──────────────────────────────────────────────────────────
function CaseSidebar({ currentScanId, hasScan, onSelectScan, onNewIntake, collapsed, onToggleCollapse, isManufacturer, user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const role = user?.publicMetadata?.role;
  const isAdmin = role?.toUpperCase() === 'ADMIN';

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getHistory(30);
      setHistory(res || []);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentScanId]);

  const handleDelete = async (e, scanId) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete scan #${scanId}?`)) {
      try {
        await auditApi.deleteScan(scanId);
        fetchHistory();
      } catch (err) {
        alert('Failed to delete scan.');
        console.error(err);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to clear ALL inspection records? This action cannot be undone.')) {
      try {
        await auditApi.deleteAllScans();
        fetchHistory();
      } catch (err) {
        alert('Failed to clear records.');
        console.error(err);
      }
    }
  };

  const filtered = history.filter(h =>
    h.scan_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusIcon = (status) => {
    if (status === 'COMPLIANT') return <ShieldCheck className="w-3 h-3 text-pass flex-shrink-0" />;
    if (status === 'PARTIALLY_COMPLIANT') return <AlertTriangle className="w-3 h-3 text-warn flex-shrink-0" />;
    return <ShieldAlert className="w-3 h-3 text-fail flex-shrink-0" />;
  };

  return (
    <aside
      className={`flex-shrink-0 flex flex-col bg-shell-900 shadow-sidebar border-r border-shell-700 transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Inspection Log header + collapse toggle */}
<div className="flex items-center justify-between px-3 py-2.5 border-b border-shell-700">
{!collapsed && (
<span className="text-[11px] text-shell-600 uppercase tracking-widest font-semibold">
  Inspection Log
</span>
)}
{collapsed ? (
<button
onClick={onToggleCollapse}
className="w-full flex justify-center py-1 hover:bg-shell-800 text-shell-600 hover:text-white transition"
title="Expand sidebar"
>
<ChevronRight className="w-4 h-4" />
</button>
) : (
<button
onClick={onToggleCollapse}
className="p-1 rounded hover:bg-shell-800 text-shell-600 hover:text-white transition flex-shrink-0"
title="Collapse sidebar"
>
<ChevronLeft className="w-4 h-4" />
</button>
)}
</div>

      

      {/* New Inspection button — only after a scan exists */}
      {!isManufacturer && hasScan && (
        <div className={`px-2 pt-2 pb-1 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={onNewIntake}
            title="New Inspection"
            className={`flex items-center space-x-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition ${
              collapsed ? 'w-9 h-9 justify-center' : 'w-full px-3 py-2'
            }`}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span>New Inspection</span>}
          </button>
        </div>
      )}

      {/* Search and Clear All — only expanded */}
      {!collapsed && (
        <div className="px-2 pt-2 pb-1 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-shell-600 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-shell-800 border border-shell-700 rounded-md pl-7 pr-2 py-1.5 text-xs text-white placeholder-shell-600 focus:outline-none focus:border-brand-500"
            />
          </div>
          {isAdmin && history.length > 0 && (
            <div className="flex justify-end pr-1">
              <button 
                onClick={handleDeleteAll}
                className="text-[10px] text-gray-400 hover:text-fail flex items-center space-x-1 transition"
                title="Clear all records"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      )}

      

      {/* Case list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="w-4 h-4 animate-spin text-shell-600" />
          </div>
        ) : filtered.length === 0 ? (
          !collapsed && (
            <div className="text-center pt-8 text-[11px] text-shell-600">
              {searchTerm ? 'No matches' : 'No scans yet'}
            </div>
          )
        ) : (
          filtered.map((item) => {
            const isActive = item.scan_id === currentScanId;
            return (
              <button
                key={item.id || item.scan_id}
                onClick={() => item.data && onSelectScan(item.data)}
                title={collapsed ? `#${item.scan_id}` : undefined}
                className={`w-full text-left rounded-lg transition group relative ${
                  isActive
                    ? 'bg-brand-500/20 border border-brand-500/40'
                    : 'hover:bg-shell-800 border border-transparent'
                } ${collapsed ? 'flex justify-center p-2' : 'p-2'}`}
              >
                {collapsed ? (
                  statusIcon(item.status)
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-mono text-white font-semibold truncate">
                        #{item.scan_id}
                      </span>
                      {statusIcon(item.status)}
                    </div>
                    <div className="text-[11px] text-shell-600 truncate capitalize">
                      {item.category} {item.timestamp && ` • ${new Date(item.timestamp).toLocaleDateString()}`}
                    </div>
                    <div className="text-[11px] text-shell-600 font-mono">{item.compliance_score}%</div>
                  </>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

// ─── Dossier Tabs ──────────────────────────────────────────────────────────
function DossierTabs({ currentScan, currentImageUrl, isScanning, onScanSubmit, isManufacturer }) {
  const initialTab = isManufacturer ? (currentScan ? 'canvas' : 'none') : 'intake';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (currentScan) setActiveTab('canvas');
    else setActiveTab(isManufacturer ? 'none' : 'intake');
  }, [currentScan, isManufacturer]);

  const visibleTabs = [
    {
      id: 'intake',
      label: currentScan ? 'Scan Parameters' : 'New Intake',
      icon: Plus,
      always: !isManufacturer,
      hideForManufacturer: true
    },
    {
      id: 'canvas',
      label: 'Evidence Canvas',
      icon: Eye,
      always: false,
    },
    {
      id: 'report',
      label: 'Statutory Report',
      icon: FileText,
      always: false,
      dot: true,
    },
  ].filter(t => (t.always || !!currentScan) && !(isManufacturer && t.hideForManufacturer));

  return (
    <div className="flex flex-col h-full">
      {/* Tab strip */}
      <div className="flex-shrink-0 flex w-full bg-shell-900 border-b border-shell-700">
        {visibleTabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLast = index === visibleTabs.length - 1;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-[11px] uppercase tracking-widest font-semibold transition-colors ${
                !isLast ? 'border-r border-shell-950' : ''
              } ${
                isActive
                  ? 'bg-shell-900 text-white'
                  : 'bg-shell-900 text-shell-600 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.dot && currentScan && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-surface-50">
        {/* Blank state for manufacturer */}
        {isManufacturer && !currentScan && (
           <div className="h-full flex flex-col items-center justify-center bg-surface-50 text-shell-600">
               <div className="text-center p-8 bg-white shadow-card rounded-2xl border border-gray-200 max-w-sm w-full mx-4">
                   <Box className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                   <h2 className="text-sm font-semibold text-gray-900 mb-1">Manufacturer Portal</h2>
                   <p className="text-xs text-gray-500">Select an inspection log from the sidebar to view detailed compliance results and reports.</p>
               </div>
           </div>
        )}

        {/* Intake / Modify Parameters (Kept mounted to preserve state) */}
        {!isManufacturer && (
          <div className={`h-full overflow-y-auto p-6 ${activeTab === 'intake' ? 'block' : 'hidden'}`}>
            <IngestionForm onScanSubmit={onScanSubmit} isScanning={isScanning} currentScan={currentScan} />
          </div>
        )}

        {/* Evidence Canvas — overflow-y-auto so tall images scroll */}
        {activeTab === 'canvas' && (
          <div className="h-full overflow-y-auto p-4">
            <VisualOverlay scanResult={currentScan} imageUrl={currentImageUrl} />
          </div>
        )}

        {/* Statutory Report */}
        {activeTab === 'report' && (
          <div className="h-full overflow-y-auto p-6 space-y-5">
            {currentScan ? (
              <>
                <ComplianceCard scanResult={currentScan} />
                <ComplianceChecklist scanResult={currentScan} />
                <ExportPanel scanResult={currentScan} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-shell-600 text-sm">
                <FileText className="w-10 h-10 text-surface-300 mb-3" />
                <p>No statutory report yet.</p>
                <p className="text-xs mt-1 text-surface-300">Complete an inspection to generate the report.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Root App ──────────────────────────────────────────────────────────────
export default function App() {
  const devRole = import.meta.env.VITE_DEV_ROLE;
  if (devRole) {
    const mockUser = {
      fullName: "Dev Mode " + devRole,
      publicMetadata: { role: devRole }
    };
    return <DashboardContent user={mockUser} />;
  }
  return <ClerkApp />;
}

function ClerkApp() {
  const { user } = useUser();
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-shell-950 flex flex-col items-center justify-center p-4">
           <div className="mb-8 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">MetroVerity</h1>
              <p className="text-sm text-shell-600 font-medium">Department of Consumer Affairs</p>
            </div>
          </div>
          <SignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardContent user={user} />
      </SignedIn>
    </>
  );
}

function DashboardContent({ user }) {
  const role = user?.publicMetadata?.role || 'UNASSIGNED ROLE';
  const isManufacturer = role.toUpperCase() === 'MANUFACTURER';
  
  const [currentScan, setCurrentScan] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isMpeModalOpen, setIsMpeModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleScanSubmit = async (payload, mode = 'physical') => {
    try {
      setIsScanning(true);
      let result;
      if (mode === 'physical') {
        const fileObj = payload.getAll('files')[0];
        if (fileObj) setCurrentImageUrl(URL.createObjectURL(fileObj));
        result = await auditApi.scanPackage(payload);
      } else {
        setCurrentImageUrl(''); // Will be set by visual overlay if backend returns an image
        result = await auditApi.scrapeUrl(payload);
      }
      setCurrentScan(result);
    } catch (err) {
      console.error('Scan submission error:', err);
      const errMsg = err.response?.data?.detail || 'Scanning failed. Please ensure the backend server is running.';
      alert(`Scanning Error: ${errMsg}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectScan = (scanData) => {
    setCurrentScan({ ...scanData, is_historical: true });
    if (scanData.image_url) setCurrentImageUrl(scanData.image_url);
  };

  const handleNewIntake = () => {
    setCurrentScan(null);
    setCurrentImageUrl('');
  };

  return (
        <div className="h-screen flex flex-col bg-shell-950 overflow-hidden font-sans">

      {/* ── Titlebar with centred brand ── */}
<div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-shell-700 bg-shell-900 relative">

{/* Left: Live Clock */}
<div className="mr-auto flex items-center z-10">
  <LiveClock />
</div>

{/* Centre: MetroVerity brand */}
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <div className="flex items-center space-x-2.5">
    <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
      <Scale className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="leading-tight">
      <div className="text-sm font-semibold text-white">MetroVerity</div>
      <div className="text-[10px] text-shell-600">Enforcement Portal</div>
    </div>
  </div>
</div>

{/* Right: MPE Test + Rule Engine */}
<div className="ml-auto flex items-center space-x-4">
<button
onClick={() => setIsMpeModalOpen(true)}
className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-shell-700 bg-shell-800 text-shell-600 hover:text-white hover:border-shell-600 text-[11px] font-medium transition"
>
<Activity className="w-3 h-3" />
<span>MPE Test</span>
</button>
<span className="flex items-center space-x-1.5 text-[10px] text-emerald-600/70">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
<span>Rule Engine Online</span>
</span>

<div className="flex items-center space-x-3 pl-4 border-l border-shell-700">
  <div className="flex flex-col items-end">
    <span className="text-[11px] font-semibold text-white">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
    <span className="text-[9px] text-brand-400 uppercase tracking-wider">{role.replace('_', ' ')}</span>
  </div>
  {import.meta.env.VITE_DEV_ROLE ? (
    <div className="w-7 h-7 rounded-full bg-shell-700 flex items-center justify-center text-xs font-bold text-white border border-shell-600">
      {user?.fullName?.charAt(0) || 'D'}
    </div>
  ) : (
    <UserButton />
  )}
</div>

</div>
</div>

      {/* ── Main frame ── */}
      <div className="flex-1 flex overflow-hidden">
        <CaseSidebar
          currentScanId={currentScan?.scan_id}
          hasScan={!!currentScan}
          onSelectScan={handleSelectScan}
          onNewIntake={handleNewIntake}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          isManufacturer={isManufacturer}
          user={user}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <DossierTabs
            currentScan={currentScan}
            currentImageUrl={currentImageUrl}
            isScanning={isScanning}
            onScanSubmit={handleScanSubmit}
            isManufacturer={isManufacturer}
          />
        </main>
      </div>

      {/* ── Status bar ── */}
      <div className="flex-shrink-0 h-6 flex items-center px-4 border-t border-shell-700 bg-shell-900 text-[10px] text-shell-600 font-mono">
        <span>MetroVerity v1.0</span>
        <span className="mx-3 text-shell-700">|</span>
        <span>Legal Metrology (Packaged Commodities) Rules, 2011</span>
        {currentScan && (
          <>
            <span className="mx-3 text-shell-700">|</span>
            <span className="text-brand-400">Active: #{currentScan.scan_id}</span>
            <span className="mx-2 text-shell-700">·</span>
            <span>Score: {currentScan.compliance_score}%</span>
          </>
        )}
        <span className="ml-auto">DoCA · Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
      </div>

      {/* Modal */}
      <SeventhScheduleModal
        isOpen={isMpeModalOpen}
        onClose={() => setIsMpeModalOpen(false)}
        currentScan={currentScan}
      />
    </div>
  );
}
