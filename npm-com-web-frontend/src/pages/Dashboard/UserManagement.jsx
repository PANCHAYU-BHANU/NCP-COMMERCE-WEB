import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Shield, User, MapPin, Mail, X, Check, UserPlus, Key, Eye, EyeOff, CheckCircle2, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import SubjectManagementModal from '../../components/SubjectManagementModal';

const ROLE_HIERARCHY = {
  PROVINCIAL_DIRECTOR: ['ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  ZONAL_DIRECTOR: ['DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  DIVISIONAL_DIRECTOR: ['PRINCIPAL', 'TEACHER', 'STUDENT'],
  PRINCIPAL: ['TEACHER'],
  TEACHER: ['STUDENT']
};

const ALL_ROLES = ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER'];

const ROLE_LABELS = {
  PROVINCIAL_DIRECTOR: 'Provincial Director',
  ZONAL_DIRECTOR: 'Zonal Director',
  DIVISIONAL_DIRECTOR: 'Divisional Director',
  PRINCIPAL: 'Principal',
  TEACHER: 'Commerce Teacher',
  STUDENT: 'Student'
};

const getPasswordStrength = (pwd = '') => {
  const criteria = {
    length: (pwd || '').length >= 8,
    upper: /[A-Z]/.test(pwd || ''),
    lower: /[a-z]/.test(pwd || ''),
    number: /[0-9]/.test(pwd || ''),
    special: /[!@#$%^&*(),.?":{}|<>\-_]/.test(pwd || '')
  };
  const passedCount = Object.values(criteria).filter(Boolean).length;
  const isStrong = passedCount === 5;
  return { ...criteria, passedCount, isStrong };
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

  const DEFAULT_SUBJECTS = [
    { id: 1, name: 'Accounting', type: 'AL', medium: 'All' },
    { id: 2, name: 'Business Studies', type: 'AL', medium: 'All' },
    { id: 3, name: 'Economics', type: 'AL', medium: 'All' },
    { id: 4, name: 'Information & Communication Technology (ICT)', type: 'AL', medium: 'All' },
    { id: 5, name: 'Business Statistics', type: 'AL', medium: 'All' },
    { id: 6, name: 'Entrepreneurship Studies', type: 'AL', medium: 'All' },
    { id: 7, name: 'Commerce & Accounting', type: 'OL', medium: 'All' },
    { id: 8, name: 'Business & Accounting Studies', type: 'OL', medium: 'All' },
    { id: 9, name: 'Entrepreneurship Studies (O/L)', type: 'OL', medium: 'All' }
  ];

  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [selectedExamLevel, setSelectedExamLevel] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [isSectionHead, setIsSectionHead] = useState(false);

  const [loading, setLoading] = useState(false);
  const [nicError, setNicError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const isZonal = currentUser?.role === 'ZONAL_DIRECTOR';
  const isDivisional = currentUser?.role === 'DIVISIONAL_DIRECTOR';
  const isPrincipal = currentUser?.role === 'PRINCIPAL';
  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);
  const allowedRolesToCreate = ROLE_HIERARCHY[currentUser?.role] || [];

  // Effective location IDs for currently logged in officer
  const effectiveDistrictId = currentUser?.districtId ? String(currentUser.districtId) : '';
  const effectiveZoneId = currentUser?.zoneId ? String(currentUser.zoneId) : '';
  const effectiveDivisionId = currentUser?.divisionId ? String(currentUser.divisionId) : '';
  const effectiveSchoolId = currentUser?.schoolId ? String(currentUser.schoolId) : '';

  useEffect(() => {
    fetch('/api/public/districts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
        } else {
          setDistricts([
            { id: 1, name: 'Anuradhapura' },
            { id: 2, name: 'Polonnaruwa' }
          ]);
        }
      })
      .catch(err => {
        console.error('Error fetching districts, using defaults:', err);
        setDistricts([
          { id: 1, name: 'Anuradhapura' },
          { id: 2, name: 'Polonnaruwa' }
        ]);
      });

    fetch('/api/public/subjects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
        } else {
          setSubjects(DEFAULT_SUBJECTS);
        }
      })
      .catch(err => {
        console.warn('Error fetching subjects, using defaults:', err);
        setSubjects(DEFAULT_SUBJECTS);
      });
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/public/zones?districtId=${selectedDistrict}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setZones(data);
        });
    } else {
      setZones([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedZone) {
      fetch(`/api/public/divisions?zoneId=${selectedZone}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setDivisions(data);
        });
    } else {
      setDivisions([]);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`/api/public/schools?divisionId=${selectedDivision}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSchools(data);
        });
    } else {
      setSchools([]);
    }
  }, [selectedDivision]);

  const fetchUsers = () => {
    const token = currentUser?.token || currentUser?.accessToken || JSON.parse(localStorage.getItem('auth') || '{}')?.token;
    fetch('/api/auth/users', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(err => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenPrincipalAddModal = () => {
    setEditingUser(null);
    setSelectedRole('TEACHER');
    setSelectedDistrict(effectiveDistrictId);
    setSelectedZone(effectiveZoneId);
    setSelectedDivision(effectiveDivisionId);
    setSelectedSchool(effectiveSchoolId);
    setSelectedExamLevel('');
    setSelectedSubjects([]);
    setIsSectionHead(false);
    setFormData({ username: '', email: '', password: '', firstName: '', lastName: '' });
    setNicError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenStandardAddModal = () => {
    setEditingUser(null);
    setSelectedRole(allowedRolesToCreate[0] || 'TEACHER');
    setSelectedDistrict(effectiveDistrictId);
    setSelectedZone(effectiveZoneId);
    setSelectedDivision(effectiveDivisionId);
    setSelectedSchool(effectiveSchoolId);
    setSelectedExamLevel('');
    setSelectedSubjects([]);
    setIsSectionHead(false);
    setFormData({ username: '', email: '', password: '', firstName: '', lastName: '' });
    setNicError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (targetUser) => {
    if (!isProvincialAdmin) {
      Swal.fire('Unauthorized', 'Only the Provincial Director has executive authority to transfer or edit officers.', 'warning');
      return;
    }
    setEditingUser(targetUser);
    setSelectedRole(targetUser.role || 'TEACHER');
    const nameParts = (targetUser.name || '').split(' ');
    const fName = nameParts[0] || '';
    const lName = nameParts.slice(1).join(' ') || '';
    setFormData({
      username: targetUser.username || targetUser.name || '',
      email: targetUser.email || '',
      password: '',
      firstName: fName,
      lastName: lName
    });

    const dId = targetUser.districtId ? String(targetUser.districtId) : '';
    const zId = targetUser.zoneId ? String(targetUser.zoneId) : '';
    const divId = targetUser.divisionId ? String(targetUser.divisionId) : '';
    const schId = targetUser.schoolId ? String(targetUser.schoolId) : '';

    setSelectedDistrict(dId);
    setSelectedZone(zId);
    setSelectedDivision(divId);
    setSelectedSchool(schId);
    setSelectedExamLevel(targetUser.examLevel || '');
    setIsSectionHead(Boolean(targetUser.isSectionHead || targetUser.role === 'SECTION_HEAD'));

    if (targetUser.subjects && Array.isArray(targetUser.subjects) && subjects.length > 0) {
      const matchedIds = subjects.filter(s => targetUser.subjects.includes(s.name)).map(s => s.id);
      setSelectedSubjects(matchedIds);
    } else {
      setSelectedSubjects([]);
    }

    // Pre-load cascading hierarchy lists immediately so transfer selects are pre-filled
    try {
      if (dId) {
        const zData = await fetch(`/api/public/zones?districtId=${dId}`).then(r => r.json());
        if (Array.isArray(zData)) setZones(zData);
      }
      if (zId) {
        const divData = await fetch(`/api/public/divisions?zoneId=${zId}`).then(r => r.json());
        if (Array.isArray(divData)) setDivisions(divData);
      }
      if (divId) {
        const schData = await fetch(`/api/public/schools?divisionId=${divId}`).then(r => r.json());
        if (Array.isArray(schData)) setSchools(schData);
      }
    } catch (err) {
      console.error("Error pre-loading transfer hierarchy:", err);
    }

    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Strong Password Validation
    if (!editingUser || formData.password) {
      const strength = getPasswordStrength(formData.password);
      if (!strength.isStrong) {
        Swal.fire({
          icon: 'warning',
          title: 'Strong Password Required',
          html: '<div class="text-left text-xs space-y-1.5 p-2 bg-slate-50 rounded-lg"><b>Password must be at least 8 characters and include:</b><br/>• At least 1 Uppercase letter (A-Z)<br/>• At least 1 Lowercase letter (a-z)<br/>• At least 1 Number (0-9)<br/>• At least 1 Special character (!@#$%^&*...)</div>',
          confirmButtonColor: '#3b82f6'
        });
        setLoading(false);
        return;
      }
    }

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
      let roleToSend = selectedRole ? selectedRole.toLowerCase() : 'teacher';
      if (roleToSend === 'zonal_director') roleToSend = 'zonal';
      else if (roleToSend === 'divisional_director') roleToSend = 'divisional';
      else if (roleToSend === 'provincial_director') roleToSend = 'provincial';

      const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || formData.username;

      // When Principal creates teacher, enforce Principal's own school hierarchy
      const finalSchoolId = isPrincipal ? (effectiveSchoolId || selectedSchool) : selectedSchool;
      const finalDivisionId = isPrincipal ? (effectiveDivisionId || selectedDivision) : selectedDivision;
      const finalZoneId = isPrincipal ? (effectiveZoneId || selectedZone) : selectedZone;
      const finalDistrictId = isPrincipal ? (effectiveDistrictId || selectedDistrict) : selectedDistrict;

      const payload = {
        name: fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password || undefined,
        role: isPrincipal ? 'teacher' : roleToSend,
        districtId: finalDistrictId ? Number(finalDistrictId) : null,
        zoneId: finalZoneId ? Number(finalZoneId) : null,
        divisionId: finalDivisionId ? Number(finalDivisionId) : null,
        schoolId: finalSchoolId ? Number(finalSchoolId) : null,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : null,
        examLevel: selectedExamLevel || null,
        isSectionHead: isSectionHead
      };

      const token = currentUser?.token || currentUser?.accessToken;
      const url = editingUser 
        ? `/api/auth/users/${editingUser.id}` 
        : '/api/auth/signup';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setEditingUser(null);
        fetchUsers();
        Swal.fire({
          title: 'Success!',
          text: editingUser 
            ? 'Officer profile updated and jurisdictional transfer executed successfully! (ස්ථාන මාරුවීම සාර්ථකව සිදු කරන ලදී)' 
            : (isPrincipal ? 'Commerce Teacher assigned to your school faculty successfully!' : 'User created successfully.'),
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || (editingUser ? 'Error updating user / transfer' : 'Error creating user'),
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
    if (!isProvincialAdmin) {
      Swal.fire('Unauthorized', 'Only the Provincial Director can delete users.', 'warning');
      return;
    }
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
        const token = currentUser?.token || currentUser?.accessToken;
        const res = await fetch(`/api/auth/users/${id}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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

  const handleResetUserPassword = async (targetUser) => {
    const { value: newPassword } = await Swal.fire({
      title: `Change Password for ${targetUser.name}`,
      text: 'Enter a new secure password (minimum 6 characters):',
      input: 'text',
      inputPlaceholder: 'Enter new password...',
      showCancelButton: true,
      confirmButtonText: 'Update Password',
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#94a3b8',
      inputValidator: (value) => {
        if (!value || value.trim().length < 6) {
          return 'Password must be at least 6 characters long!';
        }
      }
    });

    if (newPassword) {
      try {
        const token = JSON.parse(localStorage.getItem('auth'))?.token;
        const res = await fetch(`/api/auth/users/${targetUser.id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ newPassword: newPassword.trim() })
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire({
            title: 'Password Updated!',
            html: `Password for <b>${targetUser.name}</b> has been changed to:<br/><code style="font-size:16px;color:#d97706;padding:6px 12px;background:#fef3c7;border-radius:8px;display:inline-block;margin-top:10px;font-weight:bold;">${newPassword.trim()}</code><br/><p style="font-size:12px;color:#64748b;margin-top:8px;">Make sure to share this credential with the officer securely.</p>`,
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        } else {
          Swal.fire('Error!', data.message || 'Failed to update password.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'Network error while updating password.', 'error');
      }
    }
  };

  // Role-scoped filtering
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // 1. Role-based jurisdiction scoping
      if (isPrincipal) {
        const matchSchool = (effectiveSchoolId && u.schoolId && String(u.schoolId) === String(effectiveSchoolId)) ||
                            (currentUser?.schoolName && (
                              (u.schoolName && u.schoolName.toLowerCase().includes(currentUser.schoolName.toLowerCase())) ||
                              (u.location && u.location.toLowerCase().includes(currentUser.schoolName.toLowerCase()))
                            ));
        if (!matchSchool) return false;
      } else if (isDivisional) {
        const matchDiv = (effectiveDivisionId && u.divisionId && String(u.divisionId) === String(effectiveDivisionId)) ||
                         (currentUser?.divisionName && (
                           (u.divisionName && u.divisionName.toLowerCase().includes(currentUser.divisionName.toLowerCase())) ||
                           (u.location && u.location.toLowerCase().includes(currentUser.divisionName.toLowerCase()))
                         ));
        if (!matchDiv) return false;
      } else if (isZonal) {
        const matchZone = (effectiveZoneId && u.zoneId && String(u.zoneId) === String(effectiveZoneId)) ||
                          (currentUser?.zoneName && (
                            (u.zoneName && u.zoneName.toLowerCase().includes(currentUser.zoneName.toLowerCase())) ||
                            (u.location && u.location.toLowerCase().includes(currentUser.zoneName.toLowerCase()))
                          ));
        if (!matchZone) return false;
      }

      // 2. Search query filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch = (u.name || '').toLowerCase().includes(q) || 
                              (u.role || '').toLowerCase().includes(q) ||
                              (u.username || '').toLowerCase().includes(q) ||
                              (u.location || '').toLowerCase().includes(q) ||
                              (u.email || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 3. Dropdown role filter
      if (roleFilter && u.role !== roleFilter) return false;

      return true;
    });
  }, [users, isPrincipal, isDivisional, isZonal, effectiveSchoolId, effectiveDivisionId, effectiveZoneId, currentUser, searchQuery, roleFilter]);

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* ── PRESTIGIOUS HEADER (MOBILE-APP COMPACT) ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
            <Shield size={12} className="text-blue-400" />
            <span>{isPrincipal ? 'Faculty & Teacher Assignment' : 'User Provisioning & Transfers'}</span>
          </div>
          <h1 className="text-base sm:text-2xl font-black text-white tracking-tight leading-snug">
            {isPrincipal ? 'School Faculty & Commerce Teacher Assignment' : 'Officer Accounts & Role Permissions'}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl font-medium leading-relaxed hidden sm:block">
            {isPrincipal 
              ? `Assign and manage Commerce teachers for ${currentUser?.schoolName || 'your school'}. Inter-school transfers are authorized exclusively by the Provincial Director.`
              : 'Manage authenticated access credentials, geographical jurisdictions, executive transfers, and administrative privileges for directors, principals, and teachers.'}
          </p>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {isProvincialAdmin && (
              <button 
                type="button"
                onClick={() => setIsSubjectModalOpen(true)}
                className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Add or remove curriculum subjects (Provincial Director Exclusive)"
              >
                <BookOpen size={15} className="text-blue-400" />
                <span>Curriculum Subjects</span>
              </button>
            )}
            <button 
              onClick={isPrincipal ? handleOpenPrincipalAddModal : handleOpenStandardAddModal}
              className="flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>{isPrincipal ? 'Assign Teacher to School' : 'Create New User'}</span>
            </button>
          </div>
          <span className="text-slate-400 text-[10px] font-semibold hidden sm:inline">
            {isPrincipal ? 'School Principal Authority' : (isProvincialAdmin ? 'Executive Transfer & Curriculum Authority' : 'Role Engine Enforced')}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder={isPrincipal ? "Search teachers by name, NIC, email..." : "Search by name, role or location..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs sm:text-sm font-medium"
          />
        </div>
        {!isPrincipal && (
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-slate-700"
          >
            <option value="">All Roles</option>
            {allowedRolesToCreate.map(role => (
              <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>
            ))}
          </select>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User / Officer</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Access</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Location / School</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  {isProvincialAdmin ? 'Executive Actions' : (isPrincipal ? 'Faculty Status' : 'Privileges')}
                </th>
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
                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">{user.name || user.username}</p>
                          {user.username && user.name && user.name !== user.username && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              NIC: {user.username}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5"><Mail size={12} className="mr-1"/>{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {user.isSectionHead || user.role === 'SECTION_HEAD' ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-black border border-teal-200">
                        <Award size={12} className="mr-1.5 text-teal-600" />
                        Commerce Section Head
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                        <Shield size={12} className="mr-1.5" />
                        {ROLE_LABELS[user.role] || user.role}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin size={14} className="mr-2 text-slate-400 shrink-0" />
                      <span>{user.schoolName || user.location}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    {isProvincialAdmin ? (
                      <div className="flex justify-end space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleResetUserPassword(user)}
                          title="Change Officer Password (Provincial Director Only)"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          title="Edit Officer & Executive Transfer (ස්ථාන මාරුවීම්) (Provincial Director Only)"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User (Provincial Director Only)"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : isPrincipal ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        School Faculty (Assigned)
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        Jurisdiction View Only
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <User size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="font-bold text-slate-700">
                      {isPrincipal ? 'No Teachers Assigned Yet' : 'No users found matching your criteria.'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {isPrincipal 
                        ? 'Click "+ Assign Teacher to School" to add Commerce teachers directly to your school faculty.'
                        : 'Try adjusting your filters or search terms.'}
                    </p>
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
                  {isPrincipal 
                    ? 'Assign Commerce Teacher to School'
                    : (editingUser ? 'Edit Officer & Executive Transfer (ස්ථාන මාරුවීම්)' : 'Register New User')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="userForm" onSubmit={handleSaveUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
                      <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
                      <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. j.doe@example.com" className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">NIC (Username)</label>
                      <input 
                        type="text" 
                        required 
                        disabled={!!editingUser}
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
                        className={`w-full px-3 py-1.5 sm:py-2 ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-800'} border ${nicError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                      />
                      {nicError ? (
                        <p className="text-xs text-red-500 mt-1">{nicError}</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">{editingUser ? 'NIC cannot be altered after creation.' : 'NIC will be used for login.'}</p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs sm:text-sm font-bold text-slate-700">{editingUser ? 'New Password (Optional)' : 'Initial Password'}</label>
                        {!editingUser && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Strong Required</span>}
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required={!editingUser} 
                          value={formData.password} 
                          onChange={e => setFormData({...formData, password: e.target.value})} 
                          placeholder={editingUser ? "Leave blank to keep password" : "Create strong password..."} 
                          className="w-full pl-3 pr-10 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Real-time Password Strength Meter */}
                      {(!editingUser || formData.password) && (() => {
                        const strength = getPasswordStrength(formData.password);
                        return (
                          <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-600 text-[10px]">Password Strength:</span>
                              <span className={`text-[10px] ${
                                strength.isStrong 
                                  ? 'text-emerald-600 font-black' 
                                  : strength.passedCount >= 3 
                                    ? 'text-amber-600' 
                                    : 'text-rose-600'
                              }`}>
                                {strength.isStrong ? '✓ Strong Password' : strength.passedCount >= 3 ? 'Medium Strength' : 'Weak Password'}
                              </span>
                            </div>
                            
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  strength.isStrong 
                                    ? 'bg-emerald-500 w-full' 
                                    : strength.passedCount >= 3 
                                      ? 'bg-amber-500 w-3/5' 
                                      : 'bg-rose-500 w-1/5'
                                }`} 
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-slate-500 font-semibold">
                              <span className={strength.length ? 'text-emerald-600 font-bold' : ''}>
                                {strength.length ? '✓' : '•'} 8+ characters
                              </span>
                              <span className={strength.upper ? 'text-emerald-600 font-bold' : ''}>
                                {strength.upper ? '✓' : '•'} Uppercase (A-Z)
                              </span>
                              <span className={strength.lower ? 'text-emerald-600 font-bold' : ''}>
                                {strength.lower ? '✓' : '•'} Lowercase (a-z)
                              </span>
                              <span className={strength.number ? 'text-emerald-600 font-bold' : ''}>
                                {strength.number ? '✓' : '•'} Number (0-9)
                              </span>
                              <span className={`col-span-2 ${strength.special ? 'text-emerald-600 font-bold' : ''}`}>
                                {strength.special ? '✓' : '•'} Special symbol (!@#$%^&*...)
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Role Assignment */}
                  {isPrincipal ? (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Assigned Role</span>
                        <span className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                          <Shield size={14} className="text-emerald-600" />
                          Commerce Teacher (Faculty)
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                        Principal Assignment
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign Role</label>
                      <select 
                        required 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                      >
                        <option value="" disabled>Select a role...</option>
                        {(editingUser ? ALL_ROLES : allowedRolesToCreate).map(role => (
                          <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Scope / Location / Transfer Configuration */}
                  {isPrincipal ? (
                    <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                          Appointed School & Jurisdiction (Locked)
                        </span>
                        <span className="text-[10px] font-extrabold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                          School Fixed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 text-white rounded-lg">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">
                            {currentUser?.schoolName || 'Your School'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {currentUser?.divisionName ? `${currentUser.divisionName} Division • ` : ''}
                            {currentUser?.zoneName ? `${currentUser.zoneName} Zone` : 'North Central Province'}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200/60 text-[10px] text-amber-800 font-medium leading-relaxed bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                        🏛️ <b>Notice on Transfers:</b> Teachers assigned here will be registered to your school faculty. Inter-school or inter-zonal transfers (ස්ථාන මාරුවීම්) can only be executed by the <b>Provincial Director</b>.
                      </div>
                    </div>
                  ) : editingUser && isProvincialAdmin ? (
                    /* Provincial Director Executive Transfer UI */
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 rounded-2xl border border-amber-300 space-y-3.5 shadow-2xs">
                      <div className="flex items-start justify-between border-b border-amber-200/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                              Executive Mandate
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">
                              Official Transfer & Re-assignment (ස්ථාන මාරුවීම්)
                            </h4>
                          </div>
                          <p className="text-[11px] text-amber-900 mt-1 font-medium leading-relaxed">
                            As the Provincial Director, you have exclusive executive authority to reassign or transfer this officer between schools, divisions, or zones.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Transfer District</label>
                          <select 
                            required 
                            value={selectedDistrict}
                            onChange={async (e) => {
                              const dVal = e.target.value;
                              setSelectedDistrict(dVal);
                              setSelectedZone('');
                              setSelectedDivision('');
                              setSelectedSchool('');
                              if (dVal) {
                                const zList = await fetch(`/api/public/zones?districtId=${dVal}`).then(r => r.json());
                                if (Array.isArray(zList)) setZones(zList);
                              }
                            }}
                            className="w-full px-3 py-1.5 sm:py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                          >
                            <option value="" disabled>Select District...</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Zone</label>
                          <select 
                            required={selectedRole !== 'PROVINCIAL_DIRECTOR'}
                            disabled={!selectedDistrict}
                            value={selectedZone}
                            onChange={async (e) => {
                              const zVal = e.target.value;
                              setSelectedZone(zVal);
                              setSelectedDivision('');
                              setSelectedSchool('');
                              if (zVal) {
                                const divList = await fetch(`/api/public/divisions?zoneId=${zVal}`).then(r => r.json());
                                if (Array.isArray(divList)) setDivisions(divList);
                              }
                            }}
                            className="w-full px-3 py-1.5 sm:py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/50 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            <option value="" disabled>Select Zone...</option>
                            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                          </select>
                        </div>

                        {['DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'TEACHER', 'STUDENT'].includes(selectedRole) && (
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Division</label>
                            <select 
                              required 
                              disabled={!selectedZone}
                              value={selectedDivision}
                              onChange={async (e) => {
                                const divVal = e.target.value;
                                setSelectedDivision(divVal);
                                setSelectedSchool('');
                                if (divVal) {
                                  const schList = await fetch(`/api/public/schools?divisionId=${divVal}`).then(r => r.json());
                                  if (Array.isArray(schList)) setSchools(schList);
                                }
                              }}
                              className="w-full px-3 py-1.5 sm:py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/50 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              <option value="" disabled>Select Division...</option>
                              {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                        )}

                        {['PRINCIPAL', 'TEACHER', 'STUDENT'].includes(selectedRole) && (
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Transfer School</label>
                            <select 
                              required 
                              disabled={!selectedDivision}
                              value={selectedSchool}
                              onChange={(e) => setSelectedSchool(e.target.value)}
                              className="w-full px-3 py-1.5 sm:py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/50 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              <option value="" disabled>Select School...</option>
                              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Standard Add User Jurisdiction Dropdowns */
                    selectedRole && selectedRole !== 'PROVINCIAL_DIRECTOR' && (
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
                              onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedZone(''); setSelectedDivision(''); setSelectedSchool(''); }}
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
                              onChange={(e) => { setSelectedZone(e.target.value); setSelectedDivision(''); setSelectedSchool(''); }}
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
                                onChange={(e) => { setSelectedDivision(e.target.value); setSelectedSchool(''); }}
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
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* Teacher Specific Subjects & Level Configuration */}
                  {(selectedRole === 'TEACHER' || (isPrincipal && !editingUser)) && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                      
                      {/* Teacher Designation: Regular vs Section Head */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Teacher Role Designation (ගුරුභවතාගේ තනතුර)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsSectionHead(false)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                              !isSectionHead
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>Regular Teacher</span>
                            <span className="text-[10px] opacity-80">(සාමාන්‍ය ගුරු)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsSectionHead(true)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                              isSectionHead
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>★ Section Head</span>
                            <span className="text-[10px] opacity-80">(වාණිජ අංශ ප්‍රධානී)</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Teacher Subject Specialization</h4>
                        {isProvincialAdmin && (
                          <button
                            type="button"
                            onClick={() => setIsSubjectModalOpen(true)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                            title="Add or Delete Curriculum Subjects"
                          >
                            <BookOpen size={13} />
                            <span>Add / Delete Subjects</span>
                          </button>
                        )}
                      </div>
                      {/* Teaching Level Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Teaching Level</label>
                        <select 
                          required 
                          value={selectedExamLevel}
                          onChange={(e) => {
                            setSelectedExamLevel(e.target.value);
                            setSelectedSubjects([]);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 transition-all"
                        >
                          <option value="" disabled>Select Level</option>
                          <option value="AL">A/L</option>
                          <option value="OL">O/L</option>
                          <option value="BOTH">Both (A/L & O/L)</option>
                        </select>
                      </div>

                      {/* Subject Selection - changes based on teaching level */}
                      {(() => {
                        const isALSubject = (s) => (s?.type || '').toUpperCase().includes('AL') || (s?.type || '').toUpperCase() === 'A/L';
                        const isOLSubject = (s) => (s?.type || '').toUpperCase().includes('OL') || (s?.type || '').toUpperCase() === 'O/L';

                        const alSubjectsList = (subjects && subjects.filter(isALSubject).length > 0)
                          ? subjects.filter(isALSubject)
                          : DEFAULT_SUBJECTS.filter(isALSubject);

                        const olSubjectsList = (subjects && subjects.filter(isOLSubject).length > 0)
                          ? subjects.filter(isOLSubject)
                          : DEFAULT_SUBJECTS.filter(isOLSubject);

                        if (selectedExamLevel === 'BOTH') {
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">A/L Subject <span className="text-blue-500">(Select 1)</span></label>
                                <select
                                  required
                                  value={selectedSubjects.find(id => alSubjectsList.some(s => s.id === id)) || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const olSubjects = selectedSubjects.filter(id => olSubjectsList.some(s => s.id === id));
                                    setSelectedSubjects(val ? [...olSubjects, val] : olSubjects);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                                >
                                  <option value="">Select A/L Subject...</option>
                                  {alSubjectsList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">O/L Subject <span className="text-teal-500">(Select 1)</span></label>
                                <select
                                  required
                                  value={selectedSubjects.find(id => olSubjectsList.some(s => s.id === id)) || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const alSubjects = selectedSubjects.filter(id => alSubjectsList.some(s => s.id === id));
                                    setSelectedSubjects(val ? [...alSubjects, val] : alSubjects);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/50 transition-all font-semibold"
                                >
                                  <option value="">Select O/L Subject...</option>
                                  {olSubjectsList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        } else if (selectedExamLevel) {
                          const currentLevelSubjects = (selectedExamLevel === 'AL' ? alSubjectsList : olSubjectsList);
                          return (
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
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                              >
                                <option value="">Select Subject...</option>
                                {currentLevelSubjects.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  form="userForm"
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-70 cursor-pointer"
                >
                  {loading 
                    ? 'Processing...' 
                    : (isPrincipal 
                        ? 'Assign Teacher to Faculty' 
                        : (editingUser ? 'Save Changes & Execute Transfer' : 'Create User'))}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curriculum Subject Management Modal for Provincial Director */}
      <SubjectManagementModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSubjectsUpdated={() => {
          fetch('/api/public/subjects')
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data) && data.length > 0) setSubjects(data);
            })
            .catch(() => {});
        }}
      />

    </div>
  );
};

export default UserManagement;