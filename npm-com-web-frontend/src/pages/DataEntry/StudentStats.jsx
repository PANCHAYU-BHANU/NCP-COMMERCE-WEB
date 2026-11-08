import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Save, Users, UserCheck, Search, Sparkles, CheckCircle2, ChevronDown, ChevronUp, GraduationCap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StudentStats = () => {
  const { currentUser } = useAuth();
  const [targetSchoolId, setTargetSchoolId] = useState(currentUser?.schoolId || null);
  const [targetSchoolName, setTargetSchoolName] = useState('');
  
  // Scoped Locations
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  // Live Automated Student Census State
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [liveCensus, setLiveCensus] = useState({
    totalStudents: 0,
    boys: 0,
    girls: 0,
    cohort1Year: null,
    cohort1Count: 0,
    cohort2Year: null,
    cohort2Count: 0
  });
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const userRole = currentUser?.role;
  const isSchoolUser = ['PRINCIPAL', 'SECTION_HEAD', 'TEACHER'].includes(userRole);
  const isDivisionalUser = userRole === 'DIVISIONAL_DIRECTOR';
  const isZonalUser = userRole === 'ZONAL_DIRECTOR';
  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(userRole);

  const showSchoolSelector = !isSchoolUser;

  const fetchStudentRoster = (sId) => {
    if (!sId) return;
    setIsLoadingStudents(true);
    api.get(`/school/${sId}/students`)
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setRegisteredStudents(res.data);
          const total = res.data.length;
          const boys = res.data.filter(s => s.gender === 'MALE' || s.gender === 'M').length;
          const girls = res.data.filter(s => s.gender === 'FEMALE' || s.gender === 'F').length;
          const distinctYears = Array.from(new Set(res.data.map(s => s.alYear).filter(Boolean))).sort((a,b) => b - a);
          const c1Year = distinctYears[0] || null;
          const c2Year = distinctYears[1] || null;
          const c1Count = c1Year ? res.data.filter(s => s.alYear === c1Year).length : 0;
          const c2Count = c2Year ? res.data.filter(s => s.alYear === c2Year).length : 0;
          setLiveCensus({
            totalStudents: total,
            boys,
            girls,
            cohort1Year: c1Year,
            cohort1Count: c1Count,
            cohort2Year: c2Year,
            cohort2Count: c2Count
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingStudents(false));
  };

  useEffect(() => {
    if (isSchoolUser) {
      if (currentUser?.schoolId) {
        setTargetSchoolId(currentUser.schoolId);
        if (currentUser.schoolName) {
          setTargetSchoolName(currentUser.schoolName);
        } else {
          api.get('/public/schools')
            .then(res => {
              const school = res.data.find(s => String(s.id) === String(currentUser.schoolId));
              if (school) setTargetSchoolName(school.name);
            })
            .catch(console.error);
        }
      }
    } else if (isDivisionalUser) {
      const divId = currentUser?.divisionId;
      setSelectedDivision(divId || '');
      setSelectedZone(currentUser?.zoneId || '');
      setSelectedDistrict(currentUser?.districtId || '');
      if (divId) {
        api.get(`/public/schools?divisionId=${divId}`)
          .then(res => setSchools(res.data))
          .catch(console.error);
      }
    } else if (isZonalUser) {
      const zoneId = currentUser?.zoneId;
      setSelectedZone(zoneId || '');
      setSelectedDistrict(currentUser?.districtId || '');
      if (zoneId) {
        api.get(`/public/divisions?zoneId=${zoneId}`)
          .then(res => setDivisions(res.data))
          .catch(console.error);
      }
    } else if (isProvincialAdmin) {
      api.get('/public/districts')
        .then(res => setDistricts(res.data))
        .catch(console.error);
    }
  }, [userRole, currentUser, isSchoolUser, isDivisionalUser, isZonalUser, isProvincialAdmin]);

  useEffect(() => {
    const sId = targetSchoolId || currentUser?.schoolId;
    if (sId) {
      fetchStudentRoster(sId);
    }
  }, [targetSchoolId, currentUser]);

  const handleDistrictChange = (e) => {
    if (!isProvincialAdmin) return;
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedZone(''); setSelectedDivision(''); setTargetSchoolId(null);
    setZones([]); setDivisions([]); setSchools([]);
    if(val) api.get(`/public/zones?districtId=${val}`).then(res => setZones(res.data)).catch(console.error);
  };

  const handleZoneChange = (e) => {
    if (!isProvincialAdmin) return;
    const val = e.target.value;
    setSelectedZone(val);
    setSelectedDivision(''); setTargetSchoolId(null);
    setDivisions([]); setSchools([]);
    if(val) api.get(`/public/divisions?zoneId=${val}`).then(res => setDivisions(res.data)).catch(console.error);
  };

  const handleDivisionChange = (e) => {
    if (isDivisionalUser) return;
    const val = e.target.value;
    setSelectedDivision(val);
    setTargetSchoolId(null);
    setSchools([]);
    if(val) api.get(`/public/schools?divisionId=${val}`).then(res => setSchools(res.data)).catch(console.error);
  };



  // Extract distinct cohorts dynamically that actually have registered students
  const distinctCohorts = React.useMemo(() => {
    const countsByYear = {};
    registeredStudents.forEach(s => {
      const yr = s.alYear || (s.grade === 12 ? liveCensus.cohort1Year : liveCensus.cohort2Year);
      if (yr) {
        countsByYear[yr] = (countsByYear[yr] || 0) + 1;
      }
    });
    return Object.entries(countsByYear)
      .map(([yr, count]) => ({ year: parseInt(yr, 10), count }))
      .sort((a, b) => b.year - a.year);
  }, [registeredStudents, liveCensus]);

  // Filtered Students
  const filteredStudents = registeredStudents.filter(student => {
    const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (student.indexNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (gradeFilter === 'ALL') return matchesSearch;
    const studentYear = student.alYear ? String(student.alYear) : '';
    return matchesSearch && (studentYear === gradeFilter);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-6">
      {/* ── PRESTIGIOUS HEADER BANNER (MOBILE-APP COMPACT) ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
            <Users size={12} className="text-purple-400" />
            <span>Student Census Studio</span>
          </div>
          <h1 className="text-base sm:text-2xl font-black text-white tracking-tight leading-snug">
            Commerce Student Census & Live Roster
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl font-medium leading-relaxed hidden sm:block">
            Live auto-calculated student demographics synced in real-time from Term Tests, Unit Tests, and National Benchmark records.
          </p>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end gap-1.5 text-[11px] font-bold text-slate-300 shrink-0">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto Sync Active</span>
          </span>
          <span className="text-slate-400 text-[10px] font-semibold hidden sm:inline">
            {liveCensus.cohort1Year 
              ? `Batches: ${liveCensus.cohort1Year}${liveCensus.cohort2Year ? ` & ${liveCensus.cohort2Year}` : ''}`
              : 'No Active Batches Enrolled'}
          </span>
        </div>
      </div>

      {/* ── APPOINTED SCHOOL BADGE FOR PRINCIPALS & TEACHERS ── */}
      {isSchoolUser && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-teal-50 border border-teal-200 rounded-2xl p-3.5 sm:p-5 shadow-2xs gap-2.5 sm:gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider">Appointed School</span>
                <span className="text-[9px] bg-teal-200/90 text-teal-900 font-bold px-2 py-0.5 rounded-full uppercase">Locked</span>
              </div>
              <p className="text-sm sm:text-base font-black text-teal-950 mt-0.5">
                {targetSchoolName || currentUser?.schoolName || (targetSchoolId ? `School #${targetSchoolId}` : 'Appointed School')}
              </p>
            </div>
          </div>
          {targetSchoolId && (
            <div className="bg-white/80 px-3 py-1 rounded-xl border border-teal-200 text-right self-start sm:self-auto shadow-2xs">
              <span className="text-[9px] text-teal-600 uppercase font-black block">Census ID</span>
              <span className="text-xs font-mono font-black text-teal-900">#{targetSchoolId}</span>
            </div>
          )}
        </div>
      )}

      {/* ── SCOPED SCHOOL SELECTOR FOR DIRECTORS & ADMINS ── */}
      {showSchoolSelector && (
        <Card className="border-blue-200/80 bg-blue-50/30 rounded-2xl sm:rounded-3xl shadow-2xs">
          <CardHeader 
            title={
              isZonalUser 
                ? `Zonal Census • ${currentUser?.zoneName || 'Zone'}`
                : isDivisionalUser 
                  ? `Divisional Census • ${currentUser?.divisionName || 'Division'}`
                  : "Target School Selection"
            } 
            description={
              isZonalUser 
                ? `Administrative oversight for ${currentUser?.zoneName || 'this Zone'}.`
                : "Select which school you are viewing live statistics for."
            } 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 pt-0">
            {isProvincialAdmin && (
              <Select 
                label="District" 
                value={selectedDistrict} 
                onChange={handleDistrictChange} 
                options={[{value:'', label:'Select District'}, ...districts.map(d => ({value: d.id, label: d.name}))]} 
              />
            )}
            
            {(isProvincialAdmin || isZonalUser) && (
              <Select 
                label="Zone" 
                value={selectedZone} 
                onChange={handleZoneChange} 
                disabled={!isProvincialAdmin}
                options={isZonalUser 
                  ? [{value: currentUser?.zoneId, label: `${currentUser?.zoneName || 'Zone'} (Assigned)`}] 
                  : [{value:'', label:'Select Zone'}, ...zones.map(z => ({value: z.id, label: z.name}))]
                } 
              />
            )}

            <Select 
              label="Division" 
              value={selectedDivision} 
              onChange={handleDivisionChange} 
              disabled={isDivisionalUser || (!selectedZone && isProvincialAdmin)} 
              options={isDivisionalUser 
                ? [{value: currentUser?.divisionId, label: `${currentUser?.divisionName || 'Division'} (Assigned)`}]
                : [{value:'', label:'Select Division'}, ...divisions.map(d => ({value: d.id, label: d.name}))]
              } 
            />

            <Select 
              label="Target School" 
              value={targetSchoolId || ''} 
              onChange={(e) => {
                const sId = e.target.value;
                setTargetSchoolId(sId);
                const sObj = schools.find(s => String(s.id) === String(sId));
                if (sObj) setTargetSchoolName(sObj.name);
              }} 
              disabled={!selectedDivision} 
              options={[{value:'', label:'Select School'}, ...schools.map(s => ({value: s.id, label: s.name}))]} 
            />
          </div>
        </Card>
      )}

      {/* ── AUTOMATED LIVE CENSUS SUMMARY CARDS (APP-STYLE 2X2 GRID ON MOBILE) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Users size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">
              Auto Synced
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.totalStudents}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">Total Students</p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex text-[11px] font-semibold text-slate-600 justify-between">
            {liveCensus.cohort1Year && <span>{liveCensus.cohort1Year} A/L: <strong>{liveCensus.cohort1Count}</strong></span>}
            {liveCensus.cohort2Year && <span>{liveCensus.cohort2Year} A/L: <strong>{liveCensus.cohort2Count}</strong></span>}
            {!liveCensus.cohort1Year && <span>Census Status: <strong>Synced</strong></span>}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-indigo-200">
              {liveCensus.cohort1Year ? `${liveCensus.cohort1Year} A/L` : 'Senior Cohort'}
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.cohort1Count}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
            {liveCensus.cohort1Year ? `${liveCensus.cohort1Year} Batch` : 'Senior Batch'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex text-[11px] font-semibold text-slate-600 justify-between">
            <span>Status: <strong>{liveCensus.cohort1Count > 0 ? 'Active Candidates' : 'No Enrolled Students'}</strong></span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200">
              {liveCensus.cohort2Count > 0 && liveCensus.cohort2Year ? `${liveCensus.cohort2Year} A/L` : 'Secondary Cohort'}
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.cohort2Count}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
            {liveCensus.cohort2Count > 0 && liveCensus.cohort2Year ? `${liveCensus.cohort2Year} Batch` : 'Secondary Cohort'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex text-[11px] font-semibold text-slate-600 justify-between">
            <span>Status: <strong>{liveCensus.cohort2Count > 0 ? 'Enrolled Candidates' : 'No Enrolled Students'}</strong></span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              ⚧
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
              Gender Split
            </span>
          </div>
          {(() => {
            const total = liveCensus.girls + liveCensus.boys;
            const fPct = total > 0 ? Math.round((liveCensus.girls / total) * 100) : 0;
            const mPct = total > 0 ? Math.round((liveCensus.boys / total) * 100) : 0;
            return (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-2xl font-black text-pink-600">♀ {fPct}%</span>
                  <span className="text-slate-300 font-bold">/</span>
                  <span className="text-base sm:text-2xl font-black text-blue-600">♂ {mPct}%</span>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">Female / Male Demographics</p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex text-[11px] font-semibold text-slate-600 justify-between">
                  <span>👩 Girls: <strong>{liveCensus.girls} ({fPct}%)</strong></span>
                  <span>👨 Boys: <strong>{liveCensus.boys} ({mPct}%)</strong></span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── AUTOMATIC SYNC NOTICE BANNER ── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-2xl p-3 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-emerald-950">
              Automatic Census Synchronization
            </h4>
            <p className="text-[10px] sm:text-xs text-emerald-800 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
              Whenever marks are submitted in Exam Results Entry, student census calculates in real-time.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchStudentRoster(targetSchoolId || currentUser?.schoolId)} 
          leftIcon={RefreshCw}
          className="text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 self-start sm:self-auto cursor-pointer"
        >
          Refresh Census
        </Button>
      </div>

      {/* ── REGISTERED STUDENTS DIRECTORY & LIVE CENSUS ROSTER ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/90 p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 pb-2 sm:pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight">Registered Students Roster</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Official student database for {targetSchoolName || currentUser?.schoolName || 'this school'} automatically derived from examination submissions.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls (Mobile Full-Width Responsive) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student or index..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50 font-bold"
            />
          </div>
          <div className="flex flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setGradeFilter('ALL')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${gradeFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({registeredStudents.length})
            </button>
            {distinctCohorts.map(c => (
              <button
                key={c.year}
                type="button"
                onClick={() => setGradeFilter(String(c.year))}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${gradeFilter === String(c.year) ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {c.year} A/L ({c.count})
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1">
          {isLoadingStudents ? (
            <div className="p-8 text-center text-xs font-bold text-slate-500">
              Loading student roster from database...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <span className="text-3xl">📝</span>
              <p className="text-sm font-black text-slate-800">No Student Marks Uploaded Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                When you upload or enter results for this school via <strong>Exam Results Entry</strong>, students will automatically appear here with their live census details.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-slate-100/80 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Index / Admission</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">A/L Examination Year</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Academic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                  {filteredStudents.map((st, idx) => (
                    <tr key={st.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {st.indexNumber || `STUD-${st.id}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {st.name || 'Unnamed Student'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          st.alYear === liveCensus.cohort1Year ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {st.alYear ? `${st.alYear} A/L` : `${liveCensus.cohort1Year} A/L`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-600">
                          {st.gender === 'FEMALE' || st.gender === 'F' ? '👩 Female' : '👨 Male'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span>Active Registered Candidate</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentStats;
