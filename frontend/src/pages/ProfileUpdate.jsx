import React, { useState, useEffect } from 'react';
import {
  HiUser,
  HiMail,
  HiPhone,
  HiOfficeBuilding,
  HiAcademicCap,
  HiIdentification,
  HiSave,
  HiCamera,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserInfo } from '../api/api';

const ProfileUpdate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    registrationId: '',
    branch: '',
    year: '',
    section: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isFaculty = user?.role === 'faculty';

  useEffect(() => {
    // Load current profile data
    const fetchProfile = async () => {
      try {
        const res = await getUserInfo();
        const p = res.data.profile || {};
        setFormData({
          firstName: res.data.first_name || '',
          lastName: res.data.last_name || '',
          email: res.data.email || '',
          phone: p.phone || '',
          registrationId: p.registration_id || p.uid || '',
          branch: p.branch || '',
          year: p.year || '',
          section: p.section || '',
        });
        if (p.profile_pic) {
          setPreviewUrl(p.profile_pic);
        }
      } catch (err) {
        toast.error('Failed to load profile data');
      }
    };
    fetchProfile();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, this would call an API like API.post('/auth/profile/update/', data)
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your personal information and profile picture.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <HiUser className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 active:scale-95">
                  <HiCamera className="w-5 h-5" />
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>

              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{formData.firstName} {formData.lastName}</h2>
                <p className="text-slate-500 font-medium">{isFaculty ? 'Faculty Member' : 'Student'} • {formData.branch || 'Department'}</p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                    {isFaculty ? `UID: ${formData.registrationId}` : formData.registrationId}
                  </span>
                  {!isFaculty && (
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">
                      Section {formData.section}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HiIdentification className="text-blue-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                <div className="relative">
                  <HiUser className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                <div className="relative">
                  <HiUser className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                <div className="relative">
                  <HiPhone className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info (Read Only) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm opacity-80">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HiAcademicCap className="text-indigo-600" />
              {isFaculty ? 'Professional Record' : 'Academic Record'} (Verified)
            </h3>
            <p className="text-xs text-slate-500 mb-6 -mt-4 italic">These fields are locked. Contact administration to change your department or designation.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 ml-1">{isFaculty ? 'Department' : 'Branch'}</label>
                <div className="relative">
                  <HiOfficeBuilding className="absolute left-4 top-3.5 text-slate-300" />
                  <input
                    type="text"
                    value={formData.branch}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-11 py-3 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {!isFaculty && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-500 ml-1">Academic Year</label>
                    <div className="relative">
                      <HiAcademicCap className="absolute left-4 top-3.5 text-slate-300" />
                      <input
                        type="text"
                        value={formData.year}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-11 py-3 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-500 ml-1">Section</label>
                    <div className="relative">
                      <HiIdentification className="absolute left-4 top-3.5 text-slate-300" />
                      <input
                        type="text"
                        value={formData.section}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-11 py-3 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <HiSave className="w-5 h-5" />
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfileUpdate;
