import React, { useState, useEffect } from 'react';
import {Scale, Search, Activity, ArrowRight, Loader2, Plus, Clock,
  FileText, Eye, ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, ShieldAlert,
Trash2, Box, CheckSquare, Check, LogOut} from 'lucide-react';
import { SignedIn, SignedOut, UserButton, SignIn, useUser, useClerk } from '@clerk/clerk-react';
import IngestionForm from './components/IngestionForm';
import VisualOverlay from './components/VisualOverlay';
import ComplianceChecklist from './components/ComplianceChecklist';
import ComplianceCard from './components/ComplianceCard';
import ExportPanel from './components/ExportPanel';
import LandingPage from './components/LandingPage';
import ModeSelection from './components/ModeSelection';
import { auditApi } from './services/api';

// ─── Live Clock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-ash bg-white/50 text-smoke hover:text-graphite transition cursor-default">
      <Clock className="w-3 h-3" />
      <span className="text-[10px] font-medium font-mono tracking-wide">{time.toLocaleString()}</span>
    </div>
  );
}

// ─── Case Sidebar ──────────────────────────────────────────────────────────
function CaseSidebar({ currentScanId, hasScan, onSelectScan, onNewIntake, collapsed, onToggleCollapse, isManufacturer, user, onBackToModes }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedScans, setSelectedScans] = useState([]);

  const toggleSelection = (scanId) => {
    setSelectedScans(prev => 
      prev.includes(scanId) 
        ? prev.filter(id => id !== scanId)
        : [...prev, scanId]
    );
  };
  
  const handleDeleteSelected = async () => {
    if (window.confirm(`Delete ${selectedScans.length} selected records? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedScans.map(id => auditApi.deleteScan(id)));
        setSelectedScans([]);
        setSelectionMode(false);
        fetchHistory();
      } catch (err) {
        alert('Failed to delete some records.');
        console.error(err);
      }
    }
  };
  
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
    if (status === 'COMPLIANT') return <ShieldCheck className="w-3.5 h-3.5 text-pass flex-shrink-0" />;
    if (status === 'PARTIALLY_COMPLIANT') return <AlertTriangle className="w-3.5 h-3.5 text-warn flex-shrink-0" />;
    return <ShieldAlert className="w-3.5 h-3.5 text-fail flex-shrink-0" />;
  };

  return (
    <aside
      className={`flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-md border border-ash/50 m-4 mr-2 transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <span className="text-sm font-serif text-offBlack">
            Inspection Log
          </span>
        )}
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center py-1.5 rounded-xl border border-transparent hover:border-ash hover:bg-white/50 text-graphite hover:text-offBlack transition"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl border border-transparent hover:border-ash hover:bg-white/50 text-graphite hover:text-offBlack transition flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {!isManufacturer && (
        <div className={`px-4 pt-4 pb-2 ${collapsed ? 'flex flex-col items-center gap-2' : 'flex flex-col gap-2'}`}>
          <button
            onClick={onBackToModes}
            title="Change Inspection Mode"
            className={`flex items-center justify-center space-x-2 rounded-xl border border-ash bg-white hover:bg-periwinkle text-offBlack text-xs font-mono transition flex-shrink-0 ${
              collapsed ? 'w-10 h-10' : 'py-2.5 w-full'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Change mode</span>}
          </button>
          
          <button
            onClick={onNewIntake}
            title="New Inspection"
            className={`flex items-center justify-center space-x-2 rounded-xl bg-lakeBlue hover:bg-brand-600 text-white text-xs font-mono transition flex-shrink-0 ${
              collapsed ? 'w-10 h-10' : 'py-2.5 w-full'
            }`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>New inspection</span>}
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="px-4 pt-2 pb-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-smoke absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-ash rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-offBlack placeholder-smoke focus:outline-none focus:border-lakeBlue"
            />
          </div>
          {isAdmin && history.length > 0 && (
            <div className="flex justify-between items-center px-1 pt-1">
              {selectionMode ? (
                <>
                  <button onClick={() => { setSelectionMode(false); setSelectedScans([]); }} className="text-[10px] font-mono uppercase text-smoke hover:text-offBlack flex items-center space-x-1 transition">
                    <span>Cancel</span>
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={selectedScans.length === 0}
                    className="text-[10px] font-mono uppercase text-smoke hover:text-fail flex items-center space-x-1 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete ({selectedScans.length})</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setSelectionMode(true)} className="text-[10px] font-mono uppercase text-smoke hover:text-lakeBlue flex items-center space-x-1 transition">
                    <CheckSquare className="w-3 h-3" />
                    <span>Select</span>
                  </button>
                  <button 
                    onClick={handleDeleteAll}
                    className="text-[10px] font-mono uppercase text-smoke hover:text-fail flex items-center space-x-1 transition"
                    title="Clear all records"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="w-5 h-5 animate-spin text-smoke" />
          </div>
        ) : filtered.length === 0 ? (
          !collapsed && (
            <div className="text-center pt-8 text-[11px] font-mono uppercase text-smoke">
              {searchTerm ? 'No matches' : 'No scans yet'}
            </div>
          )
        ) : (
          filtered.map((item) => {
            const isActive = !selectionMode && item.scan_id === currentScanId;
            const isSelected = selectedScans.includes(item.scan_id);
            return (
              <button
                key={item.id || item.scan_id}
                onClick={() => {
                  if (selectionMode) {
                    toggleSelection(item.scan_id);
                  } else if (item.data) {
                    onSelectScan(item.data);
                  }
                }}
                title={collapsed ? `#${item.scan_id}` : undefined}
                className={`w-full text-left rounded-[20px] transition-all group relative border ${
                  isActive
                    ? 'bg-periwinkle/30 border-lakeBlue/30'
                    : selectionMode && isSelected
                    ? 'bg-periwinkle/10 border-lakeBlue/30'
                    : 'bg-transparent border-transparent hover:border-ash hover:bg-white/50'
                } ${collapsed ? 'flex justify-center p-3' : 'p-3'}`}
              >
                {collapsed ? (
                  selectionMode ? (
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-lakeBlue border-lakeBlue' : 'border-ash bg-white'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  ) : statusIcon(item.status)
                ) : (
                  <div className="flex items-center space-x-3">
                    {selectionMode && (
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-lakeBlue border-lakeBlue' : 'border-ash bg-white group-hover:border-smoke'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-offBlack font-semibold truncate">
                          #{item.scan_id}
                        </span>
                        {!selectionMode && statusIcon(item.status)}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wide text-graphite truncate">
                        {item.category} {item.timestamp && ` • ${new Date(item.timestamp).toLocaleDateString()}`}
                      </div>
                      <div className="text-[10px] font-mono text-lakeBlue font-semibold mt-0.5">Score: {item.compliance_score}%</div>
                    </div>
                  </div>
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
function DossierTabs({ currentScan, currentImageUrl, isScanning, onScanSubmit, isManufacturer, appMode }) {
  const initialTab = isManufacturer ? (currentScan ? 'canvas' : 'none') : 'intake';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (currentScan) setActiveTab('canvas');
    else setActiveTab(isManufacturer ? 'none' : 'intake');
  }, [currentScan, isManufacturer]);

  const visibleTabs = [
    {
      id: 'intake',
      label: currentScan ? 'Parameters' : 'New Intake',
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
    <div className="flex flex-col h-full bg-transparent">
      {/* Tab strip - Full Width Segmented Control */}
      {visibleTabs.length > 1 && (
        <div className="flex-shrink-0 flex w-full pt-4 pb-2 px-4 lg:px-6 z-10">
          <div className="flex w-full bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-ash/20 space-x-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-[13px] font-sans font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-lakeBlue shadow-sm border border-ash/10'
                      : 'bg-transparent text-smoke hover:text-offBlack hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.dot && currentScan && (
                    <span className="w-1.5 h-1.5 rounded-full bg-lakeBlue flex-shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-hidden relative">
        {isManufacturer && !currentScan && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-smoke p-6">
               <div className="text-center p-10 bg-white shadow-xl rounded-card border border-ash max-w-sm w-full">
                   <Box className="w-12 h-12 text-ash mx-auto mb-6" />
                   <h2 className="text-2xl font-serif text-offBlack mb-2">Manufacturer Portal</h2>
                   <p className="text-xs font-mono text-graphite leading-relaxed">Select an inspection log from the sidebar to view detailed compliance results and reports.</p>
               </div>
           </div>
        )}

        {!isManufacturer && (
          <div className={`h-full overflow-y-auto p-4 lg:p-6 ${activeTab === 'intake' ? 'block' : 'hidden'}`}>
            <div className="max-w-4xl mx-auto">
              <IngestionForm onScanSubmit={onScanSubmit} isScanning={isScanning} currentScan={currentScan} initialMode={appMode} />
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="h-full overflow-y-auto p-4 lg:p-6">
            <VisualOverlay scanResult={currentScan} imageUrl={currentImageUrl} />
          </div>
        )}

        {activeTab === 'report' && (
          <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-8">
            <div className="max-w-5xl mx-auto space-y-8">
              {currentScan ? (
                <>
                  <ComplianceCard scanResult={currentScan} />
                  <ComplianceChecklist scanResult={currentScan} />
                  <ExportPanel scanResult={currentScan} />
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-smoke border border-dashed border-ash rounded-card">
                  <FileText className="w-10 h-10 text-ash mb-4" />
                  <p className="font-serif text-xl text-offBlack">No statutory report yet.</p>
                  <p className="text-xs font-mono mt-2 text-graphite">Complete an inspection to generate the report.</p>
                </div>
              )}
            </div>
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
    return <AppFlow user={mockUser} isDev={true} />;
  }
  return <ClerkApp />;
}

function ClerkApp() {
  const { user } = useUser();
  return (
    <>
      <SignedOut>
        <AppFlow user={null} isDev={false} />
      </SignedOut>
      <SignedIn>
        <AppFlow user={user} isDev={false} />
      </SignedIn>
    </>
  );
}

function AppFlow({ user, isDev }) {
  const role = user?.publicMetadata?.role || 'UNASSIGNED ROLE';
  const isManufacturer = role.toUpperCase() === 'MANUFACTURER';

  // If user exists (either via dev mock or clerk login), skip landing page.
  const [view, setView] = useState(() => {
    if (!user) return 'LANDING';
    return isManufacturer ? 'DASHBOARD' : 'MODE_SELECT';
  });
  
  const [appMode, setAppMode] = useState(null);

  const handleDevLogin = () => {
    setView(isManufacturer ? 'DASHBOARD' : 'MODE_SELECT');
  };

  const handleSelectMode = (mode) => {
    setAppMode(mode);
    setView('DASHBOARD');
  };

  const handleBackToModes = () => {
    setView('MODE_SELECT');
    setAppMode(null);
  };

  if (view === 'LANDING') {
    return <LandingPage onDevLogin={handleDevLogin} isDev={isDev} />;
  }

  if (view === 'MODE_SELECT') {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono font-semibold text-offBlack">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
            <span className="text-[9px] font-mono text-lakeBlue uppercase tracking-wider">{role.replace('_', ' ')}</span>
          </div>
          {isDev ? (
            <button onClick={() => setView('LANDING')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-serif font-bold text-offBlack border border-ash/50">
              {user?.fullName?.charAt(0) || 'D'}
            </button>
          ) : (
            <UserButton />
          )}
        </div>
        <ModeSelection onSelectMode={handleSelectMode} />
      </>
    );
  }

  return <DashboardContent user={user} appMode={appMode} onBackToModes={handleBackToModes} />;
}

function DashboardContent({ user, appMode, onBackToModes }) {
  const role = user?.publicMetadata?.role || 'UNASSIGNED ROLE';
  const isManufacturer = role.toUpperCase() === 'MANUFACTURER';
  
  const [currentScan, setCurrentScan] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
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
    <div className="h-screen flex flex-col bg-slate-200 overflow-hidden font-mono relative z-0">
      


      {/* ── Titlebar ── */}
      <div className="flex-shrink-0 h-16 flex items-center px-6 bg-transparent relative z-10">
        <div className="mr-auto flex items-center z-10">
          <LiveClock />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full border border-ash bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <img src="/logo.jpg" alt="MetroVerity Logo" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-serif text-offBlack tracking-tight">MetroVerity</div>
              <div className="text-[10px] font-mono text-smoke uppercase tracking-widest mt-0.5">Enforcement Portal</div>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-6 z-10">
          {appMode && (
            <span className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-white border border-ash/40 shadow-sm text-[10px] font-mono text-graphite">
              <span className="w-1.5 h-1.5 rounded-full bg-lakeBlue" />
              <span>{{ single: 'Single SKU', bulk: 'Bulk MPE', web: 'E-Commerce' }[appMode] || appMode}</span>
            </span>
          )}
          <span className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-pass">
            <span className="w-2 h-2 rounded-full bg-pass animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
            <span>Rule Engine Online</span>
          </span>

          <div className="flex items-center space-x-4 pl-6 border-l border-ash">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-offBlack">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
              <span className="text-[9px] text-lakeBlue uppercase tracking-wider mt-0.5">{role.replace('_', ' ')}</span>
            </div>
            {import.meta.env.VITE_DEV_ROLE ? (
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-serif font-bold text-offBlack border border-ash">
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
          onBackToModes={onBackToModes}
        />

        <main className="flex-1 overflow-hidden flex flex-col bg-transparent z-0">
          <DossierTabs
            currentScan={currentScan}
            currentImageUrl={currentImageUrl}
            isScanning={isScanning}
            onScanSubmit={handleScanSubmit}
            isManufacturer={isManufacturer}
            appMode={appMode}
          />
        </main>
      </div>

      {/* ── Status bar ── */}
      <div className="flex-shrink-0 h-8 flex items-center px-6 bg-transparent text-[10px] uppercase tracking-widest text-smoke font-mono">
        <span>MetroVerity v1.0</span>
        <span className="mx-4 text-ash">|</span>
        <span>Legal Metrology (Packaged Commodities) Rules, 2011</span>
        {currentScan && (
          <>
            <span className="mx-4 text-ash">|</span>
            <span className="text-lakeBlue font-semibold">Active: #{currentScan.scan_id}</span>
            <span className="mx-3 text-ash">·</span>
            <span className="font-semibold text-offBlack">Score: {currentScan.compliance_score}%</span>
          </>
        )}
        <span className="ml-auto">DoCA · Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
      </div>
    </div>
  );
}
