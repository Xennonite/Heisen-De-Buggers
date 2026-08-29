import * as lucide from 'lucide-react';

const iconsToTest = [
  'X', 'Scale', 'CheckCircle2', 'XCircle', 'AlertTriangle', 'Download', 'RefreshCw', 'FileText', 'Loader2',
  'ShieldCheck', 'History', 'Activity',
  'AlertCircle', 'ChevronRight',
  'FileSpreadsheet', 'Check',
  'Eye', 'EyeOff', 'ZoomIn', 'ZoomOut', 'RotateCcw', 'ShieldAlert',
  'Upload', 'Sparkles', 'Box', 'Cylinder', 'HelpCircle', 'Layers', 'Image',
  'Award', 'IndianRupee', 'FileWarning',
  'Search', 'ArrowRight'
];

const missing = [];
for (const icon of iconsToTest) {
  if (!lucide[icon]) {
    missing.push(icon);
  }
}

if (missing.length > 0) {
  console.log('MISSING ICONS:', missing.join(', '));
} else {
  console.log('ALL ICONS FOUND');
}
