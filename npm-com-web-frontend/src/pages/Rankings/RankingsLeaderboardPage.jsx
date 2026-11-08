import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Award, Crown, Sparkles, Filter, Search,
  School, Building2, MapPin, ChevronRight, Download, BarChart3,
  CheckCircle2, ArrowUpRight, Flame, Star, Layers, RefreshCw, Printer, Info
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const RankingsLeaderboardPage = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialSchoolId = searchParams.get('schoolId') || '';
  const initialSubject = searchParams.get('subject') || 'all';
  const initialExam = searchParams.get('exam') || 'term';
  const initialYear = searchParams.get('year') || (initialExam === 'al' ? '2025' : '2027');

  // Filters state
  const [examType, setExamType] = useState(initialExam); // 'al', 'term', 'unit'
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [availableYears, setAvailableYears] = useState(
    initialExam === 'al' ? ['2025', '2024', '2023', '2022', '2021'] : ['2027', '2026', '2025', '2024', '2023']
  );
  const [selectedSubject, setSelectedSubject] = useState(initialSubject); // 'all', 'accounting', 'business', 'economics', 'ict'
  const [scope, setScope] = useState(initialSchoolId ? 'school' : 'province'); // 'province', 'district', 'zone', 'division', 'school'
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  // Handle switching Exam Type with smart year realignment based on actual backend data
  const handleExamTypeChange = (newExam) => {
    setExamType(newExam);
  };

  // Dynamically load available years for the selected exam type from backend
  useEffect(() => {
    fetch(`/api/public/rankings/years?examType=${examType}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const strYears = data.map(y => String(y));
          setAvailableYears(strYears);
          // If current selectedYear is not valid for this examType, auto-select latest
          if (!strYears.includes(selectedYear)) {
            setSelectedYear(strYears[0]);
          }
        }
      })
      .catch(() => {
        const fallbackYears = examType === 'al'
          ? ['2025', '2024', '2023', '2022', '2021']
          : ['2027', '2026', '2025', '2024', '2023'];
        setAvailableYears(fallbackYears);
        if (!fallbackYears.includes(selectedYear)) {
          setSelectedYear(fallbackYears[0]);
        }
      });
  }, [examType]);
  const [selectedSchool, setSelectedSchool] = useState(initialSchoolId);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown options loaded dynamically
  const [districtsList, setDistrictsList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);

  // Data & loading state
  const [loading, setLoading] = useState(true);
  const [rawRankings, setRawRankings] = useState([]);

  // Helper for letter grade weights in A/L
  const getGradeScore = (grade) => {
    if (!grade) return 0;
    const g = String(grade).trim().toUpperCase();
    if (g === 'A') return 5;
    if (g === 'B') return 4;
    if (g === 'C') return 3;
    if (g === 'S') return 2;
    if (g === 'F') return 1;
    return 0;
  };

  // Load geo hierarchies
  useEffect(() => {
    fetch('/api/public/districts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistrictsList(data);
        } else {
          setDistrictsList([
            { id: 1, name: "Anuradhapura" },
            { id: 2, name: "Polonnaruwa" }
          ]);
        }
      })
      .catch(() => {
        setDistrictsList([
          { id: 1, name: "Anuradhapura" },
          { id: 2, name: "Polonnaruwa" }
        ]);
      });

    fetch('/api/public/schools')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSchoolsList(data);
      })
      .catch(() => {});
  }, []);

  // When district changes, load zones
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/public/zones?districtId=${selectedDistrict}`)
        .then(res => res.json())
        .then(data => setZonesList(data || []))
        .catch(() => {});
    } else {
      fetch(`/api/public/zones`)
        .then(res => res.json())
        .then(data => setZonesList(data || []))
        .catch(() => {});
    }
  }, [selectedDistrict]);

  // When zone changes, load divisions
  useEffect(() => {
    if (selectedZone) {
      fetch(`/api/public/divisions?zoneId=${selectedZone}`)
        .then(res => res.json())
        .then(data => setDivisionsList(data || []))
        .catch(() => {});
    } else {
      fetch(`/api/public/divisions`)
        .then(res => res.json())
        .then(data => setDivisionsList(data || []))
        .catch(() => {});
    }
  }, [selectedZone]);

  // Handle switching Scope tab with intelligent auto-selection
  const handleScopeChange = (newScope) => {
    setScope(newScope);
    if (newScope === 'district' && !selectedDistrict && districtsList.length > 0) {
      setSelectedDistrict(String(districtsList[0].id));
    }
    if (newScope === 'zone' && !selectedZone && zonesList.length > 0) {
      setSelectedZone(String(zonesList[0].id));
    }
    if (newScope === 'division' && !selectedDivision && divisionsList.length > 0) {
      setSelectedDivision(String(divisionsList[0].id));
    }
    if (newScope === 'school' && !selectedSchool && schoolsList.length > 0) {
      setSelectedSchool(String(schoolsList[0].id));
    }
  };

  // Fetch rankings from backend
  const fetchRankings = () => {
    setLoading(true);

    let subjectIdParam = '';
    // Accounting = 21, Business Studies = 20, Economics = 32, ICT = 34
    if (selectedSubject === 'accounting') subjectIdParam = '&subjectId=21';
    else if (selectedSubject === 'business') subjectIdParam = '&subjectId=20';
    else if (selectedSubject === 'economics') subjectIdParam = '&subjectId=32';
    else if (selectedSubject === 'ict') subjectIdParam = '&subjectId=34';

    let locationParams = '';
    if (scope === 'district' && selectedDistrict) locationParams += `&districtId=${selectedDistrict}`;
    if (scope === 'zone' && selectedZone) locationParams += `&zoneId=${selectedZone}`;
    if (scope === 'division' && selectedDivision) locationParams += `&divisionId=${selectedDivision}`;
    if (scope === 'school' && selectedSchool) locationParams += `&schoolId=${selectedSchool}`;

    const url = `/api/public/rankings?examType=${examType}&year=${selectedYear}${subjectIdParam}${locationParams}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch rankings");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setRawRankings(data);
        } else {
          setRawRankings([]);
        }
      })
      .catch(err => {
        console.warn("Backend rankings endpoint error or offline:", err);
        setRawRankings([]);
      })
      .finally(() => setLoading(false));
  };

  const getFallbackDataset = () => [];

  useEffect(() => {
    fetchRankings();
  }, [examType, selectedYear, selectedSubject]);

  // ── DYNAMIC HIERARCHICAL CALCULATION & FILTERING ──
  // Compute relative ranks (School #1, Division #1, Zonal #1, District #1, Province #1)
  // and dynamically apply subject sorting and scope filtering on the fly!
  const processedRankings = useMemo(() => {
    if (!rawRankings || rawRankings.length === 0) return [];

    // 1. First, sort master list by active subject or aggregate
    const sortedMaster = [...rawRankings].sort((a, b) => {
      if (examType === 'al') {
        if (selectedSubject === 'accounting') {
          const diff = getGradeScore(b.accountingGrade) - getGradeScore(a.accountingGrade);
          if (diff !== 0) return diff;
          return (b.zScore || 0) - (a.zScore || 0);
        } else if (selectedSubject === 'business') {
          const diff = getGradeScore(b.businessStudiesGrade) - getGradeScore(a.businessStudiesGrade);
          if (diff !== 0) return diff;
          return (b.zScore || 0) - (a.zScore || 0);
        } else if (selectedSubject === 'economics') {
          const diff = getGradeScore(b.economicsGrade) - getGradeScore(a.economicsGrade);
          if (diff !== 0) return diff;
          return (b.zScore || 0) - (a.zScore || 0);
        } else if (selectedSubject === 'ict') {
          const diff = getGradeScore(b.ictGrade) - getGradeScore(a.ictGrade);
          if (diff !== 0) return diff;
          return (b.zScore || 0) - (a.zScore || 0);
        } else {
          return (b.zScore || 0) - (a.zScore || 0);
        }
      } else {
        let valA, valB;
        if (selectedSubject === 'accounting') {
          valA = a.accounting || 0; valB = b.accounting || 0;
        } else if (selectedSubject === 'business') {
          valA = a.businessStudies || 0; valB = b.businessStudies || 0;
        } else if (selectedSubject === 'economics') {
          valA = a.economics || 0; valB = b.economics || 0;
        } else if (selectedSubject === 'ict') {
          valA = a.ict || 0; valB = b.ict || 0;
        } else {
          valA = a.totalMarks || 0; valB = b.totalMarks || 0;
        }
        return valB - valA;
      }
    });

    // 2. Track hierarchical counts (Province, District, Zone, Division, School)
    const schoolCounts = {};
    const divCounts = {};
    const zoneCounts = {};
    const distCounts = {};

    const enrichedMaster = sortedMaster.map((st, pIdx) => {
      const provinceRank = pIdx + 1;
      const sName = st.schoolName || 'Unknown School';
      const dName = st.divisionName || 'Unknown Division';
      const zName = st.zoneName || 'Unknown Zone';
      const distName = st.districtName || 'Unknown District';

      const sRank = (schoolCounts[sName] || 0) + 1;
      schoolCounts[sName] = sRank;

      const divRank = (divCounts[dName] || 0) + 1;
      divCounts[dName] = divRank;

      const zRank = (zoneCounts[zName] || 0) + 1;
      zoneCounts[zName] = zRank;

      const distRank = (distCounts[distName] || 0) + 1;
      distCounts[distName] = distRank;

      // 3. Assign localized top performance badge
      const badges = [];

      // Highest hierarchical achievement recognition
      if (provinceRank === 1) {
        badges.push("🏆 Province 1st Place (පළාත් ප්‍රථමයා)");
      } else if (provinceRank === 2) {
        badges.push("🥈 Province 2nd Place (පළාත් දෙවන ස්ථානය)");
      } else if (provinceRank === 3) {
        badges.push("🥉 Province 3rd Place (පළාත් තෙවන ස්ථානය)");
      } else if (distRank === 1) {
        badges.push(`🏛️ District 1st Place (${distName} දිස්ත්‍රික් ප්‍රථමයා)`);
      } else if (zRank === 1) {
        badges.push(`🏢 Zonal 1st Place (${zName} කලාප ප්‍රථමයා)`);
      } else if (divRank === 1) {
        badges.push(`🏬 Division 1st Place (${dName} කොට්ඨාස ප්‍රථමයා)`);
      } else if (sRank === 1) {
        badges.push(`🏫 School 1st Place (${sName.split(' ')[0]} ප්‍රථමයා)`);
      } else if (distRank === 2) {
        badges.push(`🥈 District 2nd Place (${distName})`);
      } else if (zRank === 2) {
        badges.push(`🥈 Zonal 2nd Place (${zName})`);
      } else if (sRank === 2) {
        badges.push(`🥈 School 2nd Place (පාසලේ 2 වන ස්ථානය)`);
      } else if (sRank === 3) {
        badges.push(`🥉 School 3rd Place (පාසලේ 3 වන ස්ථානය)`);
      } else if (provinceRank <= 10) {
        badges.push("⭐ Top 10 Star Performer");
      } else {
        badges.push(`🏫 School Rank #${sRank}`);
      }

      // Subject excellence badges (Distinction A for A/L, 95%+ for Term)
      if (examType === 'al') {
        const ag = st.accountingGrade;
        const bg = st.businessStudiesGrade;
        const eg = st.economicsGrade;
        const ig = st.ictGrade;
        const thirdG = eg || ig;
        if (ag === 'A' && bg === 'A' && thirdG === 'A') {
          badges.push("🎖️ Triple Distinction (3A)");
        }
        if (st.zScore >= 2.0) {
          badges.push(`🌟 High Z-Score (${st.zScore})`);
        }
        if (selectedSubject === 'accounting' && ag === 'A') {
          badges.push("📊 ACC Distinction (A)");
        } else if (selectedSubject === 'business' && bg === 'A') {
          badges.push("📈 BS Distinction (A)");
        } else if (selectedSubject === 'economics' && eg === 'A') {
          badges.push("📉 ECO Distinction (A)");
        } else if (selectedSubject === 'ict' && ig === 'A') {
          badges.push("💻 ICT Distinction (A)");
        }
      } else {
        if (st.accounting >= 95 && st.businessStudies >= 95 && (st.economics >= 95 || st.ict >= 95)) {
          badges.push("🎖️ Triple Distinction (95%+)");
        }
        if (selectedSubject === 'accounting' && st.accounting >= 95) {
          badges.push(`📊 Acc Top Scorer (${st.accounting})`);
        } else if (selectedSubject === 'business' && st.businessStudies >= 95) {
          badges.push(`📈 BS Top Scorer (${st.businessStudies})`);
        } else if (selectedSubject === 'economics' && st.economics >= 95) {
          badges.push(`📉 Eco Top Scorer (${st.economics})`);
        } else if (selectedSubject === 'ict' && st.ict >= 95) {
          badges.push(`💻 ICT Top Scorer (${st.ict})`);
        } else if (st.accounting >= 98 || st.businessStudies >= 98 || st.economics >= 98 || st.ict >= 98) {
          badges.push("💎 Distinction Scorer (98%+)");
        }
      }

      return {
        ...st,
        masterProvinceRank: provinceRank,
        schoolRank: sRank,
        divisionRank: divRank,
        zoneRank: zRank,
        districtRank: distRank,
        badges: badges
      };
    });

    // 4. Apply geographic scope filter
    let filtered = enrichedMaster;
    if (scope === 'district' && selectedDistrict) {
      filtered = filtered.filter(st => {
        const dObj = districtsList.find(d => String(d.id) === String(selectedDistrict));
        const dName = dObj ? dObj.name.toLowerCase() : '';
        return String(st.districtId) === String(selectedDistrict) || (st.districtName && st.districtName.toLowerCase().includes(dName));
      });
    } else if (scope === 'zone' && selectedZone) {
      filtered = filtered.filter(st => {
        const zObj = zonesList.find(z => String(z.id) === String(selectedZone));
        const zName = zObj ? zObj.name.toLowerCase() : '';
        return String(st.zoneId) === String(selectedZone) || (st.zoneName && st.zoneName.toLowerCase().includes(zName));
      });
    } else if (scope === 'division' && selectedDivision) {
      filtered = filtered.filter(st => {
        const divObj = divisionsList.find(d => String(d.id) === String(selectedDivision));
        const divName = divObj ? divObj.name.toLowerCase() : '';
        return (st.divisionName && st.divisionName.toLowerCase().includes(divName));
      });
    } else if (scope === 'school' && selectedSchool) {
      filtered = filtered.filter(st => {
        const schObj = schoolsList.find(s => String(s.id) === String(selectedSchool));
        const schName = schObj ? schObj.name.toLowerCase() : '';
        return String(st.schoolId) === String(selectedSchool) || (st.schoolName && st.schoolName.toLowerCase().includes(schName));
      });
    }

    // 5. Apply text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(st =>
        st.name?.toLowerCase().includes(q) ||
        st.indexNumber?.toLowerCase().includes(q) ||
        st.schoolName?.toLowerCase().includes(q) ||
        st.divisionName?.toLowerCase().includes(q) ||
        st.zoneName?.toLowerCase().includes(q)
      );
    }

    // 6. Assign local rank within the active filtered view
    return filtered.map((st, idx) => ({
      ...st,
      activeRank: idx + 1
    }));
  }, [rawRankings, examType, selectedSubject, scope, selectedDistrict, selectedZone, selectedDivision, selectedSchool, searchQuery, districtsList, zonesList, divisionsList, schoolsList]);

  // Top 10 Performers (Podium & Stars) for the active view
  const top10 = processedRankings.slice(0, 10);
  const rank1 = top10[0];
  const rank2 = top10[1];
  const rank3 = top10[2];
  const remainingTop10 = top10.slice(3, 10);

  // Active Subject Label
  const subjectDisplayLabel = {
    all: examType === 'al' 
      ? (lang === 'si' ? 'සියලු විෂයයන් හා Z-Score සමස්තය' : 'All 3 Subjects & Z-Score Rank')
      : (lang === 'si' ? 'විෂයයන් 3ම එකතුව (Aggregate / 300)' : 'All 3 Subjects Aggregate (300 Marks)'),
    accounting: lang === 'si' ? 'ගිණුම්කරණය (Accounting)' : 'Accounting (ගිණුම්කරණය)',
    business: lang === 'si' ? 'ව්‍යාපාර අධ්‍යයනය (Business Studies)' : 'Business Studies (ව්‍යාපාර අධ්‍යයනය)',
    economics: lang === 'si' ? 'ආර්ථික විද්‍යාව (Economics)' : 'Economics (ආර්ථික විද්‍යාව)',
    ict: lang === 'si' ? 'තොරතුරු තාක්ෂණය (ICT)' : 'Information Technology (ICT)'
  }[selectedSubject];

  const examDisplayLabel = {
    al: lang === 'si' ? `${selectedYear} උසස් පෙළ ඇගයීම් මිණුම් ලකුණු (${selectedYear} A/L Benchmark)` : `${selectedYear} A/L National Evaluation Benchmark`,
    term: lang === 'si' ? `${selectedYear} වාර විභාග ශ්‍රේණිගත කිරීම් (Term Test Evaluations)` : `${selectedYear} Term Test Evaluations (1st, 2nd & 3rd Terms)`,
    unit: lang === 'si' ? `${selectedYear} ඒකක ඇගයීම් ප්‍රමුඛතා (Unit Tests)` : `${selectedYear} Unit Test Modular Evaluations`
  }[examType];

  return (
    <div className="min-h-screen bg-slate-100/70 pb-28">

      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL LANDMARK ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[420px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: `url(/anuradhapura.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold text-slate-300">
            <Link to="/" className="hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15">
              Home
            </Link>
            <span>/</span>
            <Link to="/explore/results" className="hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15">
              Analytics
            </Link>
            <span>/</span>
            <span className="text-amber-300 font-black">Rankings & Leaderboard</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/30 to-amber-600/20 border border-amber-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 text-amber-300 shadow-lg">
                <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{lang === 'si' ? 'උතුරු මැද පළාත් වාණිජ විශිෂ්ටතා ගෞරව නාමාවලිය' : 'Provincial Commerce Honor Roll & Leaderboard'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {lang === 'si' ? 'වාණිජ සිසු ශ්‍රේණිගත කිරීම්' : 'Commerce Academic Leaderboard'}
              </h1>

              <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed font-medium drop-shadow-md">
                {lang === 'si'
                  ? 'වාර විභාග, ඒකක ඇගයීම් සහ උසස් පෙළ ප්‍රතිඵල පදනම් කරගනිමින් වැඩිම ලකුණු මට්ටමේ සිට පළමුවෙනියාගේ සිට සියවෙනියා දක්වා ස්වයංක්‍රීයව ගණනය කළ නිල ශ්‍රේණිගත කිරීම්.'
                  : 'Automated ranking hierarchy from 1st to 100th place across schools, divisions, zones, districts, and the North Central Province.'}
              </p>
            </div>

            {/* Quick KPI stats in header */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/15 p-4 rounded-3xl shadow-2xl flex-shrink-0">
              <div className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span><strong>Rank #1 to #100</strong> Filter Active</span>
              </div>
              <div className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                <Layers className="w-4 h-4 text-blue-400" />
                <span><strong>{processedRankings.length}</strong> Candidates Filtered</span>
              </div>
              <div className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span><strong>Live CMS & Auto-Rank</strong> Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DYNAMIC CONTROLS & FILTER SYSTEM (CLEAN MOBILE APP CONTROLS) ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xl border border-slate-200/90 space-y-3.5 sm:space-y-6">

          {/* Exam Type & Year Selector Bar (Sleek Mobile App Layout) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
            {/* Exam Type Segmented Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3 h-3 text-blue-500" />
                <span>{lang === 'si' ? 'විභාග වර්ගය:' : 'Exam Type:'}</span>
              </span>

              <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleExamTypeChange('al')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    examType === 'al'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎓 {lang === 'si' ? 'උසස් පෙළ' : 'A/L Benchmark'}
                </button>

                <button
                  onClick={() => handleExamTypeChange('term')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    examType === 'term'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📝 {lang === 'si' ? 'වාර විභාග' : 'Term Tests'}
                </button>

                <button
                  onClick={() => handleExamTypeChange('unit')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    examType === 'unit'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 {lang === 'si' ? 'ඒකක ඇගයීම්' : 'Unit Tests'}
                </button>
              </div>
            </div>

            {/* Year Selector & Live Sync in Single Clean Row */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-500 shrink-0">
                  {lang === 'si' ? 'වර්ෂය:' : 'Year:'}
                </span>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="bg-transparent text-xs font-black text-blue-700 outline-none cursor-pointer w-full"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchRankings}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Subject Filter & Scope Tabs (Responsive & Overflow-safe) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-center">
            {/* Subject Selector (7 Cols) */}
            <div className="lg:col-span-7 space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>{lang === 'si' ? 'විෂය තෝරාගැනීම:' : 'Subject Filter:'}</span>
              </label>
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
                {[
                  { id: 'all', label: examType === 'al' ? (lang === 'si' ? 'සියල්ල (3ම)' : 'All 3 & Z-Score') : (lang === 'si' ? 'සියල්ල (300)' : 'All 3 (300)') },
                  { id: 'accounting', label: lang === 'si' ? 'ගිණුම්කරණය' : 'Accounting' },
                  { id: 'business', label: lang === 'si' ? 'ව්‍යාපාර' : 'Business Studies' },
                  { id: 'economics', label: lang === 'si' ? 'ආර්ථික' : 'Economics' },
                  { id: 'ict', label: 'ICT' },
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedSubject === sub.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope / Geography Selector (5 Cols) - Perfectly Balanced 5-Col Grid */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>{lang === 'si' ? 'සීමාව (Geographic Scope):' : 'Geographic Scope:'}</span>
              </label>
              <div className="grid grid-cols-5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-0.5">
                {[
                  { id: 'province', label: lang === 'si' ? 'පළාත' : 'Province' },
                  { id: 'district', label: lang === 'si' ? 'දිස්ත්‍රික්' : 'District' },
                  { id: 'zone', label: lang === 'si' ? 'කලාප' : 'Zone' },
                  { id: 'division', label: lang === 'si' ? 'කොට්ඨාස' : 'Division' },
                  { id: 'school', label: lang === 'si' ? 'පාසල' : 'School' },
                ].map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => handleScopeChange(sc.id)}
                    className={`py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      scope === sc.id
                        ? 'bg-white text-blue-600 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conditional Drilldown Dropdowns based on Scope */}
          {scope !== 'province' && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
              {/* District */}
              {(scope === 'district' || scope === 'zone' || scope === 'division') && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {lang === 'si' ? 'දිස්ත්‍රික්කය තෝරන්න' : 'Select District'}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- All Districts --</option>
                    {districtsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name} District</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Zone */}
              {(scope === 'zone' || scope === 'division') && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {lang === 'si' ? 'කලාපය තෝරන්න' : 'Select Zone'}
                  </label>
                  <select
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- All Zones --</option>
                    {zonesList.map(z => (
                      <option key={z.id} value={z.id}>{z.name} Zone</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Division */}
              {scope === 'division' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {lang === 'si' ? 'කොට්ඨාසය තෝරන්න' : 'Select Division'}
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={e => setSelectedDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- All Divisions --</option>
                    {divisionsList.map(div => (
                      <option key={div.id} value={div.id}>{div.name} Division</option>
                    ))}
                  </select>
                </div>
              )}

              {/* School */}
              {scope === 'school' && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {lang === 'si' ? 'පාසල තෝරන්න' : 'Select School'}
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={e => setSelectedSchool(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- All Schools --</option>
                    {schoolsList.map(sch => (
                      <option key={sch.id} value={sch.id}>{sch.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Quick Search Input & Live Filter Notice */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'si' ? 'ශිෂ්‍ය නම, විභාග අංකය (Index), පාසල හෝ කොට්ඨාසය අනුව සොයන්න...' : 'Filter by student name, index number, school, or division...'}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{processedRankings.length} Candidates in Active View</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. HALL OF FAME / TOP 10 PODIUM (පළමු දස දෙනා) ── */}
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'si' ? 'විශිෂ්ටතම සිසු දස දෙනා' : 'Top 10 Hall of Fame'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {lang === 'si' ? `පළමු දස දෙනා — ${subjectDisplayLabel}` : `Top 10 Performers — ${subjectDisplayLabel}`}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {examDisplayLabel} • {scope.toUpperCase()} SCOPE • {examType === 'al' ? 'Ranked by Z-Score & Distinction Grades' : `Sorted by ${selectedSubject.toUpperCase()} Marks`}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>
              {examType === 'al' ? (
                <>Top Benchmark Z-Score: <strong className="text-emerald-700 font-mono text-sm">{rank1?.zScore || '0.000'}</strong></>
              ) : (
                <>Highest Score: <strong>{rank1 ? (selectedSubject !== 'all' ? rank1[selectedSubject === 'business' ? 'businessStudies' : selectedSubject] : rank1.totalMarks) : '0'}</strong></>
              )}
            </span>
          </div>
        </div>

        {/* PODIUM FOR TOP 3 */}
        {top10.length >= 3 && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">

            {/* 🥈 2ND PLACE (SILVER) */}
            {rank2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-300 relative overflow-hidden flex flex-col justify-between order-2 md:order-1 min-h-0 md:min-h-[440px]"
              >
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-200" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center shadow-inner">
                      <Medal className="w-6 h-6 text-slate-500" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                      Rank #{rank2.activeRank}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 line-clamp-1">{rank2.name}</h3>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">{rank2.indexNumber} • {rank2.gender}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <p className="font-bold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{rank2.schoolName}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{rank2.divisionName} • {rank2.zoneName} Zone</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-bold text-slate-500">
                      {examType === 'al' ? 'Z-Score & Results:' : (selectedSubject === 'all' ? 'Total Aggregate:' : `${selectedSubject.toUpperCase()} Mark:`)}
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {examType === 'al' ? (
                        <span className="font-mono text-emerald-700">{rank2.zScore}</span>
                      ) : (
                        <>
                          {selectedSubject === 'all' ? rank2.totalMarks : rank2[selectedSubject === 'business' ? 'businessStudies' : selectedSubject]}
                          <span className="text-xs text-slate-400"> {selectedSubject === 'all' ? '/ 300' : '/ 100'}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Exactly 3 subjects: unoffered subject displays clean '—' */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black bg-slate-100 p-2 rounded-xl">
                    <div className={selectedSubject === 'accounting' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      ACC<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank2.accountingGrade || '—') : (rank2.accounting ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'business' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      BS<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank2.businessStudiesGrade || '—') : (rank2.businessStudies ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'economics' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      ECO<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank2.economicsGrade || '—') : (rank2.economics ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'ict' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      ICT<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank2.ictGrade || '—') : (rank2.ict ?? '—')}
                      </span>
                    </div>
                  </div>

                  {examType === 'al' && rank2.gradeSummary && (
                    <div className="mt-2 text-center text-xs font-black text-blue-800 bg-blue-50 py-1 rounded-lg border border-blue-200">
                      🎓 {rank2.gradeSummary}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {rank2.badges?.map((b, bi) => (
                      <span key={bi} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🥇 1ST PLACE (GOLD PODIUM - PROMINENT & TALLEST) */}
            {rank1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-b from-amber-500/15 via-white to-amber-500/10 rounded-3xl p-7 shadow-2xl border-2 border-amber-400 relative overflow-hidden flex flex-col justify-between order-1 md:order-2 min-h-0 md:min-h-[480px] ring-4 ring-amber-400/25"
              >
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Crown className="w-8 h-8 fill-current" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
                        🏆 Rank #{rank1.activeRank} Champion
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-700 mt-1">
                        {scope === 'province' ? 'Provincial Topper' : `${scope.toUpperCase()} TOPPER`}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 line-clamp-1">{rank1.name}</h3>
                  <p className="text-xs font-mono font-bold text-amber-800 mt-0.5">{rank1.indexNumber} • {rank1.gender}</p>

                  <div className="mt-4 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-1 text-xs">
                    <p className="font-extrabold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                      <School className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>{rank1.schoolName}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span>{rank1.divisionName} • {rank1.zoneName} Zone</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-extrabold text-amber-900">
                      {examType === 'al' ? 'Z-Score & Results:' : (selectedSubject === 'all' ? 'Total Aggregate:' : `${selectedSubject.toUpperCase()} Mark:`)}
                    </span>
                    <span className="text-3xl font-black text-amber-600">
                      {examType === 'al' ? (
                        <span className="font-mono text-emerald-800">{rank1.zScore}</span>
                      ) : (
                        <>
                          {selectedSubject === 'all' ? rank1.totalMarks : rank1[selectedSubject === 'business' ? 'businessStudies' : selectedSubject]}
                          <span className="text-xs font-bold text-slate-400"> {selectedSubject === 'all' ? '/ 300' : '/ 100'}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Exactly 3 subjects: unoffered subject displays clean '—' */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black bg-amber-100/70 p-2 rounded-xl border border-amber-200">
                    <div className={selectedSubject === 'accounting' ? 'bg-amber-300 rounded py-0.5' : ''}>
                      ACC<br/>
                      <span className="text-amber-900 text-xs">
                        {examType === 'al' ? (rank1.accountingGrade || '—') : (rank1.accounting ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'business' ? 'bg-amber-300 rounded py-0.5' : ''}>
                      BS<br/>
                      <span className="text-amber-900 text-xs">
                        {examType === 'al' ? (rank1.businessStudiesGrade || '—') : (rank1.businessStudies ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'economics' ? 'bg-amber-300 rounded py-0.5' : ''}>
                      ECO<br/>
                      <span className="text-amber-900 text-xs">
                        {examType === 'al' ? (rank1.economicsGrade || '—') : (rank1.economics ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'ict' ? 'bg-amber-300 rounded py-0.5' : ''}>
                      ICT<br/>
                      <span className="text-amber-900 text-xs">
                        {examType === 'al' ? (rank1.ictGrade || '—') : (rank1.ict ?? '—')}
                      </span>
                    </div>
                  </div>

                  {examType === 'al' && rank1.gradeSummary && (
                    <div className="mt-2 text-center text-xs font-black text-amber-950 bg-amber-200/90 py-1 rounded-lg border border-amber-300 shadow-sm">
                      👑 {rank1.gradeSummary}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {rank1.badges?.map((b, bi) => (
                      <span key={bi} className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🥉 3RD PLACE (BRONZE) */}
            {rank3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-amber-700/30 relative overflow-hidden flex flex-col justify-between order-3 md:order-3 min-h-0 md:min-h-[440px]"
              >
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center shadow-inner">
                      <Medal className="w-6 h-6 text-amber-700" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Rank #{rank3.activeRank}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 line-clamp-1">{rank3.name}</h3>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">{rank3.indexNumber} • {rank3.gender}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <p className="font-bold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{rank3.schoolName}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{rank3.divisionName} • {rank3.zoneName} Zone</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-bold text-slate-500">
                      {examType === 'al' ? 'Z-Score & Results:' : (selectedSubject === 'all' ? 'Total Aggregate:' : `${selectedSubject.toUpperCase()} Mark:`)}
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {examType === 'al' ? (
                        <span className="font-mono text-emerald-700">{rank3.zScore}</span>
                      ) : (
                        <>
                          {selectedSubject === 'all' ? rank3.totalMarks : rank3[selectedSubject === 'business' ? 'businessStudies' : selectedSubject]}
                          <span className="text-xs text-slate-400"> {selectedSubject === 'all' ? '/ 300' : '/ 100'}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Exactly 3 subjects: unoffered subject displays clean '—' */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black bg-slate-100 p-2 rounded-xl">
                    <div className={selectedSubject === 'accounting' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      ACC<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank3.accountingGrade || '—') : (rank3.accounting ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'business' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      BS<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank3.businessStudiesGrade || '—') : (rank3.businessStudies ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'economics' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      ECO<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank3.economicsGrade || '—') : (rank3.economics ?? '—')}
                      </span>
                    </div>
                    <div className={selectedSubject === 'ict' ? 'bg-amber-200/80 rounded py-0.5' : ''}>
                      ICT<br/>
                      <span className="text-blue-700 text-xs">
                        {examType === 'al' ? (rank3.ictGrade || '—') : (rank3.ict ?? '—')}
                      </span>
                    </div>
                  </div>

                  {examType === 'al' && rank3.gradeSummary && (
                    <div className="mt-2 text-center text-xs font-black text-amber-900 bg-amber-50 py-1 rounded-lg border border-amber-200">
                      🎓 {rank3.gradeSummary}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {rank3.badges?.map((b, bi) => (
                      <span key={bi} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* RANKS 4 TO 10 (STAR PERFORMERS GRID) */}
        {remainingTop10.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{lang === 'si' ? 'ප්‍රමුඛ පෙළේ 4 – 10 ශ්‍රේණිගත කිරීම්' : `Ranks #4 to #10 Star Performers (${selectedSubject.toUpperCase()})`}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remainingTop10.map(st => (
                <div
                  key={st.studentId || st.activeRank}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                      #{st.activeRank}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">{st.indexNumber}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">{st.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{st.schoolName}</p>
                    <p className="text-[10px] text-teal-600 font-bold">{st.divisionName} • {st.zoneName}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">
                      {examType === 'al' ? 'Z-Score / Result:' : (selectedSubject === 'all' ? 'Aggregate:' : `${selectedSubject.toUpperCase()}:`)}
                    </span>
                    <span className="text-base font-black text-blue-700">
                      {examType === 'al' ? (
                        <span className="font-mono text-emerald-700">
                          {st.zScore} <span className="text-[10px] text-slate-500 font-normal">({st.gradeSummary || 'Qualified'})</span>
                        </span>
                      ) : (
                        <>
                          {selectedSubject === 'all' ? st.totalMarks : st[selectedSubject === 'business' ? 'businessStudies' : selectedSubject]}
                          <span className="text-[10px] text-slate-400"> {selectedSubject === 'all' ? '/ 300' : '/ 100'}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {st.badges?.slice(0, 1).map((b, bi) => (
                      <span key={bi} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 line-clamp-1">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── 4. COMPLETE LEADERBOARD TABLE (1ST TO 100TH PLACE) ── */}
      <div className="max-w-7xl mx-auto px-6 mt-14">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'සම්පූර්ණ ශ්‍රේණිගත කිරීම් ලේඛනය' : 'Complete Ranked Candidate Roster'}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {lang === 'si' ? 'පළාත් වාණිජ කුසලතා ලේඛනය' : 'Official Ranked Candidates Table'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Showing {processedRankings.length} candidates in {scope.toUpperCase()} scope • {examType === 'al' ? `A/L Examination Year ${selectedYear}` : `${selectedYear} Test Evaluations`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">Live Auto-Calculation Active</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto mt-6">
            <div className="sm:hidden text-[10px] text-slate-400 font-semibold mb-2 flex items-center gap-1">
              <span>👉 Swipe horizontally to view all subjects, marks & ranks</span>
            </div>
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">School & Division</th>
                  <th className="py-3.5 px-4">Zone & District</th>
                  
                  {/* Subject columns (Grade for AL, Numerical mark for Term/Unit) */}
                  <th className={`py-3.5 px-3 text-center ${selectedSubject === 'accounting' ? 'bg-amber-100 text-amber-900 font-black' : ''}`}>
                    {examType === 'al' ? 'ACC Grade' : 'ACC'}
                  </th>
                  <th className={`py-3.5 px-3 text-center ${selectedSubject === 'business' ? 'bg-amber-100 text-amber-900 font-black' : ''}`}>
                    {examType === 'al' ? 'BS Grade' : 'BS'}
                  </th>
                  <th className={`py-3.5 px-3 text-center ${selectedSubject === 'economics' ? 'bg-amber-100 text-amber-900 font-black' : ''}`}>
                    {examType === 'al' ? 'ECO Grade' : 'ECO'}
                  </th>
                  <th className={`py-3.5 px-3 text-center ${selectedSubject === 'ict' ? 'bg-amber-100 text-amber-900 font-black' : ''}`}>
                    {examType === 'al' ? 'ICT Grade' : 'ICT'}
                  </th>

                  {/* Summary / Total Column depending on examType */}
                  {examType === 'al' ? (
                    <th className="py-3.5 px-4 text-center bg-blue-50 text-blue-900 font-black">
                      Grade Summary
                    </th>
                  ) : (
                    <>
                      <th className={`py-3.5 px-4 text-center ${selectedSubject === 'all' ? 'bg-blue-100 text-blue-900 font-black' : ''}`}>
                        Total / 300
                      </th>
                      <th className="py-3.5 px-3 text-center">Avg %</th>
                    </>
                  )}

                  <th className={`py-3.5 px-3 text-center ${examType === 'al' ? 'bg-emerald-50 text-emerald-900 font-black' : ''}`}>
                    Z-Score
                  </th>
                  <th className="py-3.5 px-4">Top Achievement / Local Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {processedRankings.map((st, idx) => {
                  const isTop3 = st.activeRank <= 3;
                  const isTop10 = st.activeRank <= 10;

                  return (
                    <tr
                      key={st.studentId || idx}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        isTop3 ? 'bg-amber-50/50 font-semibold' : isTop10 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 text-center">
                        {st.activeRank === 1 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center justify-center shadow-md">
                            🥇 1
                          </span>
                        ) : st.activeRank === 2 ? (
                          <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-black text-xs inline-flex items-center justify-center shadow">
                            🥈 2
                          </span>
                        ) : st.activeRank === 3 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs inline-flex items-center justify-center shadow">
                            🥉 3
                          </span>
                        ) : (
                          <span className={`w-7 h-7 rounded-lg text-xs font-black inline-flex items-center justify-center ${
                            isTop10 ? 'bg-blue-100 text-blue-700' : 'text-slate-600 bg-slate-100'
                          }`}>
                            #{st.activeRank}
                          </span>
                        )}
                      </td>

                      {/* Student Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">{st.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-500">
                          <span>{st.indexNumber}</span>
                          <span>•</span>
                          <span className={st.gender === 'FEMALE' ? 'text-pink-600 font-bold' : 'text-blue-600 font-bold'}>
                            {st.gender}
                          </span>
                        </div>
                      </td>

                      {/* School & Division */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/schools/${st.schoolId || 201}`}
                          className="font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {st.schoolName}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {st.divisionName} Division
                        </div>
                      </td>

                      {/* Zone & District */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-teal-700">{st.zoneName} Zone</div>
                        <div className="text-[11px] text-slate-400">{st.districtName}</div>
                      </td>

                      {/* Subject 1: Accounting (Grade or Mark, or '-' if none) */}
                      <td className={`py-3.5 px-3 text-center font-bold ${selectedSubject === 'accounting' ? 'bg-amber-100/70 text-amber-900 font-black text-sm' : 'text-slate-800'}`}>
                        {examType === 'al' ? (
                          st.accountingGrade ? (
                            <span className={st.accountingGrade === 'A' ? 'text-emerald-700 font-black' : 'text-blue-700'}>
                              {st.accountingGrade}
                            </span>
                          ) : <span className="text-slate-300 font-bold">—</span>
                        ) : (
                          st.accounting !== null && st.accounting !== undefined ? st.accounting : <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Subject 2: Business Studies (Grade or Mark, or '-' if none) */}
                      <td className={`py-3.5 px-3 text-center font-bold ${selectedSubject === 'business' ? 'bg-amber-100/70 text-amber-900 font-black text-sm' : 'text-slate-800'}`}>
                        {examType === 'al' ? (
                          st.businessStudiesGrade ? (
                            <span className={st.businessStudiesGrade === 'A' ? 'text-emerald-700 font-black' : 'text-blue-700'}>
                              {st.businessStudiesGrade}
                            </span>
                          ) : <span className="text-slate-300 font-bold">—</span>
                        ) : (
                          st.businessStudies !== null && st.businessStudies !== undefined ? st.businessStudies : <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Subject 3: Economics (Grade or Mark, or '-' if none / takes ICT) */}
                      <td className={`py-3.5 px-3 text-center font-bold ${selectedSubject === 'economics' ? 'bg-amber-100/70 text-amber-900 font-black text-sm' : 'text-slate-800'}`}>
                        {examType === 'al' ? (
                          st.economicsGrade ? (
                            <span className={st.economicsGrade === 'A' ? 'text-emerald-700 font-black' : 'text-blue-700'}>
                              {st.economicsGrade}
                            </span>
                          ) : <span className="text-slate-300 font-bold">—</span>
                        ) : (
                          st.economics !== null && st.economics !== undefined ? st.economics : <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Subject 4: ICT (Grade or Mark, or '-' if none / takes ECO) */}
                      <td className={`py-3.5 px-3 text-center font-bold ${selectedSubject === 'ict' ? 'bg-amber-100/70 text-amber-900 font-black text-sm' : 'text-slate-500'}`}>
                        {examType === 'al' ? (
                          st.ictGrade ? (
                            <span className={st.ictGrade === 'A' ? 'text-emerald-700 font-black' : 'text-blue-700'}>
                              {st.ictGrade}
                            </span>
                          ) : <span className="text-slate-300 font-bold">—</span>
                        ) : (
                          st.ict !== null && st.ict !== undefined ? st.ict : <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Grade Summary for AL, or Total / Avg for Term */}
                      {examType === 'al' ? (
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-black text-xs border border-blue-200 shadow-sm inline-block">
                            {st.gradeSummary || 'A/L Qualified'}
                          </span>
                        </td>
                      ) : (
                        <>
                          <td className={`py-3.5 px-4 text-center font-black text-sm ${selectedSubject === 'all' ? 'bg-blue-100/70 text-blue-900 font-black' : 'text-blue-700'}`}>
                            {st.totalMarks}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                            {st.averageMarks}%
                          </td>
                        </>
                      )}

                      {/* Z-Score */}
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-emerald-700 text-sm">
                        {st.zScore}
                      </td>

                      {/* Auto Localized Achievement Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {st.badges && st.badges.length > 0 ? (
                            st.badges.map((b, bi) => {
                              const isDistrict1st = b.includes("District 1st");
                              const isZone1st = b.includes("Zonal 1st");
                              const isDiv1st = b.includes("Division 1st");
                              const isSchool1st = b.includes("School 1st");
                              const isProv1st = b.includes("Province 1st");

                              let badgeClasses = "bg-slate-100 text-slate-700 border-slate-200";
                              if (isProv1st) badgeClasses = "bg-amber-400 text-slate-950 font-black border-amber-500 shadow-sm";
                              else if (isDistrict1st) badgeClasses = "bg-purple-100 text-purple-900 font-black border-purple-300 shadow-sm";
                              else if (isZone1st) badgeClasses = "bg-teal-100 text-teal-900 font-black border-teal-300 shadow-sm";
                              else if (isDiv1st) badgeClasses = "bg-blue-100 text-blue-900 font-bold border-blue-300";
                              else if (isSchool1st) badgeClasses = "bg-emerald-100 text-emerald-900 font-bold border-emerald-300";

                              return (
                                <span
                                  key={bi}
                                  className={`text-[10px] px-2 py-0.5 rounded border ${badgeClasses}`}
                                >
                                  {b}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Candidate</span>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

            {processedRankings.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Trophy size={32} />
                </div>
                <h3 className="text-base font-black text-slate-800">
                  {lang === 'si' ? 'මෙම නිර්ණායකය සඳහා ශ්‍රේණිගත කිරීම් දත්ත තවමත් ඇතුළත් කර නොමැත' : 'No Rankings Recorded Yet for this Criteria'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {lang === 'si' 
                    ? 'විභාග ලකුණු ඇතුළත් කළ පසු ශිෂ්‍ය ශ්‍රේණිගත කිරීම් ස්වයංක්‍රීයව මෙහි දිස්වනු ඇත.' 
                    : 'Once marks are entered through the Results Entry console, students will be automatically ranked and featured here.'}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default RankingsLeaderboardPage;
