/**
 * Chart Components
 * Line, Bar, Pie charts with Recharts
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { GlassmorphismCard, SectionHeader } from './UIComponents';
import { useTheme } from '../context/ThemeContext';

/**
 * AttendanceTrendChart Component
 * Line chart showing attendance trend over time
 */
export const AttendanceTrendChart = ({ data, title = 'Attendance Trend' }) => {
  const { isDark } = useTheme();

  const chartColors = {
    text: isDark ? '#cbd5e1' : '#64748b',
    grid: isDark ? '#334155' : '#e2e8f0',
    line: '#06b6d4',
    area: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)',
  };

  return (
    <GlassmorphismCard>
      <SectionHeader title={title} />

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="date" stroke={chartColors.text} />
          <YAxis stroke={chartColors.text} />

          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${chartColors.grid}`,
              borderRadius: '8px',
              color: chartColors.text,
            }}
          />

          <Area
            type="monotone"
            dataKey="attendance"
            stroke={chartColors.line}
            fillOpacity={1}
            fill="url(#colorAttendance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassmorphismCard>
  );
};

/**
 * ClassComparisonChart Component
 * Bar chart comparing attendance across classes
 */
export const ClassComparisonChart = ({ data, title = 'Class Comparison' }) => {
  const { isDark } = useTheme();

  const chartColors = {
    text: isDark ? '#cbd5e1' : '#64748b',
    grid: isDark ? '#334155' : '#e2e8f0',
  };

  return (
    <GlassmorphismCard>
      <SectionHeader title={title} />

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="class" stroke={chartColors.text} />
          <YAxis stroke={chartColors.text} />

          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${chartColors.grid}`,
              borderRadius: '8px',
              color: chartColors.text,
            }}
          />

          <Legend wrapperStyle={{ color: chartColors.text }} />

          <Bar dataKey="present" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassmorphismCard>
  );
};

/**
 * PresentAbsentPieChart Component
 * Pie chart showing present vs absent breakdown
 */
export const PresentAbsentPieChart = ({ presentCount, absentCount, title = 'Attendance Breakdown' }) => {
  const { isDark } = useTheme();

  const data = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount },
  ];

  const colors = ['#10b981', '#ef4444'];

  return (
    <GlassmorphismCard>
      <SectionHeader title={title} />

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: isDark ? '#cbd5e1' : '#64748b',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </GlassmorphismCard>
  );
};

/**
 * HeatmapChart Component
 * Heatmap showing attendance by day of week
 */
export const HeatmapChart = ({ data, title = 'Attendance Heatmap' }) => {
  const { isDark } = useTheme();
  const maxValue = Math.max(...data.flatMap((d) => d.values));

  const getColor = (value) => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return '#10b981';
    if (ratio > 0.6) return '#84cc16';
    if (ratio > 0.4) return '#eab308';
    if (ratio > 0.2) return '#f97316';
    return '#ef4444';
  };

  return (
    <GlassmorphismCard>
      <SectionHeader title={title} />

      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {data.map((row) => (
              <tr key={row.week}>
                <td className={`text-sm font-medium pr-4 py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {row.week}
                </td>
                {row.values.map((value, idx) => (
                  <td
                    key={idx}
                    className="px-2 py-2"
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-semibold text-white cursor-default transition-transform hover:scale-110"
                      style={{ backgroundColor: getColor(value) }}
                      title={`${value}%`}
                    >
                      {value}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-6 justify-center">
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Low</span>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
          <div
            key={ratio}
            className="w-4 h-4 rounded"
            style={{
              backgroundColor: getColor(ratio * maxValue),
            }}
          />
        ))}
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>High</span>
      </div>
    </GlassmorphismCard>
  );
};

/**
 * StudentRiskChart Component
 * Shows students at risk of low attendance
 */
export const StudentRiskChart = ({ data, title = 'At-Risk Students' }) => {
  const { isDark } = useTheme();

  const chartColors = {
    text: isDark ? '#cbd5e1' : '#64748b',
    grid: isDark ? '#334155' : '#e2e8f0',
  };

  return (
    <GlassmorphismCard>
      <SectionHeader title={title} />

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis type="number" stroke={chartColors.text} />
          <YAxis dataKey="name" type="category" stroke={chartColors.text} width={190} />

          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${chartColors.grid}`,
              borderRadius: '8px',
              color: chartColors.text,
            }}
          />

          <Bar dataKey="attendance" fill="#f97316" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassmorphismCard>
  );
};

export default {
  AttendanceTrendChart,
  ClassComparisonChart,
  PresentAbsentPieChart,
  HeatmapChart,
  StudentRiskChart,
};
