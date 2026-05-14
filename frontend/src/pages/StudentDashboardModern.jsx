import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineTrendingUp,
  HiOutlineDownload,
  HiOutlineBell,
  HiOutlineClock,
} from 'react-icons/hi';
import { MainLayout } from '../components/layout';
import { Button, Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui';
import { KPICard, ProgressBar, AttendanceStatus, AlertsList } from '../components/dashboard';
import { getStudentDashboard } from '../api/api';
import { useToast } from '../context/ToastContext';

const StudentDashboardModern = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStudentDashboard();
        setData(response.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout pageTitle="My Dashboard">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </MainLayout>
    );
  }

  const { student, records, summary } = data || {};

  if (!data) {
    return (
      <MainLayout pageTitle="My Dashboard">
        <Card>
          <CardContent className="pt-6">
            <p>No data available</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  // Subject-wise breakdown mock data (in real app, comes from API)
  const subjectWiseBreakdown = [
    { name: 'Mathematics', present: 32, absent: 8, percentage: 80 },
    { name: 'Physics', present: 28, absent: 12, percentage: 70 },
    { name: 'Chemistry', present: 35, absent: 5, percentage: 88 },
    { name: 'Programming', present: 38, absent: 2, percentage: 95 },
  ];

  // Upcoming classes mock data
  const upcomingClasses = [
    { time: '10:00 AM', subject: 'Mathematics', room: 'Room 101', faculty: 'Dr. Singh' },
    { time: '12:00 PM', subject: 'Programming', room: 'Lab 2', faculty: 'Mr. Gupta' },
    { time: '2:00 PM', subject: 'Physics', room: 'Room 205', faculty: 'Dr. Sharma' },
  ];

  // Alerts
  const alerts = [];
  if (summary.percentage < 75) {
    alerts.push({
      id: 1,
      type: 'warning',
      title: 'Attendance Warning',
      message: `Your attendance is currently ${summary.percentage}%. You need to attend ${Math.ceil((75 - summary.percentage) * 2)} more classes to reach 75%.`,
      action: { label: 'View Schedule' },
    });
  }

  alerts.push({
    id: 2,
    type: 'info',
    title: 'New Class Schedule',
    message: 'Your timetable for next week has been updated. Check the schedule section.',
  });

  // Required classes calculation
  const requiredClasses = Math.ceil((75 - summary.percentage) * 2);

  return (
    <MainLayout pageTitle="My Dashboard">
      {/* Top KPI Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={HiOutlineCheckCircle}
          label="Present"
          value={summary.present}
          color="green"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineCalendar}
          label="Absent"
          value={summary.absent}
          color="red"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineTrendingUp}
          label="Attendance Rate"
          value={`${summary.percentage}%`}
          color="blue"
          loading={loading}
        />
        <KPICard
          icon={HiOutlineClock}
          label="To Reach 75%"
          value={requiredClasses}
          color="orange"
          loading={loading}
        />
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mb-8">
          <AlertsList alerts={alerts} />
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Attendance Status & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Attendance Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Attendance Status</CardTitle>
              <CardDescription>Current standing and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceStatus percentage={summary.percentage} showDetails />
            </CardContent>
          </Card>

          {/* Subject-wise Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Breakdown</CardTitle>
              <CardDescription>Attendance by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectWiseBreakdown.map((subject, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        {subject.present}/{subject.present + subject.absent}
                      </span>
                    </div>
                    <ProgressBar
                      value={subject.percentage}
                      max={100}
                      color={subject.percentage >= 75 ? 'green' : subject.percentage >= 60 ? 'yellow' : 'red'}
                      showPercentage={false}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Last 10 attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {records?.slice(0, 10).map((record, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${record.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{record.date}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{record.subject}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      record.status === 'Present'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {record.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upcoming Classes & Actions */}
        <div className="space-y-8">
          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingClasses.map((cls, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {cls.time}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{cls.subject}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cls.room}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{cls.faculty}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
                  <HiOutlineDownload size={18} />
                  Download Report
                </Button>
                <Button variant="outline" size="md" className="w-full flex items-center justify-center gap-2">
                  <HiOutlineCalendar size={18} />
                  View Full Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Classes</span>
                  <span className="font-bold text-gray-900 dark:text-white">{summary.present + summary.absent}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Avg Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">8.5/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Rank</span>
                  <span className="font-bold text-gray-900 dark:text-white">15/450</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDashboardModern;
