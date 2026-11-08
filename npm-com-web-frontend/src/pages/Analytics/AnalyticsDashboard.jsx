import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import { 
  TrendingUp, Users, School, GraduationCap, MapPin, 
  Sparkles, Award, FileText, CheckCircle2, ArrowUpRight, 
  BookOpen, Calendar, Clock, ChevronRight, Layers, Flame, ShieldAlert, AlertCircle
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const { currentUser } = useAuth();
  
  const role = currentUser?.role || 'PROVINCIAL_DIRECTOR';
  const isProvincial = role === 'PROVINCIAL_DIRECTOR';
  const isZonal = role === 'ZONAL_DIRECTOR';
  const isDivisional = role === 'DIVISIONAL_DIRECTOR';
  const isPrincipal = role === 'PRINCIPAL';
  const isTeacher = role === 'TEACHER' || role === 'SECTION_HEAD';

  // State for live summary data
  const [statsData, setStatsData] = useState({
    schools: 0,
    students: 0,
    teachers: 0,
    passRate: 0,
    grade12Students: 0,
    grade13Students: 0,
    boys: 0,
    girls: 0,
    threeACount: 0,
    universityEligibleRate: 0
  });

  useEffect(() => {
    if ((isTeacher || isPrincipal) && currentUser?.schoolId) {
      // School-level scoped statistics strictly for appointed school
      api.get(`/public/statistics/school/${currentUser.schoolId}`)
        .then(res => {
          const data = res.data;
          if (data) {
            setStatsData(prev => ({
              ...prev,
              schools: 1,
              students: data.students ?? 0,
              teachers: data.teachers ?? 0,
              passRate: data.passRateCurrent ?? 0,
              grade12Students: data.cohort1Count ?? data.grade12Students ?? 0,
              grade13Students: data.cohort2Count ?? data.grade13Students ?? 0,
              cohort1Year: data.cohort1Year || data.activeYear,
              cohort1Count: data.cohort1Count ?? data.grade12Students ?? 0,
              cohort2Year: data.cohort2Year || (data.activeYear ? data.activeYear - 1 : undefined),
              cohort2Count: data.cohort2Count ?? data.grade13Students ?? 0,
              accCandidates: data.accCandidates ?? 0,
              bsCandidates: data.bsCandidates ?? 0,
              ecoCandidates: data.ecoCandidates ?? 0,
              itCandidates: data.itCandidates ?? 0,
              boys: data.boys ?? 0,
              girls: data.girls ?? 0,
              schoolName: data.schoolName || currentUser?.schoolName || 'Appointed School',
              activeYear: data.activeYear
            }));
          }
        })
        .catch(() => {});
    } else if (isZonal && currentUser?.zoneId) {
      // Zone-level scoped statistics strictly for appointed zone
      api.get(`/public/statistics/zone/${currentUser.zoneId}`)
        .then(res => {
          const data = res.data;
          if (data) {
            setStatsData(prev => ({
              ...prev,
              schools: data.schools ?? 0,
              students: data.students ?? 0,
              teachers: data.teachers ?? 0,
              passRate: data.passRateCurrent ?? 0,
              grade12Students: data.cohort1Count ?? data.grade12Students ?? 0,
              grade13Students: data.cohort2Count ?? data.grade13Students ?? 0,
              cohort1Year: data.cohort1Year || data.activeYear,
              cohort1Count: data.cohort1Count ?? data.grade12Students ?? 0,
              cohort2Year: data.cohort2Year || (data.activeYear ? data.activeYear - 1 : undefined),
              cohort2Count: data.cohort2Count ?? data.grade13Students ?? 0,
              accCandidates: data.accCandidates ?? 0,
              bsCandidates: data.bsCandidates ?? 0,
              ecoCandidates: data.ecoCandidates ?? 0,
              itCandidates: data.itCandidates ?? 0,
              boys: data.boys ?? 0,
              girls: data.girls ?? 0,
              activeYear: data.activeYear
            }));
          }
        })
        .catch(() => {});
    } else if (isDivisional && currentUser?.divisionId) {
      // Division-level scoped statistics strictly for appointed division
      api.get(`/public/statistics/division/${currentUser.divisionId}`)
        .then(res => {
          const data = res.data;
          if (data) {
            setStatsData(prev => ({
              ...prev,
              schools: data.schools ?? 0,
              students: data.students ?? 0,
              teachers: data.teachers ?? 0,
              passRate: data.passRateCurrent ?? 0,
              grade12Students: data.cohort1Count ?? data.grade12Students ?? 0,
              grade13Students: data.cohort2Count ?? data.grade13Students ?? 0,
              cohort1Year: data.cohort1Year || data.activeYear,
              cohort1Count: data.cohort1Count ?? data.grade12Students ?? 0,
              cohort2Year: data.cohort2Year || (data.activeYear ? data.activeYear - 1 : undefined),
              cohort2Count: data.cohort2Count ?? data.grade13Students ?? 0,
              accCandidates: data.accCandidates ?? 0,
              bsCandidates: data.bsCandidates ?? 0,
              ecoCandidates: data.ecoCandidates ?? 0,
              itCandidates: data.itCandidates ?? 0,
              boys: data.boys ?? 0,
              girls: data.girls ?? 0,
              activeYear: data.activeYear
            }));
          }
        })
        .catch(() => {});
    } else {
      // Province-wide overview for Provincial Director and Admin
      api.get('/public/statistics/overview')
        .then(res => {
          const data = res.data;
          if (data && data.provincial) {
            setStatsData(prev => ({
              ...prev,
              schools: data.provincial.schools ?? 0,
              students: data.provincial.students ?? 0,
              teachers: data.provincial.teachers ?? 0,
              passRate: data.provincial.passRateCurrent ?? 0,
              grade12Students: data.provincial.cohort1Count ?? data.provincial.grade12Students ?? 0,
              grade13Students: data.provincial.cohort2Count ?? data.provincial.grade13Students ?? 0,
              cohort1Year: data.provincial.cohort1Year || data.activeYear,
              cohort1Count: data.provincial.cohort1Count ?? data.provincial.grade12Students ?? 0,
              cohort2Year: data.provincial.cohort2Year || (data.activeYear ? data.activeYear - 1 : undefined),
              cohort2Count: data.provincial.cohort2Count ?? data.provincial.grade13Students ?? 0,
              accCandidates: data.provincial.accCandidates ?? 0,
              bsCandidates: data.provincial.bsCandidates ?? 0,
              ecoCandidates: data.provincial.ecoCandidates ?? 0,
              itCandidates: data.provincial.itCandidates ?? 0,
              boys: data.provincial.boys ?? 0,
              girls: data.provincial.girls ?? 0,
              activeYear: data.activeYear
            }));
          }
        })
        .catch(() => {});
    }
  }, [currentUser, isTeacher, isPrincipal, isZonal]);

  const [yearlyProgression, setYearlyProgression] = useState([]);
  const [zonalComparison, setZonalComparison] = useState([]);
  const [topSchools, setTopSchools] = useState([]);

  useEffect(() => {
    // Dynamic 5-year progression across commerce core subjects
    let query = '/public/statistics/yearly-comparison?limit=5';
    if ((isTeacher || isPrincipal) && currentUser?.schoolId) {
      query += `&level=school&id=${currentUser.schoolId}`;
    } else if (isZonal && currentUser?.zoneId) {
      query += `&level=zone&id=${currentUser.zoneId}`;
    } else if ((isDivisional || currentUser?.role === 'DIVISIONAL_DIRECTOR') && currentUser?.divisionId) {
      query += `&level=division&id=${currentUser.divisionId}`;
    } else {
      query += '&level=provincial';
    }
    api.get(query)
      .then(res => {
        if (res.data && res.data.data) {
          setYearlyProgression(res.data.data);
        }
      })
      .catch(() => {});

    // Dynamic hierarchy comparison from DB
    const compEndpoint = (isZonal && currentUser?.zoneId)
      ? `/public/divisions?zoneId=${currentUser.zoneId}`
      : (isDivisional && currentUser?.divisionId)
        ? `/public/schools?divisionId=${currentUser.divisionId}`
        : '/public/zones';

    api.get(compEndpoint)
      .then(res => {
        if (Array.isArray(res.data)) {
          const colors = ['#2563eb', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#14b8a6', '#f59e0b', '#f97316', '#8b5cf6', '#a855f7', '#ec4899'];
          setZonalComparison(res.data.map((z, idx) => ({
            zone: z.name,
            passRate: z.passRate || 0,
            students: z.students || 0,
            color: colors[idx % colors.length]
          })));
        }
      })
      .catch(() => {});

    // Dynamic top schools from rankings API
    api.get('/public/rankings?limit=5')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTopSchools(res.data.map((s, idx) => ({
            rank: idx + 1,
            name: s.schoolName || s.name,
            zone: s.zoneName || 'Zone',
            passRate: `${s.passRate || 0}%`,
            candidates: s.candidates || s.students || 0
          })));
        } else {
          setTopSchools([]);
        }
      })
      .catch(() => setTopSchools([]));
  }, [currentUser, isTeacher, isPrincipal, isZonal, isDivisional]);

  const alResultsData = yearlyProgression;

  // 3. Dynamic 4 A/L Subjects Breakdown (Individual Subject Distribution)
  const accCount = statsData.accCandidates || 0;
  const bsCount = statsData.bsCandidates || 0;
  const ecoCount = statsData.ecoCandidates || 0;
  const itCount = statsData.itCandidates || 0;
  const totalStudents = statsData.students || 0;

  const fourSubjects = [
    { key: 'acc', name: 'Accounting', siName: 'ගිණුම්කරණය', value: accCount, color: '#2563eb' },
    { key: 'bs', name: 'Business Studies', siName: 'ව්‍යාපාර අධ්‍යයනය', value: bsCount, color: '#8b5cf6' },
    { key: 'eco', name: 'Economics', siName: 'ආර්ථික විද්‍යාව', value: ecoCount, color: '#f59e0b' },
    { key: 'it', name: 'Information Tech (ICT)', siName: 'තොරතුරු තාක්ෂණය', value: itCount, color: '#06b6d4' }
  ];

  const totalEvaluatedMarks = accCount + bsCount + ecoCount + itCount;

  let subjectChartData = [];
  if (totalEvaluatedMarks > 0) {
    subjectChartData = fourSubjects.filter(s => s.value > 0);
  } else if (totalStudents > 0) {
    subjectChartData = [
      { name: 'Enrolled Commerce Students', value: totalStudents, color: '#3b82f6' }
    ];
  } else {
    subjectChartData = [
      { name: 'No Enrolled Candidates', value: 1, color: '#cbd5e1' }
    ];
  }

  const genderDemographics = [
    { name: 'Female Commerce Students', value: statsData.girls, percentage: statsData.students > 0 ? `${Math.round((statsData.girls / statsData.students) * 100)}%` : '0%', color: '#ec4899' },
    { name: 'Male Commerce Students', value: statsData.boys, percentage: statsData.students > 0 ? `${Math.round((statsData.boys / statsData.students) * 100)}%` : '0%', color: '#3b82f6' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-7 pb-16"
    >
      
      {/* ── 1. PRESTIGIOUS HERO EXECUTIVE BANNER (MOBILE-APP OPTIMIZED) ── */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/30 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 text-amber-300 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[240px] sm:max-w-none">
                {isProvincial 
                  ? "🏛️ Provincial Directorate • NCP" 
                  : isZonal 
                    ? `🏢 Zonal Oversight • ${currentUser?.zoneName || 'Zone'}` 
                    : isPrincipal 
                      ? "🏫 School Principal Dashboard" 
                      : isTeacher 
                        ? "👨‍🏫 Commerce Faculty Console" 
                        : "Educational Administrative Console"}
              </span>
            </div>

            {(() => {
              const isNIC = (val) => /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(val || '');
              let displayName = currentUser?.name;
              if (!displayName || isNIC(displayName)) {
                if (isZonal) displayName = currentUser?.zoneName ? `${currentUser.zoneName} Zonal Director` : 'Zonal Director';
                else if (currentUser?.role === 'DIVISIONAL_DIRECTOR') displayName = currentUser?.divisionName ? `${currentUser.divisionName} Divisional Director` : 'Divisional Director';
                else if (isProvincial) displayName = 'Provincial Director';
                else displayName = currentUser?.username || 'Officer';
              }
              return (
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-white mb-1">
                  Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-teal-300">{displayName}</span>!
                </h1>
              );
            })()}

            {/* Mobile compact subtext */}
            <p className="text-blue-200/90 text-xs font-medium sm:hidden flex items-center gap-1.5">
              <span>📍 {currentUser?.location || 'North Central Province'}</span>
              <span>•</span>
              <span>{statsData.cohort1Year || statsData.activeYear || 'Active'} A/L Active</span>
            </p>

            {/* Desktop detailed description */}
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl hidden sm:block mt-1">
              {isTeacher
                ? `Authorized evaluation console for student term marks, modular unit assessments, and performance tracking strictly for ${currentUser?.schoolName || 'your appointed school'}.`
                : isPrincipal
                  ? `Comprehensive institutional monitoring for commerce stream enrollments, faculty allocations, and student academic results at ${currentUser?.schoolName || 'your school'}.`
                  : isZonal
                    ? `Zonal oversight dashboard for monitoring secondary school performance, teacher distributions, and evaluation benchmarks across ${currentUser?.zoneName || 'your zone'}.`
                    : "North Central Provincial Department of Education — Comprehensive monitoring dashboard for term evaluations, A/L national benchmarks, teacher directories, and student achievements across Anuradhapura & Polonnaruwa."}
            </p>

            <div className="hidden sm:flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                <MapPin size={13} className="text-teal-400" />
                <span>Jurisdiction: <strong>{currentUser?.location || 'North Central Province'}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                <Calendar size={13} className="text-amber-400" />
                <span>Academic Cycle: <strong>{statsData.activeYear ? `${statsData.activeYear} A/L (Active)` : 'Active Cycle'}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-lg">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Leaderboard Live Sync Active</span>
              </span>
            </div>
          </div>

          {/* Quick Action Launch Buttons - App-like Grid on Mobile */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-col gap-2 mt-2 sm:mt-0 flex-shrink-0">
            <Link
              to="/dashboard/results"
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-95 text-center"
            >
              <FileText size={14} className="shrink-0" />
              <span>Enter Results</span>
            </Link>

            <Link
              to="/rankings"
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-95 text-center"
            >
              <Award size={14} className="shrink-0" />
              <span>Leaderboard</span>
            </Link>

            {!isTeacher ? (
              <Link
                to="/dashboard/teachers"
                className="col-span-2 sm:col-span-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 border border-white/20 transition-all text-center"
              >
                <GraduationCap size={14} className="shrink-0" />
                <span>Teachers Directory</span>
              </Link>
            ) : (
              <Link
                to="/dashboard/students"
                className="col-span-2 sm:col-span-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 border border-white/20 transition-all text-center"
              >
                <Users size={14} className="shrink-0" />
                <span>Student Census</span>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 2. EXECUTIVE KPI SUMMARY METRICS (APP-STYLE 2X2 GRID ON MOBILE) ── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* KPI 1: Total Students */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-3 sm:p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden group hover:shadow-xs transition-shadow">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 rounded-xl bg-blue-600 text-white shadow-xs">
              <Users size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-blue-200">
              Gr. 12 & 13
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{statsData.students.toLocaleString()}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
            {isTeacher || isPrincipal ? `Enrolled Students` : isZonal ? `Zonal Students` : 'Commerce Students'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Gr.12: <strong>{statsData.grade12Students || 0}</strong></span>
            <span>Gr.13: <strong>{statsData.grade13Students || 0}</strong></span>
          </div>
        </motion.div>

        {/* KPI 2: Active Schools / Classes */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-3 sm:p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden group hover:shadow-xs transition-shadow">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 rounded-xl bg-indigo-600 text-white shadow-xs">
              <School size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-indigo-200">
              {isTeacher || isPrincipal ? 'Classes' : isZonal ? 'Zone' : 'Schools'}
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isTeacher || isPrincipal 
              ? `${[statsData.cohort1Count > 0, statsData.cohort2Count > 0].filter(Boolean).length} ${[statsData.cohort1Count > 0, statsData.cohort2Count > 0].filter(Boolean).length === 1 ? 'Cohort' : 'Cohorts'}` 
              : statsData.schools.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
            {isTeacher || isPrincipal ? 'Commerce Cohorts' : isZonal ? 'Schools in Zone' : 'Commerce Schools'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-600">
            {isTeacher || isPrincipal ? (
              <>
                {statsData.cohort1Count > 0 ? (
                  <span>{statsData.cohort1Year} A/L: <strong>{statsData.cohort1Count}</strong></span>
                ) : (
                  <span>Status: <strong>No Batch</strong></span>
                )}
                {statsData.cohort2Count > 0 ? (
                  <span>{statsData.cohort2Year} A/L: <strong>{statsData.cohort2Count}</strong></span>
                ) : (
                  <span>Batch: <strong>Single Cohort</strong></span>
                )}
              </>
            ) : isZonal ? (
              <>
                <span>Zone: <strong>{currentUser?.zoneName || 'Assigned'}</strong></span>
              </>
            ) : (
              <>
                <span>Anuradhapura: <strong>78</strong></span>
                <span>Polonnaruwa: <strong>40</strong></span>
              </>
            )}
          </div>
        </motion.div>

        {/* KPI 3: Pass Rate Benchmark */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-3 sm:p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden group hover:shadow-xs transition-shadow">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-600 text-white shadow-xs">
              <TrendingUp size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isTeacher || isPrincipal ? 'School' : isZonal ? 'Zonal' : '+3.8%'}
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{statsData.passRate}%</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
            {isTeacher || isPrincipal ? 'Pass Benchmark' : isZonal ? 'Zonal Pass Rate' : 'Provincial Pass Rate'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Target: <strong>100%</strong></span>
            <span>A-Grade Quality</span>
          </div>
        </motion.div>

        {/* KPI 4: Registered Teachers */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-3 sm:p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden group hover:shadow-xs transition-shadow">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
              <GraduationCap size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-amber-200">
              Faculty
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{statsData.teachers.toLocaleString()}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
            {isTeacher || isPrincipal ? 'Commerce Faculty at School' : isZonal ? 'Teachers in Zone' : 'Commerce Teachers'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Appointed Faculty</span>
            <span>{statsData.teachers > 0 ? `${statsData.teachers} Registered` : 'Pending Allocation'}</span>
          </div>
        </motion.div>

      </motion.div>

      {/* ── 3. INTERACTIVE VISUAL ANALYTICS (CHARTS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: 3-Year Subject Pass Rate & Quality Trend (8 Cols) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/90"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="text-lg font-black text-slate-900">
                  A/L Subject Performance Trend {yearlyProgression.length > 0 ? `(${yearlyProgression.length} Consecutive Year${yearlyProgression.length > 1 ? 's' : ''})` : ''}
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Pass percentage progression in Accounting, Business Studies, Economics, and ICT.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
              {yearlyProgression.length > 1
                ? `${yearlyProgression[0].year} — ${yearlyProgression[yearlyProgression.length - 1].year} Benchmarks`
                : yearlyProgression.length === 1
                  ? `${yearlyProgression[0].year} Benchmark`
                  : 'Performance Benchmarks'}
            </span>
          </div>

          <div className="h-[320px] w-full">
            {alResultsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alResultsData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="bsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ecoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ictGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} unit="%" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="Accounting" name="Accounting (ගිණුම්කරණය)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#accGrad)" />
                  <Area type="monotone" dataKey="Business" name="Business Studies (ව්‍යාපාර අධ්‍යයනය)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={0.3} fill="url(#bsGrad)" />
                  <Area type="monotone" dataKey="Economics" name="Economics (ආර්ථික විද්‍යාව)" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.2} fill="url(#ecoGrad)" />
                  <Area type="monotone" dataKey="ICT" name="ICT (තොරතුරු තාක්ෂණය)" stroke="#10b981" strokeWidth={2} fillOpacity={0.2} fill="url(#ictGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                No examination records registered yet for the 5-year timeline.
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Commerce 4 A/L Subjects Breakdown (4 Cols) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/90 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h2 className="text-base font-black text-slate-900">Commerce A/L Subjects Breakdown</h2>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Individual candidate evaluation across 4 Commerce subjects.
            </p>

            <div className="h-[200px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{statsData.students.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Candidates</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {fourSubjects.map(sub => (
              <div key={sub.key} className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                  <span>{sub.name} <span className="text-[10px] text-slate-400 font-normal">({sub.siName})</span></span>
                </span>
                <span className="font-black text-slate-900">
                  {sub.value > 0 ? `${sub.value.toLocaleString()} candidates` : '0'}
                </span>
              </div>
            ))}
            {(() => {
              const total = statsData.girls + statsData.boys;
              const fPct = total > 0 ? Math.round((statsData.girls / total) * 100) : 0;
              const mPct = total > 0 ? Math.round((statsData.boys / total) * 100) : 0;
              return (
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 mt-2">
                  <span>👩 Female: <strong>{statsData.girls.toLocaleString()} ({fPct}%)</strong></span>
                  <span>👨 Male: <strong>{statsData.boys.toLocaleString()} ({mPct}%)</strong></span>
                </div>
              );
            })()}
          </div>
        </motion.div>

      </div>

      {/* ── 4. ACADEMIC COMPARISON & INSTITUTIONAL COHORTS ── */}
      {isTeacher || isPrincipal ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* School Cohort Breakdown (7 Cols) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/90 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Institutional Cohort Roster
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">Commerce Classes & Student Cohorts</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enrolled students, evaluation phases, and performance targets at {currentUser?.schoolName || 'your school'}.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                Census #{currentUser?.schoolId || '27248'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cohort 1: Latest Year */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-blue-800 tracking-wider">
                    {statsData.cohort1Year || statsData.activeYear || 2027} A/L Cohort
                  </span>
                  <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    Active Candidate Batch
                  </span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">{statsData.cohort1Count ?? statsData.grade12Students ?? 0}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1.5">Enrolled Candidates</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Active in Term evaluations & Modular Unit tests across Accounting, Business Studies, Economics, and ICT.
                </p>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] font-bold text-blue-900">
                  <span>Evaluation Status: <strong>In Progress</strong></span>
                  <span>A/L Year: <strong>{statsData.cohort1Year || statsData.activeYear || 2027}</strong></span>
                </div>
              </div>

              {/* Cohort 2: Previous Year */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                    {statsData.cohort2Count > 0 ? `${statsData.cohort2Year} A/L Cohort` : 'Secondary Cohort'}
                  </span>
                  <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                    {statsData.cohort2Count > 0 ? 'Senior Candidate Batch' : 'No Enrolled Batch'}
                  </span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">{statsData.cohort2Count ?? 0}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1.5">Enrolled Candidates</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {statsData.cohort2Count > 0 
                    ? 'Final year revision, Provincial trial examinations, and National benchmark preparation.'
                    : 'Currently no secondary senior candidate batch enrolled in this academic cycle.'}
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span>Enrolled: <strong>{statsData.cohort2Count > 0 ? 'Active' : 'None'}</strong></span>
                  <span>A/L Year: <strong>{statsData.cohort2Count > 0 ? statsData.cohort2Year : 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Gender Census: 👩 Female <strong>{statsData.girls || 0}</strong> • 👨 Male <strong>{statsData.boys || 0}</strong></span>
              </span>
              <Link to="/dashboard/students" className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 text-xs">
                <span>View Full Student Register</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </motion.div>

          {/* School Evaluation Launchpad (5 Cols) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/90 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-black text-slate-900">School Evaluation Console</h2>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Direct Actions
              </span>
            </div>

            <div className="space-y-2.5">
              <Link 
                to="/dashboard/results" 
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    📝
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700">Enter Exam & Unit Results</h4>
                    <p className="text-[10px] text-slate-500">Submit marks for Term 1 or Unit tests via Excel / CSV</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link 
                to="/dashboard/students" 
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    👥
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700">Live Student Census & Roster</h4>
                    <p className="text-[10px] text-slate-500">Auto-counted commerce students from exam submissions</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
              </Link>

              <Link 
                to="/dashboard/resources" 
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    📚
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-700">Educational Resources</h4>
                    <p className="text-[10px] text-slate-500">Syllabus documents, marking schemes, and revision guides</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </Link>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-[11px] text-blue-900 font-semibold space-y-1">
                <div className="flex items-center justify-between">
                  <span>Jurisdiction:</span>
                  <span className="font-bold">{currentUser?.schoolName || 'Appointed School'}</span>
                </div>
                <div className="flex items-center justify-between text-blue-700">
                  <span>Zonal Authority:</span>
                  <span>{currentUser?.zoneName || 'Anuradhapura'} Zone</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Zonal Performance Chart (7 Cols) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/90"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {isZonal
                    ? `${currentUser?.zoneName || 'Zonal'} Divisions Performance Index`
                    : isDivisional
                      ? `${currentUser?.divisionName || 'Divisional'} Schools Performance Index`
                      : `Education Zones Performance Index (${zonalComparison.length})`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isZonal
                    ? 'Ranked by Division Pass Rate & Evaluation Index'
                    : isDivisional
                      ? 'Ranked by School Pass Rate & Average Aggregate'
                      : 'Ranked by A/L Pass Rate & Average Aggregate'}
                </p>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {isZonal ? 'Zonal Oversight' : isDivisional ? 'Divisional Oversight' : 'Province Wide'}
              </span>
            </div>

            <div className="h-[340px] w-full">
              {zonalComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zonalComparison} layout="vertical" margin={{ top: 5, right: 30, left: 35, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} unit="%" />
                    <YAxis dataKey="zone" type="category" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                    />
                    <Bar dataKey="passRate" name="Pass Rate (%)" radius={[0, 8, 8, 0]} barSize={18}>
                      {zonalComparison.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                  No zones recorded in database.
                </div>
              )}
            </div>
          </motion.div>

          {/* Top 5 Schools Leaderboard Spotlight (5 Cols) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/90"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-black text-slate-900">Top Commerce Schools (NCP)</h2>
              </div>
              <Link to="/rankings" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center">
                <span>Full Leaderboard</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {topSchools.length > 0 ? (
                topSchools.map((sch) => (
                  <div 
                    key={sch.rank}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0 ${
                        sch.rank === 1 ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300' :
                        sch.rank === 2 ? 'bg-slate-300 text-slate-800' :
                        sch.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        #{sch.rank}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {sch.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">{sch.zone} Zone • {sch.candidates} Commerce Students</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-xs font-black text-emerald-700 block leading-tight">{sch.passRate}</span>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase leading-tight">Pass Rate</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100">
                  No examination rankings recorded yet.
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <Link
                to={`/rankings?exam=term${statsData.cohort1Year || statsData.activeYear ? `&year=${statsData.cohort1Year || statsData.activeYear}` : ''}`}
                className="inline-flex items-center space-x-1.5 text-xs font-black text-blue-600 hover:text-blue-700"
              >
                <span>Explore {statsData.cohort1Year || statsData.activeYear || ''} Active Student Rankings</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 5. ROLE-SPECIFIC ADMINISTRATIVE QUICK LAUNCHPAD ── */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">Officer Action Hub & Operational Workflows</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quick access shortcuts tailored for {currentUser?.role.replace('_', ' ')} authority.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            to="/dashboard/results"
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 hover:from-blue-100/70 hover:to-indigo-100/70 border border-blue-200/80 transition-all group hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-700">Enter Term Test Marks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload Excel sheets or enter marks directly for active candidate cohorts.
            </p>
          </Link>

          <Link
            to="/dashboard/students"
            className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 hover:from-purple-100/70 hover:to-pink-100/70 border border-purple-200/80 transition-all group hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1 group-hover:text-purple-700">Student Census Records</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect candidate cohorts and boy/girl demographics across schools and divisions.
            </p>
          </Link>

          <Link
            to="/dashboard/teachers"
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 hover:from-emerald-100/70 hover:to-teal-100/70 border border-emerald-200/80 transition-all group hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1 group-hover:text-emerald-700">Commerce Teachers Faculty</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse qualified Accounting, BS, Econ, and ICT teacher placements.
            </p>
          </Link>

          <Link
            to="/dashboard/resources"
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 hover:from-amber-100/70 hover:to-orange-100/70 border border-amber-200/80 transition-all group hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1 group-hover:text-amber-800">Resource Repository</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload past papers, marking schemes, syllabi, and teacher guides.
            </p>
          </Link>

        </div>
      </motion.div>

    </motion.div>
  );
};

export default AnalyticsDashboard;
