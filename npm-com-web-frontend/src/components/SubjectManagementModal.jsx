import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit3, X, Shield, CheckCircle2, AlertCircle, Layers, Palette, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const COLOR_PRESETS = [
  { label: 'Royal Blue', value: 'from-blue-600 to-indigo-700', bg: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
  { label: 'Emerald Teal', value: 'from-emerald-600 to-teal-700', bg: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
  { label: 'Violet Purple', value: 'from-violet-600 to-purple-700', bg: 'bg-gradient-to-r from-violet-600 to-purple-700' },
  { label: 'Cyan Blue', value: 'from-cyan-600 to-blue-700', bg: 'bg-gradient-to-r from-cyan-600 to-blue-700' },
  { label: 'Amber Orange', value: 'from-amber-600 to-orange-700', bg: 'bg-gradient-to-r from-amber-600 to-orange-700' },
  { label: 'Rose Pink', value: 'from-rose-600 to-pink-700', bg: 'bg-gradient-to-r from-rose-600 to-pink-700' },
];

const IMAGE_PRESETS = [
  { label: 'Accounting & Ledger', value: '/slide_1.png' },
  { label: 'Commerce Students Group', value: '/commerce_students.jpg' },
  { label: 'Economics & Markets', value: '/slide_2.png' },
  { label: 'ICT & Technology Lab', value: '/slide_3.png' },
  { label: 'Regional Heritage (Anuradhapura)', value: '/anuradhapura.png' },
];

const SubjectManagementModal = ({ isOpen, onClose, onSubjectsUpdated }) => {
  const { currentUser } = useAuth();
  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'AL' | 'OL'

  // Comprehensive Form State
  const [editingId, setEditingId] = useState(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formNameSi, setFormNameSi] = useState('');
  const [formNameTa, setFormNameTa] = useState('');
  const [formType, setFormType] = useState('AL');
  const [formMedium, setFormMedium] = useState('All');
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionSi, setFormDescriptionSi] = useState('');
  const [formModules, setFormModules] = useState('');
  const [formModulesSi, setFormModulesSi] = useState('');
  const [formColor, setFormColor] = useState('from-blue-600 to-indigo-700');
  const [formImageUrl, setFormImageUrl] = useState('/slide_1.png');

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/public/subjects');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data);
      }
    } catch (err) {
      console.warn('Error fetching subjects:', err);
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
    setFormNameTa('');
    setFormType('AL');
    setFormMedium('All');
    setFormDescription('');
    setFormDescriptionSi('');
    setFormModules('');
    setFormModulesSi('');
    setFormColor('from-blue-600 to-indigo-700');
    setFormImageUrl('/slide_1.png');
  };

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setFormCode(sub.code || '');
    setFormName(sub.name || '');
    setFormNameSi(sub.nameSi || '');
    setFormNameTa(sub.nameTa || '');
    setFormType(sub.type || 'AL');
    setFormMedium(sub.medium || 'All');
    setFormDescription(sub.description || '');
    setFormDescriptionSi(sub.descriptionSi || '');
    setFormModules(sub.modules || '');
    setFormModulesSi(sub.modulesSi || '');
    setFormColor(sub.color || 'from-blue-600 to-indigo-700');
    setFormImageUrl(sub.imageUrl || '/slide_1.png');
    // Scroll form into view
    const formElem = document.getElementById('subject-manage-form');
    if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      Swal.fire('Required', 'Please enter a subject name in English.', 'warning');
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
        ? `/api/locations/subject/${editingId}`
        : '/api/locations/subject';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        code: formCode.trim(),
        name: formName.trim(),
        nameSi: formNameSi.trim(),
        nameTa: formNameTa.trim(),
        type: formType,
        medium: formMedium,
        description: formDescription.trim(),
        descriptionSi: formDescriptionSi.trim(),
        modules: formModules.trim(),
        modulesSi: formModulesSi.trim(),
        color: formColor,
        imageUrl: formImageUrl
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
          text: data.message || `Subject "${formName.trim()}" was successfully saved with complete curriculum details.`,
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
      html: `Are you sure you want to delete <b>"${sub.name}"</b> (${sub.type})?<br/><span class="text-xs text-rose-500 mt-2 block">If any teachers are assigned to this subject, it will be unlinked safely.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete Subject'
    });

    if (result.isConfirmed) {
      try {
        const token = JSON.parse(localStorage.getItem('auth'))?.token || currentUser?.token || currentUser?.accessToken;
        const res = await fetch(`/api/locations/subject/${sub.id}`, {
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
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  <Shield size={10} />
                  <span>Provincial Curriculum Directorate</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Commerce Subjects & Curriculum Management
                </h3>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Provincial Authority Notice */}
            <div className="p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-blue-950">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-blue-900">පළාත් අධ්‍යාපන අධ්‍යක්ෂ විධායක බලතල (Provincial Director Exclusive):</span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  වාණිජ විෂය ධාරාව යටතේ නව විෂයයන් එක් කිරීම, විෂය නිර්දේශ විස්තර (Descriptions), ප්‍රධාන මොඩියුල (Key Syllabus Modules), තේමා වර්ණ සහ ආවරණ ඡායාරූප යාවත්කාලීන කිරීම මෙතැනින් සිදුකළ හැක.
                </p>
              </div>
            </div>

            {/* Add / Edit Subject Form (Provincial Director Exclusive) */}
            {isProvincialAdmin && (
              <form id="subject-manage-form" onSubmit={handleSaveSubject} className="bg-slate-50 border border-slate-200/90 p-4 sm:p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    {editingId ? <Edit3 size={15} className="text-indigo-600" /> : <Plus size={15} className="text-blue-600" />}
                    <span>{editingId ? 'Edit Subject Details (විෂය විස්තර සංස්කරණය)' : 'Add New Subject (නව විෂයයක් එක් කරන්න)'}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Provincial Director
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Code (අංකය)</label>
                    <input
                      type="text"
                      placeholder="e.g. 21"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Name (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Accounting"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Name (සිංහල)</label>
                    <input
                      type="text"
                      placeholder="e.g. ගිණුම්කරණය"
                      value={formNameSi}
                      onChange={(e) => setFormNameSi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Name (தமிழ்)</label>
                    <input
                      type="text"
                      placeholder="e.g. கணக்கியல்"
                      value={formNameTa}
                      onChange={(e) => setFormNameTa(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Exam Level (විභාග මට්ටම)</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="AL">G.C.E. A/L Commerce</option>
                      <option value="OL">G.C.E. O/L Commerce</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Medium (මාධ්‍යය)</label>
                    <select
                      value={formMedium}
                      onChange={(e) => setFormMedium(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="All">All Mediums (සියලු මාධ්‍ය)</option>
                      <option value="Sinhala">Sinhala (සිංහල)</option>
                      <option value="Tamil">Tamil (දෙමළ)</option>
                      <option value="English">English (ඉංග්‍රීසි)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Palette size={12} className="text-blue-600" />
                      <span>Card Theme / Color</span>
                    </label>
                    <select
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {COLOR_PRESETS.map((c, idx) => (
                        <option key={idx} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <ImageIcon size={12} className="text-indigo-600" />
                      <span>Cover Image</span>
                    </label>
                    <select
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {IMAGE_PRESETS.map((img, idx) => (
                        <option key={idx} value={img.value}>{img.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Descriptions */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Curriculum Description (English)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Core financial accounting principles, partnership accounts, manufacturing accounts..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">විෂය නිර්දේශ විස්තරය (සිංහල)</label>
                    <textarea
                      rows={2}
                      placeholder="උදා: මූල්‍ය ගිණුම්කරණ මූලධර්ම, හවුල් ව්‍යාපාර, නිෂ්පාදන ගිණුම්..."
                      value={formDescriptionSi}
                      onChange={(e) => setFormDescriptionSi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* Modules */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Key Modules (English, comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Financial Statements, Cost Accounting, Auditing"
                      value={formModules}
                      onChange={(e) => setFormModules(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ප්‍රධාන මොඩියුල (සිංහල, කොමා මගින් වෙන්කරන්න)</label>
                    <input
                      type="text"
                      placeholder="උදා: මූල්‍ය ප්‍රකාශන, පිරිවැය ගිණුම්කරණය, විගණනය"
                      value={formModulesSi}
                      onChange={(e) => setFormModulesSi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-1.5"
                  >
                    {editingId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                    <span>{loading ? 'Saving...' : editingId ? 'Save Updated Subject' : 'Publish & Save Subject'}</span>
                  </button>
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
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Disciplines ({subjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('AL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'AL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  A/L Commerce ({alSubjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('OL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'OL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  O/L Commerce ({olSubjects.length})
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {displayedSubjects.length} subjects registered in North Central Province
              </span>
            </div>

            {/* Registered Subjects List */}
            <div className="space-y-2.5">
              {displayedSubjects.map((sub) => {
                const subAL = isAL(sub);
                return (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-xs group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sub.color || (subAL ? 'from-purple-600 to-indigo-700' : 'from-emerald-600 to-teal-700')} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}>
                        {sub.code || (subAL ? 'AL' : 'OL')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-slate-900 text-sm">{sub.name}</h5>
                          {sub.nameSi && (
                            <span className="text-xs font-semibold text-slate-600">({sub.nameSi})</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subAL ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {sub.type || 'AL'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {sub.medium || 'All'} Medium
                          </span>
                        </div>
                        {sub.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
                            {sub.description}
                          </p>
                        )}
                        {sub.modules && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400">Modules:</span>
                            {sub.modules.split(',').slice(0, 3).map((m, mIdx) => (
                              <span key={mIdx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                {m.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {isProvincialAdmin && (
                      <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => startEdit(sub)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(sub)}
                          className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubjectManagementModal;
