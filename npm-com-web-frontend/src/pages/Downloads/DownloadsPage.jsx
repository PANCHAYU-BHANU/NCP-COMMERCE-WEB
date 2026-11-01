import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, BookOpen, GraduationCap, FileText, FileDown, Layers, ArrowLeft, Map, Filter, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DownloadsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramSubject = searchParams.get('subject') || '';
  const paramCode = searchParams.get('code') || '';
  const paramLevel = (searchParams.get('level') || 'al').toUpperCase();
  const paramZone = searchParams.get('zoneName') || searchParams.get('zone') || '';
  const paramDivision = searchParams.get('divisionName') || searchParams.get('division') || '';
  const paramSchool = searchParams.get('schoolName') || searchParams.get('school') || '';

  const [activeTab, setActiveTab] = useState('PAST_PAPER');
  const [activeLevel, setActiveLevel] = useState(paramLevel === 'OL' ? 'OL' : 'AL');
  const [subjectFilter, setSubjectFilter] = useState(paramSubject);
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  useEffect(() => {
    if (paramLevel === 'OL' || paramLevel === 'AL') {
      setActiveLevel(paramLevel);
    }
    if (paramSubject) {
      setSubjectFilter(paramSubject);
    }
  }, [location.search]);

  const fetchData = async () => {
    try {
      const [resResources, resSubjects] = await Promise.all([
        fetch('http://localhost:8080/api/public/resources'),
        fetch('http://localhost:8080/api/public/subjects')
      ]);
      const dataResources = await resResources.json();
      const dataSubjects = await resSubjects.json();
      setResources(dataResources);
      setSubjects(dataSubjects);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const tabs = [
    { id: 'PAST_PAPER', label: 'Past Papers', icon: FileText },
    { id: 'TERM_TEST', label: 'Term Test Papers', icon: Layers },
    { id: 'UNIT_TEST', label: 'Unit Test Papers', icon: BookOpen },
    { id: 'OTHER_PROVINCE', label: 'Other Province Papers', icon: Map },
  ];

  const levels = [
    { id: 'AL', label: 'A/L Subjects', icon: GraduationCap },
    { id: 'OL', label: 'O/L Subjects', icon: BookOpen },
  ];

  const getSubjectColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-orange-500 to-orange-600',
      'from-rose-500 to-rose-600'
    ];
    return colors[index % colors.length];
  };

  const renderSubjectCard = (subject, index) => {
    // Filter resources for this specific subject, active tab (type), and level
    const subjectResources = resources.filter(
      r => r.subject?.id === subject.id && r.resourceType === activeTab && r.examLevel === activeLevel
    );

    // Group by year
    const groupedByYear = subjectResources.reduce((acc, curr) => {
      if (!acc[curr.examYear]) acc[curr.examYear] = [];
      acc[curr.examYear].push(curr);
      return acc;
    }, {});

    const years = Object.keys(groupedByYear).sort((a, b) => b - a); // descending

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        key={subject.id}
        className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col group"
      >
        <div className={`h-2 w-full bg-gradient-to-r ${getSubjectColor(index)}`}></div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-1">{subject.name}</h3>
            {subject.nameSi && <p className="text-sm font-semibold text-slate-500 mb-6">{subject.nameSi}</p>}
          </div>
          
          <div className="space-y-3">
            {years.length > 0 ? (
              years.map((year) => (
                <div key={year}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{year}</p>
                  {groupedByYear[year].map(res => (
                    <a 
                      key={res.id} 
                      href={res.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 mb-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/btn"
                    >
                      <span className="font-bold text-slate-700 text-sm truncate pr-2">{res.title}</span>
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-colors">
                        <FileDown className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic text-center py-4">No resources available yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL EDUCATIONAL IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-center">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/slide_3.png)` }}
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 w-full">
          <Link
            to="/"
            className="inline-flex items-center text-blue-300 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-1.5 rounded-full backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/40 to-teal-500/30 border border-teal-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-teal-200 shadow-lg">
                <Download className="w-4 h-4 text-teal-300" />
                <span>Provincial Examination Repository</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                Resource Downloads
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Official North Central Province term test papers, G.C.E. A/L & O/L past papers, model questions, and revision modules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN DOWNLOADS CONTENT (ZERO OVERLAP!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ACTIVE FILTER BANNER IF PARAMETERS PASSED */}
        {(subjectFilter || paramZone || paramDivision || paramSchool) && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-indigo-500/10 border border-blue-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
              <span className="flex items-center text-blue-700">
                <Filter className="w-4 h-4 mr-1.5" />
                Active Context Filter:
              </span>
              {subjectFilter && (
                <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black">
                  <span>Subject: {subjectFilter}</span>
                  <button onClick={() => setSubjectFilter('')} className="hover:text-blue-900 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {paramZone && (
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-black">
                  Zone: {paramZone}
                </span>
              )}
              {paramDivision && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-black">
                  Division: {paramDivision}
                </span>
              )}
              {paramSchool && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-black">
                  School: {paramSchool}
                </span>
              )}
            </div>
            {subjectFilter && (
              <button
                onClick={() => setSubjectFilter('')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear Subject Filter (Show All)
              </button>
            )}
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-3xl p-2 shadow-md hover:shadow-xl transition-shadow flex flex-col md:flex-row mb-8 border border-slate-200/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'opacity-70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* LEVEL SELECTOR */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-200/50 p-1.5 rounded-full">
            {levels.map((level) => {
              const isActive = activeLevel === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setActiveLevel(level.id)}
                  className={`flex items-center space-x-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-white text-slate-800 shadow-md scale-105' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <level.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                  <span>{level.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT GRID */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + activeLevel + subjectFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {subjects
              .filter(s => {
                const matchesLevel = s.type === activeLevel;
                if (!matchesLevel) return false;
                if (subjectFilter) {
                  const matchName = s.name.toLowerCase().includes(subjectFilter.toLowerCase()) ||
                                    (s.nameSi && s.nameSi.toLowerCase().includes(subjectFilter.toLowerCase()));
                  const matchCode = paramCode && String(s.code) === String(paramCode);
                  return matchName || matchCode;
                }
                return true;
              })
              .map((subject, index) => renderSubjectCard(subject, index))}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DownloadsPage;
