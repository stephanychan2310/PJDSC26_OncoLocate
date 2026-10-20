import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine,
  LabelList 
} from 'recharts';
import { BarChart3, Table } from 'lucide-react';
import Tooltip from './Tooltip';
import { CANCER_CODE_MAPPING } from '../data/mockModel';

function YAxisCustomTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={4}
        textAnchor="end"
        className="fill-slate-700 dark:fill-slate-300 text-[11px] font-semibold"
      >
        {payload.value}
      </text>
    </g>
  );
}

function XAxisCustomTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={14}
        textAnchor="middle"
        className="fill-slate-500 dark:fill-slate-400 text-[11px] font-mono"
      >
        {`${payload.value}%`}
      </text>
    </g>
  );
}

function CustomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const mapping = CANCER_CODE_MAPPING[data.name] || {};

    return (
      <div className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-md rounded-xl p-3 text-xs font-sans max-w-xs z-50">
        <div className="font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-1.5 mb-2 flex items-center justify-between gap-2">
          <span>{data.name}</span>
          <span className="font-mono text-[10px] text-[var(--sidebar-accent-foreground)] bg-[var(--sidebar-accent)] px-2 py-0.5 rounded-full font-bold border border-teal-200/50 dark:border-teal-700/50">
            {mapping.oncoTree || 'TUMOR'}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[var(--muted-foreground)]">
            <span>Calibrated Probability:</span>
            <span className="font-mono font-bold text-[var(--foreground)]">
              {data.probability.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-[var(--muted-foreground)] text-[11px]">
            <span>Lineage System:</span>
            <span className="text-[var(--foreground)] font-medium">{mapping.system || 'Solid Tumor'}</span>
          </div>
          <div className="flex justify-between items-center text-[var(--muted-foreground)] text-[11px]">
            <span>ICD-O-3:</span>
            <span className="font-mono text-[var(--muted-foreground)]">{mapping.icdO3 || '8000/3'}</span>
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

  // Actionability-tiered dynamic color scheme
  const getBarColor = (index) => {
    if (index === 0) return '#dc2626'; // Rank 1: Crimson / Coral Red
    if (index === 1 || index === 2) return '#d97706'; // Rank 2 & 3: Warm Amber / Gold
    return '#0f766e'; // Rank 4 & 5: Deep Muted Teal
  };

  return (
    <div className={`bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-opacity duration-150 ${
      isCalculating ? 'opacity-60' : 'opacity-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight flex items-center">
            Top 5 Differential Diagnoses
            <Tooltip text="Posterior probability distribution across top candidate cancer lineages, calibrated via Platt scaling." />
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Differential likelihood across reference cohorts (Actionability-Tiered Differential Likelihood)
          </p>
        </div>

        {/* View Toggle */}
        <div className="bg-[var(--muted)] p-1 rounded-xl inline-flex space-x-1">
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-[var(--card)] text-[var(--sidebar-accent-foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[var(--card)] text-[var(--sidebar-accent-foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Audit Table</span>
          </button>
        </div>
      </div>

      <div className="pt-3">
        {viewMode === 'chart' ? (
          <div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 65, left: 10, bottom: 8 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, (dataMax) => Math.max(100, Math.ceil(dataMax + 14))]}
                    tick={<XAxisCustomTick />}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={155}
                    tick={<YAxisCustomTick />}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.6 }} />
                  
                  {/* Subtle Translucent Dashes for 20% Threshold */}
                  <ReferenceLine
                    x={20}
                    stroke="#94a3b8"
                    strokeDasharray="2 3"
                    strokeOpacity={0.6}
                    label={{
                      value: '20% Actionability Threshold',
                      fill: '#64748b',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                  
                  {/* Actionability-Tiered Bars with Inline Value Labels */}
                  <Bar
                    dataKey="probability"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    <LabelList
                      dataKey="probability"
                      position="right"
                      formatter={(v) => `${(Number(v) > 1 ? Number(v) : Number(v) * 100).toFixed(1)}%`}
                      className="fill-slate-700 dark:fill-slate-200 text-xs font-semibold font-mono"
                      offset={8}
                    />
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={getBarColor(index)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Summary Cards Grid with Matching Palette */}
            <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {differentialDiagnoses.map((diag, idx) => {
                const isRank1 = idx === 0;
                const isRank23 = idx === 1 || idx === 2;

                return (
                  <div
                    key={diag.name}
                    className={`p-3 rounded-xl text-left transition-colors border ${
                      isRank1 
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60' 
                        : isRank23 
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60' 
                        : 'bg-[var(--sidebar-accent)]/50 border-teal-200 dark:border-teal-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-mono">
                      <span className={`font-bold ${isRank1 ? 'text-rose-700 dark:text-rose-300' : isRank23 ? 'text-amber-700 dark:text-amber-300' : 'text-[var(--sidebar-accent-foreground)]'}`}>
                        #{idx + 1}
                      </span>
                      <span>{CANCER_CODE_MAPPING[diag.name]?.code || 'CANC'}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--foreground)] break-words whitespace-normal leading-snug mt-1" title={diag.name}>
                      {diag.name}
                    </div>
                    <div className={`text-sm font-mono font-bold tracking-tight mt-0.5 ${
                      isRank1 ? 'text-rose-700 dark:text-rose-300' : isRank23 ? 'text-amber-700 dark:text-amber-300' : 'text-[var(--sidebar-accent-foreground)]'
                    }`}>
                      {diag.probability.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Tabular Audit Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-xs">
              <thead className="bg-[var(--muted)]/50 rounded-xl">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                    Candidate Entity
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                    Code
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                    System
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                    Probability
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                    Cumulative
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--card)] font-mono text-xs">
                {differentialDiagnoses.map((diag, idx) => {
                  const mapping = CANCER_CODE_MAPPING[diag.name] || {};
                  const cumulative = differentialDiagnoses
                    .slice(0, idx + 1)
                    .reduce((sum, item) => sum + item.probability, 0);

                  const isRank1 = idx === 0;

                  return (
                    <tr
                      key={diag.name}
                      className={isRank1 ? 'bg-rose-50/40 dark:bg-rose-950/20 font-medium' : 'hover:bg-[var(--muted)]/50'}
                    >
                      <td className="px-3 py-2.5 text-slate-400 font-bold">
                        #{idx + 1}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[var(--foreground)] font-semibold">
                        {diag.name}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--muted-foreground)]">
                        {mapping.oncoTree || 'TUMOR'}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[var(--muted-foreground)]">
                        {mapping.system || 'Solid'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold tracking-tight text-[var(--foreground)]">
                        {diag.probability.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-400">
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
