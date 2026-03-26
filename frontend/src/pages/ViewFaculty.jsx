import { useState, useEffect } from 'react';
import { getFaculty, updateFaculty, deleteFaculty } from '../api/api';
import Toast from '../components/Toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineAcademicCap, HiOutlineUsers } from 'react-icons/hi';

export default function ViewFaculty() {
  const [faculties, setFaculties] = useState([]);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = () => {
    getFaculty().then((r) => setFaculties(r.data)).catch(() => {
      setToast({ msg: 'Failed to load faculty', type: 'error' });
    });
  };

  const handleEdit = (faculty) => {
    setEditing(faculty.id);
    setEditForm({
      first_name: faculty.first_name,
      last_name: faculty.last_name,
      email: faculty.email,
      phone: faculty.phone,
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    const formData = new FormData();
    Object.keys(editForm).forEach(key => {
      formData.append(key, editForm[key]);
    });

    try {
      await updateFaculty(id, formData);
      setToast({ msg: 'Faculty member updated successfully', type: 'success' });
      handleCancel();
      loadFaculty();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Failed to update faculty', type: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteFaculty(id);
      setToast({ msg: 'Faculty member deleted successfully', type: 'success' });
      loadFaculty();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Failed to delete faculty', type: 'error' });
    }
  };

  const filteredFaculty = faculties.filter(f =>
    f.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <HiOutlineAcademicCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">All Faculty Members</h1>
              <p className="text-emerald-100 text-sm">Manage faculty profiles and system access</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-bold">{faculties.length}</div>
            <div className="text-emerald-100 text-sm">Total Faculty</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <HiOutlineUsers className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {['#', 'Faculty Member', 'Email', 'Phone', 'UID', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFaculty.length > 0 ? (
                filteredFaculty.map((f, i) => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animation: `fade-in 0.3s ease-out ${i * 0.05}s both` }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {i + 1}
                      </div>
                    </td>

                    {editing === f.id ? (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editForm.first_name}
                              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                              className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="First"
                            />
                            <input
                              type="text"
                              value={editForm.last_name}
                              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                              className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="Last"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-500">{f.uid}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(f.id)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-emerald-600">
                                {f.first_name?.[0]}{f.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {f.first_name} {f.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{f.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 font-mono">{f.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full font-mono">
                            {f.uid}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(f)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                              title="Edit faculty"
                            >
                              <HiOutlinePencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(f.id, `${f.first_name} ${f.last_name}`)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                              title="Delete faculty"
                            >
                              <HiOutlineTrash className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <HiOutlineAcademicCap className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No faculty members found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? 'Try adjusting your search' : 'Add faculty members to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
