import React from 'react';

/**
 * DataTable - Clean table component for displaying data
 * Usage: Attendance records, student lists, activity logs
 */
const DataTable = ({ title, subtitle, columns, data = [], loading = false }) => {
  if (!columns || columns.length === 0) {
    return <div className="text-gray-500">No columns defined</div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-slate-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
