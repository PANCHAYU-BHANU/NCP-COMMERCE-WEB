import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calculator, TrendingUp, Cpu, Briefcase, FileDown, BarChart3, CheckCircle2, Award, Sparkles, Layers } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import QuickAnalyticsModal from '../../components/QuickAnalyticsModal';

const getSubjectVisuals = (name = '', code = '', idx = 0) => {
  const lower = name.toLowerCase();
  if (lower.includes('account')) {
    return {
      icon: Calculator,
      color: 'from-blue-600 to-indigo-700',
      image: '/slide_1.png'
    };
  }
  if (lower.includes('business')) {
    return {
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-700',
      image: '/commerce_students.jpg'
    };
  }
  if (lower.includes('econom')) {
    return {
      icon: TrendingUp,
      color: 'from-violet-600 to-purple-700',
      image: '/slide_2.png'
    };
  }
  if (lower.includes('ict') || lower.includes('inform') || lower.includes('technol')) {
    return {
      icon: Cpu,
      color: 'from-cyan-600 to-blue-700',
      image: '/slide_3.png'
    };
  }
  if (lower.includes('entrepr')) {
    return {
      icon: Sparkles,
      color: 'from-amber-600 to-orange-700',
      image: '/anuradhapura.png'
    };
  }
  const gradients = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-purple-600 to-pink-700',
    'from-amber-600 to-orange-700',
    'from-cyan-600 to-blue-700'
  ];
  const images = ['/slide_1.png', '/slide_2.png', '/slide_3.png', '/commerce_students.jpg'];
  return {
    icon: BookOpen,
    color: gradients[idx % gradients.length],
    image: images[idx % images.length]
  };
};

const SubjectsPage = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('al');
  const [dbSubjects, setDbSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    subjectId: null,
    year: '2025'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/public/subjects');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDbSubjects(data);
      }
    } catch (err) {
      console.warn('Failed to load subjects from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAL = (s) => (s?.type || '').toUpperCase().includes('AL') || (s?.type || '').toUpperCase() === 'A/L';
  const isOL = (s) => (s?.type || '').toUpperCase().includes('OL') || (s?.type || '').toUpperCase() === 'O/L';

  const alSubjects = dbSubjects.filter(isAL);
  const olSubjects = dbSubjects.filter(isOL);
  const currentSubjects = activeTab === 'al' ? alSubjects : olSubjects;

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24">
      {/* ── 1. PRESTIGIOUS HERO BANNER ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[380px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: `url('/commerce_students.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
          <Link
            to="/"
            className="inline-flex items-center text-blue-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-1.5 rounded-full backdrop-blur-md mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>{lang === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/40 to-teal-500/30 border border-teal-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-teal-200 shadow-lg">
                <BookOpen className="w-4 h-4 text-teal-300" />
                <span>{lang === 'si' ? 'ජාතික විෂය මාලාව හා සම්පත් කේන්ද්‍රය' : 'National Curriculum & Academic Syllabi'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {lang === 'si' ? 'වාණිජ විෂය ධාරාව' : 'Commerce Stream Disciplines'}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                {lang === 'si'
                  ? 'උතුරු මැද පළාතේ අනුරාධපුර හා පොළොන්නරුව දිස්ත්‍රික්කවල පාසල් සඳහා නියමිත නිල උසස් පෙළ හා සාමාන්‍ය පෙළ වාණිජ විෂය මාලා, නිපුණතා සහ අධ්‍යයන ද්‍රව්‍ය.'
                  : 'Comprehensive overview of G.C.E. A/L & O/L commerce disciplines, core competency modules, past papers, and provincial performance indicators.'}
              </p>
            </div>

            {/* Stream Tab Switcher */}
            <div className="flex bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl flex-shrink-0">
              <button
                onClick={() => setActiveTab('al')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === 'al'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'si' ? `උසස් පෙළ (A/L) [${alSubjects.length}]` : `G.C.E. A/L Stream (${alSubjects.length})`}
              </button>
              <button
                onClick={() => setActiveTab('ol')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === 'ol'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'si' ? `සාමාන්‍ය පෙළ (O/L) [${olSubjects.length}]` : `G.C.E. O/L Stream (${olSubjects.length})`}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DYNAMIC SUBJECT CARDS GRID ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>
                {activeTab === 'al'
                  ? (lang === 'si' ? `උසස් පෙළ විෂයයන් (${alSubjects.length})` : `G.C.E. A/L Subject Disciplines (${alSubjects.length})`)
                  : (lang === 'si' ? `සාමාන්‍ය පෙළ විෂයයන් (${olSubjects.length})` : `G.C.E. O/L Subject Disciplines (${olSubjects.length})`)}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'si' ? 'විෂය ඒකක, පසුගිය ප්‍රශ්න පත්‍ර සහ විභාග විශ්ලේෂණ පහතින් ලබාගන්න.' : 'Select any subject to explore syllabus modules, past examination papers, and analytics.'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-bold text-slate-500 mt-3">Loading curriculum directory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {currentSubjects.map((sub, idx) => {
              const visuals = getSubjectVisuals(sub.name, sub.code, idx);
              const Icon = visuals.icon;
              const cardImage = sub.imageUrl || visuals.image;
              const cardColor = sub.color || visuals.color;

              const moduleList = sub.modules
                ? (typeof sub.modules === 'string' ? sub.modules.split(',').map(m => m.trim()).filter(Boolean) : sub.modules)
                : [];
              const moduleListSi = sub.modulesSi
                ? (typeof sub.modulesSi === 'string' ? sub.modulesSi.split(',').map(m => m.trim()).filter(Boolean) : sub.modulesSi)
                : moduleList;

              const displayModules = (lang === 'si' && moduleListSi.length > 0) ? moduleListSi : moduleList;
              const displayName = lang === 'si' ? (sub.nameSi || sub.name) : sub.name;
              const displaySubName = lang === 'si' ? sub.name : (sub.nameSi || sub.nameTa || '');
              const displayDescription = lang === 'si' ? (sub.descriptionSi || sub.description) : (sub.description || sub.descriptionSi);

              return (
                <motion.div
                  key={sub.id || sub.code || idx}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Photo Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={cardImage}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.src = '/slide_1.png'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                    {/* Top Bar: Icon + Code Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cardColor} text-white flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                        {sub.code ? `Subject Code ${sub.code}` : `Level: ${sub.type}`}
                      </span>
                    </div>

                    {/* Title in Header */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-2xl font-black text-white drop-shadow-md">
                        {displayName}
                      </h3>
                      {displaySubName && (
                        <p className="text-teal-300 text-xs font-bold drop-shadow">
                          {displaySubName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Description */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                        {displayDescription || (lang === 'si' ? 'විෂය මාලා විස්තර ඉක්මනින් එක් කරනු ලැබේ.' : 'Curriculum overview for this accredited discipline.')}
                      </p>

                      {/* Core Competencies / Modules */}
                      {displayModules.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                            {lang === 'si' ? 'ප්‍රධාන නිපුණතා හා විෂය ඒකක' : 'Key Syllabus Modules'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {displayModules.map((mod, mIdx) => (
                              <div key={mIdx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{mod}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action CTAs */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <Link
                        to={`/downloads?subject=${encodeURIComponent(sub.name)}&code=${sub.code || ''}&level=${activeTab}`}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-4 py-2.5 rounded-xl transition-all"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>{lang === 'si' ? 'ප්‍රශ්න පත්‍ර බාගත කරන්න' : 'Download Papers'}</span>
                      </Link>

                      <button
                        onClick={() => setModalConfig({
                          isOpen: true,
                          title: `${displayName} Analytics`,
                          subtitle: `G.C.E. ${sub.type} Commerce Stream • Subject Code: ${sub.code || sub.name}`,
                          subjectId: sub.id || sub.code,
                          year: '2025'
                        })}
                        className="inline-flex items-center space-x-1.5 text-xs font-black text-slate-700 hover:text-white bg-slate-100 hover:bg-blue-600 px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{lang === 'si' ? 'ක්ෂණික ප්‍රතිඵල (Analytics)' : 'Instant Analytics'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {currentSubjects.length === 0 && (
              <div className="col-span-2 py-16 text-center bg-white rounded-3xl border border-slate-200">
                <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-black text-slate-800">No subjects currently registered in this stream</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Accredited subjects added by the Provincial Directorate will automatically show up here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Analytics Popup Modal for Selected Subject */}
      <QuickAnalyticsModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        subjectId={modalConfig.subjectId}
        initialYear={modalConfig.year}
      />
    </div>
  );
};

export default SubjectsPage;
