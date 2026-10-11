import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine 
} from 'recharts';
import { BarChart3, Table } from 'lucide-react';
import Tooltip from './Tooltip';
import { CANCER_CODE_MAPPING } from '../data/mockModel';

function CustomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const mapping = CANCER_CODE_MAPPING[data.name] || {};

    return (
      <div className="bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.08)] rounded-xl p-3 text-xs font-sans max-w-xs z-50">
        <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between gap-2">
          <span>{data.name}</span>
          <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200/50">
            {mapping.oncoTree || 'TUMOR'}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-600">
            <span>Calibrated Probability:</span>
            <span className="font-mono font-bold text-teal-900">
              {data.probability.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>System:</span>
            <span className="text-slate-600">{mapping.system || 'Solid Tumor'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>ICD-O-3:</span>
            <span className="font-mono text-slate-600">{mapping.icdO3 || '8000/3'}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function DifferentialBarChart({ differentialDiagnoses, isCalculating }) {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'

  if (!differentialDiagnoses || differentialDiagnoses.length === 0) return null;

  const chartData = [...differentialDiagnoses].map((item, index) => ({
    name: item.name,
    probability: item.probability,
    rank: index + 1,
    code: CANCER_CODE_MAPPING[item.name]?.code || 'UNK',
  }));

  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] transition-opacity duration-150 ${
      isCalculating ? 'opacity-60' : 'opacity-100'
    }`}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <h2 className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase flex items-center">
            Differential Distribution (Top 5)
            <Tooltip text="Posterior probability distribution across top candidate lineages, calibrated via multi-class Platt scaling." />
          </h2>
        </div>

        {/* View Toggle */}
        <div className="bg-slate-100/70 p-0.5 rounded-lg inline-flex">
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center space-x-1.5 ${
              viewMode === 'chart'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table className="w-3 h-3" />
            <span>Audit</span>
          </button>
        </div>
      </div>

      <div className="p-5">
        {viewMode === 'chart' ? (
          <div>
            <div className="h-60 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 6, right: 35, left: 10, bottom: 6 }}
                >
                  {/* Premium Teal & Slate Linear Gradients */}
                  <defs>
                    <linearGradient id="topTealGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0f766e" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                    <linearGradient id="subtleSlateGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                  </defs>

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${val}%`}
                    axisLine={{ stroke: '#f1f5f9' }}
                    tickLine={{ stroke: '#f1f5f9' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={155}
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                    axisLine={{ stroke: '#f1f5f9' }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.8 }} />
                  
                  {/* Subtle Translucent Dashes for 20% Threshold */}
                  <ReferenceLine
                    x={20}
                    stroke="#cbd5e1"
                    strokeDasharray="2 3"
                    strokeOpacity={0.7}
                    label={{
                      value: '20% Decision Threshold',
                      fill: '#94a3b8',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                  
                  <Bar
                    dataKey="probability"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={index === 0 ? 'url(#topTealGrad)' : 'url(#subtleSlateGrad)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Seamless Visual Grouping (Soft shaded gray background blocks) */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {differentialDiagnoses.map((diag, idx) => (
                <div
                  key={diag.name}
                  className={`p-2.5 rounded-xl text-left transition-colors ${
                    idx === 0 
                      ? 'bg-teal-50/70 border border-teal-200/60' 
                      : 'bg-slate-50/70 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold text-slate-700">#{idx + 1}</span>
                    <span>{CANCER_CODE_MAPPING[diag.name]?.code || 'CANC'}</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-800 truncate mt-1" title={diag.name}>
                    {diag.name}
                  </div>
                  <div className="text-xs font-mono font-bold tracking-tight text-slate-900 mt-0.5">
                    {diag.probability.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tabular Audit Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/60">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                    Candidate Entity
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                    Code
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                    System
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                    Probability
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                    Cumulative
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono text-xs">
                {differentialDiagnoses.map((diag, idx) => {
                  const mapping = CANCER_CODE_MAPPING[diag.name] || {};
                  const cumulative = differentialDiagnoses
                    .slice(0, idx + 1)
                    .reduce((sum, item) => sum + item.probability, 0);

                  return (
                    <tr
                      key={diag.name}
                      className={idx === 0 ? 'bg-teal-50/40 font-medium' : 'hover:bg-slate-50/50'}
                    >
                      <td className="px-3 py-2 text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="px-3 py-2 font-sans text-slate-900 font-medium">
                        {diag.name}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {mapping.oncoTree || 'TUMOR'}
                      </td>
                      <td className="px-3 py-2 font-sans text-slate-500">
                        {mapping.system || 'Solid'}
                      </td>
                      <td className="px-3 py-2 text-right font-bold tracking-tight text-slate-900">
                        {diag.probability.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right text-slate-400">
                        {cumulative.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
