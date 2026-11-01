import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calculator, TrendingUp, Cpu, Briefcase, FileDown, BarChart3, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import QuickAnalyticsModal from '../../components/QuickAnalyticsModal';

const SubjectsPage = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('al');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    subjectId: null,
    year: '2025'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const alSubjects = [
    {
      code: '21',
      nameEn: 'Accounting',
      nameSi: 'ගිණුම්කරණය',
      nameTa: 'கணக்கியல்',
      image: '/slide_1.png',
      icon: Calculator,
      color: 'from-blue-600 to-indigo-700',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      descriptionEn: 'Core financial accounting principles, partnership accounts, manufacturing accounts, company accounting, auditing, and financial statement analysis.',
      descriptionSi: 'මූල්‍ය ගිණුම්කරණ මූලධර්ම, හවුල් ව්‍යාපාර, නිෂ්පාදන ගිණුම්, සමාගම් ගිණුම්, විගණනය සහ මූල්‍ය ප්‍රකාශන විශ්ලේෂණය පිළිබඳ පූර්ණ න්‍යායාත්මක හා ප්‍රායෝගික අධ්‍යයනය.',
      modules: ['Financial Statements', 'Cost & Management Accounting', 'Company Law & Auditing', 'Ratios & Interpretation'],
      modulesSi: ['මූල්‍ය ප්‍රකාශන සැකසීම', 'පිරිවැය හා කළමනාකරණ ගිණුම්කරණය', 'සමාගම් හා විගණන ප්‍රමිතීන්', 'මූල්‍ය අනුපාත විශ්ලේෂණය']
    },
    {
      code: '22',
      nameEn: 'Business Studies',
      nameSi: 'ව්‍යාපාර අධ්‍යයනය',
      nameTa: 'வணிகக் கல்வி',
      image: '/commerce_students.jpg',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-700',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      descriptionEn: 'Business environment, commercial law, marketing management, human resources, operations, and modern entrepreneurship dynamics in Sri Lanka.',
      descriptionSi: 'ව්‍යාපාර පරිසරය, වාණිජ නීතිය, අලෙවිකරණ කළමනාකරණය, මානව සම්පත්, මෙහෙයුම් සහ ශ්‍රී ලංකාවේ නූතන ව්‍යවසායකත්ව ප්‍රවණතා පිළිබඳ හැදෑරීම.',
      modules: ['Business Environment', 'Marketing & Sales', 'Human Resource Mgmt', 'Banking & Insurance'],
      modulesSi: ['ව්‍යාපාර පරිසරය හා නීතිය', 'අලෙවිකරණ කළමනාකරණය', 'මානව සම්පත් කළමනාකරණය', 'බැංකු හා රක්ෂණ සේවා']
    },
    {
      code: '23',
      nameEn: 'Economics',
      nameSi: 'ආර්ථික විද්‍යාව',
      nameTa: 'பொருளாதாரம்',
      image: '/slide_2.png',
      icon: TrendingUp,
      color: 'from-violet-600 to-purple-700',
      tagColor: 'bg-violet-50 text-violet-700 border-violet-200',
      descriptionEn: 'Microeconomic theory, price mechanism, market structures, macroeconomic stability, fiscal and monetary policies, and international trade in Sri Lanka.',
      descriptionSi: 'ක්ෂුද්‍ර ආර්ථික විද්‍යාව, මිල යාන්ත්‍රණය, වෙළඳපල ව්‍යුහයන්, සාර්ව ආර්ථික ස්ථාවරත්වය, රාජ්‍ය මූල්‍ය හා මූල්‍ය ප්‍රතිපත්ති සහ ජාත්‍යන්තර වෙළඳාම.',
      modules: ['Price Mechanism', 'National Income Accounting', 'Fiscal & Monetary Policy', 'International Trade'],
      modulesSi: ['මිල යාන්ත්‍රණය හා ඉල්ලුම/සැපයුම', 'ජාතික ආදායම් ගිණුම්කරණය', 'මූල්‍ය හා රාජ්‍ය මූල්‍ය ප්‍රතිපත්ති', 'ජාත්‍යන්තර වෙළඳාම හා විදේශ විනිමය']
    },
    {
      code: '43',
      nameEn: 'Information & Communication Technology',
      nameSi: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය (ICT)',
      nameTa: 'தகவல் தொடர்பாடல் தொழில்நுட்பம்',
      image: '/slide_3.png',
      icon: Cpu,
      color: 'from-cyan-600 to-blue-700',
      tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      descriptionEn: 'Database management systems, Python programming, computer networking, systems analysis, e-commerce, and business automation technologies.',
      descriptionSi: 'දත්ත සමුදාය කළමනාකරණය (DBMS), පයිතන් ක්‍රමලේඛනය, ජාලකරණය, පද්ධති විශ්ලේෂණය, ඊ-වාණිජ්‍යය සහ ව්‍යාපාරික ස්වයංක්‍රීයකරණය.',
      modules: ['Database Systems (SQL)', 'Python Programming', 'Networking & Cloud', 'Web Technologies'],
      modulesSi: ['දත්ත සමුදාය පද්ධති (SQL)', 'පයිතන් ක්‍රමලේඛනය', 'පරිගණක ජාලකරණය', 'වෙබ් තාක්ෂණය හා ඊ-වාණිජ්‍යය']
    },
    {
      code: '24',
      nameEn: 'Entrepreneurship Studies',
      nameSi: 'ව්‍යවසායකත්ව අධ්‍යයනය',
      nameTa: 'தொழில்முயற்சி கல்வி',
      image: '/anuradhapura.png',
      icon: Sparkles,
      color: 'from-amber-600 to-orange-700',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      descriptionEn: 'Ideation, startup launch, project formulation, venture capital, financial management for SME enterprises, and sustainable innovation.',
      descriptionSi: 'ව්‍යාපාර අදහස් උත්පාදනය, ආරම්භක ව්‍යාපාර බිහිකිරීම, ව්‍යාපෘති වාර්තාකරණය, සුළු හා මධ්‍ය පරිමාණ මූල්‍යකරණය සහ තිරසර නවෝත්පාදනය.',
      modules: ['Business Ideation', 'Business Plan Formulation', 'SME Financial Management', 'Innovation & Growth'],
      modulesSi: ['ව්‍යාපාර සංකල්ප උත්පාදනය', 'ව්‍යාපාර සැලසුම් සැකසීම', 'සුළු හා මධ්‍ය පරිමාණ මූල්‍යකරණය', 'නවෝත්පාදනය හා ව්‍යාප්තිය']
    }
  ];

  const olSubjects = [
    {
      code: '60',
      nameEn: 'Commerce & Accounting Studies',
      nameSi: 'වාණිජ හා ගිණුම්කරණ අධ්‍යයනය',
      nameTa: 'வணிகமும் கணக்கீட்டுக் கல்வியும்',
      image: '/slide_1.png',
      icon: Calculator,
      color: 'from-blue-600 to-cyan-700',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      descriptionEn: 'Foundational commerce concepts for Grades 10 & 11, double-entry bookkeeping, trial balance, simple financial statements, and consumer awareness.',
      descriptionSi: '10 සහ 11 ශ්‍රේණි සඳහා වාණිජ මූලික සංකල්ප, ද්විත්ව සටහන් ක්‍රමය, ශේෂ පිරික්සුම, සරල මූල්‍ය ප්‍රකාශන, බැංකු සේවා සහ පාරිභෝගික අයිතිවාසිකම්.',
      modules: ['Double Entry Bookkeeping', 'Cash Book & Petty Cash', 'Final Accounts of Sole Trader', 'Trade & Communication'],
      modulesSi: ['ද්විත්ව සටහන් ක්‍රමය', 'මුදල් පොත හා සුළු මුදල් පොත', 'තනි පුද්ගල ව්‍යාපාරික අවසන් ගිණුම්', 'වෙළඳාම හා සන්නිවේදනය']
    },
    {
      code: '61',
      nameEn: 'Entrepreneurship Studies (O/L)',
      nameSi: 'ව්‍යවසායකත්ව අධ්‍යයනය (සාමාන්‍ය පෙළ)',
      nameTa: 'தொழில்முயற்சி (சா/த)',
      image: '/slide_3.png',
      icon: Briefcase,
      color: 'from-teal-600 to-emerald-700',
      tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
      descriptionEn: 'Introduction to entrepreneurial qualities, personal skills, small project design, and basic marketing for junior secondary learners.',
      descriptionSi: 'කනිෂ්ඨ ද්විතීයික සිසුන් සඳහා ව්‍යවසායකත්ව ගුණාංග, පුද්ගල කුසලතා, සරල නිෂ්පාදන ක්‍රියාවලීන් සහ වෙළඳපල හඳුනාගැනීම.',
      modules: ['Entrepreneurial Qualities', 'Small Projects', 'Production Planning', 'Basic Costing'],
      modulesSi: ['ව්‍යවසායකත්ව ගුණාංග', 'කුඩා ව්‍යාපෘති සැලසුම්', 'නිෂ්පාදන සැලසුම්කරණය', 'සරල පිරිවැයකරණය']
    }
  ];

  const currentSubjects = activeTab === 'al' ? alSubjects : olSubjects;

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL EDUCATIONAL IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-center">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/commerce_students.jpg)` }}
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
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'al'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'si' ? 'උසස් පෙළ (A/L)' : 'G.C.E. A/L Stream'}
              </button>
              <button
                onClick={() => setActiveTab('ol')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'ol'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'si' ? 'සාමාන්‍ය පෙළ (O/L)' : 'G.C.E. O/L Stream'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SUBJECT CARDS GRID (ZERO CUTOFF, RICH PHOTOS & MODULES!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>{activeTab === 'al' ? (lang === 'si' ? 'උසස් පෙළ විෂයයන්' : 'G.C.E. A/L Subject Disciplines') : (lang === 'si' ? 'සාමාන්‍ය පෙළ විෂයයන්' : 'G.C.E. O/L Subject Disciplines')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'si' ? 'විෂය ඒකක, පසුගිය ප්‍රශ්න පත්‍ර සහ විභාග විශ්ලේෂණ පහතින් ලබාගන්න.' : 'Select any subject to explore syllabus modules, past examination papers, and analytics.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {currentSubjects.map((sub, idx) => {
            const Icon = sub.icon;
            return (
              <motion.div
                key={sub.code}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo Header */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={sub.image}
                    alt={sub.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                  
                  {/* Top Bar: Icon + Code Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                      Subject Code {sub.code}
                    </span>
                  </div>

                  {/* Title in Header */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-2xl font-black text-white drop-shadow-md">
                      {lang === 'si' ? sub.nameSi : sub.nameEn}
                    </h3>
                    <p className="text-teal-300 text-xs font-bold drop-shadow">
                      {lang === 'si' ? sub.nameEn : sub.nameSi}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Description */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                      {lang === 'si' ? sub.descriptionSi : sub.descriptionEn}
                    </p>

                    {/* Core Competencies / Modules */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                        {lang === 'si' ? 'ප්‍රධාන නිපුණතා හා විෂය ඒකක' : 'Key Syllabus Modules'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(lang === 'si' ? sub.modulesSi : sub.modules).map((mod, mIdx) => (
                          <div key={mIdx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{mod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action CTAs with Context-Aware Filtering */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={`/downloads?subject=${encodeURIComponent(sub.nameEn)}&code=${sub.code}&level=${activeTab}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-4 py-2.5 rounded-xl transition-all"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>{lang === 'si' ? 'ප්‍රශ්න පත්‍ර බාගත කරන්න' : 'Download Papers'}</span>
                    </Link>

                    <button
                      onClick={() => setModalConfig({
                        isOpen: true,
                        title: `${lang === 'si' ? sub.nameSi : sub.nameEn} Analytics`,
                        subtitle: `G.C.E. A/L Commerce Stream • Subject Code: ${sub.code}`,
                        subjectId: sub.code,
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
        </div>
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
