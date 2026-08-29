import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ComplianceChecklist({ scanResult }) {
  if (!scanResult) return null;

  const {
    rule_checklist = {},
    declarations = {},
    net_quantity = {},
    mrp = {},
    clearance_zone = {},
    deceptive_terms = {},
    units_compliance = {},
    standard_pack_size = {},
    required_font_height_mm = 2.5,
  } = scanResult;

  const rules = [
    {
      id: 'rule_6',
      title: 'Rule 6(1): Mandatory Declarations',
      desc: 'Name & address of manufacturer, packing date, and consumer care.',
      pass: rule_checklist.rule_6_mandatory_fields !== false,
      detail: `Mfg: ${declarations.manufacturer_name?.present ? 'Detected' : 'Missing'}, Care: ${declarations.consumer_care?.present ? 'Detected' : 'Missing'}`,
    },
    {
      id: 'rule_6_1_e',
      title: 'Rule 6(1)(e): MRP Format & Statutory Tax Tag',
      desc: 'Must declare MRP with "(incl. of all taxes)" or "(inclusive of all taxes)".',
      pass: rule_checklist.rule_6_1_e_mrp_syntax !== false,
      detail: mrp.has_inclusive_of_taxes_tag ? 'Mandatory tax phrase present' : 'Missing "(incl. of all taxes)" tag',
    },
    {
      id: 'rule_7',
      title: 'Rule 7(2) Table-I: Statutory Font Height',
      desc: `Font height must be >= ${required_font_height_mm}mm based on calculated PDP area.`,
      pass: rule_checklist.rule_7_font_height !== false,
      detail: `Measured: ${net_quantity.measured_font_height_mm || 'N/A'} mm (Required: ${required_font_height_mm} mm)`,
    },
    {
      id: 'rule_8',
      title: 'Rule 8(1): Net Qty Whitespace Clearance',
      desc: 'Clearance >= 1x height above/below, >= 2x height left/right without encroachment.',
      pass: rule_checklist.rule_8_clearance !== false,
      detail: clearance_zone.is_compliant ? 'Clean clearance zone' : `Encroached by: ${clearance_zone.encroaching_objects?.join(', ')}`,
    },
    {
      id: 'rule_10',
      title: 'Rule 10 & 6(1)(fa): PIN Code & Country of Origin',
      desc: 'Must include 6-digit Indian PIN code and Country of Origin.',
      pass: rule_checklist.rule_10_origin_pin !== false,
      detail: `PIN: ${declarations.pin_code?.code || 'Missing'}, Origin: ${declarations.country_of_origin?.text || 'Missing'}`,
    },
    {
      id: 'rule_12',
      title: 'Rule 12(6): Prohibited Deceptive Qualifiers',
      desc: 'Prohibits expressions like "Approx", "Approximate", "Minimum", unauthorized "When Packed".',
      pass: rule_checklist.rule_12_deceptive_terms !== false,
      detail: deceptive_terms.detected ? `Prohibited words found: ${deceptive_terms.terms_found?.join(', ')}` : 'No deceptive terms detected',
    },
    {
      id: 'rule_13',
      title: 'Rule 13: SI Unit Standardization',
      desc: 'Strict SI symbols (e.g. capital "L" for Litre, "g", "kg", "ml").',
      pass: rule_checklist.rule_13_si_units !== false,
      detail: units_compliance.is_si_compliant ? 'Standard SI units used' : `Non-standard units: ${units_compliance.issues?.join(', ')}`,
    },
    {
      id: 'second_sched',
      title: 'Second Schedule: Standard Pack Sizes',
      desc: 'Prescribed SKU pack sizes (exempt for value packs <= Rs. 10).',
      pass: rule_checklist.second_schedule_pack_size !== false,
      detail: standard_pack_size.is_value_pack_exempt ? 'Exempt (Value pack <= Rs. 10)' : (standard_pack_size.is_compliant ? 'Standard pack size matched' : 'Non-standard SKU pack size'),
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <span>Stage 4: Statutory Metrology Compliance Checklist</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time statutory verification across all clauses of Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rules.map((r) => (
          <div
            key={r.id}
            className={`p-3.5 rounded-xl border transition flex items-start space-x-3 ${
              r.pass
                ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40'
            }`}
          >
            <div className="mt-0.5">
              {r.pass ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
            </div>

            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{r.title}</h4>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    r.pass
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {r.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{r.desc}</p>
              <p className="text-[11px] font-mono text-slate-300 pt-0.5">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
