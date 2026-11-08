import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line, ReferenceLine
} from 'recharts';
import { 
  ChevronRight, Map as MapIcon, GraduationCap, School, ChevronDown, 
  Search, ArrowLeft, BarChart3, Filter, Users, TrendingUp, Award, Sparkles,
  GitCompare, TrendingDown, Layers, Building2, Target, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownRight, HelpCircle, Info
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const ResultsExplorer = () => {
  const { lang = 'en' } = useLanguage ? (useLanguage() || {}) : {};
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overall'); // 'overall' | 'gender' | 'variance'
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const rawDist = searchParams.get('district');
  let initialDistrict = 'all';
  if (rawDist) {
    if (rawDist.toLowerCase().includes('anuradhapura') || rawDist === '1') initialDistrict = '1';
    else if (rawDist.toLowerCase().includes('polonnaruwa') || rawDist === '2') initialDistrict = '2';
    else initialDistrict = rawDist;
  }
  const initialZone = searchParams.get('zone') || searchParams.get('zoneId') || 'all';
  const initialDivision = searchParams.get('division') || searchParams.get('divisionId') || 'all';
  const initialSchool = searchParams.get('school') || searchParams.get('schoolId') || 'all';
  const paramType = searchParams.get('type') || 'term';

  // Evaluation & Assessment Type State
  const [evalType, setEvalType] = useState(paramType);
  const [termOrUnit, setTermOrUnit] = useState('1');
  const [availableYears, setAvailableYears] = useState([]);
  const [unitDefinitions, setUnitDefinitions] = useState([]);
  const [yearlyProgression, setYearlyProgression] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    subjectId: 'all',
    year: 'all',
    districtId: initialDistrict,
    zoneId: initialZone,
    divisionId: initialDivision,
    schoolId: initialSchool,
  });

  // Reference Data
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [allZonesList, setAllZonesList] = useState([]);
  const [allDivisionsList, setAllDivisionsList] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const [nationalStats, setNationalStats] = useState([]);

  // Performance Variance & Comparison Controls State
  const [comparisonScope, setComparisonScope] = useState('PROVINCE_VS_NATIONAL'); // 'PROVINCE_VS_NATIONAL' | 'ZONE_VS_PROVINCE' | 'DIVISION_VS_PROVINCE'
  const [selectedCompZone, setSelectedCompZone] = useState('all');
  const [selectedCompDivision, setSelectedCompDivision] = useState('all');
  const [regionalBreakdownType, setRegionalBreakdownType] = useState('zones'); // 'zones' | 'divisions'

  const examType = evalType;

  // Fetch Reference Data on mount
  useEffect(() => {
    const fetchRefData = async () => {
      try {
        const distRes = await fetch('/api/public/districts');
        if(distRes.ok) setDistricts(await distRes.json());
        
        // Fetch all zones in province for comprehensive zonal comparisons
        const allZonesRes = await fetch('/api/public/zones');
        if(allZonesRes.ok) setAllZonesList(await allZonesRes.json());

        // Fetch all divisions in province for division comparisons
        const allDivsRes = await fetch('/api/public/divisions');
        if(allDivsRes.ok) setAllDivisionsList(await allDivsRes.json());

        // Fetch National Benchmark Statistics
        const natRes = await fetch('/api/public/national-statistics');
        if (natRes.ok) {
          const natData = await natRes.json();
          if (Array.isArray(natData) && natData.length > 0) setNationalStats(natData);
        }
        
        if (examType === 'ol') {
          setSubjects([
            { id: 'ol_ba', name: 'Business & Accounting', medium: 'SI' },
            { id: 'ol_ent', name: 'Entrepreneurship', medium: 'SI' }
          ]);
        } else {
          const fetchType = (examType === 'unit' || examType === 'term') ? 'AL' : examType.toUpperCase();
          const subjRes = await fetch(`/api/public/subjects?type=${fetchType}`);
          if(subjRes.ok) {
            const data = await subjRes.json();
            setSubjects((Array.isArray(data) ? data : []).filter(s => !s.name?.toLowerCase().includes('statistics')));
          }
        }
      } catch (err) {
        console.error("Error fetching reference data", err);
      }
    };
    fetchRefData();
  }, [examType]);

  // Auto-select subject if passed in URL query
  useEffect(() => {
    if (subjects.length > 0) {
      const paramSubject = searchParams.get('subject');
      const paramCode = searchParams.get('code');
      if (paramSubject || paramCode) {
        const match = subjects.find(s => 
          (paramCode && (String(s.id) === String(paramCode) || String(s.code) === String(paramCode))) ||
          (paramSubject && (s.name.toLowerCase().includes(paramSubject.toLowerCase()) || 
                            (s.nameSi && s.nameSi.toLowerCase().includes(paramSubject.toLowerCase()))))
        );
        if (match) {
          setFilters(prev => ({ ...prev, subjectId: String(match.id) }));
        }
      }
    }
  }, [subjects]);

  // Fetch cascaded dropdowns
  useEffect(() => {
    const fetchCascade = async () => {
      if (filters.districtId !== 'all') {
        const res = await fetch(`/api/public/zones?districtId=${filters.districtId}`);
        if(res.ok) setZones(await res.json());
      } else { setZones([]); setDivisions([]); setSchools([]); }
    };
    fetchCascade();
  }, [filters.districtId]);

  // Auto-select zone if matched from query
  useEffect(() => {
    if (zones.length > 0 && initialZone !== 'all') {
      const match = zones.find(z => String(z.id) === String(initialZone) || z.name.toLowerCase() === initialZone.toLowerCase());
      if (match) {
        setFilters(prev => ({ ...prev, zoneId: String(match.id) }));
      }
    }
  }, [zones]);

  useEffect(() => {
    const fetchCascade = async () => {
      if (filters.zoneId !== 'all') {
        const res = await fetch(`/api/public/divisions?zoneId=${filters.zoneId}`);
        if(res.ok) setDivisions(await res.json());
      } else { setDivisions([]); setSchools([]); }
    };
    fetchCascade();
  }, [filters.zoneId]);

  // Auto-select division if matched from query
  useEffect(() => {
    if (divisions.length > 0 && initialDivision !== 'all') {
      const match = divisions.find(d => String(d.id) === String(initialDivision) || d.name.toLowerCase() === initialDivision.toLowerCase());
      if (match) {
        setFilters(prev => ({ ...prev, divisionId: String(match.id) }));
      }
    }
  }, [divisions]);

  useEffect(() => {
    const fetchCascade = async () => {
      if (filters.divisionId !== 'all') {
        const res = await fetch(`/api/public/schools?divisionId=${filters.divisionId}`);
        if(res.ok) setSchools(await res.json());
      } else { setSchools([]); }
    };
    fetchCascade();
  }, [filters.divisionId]);

  // Auto-select school if matched from query
  useEffect(() => {
    if (schools.length > 0 && initialSchool !== 'all') {
      const match = schools.find(s => String(s.id) === String(initialSchool) || s.name.toLowerCase().includes(initialSchool.toLowerCase()));
      if (match) {
        setFilters(prev => ({ ...prev, schoolId: String(match.id) }));
      }
    }
  }, [schools]);

  // 1. Fetch available years dynamically from DB for active evaluation type
  useEffect(() => {
    fetch(`/api/public/evaluation-years?evalType=${evalType}`)
      .then(res => res.json())
      .then(years => {
        if (Array.isArray(years)) {
          setAvailableYears(years);
          if (years.length > 0) {
            setFilters(prev => ({
              ...prev,
              year: years.includes(parseInt(prev.year, 10)) ? prev.year : String(years[0])
            }));
          } else {
            setFilters(prev => ({ ...prev, year: 'all' }));
          }
        }
      })
      .catch(console.error);

    if (evalType === 'unit') {
      fetch('/api/public/unit-definitions')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUnitDefinitions(data);
        })
        .catch(console.error);
    }
  }, [evalType]);

  // 2. Fetch real 5-year comparison progression from DB
  useEffect(() => {
    fetch('/api/public/statistics/yearly-comparison?level=provincial&limit=5')
      .then(res => res.json())
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setYearlyProgression(res.data);
        }
      })
      .catch(console.error);
  }, []);

  // 3. Fetch Evaluation Results Data based on filters
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let url = new URL('/api/public/evaluation-results', window.location.origin);
        const activeEvalType = viewMode === 'variance' ? 'al' : evalType;
        url.searchParams.append('evalType', activeEvalType);
        if (activeEvalType === 'term' || activeEvalType === 'unit') {
          url.searchParams.append('termOrUnit', termOrUnit);
        }
        if (filters.schoolId !== 'all') url.searchParams.append('schoolId', filters.schoolId);
        else if (filters.divisionId !== 'all') url.searchParams.append('divisionId', filters.divisionId);
        else if (filters.zoneId !== 'all') url.searchParams.append('zoneId', filters.zoneId);
        else if (filters.districtId !== 'all') url.searchParams.append('districtId', filters.districtId);
        
        if (filters.subjectId !== 'all') url.searchParams.append('subjectId', filters.subjectId);
        if (filters.year !== 'all') url.searchParams.append('year', filters.year);

        const res = await fetch(url);
        if(res.ok) {
          const raw = await res.json();
          const filtered = (Array.isArray(raw) ? raw : []).filter(r => !r.subject?.name?.toLowerCase().includes('statistics'));
          filtered.sort((a, b) => {
            const schComp = (a.school?.name || '').localeCompare(b.school?.name || '');
            if (schComp !== 0) return schComp;
            return (a.subject?.name || '').localeCompare(b.subject?.name || '');
          });
          setResultsData(filtered);
        }
      } catch(err) {
        console.error("Error fetching results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [filters, evalType, termOrUnit, viewMode]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'districtId') { next.zoneId = 'all'; next.divisionId = 'all'; next.schoolId = 'all'; }
      if (name === 'zoneId') { next.divisionId = 'all'; next.schoolId = 'all'; }
      if (name === 'divisionId') { next.schoolId = 'all'; }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      subjectId: 'all',
      year: 'all',
      districtId: 'all',
      zoneId: 'all',
      divisionId: 'all',
      schoolId: 'all',
    });
  };

  // Process data for charts
  const aggregatedResults = resultsData.reduce((acc, curr) => {
    const a = curr.acount ?? curr.aCount ?? 0;
    const b = curr.bcount ?? curr.bCount ?? 0;
    const c = curr.ccount ?? curr.cCount ?? 0;
    const s = curr.scount ?? curr.sCount ?? 0;
    const f = curr.fcount ?? curr.fCount ?? 0;
    const sat = curr.totalSat || (a + b + c + s + f);

    acc.A = (acc.A || 0) + a;
    acc.B = (acc.B || 0) + b;
    acc.C = (acc.C || 0) + c;
    acc.S = (acc.S || 0) + s;
    acc.F = (acc.F || 0) + f;
    acc.total = (acc.total || 0) + sat;

    if (curr.maleTotal !== undefined || curr.femaleTotal !== undefined) {
      acc.hasGender = true;
      acc.male.A += curr.maleA || 0;
      acc.male.B += curr.maleB || 0;
      acc.male.C += curr.maleC || 0;
      acc.male.S += curr.maleS || 0;
      acc.male.F += curr.maleF || 0;
      acc.male.total += curr.maleTotal || 0;

      acc.female.A += curr.femaleA || 0;
      acc.female.B += curr.femaleB || 0;
      acc.female.C += curr.femaleC || 0;
      acc.female.S += curr.femaleS || 0;
      acc.female.F += curr.femaleF || 0;
      acc.female.total += curr.femaleTotal || 0;
    } else {
      const g = curr.gender ? String(curr.gender).toUpperCase() : null;
      if (g === 'MALE') {
        acc.male.A += a;
        acc.male.B += b;
        acc.male.C += c;
        acc.male.S += s;
        acc.male.F += f;
        acc.male.total += sat;
        acc.hasGender = true;
      } else if (g === 'FEMALE') {
        acc.female.A += a;
        acc.female.B += b;
        acc.female.C += c;
        acc.female.S += s;
        acc.female.F += f;
        acc.female.total += sat;
        acc.hasGender = true;
      }
    }

    return acc;
  }, {
    A:0, B:0, C:0, S:0, F:0, total: 0,
    hasGender: false,
    male: { A:0, B:0, C:0, S:0, F:0, total: 0 },
    female: { A:0, B:0, C:0, S:0, F:0, total: 0 }
  });

  const pieData = [
    { name: 'A Passes', value: aggregatedResults.A, color: '#10b981' }, // emerald-500
    { name: 'B Passes', value: aggregatedResults.B, color: '#3b82f6' }, // blue-500
    { name: 'C Passes', value: aggregatedResults.C, color: '#8b5cf6' }, // violet-500
    { name: 'S Passes', value: aggregatedResults.S, color: '#f59e0b' }, // amber-500
    { name: 'Fails', value: aggregatedResults.F, color: '#ef4444' }, // red-500
  ].filter(d => d.value > 0);

  const totalGradesSat = (aggregatedResults.A + aggregatedResults.B + aggregatedResults.C + aggregatedResults.S + aggregatedResults.F);
  const totalPassGrades = (aggregatedResults.A + aggregatedResults.B + aggregatedResults.C + aggregatedResults.S);
  const effectiveSat = totalGradesSat > 0 ? totalGradesSat : aggregatedResults.total;
  const passRate = effectiveSat > 0 
    ? Math.min(100.0, Number(((totalPassGrades / effectiveSat) * 100).toFixed(1)))
    : 0;

  // Real Gender Analytics (zero mock fallback)
  const maleStats = aggregatedResults.male;
  const femaleStats = aggregatedResults.female;

  const maleTotalGrades = (maleStats.A + maleStats.B + maleStats.C + maleStats.S + maleStats.F) || maleStats.total;
  const malePass = (maleStats.A + maleStats.B + maleStats.C + maleStats.S);
  const malePassRate = maleTotalGrades > 0 ? Math.min(100.0, Number(((malePass / maleTotalGrades) * 100).toFixed(1))) : 0;

  const femaleTotalGrades = (femaleStats.A + femaleStats.B + femaleStats.C + femaleStats.S + femaleStats.F) || femaleStats.total;
  const femalePass = (femaleStats.A + femaleStats.B + femaleStats.C + femaleStats.S);
  const femalePassRate = femaleTotalGrades > 0 ? Math.min(100.0, Number(((femalePass / femaleTotalGrades) * 100).toFixed(1))) : 0;

  const genderComparisonData = [
    { grade: 'Grade A', Male: maleStats.A, Female: femaleStats.A },
    { grade: 'Grade B', Male: maleStats.B, Female: femaleStats.B },
    { grade: 'Grade C', Male: maleStats.C, Female: femaleStats.C },
    { grade: 'Grade S', Male: maleStats.S, Female: femaleStats.S },
    { grade: 'Fail (F)', Male: maleStats.F, Female: femaleStats.F },
  ];

  const genderShareData = [
    { name: lang === 'si' ? 'ගැහැණු' : 'Female', value: femaleStats.total, color: '#ec4899' },
    { name: lang === 'si' ? 'පිරිමි' : 'Male', value: maleStats.total, color: '#3b82f6' }
  ].filter(d => d.value > 0);

  // ── 3. PERFORMANCE VARIANCE & COMPARATIVE ANALYSIS ──
  const fiveYearTrendData = useMemo(() => {
    // 1. Sri Lanka National Pass Rates map per year from DB
    const natMap = {};
    nationalStats.forEach(ns => {
      if (ns.year && ns.passRate) natMap[ns.year] = ns.passRate;
    });

    // 2. Determine scope & labels
    let entityTitle = lang === 'si' ? 'උතුරු මැද පළාත' : 'North Central Province';
    let benchmarkTitle = lang === 'si' ? 'ජාතික සාමාන්‍යය' : 'National Average';

    if (comparisonScope === 'ZONE_VS_PROVINCE') {
      const activeZoneId = selectedCompZone !== 'all' ? selectedCompZone : (filters.zoneId !== 'all' ? filters.zoneId : (allZonesList[0]?.id || '1'));
      const activeZoneObj = (allZonesList.length > 0 ? allZonesList : zones).find(z => String(z.id) === String(activeZoneId));
      const zName = activeZoneObj ? activeZoneObj.name : 'Zone';
      entityTitle = lang === 'si' ? `${zName} කලාපය` : `${zName} Zone`;
      benchmarkTitle = lang === 'si' ? 'පළාත් සාමාන්‍යය' : 'Provincial Average';

      // Find results for this zone
      const zResults = resultsData.filter(r => r.school?.division?.zone?.id === activeZoneId || (r.school?.division?.zone?.name && r.school.division.zone.name.toLowerCase() === zName.toLowerCase()));
      let totalSat = 0, totalPass = 0;
      zResults.forEach(r => {
        totalSat += (r.totalSat || (r.aCount||0) + (r.bCount||0) + (r.cCount||0) + (r.sCount||0) + (r.fCount||0));
        totalPass += ((r.aCount||0) + (r.bCount||0) + (r.cCount||0) + (r.sCount||0));
      });
      const zRate = totalSat > 0 ? Number(((totalPass / totalSat) * 100).toFixed(1)) : passRate;
      const bRate = passRate;
      const yr = filters.year !== 'all' ? String(filters.year) : (availableYears[0] ? String(availableYears[0]) : '2027');

      if (totalSat === 0 && passRate === 0) return [];
      return [{
        year: yr,
        entityPassRate: zRate,
        benchmarkPassRate: bRate,
        variance: Number((zRate - bRate).toFixed(1)),
        entityLabel: entityTitle,
        benchmarkLabel: benchmarkTitle,
      }];

    } else if (comparisonScope === 'DIVISION_VS_PROVINCE') {
      const activeDivObj = (allDivisionsList.length > 0 ? allDivisionsList : divisions).find(d => String(d.id) === String(selectedCompDivision)) ||
                           (allDivisionsList.length > 0 ? allDivisionsList[0] : null);
      const dName = activeDivObj ? activeDivObj.name : 'Division';
      entityTitle = lang === 'si' ? `${dName} කොට්ඨාසය` : `${dName} Division`;
      benchmarkTitle = lang === 'si' ? 'පළාත් සාමාන්‍යය' : 'Provincial Average';

      const dResults = resultsData.filter(r => r.school?.division?.id === activeDivObj?.id || (r.school?.division?.name && r.school.division.name.toLowerCase() === dName.toLowerCase()));
      let totalSat = 0, totalPass = 0;
      dResults.forEach(r => {
        totalSat += (r.totalSat || (r.aCount||0) + (r.bCount||0) + (r.cCount||0) + (r.sCount||0) + (r.fCount||0));
        totalPass += ((r.aCount||0) + (r.bCount||0) + (r.cCount||0) + (r.sCount||0));
      });
      const dRate = totalSat > 0 ? Number(((totalPass / totalSat) * 100).toFixed(1)) : passRate;
      const bRate = passRate;
      const yr = filters.year !== 'all' ? String(filters.year) : (availableYears[0] ? String(availableYears[0]) : '2027');

      if (totalSat === 0 && passRate === 0) return [];
      return [{
        year: yr,
        entityPassRate: dRate,
        benchmarkPassRate: bRate,
        variance: Number((dRate - bRate).toFixed(1)),
        entityLabel: entityTitle,
        benchmarkLabel: benchmarkTitle,
      }];
    }

    // Default: Province vs National Standard
    if (yearlyProgression.length > 0) {
      const valid = yearlyProgression.filter(yp => natMap[yp.year] != null);
      if (valid.length > 0) {
        return valid.map(yp => {
          const yr = yp.year;
          const eRate = yp.passRate != null ? yp.passRate : 0;
          const bRate = natMap[yr];
          return {
            year: String(yr),
            entityPassRate: eRate,
            benchmarkPassRate: bRate,
            variance: Number((eRate - bRate).toFixed(1)),
            entityLabel: entityTitle,
            benchmarkLabel: benchmarkTitle
          };
        });
      }
    }

    if (passRate > 0) {
      const activeYr = filters.year !== 'all' ? filters.year : (availableYears[0] ? availableYears[0] : null);
      if (activeYr && natMap[activeYr] != null) {
        const bRate = natMap[activeYr];
        return [{
          year: String(activeYr),
          entityPassRate: passRate,
          benchmarkPassRate: bRate,
          variance: Number((passRate - bRate).toFixed(1)),
          entityLabel: entityTitle,
          benchmarkLabel: benchmarkTitle
        }];
      }
    }

    return [];
  }, [nationalStats, yearlyProgression, passRate, comparisonScope, selectedCompZone, selectedCompDivision, allZonesList, allDivisionsList, zones, divisions, resultsData, filters.year, availableYears]);

  const varianceMetrics = useMemo(() => {
    if (!fiveYearTrendData || fiveYearTrendData.length === 0) {
      return { meanVariance: 0, peakYear: 'Active', peakVal: 0, currentDiff: 0, momentum: 0, latestYear: 'Active' };
    }
    const sum = fiveYearTrendData.reduce((acc, d) => acc + d.variance, 0);
    const meanVariance = Number((sum / fiveYearTrendData.length).toFixed(2));
    
    let peak = fiveYearTrendData[0];
    fiveYearTrendData.forEach(d => {
      if (d.variance > peak.variance) peak = d;
    });

    const currentDiff = fiveYearTrendData[fiveYearTrendData.length - 1].variance;
    const firstDiff = fiveYearTrendData[0].variance;
    const momentum = Number((currentDiff - firstDiff).toFixed(1));
    const latestYear = fiveYearTrendData[fiveYearTrendData.length - 1].year;

    return {
      meanVariance,
      peakYear: peak.year,
      peakVal: peak.variance,
      currentDiff,
      momentum,
      latestYear
    };
  }, [fiveYearTrendData]);

  // Zone Variance relative to Provincial Average (from REAL database zones)
  const zoneBreakdownData = useMemo(() => {
    const list = allZonesList.length > 0 ? allZonesList : zones;
    if (list.length === 0) return [];
    const provBase = passRate > 0 ? passRate : 0;

    return list.map(z => {
      const zResults = resultsData.filter(r => r.school?.division?.zone?.id === z.id || (r.school?.division?.zone?.name && r.school.division.zone.name.toLowerCase() === z.name.toLowerCase()));
      let totalSat = 0, totalPass = 0;
      zResults.forEach(r => {
        const a = r.aCount || r.acount || 0;
        const b = r.bCount || r.bcount || 0;
        const c = r.cCount || r.ccount || 0;
        const s = r.sCount || r.scount || 0;
        const f = r.fCount || r.fcount || 0;
        totalSat += (a + b + c + s + f);
        totalPass += (a + b + c + s);
      });
      const zPassRate = totalSat > 0 ? Number(((totalPass / totalSat) * 100).toFixed(1)) : provBase;
      const variance = Number((zPassRate - provBase).toFixed(1));
      return {
        name: z.name,
        passRate: zPassRate,
        benchmark: provBase,
        variance: variance,
        satCount: totalSat
      };
    }).sort((a, b) => b.variance - a.variance);
  }, [allZonesList, zones, resultsData, passRate]);

  // Division Variance relative to Provincial Average (from REAL database divisions)
  const divisionBreakdownData = useMemo(() => {
    const list = allDivisionsList.length > 0 ? allDivisionsList : divisions;
    if (list.length === 0) return [];
    const provBase = passRate > 0 ? passRate : 0;

    return list.map(d => {
      const dResults = resultsData.filter(r => r.school?.division?.id === d.id || (r.school?.division?.name && r.school.division.name.toLowerCase() === d.name.toLowerCase()));
      let totalSat = 0, totalPass = 0;
      dResults.forEach(r => {
        const a = r.aCount || r.acount || 0;
        const b = r.bCount || r.bcount || 0;
        const c = r.cCount || r.ccount || 0;
        const s = r.sCount || r.scount || 0;
        const f = r.fCount || r.fcount || 0;
        totalSat += (a + b + c + s + f);
        totalPass += (a + b + c + s);
      });
      const dPassRate = totalSat > 0 ? Number(((totalPass / totalSat) * 100).toFixed(1)) : provBase;
      const variance = Number((dPassRate - provBase).toFixed(1));
      return {
        name: d.name,
        passRate: dPassRate,
        benchmark: provBase,
        variance: variance,
        satCount: totalSat
      };
    }).sort((a, b) => b.variance - a.variance);
  }, [allDivisionsList, divisions, resultsData, passRate]);

  // Real Provincial vs National Performance Audit Table Data
  const nationalComparisonTableData = useMemo(() => {
    return fiveYearTrendData.map(d => ({
      year: d.year,
      provincePassRate: d.entityPassRate,
      nationalPassRate: d.benchmarkPassRate,
      variance: d.variance,
    }));
  }, [fiveYearTrendData]);

  // Custom tooltips with professional phrasing
  const CustomVarianceTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.variance >= 0;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white min-w-[260px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <span className="text-xs font-bold text-slate-400">{lang === 'si' ? 'අධ්‍යයන වර්ෂය' : 'Academic Year'}</span>
            <span className="text-sm font-black text-amber-400">Year {data.year}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">{data.entityLabel}:</span>
              <span className="font-extrabold text-white text-sm">{data.entityPassRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">{data.benchmarkLabel}:</span>
              <span className="font-bold text-slate-300 text-sm">{data.benchmarkPassRate}%</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="font-bold text-slate-200">{lang === 'si' ? 'ශුද්ධ වෙනස:' : 'Net Variance:'}</span>
              <span className={`font-black text-base ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? `+${data.variance}%` : `${data.variance}%`}
              </span>
            </div>
            <div className="pt-1 text-[11px] font-bold">
              {isPositive ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                  <span>Outperforming standard by +{data.variance}%</span>
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4 shrink-0" />
                  <span>Below standard by {data.variance}%</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomRegionalTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.variance >= 0;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white min-w-[240px]">
          <div className="font-black text-sm text-white mb-2 pb-2 border-b border-slate-800">
            {data.name}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{lang === 'si' ? 'සමත් %:' : 'Pass Rate:'}</span>
              <span className="font-bold text-white text-sm">{data.passRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{lang === 'si' ? 'පළාත් සාමාන්‍යය:' : 'Provincial Avg:'}</span>
              <span className="font-bold text-slate-300 text-sm">{data.benchmark}%</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-200">{lang === 'si' ? 'විචලනය:' : 'Net Variance:'}</span>
              <span className={`font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? `+${data.variance}%` : `${data.variance}%`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL LANDMARK IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[300px] sm:min-h-[380px] flex items-center pt-24 pb-8 sm:py-16">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/anuradhapura.png)` }}
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
                <BarChart3 className="w-4 h-4 text-teal-300" />
                <span>Provincial Performance Metrics</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {examType === 'ol' ? 'O/L Results Analytics' : 
                 examType === 'unit' ? 'Unit Test Analytics' : 
                 examType === 'term' ? 'Term Test Analytics' : 'A/L Results Analytics'}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Multi-dimensional evaluation across 2 districts, 11 educational zones, and registered commerce schools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN ANALYTICS CONTENT (ZERO OVERLAP!) ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        
        {/* Active Context Scope Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-md flex flex-wrap items-center justify-between gap-4">
          {viewMode === 'variance' ? (
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
              <span className="flex items-center text-teal-700">
                <Filter className="w-4 h-4 mr-1.5" />
                Active Scope:
              </span>
              <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                Level: {comparisonScope === 'PROVINCE_VS_NATIONAL' ? 'Province vs National' : comparisonScope === 'ZONE_VS_PROVINCE' ? 'Zone vs Province' : 'Division vs Province'}
              </span>
              {comparisonScope === 'ZONE_VS_PROVINCE' && (
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-black border border-teal-200">
                  Zone: {(allZonesList.length > 0 ? allZonesList : zones).find(z => String(z.id) === String(selectedCompZone))?.name || 'Anuradhapura Central'}
                </span>
              )}
              {comparisonScope === 'DIVISION_VS_PROVINCE' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black border border-blue-200">
                  Division: {(allDivisionsList.length > 0 ? allDivisionsList : divisions).find(d => String(d.id) === String(selectedCompDivision))?.name || 'Nuwaragam Palatha Central'}
                </span>
              )}
              {filters.subjectId !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black border border-blue-200">
                  Subject: {subjects.find(s => String(s.id) === String(filters.subjectId))?.name || filters.subjectId}
                </span>
              )}
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black border border-emerald-200">
                Benchmark: G.C.E. A/L Examination
              </span>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black border border-amber-200">
                {fiveYearTrendData.length > 0 
                  ? `Cohort: ${fiveYearTrendData.length}-Year Trend (${fiveYearTrendData[0].year}${fiveYearTrendData.length > 1 ? ` - ${fiveYearTrendData[fiveYearTrendData.length - 1].year}` : ''})`
                  : 'Live Database Benchmarks'}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
              <span className="flex items-center text-teal-700">
                <Filter className="w-4 h-4 mr-1.5" />
                Active Scope:
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black border border-emerald-200">
                Evaluation: {evalType === 'term' ? `Term ${termOrUnit} Exam` : evalType === 'unit' ? `Unit ${termOrUnit} Test` : 'National A/L Benchmark'}
              </span>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                District: {filters.districtId === 'all' ? 'All Districts' : districts.find(d => String(d.id) === String(filters.districtId))?.name || filters.districtId}
              </span>
              {filters.zoneId !== 'all' && (
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-black border border-teal-200">
                  Zone: {zones.find(z => String(z.id) === String(filters.zoneId))?.name || filters.zoneId}
                </span>
              )}
              {filters.divisionId !== 'all' && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-black border border-indigo-200">
                  Division: {divisions.find(d => String(d.id) === String(filters.divisionId))?.name || filters.divisionId}
                </span>
              )}
              {filters.schoolId !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-black border border-purple-200">
                  School: {schools.find(s => String(s.id) === String(filters.schoolId))?.name || filters.schoolId}
                </span>
              )}
              {filters.subjectId !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black border border-blue-200">
                  Subject: {subjects.find(s => String(s.id) === String(filters.subjectId))?.name || filters.subjectId}
                </span>
              )}
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black border border-amber-200">
                Year: {filters.year}
              </span>
            </div>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Reset to All NCP Overview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* FILTERS SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100">
                <Filter className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-slate-800">
                  {viewMode === 'variance' ? 'Variance Filters' : 'Filters'}
                </h2>
              </div>

              <div className="space-y-5">
                {/* 1. Evaluation / Examination Category (Only for All Students & Gender views; Variance is strictly A/L) */}
                {viewMode !== 'variance' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {lang === 'si' ? 'ඇගයීම් වර්ගය' : 'Evaluation Type'}
                      </label>
                      <select 
                        value={evalType} 
                        onChange={(e) => setEvalType(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2.5 px-3 outline-none transition-colors"
                      >
                        <option value="term">📝 School Term Tests (වාර විභාග)</option>
                        <option value="unit">📋 Modular Unit Tests (ඒකක පරීක්ෂණ)</option>
                        <option value="al">🎓 National A/L Benchmark (උසස් පෙළ)</option>
                      </select>
                    </div>

                    {/* Sub-selector for Term or Unit */}
                    {evalType === 'term' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'si' ? 'පාසල් වාරය' : 'School Term'}
                        </label>
                        <select
                          value={termOrUnit}
                          onChange={(e) => setTermOrUnit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2.5 px-3 outline-none transition-colors"
                        >
                          <option value="1">Term 1 (1 වන වාරය)</option>
                          <option value="2">Term 2 (2 වන වාරය)</option>
                          <option value="3">Term 3 (3 වන වාරය)</option>
                        </select>
                      </motion.div>
                    )}

                    {evalType === 'unit' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'si' ? 'ඒකක අංකය' : 'Modular Unit'}
                        </label>
                        <select
                          value={termOrUnit}
                          onChange={(e) => setTermOrUnit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2.5 px-3 outline-none transition-colors"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(u => (
                            <option key={u} value={String(u)}>Unit {u} ({lang === 'si' ? `${u} වන ඒකකය` : `Modular Unit ${u}`})</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                  <select name="subjectId" value={filters.subjectId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 outline-none transition-colors">
                    <option value="all">All Commerce Subjects</option>
                    {subjects
                      .filter(s => !s.name?.toLowerCase().includes('statistics'))
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.medium ? ` (${s.medium})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
                
                {viewMode === 'variance' ? (
                  /* ── VARIANCE ANALYSIS SCOPE CONTROLS IN SIDEBAR ── */
                  <>
                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {lang === 'si' ? 'සංසන්දන මට්ටම' : 'Comparison Level'}
                      </label>
                      <select
                        value={comparisonScope}
                        onChange={(e) => setComparisonScope(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                      >
                        <option value="PROVINCE_VS_NATIONAL">🏛️ Province vs National Standard</option>
                        <option value="ZONE_VS_PROVINCE">🗺️ Zone vs Provincial Average</option>
                        <option value="DIVISION_VS_PROVINCE">🏢 Division vs Provincial Average</option>
                      </select>
                    </div>

                    {comparisonScope === 'ZONE_VS_PROVINCE' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'si' ? 'කලාපය තෝරන්න' : 'Select Zone'}
                        </label>
                        <select
                          value={selectedCompZone}
                          onChange={(e) => setSelectedCompZone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                        >
                          <option value="all">{lang === 'si' ? 'සියලු කලාප (පළාත් සාමාන්‍යය)' : 'All Zones (Provincial Summary)'}</option>
                          {(allZonesList.length > 0 ? allZonesList : zones).map(z => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}

                    {comparisonScope === 'DIVISION_VS_PROVINCE' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'si' ? 'කොට්ඨාසය තෝරන්න' : 'Select Division'}
                        </label>
                        <select
                          value={selectedCompDivision}
                          onChange={(e) => setSelectedCompDivision(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                        >
                          <option value="all">{lang === 'si' ? 'සියලු කොට්ඨාස' : 'All Divisions'}</option>
                          {(allDivisionsList.length > 0 ? allDivisionsList : divisions).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5 mt-2">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Calculation Formula:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                        Variance = Entity Pass % - Standard Average %
                      </p>
                      <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-200 text-[10px] font-bold">
                        <span className="text-emerald-700">(+) Above Std</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-rose-700">(-) Below Std</span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── STANDARD FILTERS (for Overall & Gender views) ── */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {lang === 'si' ? 'විභාග / අධ්‍යයන වර්ෂය' : 'Exam Year'}
                      </label>
                      <select name="year" value={filters.year} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 outline-none transition-colors">
                        <option value="all">{lang === 'si' ? 'සියලු ලියාපදිංචි වර්ෂයන්' : 'All Recorded Years'}</option>
                        {availableYears.map(yr => (
                          <option key={yr} value={String(yr)}>{yr} A/L</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">District</label>
                      <select name="districtId" value={filters.districtId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 outline-none transition-colors">
                        <option value="all">All Districts (NCP)</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>

                    {zones.length > 0 && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Zone</label>
                        <select name="zoneId" value={filters.zoneId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 outline-none transition-colors">
                          <option value="all">All Zones</option>
                          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </select>
                      </motion.div>
                    )}

                    {divisions.length > 0 && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Division</label>
                        <select name="divisionId" value={filters.divisionId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 outline-none transition-colors">
                          <option value="all">All Divisions</option>
                          {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </motion.div>
                    )}

                    {schools.length > 0 && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">School</label>
                        <select name="schoolId" value={filters.schoolId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 outline-none transition-colors">
                          <option value="all">All Schools</option>
                          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </motion.div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>

          {/* RESULTS AREA */}
          <div className="lg:col-span-3 space-y-6">
            {/* View Mode Toggle Bar (Overflow Safe & Compact) */}
            <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 overflow-hidden">
              <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 min-w-max">
                  <button
                    onClick={() => setViewMode('overall')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                      viewMode === 'overall' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'සමස්ත ප්‍රතිඵල' : 'All Students'}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('gender')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                      viewMode === 'gender' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'ස්ත්‍රී / පුරුෂ වෙන්වීම' : 'Gender Breakdown'}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('variance')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                      viewMode === 'variance' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'ප්‍රතිඵල විචලනය' : 'Variance Analysis'}</span>
                  </button>
                </div>
              </div>
              
              <div className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center space-x-1.5 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">
                  {viewMode === 'overall' 
                    ? 'Aggregated Commerce Performance' 
                    : viewMode === 'gender' 
                    ? 'Male vs Female Analysis' 
                    : 'Performance Variance Trajectory'}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading analytics...</p>
              </div>
            ) : viewMode !== 'variance' && resultsData.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Data Found for Selected Exam Year</h3>
                <p className="text-slate-500 text-center max-w-sm mb-5">
                  We couldn't find individual A/L results matching your current filters. You can view 5-year longitudinal trend comparisons or select a different year.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setViewMode('variance')}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>{lang === 'si' ? 'වසර 5ක විචලනය බලන්න' : 'View 5-Year Trend & Variance Analysis'}</span>
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ── 1. OVERALL VIEW ── */}
                {viewMode === 'overall' ? (
                  <>
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sat</p>
                        <p className="text-3xl font-extrabold text-slate-800">{effectiveSat}</p>
                      </div>
                      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pass Rate</p>
                        <p className="text-3xl font-extrabold text-teal-600">{passRate}%</p>
                      </div>
                      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">A Passes</p>
                        <p className="text-3xl font-extrabold text-emerald-600">{aggregatedResults.A}</p>
                      </div>
                      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fails (W)</p>
                        <p className="text-3xl font-extrabold text-red-500">{aggregatedResults.F}</p>
                      </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Grade Distribution Pie Chart */}
                      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>Grade Distribution (A, B, C, S, F)</span>
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              />
                              <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Grade Breakdown Summary */}
                      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-6">Performance Distribution Summary</h3>
                        <div className="space-y-4">
                          {pieData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-black text-slate-900">{item.value}</span>
                                <span className="text-xs font-bold text-slate-500 w-12 text-right">
                                  {effectiveSat > 0 ? ((item.value / effectiveSat) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : viewMode === 'gender' ? (
                  /* ── 2. GENDER BREAKDOWN VIEW ── */
                  <>
                    {/* Gender Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Male Students */}
                      <div className="bg-gradient-to-br from-blue-500/10 via-white to-blue-500/5 rounded-3xl p-6 border-2 border-blue-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                            <span>👦 {lang === 'si' ? 'පිරිමි සිසුන්' : 'Male Students'}</span>
                          </span>
                          <span className="text-xs font-black text-blue-700">
                            {effectiveSat > 0 ? ((maleStats.total / effectiveSat) * 100).toFixed(1) : 0}% of Sat
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sat</span>
                            <span className="text-xl font-black text-slate-800">{maleStats.total}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pass %</span>
                            <span className="text-xl font-black text-blue-600">{malePassRate}%</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A Passes</span>
                            <span className="text-xl font-black text-emerald-600">{maleStats.A}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-blue-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fails (W)</span>
                            <span className="text-xl font-black text-rose-500">{maleStats.F}</span>
                          </div>
                        </div>
                      </div>

                      {/* Female Students */}
                      <div className="bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 rounded-3xl p-6 border-2 border-rose-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                            <span>👧 {lang === 'si' ? 'ගැහැණු සිසුන්' : 'Female Students'}</span>
                          </span>
                          <span className="text-xs font-black text-rose-700">
                            {effectiveSat > 0 ? ((femaleStats.total / effectiveSat) * 100).toFixed(1) : 0}% of Sat
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sat</span>
                            <span className="text-xl font-black text-slate-800">{femaleStats.total}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pass %</span>
                            <span className="text-xl font-black text-rose-600">{femalePassRate}%</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A Passes</span>
                            <span className="text-xl font-black text-emerald-600">{femaleStats.A}</span>
                          </div>
                          <div className="p-3 bg-white rounded-2xl border border-rose-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fails (W)</span>
                            <span className="text-xl font-black text-rose-500">{femaleStats.F}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Comparative Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Side-by-Side Grade Comparison Bar Chart */}
                      <div className="md:col-span-2 bg-white rounded-3xl shadow-md border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            <span>Male vs. Female Grade Comparison (A, B, C, S, F)</span>
                          </h3>
                          <div className="flex items-center space-x-3 text-xs font-bold">
                            <span className="flex items-center space-x-1">
                              <span className="w-3 h-3 rounded-md bg-blue-500" />
                              <span className="text-slate-600">Male</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span className="w-3 h-3 rounded-md bg-pink-500" />
                              <span className="text-slate-600">Female</span>
                            </span>
                          </div>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genderComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                              <Bar dataKey="Male" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Male (පිරිමි)" />
                              <Bar dataKey="Female" fill="#ec4899" radius={[6, 6, 0, 0]} name="Female (ගැහැණු)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Gender Enrolment Ratio Donut */}
                      <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 flex flex-col justify-between">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
                          <Users className="w-4 h-4 text-pink-500" />
                          <span>Commerce Enrollment Ratio</span>
                        </h3>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={genderShareData}
                                cx="50%"
                                cy="50%"
                                innerRadius={48}
                                outerRadius={68}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {genderShareData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                              <Legend verticalAlign="bottom" height={28} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs font-semibold text-slate-600 mt-2">
                          Female Pass Rate: <strong className="text-rose-600">{femalePassRate}%</strong> vs Male: <strong className="text-blue-600">{malePassRate}%</strong>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── 3. PERFORMANCE VARIANCE ANALYSIS ── */
                  <div className="space-y-6">
                    {/* Clean & Sleek Variance Analysis Title Bar */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 mb-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Provincial Performance Evaluation | ප්‍රතිඵල විචලන විග්‍රහය</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                          Annual Performance Variance Analysis
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          ජාතික සහ පළාත් මට්ටම්වලට සාපේක්ෂව වාර්ෂික සමත් ප්‍රතිශතවල වෙනස (Variance) සහ වර්ධන ප්‍රවණතාව.
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-bold shrink-0">
                        <span className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span>(+) Above Standard</span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          <span>(-) Below Standard</span>
                        </span>
                      </div>
                    </div>

                    {fiveYearTrendData.length === 0 ? (
                      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 sm:p-12 text-center my-6">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                          <Info className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-2">
                          {comparisonScope === 'PROVINCE_VS_NATIONAL' 
                            ? (lang === 'si' ? 'ශ්‍රී ලංකා ජාතික සමත් ප්‍රතිශත (National Benchmarks) ඇතුළත් කර නොමැත' : 'No National Benchmark Statistics Recorded')
                            : (lang === 'si' ? 'සංසන්දනය සඳහා ප්‍රමාණවත් විභාග දත්ත වාර්තා වී නොමැත' : 'No Comparative Examination Records Available')}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                          {comparisonScope === 'PROVINCE_VS_NATIONAL'
                            ? (lang === 'si'
                              ? 'ශ්‍රී ලංකා ජාතික සමත් ප්‍රතිශත තවමත් පද්ධතියට ඇතුළත් කර නොමැති බැවින් ජාතික මට්ටම සමඟ සංසන්දනය කළ නොහැක. ඔබට වම්පස "සංසන්දන මට්ටම" යටතේ "කලාප (Zone vs Province)" හෝ "කොට්ඨාස (Division vs Province)" තෝරා පළාත් සාමාන්‍යය සමඟ සසඳා බැලිය හැක.'
                              : 'National examination pass rates have not been entered into the system yet. You can switch the Comparison Level on the left to "Zone vs Provincial Average" or "Division vs Provincial Average" to view internal provincial benchmarks.')
                            : (lang === 'si'
                              ? 'තෝරාගත් පරාමිතීන් සඳහා උසස් පෙළ විභාග ප්‍රතිඵල සටහන්ව නොමැත.'
                              : 'No G.C.E. A/L examination records found matching the selected parameters.')}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* 4 Executive KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* 1. 5-Year Mean Variance */}
                          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              5-Year Mean Variance
                            </span>
                            <div className="flex items-baseline space-x-2">
                              <span className={`text-2xl sm:text-3xl font-black ${varianceMetrics.meanVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {varianceMetrics.meanVariance >= 0 ? `+${varianceMetrics.meanVariance}%` : `${varianceMetrics.meanVariance}%`}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">avg</span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-2">
                              {varianceMetrics.meanVariance >= 0 ? 'Consistent net outperformance' : 'Average historical deficit'}
                            </p>
                          </div>

                          {/* 2. Peak Variance Year */}
                          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Peak Achievement
                            </span>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                                {varianceMetrics.peakYear}
                              </span>
                              <span className="text-xs font-bold text-emerald-600">
                                +{varianceMetrics.peakVal}%
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-2">
                              Highest outperformance margin
                            </p>
                          </div>

                          {/* 3. Current Cohort Delta */}
                          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Latest Margin ({varianceMetrics.latestYear || 'Active'})
                            </span>
                            <div className="flex items-baseline space-x-2">
                              <span className={`text-2xl sm:text-3xl font-black ${varianceMetrics.currentDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {varianceMetrics.currentDiff >= 0 ? `+${varianceMetrics.currentDiff}%` : `${varianceMetrics.currentDiff}%`}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-2">
                              {varianceMetrics.currentDiff >= 0 ? 'Exceeding target standard' : 'Requires academic intervention'}
                            </p>
                          </div>

                          {/* 4. 5-Year Trajectory Shift */}
                          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              5-Year Momentum
                            </span>
                            <div className="flex items-baseline space-x-2">
                              <span className={`text-2xl sm:text-3xl font-black ${varianceMetrics.momentum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {varianceMetrics.momentum >= 0 ? `+${varianceMetrics.momentum}%` : `${varianceMetrics.momentum}%`}
                              </span>
                              <TrendingUp className={`w-4 h-4 ${varianceMetrics.momentum >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-2">
                              {varianceMetrics.momentum >= 0 ? 'Progressive acceleration' : 'Deceleration in margin'}
                            </p>
                          </div>
                        </div>

                        {/* Chart 1: Historical Performance & Variance Trajectory (Composed Bar + Line) */}
                        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 sm:p-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                              <div className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-2">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Annual Performance Trajectory</span>
                              </div>
                              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                {fiveYearTrendData.length > 1 ? `${fiveYearTrendData.length}-Year Performance Variance Trajectory` : 'Annual Performance Variance Trajectory'}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                {lang === 'si'
                                  ? `වාර්ෂික සමත් ප්‍රතිශත විචලනය (Diverging Bars) සහ වර්ධන ප්‍රවණතාව (${fiveYearTrendData.length > 0 ? `${fiveYearTrendData[0].year}${fiveYearTrendData.length > 1 ? ` සිට ${fiveYearTrendData[fiveYearTrendData.length - 1].year} දක්වා` : ''}` : 'පවතින අධ්‍යයන වර්ෂය'}).`
                                  : `Annual pass rate variance (diverging bars) and growth progression trajectory (${fiveYearTrendData.length > 0 ? `${fiveYearTrendData[0].year}${fiveYearTrendData.length > 1 ? ` to ${fiveYearTrendData[fiveYearTrendData.length - 1].year}` : ''}` : 'active academic cohort'}).`}
                              </p>
                            </div>

                            {/* Legend Pills */}
                            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-3 h-3 rounded bg-emerald-500" />
                                <span>Above Standard (+%)</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                                <span className="w-3 h-3 rounded bg-rose-500" />
                                <span>Below Standard (-%)</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                                <span className="w-3.5 h-1 rounded bg-indigo-600" />
                                <span>Connecting Trend Line</span>
                              </span>
                            </div>
                          </div>

                          {/* Composed Chart */}
                          <div className="w-full" style={{ width: '100%', height: 380, minHeight: 380 }}>
                            <ResponsiveContainer width="100%" height={380}>
                              <ComposedChart data={fiveYearTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="year" 
                                  tick={{ fill: '#1e293b', fontWeight: 800, fontSize: 13 }}
                                  tickLine={false}
                                  axisLine={{ stroke: '#cbd5e1' }}
                                />
                                <YAxis 
                                  unit="%"
                                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                  tickFormatter={(v) => (v > 0 ? `+${v}%` : `${v}%`)}
                                  tickLine={false}
                                  axisLine={false}
                                  domain={[(dataMin) => Math.min(-5, Math.floor(dataMin - 1)), (dataMax) => Math.max(5, Math.ceil(dataMax + 1))]}
                                />
                                <ReferenceLine 
                                  y={0} 
                                  stroke="#0f172a" 
                                  strokeWidth={2}
                                  label={{
                                    value: `0.0% Baseline (${fiveYearTrendData[0]?.benchmarkLabel || 'Standard'})`,
                                    position: 'insideTopRight',
                                    fill: '#475569',
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                    offset: 10
                                  }}
                                />
                                <Tooltip content={<CustomVarianceTooltip />} />
                                
                                {/* Diverging Bar */}
                                <Bar 
                                  dataKey="variance" 
                                  name="Variance Gap (විචලනය)" 
                                  barSize={48} 
                                  radius={[6, 6, 6, 6]}
                                  isAnimationActive={false}
                                >
                                  {fiveYearTrendData.map((entry, index) => (
                                    <Cell 
                                      key={`var-cell-${index}`} 
                                      fill={entry.variance >= 0 ? '#10b981' : '#f43f5e'} 
                                    />
                                  ))}
                                </Bar>

                                {/* Overlaid Connecting Line */}
                                <Line 
                                  type="monotone" 
                                  dataKey="variance" 
                                  name="Trajectory Line (ප්‍රවණතා රේඛාව)"
                                  stroke="#6366f1" 
                                  strokeWidth={3.5} 
                                  dot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2.5 }}
                                  activeDot={{ r: 8, fill: '#4338ca' }}
                                  isAnimationActive={false}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Chart 2: Regional Hierarchy Breakdown (Horizontal Diverging Bar Chart) */}
                    <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <div className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mb-2">
                            <GitCompare className="w-3.5 h-3.5" />
                            <span>Regional Performance Variance</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            {regionalBreakdownType === 'zones' 
                              ? (lang === 'si' ? `අධ්‍යාපන කලාප සංසන්දනය (${allZonesList.length || zones.length} කලාප)` : `Educational Zones vs Provincial Average (${allZonesList.length || zones.length} Zones)`)
                              : (lang === 'si' ? `අධ්‍යාපන කොට්ඨාස සංසන්දනය (${allDivisionsList.length || divisions.length} කොට්ඨාස)` : `Educational Divisions vs Provincial Average (${allDivisionsList.length || divisions.length} Divisions)`)}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            උතුරු මැද පළාත් සාමාන්‍යයට (+{passRate > 0 ? passRate : 0}%) සාපේක්ෂව කලාප සහ කොට්ඨාසවල සමත් ප්‍රතිශත විචලනය.
                          </p>
                        </div>

                        {/* Toggle between Zones and Divisions */}
                        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
                          <button
                            onClick={() => setRegionalBreakdownType('zones')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              regionalBreakdownType === 'zones' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {lang === 'si' ? `කලාප (${allZonesList.length || zones.length})` : `Zones (${allZonesList.length || zones.length})`}
                          </button>
                          <button
                            onClick={() => setRegionalBreakdownType('divisions')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              regionalBreakdownType === 'divisions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {lang === 'si' ? `කොට්ඨාස (${allDivisionsList.length || divisions.length})` : `Divisions (${allDivisionsList.length || divisions.length})`}
                          </button>
                        </div>
                      </div>

                      {/* Vertical layout BarChart */}
                      <div className="w-full" style={{ width: '100%', height: regionalBreakdownType === 'zones' ? 420 : 560, minHeight: 420 }}>
                        <ResponsiveContainer width="100%" height={regionalBreakdownType === 'zones' ? 420 : 560}>
                          <BarChart 
                            layout="vertical" 
                            data={regionalBreakdownType === 'zones' ? zoneBreakdownData : divisionBreakdownData}
                            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis 
                              type="number"
                              unit="%"
                              tickFormatter={(v) => (v > 0 ? `+${v}%` : `${v}%`)}
                              tick={{ fill: '#64748b', fontSize: 11 }}
                              domain={[(dataMin) => Math.min(-5, Math.floor(dataMin - 1)), (dataMax) => Math.max(5, Math.ceil(dataMax + 1))]}
                            />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }}
                              width={170}
                              axisLine={{ stroke: '#cbd5e1' }}
                              tickLine={false}
                            />
                            <ReferenceLine x={0} stroke="#0f172a" strokeWidth={2} />
                            <Tooltip content={<CustomRegionalTooltip />} />
                            <Bar dataKey="variance" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
                              {(regionalBreakdownType === 'zones' ? zoneBreakdownData : divisionBreakdownData).map((entry, index) => (
                                <Cell 
                                  key={`reg-cell-${index}`} 
                                  fill={entry.variance >= 0 ? '#10b981' : '#f43f5e'} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Provincial vs National Performance Audit Table */}
                    {nationalComparisonTableData.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">
                              {fiveYearTrendData.length > 1 ? `${fiveYearTrendData.length}-Year Provincial vs National Performance Audit` : 'Provincial vs National Performance Audit'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {lang === 'si'
                                ? `උතුරු මැද පළාත් සාමාන්‍යය සහ ශ්‍රී ලංකා ජාතික සාමාන්‍යය අතර වාර්ෂික ප්‍රතිඵල සංසන්දනය (${fiveYearTrendData.length > 0 ? `${fiveYearTrendData[0].year}${fiveYearTrendData.length > 1 ? ` - ${fiveYearTrendData[fiveYearTrendData.length - 1].year}` : ''}` : 'පවතින අධ්‍යයන වර්ෂය'})`
                                : `Annual performance comparison between NCP and Sri Lanka National Average (${fiveYearTrendData.length > 0 ? `${fiveYearTrendData[0].year}${fiveYearTrendData.length > 1 ? ` - ${fiveYearTrendData[fiveYearTrendData.length - 1].year}` : ''}` : 'Active Cohort'})`}
                            </p>
                          </div>
                          <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            {fiveYearTrendData.length} Recorded Cohort{fiveYearTrendData.length !== 1 ? 's' : ''} ({fiveYearTrendData.length > 0 ? `${fiveYearTrendData[0].year}${fiveYearTrendData.length > 1 ? ` - ${fiveYearTrendData[fiveYearTrendData.length - 1].year}` : ''}` : 'Active'})
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                              <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Academic Year (අධ්‍යයන වර්ෂය)</th>
                                <th className="px-6 py-4">NCP Provincial Pass Rate (උතුරු මැද %)</th>
                                <th className="px-6 py-4">National Pass Rate (ජාතික %)</th>
                                <th className="px-6 py-4 text-center">Net Variance (ශුද්ධ වෙනස)</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl">Official Evaluation (ඇගයීම)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {nationalComparisonTableData.map((row, idx) => {
                                const isPos = row.variance >= 0;
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-black text-slate-900 flex items-center space-x-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                      <span>Year {row.year}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{row.provincePassRate}%</td>
                                    <td className="px-6 py-4 font-semibold text-slate-500">{row.nationalPassRate}%</td>
                                    <td className="px-6 py-4 text-center">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${
                                        isPos ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                      }`}>
                                        {isPos ? `+${row.variance}%` : `${row.variance}%`}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      {isPos ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Exceeding National Standard (+{row.variance}%)</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                                          <AlertCircle className="w-3.5 h-3.5" />
                                          <span>Below National Standard ({row.variance}%)</span>
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
                    )}

                  </div>
                )}
                
                {/* Detailed Table (Visible for Overall & Gender views) */}
                {viewMode !== 'variance' && (
                <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Detailed Examination Records</h3>
                    <span className="text-xs font-bold text-slate-400">Total Records: {resultsData.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">School</th>
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4 text-center">Gender</th>
                          <th className="px-6 py-4 text-center">Sat</th>
                          <th className="px-6 py-4 text-center">A</th>
                          <th className="px-6 py-4 text-center">B</th>
                          <th className="px-6 py-4 text-center">C</th>
                          <th className="px-6 py-4 text-center">S</th>
                          <th className="px-6 py-4 text-center">F</th>
                          <th className="px-6 py-4 rounded-tr-lg text-right">Pass %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData.map((res, i) => (
                          <tr key={i} className="bg-white border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{res.school?.name}</td>
                            <td className="px-6 py-4">{res.subject?.name}</td>
                            <td className="px-6 py-4 text-center">
                              {res.gender === 'MALE' ? (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-200">Male</span>
                              ) : res.gender === 'FEMALE' ? (
                                <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-pink-200">Female</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-200">Combined</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-slate-700">{res.totalSat}</td>
                            <td className="px-6 py-4 text-center text-emerald-600 font-semibold">{res.aCount ?? res.acount ?? 0}</td>
                            <td className="px-6 py-4 text-center text-blue-600 font-semibold">{res.bCount ?? res.bcount ?? 0}</td>
                            <td className="px-6 py-4 text-center text-violet-600 font-semibold">{res.cCount ?? res.ccount ?? 0}</td>
                            <td className="px-6 py-4 text-center text-amber-600 font-semibold">{res.sCount ?? res.scount ?? 0}</td>
                            <td className="px-6 py-4 text-center text-red-500 font-semibold">{res.fCount ?? res.fcount ?? 0}</td>
                            <td className="px-6 py-4 text-right font-bold text-teal-600">{res.passPercentage?.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultsExplorer;
