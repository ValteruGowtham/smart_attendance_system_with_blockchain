import { useState, useEffect, useRef } from 'react';
import { getStudents, updateStudent, deleteStudent } from '../api/api';
import Toast from '../components/Toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';

export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    getStudents().then((r) => setStudents(r.data)).catch(() => {
      setToast({ msg: 'Failed to load students', type: 'error' });
    });
  };

  const handleEdit = (student) => {
    setEditing(student.id);
    setEditForm({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      branch: student.branch,
      year: student.year,
      section: student.section,
    });
    setProfilePic(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setEditForm({});
    setProfilePic(null);
  };

  const handleSave = async (id) => {
    const formData = new FormData();
    Object.keys(editForm).forEach(key => {
      formData.append(key, editForm[key]);
    });
    if (profilePic) {
      formData.append('profile_pic', profilePic);
    }

    try {
      await updateStudent(id, formData);
      setToast({ msg: 'Student updated successfully', type: 'success' });
      handleCancel();
      loadStudents();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Failed to update student', type: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteStudent(id);
      setToast({ msg: 'Student deleted successfully', type: 'success' });
      loadStudents();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Failed to delete student', type: 'error' });
    }
  };

  const filteredStudents = students.filter(s =>
    s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registration_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <HiOutlineUserGroup className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">All Students</h1>
              <p className="text-blue-100 text-sm">Manage student profiles and academic information</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-bold">{students.length}</div>
            <div className="text-blue-100 text-sm">Total Students</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <HiOutlineSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, registration ID, or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {['#', 'Student', 'Registration ID', 'Branch', 'Year', 'Section', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, i) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animation: `fade-in 0.3s ease-out ${i * 0.05}s both` }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {i + 1}
                      </div>
                    </td>

                    {editing === s.id ? (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editForm.first_name}
                              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                              className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="First"
                            />
                            <input
                              type="text"
                              value={editForm.last_name}
                              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                              className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Last"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-gray-500 font-mono">{s.registration_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.branch}
                            onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.year}
                            onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.section}
                            onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(s.id)}
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
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-600">
                                {s.first_name?.[0]}{s.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {s.first_name} {s.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {s.registration_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {s.branch}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                            Year {s.year}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                            {s.section}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                              title="Edit student"
                            >
                              <HiOutlinePencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                              title="Delete student"
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
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <HiOutlineUserGroup className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No students found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? 'Try adjusting your search' : 'Add students to get started'}
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
