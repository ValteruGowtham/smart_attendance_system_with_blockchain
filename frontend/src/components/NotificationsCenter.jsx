import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBell,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

export default function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Attendance Marked', message: 'Successfully marked 45 students present', time: '5 mins ago', read: false },
    { id: 2, type: 'warning', title: 'Low Attendance Alert', message: '12 students below 75% attendance', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'System Update', message: 'FaceNet model updated to v2.1', time: '2 hours ago', read: true },
    { id: 4, type: 'success', title: 'Report Generated', message: 'Monthly attendance report ready', time: '3 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    const iconMap = {
      success: <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />,
      warning: <HiOutlineExclamation className="w-5 h-5 text-yellow-500" />,
      info: <HiOutlineInformationCircle className="w-5 h-5 text-blue-500" />,
    };
    return iconMap[type] || iconMap.info;
  };

  const getBgColor = (type) => {
    const bgMap = {
      success: 'bg-green-50 border-l-4 border-green-500',
      warning: 'bg-yellow-50 border-l-4 border-yellow-500',
      info: 'bg-blue-50 border-l-4 border-blue-500',
    };
    return bgMap[type] || bgMap.info;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <HiOutlineBell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <HiOutlineBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${getBgColor(notif.type)} ${!notif.read ? 'bg-opacity-50' : 'opacity-75'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-800 text-sm">{notif.title}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notif.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <HiOutlineX className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 text-center">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all notifications →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
