import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Shield, User, MapPin, Mail, X, Check, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';

const ROLE_HIERARCHY = {
  PROVINCIAL_DIRECTOR: ['ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  ZONAL_DIRECTOR: ['DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  DIVISIONAL_DIRECTOR: ['PRINCIPAL', 'TEACHER', 'STUDENT'],
  PRINCIPAL: ['TEACHER', 'STUDENT'],
  TEACHER: ['STUDENT']
};

const ROLE_LABELS = {
  PROVINCIAL_DIRECTOR: 'Provincial Director',
  ZONAL_DIRECTOR: 'Zonal Director',
  DIVISIONAL_DIRECTOR: 'Divisional Director',
  PRINCIPAL: 'Principal',
  TEACHER: 'Teacher',
  STUDENT: 'Student'
};

const UserManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamLevel, setSelectedExamLevel] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  const [loading, setLoading] = useState(false);
  const [nicError, setNicError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    fetch('http://localhost:8080/api/public/districts')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8080/api/public/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`http://localhost:8080/api/public/zones?districtId=${selectedDistrict}`)
        .then(res => res.json())
        .then(data => setZones(data));
    } else {
      setZones([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedZone) {
      fetch(`http://localhost:8080/api/public/divisions?zoneId=${selectedZone}`)
        .then(res => res.json())
        .then(data => setDivisions(data));
    } else {
      setDivisions([]);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`http://localhost:8080/api/public/schools?divisionId=${selectedDivision}`)
        .then(res => res.json())
        .then(data => setSchools(data));
    } else {
      setSchools([]);
    }
  }, [selectedDivision]);

  const allowedRolesToCreate = ROLE_HIERARCHY[currentUser?.role] || [];
  const isZonal = currentUser?.role === 'ZONAL_DIRECTOR';
  const isDivisional = currentUser?.role === 'DIVISIONAL_DIRECTOR';
  const isPrincipal = currentUser?.role === 'PRINCIPAL';
  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);

  const fetchUsers = () => {
    fetch('http://localhost:8080/api/auth/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    // NIC Validation (Username is NIC)
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(formData.username)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid NIC',
        text: 'Must be 9 digits + V/X or 12 digits.',
        confirmButtonColor: '#3b82f6'
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: selectedRole.toLowerCase(),
        districtId: selectedDistrict || null,
        zoneId: selectedZone || null,
        divisionId: selectedDivision || null,
        schoolId: selectedSchool || null,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : null,
        examLevel: selectedExamLevel || null
      };

      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setEditingUser(null);
        fetchUsers();
        Swal.fire({
          title: 'Success!',
          text: 'User created successfully.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error creating user',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please check your connection and try again.',
        confirmButtonColor: '#3b82f6'
      });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8080/api/auth/users/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
          Swal.fire({
            title: 'Deleted!',
            text: 'The user has been deleted.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        } else {
          Swal.fire('Error!', 'Failed to delete user.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'Network error while deleting user.', 'error');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── PRESTIGIOUS HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span>🛡️ Access Control & User Provisioning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Officer Accounts & Role Permissions</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
            Manage authenticated access credentials, geographical jurisdictions, and administrative privileges for directors, principals, and teachers.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 text-xs font-bold text-slate-300">
          <button 
            onClick={() => { 
              setEditingUser(null); 
              setSelectedRole(allowedRolesToCreate[0] || '');
              setSelectedDistrict(currentUser?.districtId ? String(currentUser.districtId) : '');
              setSelectedZone(currentUser?.zoneId ? String(currentUser.zoneId) : '');
              setSelectedDivision(currentUser?.divisionId ? String(currentUser.divisionId) : '');
              setSelectedSchool(currentUser?.schoolId ? String(currentUser.schoolId) : '');
              setSelectedExamLevel('');
              setSelectedSubjects([]);
              setFormData({ username: '', email: '', password: '', firstName: '', lastName: '' });
              setNicError('');
              setIsModalOpen(true); 
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 cursor-pointer active:scale-95"
          >
            <Plus size={18} />
            <span>+ Create New User</span>
          </button>
          <span className="text-blue-300 text-[11px] font-semibold">Hierarchy-Enforced Role Engine</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, role or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <option value="">All Roles</option>
          {allowedRolesToCreate.map(role => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Access</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Location / Scope</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-teal-50 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5"><Mail size={12} className="mr-1"/>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                      <Shield size={12} className="mr-1.5" />
                      {ROLE_LABELS[user.role]}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin size={14} className="mr-2 text-slate-400" />
                      {user.location}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { 
                          setEditingUser(user); 
                          setSelectedRole(user.role);
                          setIsModalOpen(true); 
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <User size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No users found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <UserPlus className="mr-2 text-blue-600" size={20} />
                  {editingUser ? 'Edit User' : 'Register New User'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="userForm" onSubmit={handleSaveUser} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
                      <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
                      <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. j.doe@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">NIC (Username)</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.username} 
                        onChange={e => {
                          const val = e.target.value;
                          setFormData({...formData, username: val});
                          const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
                          if (val && !nicRegex.test(val)) {
                            setNicError('Must be 9 digits + V/X or 12 digits');
                          } else {
                            setNicError('');
                          }
                        }} 
                        placeholder="e.g. 199012345678" 
                        className={`w-full px-4 py-2.5 bg-slate-50 border ${nicError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                      />
                      {nicError ? (
                        <p className="text-xs text-red-500 mt-1">{nicError}</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">NIC will be used for login.</p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Initial Password</label>
                      <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Enter temporary password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign Role</label>
                    <select 
                      required 
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="" disabled>Select a role...</option>
                      {allowedRolesToCreate.map(role => (
                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Location Selection Based on Role */}
                  {selectedRole && selectedRole !== 'PROVINCIAL_DIRECTOR' && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                      <h4 className="text-sm font-bold text-blue-800 mb-2 border-b border-blue-100 pb-2">Assign Scope / Location</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            District {!isProvincialAdmin && <span className="text-[10px] text-blue-600 font-bold">(Locked)</span>}
                          </label>
                          <select 
                            required 
                            disabled={!isProvincialAdmin}
                            value={selectedDistrict}
                            onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedZone(''); setSelectedDivision(''); }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            <option value="" disabled>Select District</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                        
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Zone {!isProvincialAdmin && <span className="text-[10px] text-blue-600 font-bold">(Locked)</span>}
                          </label>
                          <select 
                            required 
                            disabled={!isProvincialAdmin || !selectedDistrict}
                            value={selectedZone}
                            onChange={(e) => { setSelectedZone(e.target.value); setSelectedDivision(''); }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            <option value="" disabled>Select Zone</option>
                            {zones.map(z => (
                              <option key={z.id} value={z.id}>{z.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {['DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER', 'STUDENT'].includes(selectedRole) && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Division {(isDivisional || isPrincipal) && <span className="text-[10px] text-blue-600 font-bold">(Locked)</span>}
                            </label>
                            <select 
                              required 
                              disabled={isDivisional || isPrincipal || !selectedZone}
                              value={selectedDivision}
                              onChange={(e) => setSelectedDivision(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                            >
                              <option value="" disabled>Select Division</option>
                              {divisions.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          {['PRINCIPAL', 'TEACHER', 'STUDENT'].includes(selectedRole) && (
                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-xs font-bold text-slate-600 mb-1">
                                School {isPrincipal && <span className="text-[10px] text-blue-600 font-bold">(Locked)</span>}
                              </label>
                              <select 
                                id="schoolSelect"
                                required 
                                disabled={isPrincipal || !selectedDivision}
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                              >
                                <option value="" disabled>Select School</option>
                                {schools.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {selectedRole === 'TEACHER' && (
                            <div className="col-span-2 space-y-4">
                              {/* Teaching Level Dropdown */}
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Teaching Level</label>
                                <select 
                                  required 
                                  value={selectedExamLevel}
                                  onChange={(e) => {
                                    setSelectedExamLevel(e.target.value);
                                    setSelectedSubjects([]); // Reset subjects when level changes
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all"
                                >
                                  <option value="" disabled>Select Level</option>
                                  <option value="AL">A/L</option>
                                  <option value="OL">O/L</option>
                                  <option value="BOTH">Both</option>
                                </select>
                              </div>

                              {/* Subject Selection - changes based on teaching level */}
                              {selectedExamLevel === 'BOTH' ? (
                                /* BOTH mode: two separate selects - one AL, one OL */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">A/L Subject <span className="text-blue-500">(Select 1)</span></label>
                                    <select
                                      required
                                      value={selectedSubjects.find(id => subjects.find(s => s.id === id && s.type === 'AL')) || ''}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const olSubjects = selectedSubjects.filter(id => subjects.find(s => s.id === id && s.type === 'OL'));
                                        setSelectedSubjects(val ? [...olSubjects, val] : olSubjects);
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    >
                                      <option value="">Select A/L Subject...</option>
                                      {subjects.filter(s => s.type === 'AL').map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">O/L Subject <span className="text-teal-500">(Select 1)</span></label>
                                    <select
                                      required
                                      value={selectedSubjects.find(id => subjects.find(s => s.id === id && s.type === 'OL')) || ''}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const alSubjects = selectedSubjects.filter(id => subjects.find(s => s.id === id && s.type === 'AL'));
                                        setSelectedSubjects(val ? [...alSubjects, val] : alSubjects);
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    >
                                      <option value="">Select O/L Subject...</option>
                                      {subjects.filter(s => s.type === 'OL').map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ) : selectedExamLevel ? (
                                /* AL or OL mode: single dropdown, only matching subjects */
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 mb-1">
                                    {selectedExamLevel === 'AL' ? 'A/L' : 'O/L'} Subject <span className="text-blue-500">(Select 1)</span>
                                  </label>
                                  <select
                                    required
                                    value={selectedSubjects[0] || ''}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setSelectedSubjects(val ? [val] : []);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all"
                                  >
                                    <option value="">Select Subject...</option>
                                    {subjects.filter(s => s.type === selectedExamLevel).map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="userForm"
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-70"
                >
                  {loading ? 'Processing...' : (editingUser ? 'Save Changes' : 'Create User')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserManagement;
