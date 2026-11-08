import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2, Map, Users, School, GraduationCap, ChevronRight,
  MapPin, UserCog, Award, TrendingUp, Download, BarChart3, PhoneCall,
  CheckCircle2, Sparkles, BookOpen, Layers, ShieldCheck, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import QuickAnalyticsModal from '../../components/QuickAnalyticsModal';

const districtData = {
  anuradhapura: {
    id: 1,
    name: "Anuradhapura",
    nameSi: "අනුරාධපුරය",
    title: "Sacred City of Anuradhapura",
    titleSi: "අනුරාධපුර දිස්ත්‍රික් වාණිජ අධ්‍යාපන කේන්ද්‍රස්ථානය",
    subtitle: "Commerce Education Portal for Educational Zones, Divisions, and Registered Schools in Anuradhapura District.",
    subtitleSi: "අනුරාධපුර දිස්ත්‍රික්කයේ අධ්‍යාපන කලාප, කොට්ඨාස සහ වාණිජ පාසල්වල අධ්‍යාපන විශිෂ්ටත්වය මෙහෙයවන නිල ද්වාරය.",
    bgImage: "/anuradhapura.png",
    color: "blue"
  },
  polonnaruwa: {
    id: 2,
    name: "Polonnaruwa",
    nameSi: "පොළොන්නරුව",
    title: "Ancient Kingdom of Polonnaruwa",
    titleSi: "පොළොන්නරුව දිස්ත්‍රික් වාණිජ අධ්‍යාපන කේන්ද්‍රස්ථානය",
    subtitle: "Commerce Education Portal for Educational Zones, Divisions, and Registered Schools in Polonnaruwa District.",
    subtitleSi: "පොළොන්නරුව දිස්ත්‍රික්කයේ අධ්‍යාපන කලාප, කොට්ඨාස සහ වාණිජ පාසල්වල අධ්‍යාපන විශිෂ්ටත්වය මෙහෙයවන නිල ද්වාරය.",
    bgImage: "/polonnaruwa.png",
    color: "teal"
  }
};

const DistrictPage = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const dData = districtData[id] || districtData.anuradhapura;

  const [selectedZone, setSelectedZone] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zonesList, setZonesList] = useState([]);
  const [districtResults, setDistrictResults] = useState([]);
  const [districtLiveStats, setDistrictLiveStats] = useState({
    zones: 0,
    divisions: 0,
    schools: 0,
    teachers: 0,
    students: 0,
    passRateCurrent: 0,
    passRate2023: 0,
    passRate2024: 0,
    passRate2025: 0
  });

  const [yearlyProgression, setYearlyProgression] = useState([]);
  const [zoneLiveStats, setZoneLiveStats] = useState(null);
  const [divisionLiveStats, setDivisionLiveStats] = useState(null);

  // In-place Quick Analytics Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    districtId: null,
    zoneId: null,
    divisionId: null,
    schoolId: null,
    subjectId: null,
    year: '2025'
  });

  const openAnalytics = (config) => {
    setModalConfig({
      isOpen: true,
      title: config.title || 'Commerce Performance Analytics',
      subtitle: config.subtitle || 'G.C.E. A/L Commerce Results & Gender Analytics',
      districtId: config.districtId || dData.id,
      zoneId: config.zoneId || null,
      divisionId: config.divisionId || null,
      schoolId: config.schoolId || null,
      subjectId: config.subjectId || null,
      year: config.year || '2025'
    });
  };

  const closeAnalytics = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedZone(null);
    setSelectedDivision(null);
    setSchools([]);

    // 1. Fetch live district statistics from DB
    fetch(`/api/public/statistics/district/${dData.id}`)
      .then(res => res.json())
      .then(stat => {
        if (stat) {
          setDistrictLiveStats({
            zones: stat.zones ?? 0,
            divisions: stat.divisions ?? 0,
            schools: stat.schools ?? 0,
            teachers: stat.teachers ?? 0,
            students: stat.students ?? 0,
            passRateCurrent: stat.passRateCurrent ?? 0,
            passRate2023: stat.passRatePrev2 ?? 0,
            passRate2024: stat.passRatePrev1 ?? 0,
            passRate2025: stat.passRateCurrent ?? 0
          });
        }
      })
      .catch(() => {});

    // 2. Fetch zones dynamically from DB
    fetch(`/api/public/zones?districtId=${dData.id}`)
      .then(res => res.json())
      .then(dbZones => {
        if (Array.isArray(dbZones)) {
          const mapped = dbZones.map((z, idx) => ({
            ...z,
            id: z.id,
            name: z.name,
            nameSi: z.nameSi || z.name,
            image: z.image || `/slide_${(idx % 3) + 1}.png`,
            badge: lang === 'si' ? 'කලාප අධ්‍යාපන කාර්යාලය' : 'Zonal Education Office',
            divisionsCount: z.divisionsCount ?? (z.divisions ? z.divisions.length : 0),
            schoolsCount: z.schoolsCount ?? 0,
            directorName: z.directorName || null,
            teachersCount: z.teachersCount ?? 0,
            students: z.students ?? z.studentsCount ?? 0,
            studentsCount: z.studentsCount ?? z.students ?? 0
          }));
          setZonesList(mapped);
        } else {
          setZonesList([]);
        }
      })
      .catch(() => setZonesList([]));

    // 3. Fetch live results from DB for real dynamic auto-calculations
    fetch(`/api/public/al-results?districtId=${dData.id}`)
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) {
          setDistrictResults(resData);
        }
      })
      .catch(() => {});
  }, [id, dData.id]);

  // Dynamic 5-Year Examination Progression from DB
  useEffect(() => {
    let url = `/api/public/statistics/yearly-comparison?limit=5`;
    if (selectedDivision) {
      url += `&level=division&id=${selectedDivision.id}`;
    } else if (selectedZone) {
      url += `&level=zone&id=${selectedZone.id}`;
    } else {
      url += `&level=district&id=${dData.id}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res && res.data) setYearlyProgression(res.data);
      })
      .catch(() => {});
  }, [dData.id, selectedZone?.id, selectedDivision?.id]);

  const scrollToExplorer = () => {
    setTimeout(() => {
      const el = document.getElementById('explorer-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setSelectedDivision(null);
    setSchools([]);
    setZoneLiveStats(null);
    setDivisionLiveStats(null);
    setLoading(true);
    scrollToExplorer();

    fetch(`/api/public/statistics/zone/${zone.id}`)
      .then(res => res.json())
      .then(stat => setZoneLiveStats(stat))
      .catch(() => {});

    fetch(`/api/public/divisions?zoneId=${zone.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDivisions(data);
        } else {
          setDivisions([]);
        }
      })
      .catch(() => {
        setDivisions([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSelectDivision = (division) => {
    setSelectedDivision(division);
    setDivisionLiveStats(null);
    setLoading(true);
    scrollToExplorer();

    fetch(`/api/public/statistics/division/${division.id}`)
      .then(res => res.json())
      .then(stat => setDivisionLiveStats(stat))
      .catch(() => {});

    fetch(`/api/public/schools?divisionId=${division.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchools(data);
        } else {
          setSchools([]);
        }
      })
      .catch(() => {
        setSchools([]);
      })
      .finally(() => setLoading(false));
  };

  const handleResetToAllZones = () => {
    setSelectedZone(null);
    setSelectedDivision(null);
    setSchools([]);
    setZoneLiveStats(null);
    setDivisionLiveStats(null);
    scrollToExplorer();
  };

  const handleBackToZone = () => {
    setSelectedDivision(null);
    setSchools([]);
    setDivisionLiveStats(null);
    scrollToExplorer();
  };

  let step = 1;
  if (selectedDivision) step = 3;
  else if (selectedZone) step = 2;

  // Helper to compute live pass rates & student counts from DB results
  const computeLiveStats = (relevantResults, fallback) => {
    if (!relevantResults || relevantResults.length === 0) return { ...fallback, isLive: false };

    const calcYear = (yr) => {
      const records = relevantResults.filter(r => r.year === yr);
      if (records.length === 0) return null;
      let sat = 0, pass = 0;
      records.forEach(r => {
        sat += (r.totalSat || 0);
        pass += ((r.aCount || 0) + (r.bCount || 0) + (r.cCount || 0) + (r.sCount || 0));
      });
      return sat > 0 ? Number(((pass / sat) * 100).toFixed(1)) : null;
    };

    const p2025 = calcYear(2025) ?? fallback.passRate2025;
    const p2024 = calcYear(2024) ?? fallback.passRate2024;
    const p2023 = calcYear(2023) ?? fallback.passRate2023;
    const totalSat = relevantResults.reduce((acc, r) => acc + (r.totalSat || 0), 0);

    return {
      passRate2025: p2025,
      passRate2024: p2024,
      passRate2023: p2023,
      students: totalSat > 0 ? totalSat : fallback.students,
      isLive: Boolean(calcYear(2025) || calcYear(2024))
    };
  };

  // Dynamic Context-Aware Benchmarks (District vs Zone vs Division)
  let benchmarkContext;
  if (selectedDivision) {
    const divResults = districtResults.filter(r => 
      r.school?.division?.id === selectedDivision.id || 
      schools.some(s => s.id === r.school?.id)
    );
    const fallbackDiv = {
      passRate2023: 0,
      passRate2024: 0,
      passRate2025: 0,
      students: divisionLiveStats?.students ?? selectedDivision.students ?? schools.reduce((acc, s) => acc + (parseInt(s.students) || 0), 0)
    };
    const live = computeLiveStats(divResults, fallbackDiv);

    benchmarkContext = {
      type: 'division',
      badge: lang === 'si' ? `${selectedDivision.nameSi || selectedDivision.name} කොට්ඨාසය` : `${selectedDivision.name} Division`,
      title: lang === 'si'
        ? `${selectedDivision.nameSi || selectedDivision.name} කොට්ඨාස කාර්යසාධනය සහ පාසල් දර්ශක`
        : `${selectedDivision.name} Division Performance & Institutional Metrics`,
      subtitle: lang === 'si'
        ? `${selectedDivision.name} කොට්ඨාසයේ වාණිජ පාසල් ${schools.length || 0}ක්, ගුරුවරුන් හා සිසුන්ගේ ප්‍රගති විශ්ලේෂණය`
        : `Performance indicators, commerce teachers, and student enrolment in ${selectedDivision.name}`,
      schools: divisionLiveStats?.schools ?? (schools.length || selectedDivision.schoolsCount || 0),
      teachers: divisionLiveStats?.teachers ?? selectedDivision.teachersCount ?? schools.reduce((acc, s) => acc + (s.teachersCount || 0), 0),
      students: divisionLiveStats?.students ?? selectedDivision.students ?? (live.students || 0),
      passRate2023: divisionLiveStats?.passRatePrev2 ?? live.passRate2023 ?? 0,
      passRate2024: divisionLiveStats?.passRatePrev1 ?? live.passRate2024 ?? 0,
      passRate2025: divisionLiveStats?.passRateCurrent ?? live.passRate2025 ?? 0,
      isLive: Boolean((divisionLiveStats?.students || 0) > 0 || live.isLive),
      progressionTitle: lang === 'si'
        ? `${selectedDivision.name} කොට්ඨාස වාර්ෂික සාමාන්‍ය සමත් ප්‍රතිශත ප්‍රවණතාව`
        : `${selectedDivision.name} Division Pass Rate Progression`
    };
  } else if (selectedZone) {
    const zoneResults = districtResults.filter(r => 
      r.school?.division?.zone?.id === selectedZone.id || 
      (r.school?.division?.zone?.name && r.school.division.zone.name.toLowerCase() === selectedZone.name.toLowerCase())
    );
    const fallbackZone = {
      passRate2023: 0,
      passRate2024: 0,
      passRate2025: 0,
      students: zoneLiveStats?.students ?? selectedZone.students ?? 0
    };
    const live = computeLiveStats(zoneResults, fallbackZone);

    benchmarkContext = {
      type: 'zone',
      badge: lang === 'si' ? `${selectedZone.nameSi || selectedZone.name} කලාපය` : `${selectedZone.name} Zone`,
      title: lang === 'si'
        ? `${selectedZone.nameSi || selectedZone.name} කලාප කාර්යසාධන දර්ශක`
        : `${selectedZone.name} Zone Commerce Benchmarks`,
      subtitle: lang === 'si'
        ? `කොට්ඨාස ${selectedZone.divisionsCount || 0}ක් සහ වාණිජ පාසල් ${selectedZone.schoolsCount || 0}ක කලාපීය අධ්‍යාපන මිණුම් සලකුණු`
        : `Regional examination performance across ${selectedZone.divisionsCount || 0} divisions and ${selectedZone.schoolsCount || 0} commerce schools in ${selectedZone.name} Zone`,
      schools: zoneLiveStats?.schools ?? selectedZone.schoolsCount ?? 0,
      teachers: zoneLiveStats?.teachers ?? selectedZone.teachersCount ?? (zoneLiveStats?.teachersCount ?? 0),
      students: zoneLiveStats?.students ?? selectedZone.students ?? selectedZone.studentsCount ?? (live.students || 0),
      passRate2023: zoneLiveStats?.passRatePrev2 ?? live.passRate2023 ?? 0,
      passRate2024: zoneLiveStats?.passRatePrev1 ?? live.passRate2024 ?? 0,
      passRate2025: zoneLiveStats?.passRateCurrent ?? live.passRate2025 ?? 0,
      isLive: Boolean((zoneLiveStats?.students || selectedZone.students || selectedZone.studentsCount || 0) > 0 || live.isLive),
      progressionTitle: lang === 'si'
        ? `${selectedZone.name} කලාප වාර්ෂික සමත් ප්‍රතිශත ප්‍රවණතාව`
        : `${selectedZone.name} Zone Examination Pass Rate Progression`
    };
  } else {
    const fallbackDist = {
      passRate2023: districtLiveStats.passRate2023 || 0,
      passRate2024: districtLiveStats.passRate2024 || 0,
      passRate2025: districtLiveStats.passRate2025 || 0,
      students: districtLiveStats.students || 0
    };
    const live = computeLiveStats(districtResults, fallbackDist);

    benchmarkContext = {
      type: 'district',
      badge: lang === 'si' ? `${dData.nameSi} දිස්ත්‍රික්කය` : `${dData.name} District`,
      title: lang === 'si' ? `${dData.nameSi} දිස්ත්‍රික් කාර්යසාධන දර්ශක` : `${dData.name} District Commerce Benchmarks`,
      subtitle: lang === 'si' ? 'ප්‍රාදේශීය අධ්‍යාපන මිණුම් සලකුණු සහ විභාග ප්‍රවණතා' : 'Official regional metrics and examination benchmark targets',
      schools: districtLiveStats.schools || 0,
      teachers: districtLiveStats.teachers || 0,
      students: districtLiveStats.students || live.students || 0,
      passRate2023: districtLiveStats.passRate2023 || 0,
      passRate2024: districtLiveStats.passRate2024 || 0,
      passRate2025: districtLiveStats.passRate2025 || 0,
      isLive: Boolean(districtLiveStats.students > 0 || districtLiveStats.schools > 0 || live.isLive),
      progressionTitle: lang === 'si' ? 'වසර 3 ක සාමාන්‍ය සමත් ප්‍රතිශත ප්‍රවණතාව' : '3-Year District Examination Pass Rate Progression'
    };
  }

  // Dynamic Hero Presentation based on drill-down state (District -> Zone -> Division)
  let heroBadge, heroTitle, heroSubtitle, heroBgImage, heroKpis;
  if (selectedDivision) {
    heroBadge = lang === 'si'
      ? `${selectedDivision.nameSi || selectedDivision.name} අධ්‍යාපන කොට්ඨාසය`
      : `${selectedDivision.name} Educational Division`;
    heroTitle = lang === 'si'
      ? `${selectedDivision.nameSi || selectedDivision.name} කොට්ඨාස වාණිජ කේන්ද්‍රස්ථානය`
      : `${selectedDivision.name} Division Commerce Hub`;
    heroSubtitle = lang === 'si'
      ? `${selectedZone?.nameSi || selectedZone?.name} කලාපයේ ${selectedDivision.name} කොට්ඨාසයට අයත් ලියාපදිංචි වාණිජ පාසල්, ගුරුභවතුන් සහ විභාග කාර්යසාධන නිල ද්වාරය.`
      : `Official commerce education portal for all registered schools, faculty, and examination metrics in ${selectedDivision.name} Division.`;
    heroBgImage = selectedZone?.image || dData.bgImage;
    heroKpis = [
      { label: lang === 'si' ? 'අධ්‍යාපන කලාපය' : 'Parent Zone', value: selectedZone?.name || 'Zone', icon: MapPin, color: 'blue' },
      { label: lang === 'si' ? 'වාණිජ පාසල්' : 'Registered Schools', value: `${schools.length || selectedDivision.schoolsCount || 0}`, icon: School, color: 'emerald' },
      { label: lang === 'si' ? 'උසස් පෙළ සිසුන්' : 'Commerce Students', value: `${benchmarkContext.students || 0}`, icon: Users, color: 'teal' },
      { label: lang === 'si' ? 'ඉලක්කගත සමත් %' : 'Pass Benchmark', value: `${benchmarkContext.passRate2025 || 0}%`, icon: Award, color: 'amber' }
    ];
  } else if (selectedZone) {
    heroBadge = lang === 'si'
      ? `${selectedZone.nameSi || selectedZone.name} කලාප අධ්‍යාපන කාර්යාලය`
      : `${selectedZone.name} Educational Zone Hub`;
    heroTitle = lang === 'si'
      ? `${selectedZone.nameSi || selectedZone.name} කලාප වාණිජ කේන්ද්‍රස්ථානය`
      : `${selectedZone.name} Zonal Commerce Hub`;
    heroSubtitle = lang === 'si'
      ? `${selectedZone.nameSi || selectedZone.name} කලාපයේ කොට්ඨාස ${selectedZone.divisionsCount || 0}ක් සහ වාණිජ පාසල් ${selectedZone.schoolsCount || 0}ක අධ්‍යාපන විශිෂ්ටත්වය මෙහෙයවන නිල ද්වාරය.`
      : `Directing ${selectedZone.divisionsCount || 0} educational divisions and ${selectedZone.schoolsCount || 0} registered commerce schools across ${selectedZone.name} Zone.`;
    heroBgImage = selectedZone.image || dData.bgImage;
    heroKpis = [
      { label: lang === 'si' ? 'අධ්‍යාපන කොට්ඨාස' : 'Divisions', value: `${selectedZone.divisionsCount || 0}`, icon: Layers, color: 'teal' },
      { label: lang === 'si' ? 'වාණිජ පාසල්' : 'Commerce Schools', value: `${selectedZone.schoolsCount || 0}`, icon: School, color: 'emerald' },
      { label: lang === 'si' ? 'සිසු ප්‍රජාව' : 'Commerce Students', value: `${benchmarkContext.students || 0}`, icon: Users, color: 'blue' },
      { label: lang === 'si' ? 'ඉලක්කගත සමත් %' : 'Pass Benchmark', value: `${benchmarkContext.passRate2025 || 0}%`, icon: Award, color: 'amber' }
    ];
  } else {
    heroBadge = lang === 'si' ? `${dData.nameSi} දිස්ත්‍රික් වාණිජ අංශය` : `${dData.name} District Commerce Division`;
    heroTitle = lang === 'si' ? dData.titleSi : `${dData.name} District Commerce Hub`;
    heroSubtitle = lang === 'si'
      ? `අධ්‍යාපන කලාප ${districtLiveStats.zones}ක්, කොට්ඨාස ${districtLiveStats.divisions}ක් සහ ලියාපදිංචි වාණිජ පාසල් ${districtLiveStats.schools}ක වාණිජ අධ්‍යාපන විශිෂ්ටත්වය මෙහෙයවන නිල ද්වාරය.`
      : `Empowering ${districtLiveStats.zones} Educational Zone(s), ${districtLiveStats.divisions} Division(s), and ${districtLiveStats.schools} Commerce School(s) in ${dData.name} District.`;
    heroBgImage = dData.bgImage;
    heroKpis = [
      { label: lang === 'si' ? 'අධ්‍යාපන කලාප' : 'Educational Zones', value: `${districtLiveStats.zones}`, icon: MapPin, color: 'blue' },
      { label: lang === 'si' ? 'අධ්‍යාපන කොට්ඨාස' : 'Educational Divisions', value: `${districtLiveStats.divisions}`, icon: Layers, color: 'teal' },
      { label: lang === 'si' ? 'වාණිජ පාසල්' : 'Commerce Schools', value: `${districtLiveStats.schools}`, icon: School, color: 'emerald' },
      { label: lang === 'si' ? 'ඉලක්කගත සමත් %' : 'Pass Benchmark Target', value: `${districtLiveStats.passRateCurrent}%`, icon: Award, color: 'amber' }
    ];
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24">
      
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL LANDMARK IMAGE (DYNAMIC HIERARCHY!) ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[380px] sm:min-h-[420px] flex items-center transition-all duration-500">
        {/* Background Landmark Image */}
        <div
          key={heroBgImage}
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transition-all duration-700"
          style={{ backgroundImage: `url(${heroBgImage})` }}
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 w-full">
          {/* Back Navigation Bar */}
          <div className="flex items-center space-x-3 mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-1.5 rounded-full backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>{lang === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
            </Link>

            {step === 3 && (
              <button
                onClick={handleBackToZone}
                className="inline-flex items-center text-teal-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 px-4 py-1.5 rounded-full backdrop-blur-md cursor-pointer"
              >
                <span>← {lang === 'si' ? `නැවත ${selectedZone.name} කලාපයට` : `Back to ${selectedZone.name} Zone`}</span>
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleResetToAllZones}
                className="inline-flex items-center text-blue-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 px-4 py-1.5 rounded-full backdrop-blur-md cursor-pointer"
              >
                <span>← {lang === 'si' ? 'නැවත සියලු කලාප වෙත' : 'Back to All Zones'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/40 to-teal-500/30 border border-teal-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-teal-200 shadow-lg">
                <Building2 className="w-4 h-4 text-teal-300" />
                <span>{heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {heroTitle}
              </h1>

              <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed font-medium drop-shadow-md">
                {heroSubtitle}
              </p>
            </div>

            {/* Dynamic Quick KPI Stats Pill in Header */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/15 p-4 rounded-3xl shadow-2xl flex-shrink-0">
              {heroKpis.map((kpi, kIdx) => {
                const IconComponent = kpi.icon;
                const colorClasses = {
                  blue: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
                  teal: 'bg-teal-500/20 border-teal-400/30 text-teal-200',
                  emerald: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
                  amber: 'bg-amber-500/20 border-amber-400/30 text-amber-200'
                }[kpi.color] || 'bg-slate-500/20 border-slate-400/30 text-slate-200';

                return (
                  <div key={kIdx} className={`flex items-center space-x-3 px-3 py-1.5 rounded-xl border text-xs font-bold ${colorClasses}`}>
                    <IconComponent className="w-4 h-4" />
                    <span><strong>{kpi.value}</strong> • {kpi.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN REGIONAL EXPLORER AREA (CLEAN TOP MARGIN, ZERO CUTOFF!) ── */}
      <div id="explorer-content" className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-10 scroll-mt-24">
        
        {/* Stepper Breadcrumbs Bar (Mobile Responsive No-Cutoff Strip) */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-4 shadow-xs border border-slate-200/80 mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
            <button
              onClick={handleResetToAllZones}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap shrink-0 cursor-pointer ${
                step === 1 ? 'bg-blue-600 text-white shadow-xs font-black' : 'hover:bg-slate-100 text-slate-700 bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>1. {lang === 'si' ? 'කලාප (Zones)' : 'All Zones'}</span>
            </button>

            {selectedZone && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  onClick={handleBackToZone}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    step === 2 ? 'bg-teal-600 text-white shadow-xs font-black' : 'hover:bg-slate-100 text-slate-700 bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>2. {selectedZone.name} {lang === 'si' ? 'කලාපය' : 'Zone'}</span>
                </button>
              </>
            )}

            {selectedDivision && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 text-white shadow-xs font-black flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap shrink-0">
                  <School className="w-3.5 h-3.5 shrink-0" />
                  <span>3. {selectedDivision.name}</span>
                </span>
              </>
            )}
          </div>

          {step > 1 && (
            <button
              onClick={handleResetToAllZones}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto shrink-0 cursor-pointer"
            >
              {lang === 'si' ? '← සියලු කලාප වෙත' : '← Back to All Zones'}
            </button>
          )}
        </div>

        {/* STEP 1: RICH ZONES GRID (WITH PHOTOS, VIBRANT BADGES, NOT PLAIN WHITE!) */}
        {step === 1 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                  <MapPin className="w-7 h-7 text-blue-600" />
                  <span>
                    {lang === 'si'
                      ? `${dData.nameSi} දිස්ත්‍රික්කයේ අධ්‍යාපන කලාප (${zonesList.length})`
                      : `Educational Zones in ${dData.name} District (${zonesList.length})`}
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {lang === 'si'
                    ? 'කොට්ඨාස, පාසල් සහ විභාග තොරතුරු ගවේෂණය කිරීම සඳහා අදාළ කලාපය තෝරන්න.'
                    : 'Select any educational zone below to view its divisions, registered commerce schools, and coordinators.'}
                </p>
              </div>
            </div>

            {/* Vibrant Cards Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${zonesList.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
              {zonesList.map((zone, idx) => (
                <motion.div
                  key={zone.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectZone(zone)}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 hover:border-blue-500 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  {/* Card Thumbnail Image Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={zone.image}
                      alt={zone.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {zone.badge}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-black text-white drop-shadow-md">
                        {zone.name}
                      </h3>
                      <p className="text-blue-300 text-xs font-bold drop-shadow">
                        {zone.nameSi} කලාපය
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div>
                        <span className="text-base font-black text-slate-800 block">{zone.divisionsCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'si' ? 'කොට්ඨාස' : 'Divisions'}</span>
                      </div>
                      <div className="border-l border-slate-200">
                        <span className="text-base font-black text-blue-600 block">{zone.schoolsCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'si' ? 'පාසල්' : 'Schools'}</span>
                      </div>
                    </div>

                    <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 group-hover:from-blue-700 group-hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all">
                      <span>{lang === 'si' ? 'කොට්ඨාස ගවේෂණය කරන්න' : 'Explore Divisions'}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: DIVISIONS GRID */}
        {step === 2 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-md border border-slate-200">
            {/* Zonal Leadership Profile Card */}
            <div className="mb-5 sm:mb-8 p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl relative overflow-hidden border border-white/10">
              <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
                <div className="flex flex-row items-center gap-3 sm:gap-5">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-teal-400/60 shadow-xl bg-slate-800 flex-shrink-0">
                      <img
                        src="/provincial_director.png"
                        alt={selectedZone.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/slide_1.png'; }}
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-teal-500 text-slate-950 p-0.5 sm:p-1 rounded-full shadow-md" title="Official Authority">
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1 sm:mb-2">
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{lang === 'si' ? 'කලාප අධ්‍යාපන නායකත්වය' : 'Zonal Directorate'}</span>
                    </div>
                    <h3 className="text-base sm:text-2xl font-black text-white drop-shadow-sm truncate">
                      {selectedZone.directorName || (lang === 'si' ? 'කලාප අධ්‍යක්ෂ (පත්කිරීම අපේක්ෂිතයි)' : 'Zonal Director (Pending Appointment)')}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-teal-200 font-bold mt-0.5 truncate">
                      {lang === 'si' ? `කලාප අධ්‍යාපන අධ්‍යක්ෂ — ${selectedZone.nameSi || selectedZone.name} කලාපය` : `Zonal Director — ${selectedZone.name} Zone`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-300">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                        <span>{lang === 'si' ? `${selectedZone.name} කලාප අධ්‍යාපන කාර්යාලය` : `Zonal Education Office, ${selectedZone.name}`}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <School className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>{selectedZone.schoolsCount ?? 0} {lang === 'si' ? 'ලියාපදිංචි වාණිජ පාසල්' : 'Registered Commerce Schools'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="grid grid-cols-2 sm:flex sm:flex-row md:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <button
                    onClick={() => openAnalytics({
                      title: `${selectedZone.name} Zone Performance`,
                      subtitle: `${selectedZone.divisionsCount} Divisions • ${selectedZone.schoolsCount} Commerce Schools • Official Benchmark`,
                      zoneId: selectedZone.id
                    })}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-center"
                  >
                    <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'si' ? 'ප්‍රතිඵල' : 'Zonal Analytics'}</span>
                  </button>

                  <Link
                    to={`/downloads?district=${dData.id}&zone=${selectedZone.id}`}
                    className="px-3 sm:px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all text-center"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span>{lang === 'si' ? 'ප්‍රශ්න පත්‍ර' : 'Zonal Papers'}</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-2 inline-block">
                  {selectedZone.name} Zone ({selectedZone.nameSi} කලාපය)
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {lang === 'si' ? 'අධ්‍යාපන කොට්ඨාස තෝරන්න' : 'Select an Educational Division'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {lang === 'si' ? 'පාසල් ලැයිස්තුව හා වාණිජ අංශ විස්තර බැලීමට කොට්ඨාසයක් තෝරන්න.' : 'Click on any division below to view all commerce schools and department details.'}
                </p>
              </div>

              <button
                onClick={handleResetToAllZones}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
              >
                {lang === 'si' ? '← නැවත කලාප වෙත' : '← Back to Zones'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions.map((div, idx) => (
                <motion.div
                  key={div.id || idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDivision(div)}
                  className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/80 via-white to-blue-50/60 border-2 border-teal-200/80 hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-teal-600/30 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors mb-1">
                      {div.name}
                    </h4>
                    {div.nameSi && (
                      <p className="text-xs font-bold text-slate-500 mb-4">{div.nameSi}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-teal-100 flex items-center justify-between text-xs font-black text-teal-700">
                    <span className="flex items-center space-x-1.5">
                      <School className="w-4 h-4 text-teal-600" />
                      <span>{div.schoolsCount ?? 0} {div.schoolsCount === 1 ? (lang === 'si' ? 'පාසල' : 'School') : (lang === 'si' ? 'පාසල්' : 'Schools')}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-teal-600 group-hover:translate-x-1 transition-transform">
                      <span>{lang === 'si' ? 'පාසල් බලන්න' : 'View Schools'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SCHOOLS IN DIVISION */}
        {step === 3 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-md border border-slate-200">
            {/* Divisional Leadership Profile Card */}
            <div className="mb-5 sm:mb-8 p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white shadow-xl relative overflow-hidden border border-white/10">
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
                <div className="flex flex-row items-center gap-3 sm:gap-5">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-indigo-400/60 shadow-xl bg-slate-800 flex-shrink-0">
                      <img
                        src="/provincial_director.png"
                        alt={selectedDivision.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/slide_2.png'; }}
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-0.5 sm:p-1 rounded-full shadow-md" title="Division Authority">
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1 sm:mb-2">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{lang === 'si' ? 'කොට්ඨාස අධ්‍යාපනය' : 'Divisional Administration'}</span>
                    </div>
                    <h3 className="text-base sm:text-2xl font-black text-white drop-shadow-sm truncate">
                      {selectedDivision.directorName || (lang === 'si' ? 'කොට්ඨාස අධ්‍යක්ෂ (පත්කිරීම අපේක්ෂිතයි)' : 'Divisional Director (Pending Appointment)')}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-indigo-200 font-bold mt-0.5 truncate">
                      {lang === 'si' ? `කොට්ඨාස අධ්‍යාපන අධ්‍යක්ෂ — ${selectedDivision.nameSi || selectedDivision.name}` : `Divisional Director — ${selectedDivision.name}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-300">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{lang === 'si' ? `${selectedDivision.name} කොට්ඨාස අධ්‍යාපන කාර්යාලය` : `Divisional Education Office, ${selectedDivision.name}`}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <School className="w-3 h-3 text-teal-400 shrink-0" />
                        <span>{schools.length || selectedDivision.schoolsCount || 0} {lang === 'si' ? 'ලියාපදිංචි වාණිජ පාසල්' : 'Registered Commerce Schools'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="grid grid-cols-2 sm:flex sm:flex-row md:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <button
                    onClick={() => openAnalytics({
                      title: `${selectedDivision.name} Division Performance`,
                      subtitle: `${selectedZone?.name} Zone • Enrolled Commerce Schools: ${schools.length}`,
                      divisionId: selectedDivision.id,
                      zoneId: selectedZone?.id
                    })}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-center"
                  >
                    <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'si' ? 'ප්‍රතිඵල' : 'Division Analytics'}</span>
                  </button>

                  <Link
                    to={`/downloads?district=${dData.id}&zone=${selectedZone?.id}&division=${selectedDivision.id}`}
                    className="px-3 sm:px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all text-center"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <span>{lang === 'si' ? 'ප්‍රශ්න පත්‍ර' : 'Division Papers'}</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 mb-2 inline-block">
                  {selectedDivision.name} • {selectedZone?.name} Zone
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {lang === 'si' ? 'වාණිජ පාසල් නාමාවලිය' : 'Registered Commerce Schools'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {lang === 'si' ? 'විදුහල්පතිවරුන්, විෂය ප්‍රධානීන් සහ ශිෂ්‍ය සංඛ්‍යා ලේඛන' : 'Principal details, Commerce Section Head, and enrolled A/L & O/L students.'}
                </p>
              </div>

              <button
                onClick={handleBackToZone}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
              >
                {lang === 'si' ? '← නැවත කොට්ඨාස වෙත' : '← Back to Divisions'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schools.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-700">
                    {lang === 'si' ? 'මෙම කොට්ඨාසය තුළ වාණිජ පාසල් තවමත් ලියාපදිංචි කර නොමැත' : 'No commerce schools registered in this division yet'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'si' ? 'පාසල් ඇතුළත් කළ පසු ඒවා ස්වයංක්‍රීයව මෙහි දිස්වනු ඇත.' : 'Schools registered under this division will appear here.'}
                  </p>
                </div>
              ) : (
                schools.map((school, sIdx) => (
                <div
                  key={school.id || sIdx}
                  className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                        {school.type || '1AB National / Provincial'}
                      </span>
                      <span className="text-xs font-black text-slate-400">Rank #{sIdx + 1}</span>
                    </div>

                    <Link to={`/schools/${school.id}`} className="block">
                      <h4 className="text-xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                        <span>{school.name}</span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </h4>
                    </Link>

                    <div className="space-y-2.5 text-xs text-slate-700 bg-white p-4 rounded-2xl mb-4 border border-slate-200/80 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <UserCog className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-bold text-slate-500">{lang === 'si' ? 'විදුහල්පති:' : 'Principal:'}</span>
                        <span className="font-semibold text-slate-800">
                          {school.principal || (lang === 'si' ? 'පත්කර නොමැත' : 'Pending Appointment')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="font-bold text-slate-500">{lang === 'si' ? 'වාණිජ අංශ ප්‍රධානී:' : 'Commerce Head:'}</span>
                        <span className="font-semibold text-slate-800">
                          {school.sectionHead || school.commerceHead || (lang === 'si' ? 'පත්කර නොමැත' : 'Pending Appointment')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="font-bold text-slate-500">{lang === 'si' ? 'උසස් පෙළ සිසුන්:' : 'A/L Students:'}</span>
                        <span className="font-black text-indigo-700 text-sm">{school.students ?? school.activeStudents ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
                    <Link
                      to={`/schools/${school.id}`}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-teal-600/20"
                    >
                      <School className="w-3.5 h-3.5" />
                      <span>{lang === 'si' ? 'පාසල් තොරතුරු (ඇතුල්වන්න)' : 'View School Profile'}</span>
                    </Link>
                    <button
                      onClick={() => openAnalytics({
                        title: school.name,
                        subtitle: `${school.type || 'Commerce School'} • Principal: ${school.principal || 'N/A'} • ${selectedDivision?.name}`,
                        schoolId: school.id,
                        divisionId: selectedDivision?.id,
                        zoneId: selectedZone?.id
                      })}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{lang === 'si' ? 'ක්ෂණික ප්‍රතිඵල' : 'Results'}</span>
                    </button>
                    <Link
                      to={`/downloads?district=${dData.id}&zone=${selectedZone?.id}&division=${selectedDivision?.id}&school=${school.id}&schoolName=${encodeURIComponent(school.name)}`}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'si' ? 'පත්‍ර' : 'Papers'}</span>
                    </Link>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* ── 3. CONTEXT-AWARE BENCHMARKS & PROGRESSION (DISTRICT / ZONE / DIVISION) ── */}
        <div className="mt-14 bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {benchmarkContext.badge}
                  </div>
                  {benchmarkContext.isLive ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{lang === 'si' ? 'සජීවී CMS දත්ත' : 'Live CMS Data'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <span>{lang === 'si' ? 'නිල මිණුම් සලකුණු' : 'Official Targets'}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {benchmarkContext.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {benchmarkContext.subtitle}
                </p>
              </div>
            </div>

            {step > 1 && (
              <button
                onClick={handleResetToAllZones}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto"
              >
                {lang === 'si' ? '← දිස්ත්‍රික් දර්ශක බලන්න' : '← View District Benchmarks'}
              </button>
            )}
          </div>

          {/* 4 Balanced Cards in 4-Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
              <School className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{benchmarkContext.schools}</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {benchmarkContext.type === 'division' ? (lang === 'si' ? 'කොට්ඨාසයේ පාසල්' : 'Division Schools') : (lang === 'si' ? 'වාණිජ පාසල්' : 'Commerce Schools')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 shadow-sm">
              <UserCog className="w-5 h-5 text-teal-600 mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{benchmarkContext.teachers > 0 ? `${benchmarkContext.teachers}+` : 0}</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'si' ? 'සුදුසුකම්ලත් ගුරුවරු' : 'Certified Teachers'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm">
              <Users className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{(benchmarkContext.students || 0).toLocaleString()}</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'si' ? 'උසස් පෙළ සිසුන්' : 'A/L Students'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
              <Award className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{benchmarkContext.passRate2025}%</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'si' ? 'ඉලක්කගත සමත් ප්‍රතිශතය' : 'Pass Benchmark'}</p>
            </div>
          </div>

          {/* 5-Year Examination Progression */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg">
            <h4 className="text-sm font-black uppercase tracking-wider text-teal-300 mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {lang === 'si'
                  ? `වසර 5 ක සාමාන්‍ය සමත් ප්‍රතිශත ප්‍රවණතාව ${yearlyProgression.length > 0 ? `(${yearlyProgression[0].year} — ${yearlyProgression[yearlyProgression.length - 1].year})` : ''}`
                  : `5-Year Examination Pass Rate Progression ${yearlyProgression.length > 0 ? `(${yearlyProgression[0].year} — ${yearlyProgression[yearlyProgression.length - 1].year})` : ''}`}
              </span>
            </h4>

            <div className={`grid grid-cols-1 sm:grid-cols-${Math.max(yearlyProgression.length, 1)} gap-4 sm:gap-6`}>
              {yearlyProgression.length > 0 ? (
                yearlyProgression.map((item, idx) => {
                  const isLatest = idx === yearlyProgression.length - 1;
                  const barColors = ['bg-slate-400', 'bg-blue-400', 'bg-indigo-400', 'bg-cyan-400', 'bg-teal-400'];
                  const barColor = isLatest ? 'bg-teal-400' : (barColors[idx % barColors.length]);
                  return (
                    <div key={item.year}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className={isLatest ? 'text-teal-300 font-black' : 'text-slate-300'}>
                          {item.year} {isLatest ? (lang === 'si' ? '(නවතම)' : 'Target') : (lang === 'si' ? 'මිණුම' : 'Benchmark')}
                        </span>
                        <span className={isLatest ? 'text-teal-300 font-black' : 'text-white'}>
                          {item.passRate}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(item.passRate, 0))}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-xs text-slate-400 py-4 text-center">
                  {lang === 'si' ? 'විභාග දත්ත ඇතුළත් කර නොමැත.' : 'No examination progression records registered.'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              to={
                selectedDivision
                  ? `/downloads?district=${dData.id}&zone=${selectedZone?.id}&division=${selectedDivision.id}&divisionName=${encodeURIComponent(selectedDivision.name)}`
                  : selectedZone
                  ? `/downloads?district=${dData.id}&zone=${selectedZone.id}&zoneName=${encodeURIComponent(selectedZone.name)}`
                  : `/downloads?district=${dData.id}`
              }
              className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                {selectedDivision
                  ? (lang === 'si' ? `${selectedDivision.name} ප්‍රශ්න පත්‍ර` : `Download ${selectedDivision.name} Papers`)
                  : selectedZone
                  ? (lang === 'si' ? `${selectedZone.name} ප්‍රශ්න පත්‍ර` : `Download ${selectedZone.name} Papers`)
                  : (lang === 'si' ? 'ප්‍රශ්න පත්‍ර බාගත කරන්න' : 'Download District Papers')}
              </span>
            </Link>

            <button
              onClick={() => openAnalytics({
                title: benchmarkContext.title,
                subtitle: benchmarkContext.subtitle,
                districtId: dData.id,
                zoneId: selectedZone?.id,
                divisionId: selectedDivision?.id
              })}
              className="inline-flex items-center space-x-2 text-xs font-black text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{lang === 'si' ? 'ක්ෂණික ප්‍රස්ථාර සහ ස්ත්‍රී/පුරුෂ විශ්ලේෂණය' : 'Instant Charts & Gender Breakdown'}</span>
            </button>

            <Link
              to={
                selectedDivision
                  ? `/explore/results?district=${dData.id}&zone=${selectedZone?.id}&division=${selectedDivision.id}&divisionName=${encodeURIComponent(selectedDivision.name)}`
                  : selectedZone
                  ? `/explore/results?district=${dData.id}&zone=${selectedZone.id}&zoneName=${encodeURIComponent(selectedZone.name)}`
                  : `/explore/results?district=${dData.id}`
              }
              className="inline-flex items-center space-x-2 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-4 py-2.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>
                {selectedDivision
                  ? (lang === 'si' ? `${selectedDivision.name} සම්පූර්ණ විශ්ලේෂණය` : `${selectedDivision.name} Full Analytics`)
                  : selectedZone
                  ? (lang === 'si' ? `${selectedZone.name} සම්පූර්ණ විශ්ලේෂණය` : `${selectedZone.name} Full Analytics`)
                  : (lang === 'si' ? 'සම්පූර්ණ ප්‍රතිඵල පිටුව' : 'Full Results Explorer')}
              </span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{lang === 'si' ? 'කලාප කාර්යාලය අමතන්න' : 'Contact Zonal Authorities'}</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ── 4. QUICK ANALYTICS POPUP MODAL ── */}
      <QuickAnalyticsModal
        isOpen={modalConfig.isOpen}
        onClose={closeAnalytics}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        districtId={modalConfig.districtId}
        zoneId={modalConfig.zoneId}
        divisionId={modalConfig.divisionId}
        schoolId={modalConfig.schoolId}
        subjectId={modalConfig.subjectId}
        initialYear={modalConfig.year}
      />
    </div>
  );
};

export default DistrictPage;
