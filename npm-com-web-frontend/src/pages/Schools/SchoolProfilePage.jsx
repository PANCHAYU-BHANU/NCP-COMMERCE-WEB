import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, School, Building2, MapPin, Users, UserCog, Award, 
  TrendingUp, Download, BarChart3, Phone, Mail, GraduationCap, 
  BookOpen, CheckCircle2, Trophy, Sparkles, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import QuickAnalyticsModal from '../../components/QuickAnalyticsModal';

const SchoolProfilePage = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [yearlyProgression, setYearlyProgression] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetch(`/api/public/schools/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("School not found");
        return res.json();
      })
      .then(data => {
        setSchoolData(data);
      })
      .catch(err => {
        console.error("Error fetching school profile:", err);
        // Fallback default structure if school ID is dynamic or mock
        fetch(`/api/public/schools`)
          .then(r => r.json())
          .then(allSchools => {
            const found = allSchools.find(s => String(s.id) === String(id));
            if (found) {
              setSchoolData({
                school: found,
                principal: null,
                sectionHead: null,
                teachers: [],
                studentCounts: [],
                results: []
              });
            }
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));

    // Dynamic 5-year comparison from DB
    fetch(`/api/public/statistics/yearly-comparison?level=school&id=${id}&limit=5`)
      .then(r => r.json())
      .then(res => {
        if (res && res.data) setYearlyProgression(res.data);
      })
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-bold">Loading school profile and faculty records...</p>
      </div>
    );
  }

  const school = schoolData?.school || {
    id: id,
    name: "School",
    address: "North Central Province"
  };

  const division = school?.division || { id: 1, name: "Division" };
  const zone = division?.zone || { id: 1, name: "Zone" };
  const district = zone?.district || { id: 1, name: "District" };

  const principal = schoolData?.principal || null;
  const sectionHead = schoolData?.sectionHead || null;
  const teachers = schoolData?.teachers || [];

  // Student counts calculation
  const studentCounts = schoolData?.studentCounts || [];
  const g12Male = studentCounts.find(s => s.grade === 12 && s.gender === 'MALE')?.count || 0;
  const g12Female = studentCounts.find(s => s.grade === 12 && s.gender === 'FEMALE')?.count || 0;
  const g13Male = studentCounts.find(s => s.grade === 13 && s.gender === 'MALE')?.count || 0;
  const g13Female = studentCounts.find(s => s.grade === 13 && s.gender === 'FEMALE')?.count || 0;

  const totalG12 = g12Male + g12Female;
  const totalG13 = g13Male + g13Female;
  const totalCommerceStudents = totalG12 + totalG13;
  const totalBoys = g12Male + g13Male;
  const totalGirls = g12Female + g13Female;

  const latestStats = yearlyProgression.length > 0 ? yearlyProgression[yearlyProgression.length - 1] : null;
  const passRateCurrent = latestStats ? latestStats.passRate : 0;

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24">
      
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL LANDMARK IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[420px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/anuradhapura.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 w-full">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold text-slate-300">
            <Link to="/" className="hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15">
              Home
            </Link>
            <span>/</span>
            <Link to={`/districts/${district.name?.toLowerCase().includes('polonnaruwa') ? 'polonnaruwa' : 'anuradhapura'}`} className="hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15">
              {district.name} District
            </Link>
            <span>/</span>
            <span className="text-teal-300">{zone.name} Zone</span>
            <span>/</span>
            <span className="text-indigo-300">{division.name} Division</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/40 to-teal-500/30 border border-teal-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 text-teal-200 shadow-lg">
                <School className="w-4 h-4 text-teal-300" />
                <span>1AB National School • Commerce Department</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {school.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{school.address || `${division.name}, ${zone.name}`}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Census ID: {school.id}</span>
                </span>
              </div>
            </div>

            {/* Quick KPI stats in header */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/15 p-4 rounded-3xl shadow-2xl flex-shrink-0">
              <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                <Users className="w-4 h-4 text-blue-400" />
                <span><strong>{totalCommerceStudents}</strong> {lang === 'si' ? 'වාණිජ සිසුන්' : 'Commerce Students'}</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold">
                <GraduationCap className="w-4 h-4 text-teal-400" />
                <span><strong>{teachers.length}+</strong> {lang === 'si' ? 'සුදුසුකම්ලත් ආචාර්යවරු' : 'Faculty Teachers'}</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                <Award className="w-4 h-4 text-emerald-400" />
                <span><strong>{passRateCurrent}%</strong> {lang === 'si' ? 'උසස් පෙළ සාමාර්ථ %' : 'A/L Pass Rate'}</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span><strong>Rank #1</strong> {lang === 'si' ? 'කොට්ඨාස ශ්‍රේණිගත කිරීම' : 'Division Commerce Rank'}</span>
              </div>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{lang === 'si' ? 'ක්ෂණික ප්‍රතිඵල සහ ස්ත්‍රී/පුරුෂ විශ්ලේෂණය' : 'Instant Results & Gender Analytics'}</span>
            </button>

            <Link
              to={`/downloads?schoolId=${school.id}&schoolName=${encodeURIComponent(school.name)}`}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4 text-teal-300" />
              <span>{lang === 'si' ? 'පාසල් ප්‍රශ්න පත්‍ර බාගත කරන්න' : 'Download School Papers'}</span>
            </Link>

            <Link
              to={`/rankings?schoolId=${school.id}`}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>{lang === 'si' ? 'පාසල් ශ්‍රේණිගත කිරීම්' : 'School Leaderboard'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN SCHOOL DETAILS & FACULTY SECTION ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Leadership Profile Cards (Principal & Section Head) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Principal Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-blue-500/40 flex-shrink-0 shadow-md">
                <img
                  src="/provincial_director.png"
                  alt="Principal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block mb-1.5">
                  {lang === 'si' ? 'විදුහල්පතිතුමා' : 'Principal'}
                </span>
                <h3 className="text-xl font-black text-slate-900">{principal?.name || (lang === 'si' ? 'පත් කර නොමැත' : 'Not Appointed')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{principal ? "Sri Lanka Principals' Service (SLPS - Class I)" : (lang === 'si' ? 'විදුහල්පතිවරයෙකු පද්ධතියට එක්කර නැත' : 'No principal assigned in system yet')}</p>
                {principal?.phone && (
                  <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{principal.phone}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
              "Dedicated to guiding our students towards regional and national commerce benchmarks with discipline and innovation."
            </div>
          </div>

          {/* Section Head Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-500/40 flex-shrink-0 shadow-md">
                <img
                  src="/slide_1.png"
                  alt="Commerce Head"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block mb-1.5">
                  {lang === 'si' ? 'වාණිජ අංශ ප්‍රධානී' : 'Commerce Section Head'}
                </span>
                <h3 className="text-xl font-black text-slate-900">{sectionHead?.name || (lang === 'si' ? 'පත් කර නොමැත' : 'Not Appointed')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{sectionHead ? 'Head of Commerce & In-Service Advisor Coordinator' : (lang === 'si' ? 'අංශ ප්‍රධානියෙකු පද්ධතියට එක්කර නැත' : 'No commerce head assigned in system yet')}</p>
                {sectionHead?.phone && (
                  <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>{sectionHead.phone}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
              "Ensuring syllabus coverage, unit evaluations, term evaluations, and past paper revisions across all four commerce subjects."
            </div>
          </div>
        </div>

        {/* Commerce Faculty (Teachers Directory) */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'වාණිජ ආචාර්ය මණ්ඩලය' : 'Commerce Faculty'}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {lang === 'si' ? 'විෂයභාර ආචාර්ය මණ්ඩලය' : 'Qualified Commerce Teachers Directory'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {lang === 'si' ? 'උසස් පෙළ හා සාමාන්‍ය පෙළ වාණිජ විෂයයන් මෙහෙයවන සුදුසුකම්ලත් ගුරුභවතුන්' : 'Specialized teachers for Accounting, Business Studies, Economics, and Information Technology.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.length === 0 ? (
              <div className="col-span-full py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">
                  {lang === 'si' ? 'මෙම පාසල සඳහා ගුරුවරුන් තවමත් පවරා නොමැත' : 'No commerce teachers assigned to this school yet'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'si' ? 'ගුරුභවතුන් පත් කළ පසු ඔවුන්ගේ විස්තර මෙහි දිස්වනු ඇත.' : 'Teachers assigned in User Management will automatically appear here.'}
                </p>
              </div>
            ) : (
              teachers.map((tch, idx) => (
                <motion.div
                  key={tch.id || idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shadow-inner">
                        {tch.name ? tch.name.charAt(0).toUpperCase() : `T${idx + 1}`}
                      </div>
                      {tch.isSectionHead && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          ★ {lang === 'si' ? 'අංශ ප්‍රධානී' : 'Section Head'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-slate-900 mb-1">{tch.name}</h4>
                    <p className="text-xs font-bold text-indigo-600">{tch.subject || "Commerce Stream"}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Student Enrollment & Examination Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>{lang === 'si' ? 'ශිෂ්‍ය සංඛ්‍යා ලේඛන (ස්ත්‍රී / පුරුෂ වෙන්වීම)' : 'Commerce Enrolment & Gender Breakdown'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Cohort 1 Card */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-xs font-black uppercase tracking-wider text-blue-800 block mb-2">{schoolData?.cohort1Year || '2027'} A/L Commerce</span>
                <div className="text-3xl font-black text-blue-900 mb-2">{totalG12} <span className="text-sm font-semibold text-slate-500">Students</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-600 pt-2 border-t border-blue-200/60">
                  <span className="text-blue-700">👦 Boys: {g12Male}</span>
                  <span className="text-rose-600">👧 Girls: {g12Female}</span>
                </div>
              </div>

              {/* Cohort 2 Card */}
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 block mb-2">{schoolData?.cohort2Year || '2026'} A/L Commerce</span>
                <div className="text-3xl font-black text-teal-900 mb-2">{totalG13} <span className="text-sm font-semibold text-slate-500">Students</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-600 pt-2 border-t border-teal-200/60">
                  <span className="text-blue-700">👦 Boys: {g13Male}</span>
                  <span className="text-rose-600">👧 Girls: {g13Female}</span>
                </div>
              </div>
            </div>

            {/* Gender Ratio Bar */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-black mb-2">
                <span className="text-blue-700">Boys: {totalBoys} ({totalCommerceStudents > 0 ? ((totalBoys / totalCommerceStudents) * 100).toFixed(0) : 0}%)</span>
                <span className="text-rose-600">Girls: {totalGirls} ({totalCommerceStudents > 0 ? ((totalGirls / totalCommerceStudents) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: `${totalCommerceStudents > 0 ? (totalBoys / totalCommerceStudents) * 100 : 50}%` }} />
                <div className="h-full bg-pink-500" style={{ width: `${totalCommerceStudents > 0 ? (totalGirls / totalCommerceStudents) * 100 : 50}%` }} />
              </div>
            </div>
          </div>

          {/* Academic Milestones - Dynamic 5-Year Progression */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[11px] font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'වසර 5 ක ප්‍රගතිය' : '5-Year Academic Progression'}</span>
              </div>
              <h3 className="text-2xl font-black mb-2">{lang === 'si' ? 'උසස් පෙළ සාමාර්ථ මිණුම් සලකුණු' : 'A/L Pass Benchmarks'}</h3>
              <p className="text-xs text-slate-300 mb-6">{lang === 'si' ? 'පසුගිය වසර 5 තුළ වාණිජ අංශයේ ප්‍රතිඵල විශ්ලේෂණය' : '5-Year historical performance trends from official examination records.'}</p>

              <div className="space-y-3.5">
                {yearlyProgression.length > 0 ? (
                  yearlyProgression.map((item, idx) => {
                    const isLatest = idx === yearlyProgression.length - 1;
                    const barColors = ['bg-slate-400', 'bg-blue-400', 'bg-indigo-400', 'bg-cyan-400', 'bg-teal-400'];
                    const barColor = isLatest ? 'bg-teal-400' : (barColors[idx % barColors.length]);
                    return (
                      <div key={item.year}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className={isLatest ? 'text-teal-300 font-black' : 'text-slate-300'}>
                            {item.year} {lang === 'si' ? 'සමත් %' : 'Pass Rate'} {isLatest ? `(${lang === 'si' ? 'නවතම' : 'Latest'})` : ''}
                          </span>
                          <span className={isLatest ? 'text-teal-300 font-black' : 'text-white'}>
                            {item.passRate}% {item.totalSat > 0 ? `(${item.totalSat} Sat)` : ''}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(item.passRate, 0))}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center bg-white/5 rounded-2xl border border-white/10">
                    {lang === 'si' ? 'මෙම පාසල සඳහා විභාග ලකුණු තවමත් ඇතුළත් කර නොමැත.' : 'No examination marks recorded yet for this school.'}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="mt-8 w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{lang === 'si' ? 'විස්තරාත්මක ප්‍රතිඵල බලන්න' : 'View Full Grade Analytics'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* In-place Quick Analytics Modal for this school */}
      <QuickAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        title={school.name}
        subtitle={`${school.address || division?.name || ''} • Principal: ${principal?.name || 'Not Appointed'}`}
        schoolId={school.id}
        divisionId={division?.id}
        zoneId={zone?.id}
        districtId={district?.id}
      />
    </div>
  );
};

export default SchoolProfilePage;
