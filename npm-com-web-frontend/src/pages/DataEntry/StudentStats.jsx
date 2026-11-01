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
    grade12: 0,
    grade13: 0
  });
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual fallback form data (for baseline O/L stats)
  const [formData, setFormData] = useState({
    al_boys: '', al_girls: '',
    gr12_boys: '', gr12_girls: '',
    gr13_boys: '', gr13_girls: '',
    ol_biz_acc_boys: '', ol_biz_acc_girls: '',
    ol_ent_boys: '', ol_ent_girls: '',
  });

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
          const gr12 = res.data.filter(s => s.grade === 12).length;
          const gr13 = res.data.filter(s => !s.grade || s.grade === 13).length;
          setLiveCensus({
            totalStudents: total,
            boys,
            girls,
            grade12: gr12,
            grade13: gr13
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSchoolId = targetSchoolId || currentUser?.schoolId;
    if (!finalSchoolId) {
      Swal.fire({ icon: "info", title: "Error: Please select a school first.", timer: 2000, showConfirmButton: false });
      return;
    }
    
    try {
      const payload = [
        { grade: 12, gender: 'MALE', count: parseInt(formData.gr12_boys || 0) },
        { grade: 12, gender: 'FEMALE', count: parseInt(formData.gr12_girls || 0) },
        { grade: 13, gender: 'MALE', count: parseInt(formData.gr13_boys || 0) },
        { grade: 13, gender: 'FEMALE', count: parseInt(formData.gr13_girls || 0) },
        { grade: 11, gender: 'MALE', count: parseInt(formData.ol_biz_acc_boys || 0) },
        { grade: 11, gender: 'FEMALE', count: parseInt(formData.ol_biz_acc_girls || 0) }
      ];

      for (const data of payload) {
        if (data.count > 0) {
          await api.post(`/school/${finalSchoolId}/student-counts`, data);
        }
      }

      Swal.fire({ icon: 'success', title: 'Baseline census saved successfully!', timer: 2000, showConfirmButton: false });
      fetchStudentRoster(finalSchoolId);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Failed to save student statistics.', timer: 2000, showConfirmButton: false });
    }
  };

  // Filtered Students
  const filteredStudents = registeredStudents.filter(student => {
    const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (student.indexNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'ALL' || 
                         (gradeFilter === '12' && student.grade === 12) ||
                         (gradeFilter === '13' && (!student.grade || student.grade === 13));
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── PRESTIGIOUS HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span>👥 Student Demographics & Live Census</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Commerce Student Census & Live Roster</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
            Live auto-calculated student demographics synced in real-time from Term Tests, Unit Tests, and National Benchmark records.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 text-xs font-bold text-slate-300">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Automatic Sync Active</span>
          </span>
          <span className="text-amber-300 text-[11px] font-bold">Academic Batches: 2027 & 2026</span>
        </div>
      </div>

      {/* ── APPOINTED SCHOOL BADGE FOR PRINCIPALS & TEACHERS ── */}
      {isSchoolUser && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-teal-50 border border-teal-200 rounded-3xl p-5 shadow-sm gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-teal-600/30">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-teal-800 uppercase tracking-wider">Appointed School Jurisdiction</span>
                <span className="text-[10px] bg-teal-200/90 text-teal-900 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Scope Locked</span>
              </div>
              <p className="text-base sm:text-lg font-black text-teal-950 mt-0.5">
                {targetSchoolName || currentUser?.schoolName || (targetSchoolId ? `School #${targetSchoolId}` : 'Appointed School')}
              </p>
              <p className="text-xs text-teal-700 font-medium">
                Live census figures and student rosters are automatically maintained strictly for your appointed school.
              </p>
            </div>
          </div>
          {targetSchoolId && (
            <div className="bg-white/80 px-4 py-2 rounded-2xl border border-teal-200 text-right self-start sm:self-auto shadow-xs">
              <span className="text-[10px] text-teal-600 uppercase font-black block">Institutional Census ID</span>
              <span className="text-sm font-mono font-black text-teal-900">#{targetSchoolId}</span>
            </div>
          )}
        </div>
      )}

      {/* ── SCOPED SCHOOL SELECTOR FOR DIRECTORS & ADMINS ── */}
      {showSchoolSelector && (
        <Card className="border-blue-200 bg-blue-50/40 rounded-3xl shadow-sm">
          <CardHeader 
            title={
              isZonalUser 
                ? `Zonal Census Selection • ${currentUser?.zoneName || 'Your Zone'}`
                : isDivisionalUser 
                  ? `Divisional Census Selection • ${currentUser?.divisionName || 'Your Division'}`
                  : "Select Target School"
            } 
            description={
              isZonalUser 
                ? `You have administrative oversight for ${currentUser?.zoneName || 'this Zone'}. Select divisions and schools within your zone.`
                : isDivisionalUser 
                  ? `Select a school within ${currentUser?.divisionName || 'your division'} to view census statistics.`
                  : "Select which school you are viewing live statistics for."
            } 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 pt-0">
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

      {/* ── AUTOMATED LIVE CENSUS SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Auto Synced
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.totalStudents}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Registered Students</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex justify-between">
            <span>Gr.12: <strong>{liveCensus.grade12}</strong></span>
            <span>Gr.13: <strong>{liveCensus.grade13}</strong></span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <GraduationCap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              2027 A/L
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.grade12}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Grade 12 Commerce Cohort</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex justify-between">
            <span>Status: <strong>Term 1 Evaluation</strong></span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <GraduationCap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              2026 A/L
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.grade13}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Grade 13 Commerce Cohort</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex justify-between">
            <span>Status: <strong>Benchmark Revision</strong></span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              ⚧
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Gender Split
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {liveCensus.girls + liveCensus.boys > 0 ? `${Math.round((liveCensus.girls / (liveCensus.girls + liveCensus.boys || 1)) * 100)}%` : '0%'}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Female / Male Ratio</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex justify-between">
            <span>👩 Girls: <strong>{liveCensus.girls}</strong></span>
            <span>👨 Boys: <strong>{liveCensus.boys}</strong></span>
          </div>
        </div>
      </div>

      {/* ── AUTOMATIC SYNC NOTICE BANNER ── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-3xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-emerald-950">
              Automatic Student Census Synchronization Active
            </h4>
            <p className="text-[11px] sm:text-xs text-emerald-800 font-medium mt-0.5">
              Whenever you enter marks or upload spreadsheets in <strong>Exam Results Entry</strong>, students are automatically registered and census counts recalculate in real-time. Manual counting is not required!
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
      <Card className="rounded-3xl shadow-sm border-slate-200">
        <CardHeader 
          title="Registered Students Roster" 
          description={`Official student database for ${targetSchoolName || currentUser?.schoolName || 'this school'} automatically derived from examination submissions.`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search student or index..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50 font-bold"
                />
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setGradeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${gradeFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All ({registeredStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGradeFilter('12')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${gradeFilter === '12' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Gr. 12 ({liveCensus.grade12})
                </button>
                <button
                  type="button"
                  onClick={() => setGradeFilter('13')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${gradeFilter === '13' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Gr. 13 ({liveCensus.grade13})
                </button>
              </div>
            </div>
          }
        />

        <div className="p-4 pt-0">
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
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Index / Admission</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Grade</th>
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
                          st.grade === 12 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Grade {st.grade || 13}
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
      </Card>

      {/* ── COLLAPSIBLE OPTIONAL MANUAL OVERRIDE (FOR O/L OR HISTORICAL GRADES) ── */}
      <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">⚙️</span>
            <div>
              <h4 className="text-sm font-black text-slate-900">Optional: Manual Baseline Census Entry (O/L & Baseline Records)</h4>
              <p className="text-xs font-normal text-slate-500">Only needed if you want to record baseline figures for non-exam classes like Grade 10 & 11.</p>
            </div>
          </div>
          {showManualForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showManualForm && (
          <form onSubmit={handleSubmit} className="p-6 pt-2 border-t border-slate-100 space-y-6">
            {/* Grade 12 & 13 Split */}
            <Card>
              <CardHeader title="A/L Baseline Override (Grade 12 & 13)" description="Optional manual figures if different from active exam roster." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-600 mb-3">Grade 12</h4>
                  <div className="space-y-3">
                    <Input label="Boys" name="gr12_boys" type="number" value={formData.gr12_boys} onChange={handleChange} />
                    <Input label="Girls" name="gr12_girls" type="number" value={formData.gr12_girls} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-600 mb-3">Grade 13</h4>
                  <div className="space-y-3">
                    <Input label="Boys" name="gr13_boys" type="number" value={formData.gr13_boys} onChange={handleChange} />
                    <Input label="Girls" name="gr13_girls" type="number" value={formData.gr13_girls} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </Card>

            {/* O/L Commerce Subjects */}
            <Card>
              <CardHeader title="O/L Commerce Subjects (Grade 10 & 11)" description="Students following commerce subjects in O/L." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-600 mb-3">Business & Accounting Studies</h4>
                  <div className="space-y-3">
                    <Input label="Boys" name="ol_biz_acc_boys" type="number" value={formData.ol_biz_acc_boys} onChange={handleChange} />
                    <Input label="Girls" name="ol_biz_acc_girls" type="number" value={formData.ol_biz_acc_girls} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-600 mb-3">Entrepreneurship Studies</h4>
                  <div className="space-y-3">
                    <Input label="Boys" name="ol_ent_boys" type="number" value={formData.ol_ent_boys} onChange={handleChange} />
                    <Input label="Girls" name="ol_ent_girls" type="number" value={formData.ol_ent_girls} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" leftIcon={Save} size="lg">
                Save Baseline Statistics
              </Button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};

export default StudentStats;
