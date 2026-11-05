import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, GraduationCap, School as SchoolIcon, Search, Filter, 
  RefreshCw, BookOpen, MapPin, ExternalLink, Award, Lock, Building, Landmark
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';

const TeacherStats = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();

  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);
  const isZonal = currentUser?.role === 'ZONAL_DIRECTOR';
  const isDivisional = currentUser?.role === 'DIVISIONAL_DIRECTOR';
  const isPrincipal = ['PRINCIPAL', 'SECTION_HEAD', 'TEACHER'].includes(currentUser?.role);

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Geographic filter sources
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  // Selected filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedSchool, setSelectedSchool] = useState('ALL');

  // Load geographic lists & subjects
  const DEFAULT_SUBJECTS = [
    { id: 1, name: 'Accounting', type: 'AL', medium: 'All' },
    { id: 2, name: 'Business Studies', type: 'AL', medium: 'All' },
    { id: 3, name: 'Economics', type: 'AL', medium: 'All' },
    { id: 4, name: 'Information & Communication Technology (ICT)', type: 'AL', medium: 'All' },
    { id: 5, name: 'Business Statistics', type: 'AL', medium: 'All' },
    { id: 6, name: 'Entrepreneurship Studies', type: 'AL', medium: 'All' },
    { id: 7, name: 'Commerce & Accounting', type: 'OL', medium: 'All' },
    { id: 8, name: 'Business & Accounting Studies', type: 'OL', medium: 'All' },
    { id: 9, name: 'Entrepreneurship Studies (O/L)', type: 'OL', medium: 'All' }
  ];

  useEffect(() => {
    fetch('http://localhost:8080/api/public/districts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
        } else {
          setDistricts([
            { id: 1, name: 'Anuradhapura' },
            { id: 2, name: 'Polonnaruwa' }
          ]);
        }
      })
      .catch(() => {
        setDistricts([
          { id: 1, name: 'Anuradhapura' },
          { id: 2, name: 'Polonnaruwa' }
        ]);
      });

    fetch('http://localhost:8080/api/public/subjects')
      .then(res => res.json())
      .then(data => setAllSubjects(Array.isArray(data) && data.length > 0 ? data : DEFAULT_SUBJECTS))
      .catch(() => setAllSubjects(DEFAULT_SUBJECTS));
  }, []);

  // Determine role-based locked geographic IDs
  const resolvedDistrictId = useMemo(() => {
    if (isProvincialAdmin) return null;
    if (currentUser?.districtId) return String(currentUser.districtId);
    if (currentUser?.districtName && districts.length > 0) {
      const found = districts.find(d => d.name.toLowerCase() === currentUser.districtName.toLowerCase());
      if (found) return String(found.id);
    }
    // Zone / Division name fallback for NCP districts
    const textToCheck = `${currentUser?.location || ''} ${currentUser?.zoneName || ''} ${currentUser?.divisionName || ''}`.toLowerCase();
    if (textToCheck.includes('polonnaruwa')) return '2';
    if (isZonal || isDivisional || isPrincipal) return '1'; // Default Anuradhapura for NCP
    return null;
  }, [currentUser, isProvincialAdmin, isZonal, isDivisional, isPrincipal, districts]);

  const resolvedZoneId = useMemo(() => {
    if (isProvincialAdmin) return null;
    if (isZonal || isDivisional || isPrincipal) {
      if (currentUser?.zoneId) return String(currentUser.zoneId);
      if (currentUser?.zoneName && zones.length > 0) {
        const found = zones.find(z => 
          z.name.toLowerCase().includes(currentUser.zoneName.toLowerCase()) || 
          currentUser.zoneName.toLowerCase().includes(z.name.toLowerCase())
        );
        if (found) return String(found.id);
      }
      // If divisional, check division's zone
      if (currentUser?.divisionId && divisions.length > 0) {
        const foundDiv = divisions.find(d => String(d.id) === String(currentUser.divisionId));
        if (foundDiv && (foundDiv.zoneId || foundDiv.zone?.id)) {
          return String(foundDiv.zoneId || foundDiv.zone?.id);
        }
      }
    }
    return null;
  }, [currentUser, isProvincialAdmin, isZonal, isDivisional, isPrincipal, zones, divisions]);

  const resolvedDivisionId = useMemo(() => {
    if (isProvincialAdmin || isZonal) return null;
    if (isDivisional || isPrincipal) {
      if (currentUser?.divisionId) return String(currentUser.divisionId);
      if (currentUser?.divisionName && divisions.length > 0) {
        const found = divisions.find(d => 
          d.name.toLowerCase().includes(currentUser.divisionName.toLowerCase()) || 
          currentUser.divisionName.toLowerCase().includes(d.name.toLowerCase())
        );
        if (found) return String(found.id);
      }
    }
    return null;
  }, [currentUser, isProvincialAdmin, isZonal, isDivisional, isPrincipal, divisions]);

  const resolvedSchoolId = useMemo(() => {
    if (isProvincialAdmin || isZonal || isDivisional) return null;
    if (isPrincipal) {
      if (currentUser?.schoolId) return String(currentUser.schoolId);
      if (currentUser?.schoolName && schools.length > 0) {
        const found = schools.find(s => s.name.toLowerCase().includes(currentUser.schoolName.toLowerCase()));
        if (found) return String(found.id);
      }
    }
    return null;
  }, [currentUser, isProvincialAdmin, isZonal, isDivisional, isPrincipal, schools]);

  // Sync state with resolved locked IDs
  useEffect(() => {
    if (resolvedDistrictId && selectedDistrict !== resolvedDistrictId) {
      setSelectedDistrict(resolvedDistrictId);
    }
  }, [resolvedDistrictId]);

  useEffect(() => {
    if (resolvedZoneId && selectedZone !== resolvedZoneId) {
      setSelectedZone(resolvedZoneId);
    }
  }, [resolvedZoneId]);

  useEffect(() => {
    if (resolvedDivisionId && selectedDivision !== resolvedDivisionId) {
      setSelectedDivision(resolvedDivisionId);
    }
  }, [resolvedDivisionId]);

  useEffect(() => {
    if (resolvedSchoolId && selectedSchool !== resolvedSchoolId) {
      setSelectedSchool(resolvedSchoolId);
    }
  }, [resolvedSchoolId]);

  // Cascading zones
  useEffect(() => {
    const dId = resolvedDistrictId || selectedDistrict;
    if (dId && dId !== 'ALL') {
      fetch(`http://localhost:8080/api/public/zones?districtId=${dId}`)
        .then(res => res.json())
        .then(data => setZones(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      fetch('http://localhost:8080/api/public/zones')
        .then(res => res.json())
        .then(data => setZones(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
    if (!resolvedZoneId) setSelectedZone('ALL');
    if (!resolvedDivisionId) setSelectedDivision('ALL');
    if (!resolvedSchoolId) setSelectedSchool('ALL');
  }, [selectedDistrict, resolvedDistrictId, resolvedZoneId, resolvedDivisionId, resolvedSchoolId]);

  // Cascading divisions
  useEffect(() => {
    const zoneToUse = resolvedZoneId || selectedZone;
    if (zoneToUse && zoneToUse !== 'ALL') {
      fetch(`http://localhost:8080/api/public/divisions?zoneId=${zoneToUse}`)
        .then(res => res.json())
        .then(data => setDivisions(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      if (!resolvedZoneId) setDivisions([]);
    }
    if (!resolvedDivisionId) setSelectedDivision('ALL');
    if (!resolvedSchoolId) setSelectedSchool('ALL');
  }, [selectedZone, resolvedZoneId, resolvedDivisionId, resolvedSchoolId]);

  // Cascading schools
  useEffect(() => {
    const divToUse = resolvedDivisionId || selectedDivision;
    const zoneToUse = resolvedZoneId || selectedZone;

    if (divToUse && divToUse !== 'ALL') {
      fetch(`http://localhost:8080/api/public/schools?divisionId=${divToUse}`)
        .then(res => res.json())
        .then(data => setSchools(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else if (zoneToUse && zoneToUse !== 'ALL') {
      fetch(`http://localhost:8080/api/public/schools?zoneId=${zoneToUse}`)
        .then(res => res.json())
        .then(data => setSchools(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      if (!resolvedDivisionId && !resolvedZoneId) setSchools([]);
    }
    if (!resolvedSchoolId) setSelectedSchool('ALL');
  }, [selectedDivision, selectedZone, resolvedDivisionId, resolvedZoneId, resolvedSchoolId]);

  // Fetch teachers from User Management API
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        // Filter users who are teachers or section heads
        const teacherUsers = data.filter(u => {
          const role = (u.role || '').toUpperCase();
          return role === 'TEACHER' || role === 'ROLE_TEACHER' || role === 'SECTION_HEAD' || role === 'ROLE_SECTION_HEAD' || Boolean(u.isSectionHead);
        });
        setTeachers(teacherUsers);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filtered teachers list (with strictly enforced role scopes)
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // 1. Enforce Role-based locked jurisdiction
      const effDistrict = resolvedDistrictId || selectedDistrict;
      if (effDistrict && effDistrict !== 'ALL') {
        if (String(teacher.districtId) !== String(effDistrict)) {
          const distObj = districts.find(d => String(d.id) === String(effDistrict));
          if (!distObj || !(teacher.location || '').toLowerCase().includes(distObj.name.toLowerCase())) {
            return false;
          }
        }
      }

      const effZone = resolvedZoneId || selectedZone;
      if (effZone && effZone !== 'ALL') {
        if (String(teacher.zoneId) !== String(effZone)) {
          const zoneObj = zones.find(z => String(z.id) === String(effZone));
          if (!zoneObj || !(teacher.location || '').toLowerCase().includes(zoneObj.name.toLowerCase())) {
            return false;
          }
        }
      }

      const effDivision = resolvedDivisionId || selectedDivision;
      if (effDivision && effDivision !== 'ALL') {
        if (String(teacher.divisionId) !== String(effDivision)) {
          const divObj = divisions.find(d => String(d.id) === String(effDivision));
          if (!divObj || !(teacher.location || '').toLowerCase().includes(divObj.name.toLowerCase())) {
            return false;
          }
        }
      }

      const effSchool = resolvedSchoolId || selectedSchool;
      if (effSchool && effSchool !== 'ALL') {
        if (String(teacher.schoolId) !== String(effSchool)) {
          const schObj = schools.find(s => String(s.id) === String(effSchool));
          if (!schObj || !(teacher.schoolName || '').toLowerCase().includes(schObj.name.toLowerCase())) {
            return false;
          }
        }
      }

      // 2. Search query (name, username/NIC, email, schoolName)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (teacher.name || '').toLowerCase().includes(query);
        const emailMatch = (teacher.email || '').toLowerCase().includes(query);
        const schoolMatch = (teacher.schoolName || '').toLowerCase().includes(query);
        const locMatch = (teacher.location || '').toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !schoolMatch && !locMatch) return false;
      }

      // 3. Subject filter
      if (selectedSubject !== 'ALL') {
        const subs = teacher.subjects || [];
        const hasSub = subs.some(s => {
          const sName = typeof s === 'string' ? s : s?.name || '';
          return sName.toLowerCase().includes(selectedSubject.toLowerCase());
        });
        if (!hasSub) return false;
      }

      // 4. Exam Level filter
      if (selectedLevel !== 'ALL') {
        const lvl = (teacher.examLevel || '').toUpperCase();
        if (selectedLevel === 'AL' && lvl !== 'AL' && lvl !== 'BOTH') return false;
        if (selectedLevel === 'OL' && lvl !== 'OL' && lvl !== 'BOTH') return false;
        if (selectedLevel === 'BOTH' && lvl !== 'BOTH') return false;
      }

      return true;
    });
  }, [
    teachers, searchQuery, selectedSubject, selectedLevel, 
    selectedDistrict, selectedZone, selectedDivision, selectedSchool,
    resolvedDistrictId, resolvedZoneId, resolvedDivisionId, resolvedSchoolId,
    districts, zones, divisions, schools
  ]);

  // Aggregate Metrics scoped to this officer's jurisdiction
  const scopedFaculty = useMemo(() => {
    return teachers.filter(teacher => {
      if (resolvedDistrictId && String(teacher.districtId) !== String(resolvedDistrictId)) {
        const distObj = districts.find(d => String(d.id) === String(resolvedDistrictId));
        if (!distObj || !(teacher.location || '').toLowerCase().includes(distObj.name.toLowerCase())) return false;
      }
      if (resolvedZoneId && String(teacher.zoneId) !== String(resolvedZoneId)) {
        const zoneObj = zones.find(z => String(z.id) === String(resolvedZoneId));
        if (!zoneObj || !(teacher.location || '').toLowerCase().includes(zoneObj.name.toLowerCase())) return false;
      }
      if (resolvedDivisionId && String(teacher.divisionId) !== String(resolvedDivisionId)) {
        const divObj = divisions.find(d => String(d.id) === String(resolvedDivisionId));
        if (!divObj || !(teacher.location || '').toLowerCase().includes(divObj.name.toLowerCase())) return false;
      }
      if (resolvedSchoolId && String(teacher.schoolId) !== String(resolvedSchoolId)) {
        const schObj = schools.find(s => String(s.id) === String(resolvedSchoolId));
        if (!schObj || !(teacher.schoolName || '').toLowerCase().includes(schObj.name.toLowerCase())) return false;
      }
      return true;
    });
  }, [teachers, resolvedDistrictId, resolvedZoneId, resolvedDivisionId, resolvedSchoolId, districts, zones, divisions, schools]);

  const metrics = useMemo(() => {
    const list = scopedFaculty;
    const total = list.length;
    const alCount = list.filter(t => (t.examLevel === 'AL' || t.examLevel === 'BOTH')).length;
    const olCount = list.filter(t => (t.examLevel === 'OL' || t.examLevel === 'BOTH')).length;
    const uniqueSchools = new Set(list.map(t => t.schoolId || t.schoolName).filter(Boolean)).size;
    return { total, alCount, olCount, uniqueSchools };
  }, [scopedFaculty]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setSelectedLevel('ALL');
    if (!resolvedDistrictId) setSelectedDistrict('ALL');
    if (!resolvedZoneId) setSelectedZone('ALL');
    if (!resolvedDivisionId) setSelectedDivision('ALL');
    if (!resolvedSchoolId) setSelectedSchool('ALL');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || 
    selectedSubject !== 'ALL' || 
    selectedLevel !== 'ALL' || 
    (!resolvedDistrictId && selectedDistrict !== 'ALL') || 
    (!resolvedZoneId && selectedZone !== 'ALL') || 
    (!resolvedDivisionId && selectedDivision !== 'ALL') || 
    (!resolvedSchoolId && selectedSchool !== 'ALL');

  const canManageUsers = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6 pb-12">
      
      {/* ── PRESTIGIOUS HEADER BANNER (MOBILE-APP COMPACT) ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            <span>
              {isZonal 
                ? `🏢 Zonal Faculty Directory • ${currentUser?.zoneName || 'Your Zone'}`
                : isDivisional
                  ? `🏛️ Divisional Faculty Directory • ${currentUser?.divisionName || 'Your Division'}`
                  : isPrincipal
                    ? `🏫 School Faculty Directory • ${currentUser?.schoolName || 'Your School'}`
                    : 'Faculty Directory'}
            </span>
          </div>
          <h1 className="text-base sm:text-2xl font-black text-white tracking-tight leading-snug">
            {isZonal 
              ? `Commerce Educators (${currentUser?.zoneName || 'Zonal Scope'})` 
              : isDivisional 
                ? `Commerce Educators (${currentUser?.divisionName || 'Divisional Scope'})` 
                : isPrincipal 
                  ? `Commerce Faculty (${currentUser?.schoolName || 'School Scope'})` 
                  : 'Commerce Educators Directory'}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl font-medium leading-relaxed hidden sm:block">
            {isZonal 
              ? `Centralized directory of appointed commerce teachers across ${currentUser?.zoneName || 'your zone'}. Inspect faculty deployments and teaching allocations.`
              : isDivisional 
                ? `Centralized directory of appointed commerce teachers across ${currentUser?.divisionName || 'your division'}. Inspect institutional faculty staffing.`
                : isPrincipal 
                  ? `Appointed commerce teachers at ${currentUser?.schoolName || 'your school'}.`
                  : 'Centralized directory of appointed commerce teachers across North Central Province. Filter and inspect faculty deployment by subject, educational zone, division, and institution.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canManageUsers && (
            <Link to="/dashboard/users">
              <Button leftIcon={ExternalLink} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 sm:px-4 rounded-xl shadow-2xs hover:shadow cursor-pointer">
                Manage Teachers
              </Button>
            </Link>
          )}
          <button 
            onClick={fetchTeachers} 
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── STATS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isPrincipal ? 'School Teachers' : isDivisional ? 'Division Teachers' : isZonal ? 'Zone Teachers' : 'Registered Teachers'}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{metrics.total}</p>
            <span className="text-[11px] text-blue-600 font-semibold">Active Faculty</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">A/L Teachers</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{metrics.alCount}</p>
            <span className="text-[11px] text-purple-600 font-semibold">Senior Secondary</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">O/L Teachers</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{metrics.olCount}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Grade 10 & 11</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <SchoolIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Schools Covered</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{metrics.uniqueSchools}</p>
            <span className="text-[11px] text-amber-600 font-semibold">Institutional Staffing</span>
          </div>
        </div>
      </div>

      {/* ── FILTER CONTROLS PANEL ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Search & Filter Directory</h2>
            </div>
            
            {/* Active jurisdiction scope badge */}
            {isZonal && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Building size={12} className="text-blue-600" />
                <span>Zone Locked: {currentUser?.zoneName || 'Your Zone'}</span>
              </span>
            )}
            {isDivisional && (
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Landmark size={12} className="text-teal-600" />
                <span>Division Locked: {currentUser?.divisionName || 'Your Division'}</span>
              </span>
            )}
            {isPrincipal && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <SchoolIcon size={12} className="text-emerald-600" />
                <span>School Locked: {currentUser?.schoolName || 'Your School'}</span>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold self-start sm:self-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by teacher name, NIC, email, or school name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* 1. Subject Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/30 outline-none"
            >
              <option value="ALL">All Subjects</option>
              <option value="Accounting">Accounting</option>
              <option value="Business Studies">Business Studies</option>
              <option value="Economics">Economics</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Commerce">Commerce (O/L)</option>
              {allSubjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Exam Level Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Teaching Level</label>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/30 outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="AL">A/L Specialist</option>
              <option value="OL">O/L Specialist</option>
              <option value="BOTH">Both A/L & O/L</option>
            </select>
          </div>

          {/* 3. District Filter (Locked for Zonal, Divisional & Principal) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">District</label>
              {resolvedDistrictId && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded flex items-center gap-0.5">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>
            <select
              value={selectedDistrict}
              disabled={!!resolvedDistrictId}
              onChange={e => setSelectedDistrict(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none transition-all ${
                resolvedDistrictId 
                  ? 'bg-slate-100/90 text-slate-600 border-slate-300 cursor-not-allowed shadow-2xs' 
                  : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-2 focus:ring-blue-500/30'
              }`}
            >
              {!resolvedDistrictId && <option value="ALL">All Districts</option>}
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {resolvedDistrictId === String(d.id) ? '(Assigned District)' : ''}
                </option>
              ))}
              {districts.length === 0 && currentUser?.districtName && (
                <option value={resolvedDistrictId}>{currentUser.districtName} (Assigned District)</option>
              )}
            </select>
          </div>

          {/* 4. Zone Filter (Locked for Zonal, Divisional & Principal) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">Zone</label>
              {resolvedZoneId && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded flex items-center gap-0.5">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>
            <select
              value={selectedZone}
              disabled={!!resolvedZoneId}
              onChange={e => setSelectedZone(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none transition-all ${
                resolvedZoneId 
                  ? 'bg-slate-100/90 text-slate-600 border-slate-300 cursor-not-allowed shadow-2xs' 
                  : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-2 focus:ring-blue-500/30'
              }`}
            >
              {!resolvedZoneId && <option value="ALL">All Zones</option>}
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} {resolvedZoneId === String(z.id) ? '(Assigned Zone)' : ''}
                </option>
              ))}
              {zones.length === 0 && currentUser?.zoneName && (
                <option value={resolvedZoneId}>{currentUser.zoneName} (Assigned Zone)</option>
              )}
            </select>
          </div>

          {/* 5. Division Filter (Locked for Divisional & Principal; Filterable for Zonal & Provincial) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">Division</label>
              {resolvedDivisionId && (
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1 py-0.2 rounded flex items-center gap-0.5">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>
            <select
              value={selectedDivision}
              disabled={!!resolvedDivisionId}
              onChange={e => setSelectedDivision(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none transition-all ${
                resolvedDivisionId 
                  ? 'bg-slate-100/90 text-slate-600 border-slate-300 cursor-not-allowed shadow-2xs' 
                  : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-2 focus:ring-blue-500/30'
              }`}
            >
              {!resolvedDivisionId && (
                <option value="ALL">
                  {isZonal ? `All Divisions in ${currentUser?.zoneName || 'Zone'}` : 'All Divisions'}
                </option>
              )}
              {divisions.map(div => (
                <option key={div.id} value={div.id}>
                  {div.name} {resolvedDivisionId === String(div.id) ? '(Assigned Division)' : ''}
                </option>
              ))}
              {divisions.length === 0 && currentUser?.divisionName && (
                <option value={resolvedDivisionId}>{currentUser.divisionName} (Assigned Division)</option>
              )}
            </select>
          </div>

          {/* 6. School Filter (Locked for Principal; Filterable for Divisional, Zonal & Provincial) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">School</label>
              {resolvedSchoolId && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded flex items-center gap-0.5">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>
            <select
              value={selectedSchool}
              disabled={!!resolvedSchoolId}
              onChange={e => setSelectedSchool(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none transition-all ${
                resolvedSchoolId 
                  ? 'bg-slate-100/90 text-slate-600 border-slate-300 cursor-not-allowed shadow-2xs' 
                  : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-2 focus:ring-blue-500/30'
              }`}
            >
              {!resolvedSchoolId && (
                <option value="ALL">
                  {isDivisional ? `All Schools in ${currentUser?.divisionName || 'Division'}` : 'All Schools'}
                </option>
              )}
              {schools.map(sch => (
                <option key={sch.id} value={sch.id}>
                  {sch.name} {resolvedSchoolId === String(sch.id) ? '(Appointed School)' : ''}
                </option>
              ))}
              {schools.length === 0 && currentUser?.schoolName && (
                <option value={resolvedSchoolId}>{currentUser.schoolName} (Appointed School)</option>
              )}
            </select>
          </div>

        </div>
      </div>

      {/* ── TEACHER DIRECTORY TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Commerce Faculty Roster</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {filteredTeachers.length} {filteredTeachers.length === 1 ? 'Teacher' : 'Teachers'} Listed
            </span>
          </div>
          {currentUser?.location && (
            <span className="text-xs text-slate-500 font-medium">
              Jurisdiction: <strong className="text-slate-800">{currentUser.location}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading faculty directory...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No Teachers Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters 
                ? 'No teachers match your active filter criteria. Try clearing filters or selecting another division/school.' 
                : 'No teachers are registered in your jurisdiction yet. Teachers added in User Management will automatically appear here.'}
            </p>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters} 
                className="text-xs font-bold text-blue-600 hover:underline pt-2 cursor-pointer"
              >
                Clear Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Educator Profile</th>
                  <th className="py-3 px-6">NIC / Identity</th>
                  <th className="py-3 px-6">Appointed School & Scope</th>
                  <th className="py-3 px-6">Teaching Subject(s)</th>
                  <th className="py-3 px-6">Level</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeachers.map(teacher => {
                  const subs = teacher.subjects || [];
                  const subNames = subs.map(s => typeof s === 'string' ? s : s?.name || '').filter(Boolean);
                  const isAL = teacher.examLevel === 'AL';
                  const isOL = teacher.examLevel === 'OL';
                  const isBoth = teacher.examLevel === 'BOTH';

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-2xs shrink-0">
                            {(teacher.name || teacher.username || 'T').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 leading-tight">
                                {teacher.name || teacher.username}
                              </p>
                              {(teacher.isSectionHead || teacher.role === 'SECTION_HEAD') && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                                  ★ Section Head
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {teacher.email || 'No institutional email'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-600 font-semibold">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {teacher.username}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <SchoolIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{teacher.schoolName || teacher.location || 'Appointed School'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {teacher.divisionName ? `${teacher.divisionName} • ` : ''}
                              {teacher.zoneName ? `${teacher.zoneName}` : (teacher.location || 'North Central Province')}
                            </span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {subNames.length > 0 ? (
                            subNames.map((sName, sIdx) => (
                              <span 
                                key={sIdx} 
                                className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200"
                              >
                                {sName}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Commerce Stream</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        {isAL && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                            A/L Commerce
                          </span>
                        )}
                        {isOL && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            O/L Commerce
                          </span>
                        )}
                        {isBoth && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                            A/L & O/L Dual
                          </span>
                        )}
                        {!isAL && !isOL && !isBoth && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                            {teacher.examLevel || 'General'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherStats;
