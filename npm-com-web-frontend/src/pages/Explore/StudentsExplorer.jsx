import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, Search, ArrowLeft, Filter, GraduationCap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const StudentsExplorer = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Filters State
  const [filters, setFilters] = useState({
    districtId: searchParams.get('district') || 'all',
    zoneId: 'all',
    divisionId: 'all',
    schoolId: 'all',
  });

  // Reference Data
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [studentsData, setStudentsData] = useState([]);

  // Fetch Reference Data on mount
  useEffect(() => {
    const fetchRefData = async () => {
      try {
        const distRes = await fetch('/api/public/districts');
        if(distRes.ok) setDistricts(await distRes.json());
      } catch (err) {
        console.error("Error fetching reference data", err);
      }
    };
    fetchRefData();
  }, []);

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

  useEffect(() => {
    const fetchCascade = async () => {
      if (filters.zoneId !== 'all') {
        const res = await fetch(`/api/public/divisions?zoneId=${filters.zoneId}`);
        if(res.ok) setDivisions(await res.json());
      } else { setDivisions([]); setSchools([]); }
    };
    fetchCascade();
  }, [filters.zoneId]);

  useEffect(() => {
    const fetchCascade = async () => {
      if (filters.divisionId !== 'all') {
        const res = await fetch(`/api/public/schools?divisionId=${filters.divisionId}`);
        if(res.ok) setSchools(await res.json());
      } else { setSchools([]); }
    };
    fetchCascade();
  }, [filters.divisionId]);

  // Fetch Students Data based on filters
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let url = new URL('/api/public/student-counts', window.location.origin);
        if (filters.schoolId !== 'all') url.searchParams.append('schoolId', filters.schoolId);
        else if (filters.divisionId !== 'all') url.searchParams.append('divisionId', filters.divisionId);
        else if (filters.zoneId !== 'all') url.searchParams.append('zoneId', filters.zoneId);
        else if (filters.districtId !== 'all') url.searchParams.append('districtId', filters.districtId);
        
        const res = await fetch(url);
        if(res.ok) {
          setStudentsData(await res.json());
        }
      } catch(err) {
        console.error("Error fetching students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [filters]);

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

  // Process data for charts
  const aggregatedStats = studentsData.reduce((acc, curr) => {
    if (curr.grade === 12 || curr.grade === 13) acc.AL += curr.count;
    if (curr.grade === 10 || curr.grade === 11) acc.OL += curr.count;
    if (curr.gender === 'MALE') acc.male += curr.count;
    if (curr.gender === 'FEMALE') acc.female += curr.count;
    acc.total += curr.count;
    return acc;
  }, { total: 0, AL: 0, OL: 0, male: 0, female: 0 });

  const gradeChartData = [
    { name: 'Grade 10', MALE: 0, FEMALE: 0 },
    { name: 'Grade 11', MALE: 0, FEMALE: 0 },
    { name: 'Grade 12', MALE: 0, FEMALE: 0 },
    { name: 'Grade 13', MALE: 0, FEMALE: 0 },
  ];

  studentsData.forEach(item => {
    const gradeIndex = item.grade - 10;
    if (gradeIndex >= 0 && gradeIndex <= 3) {
      if (item.gender === 'MALE') gradeChartData[gradeIndex].MALE += item.count;
      if (item.gender === 'FEMALE') gradeChartData[gradeIndex].FEMALE += item.count;
    }
  });

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL STUDENT IMAGE ── */}
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
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/40 to-teal-500/30 border border-teal-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-teal-200 shadow-lg">
                <Users className="w-4 h-4 text-teal-300" />
                <span>Provincial Candidate Census</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                Student Statistics & Demographics
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Enrolment figures, gender breakdown, and grade progressions across Anuradhapura and Polonnaruwa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN DEMOGRAPHICS CONTENT (ZERO OVERLAP!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* FILTERS SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100">
                <Filter className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-slate-800">Filters</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">District</label>
                  <select name="districtId" value={filters.districtId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none transition-colors">
                    <option value="all">All Districts (NCP)</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                {zones.length > 0 && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Zone</label>
                    <select name="zoneId" value={filters.zoneId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none transition-colors">
                      <option value="all">All Zones</option>
                      {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </motion.div>
                )}

                {divisions.length > 0 && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Division</label>
                    <select name="divisionId" value={filters.divisionId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none transition-colors">
                      <option value="all">All Divisions</option>
                      {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </motion.div>
                )}

                {schools.length > 0 && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">School</label>
                    <select name="schoolId" value={filters.schoolId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none transition-colors">
                      <option value="all">All Schools</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* RESULTS AREA */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading statistics...</p>
              </div>
            ) : studentsData.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Data Found</h3>
                <p className="text-slate-500 text-center max-w-sm">We couldn't find any student records matching your current filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Students</p>
                    <p className="text-3xl font-extrabold text-slate-800">{aggregatedStats.total}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">A/L Students</p>
                    <p className="text-3xl font-extrabold text-violet-600">{aggregatedStats.AL}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Boys</p>
                    <p className="text-3xl font-extrabold text-blue-500">{aggregatedStats.male}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Girls</p>
                    <p className="text-3xl font-extrabold text-pink-500">{aggregatedStats.female}</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-6">Student Enrollment by Grade & Gender</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Legend />
                          <Bar dataKey="MALE" name="Boys" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                          <Bar dataKey="FEMALE" name="Girls" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Table */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Detailed Student Records</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">School</th>
                          <th className="px-6 py-4 text-center">Grade</th>
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4 text-center">Gender</th>
                          <th className="px-6 py-4 rounded-tr-lg text-right">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsData.map((res, i) => (
                          <tr key={i} className="bg-white border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{res.school?.name}</td>
                            <td className="px-6 py-4 text-center font-bold text-slate-700">{res.grade}</td>
                            <td className="px-6 py-4">{res.subject?.name || 'General Commerce'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${res.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {res.gender}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-violet-600">{res.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentsExplorer;
