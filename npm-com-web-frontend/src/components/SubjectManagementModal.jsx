import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit3, X, Shield, CheckCircle2, AlertCircle, Layers, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_SUBJECTS = [
  { id: 1, code: '21', name: 'Accounting', nameSi: 'ගිණුම්කරණය', type: 'AL', medium: 'All', description: 'Core financial accounting principles and practices.', modules: 'Financial Statements, Cost & Management Accounting, Auditing' },
  { id: 2, code: '22', name: 'Business Studies', nameSi: 'ව්‍යාපාර අධ්‍යයනය', type: 'AL', medium: 'All', description: 'Business environment, commercial law, management, and marketing.', modules: 'Business Environment, Marketing, Human Resource Mgmt' },
  { id: 3, code: '23', name: 'Economics', nameSi: 'ආර්ථික විද්‍යාව', type: 'AL', medium: 'All', description: 'Microeconomic and macroeconomic theory and national policies.', modules: 'Price Mechanism, National Income, Fiscal & Monetary Policy' },
  { id: 4, code: '43', name: 'Information & Communication Technology (ICT)', nameSi: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය', type: 'AL', medium: 'All', description: 'Database systems, Python programming, networking, and web technology.', modules: 'Database Systems, Python Programming, Networking' }
];

const SubjectManagementModal = ({ isOpen, onClose, onSubjectsUpdated }) => {
  const { currentUser } = useAuth();
  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'AL' | 'OL'

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formNameSi, setFormNameSi] = useState('');
  const [formType, setFormType] = useState('AL');
  const [formMedium, setFormMedium] = useState('All');
  const [formDescription, setFormDescription] = useState('');
  const [formModules, setFormModules] = useState('');

  const fetchSubjects = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/public/subjects');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data);
      } else {
        setSubjects(DEFAULT_SUBJECTS);
      }
    } catch (err) {
      console.warn('Error fetching subjects, using defaults:', err);
      setSubjects(DEFAULT_SUBJECTS);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setFormCode('');
    setFormName('');
    setFormNameSi('');
    setFormType('AL');
    setFormMedium('All');
    setFormDescription('');
    setFormModules('');
  };

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setFormCode(sub.code || '');
    setFormName(sub.name || '');
    setFormNameSi(sub.nameSi || '');
    setFormType(sub.type || 'AL');
    setFormMedium(sub.medium || 'All');
    setFormDescription(sub.description || '');
    setFormModules(sub.modules || '');
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      Swal.fire('Required', 'Please enter a subject name.', 'warning');
      return;
    }

    if (!isProvincialAdmin) {
      Swal.fire('Unauthorized', 'Only the Provincial Director can manage subjects.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token || currentUser?.token || currentUser?.accessToken;
      const url = editingId 
        ? `http://localhost:8080/api/locations/subject/${editingId}`
        : 'http://localhost:8080/api/locations/subject';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        code: formCode.trim(),
        name: formName.trim(),
        nameSi: formNameSi.trim(),
        type: formType,
        medium: formMedium,
        description: formDescription.trim(),
        modules: formModules.trim()
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        resetForm();
        await fetchSubjects();
        if (onSubjectsUpdated) onSubjectsUpdated();
        Swal.fire({
          icon: 'success',
          title: editingId ? 'Subject Updated!' : 'Subject Added!',
          text: data.message || `Subject "${formName.trim()}" was successfully saved.`,
          confirmButtonColor: '#3b82f6',
          timer: 2000
        });
      } else {
        Swal.fire('Error', data.message || 'Failed to save subject.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Network error while saving subject.', 'error');
    }
    setLoading(false);
  };

  const handleDeleteSubject = async (sub) => {
    if (!isProvincialAdmin) {
      Swal.fire('Unauthorized', 'Only the Provincial Director can delete subjects.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Subject?',
      html: `Are you sure you want to delete <b>"${sub.name}"</b> (${sub.type})?<br/><span class="text-xs text-rose-500 mt-2 block">If any teachers are assigned to this subject, it will be unlinked from them.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete Subject'
    });

    if (result.isConfirmed) {
      try {
        const token = JSON.parse(localStorage.getItem('auth'))?.token || currentUser?.token || currentUser?.accessToken;
        const res = await fetch(`http://localhost:8080/api/locations/subject/${sub.id}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok) {
          if (editingId === sub.id) resetForm();
          await fetchSubjects();
          if (onSubjectsUpdated) onSubjectsUpdated();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `Subject "${sub.name}" was removed successfully.`,
            confirmButtonColor: '#3b82f6',
            timer: 2000
          });
        } else {
          Swal.fire('Error', data.message || 'Failed to delete subject.', 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Network error while deleting subject.', 'error');
      }
    }
  };

  if (!isOpen) return null;

  const isAL = (s) => (s?.type || '').toUpperCase().includes('AL') || (s?.type || '').toUpperCase() === 'A/L';
  const isOL = (s) => (s?.type || '').toUpperCase().includes('OL') || (s?.type || '').toUpperCase() === 'O/L';

  const alSubjects = subjects.filter(isAL);
  const olSubjects = subjects.filter(isOL);

  const displayedSubjects = activeTab === 'AL' 
    ? alSubjects 
    : activeTab === 'OL' 
      ? olSubjects 
      : subjects;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <BookOpen size={18} />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  <Shield size={10} />
                  <span>Curriculum Management</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Commerce Curriculum & Subject Directory
                </h3>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Provincial Authority Notice */}
            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
              <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Provincial Director Executive Authority:</span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  You can register new Commerce disciplines, update syllabus modules and descriptions, or delete unneeded subjects. Details entered here dynamically reflect across public subject cards, teacher registrations, and provincial analytics.
                </p>
              </div>
            </div>

            {/* Add / Edit Subject Form (Provincial Director Exclusive) */}
            {isProvincialAdmin && (
              <form onSubmit={handleSaveSubject} className="bg-slate-50 border border-slate-200/90 p-3.5 sm:p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    {editingId ? <Edit3 size={14} className="text-indigo-600" /> : <Plus size={14} className="text-blue-600" />}
                    <span>{editingId ? 'Edit Subject Details' : 'Add New Subject'}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Provincial Only
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 21"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject Name (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Accounting"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject Name (Sinhala)</label>
                    <input
                      type="text"
                      placeholder="e.g. ගිණුම්කරණය"
                      value={formNameSi}
                      onChange={(e) => setFormNameSi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Exam Level</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="AL">A/L Commerce</option>
                      <option value="OL">O/L Commerce</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Medium</label>
                    <select
                      value={formMedium}
                      onChange={(e) => setFormMedium(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="All">All Mediums</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-1"
                    >
                      {editingId ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                      <span>{loading ? 'Saving...' : editingId ? 'Update Subject' : 'Add Subject'}</span>
                    </button>
                  </div>

                  {/* Description field */}
                  <div className="sm:col-span-12">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Curriculum Description (Displays on public subjects cards)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Core financial accounting principles, partnership accounts, manufacturing accounts, company accounting, auditing..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* Modules field */}
                  <div className="sm:col-span-12">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Key Syllabus Modules (Comma-separated, e.g. Financial Statements, Cost Accounting, Auditing)</label>
                    <input
                      type="text"
                      placeholder="Module 1, Module 2, Module 3, Module 4"
                      value={formModules}
                      onChange={(e) => setFormModules(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Subject Filters & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({subjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('AL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'AL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  A/L Stream ({alSubjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('OL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'OL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  O/L Stream ({olSubjects.length})
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                {displayedSubjects.length} subjects in catalog
              </span>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedSubjects.map((sub) => {
                const isALStream = isAL(sub);
                const isSelectedForEdit = editingId === sub.id;
                const moduleList = sub.modules 
                  ? sub.modules.split(',').map(m => m.trim()).filter(Boolean) 
                  : [];

                return (
                  <div
                    key={sub.id}
                    className={`p-3.5 bg-white border rounded-2xl shadow-2xs flex flex-col justify-between transition-all group ${
                      isSelectedForEdit ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {sub.code && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-white">
                              #{sub.code}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                              isALStream
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isALStream ? 'A/L' : 'O/L'}
                          </span>
                        </div>

                        {isProvincialAdmin && (
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(sub)}
                              title={`Edit subject "${sub.name}"`}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(sub)}
                              title={`Delete subject "${sub.name}"`}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-slate-900">
                        {sub.name}
                        {sub.nameSi && <span className="text-[11px] font-bold text-blue-600 block">{sub.nameSi}</span>}
                      </h4>

                      {sub.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      )}

                      {moduleList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {moduleList.slice(0, 3).map((m, mIdx) => (
                            <span key={mIdx} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {m}
                            </span>
                          ))}
                          {moduleList.length > 3 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                              +{moduleList.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Medium: <strong className="text-slate-600">{sub.medium || 'All'}</strong></span>
                      {sub.id && <span>ID: {sub.id}</span>}
                    </div>
                  </div>
                );
              })}

              {displayedSubjects.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-400">
                  <BookOpen size={24} className="mx-auto mb-1.5 opacity-30" />
                  <p className="text-xs font-semibold">No subjects found in this category.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubjectManagementModal;
