import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BarChart3, Users, Award, TrendingUp, CheckCircle2, 
  ExternalLink, Calendar, BookOpen, AlertCircle, Sparkles, GitCompare,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line, Area, ReferenceLine
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const GRADE_COLORS = {
  A: '#10b981', // emerald
  B: '#3b82f6', // blue
  C: '#8b5cf6', // violet
  S: '#f59e0b', // amber
  F: '#ef4444'  // red
};

const QuickAnalyticsModal = ({
  isOpen,
  onClose,
  title = "Performance Analytics",
  subtitle = "G.C.E. A/L Commerce Results",
  districtId,
  zoneId,
  divisionId,
  schoolId,
  subjectId,
  initialYear = "2025"
}) => {
  const navigate = useNavigate();
  const { lang = 'en' } = useLanguage ? (useLanguage() || {}) : {};
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'gender'
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [historicalResults, setHistoricalResults] = useState([]);
  const [nationalStatsList, setNationalStatsList] = useState([]);

  // Fetch available years from database
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/public/al-results/years')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const strYears = data.map(y => String(y));
          setAvailableYears(strYears);
          if (!selectedYear || selectedYear === 'all' || !strYears.includes(selectedYear)) {
            setSelectedYear(strYears[0]);
          }
        } else {
          setAvailableYears([]);
          setSelectedYear('all');
        }
      })
      .catch(() => setAvailableYears([]));
  }, [isOpen]);

  // Fetch longitudinal trends across all years & official national benchmarks
  useEffect(() => {
    if (!isOpen) return;
    const fetchHistorical = async () => {
      try {
        const url = new URL('/api/public/al-results', window.location.origin);
        if (schoolId && schoolId !== 'all') url.searchParams.append('schoolId', schoolId);
        else if (divisionId && divisionId !== 'all') url.searchParams.append('divisionId', divisionId);
        else if (zoneId && zoneId !== 'all') url.searchParams.append('zoneId', zoneId);
        else if (districtId && districtId !== 'all') url.searchParams.append('districtId', districtId);
        if (subjectId && subjectId !== 'all') url.searchParams.append('subjectId', subjectId);

        const [resHist, resNat] = await Promise.all([
          fetch(url),
          fetch('/api/public/national-statistics')
        ]);
        if (resHist.ok) {
          const d = await resHist.json();
          setHistoricalResults(Array.isArray(d) ? d : []);
        } else {
          setHistoricalResults([]);
        }
        if (resNat.ok) {
          const nd = await resNat.json();
          setNationalStatsList(Array.isArray(nd) ? nd : []);
        } else {
          setNationalStatsList([]);
        }
      } catch (err) {
        console.error("Error fetching historical trend data:", err);
        setHistoricalResults([]);
        setNationalStatsList([]);
      }
    };
    fetchHistorical();
  }, [isOpen, schoolId, divisionId, zoneId, districtId, subjectId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Fetch results when modal opens or year changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/public/al-results', window.location.origin);
        if (schoolId && schoolId !== 'all') url.searchParams.append('schoolId', schoolId);
        else if (divisionId && divisionId !== 'all') url.searchParams.append('divisionId', divisionId);
        else if (zoneId && zoneId !== 'all') url.searchParams.append('zoneId', zoneId);
        else if (districtId && districtId !== 'all') url.searchParams.append('districtId', districtId);

        if (subjectId && subjectId !== 'all') url.searchParams.append('subjectId', subjectId);
        if (selectedYear && selectedYear !== 'all') url.searchParams.append('year', selectedYear);

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setResultsData(Array.isArray(data) ? data : []);
        } else {
          setResultsData([]);
        }
      } catch (err) {
        console.error("Error fetching modal analytics:", err);
        setResultsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, schoolId, divisionId, zoneId, districtId, subjectId, selectedYear]);

  // Process overall aggregated stats
  const aggregate = resultsData.reduce((acc, curr) => {
    const a = curr.acount ?? curr.aCount ?? 0;
    const b = curr.bcount ?? curr.bCount ?? 0;
    const c = curr.ccount ?? curr.cCount ?? 0;
    const s = curr.scount ?? curr.sCount ?? 0;
    const f = curr.fcount ?? curr.fCount ?? 0;
    const sat = curr.totalSat ?? (a + b + c + s + f);

    acc.A += a;
    acc.B += b;
    acc.C += c;
    acc.S += s;
    acc.F += f;
    acc.totalSat += sat;

    // Check gender
    const g = curr.gender ? String(curr.gender).toUpperCase() : null;
    if (g === 'MALE') {
      acc.male.A += a;
      acc.male.B += b;
      acc.male.C += c;
      acc.male.S += s;
      acc.male.F += f;
      acc.male.sat += sat;
      acc.hasGenderTags = true;
    } else if (g === 'FEMALE') {
      acc.female.A += a;
      acc.female.B += b;
      acc.female.C += c;
      acc.female.S += s;
      acc.female.F += f;
      acc.female.sat += sat;
      acc.hasGenderTags = true;
    }

    return acc;
  }, {
    A: 0, B: 0, C: 0, S: 0, F: 0, totalSat: 0,
    hasGenderTags: false,
    male: { A: 0, B: 0, C: 0, S: 0, F: 0, sat: 0 },
    female: { A: 0, B: 0, C: 0, S: 0, F: 0, sat: 0 }
  });

  const totalGradesSat = aggregate.A + aggregate.B + aggregate.C + aggregate.S + aggregate.F;
  const effectiveTotalSat = totalGradesSat > 0 ? totalGradesSat : aggregate.totalSat;
  const totalPass = aggregate.A + aggregate.B + aggregate.C + aggregate.S;
  const overallPassRate = effectiveTotalSat > 0 
    ? Math.min(100.0, Number(((totalPass / effectiveTotalSat) * 100).toFixed(1)))
    : 0;

  // Compute Gender Breakdown strictly from actual tagged records (no fake/hardcoded ratios)
  let maleData, femaleData;
  if (aggregate.hasGenderTags && (aggregate.male.sat > 0 || aggregate.female.sat > 0)) {
    maleData = aggregate.male;
    femaleData = aggregate.female;
  } else {
    maleData = { sat: 0, A: 0, B: 0, C: 0, S: 0, F: 0 };
    femaleData = { sat: 0, A: 0, B: 0, C: 0, S: 0, F: 0 };
  }

  const maleTotalPass = maleData.A + maleData.B + maleData.C + maleData.S;
  const maleSatEffective = (maleTotalPass + maleData.F) || maleData.sat;
  const malePassRate = maleSatEffective > 0 
    ? Math.min(100.0, Number(((maleTotalPass / maleSatEffective) * 100).toFixed(1)))
    : 0;

  const femaleTotalPass = femaleData.A + femaleData.B + femaleData.C + femaleData.S;
  const femaleSatEffective = (femaleTotalPass + femaleData.F) || femaleData.sat;
  const femalePassRate = femaleSatEffective > 0 
    ? Math.min(100.0, Number(((femaleTotalPass / femaleSatEffective) * 100).toFixed(1)))
    : 0;

  // Charts Data
  const pieData = [
    { name: 'A Passes', value: aggregate.A, color: GRADE_COLORS.A },
    { name: 'B Passes', value: aggregate.B, color: GRADE_COLORS.B },
    { name: 'C Passes', value: aggregate.C, color: GRADE_COLORS.C },
    { name: 'S Passes', value: aggregate.S, color: GRADE_COLORS.S },
    { name: 'Fails (W)', value: aggregate.F, color: GRADE_COLORS.F }
  ].filter(d => d.value > 0);

  const genderComparisonData = [
    { grade: 'Grade A', Male: maleData.A, Female: femaleData.A },
    { grade: 'Grade B', Male: maleData.B, Female: femaleData.B },
    { grade: 'Grade C', Male: maleData.C, Female: femaleData.C },
    { grade: 'Grade S', Male: maleData.S, Female: femaleData.S },
    { grade: 'Fail (F)', Male: maleData.F, Female: femaleData.F }
  ];

  // 5-Year Trend & Longitudinal Comparative Data (Pure database-driven, 0% mock data)
  const fiveYearTrends = React.useMemo(() => {
    if (!historicalResults || historicalResults.length === 0) {
      return [];
    }

    // Group real historical examination records by year
    const yearGroups = {};
    historicalResults.forEach(r => {
      const yr = r.year || r.examYear;
      if (!yr) return;
      if (!yearGroups[yr]) {
        yearGroups[yr] = { sat: 0, pass: 0 };
      }
      const a = r.acount ?? r.aCount ?? 0;
      const b = r.bcount ?? r.bCount ?? 0;
      const c = r.ccount ?? r.cCount ?? 0;
      const s = r.scount ?? r.sCount ?? 0;
      const f = r.fcount ?? r.fCount ?? 0;
      const sat = r.totalSat ?? (a + b + c + s + f);
      yearGroups[yr].sat += sat;
      yearGroups[yr].pass += (a + b + c + s);
    });

    const recordedYears = Object.keys(yearGroups).map(Number).sort((a, b) => a - b);
    if (recordedYears.length === 0) return [];

    // Select up to the latest 5 recorded years
    const trendYears = recordedYears.slice(-5);

    return trendYears.map(yr => {
      const g = yearGroups[yr];
      const entityRate = g.sat > 0 ? Number(((g.pass / g.sat) * 100).toFixed(1)) : 0;
      
      const natStat = (nationalStatsList || []).find(n => Number(n.year) === yr);
      const natB = natStat && natStat.passRate != null ? Number(natStat.passRate.toFixed(1)) : null;
      const provB = natB;
      const variance = provB != null ? Number((entityRate - provB).toFixed(1)) : 0;
      const natVariance = natB != null ? Number((entityRate - natB).toFixed(1)) : 0;

      return {
        year: String(yr),
        entityPassRate: entityRate,
        provincialBenchmark: provB ?? entityRate,
        nationalBenchmark: natB ?? entityRate,
        variance,
        natVariance
      };
    });
  }, [historicalResults, nationalStatsList]);

  const trendMetrics = React.useMemo(() => {
    if (!fiveYearTrends || fiveYearTrends.length === 0) {
      return { meanVariance: 0, peakYear: 'N/A', peakRate: 0, momentum: 0, avgRate: 0 };
    }
    const sumVariance = fiveYearTrends.reduce((acc, d) => acc + d.variance, 0);
    const meanVariance = Number((sumVariance / fiveYearTrends.length).toFixed(1));

    let peak = fiveYearTrends[0];
    fiveYearTrends.forEach(d => {
      if (d.entityPassRate > peak.entityPassRate) peak = d;
    });

    const momentum = Number((fiveYearTrends[fiveYearTrends.length - 1].entityPassRate - fiveYearTrends[0].entityPassRate).toFixed(1));
    const sumRates = fiveYearTrends.reduce((acc, d) => acc + d.entityPassRate, 0);
    const avgRate = Number((sumRates / fiveYearTrends.length).toFixed(1));

    return {
      meanVariance,
      peakYear: peak.year,
      peakRate: peak.entityPassRate,
      momentum,
      avgRate
    };
  }, [fiveYearTrends]);

  const handleOpenFullExplorer = () => {
    onClose();
    const params = new URLSearchParams();
    if (districtId && districtId !== 'all') params.set('district', districtId);
    if (zoneId && zoneId !== 'all') params.set('zone', zoneId);
    if (divisionId && divisionId !== 'all') params.set('division', divisionId);
    if (schoolId && schoolId !== 'all') params.set('school', schoolId);
    if (subjectId && subjectId !== 'all') params.set('subject', subjectId);
    if (selectedYear && selectedYear !== 'all') params.set('year', selectedYear);
    navigate(`/explore/results?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 sm:p-7 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white relative">
            <div className="flex items-start justify-between gap-4">
              <div className="pr-10">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-blue-300 mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>In-Place Performance Analytics</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm leading-snug">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  {subtitle}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Controls Bar: Tabs & Year Selector */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              {/* Tab Selector */}
              <div className="inline-flex p-1 rounded-2xl bg-white/10 border border-white/10">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{lang === 'si' ? 'සමස්ත පුවරුව' : lang === 'ta' ? 'மேலோட்டம்' : 'Overview'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('gender')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                    activeTab === 'gender'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{lang === 'si' ? 'ස්ත්‍රී / පුරුෂ වෙන්වීම' : lang === 'ta' ? 'பாலின முறிவு' : 'Gender Breakdown'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                    activeTab === 'trends'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{lang === 'si' ? 'වසර 5ක ප්‍රවණතා' : lang === 'ta' ? '5 வருட போக்குகள்' : '5-Year Trends'}</span>
                </button>
              </div>

              {/* Year Filter Pill */}
              <div className="flex items-center space-x-2 bg-white/10 border border-white/10 rounded-xl px-3 py-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-slate-300 font-bold">Year:</span>
                {activeTab === 'trends' ? (
                  fiveYearTrends.length > 0 ? (
                    <span className="text-emerald-300 font-extrabold tracking-wide">
                      {fiveYearTrends[0].year} – {fiveYearTrends[fiveYearTrends.length - 1].year} ({fiveYearTrends.length} {fiveYearTrends.length === 1 ? 'Cohort' : 'Cohorts'})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-bold tracking-wide">
                      {lang === 'si' ? 'වාර්තාගත වසර නොමැත' : 'No Trend Data'}
                    </span>
                  )
                ) : (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer"
                  >
                    {availableYears.length > 0 ? (
                      <>
                        <option value="all" className="text-slate-900">All Available Years</option>
                        {availableYears.map(yr => (
                          <option key={yr} value={yr} className="text-slate-900">{yr}</option>
                        ))}
                      </>
                    ) : (
                      <option value="all" className="text-slate-900">No Data in Database</option>
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(92vh-220px)] space-y-6">
            {activeTab !== 'trends' && loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-600">Gathering provincial examination analytics...</p>
              </div>
            ) : activeTab !== 'trends' && resultsData.length === 0 ? (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-black text-slate-800">No Direct Records Found for Selected Year</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  There are no registered results in the database matching this specific filter. You can switch the exam year or examine longitudinal performance across all 5 years.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('trends')}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'වසර 5ක ප්‍රවණතා බලන්න' : 'View 5-Year Performance Trends'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedYear('all')}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    View All Available Years
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── TAB 1: OVERVIEW ── */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* 4 Quick Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block mb-1">
                          {lang === 'si' ? 'පෙනීසිටි මුළු සිසුන්' : 'Total Sat'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-blue-900">
                          {effectiveTotalSat}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
                        <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 block mb-1">
                          {lang === 'si' ? 'සමත් ප්‍රතිශතය (%)' : 'Pass Rate (%)'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-teal-800">
                          {overallPassRate}%
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                          {lang === 'si' ? 'A සාමාර්ථ' : 'A Passes'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                          {aggregate.A}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 block mb-1">
                          {lang === 'si' ? 'අසමත් (F)' : 'Fails (F)'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-rose-600">
                          {aggregate.F}
                        </div>
                      </div>
                    </div>

                    {/* Grade Distribution Donut & Detail Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-3xl border border-slate-200">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>Grade Distribution Breakdown</span>
                        </h4>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={78}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px -3px rgba(0,0,0,0.1)' }} />
                              <Legend verticalAlign="bottom" height={32} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Grade Details Summary List */}
                      <div className="flex flex-col justify-center space-y-2.5">
                        {pieData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-sm">
                            <div className="flex items-center space-x-2.5">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-xs font-bold text-slate-700">{item.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-black text-slate-900">{item.value}</span>
                              <span className="text-[11px] font-bold text-slate-400 w-12 text-right">
                                {effectiveTotalSat > 0 ? ((item.value / effectiveTotalSat) * 100).toFixed(1) : 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 2: GENDER BREAKDOWN ── */}
                {activeTab === 'gender' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {maleSatEffective === 0 && femaleSatEffective === 0 ? (
                      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-1">
                          {lang === 'si' ? 'ස්ත්‍රී/පුරුෂ දත්ත සටහන් වී නොමැත' : 'No Gender Breakdown Data Available'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          {lang === 'si'
                            ? 'තෝරාගත් වර්ෂය සඳහා ස්ත්‍රී/පුරුෂ කාණ්ඩ වෙන්කළ විභාග වාර්තා ඇතුළත් කර නොමැත.'
                            : 'No gender-segregated examination records registered for the selected academic year.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Male vs Female Highlight Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Male Card */}
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 via-white to-blue-500/5 border-2 border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                            <span>👦 {lang === 'si' ? 'පිරිමි සිසුන්' : 'Male Students'}</span>
                          </span>
                          <span className="text-xs font-black text-blue-700">
                            {effectiveTotalSat > 0 ? ((maleData.sat / effectiveTotalSat) * 100).toFixed(0) : 0}% of Sat
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'පෙනීසිටි' : 'Sat'}</span>
                            <span className="text-xl font-black text-slate-800">{maleData.sat}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'සමත් %' : 'Pass Rate'}</span>
                            <span className="text-xl font-black text-blue-600">{malePassRate}%</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'A සාමාර්ථ' : 'A Passes'}</span>
                            <span className="text-lg font-black text-emerald-600">{maleData.A}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'අසමත් (F)' : 'Fails (F)'}</span>
                            <span className="text-lg font-black text-rose-500">{maleData.F}</span>
                          </div>
                        </div>
                      </div>

                      {/* Female Card */}
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 border-2 border-rose-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                            <span>👧 {lang === 'si' ? 'ගැහැණු සිසුන්' : 'Female Students'}</span>
                          </span>
                          <span className="text-xs font-black text-rose-700">
                            {effectiveTotalSat > 0 ? ((femaleData.sat / effectiveTotalSat) * 100).toFixed(0) : 0}% of Sat
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'පෙනීසිටි' : 'Sat'}</span>
                            <span className="text-xl font-black text-slate-800">{femaleData.sat}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'සමත් %' : 'Pass Rate'}</span>
                            <span className="text-xl font-black text-rose-600">{femalePassRate}%</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'A සාමාර්ථ' : 'A Passes'}</span>
                            <span className="text-lg font-black text-emerald-600">{femaleData.A}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{lang === 'si' ? 'අසමත් (F)' : 'Fails (F)'}</span>
                            <span className="text-lg font-black text-rose-500">{femaleData.F}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Comparative Bar Chart: Male vs Female across Grades */}
                    <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-slate-800 flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          <span>{lang === 'si' ? 'ස්ත්‍රී / පුරුෂ සාමාර්ථ සංසන්දනය' : 'Male vs Female Grade Comparison'}</span>
                        </h4>
                        <div className="flex items-center space-x-3 text-xs font-bold">
                          <span className="flex items-center space-x-1.5">
                            <span className="w-3 h-3 rounded-md bg-blue-500" />
                            <span className="text-slate-600">Male</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <span className="w-3 h-3 rounded-md bg-pink-500" />
                            <span className="text-slate-600">Female</span>
                          </span>
                        </div>
                      </div>

                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={genderComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="grade" stroke="#64748b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderRadius: '12px',
                                color: '#fff',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                              }}
                            />
                            <Bar dataKey="Male" fill="#3b82f6" radius={[6, 6, 0, 0]} name={lang === 'si' ? 'පිරිමි' : 'Male'} />
                            <Bar dataKey="Female" fill="#ec4899" radius={[6, 6, 0, 0]} name={lang === 'si' ? 'ගැහැණු' : 'Female'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── TAB 3: 5-YEAR MULTI-COHORT TRENDS & VARIANCE ── */}
                {activeTab === 'trends' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {fiveYearTrends.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
                          <TrendingUp className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-1">
                          {lang === 'si' ? 'වසර 5ක ඇගයීම් වාර්තා නොමැත' : 'No 5-Year Trend Records Registered'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                          {lang === 'si'
                            ? 'මෙම අධ්‍යාපන කොට්ඨාසය හෝ පාසල සඳහා බහු-වාර්ෂික A/L විභාග ප්‍රතිඵල පද්ධතියට ඇතුළත් කළ පසු වාර්ෂික විචලනය හා ප්‍රවණතා මෙහි දිස්වනු ඇත.'
                            : 'Longitudinal variance trajectories and 5-year comparative performance metrics will automatically populate once multi-year G.C.E. A/L examination records are entered.'}
                        </p>
                        <button
                          onClick={handleOpenFullExplorer}
                          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
                        >
                          <span>{lang === 'si' ? 'පූර්ණ දත්ත ගවේෂකය විවෘත කරන්න' : 'Open Results Explorer'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* 4 Trend KPI Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {/* 1. Mean Variance */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              5-Yr Mean Variance
                            </span>
                            <div className={`text-2xl sm:text-3xl font-black ${trendMetrics.meanVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {trendMetrics.meanVariance >= 0 ? `+${trendMetrics.meanVariance}%` : `${trendMetrics.meanVariance}%`}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">vs. Provincial Avg</span>
                          </div>

                          {/* 2. Peak Year */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {lang === 'si' ? 'උච්චතම වසර' : 'Peak Year'}
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-blue-600">
                              {trendMetrics.peakYear}
                            </div>
                            <span className="text-[10px] text-blue-700/80 font-bold block mt-0.5">{trendMetrics.peakRate}% Pass Rate</span>
                          </div>

                          {/* 3. Momentum */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {lang === 'si' ? 'වසර 5ක වර්ධනය' : '5-Yr Momentum'}
                            </span>
                            <div className={`text-2xl sm:text-3xl font-black ${trendMetrics.momentum >= 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                              {trendMetrics.momentum >= 0 ? `+${trendMetrics.momentum}%` : `${trendMetrics.momentum}%`}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              {fiveYearTrends[0].year} to {fiveYearTrends[fiveYearTrends.length - 1].year} Delta
                            </span>
                          </div>

                          {/* 4. 5-Yr Mean Pass Rate */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              5-Yr Average Rate
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-slate-800">
                              {trendMetrics.avgRate}%
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              Across {fiveYearTrends.length} cohort{fiveYearTrends.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Dynamic Composed Diverging Bar + Trend Line Chart matching Results Explorer */}
                        <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                              <div className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full mb-1">
                                <TrendingUp className="w-3 h-3 text-indigo-600" />
                                <span>Annual Performance Trajectory</span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 tracking-tight">
                                Performance Variance Trajectory ({fiveYearTrends[0].year} – {fiveYearTrends[fiveYearTrends.length - 1].year})
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {lang === 'si' ? 'පළාත් ප්‍රමිතියට සාපේක්ෂව වාර්ෂික සමත් ප්‍රතිශත විචලනය හා වර්ධන ප්‍රවණතා රේඛාව.' : 'Annual pass rate variance gap against provincial standard with connecting trajectory line.'}
                              </p>
                            </div>

                            {/* Legend Pills */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                                <span>Above Standard (+%)</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                                <span>Below Standard (-%)</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                                <span className="w-3 h-1 rounded bg-indigo-600" />
                                <span>Trend Line</span>
                              </span>
                            </div>
                          </div>

                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={fiveYearTrends} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                  dataKey="year" 
                                  stroke="#64748b" 
                                  fontSize={12} 
                                  fontWeight={800}
                                  tickLine={false} 
                                  axisLine={{ stroke: '#cbd5e1' }}
                                />
                                <YAxis 
                                  unit="%" 
                                  stroke="#64748b" 
                                  fontSize={11} 
                                  fontWeight={600}
                                  tickLine={false} 
                                  axisLine={false}
                                  tickFormatter={(v) => (v > 0 ? `+${v}%` : `${v}%`)}
                                  domain={[(dataMin) => Math.min(-6, Math.floor(dataMin - 2)), (dataMax) => Math.max(6, Math.ceil(dataMax + 2))]}
                                />
                                <ReferenceLine 
                                  y={0} 
                                  stroke="#0f172a" 
                                  strokeWidth={2}
                                  label={{
                                    value: '0.0% Baseline (Provincial Benchmark)',
                                    position: 'insideTopRight',
                                    fill: '#475569',
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    offset: 8
                                  }}
                                />
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;
                                    const data = payload[0].payload;
                                    const isPos = data.variance >= 0;
                                    return (
                                      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs min-w-[240px] space-y-1.5">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                                          <span className="text-slate-400 font-bold">Academic Cohort</span>
                                          <span className="font-black text-amber-400">Year {data.year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-300 font-semibold">Entity Pass Rate:</span>
                                          <span className="font-extrabold text-white">{data.entityPassRate}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-400 font-medium">NCP Provincial Avg:</span>
                                          <span className="font-bold text-slate-300">{data.provincialBenchmark}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-400 font-medium">National Avg:</span>
                                          <span className="font-bold text-slate-400">{data.nationalBenchmark}%</span>
                                        </div>
                                        <div className="flex justify-between pt-1.5 border-t border-slate-800">
                                          <span className="font-bold text-slate-200">Net Variance:</span>
                                          <span className={`font-black text-sm ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {isPos ? `+${data.variance}%` : `${data.variance}%`}
                                          </span>
                                        </div>
                                        <div className="pt-0.5 text-[11px] font-bold">
                                          {isPos ? (
                                            <span className="text-emerald-400 flex items-center gap-1">
                                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                                              <span>Outperforming benchmark by +{data.variance}%</span>
                                            </span>
                                          ) : (
                                            <span className="text-rose-400 flex items-center gap-1">
                                              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                                              <span>Below benchmark by {data.variance}%</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }}
                                />
                                {/* Diverging Bar */}
                                <Bar 
                                  dataKey="variance" 
                                  name="Variance Gap" 
                                  barSize={38} 
                                  radius={[6, 6, 6, 6]}
                                  isAnimationActive={false}
                                >
                                  {fiveYearTrends.map((entry, index) => (
                                    <Cell 
                                      key={`quick-var-cell-${index}`} 
                                      fill={entry.variance >= 0 ? '#10b981' : '#f43f5e'} 
                                    />
                                  ))}
                                </Bar>

                                {/* Overlaid Connecting Line */}
                                <Line 
                                  type="monotone" 
                                  dataKey="variance" 
                                  name="Trajectory Line"
                                  stroke="#6366f1" 
                                  strokeWidth={3} 
                                  dot={{ r: 5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                                  activeDot={{ r: 7, fill: '#4338ca' }}
                                  isAnimationActive={false}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* 5-Year Performance Audit Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800">
                              {lang === 'si' ? 'බහු-වාර්ෂික විගණනය' : 'Cohort Performance Audit'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                              {fiveYearTrends[0].year} – {fiveYearTrends[fiveYearTrends.length - 1].year}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-600">
                              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                  <th className="py-2.5 px-4">{lang === 'si' ? 'වර්ෂය' : 'Year'}</th>
                                  <th className="py-2.5 px-4">{lang === 'si' ? 'සමත් %' : 'Entity Pass Rate (%)'}</th>
                                  <th className="py-2.5 px-4">NCP Provincial Avg</th>
                                  <th className="py-2.5 px-4">National Avg</th>
                                  <th className="py-2.5 px-4 text-center">Net Variance</th>
                                  <th className="py-2.5 px-4 text-right">Evaluation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {fiveYearTrends.map((row, idx) => {
                                  const isPos = row.variance >= 0;
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center space-x-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>{row.year}</span>
                                      </td>
                                      <td className="py-2.5 px-4 font-black text-blue-600">{row.entityPassRate}%</td>
                                      <td className="py-2.5 px-4 text-slate-700">{row.provincialBenchmark}%</td>
                                      <td className="py-2.5 px-4 text-slate-500">{row.nationalBenchmark}%</td>
                                      <td className="py-2.5 px-4 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-black border ${
                                          isPos ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                          {isPos ? `+${row.variance}%` : `${row.variance}%`}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-right">
                                        {isPos ? (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Exceeding Standard (+{row.variance}%)</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Below Standard ({row.variance}%)</span>
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer with Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Data sourced directly from North Central Province Commerce Database.
            </span>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={handleOpenFullExplorer}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Open in Full Analytics Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
              >
                {lang === 'si' ? 'වසන්න' : 'Close'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default QuickAnalyticsModal;
