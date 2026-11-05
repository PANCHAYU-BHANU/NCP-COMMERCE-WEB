import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Download, FileText, Search, BookOpen, Layers, 
  Map, Sparkles, Filter, Lock, Globe, ExternalLink,
  GraduationCap, Plus, RefreshCw, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ResourceRepo = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);
  const isTeacher = ['TEACHER', 'SECTION_HEAD'].includes(currentUser?.role);

  const tabs = [
    { id: 'ALL', label: 'All Resources', icon: Layers },
    { id: 'PAST_PAPER', label: 'A/L Past Papers', icon: GraduationCap },
    { id: 'TERM_TEST', label: 'Term Test Papers', icon: FileText },
    { id: 'UNIT_TEST', label: 'Unit Test Papers', icon: BookOpen },
    { id: 'OTHER_PROVINCE', label: 'Other Province Papers', icon: Map },
    { id: 'OL', label: 'O/L Materials', icon: BookOpen }
  ];

  const fetchResourcesData = async () => {
    setIsLoading(true);
    try {
      const [resResources, resSubjects] = await Promise.all([
        api.get('/resources/list'),
        api.get('/public/subjects')
      ]);
      if (resResources.data && Array.isArray(resResources.data)) {
        setResources(resResources.data);
      }
      if (resSubjects.data && Array.isArray(resSubjects.data)) {
        setSubjects(resSubjects.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesData();
  }, []);

  // Filter resources based on tab, subject, level, and search query
  const filteredResources = resources.filter((res) => {
    // 1. Tab filter
    if (activeTab === 'OL') {
      if (res.examLevel !== 'OL') return false;
    } else if (activeTab !== 'ALL') {
      if (res.resourceType !== activeTab) return false;
    }

    // 2. Subject filter
    if (selectedSubject !== 'ALL') {
      if (!res.subject || String(res.subject.id) !== String(selectedSubject)) {
        return false;
      }
    }

    // 3. Level filter
    if (selectedLevel !== 'ALL') {
      if (res.examLevel !== selectedLevel) return false;
    }

    // 4. Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = res.title?.toLowerCase().includes(q);
      const subjectMatch = res.subject?.name?.toLowerCase().includes(q);
      const yearMatch = String(res.examYear || '').includes(q);
      const typeMatch = res.resourceType?.toLowerCase().includes(q);
      if (!titleMatch && !subjectMatch && !yearMatch && !typeMatch) {
        return false;
      }
    }

    return true;
  });

  const getSubjectBadgeColor = (subjectName = '') => {
    const s = subjectName.toLowerCase();
    if (s.includes('account')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s.includes('business')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (s.includes('eco')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s.includes('ict') || s.includes('tech')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getResourceTypeBadge = (type) => {
    switch(type) {
      case 'PAST_PAPER':
        return { label: 'A/L Past Paper', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'TERM_TEST':
        return { label: 'Term Test Paper', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'UNIT_TEST':
        return { label: 'Unit Test Paper', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'OTHER_PROVINCE':
        return { label: 'Other Province Paper', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'MARKING_SCHEME':
        return { label: 'Marking Scheme', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: type || 'Resource', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6 pb-12">
      
      {/* ── HEADER BANNER (MOBILE-APP COMPACT) ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 border border-blue-400/30 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 text-blue-300">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Resource Repository</span>
            </div>
            <h1 className="text-base sm:text-2xl font-black text-white tracking-tight leading-snug">
              Educational Resources & Paper Repository
            </h1>
            <p className="text-slate-300 text-xs mt-0.5 max-w-2xl font-medium hidden sm:block">
              Download official provincial term tests, modular unit evaluations, national past papers, and confidential teacher marking schemes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={fetchResourcesData}
              disabled={isLoading}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] sm:text-xs rounded-xl flex items-center space-x-1 border border-white/15 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {isProvincialAdmin && (
              <Link
                to="/dashboard/content"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus size={13} />
                <span>Upload Paper</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/80 space-y-3">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 p-1 bg-slate-100 rounded-xl sm:rounded-2xl w-full sm:w-fit no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar (Compact Native Mobile Controls) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-8 sm:pl-9 pr-7 py-1.5 sm:py-2 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-bold text-slate-800 transition-all"
              placeholder="Search title, subject, year..."
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject & Level Filters (Side-by-side on Mobile) */}
          <div className="grid grid-cols-2 gap-2 sm:contents">
            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none truncate cursor-pointer"
              >
                <option value="ALL">All Subjects (සියල්ල)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none truncate cursor-pointer"
              >
                <option value="ALL">All Levels (සියල්ල)</option>
                <option value="AL">A/L (උසස් පෙළ)</option>
                <option value="OL">O/L (සා/පෙළ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Tag & Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Showing:</span>
            <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
            </span>
            {activeTab !== 'ALL' && (
              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                Tab: {tabs.find(t => t.id === activeTab)?.label}
              </span>
            )}
            {selectedSubject !== 'ALL' && (
              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                Subject: {subjects.find(s => String(s.id) === String(selectedSubject))?.name}
              </span>
            )}
          </div>

          {(activeTab !== 'ALL' || selectedSubject !== 'ALL' || selectedLevel !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setActiveTab('ALL');
                setSelectedSubject('ALL');
                setSelectedLevel('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* ── RESOURCES GRID ── */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Loading resources from provincial repository...</h4>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-black text-slate-800 mb-1">
            No Resources Found Matching Filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 font-medium">
            There are no documents matching your selected tab, subject, or search criteria. Try selecting another category or resetting filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setActiveTab('ALL');
              setSelectedSubject('ALL');
              setSelectedLevel('ALL');
              setSearchQuery('');
            }}
          >
            Clear Filters & View All
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const typeBadge = getResourceTypeBadge(res.resourceType);
            const isConfidential = res.targetAudience === 'TEACHERS_ONLY';

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isConfidential 
                    ? 'border-amber-200/90 bg-gradient-to-b from-amber-50/20 to-white' 
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>

                    {isConfidential ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Lock size={10} />
                        <span>Teachers & Head Only</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        <Globe size={10} />
                        <span>Public</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Subject */}
                  <div className="space-y-1.5 mb-4">
                    <h3 className="font-black text-sm text-slate-900 line-clamp-2 leading-snug">
                      {res.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getSubjectBadgeColor(res.subject?.name)}`}>
                        {res.subject?.name || 'General Commerce'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {res.examYear ? `${res.examYear} A/L` : 'Syllabus Core'}
                      </span>
                      {res.examLevel && (
                        <span className="text-[11px] text-slate-400 font-semibold">
                          • {res.examLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {res.uploadedAt ? new Date(res.uploadedAt).toLocaleDateString() : 'Active'}
                  </span>

                  {res.fileUrl ? (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No File Linked</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ResourceRepo;
