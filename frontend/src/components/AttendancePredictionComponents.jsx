/**
 * Attendance Prediction Components
 * Display attendance prediction and risk levels
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  GlassmorphismCard,
  ProgressBar,
  Badge,
  SectionHeader,
  LoadingSpinner,
  EmptyState,
} from './UIComponents';
import { FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';

/**
 * AttendancePredictionCard
 * Compact card showing current prediction status
 */
export function AttendancePredictionCard({ studentId, targetPercentage = 75 }) {
  const { isDark } = useTheme();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/attendance/prediction/?target=${targetPercentage}`
        );

        if (!response.ok) throw new Error('Failed to fetch prediction');

        const data = await response.json();
        setPrediction(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [targetPercentage]);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" description={error} />;
  if (!prediction) return null;

  const riskLevel = prediction.risk_level;
  const iconColor = {
    SAFE: 'text-green-500',
    WARNING: 'text-yellow-500',
    CRITICAL: 'text-red-500',
  };

  return (
    <GlassmorphismCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Attendance Status
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Current attendance and prediction
          </p>
        </div>
        <div className={`${iconColor[riskLevel.level]}`}>
          {riskLevel.level === 'SAFE' && <FiCheckCircle size={24} />}
          {riskLevel.level === 'WARNING' && <FiClock size={24} />}
          {riskLevel.level === 'CRITICAL' && <FiAlertTriangle size={24} />}
        </div>
      </div>

      {/* Current Percentage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Attendance
          </span>
          <span className={`text-lg font-bold ${
            prediction.current_percentage >= targetPercentage
              ? 'text-green-500'
              : 'text-orange-500'
          }`}>
            {prediction.current_percentage}%
          </span>
        </div>
        <ProgressBar percentage={prediction.current_percentage} />
      </div>

      {/* Classes Needed */}
      <div className={`p-3 rounded-lg mb-4 ${
        isDark
          ? 'bg-blue-950/30 border border-blue-700/30'
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <p className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          📚 {prediction.classes_needed === 0 
            ? 'You are on track!' 
            : `Attend ${prediction.classes_needed} more classes to reach ${targetPercentage}%`
          }
        </p>
      </div>

      {/* Risk Badge */}
      <div className="flex items-center gap-2">
        <Badge
          label={riskLevel.level}
          color={riskLevel.color}
          size="sm"
        />
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {riskLevel.message}
        </p>
      </div>
    </GlassmorphismCard>
  );
}

/**
 * AttendancePredictionPanel
 * Full panel with detailed prediction info and projections
 */
export function AttendancePredictionPanel({ studentId, targetPercentage = 75 }) {
  const { isDark } = useTheme();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/attendance/prediction/?target=${targetPercentage}`
        );

        if (!response.ok) throw new Error('Failed to fetch prediction');

        const data = await response.json();
        setPrediction(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [targetPercentage]);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" description={error} />;
  if (!prediction) return null;

  const riskLevel = prediction.risk_level;
  const projection = prediction.projection;

  return (
    <GlassmorphismCard>
      <SectionHeader 
        title="Attendance Prediction & Analysis" 
        subtitle="Detailed attendance metrics and projections"
      />

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Classes Attended
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {prediction.attended_classes}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Classes
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {prediction.total_classes}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-950/30' : 'bg-green-50'}`}>
          <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            Current %
          </p>
          <p className={`text-2xl font-bold text-green-600`}>
            {prediction.current_percentage}%
          </p>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-950/30' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            Remaining Classes
          </p>
          <p className={`text-2xl font-bold text-blue-600`}>
            {prediction.remaining_classes}
          </p>
        </div>
      </div>

      {/* Status Alert */}
      <div className={`p-4 rounded-lg mb-6 border ${
        riskLevel.level === 'SAFE'
          ? isDark ? 'bg-green-950/30 border-green-700/30' : 'bg-green-50 border-green-200'
          : riskLevel.level === 'WARNING'
          ? isDark ? 'bg-yellow-950/30 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'
          : isDark ? 'bg-red-950/30 border-red-700/30' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={riskLevel.level === 'SAFE' ? 'text-green-500' : riskLevel.level === 'WARNING' ? 'text-yellow-500' : 'text-red-500'}>
            {riskLevel.level === 'SAFE' && <FiCheckCircle size={24} />}
            {riskLevel.level === 'WARNING' && <FiClock size={24} />}
            {riskLevel.level === 'CRITICAL' && <FiAlertTriangle size={24} />}
          </div>
          <div>
            <h4 className={`font-semibold ${
              riskLevel.level === 'SAFE'
                ? isDark ? 'text-green-300' : 'text-green-700'
                : riskLevel.level === 'WARNING'
                ? isDark ? 'text-yellow-300' : 'text-yellow-700'
                : isDark ? 'text-red-300' : 'text-red-700'
            }`}>
              {riskLevel.level}
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {riskLevel.message}
            </p>
          </div>
        </div>
      </div>

      {/* Classes Needed */}
      {prediction.classes_needed > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
          <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            To Reach Target ({targetPercentage}%)
          </p>
          <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {prediction.classes_needed} more classes
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            If you attend the next {prediction.classes_needed} classes
          </p>
        </div>
      )}

      {/* Projection */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📊 Future Projection ({projection.future_classes} Classes)
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                If you attend all
              </span>
              <span className={`font-bold text-green-600`}>
                {projection.if_attend_all}%
              </span>
            </div>
            <ProgressBar percentage={projection.if_attend_all} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                If you miss all
              </span>
              <span className={`font-bold text-red-600`}>
                {projection.if_miss_all}%
              </span>
            </div>
            <ProgressBar percentage={projection.if_miss_all} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Current trajectory
              </span>
              <span className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {projection.current}%
              </span>
            </div>
            <ProgressBar percentage={projection.current} />
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  );
}

/**
 * AtRiskStudentsList
 * Display list of at-risk students in a class
 */
export function AtRiskStudentsList({ branch, year, section, threshold = 75 }) {
  const { isDark } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAtRiskStudents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          branch,
          year,
          section,
          threshold,
        });

        const response = await fetch(`/api/attendance/prediction/at-risk/?${params}`);

        if (!response.ok) throw new Error('Failed to fetch at-risk students');

        const data = await response.json();
        setStudents(data.at_risk_students);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (branch && year && section) {
      fetchAtRiskStudents();
    }
  }, [branch, year, section, threshold]);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" description={error} />;
  if (students.length === 0) {
    return (
      <GlassmorphismCard>
        <SectionHeader title="At-Risk Students" subtitle={`No students below ${threshold}%`} />
        <div className="text-center py-8">
          <FiCheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            All students are maintaining good attendance! 🎉
          </p>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard>
      <SectionHeader 
        title="At-Risk Students" 
        subtitle={`${students.length} student(s) below ${threshold}%`}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className="text-left px-4 py-2 font-semibold">Student Name</th>
              <th className="text-left px-4 py-2 font-semibold">Attendance</th>
              <th className="text-left px-4 py-2 font-semibold">Classes Needed</th>
              <th className="text-left px-4 py-2 font-semibold">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
              >
                <td className={`px-4 py-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {student.student_name}
                </td>
                <td className={`px-4 py-3 font-semibold ${
                  student.current_percentage < 50
                    ? 'text-red-600'
                    : student.current_percentage < 75
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {student.current_percentage}%
                </td>
                <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {student.classes_needed}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    label={student.risk_level}
                    color={
                      student.risk_level === 'CRITICAL'
                        ? 'red'
                        : student.risk_level === 'WARNING'
                        ? 'yellow'
                        : 'green'
                    }
                    size="sm"
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`mt-4 p-3 rounded-lg text-sm ${isDark ? 'bg-slate-800/50 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        💡 Tip: Identify students early and provide additional support to improve their attendance.
      </div>
    </GlassmorphismCard>
  );
}

/**
 * ManualPredictionCalculator
 * Calculate prediction with custom inputs
 */
export function ManualPredictionCalculator({ targetPercentage = 75 }) {
  const { isDark } = useTheme();
  const [total, setTotal] = useState(0);
  const [attended, setAttended] = useState(0);
  const [target, setTarget] = useState(targetPercentage);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (total <= 0) {
      alert('Total classes must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('total_classes', total);
      formData.append('attended_classes', attended);
      formData.append('target_percentage', target);

      const response = await fetch('/api/attendance/prediction/calculate/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Calculation failed');

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassmorphismCard>
      <SectionHeader 
        title="Manual Prediction Calculator" 
        subtitle="Calculate attendance prediction with custom numbers"
      />

      <div className="space-y-4 mb-6">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Total Classes
          </label>
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-slate-900 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter total classes"
            min="0"
          />
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Classes Attended
          </label>
          <input
            type="number"
            value={attended}
            onChange={(e) => setAttended(Number(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-slate-900 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter classes attended"
            min="0"
          />
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Target Percentage (%)
          </label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-slate-900 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter target percentage"
            min="0"
            max="100"
          />
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Calculating...' : 'Calculate Prediction'}
        </button>
      </div>

      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}
        >
          <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Results
          </h4>
          <div className="space-y-2">
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Current Percentage: <span className="font-bold">{prediction.current_percentage}%</span>
            </p>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Classes Needed: <span className="font-bold text-blue-600">{prediction.classes_needed}</span>
            </p>
            <p className={`font-semibold ${
              prediction.risk_level.level === 'SAFE'
                ? 'text-green-600'
                : prediction.risk_level.level === 'WARNING'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              Risk Level: {prediction.risk_level.level}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {prediction.risk_level.message}
            </p>
          </div>
        </motion.div>
      )}
    </GlassmorphismCard>
  );
}
