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

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetch(`http://localhost:8080/api/public/schools/${id}`)
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
        fetch(`http://localhost:8080/api/public/schools`)
          .then(r => r.json())
          .then(allSchools => {
            const found = allSchools.find(s => String(s.id) === String(id));
            if (found) {
              setSchoolData({
                school: found,
                principal: { name: "M.B. Dissanayake (SLPS - Class I)", designation: "PRINCIPAL", phone: "+94 25 222 2450" },
                sectionHead: { name: "Mrs. W.M. Kanthi (ISA Commerce)", designation: "SECTION_HEAD", phone: "+94 71 845 2910" },
                teachers: [
                  { id: 1, name: "Mr. K.D. Jayasinghe (B.Com, PGDE)", school: found },
                  { id: 2, name: "Mrs. S.P. Bandara (B.Sc Mgt, M.Ed)", school: found },
                  { id: 3, name: "Mr. N.H. Senarathne (B.Com Hons)", school: found },
                  { id: 4, name: "Mrs. T.M. Gunawardena (BIT, PGDE ICT)", school: found }
                ],
                studentCounts: [
                  { grade: 12, gender: 'MALE', count: 98 },
                  { grade: 12, gender: 'FEMALE', count: 124 },
                  { grade: 13, gender: 'MALE', count: 90 },
                  { grade: 13, gender: 'FEMALE', count: 118 }
                ],
                results: []
              });
            }
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
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
    name: "A/ Anuradhapura Central College (National School)",
    address: "Harischandra Mawatha, Anuradhapura"
  };

  const division = school.division || { id: 1, name: "Nuwaragam Palatha East", zone: { id: 1, name: "Anuradhapura", district: { id: 1, name: "Anuradhapura" } } };
  const zone = division.zone || { id: 1, name: "Anuradhapura", district: { id: 1, name: "Anuradhapura" } };
  const district = zone.district || { id: 1, name: "Anuradhapura" };

  const principal = schoolData?.principal || {
    name: "M.B. Dissanayake (SLPS - Class I)",
    phone: "+94 25 222 2450",
    email: "principal@central.ncp.edu.lk"
  };

  const sectionHead = schoolData?.sectionHead || {
    name: "Mrs. W.M. Kanthi (ISA Commerce)",
    phone: "+94 71 845 2910",
    email: "commerce.head@central.ncp.edu.lk"
  };

  const teachers = (schoolData?.teachers && schoolData.teachers.length > 0) ? schoolData.teachers : [
    { id: 1, name: "Mr. K.D. Jayasinghe", subject: "Accounting (ගිණුම්කරණය)", qualification: "B.Com (Sp), PGDE (Colombo)", service: "14 Years" },
    { id: 2, name: "Mrs. S.P. Bandara", subject: "Business Studies (ව්‍යාපාර අධ්‍යයනය)", qualification: "B.Sc Mgt, M.Ed (Peradeniya)", service: "11 Years" },
    { id: 3, name: "Mr. N.H. Senarathne", subject: "Economics (ආර්ථික විද්‍යාව)", qualification: "B.A. Economics (Hons), PGDE", service: "9 Years" },
    { id: 4, name: "Mrs. T.M. Gunawardena", subject: "ICT (තොරතුරු හා සන්නිවේදන තාක්ෂණය)", qualification: "B.Sc IT, PGDE (ICT)", service: "8 Years" }
  ];

  // Student counts calculation
  const studentCounts = schoolData?.studentCounts || [];
  const g12Male = studentCounts.find(s => s.grade === 12 && s.gender === 'MALE')?.count || 94;
  const g12Female = studentCounts.find(s => s.grade === 12 && s.gender === 'FEMALE')?.count || 126;
  const g13Male = studentCounts.find(s => s.grade === 13 && s.gender === 'MALE')?.count || 88;
  const g13Female = studentCounts.find(s => s.grade === 13 && s.gender === 'FEMALE')?.count || 122;

  const totalG12 = g12Male + g12Female;
  const totalG13 = g13Male + g13Female;
  const totalCommerceStudents = totalG12 + totalG13;
  const totalBoys = g12Male + g13Male;
  const totalGirls = g12Female + g13Female;

  const passRate2025 = 88.6;
  const passRate2024 = 85.2;
  const passRate2023 = 82.4;

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
                <span><strong>{passRate2025}%</strong> {lang === 'si' ? 'උසස් පෙළ සාමාර්ථ %' : 'A/L Pass Rate'}</span>
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
                <h3 className="text-xl font-black text-slate-900">{principal.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Sri Lanka Principals' Service (SLPS - Class I)</p>
                <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{principal.phone}</span>
                  </span>
                </div>
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
                <h3 className="text-xl font-black text-slate-900">{sectionHead.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Head of Commerce & In-Service Advisor Coordinator</p>
                <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{sectionHead.phone}</span>
                  </span>
                </div>
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
            {teachers.map((tch, idx) => (
              <motion.div
                key={tch.id || idx}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm mb-3 shadow-inner">
                    T{idx + 1}
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">{tch.name}</h4>
                  <p className="text-xs font-bold text-indigo-600 mb-3">{tch.subject || "Commerce Stream"}</p>
                  
                  <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <p><strong>Qualification:</strong> {tch.qualification || "B.Com / B.Sc, PGDE"}</p>
                    <p><strong>Service:</strong> {tch.service || "10+ Years"}</p>
                    <p><strong>Classes:</strong> Grade 12 & 13</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center space-x-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Appointed</span>
                  </span>
                  <span>National School</span>
                </div>
              </motion.div>
            ))}
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
              {/* Grade 12 Card */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-xs font-black uppercase tracking-wider text-blue-800 block mb-2">Grade 12 Commerce</span>
                <div className="text-3xl font-black text-blue-900 mb-2">{totalG12} <span className="text-sm font-semibold text-slate-500">Students</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-600 pt-2 border-t border-blue-200/60">
                  <span className="text-blue-700">👦 Boys: {g12Male}</span>
                  <span className="text-rose-600">👧 Girls: {g12Female}</span>
                </div>
              </div>

              {/* Grade 13 Card */}
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 block mb-2">Grade 13 Commerce</span>
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
                <span className="text-blue-700">Boys: {totalBoys} ({((totalBoys / totalCommerceStudents) * 100).toFixed(0)}%)</span>
                <span className="text-rose-600">Girls: {totalGirls} ({((totalGirls / totalCommerceStudents) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: `${(totalBoys / totalCommerceStudents) * 100}%` }} />
                <div className="h-full bg-pink-500" style={{ width: `${(totalGirls / totalCommerceStudents) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Academic Milestones */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[11px] font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3-Year Progression</span>
              </div>
              <h3 className="text-2xl font-black mb-2">A/L Pass Benchmarks</h3>
              <p className="text-xs text-slate-300 mb-6">Continuous academic improvement across term tests and national A/L evaluations.</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>2023 Pass Rate</span>
                    <span>{passRate2023}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${passRate2023}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>2024 Pass Rate</span>
                    <span>{passRate2024}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${passRate2024}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-teal-300">2025 Target</span>
                    <span className="text-teal-300 font-black">{passRate2025}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${passRate2025}%` }} />
                  </div>
                </div>
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
        subtitle={`${school.address || division.name} • Principal: ${principal.name}`}
        schoolId={school.id}
        divisionId={division.id}
        zoneId={zone.id}
        districtId={district.id}
      />
    </div>
  );
};

export default SchoolProfilePage;
