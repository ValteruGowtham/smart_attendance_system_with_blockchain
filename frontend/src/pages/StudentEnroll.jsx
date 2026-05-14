/**
 * StudentEnroll.jsx - Multi-step face registration wizard
 * Step 1: Details → Step 2: Photo Capture → Step 3: Embedding → Step 4: Success
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  HiCheckCircle,
  HiCamera,
  HiX,
  HiChevronRight,
  HiChevronLeft,
  HiArrowRight,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useToast } from '../context/ToastContext';

export default function StudentEnroll() {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1-4
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    registrationId: '',
    branch: 'CSE',
    year: '1',
    section: 'A',
    email: '',
  });
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [faceLive, setFaceLive] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Step 1: Form validation
  const isStep1Valid = formData.firstName && formData.lastName && formData.registrationId && formData.email;

  // Step 2: Start webcam
  useEffect(() => {
    if (step === 2) {
      startWebcam();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Could not access webcam');
    }
  };

  // Simulate face detection
  const simulateFaceDetection = () => {
    setFaceLive(true);
    setFaceConfidence(Math.floor(Math.random() * (98 - 82 + 1) + 82)); // 82-98%
  };

  // Capture photo
  const capturePhoto = () => {
    if (!faceLive) {
      toast.error('Face not detected');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    if (video && ctx) {
      canvas.width = 640;
      canvas.height = 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');

      if (capturedPhotos.length < 3) {
        setCapturedPhotos([...capturedPhotos, imageData]);
        toast.success(`Photo ${capturedPhotos.length + 1} captured`);

        if (capturedPhotos.length === 2) {
          toast.success('All 3 photos captured! Ready to generate embedding.');
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) {
      toast.error('Please fill all fields');
      return;
    }
    if (step === 2 && capturedPhotos.length < 3) {
      toast.error('Please capture all 3 photos');
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  // Render based on step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Registration ID</label>
              <input
                type="text"
                name="registrationId"
                value={formData.registrationId}
                onChange={handleInputChange}
                placeholder="e.g., CSE2024001"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg border-4 border-slate-200"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Face Detection Overlay */}
              <div className={`flex items-center justify-center w-full py-4 px-4 rounded-lg ${faceLive ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${faceLive ? 'text-green-700' : 'text-yellow-700'}`}>
                    {faceLive ? `✓ Face detected (${faceConfidence}%)` : 'Position your face in frame'}
                  </p>
                </div>
              </div>

              {/* Simulate face detection */}
              {!faceLive && (
                <button
                  onClick={simulateFaceDetection}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Detect Face
                </button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 Capture 3 photos from slightly different angles for better face recognition.
              </p>
            </div>

            {/* Capture Button */}
            <button
              onClick={capturePhoto}
              disabled={!faceLive || capturedPhotos.length >= 3}
              className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                faceLive && capturedPhotos.length < 3
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              <HiCamera className="w-5 h-5" />
              Capture Photo ({capturedPhotos.length}/3)
            </button>

            {/* Captured Photos Preview */}
            {capturedPhotos.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Captured Photos</h3>
                <div className="grid grid-cols-3 gap-3">
                  {capturedPhotos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img src={photo} alt={`Capture ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                      <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900">Generating Embedding...</label>
                <span className="text-sm font-bold text-blue-600">75%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-3/4 transition-all duration-500"></div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Processing 3 captured photos to create facial embedding...
              </p>
            </div>

            {/* Photos Preview */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Captured Photos</h3>
              <div className="grid grid-cols-3 gap-3">
                {capturedPhotos.map((photo, idx) => (
                  <img key={idx} src={photo} alt={`Capture ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-slate-600">Average Confidence</p>
                <p className="text-2xl font-bold text-slate-900">96.8%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Face Quality</p>
                <p className="text-2xl font-bold text-green-600">Excellent</p>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <HiArrowRight className="w-5 h-5" />
              Continue to Success
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <HiCheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enrollment Successful!</h3>
              <p className="text-slate-600">Student has been registered with facial embedding.</p>
            </div>

            {/* Student Card Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Student Card Preview</h4>
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Name:</span>
                  <span className="font-semibold text-slate-900">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Registration ID:</span>
                  <span className="font-semibold text-slate-900">{formData.registrationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Branch:</span>
                  <span className="font-semibold text-slate-900">{formData.branch} - Year {formData.year} - {formData.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Email:</span>
                  <span className="font-semibold text-slate-900">{formData.email}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setFormData({ firstName: '', lastName: '', registrationId: '', branch: 'CSE', year: '1', section: 'A', email: '' });
                  setCapturedPhotos([]);
                  setFaceLive(false);
                }}
                className="py-3 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
              >
                Enroll Another
              </button>
              <button className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Student Enrollment Wizard</h1>
        <p className="text-slate-500 mt-1">Register new student with face enrollment</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
        {/* Step Indicators */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  s <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 4 && <div className={`w-8 h-1 ${s < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {step === 1 && 'Step 1: Student Details'}
          {step === 2 && 'Step 2: Photo Capture'}
          {step === 3 && 'Step 3: Embedding Generation'}
          {step === 4 && 'Step 4: Success'}
        </h2>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                step === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <HiChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Next
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
