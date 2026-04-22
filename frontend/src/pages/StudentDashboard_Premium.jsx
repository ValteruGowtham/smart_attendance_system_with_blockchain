import { useState, useEffect } from 'react';
import { getStudentDashboard } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  HiOutlineCheckCircle,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  StatCard,
  HighlightCard,
} from '../components/ui';
import { SkeletonCard, SkeletonText } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboardPremium() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getStudentDashboard()
      .then((r) => {
        setData(r.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load dashboard', {
          title: 'Error',
          duration: 3000,
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonCard lines={1} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} elevation="md">
              <SkeletonText lines={2} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card elevation="lg" padding="lg">
          <CardTitle>No Data Available</CardTitle>
          <CardDescription className="mt-2">Unable to load your dashboard</CardDescription>
        </Card>
      </div>
    );
  }

  const { student, records, summary } = data;

  // Attendance status
  const isHealthy = summary.percentage >= 75;
  const needsImprovement = summary.percentage >= 60 && summary.percentage < 75;
  const isAtRisk = summary.percentage < 60;

  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [summary.present, summary.absent],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '600' },
        },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner with Premium Styling */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
              <HiOutlineUser className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {student.first_name}! 👋</h1>
              <p className="text-blue-100">
                {student.branch} • Year {student.year} • Section {student.section}
              </p>
              <p className="text-blue-100 text-sm mt-1">ID: {student.registration_id}</p>
            </div>
          </div>
          <HiOutlineAcademicCap className="w-24 h-24 text-white opacity-20 hidden md:block" />
        </div>
      </div>

      {/* Stats Grid using StatCard Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary.percentage}%`}
          icon={HiOutlineChartBar}
          trend={isHealthy ? '↑ Excellent' : needsImprovement ? '→ Fair' : '↓ At Risk'}
          trendPositive={isHealthy}
          description={
            isHealthy
              ? '✓ Above requirement'
              : needsImprovement
                ? '⚠ Need improvement'
                : '✗ Below requirement'
          }
        />

        <StatCard
          title="Classes Attended"
          value={summary.present}
          icon={HiOutlineCheck}
          description="Present sessions"
          trendPositive={true}
        />

        <StatCard
          title="Classes Missed"
          value={summary.absent}
          icon={HiOutlineX}
          description="Absent sessions"
          trendPositive={false}
        />

        <StatCard
          title="Total Classes"
          value={summary.total}
          icon={HiOutlineBookOpen}
          description="Overall sessions"
        />
      </div>

      {/* Highlight Alert if At Risk */}
      {isAtRisk && (
        <HighlightCard>
          <div className="flex items-start gap-3">
            <HiOutlineLightningBolt className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">Attendance Alert</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your attendance is below 60%. You need to attend more classes to become eligible for exams.
              </p>
            </div>
          </div>
        </HighlightCard>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart Card */}
        <Card elevation="lg" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineChartBar className="w-5 h-5" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Present</span>
                </div>
                <span className="text-lg font-bold text-green-600">{summary.present}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">Absent</span>
                </div>
                <span className="text-lg font-bold text-red-600">{summary.absent}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <div className="lg:col-span-2">
          <Card elevation="lg" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiOutlineCalendar className="w-5 h-5" />
                Recent Attendance History
              </CardTitle>
              <CardDescription>{records.length} total records</CardDescription>
            </CardHeader>
            <CardContent>
              {records.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {records.slice(0, 10).map((record, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                        record.status === 'Present'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              record.status === 'Present'
                                ? 'bg-green-100 dark:bg-green-900'
                                : 'bg-red-100 dark:bg-red-900'
                            }`}
                          >
                            {record.status === 'Present' ? (
                              <HiOutlineCheck className="w-5 h-5 text-green-600" />
                            ) : (
                              <HiOutlineX className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{record.date}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <HiOutlineClock className="w-3 h-3" />
                              {record.period_time || record.time} • {record.faculty_name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            record.status === 'Present'
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {record.status === 'Present' ? '✓ Present' : '✗ Absent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No attendance records yet</p>
                  <p className="text-sm text-gray-400">Your attendance will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Important Info */}
        <Card elevation="md" className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineCheckCircle className="w-5 h-5 text-blue-600" />
              Attendance Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Maintain at least 75% attendance for exam eligibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Mark attendance during designated time windows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Check your dashboard regularly for updates</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card elevation="md" className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-purple-600" />
              Performance Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>Attend all classes to maintain good attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>Arrive on time during attendance marking windows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>Contact your faculty for any attendance-related issues</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
