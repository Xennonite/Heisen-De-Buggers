import * as lucide from 'lucide-react';
const iconsToTest = ['CheckCircle', 'AlertOctagon', 'TrendingDown', 'Scale', 'ShieldCheck'];
const missing = [];
for (const icon of iconsToTest) {
  if (!lucide[icon]) { missing.push(icon); }
}
if (missing.length > 0) { console.log('MISSING:', missing.join(', ')); }
else { console.log('ALL FOUND'); }
