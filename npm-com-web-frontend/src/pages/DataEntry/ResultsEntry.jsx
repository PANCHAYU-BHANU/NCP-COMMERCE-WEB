import React, { useState } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Save, FileText, Upload, Users, User, UserCheck } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResultsEntry = () => {
  const { currentUser } = useAuth();
  // Term Test & Unit Test State (Default to active 2027 batch)
  const [bulkConfig, setBulkConfig] = useState({
    year: '2027',
    termOrUnit: '1'
  });

  const handleBulkConfigChange = (e) => {
    setBulkConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [activeTab, setActiveTab] = useState('term');
  const [targetSchoolId, setTargetSchoolId] = useState(currentUser?.schoolId || null);
  const [targetSchoolName, setTargetSchoolName] = useState('');
  
  // Location States for Admins
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  const userRole = currentUser?.role;
  const isSchoolUser = ['PRINCIPAL', 'SECTION_HEAD', 'TEACHER'].includes(userRole);
  const isDivisionalUser = userRole === 'DIVISIONAL_DIRECTOR';
  const isZonalUser = userRole === 'ZONAL_DIRECTOR';
  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(userRole);

  const showSchoolSelector = !isSchoolUser;

  // Fetch initial locations based on role hierarchy
  React.useEffect(() => {
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
      // Divisional Director: lock division, fetch schools in this division
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
      // Zonal Director: lock zone, fetch divisions in this zone
      const zoneId = currentUser?.zoneId;
      setSelectedZone(zoneId || '');
      setSelectedDistrict(currentUser?.districtId || '');
      if (zoneId) {
        api.get(`/public/divisions?zoneId=${zoneId}`)
          .then(res => setDivisions(res.data))
          .catch(console.error);
      }
    } else if (isProvincialAdmin) {
      // Provincial Admin: load all districts
      api.get('/public/districts')
        .then(res => setDistricts(res.data))
        .catch(console.error);
    }
  }, [userRole, currentUser, isSchoolUser, isDivisionalUser, isZonalUser, isProvincialAdmin]);

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

  const tabs = [
    { id: 'term', label: '📝 Term Test Evaluations (1st, 2nd & 3rd Terms)' },
    { id: 'unit', label: '📋 Unit Test Modular Marks' },
    { id: 'national', label: '🎓 A/L National Benchmark Results' }
  ];

  // Only PROVINCIAL_DIRECTOR or ADMIN can enter/update provincial aggregate stats
  if (isProvincialAdmin) {
    tabs.push({ id: 'national_stats', label: '🏛️ Provincial Aggregate Summary (Admin)' });
  }

  // Generate dynamic years covering extensive future and past ranges (2035 to 2018)
  const yearOptions = [];
  for (let y = 2035; y >= 2018; y--) {
    let label = `${y}`;
    if (y === 2027) label += ' (Active 2027 Batch)';
    else if (y === 2026) label += ' (Active 2026 Batch)';
    else if (y === 2025) label += ' (2025 Batch)';
    yearOptions.push({ value: y.toString(), label });
  }

  const [isCustomYear, setIsCustomYear] = useState(false);
  const [customYearInput, setCustomYearInput] = useState('');

  // Unit Definitions State (Configured strictly by Provincial Director)
  const [unitDefinitions, setUnitDefinitions] = useState([]);
  const [isConfiguringUnits, setIsConfiguringUnits] = useState(false);
  const [unitFormList, setUnitFormList] = useState([]);
  const [isSavingUnits, setIsSavingUnits] = useState(false);

  React.useEffect(() => {
    api.get('/public/unit-definitions')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setUnitDefinitions(res.data);
        }
      })
      .catch(console.error);
  }, []);

  const openUnitConfig = () => {
    const list = [];
    for (let i = 1; i <= 10; i++) {
      const found = unitDefinitions.find(u => u.unitNumber === i);
      list.push({
        unitNumber: i,
        unitName: found ? found.unitName : `Unit ${i}: Curriculum Topic`,
        description: found ? (found.description || '') : ''
      });
    }
    setUnitFormList(list);
    setIsConfiguringUnits(true);
  };

  const handleUnitNameChange = (unitNum, newName) => {
    setUnitFormList(prev => prev.map(u => u.unitNumber === unitNum ? { ...u, unitName: newName } : u));
  };

  const handleSaveUnitDefinitions = async () => {
    setIsSavingUnits(true);
    try {
      for (const item of unitFormList) {
        await api.post('/public/unit-definitions', item);
      }
      const res = await api.get('/public/unit-definitions');
      if (res.data) setUnitDefinitions(res.data);
      setIsConfiguringUnits(false);
      Swal.fire({
        icon: 'success',
        title: 'Official Unit Curriculum Saved!',
        text: 'All provincial schools and educators will now see these updated unit topics.',
        timer: 2500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Failed to update unit definitions.' });
    } finally {
      setIsSavingUnits(false);
    }
  };

  const unitOptions = Array.from({length: 10}, (_, i) => {
    const num = i + 1;
    const def = unitDefinitions.find(u => u.unitNumber === num);
    const label = def ? `Unit ${num} — ${def.unitName}` : `Unit ${num}`;
    return { value: num.toString(), label };
  });

  const activeUnitDef = unitDefinitions.find(u => String(u.unitNumber) === String(bulkConfig.termOrUnit));
  const activeUnitName = activeUnitDef ? activeUnitDef.unitName : `Unit ${bulkConfig.termOrUnit}`;

  const [nationalStats, setNationalStats] = useState({
    year: '2025', totalSchools: '', totalStudents: '', totalTeachers: '', passRate: ''
  });

  const handleNatStatChange = (e) => {
    setNationalStats({ ...nationalStats, [e.target.name]: e.target.value });
  };

  const handleNatStatSubmit = async () => {
    try {
      const payload = {
        year: parseInt(nationalStats.year),
        totalSchools: parseInt(nationalStats.totalSchools || 0),
        totalStudents: parseInt(nationalStats.totalStudents || 0),
        totalTeachers: parseInt(nationalStats.totalTeachers || 0),
        passRate: parseFloat(nationalStats.passRate || 0)
      };
      await api.post('/public/national-statistics', payload);
      Swal.fire({ icon: "info", title: "National Statistics saved successfully!", timer: 2000, showConfirmButton: false })
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "info", title: "Failed to save National Statistics.", timer: 2000, showConfirmButton: false })
    }
  };

  const [parsedMarks, setParsedMarks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMarkChange = (index, field, value) => {
    const updated = [...parsedMarks];
    updated[index][field] = value;
    setParsedMarks(updated);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const data = lines.slice(1).map((line, index) => {
          const parts = line.split(',').map(p => p.trim());
          if (activeTab === 'national') {
            // Check if 10 columns (with Index No) or 9 columns (legacy without index)
            let indexNum = '', name = '', gender = 'MALE', acc = '', eco = '', bs = '', it = '', zScore = '', districtRank = '', islandRank = '';
            if (parts.length >= 10) {
              [indexNum, name, gender, acc, eco, bs, it, zScore, districtRank, islandRank] = parts;
            } else {
              [name, gender, acc, eco, bs, it, zScore, districtRank, islandRank] = parts;
            }
            return {
              id: index, indexNumber: indexNum || '', name: name || '', gender: gender || 'MALE', whatsapp: '',
              acc: acc || '', eco: eco || '', bs: bs || '', it: it || '',
              zScore: zScore || '', districtRank: districtRank || '', islandRank: islandRank || ''
            };
          } else {
            // Check if 8 columns (with Index No) or 7 columns (legacy)
            let indexNum = '', name = '', gender = 'MALE', whatsapp = '', acc = '', eco = '', bs = '', it = '';
            if (parts.length >= 8) {
              [indexNum, name, gender, whatsapp, acc, eco, bs, it] = parts;
            } else {
              [name, gender, whatsapp, acc, eco, bs, it] = parts;
            }
            return {
              id: index, indexNumber: indexNum || '', name: name || '', gender: gender || 'MALE', whatsapp: whatsapp || '',
              acc: acc || '', eco: eco || '', bs: bs || '', it: it || '',
              zScore: '', districtRank: '', islandRank: ''
            };
          }
        });
        setParsedMarks(data);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const parsed = json.map((row, index) => ({
          id: index,
          indexNumber: String(row['Index No'] || row['IndexNo'] || row['Index'] || row['Admission No'] || row['AdmissionNo'] || '').trim(),
          name: String(row['Name'] || row['Student Name'] || '').trim(),
          gender: row['Gender'] || 'MALE',
          whatsapp: row['WhatsApp'] || '',
          acc: row['Accounting'] || '',
          eco: row['Economics'] || '',
          bs: row['Business Studies'] || '',
          it: row['IT'] || '',
          zScore: row['Z-Score'] || '',
          districtRank: row['District Rank'] || '',
          islandRank: row['Island Rank'] || ''
        }));
        setParsedMarks(parsed);
      } else if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        
        const lines = fullText.split('\n').filter(line => line.trim() !== '');
        const parsed = lines.slice(1).map((line, index) => {
          const parts = line.split(/\s+/);
          return {
            id: index,
            indexNumber: '',
            name: parts.slice(0, parts.length - 6).join(' ') || '',
            gender: parts[parts.length - 6] || 'MALE',
            whatsapp: parts[parts.length - 5] || '',
            acc: parts[parts.length - 4] || '',
            eco: parts[parts.length - 3] || '',
            bs: parts[parts.length - 2] || '',
            it: parts[parts.length - 1] || ''
          };
        });
        setParsedMarks(parsed);
      } else {
        Swal.fire({ icon: 'error', title: 'Unsupported file type.' });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error parsing file' });
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleDownloadTemplate = () => {
    let ws_data = [];
    if (activeTab === 'national') {
      ws_data = [['Index No', 'Name', 'Gender', 'Accounting', 'Economics', 'Business Studies', 'IT', 'Z-Score', 'District Rank', 'Island Rank']];
    } else {
      ws_data = [['Index No', 'Name', 'Gender', 'WhatsApp', 'Accounting', 'Economics', 'Business Studies', 'IT']];
    }
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, activeTab === 'national' ? "AL_Results_Template.xlsx" : "Test_Marks_Template.xlsx");
  };

  const handleBulkSubmit = async (type) => {
    if (!targetSchoolId) {
      Swal.fire({ icon: "info", title: "Error: Please select a school first.", timer: 2000, showConfirmButton: false })
      return;
    }

    const validRows = parsedMarks.filter(r => (r.name && r.name.trim()) || (r.indexNumber && r.indexNumber.trim()) || r.acc || r.eco || r.bs || r.it);
    if (validRows.length === 0) {
      Swal.fire({ icon: "warning", title: "No Data", text: "Please enter or upload student marks." });
      return;
    }

    // Index Number is mandatory to uniquely identify students with School ID
    const missingIndexRows = validRows.filter(r => !r.indexNumber || !r.indexNumber.trim());
    if (missingIndexRows.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Index Number is Mandatory",
        text: `Student Index / Admission Number is mandatory for all entries (${missingIndexRows.length} row(s) missing). Combining School ID + Index Number uniquely identifies every student.`,
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const payload = {
        type: type,
        year: parseInt(bulkConfig.year),
        termOrUnit: parseInt(bulkConfig.termOrUnit || '1'),
        rows: validRows
      };
      
      await api.post(`/school/${targetSchoolId}/bulk-upload-results`, payload);
      Swal.fire({ icon: 'success', title: `${type.replace('_', ' ')} saved successfully!`, timer: 2000, showConfirmButton: false })
      setParsedMarks([]);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: err.response?.data || "Failed to save results.", timer: 3000, showConfirmButton: true })
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── PRESTIGIOUS HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span>📝 Official Exam Marks Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Examination Results Entry & Management</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
            Enter or bulk upload term tests, unit assessments, and national A/L results for automatic provincial leaderboard calculation.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 text-xs font-bold text-slate-300">
          <span className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Leaderboard Auto-Calculation Active</span>
          </span>
          <span className="text-amber-300 text-[11px] font-bold">Active Evaluation Batches: 2027 & 2026</span>
        </div>
      </div>

      {/* ── APPOINTED SCHOOL BADGE FOR PRINCIPALS & TEACHERS ── */}
      {isSchoolUser && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-teal-50 border border-teal-200 rounded-3xl p-5 mb-2 shadow-sm gap-3">
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
                You are authorized to enter and submit marks strictly for students of this school.
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
        <Card className="mb-6 border-blue-200 bg-blue-50/40 rounded-3xl shadow-sm">
          <CardHeader 
            title={
              isZonalUser 
                ? `Zonal School Selection • ${currentUser?.zoneName || 'Your Zone'}`
                : isDivisionalUser 
                  ? `Divisional School Selection • ${currentUser?.divisionName || 'Your Division'}`
                  : "Provincial School Selection"
            } 
            description={
              isZonalUser 
                ? `You have administrative oversight for ${currentUser?.zoneName || 'this Zone'}. Select divisions and schools within your zone.`
                : isDivisionalUser 
                  ? `Select a school within ${currentUser?.divisionName || 'your division'} to enter evaluation marks.`
                  : "Select which school in North Central Province you are entering results for."
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

      {/* Modern Tabs Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 w-full sm:w-max shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-102'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'national' && (
        <Card>
          <CardHeader 
            title="A/L National Results (Bulk Upload)" 
            description="Upload or enter A/L results for students. Use A, B, C, S, F for grades." 
          />
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-full sm:w-64">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">A/L Year</label>
                <button
                  type="button"
                  onClick={() => setIsCustomYear(!isCustomYear)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isCustomYear ? '📋 Select from List' : '✏️ Custom Year'}
                </button>
              </div>
              {isCustomYear ? (
                <Input
                  type="number"
                  placeholder="Enter any year e.g. 2029"
                  value={customYearInput}
                  onChange={(e) => {
                    setCustomYearInput(e.target.value);
                    setBulkConfig({ ...bulkConfig, year: e.target.value });
                  }}
                />
              ) : (
                <Select name="year" value={bulkConfig.year} onChange={handleBulkConfigChange} options={yearOptions} />
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'term' && (
        <Card>
          <CardHeader 
            title="Term Test Marks (Bulk Upload)" 
            description="Upload or enter term test marks for students." 
          />
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-full sm:w-64">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">A/L Year</label>
                <button
                  type="button"
                  onClick={() => setIsCustomYear(!isCustomYear)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isCustomYear ? '📋 Select from List' : '✏️ Custom Year'}
                </button>
              </div>
              {isCustomYear ? (
                <Input
                  type="number"
                  placeholder="Enter any year e.g. 2029"
                  value={customYearInput}
                  onChange={(e) => {
                    setCustomYearInput(e.target.value);
                    setBulkConfig({ ...bulkConfig, year: e.target.value });
                  }}
                />
              ) : (
                <Select name="year" value={bulkConfig.year} onChange={handleBulkConfigChange} options={yearOptions} />
              )}
            </div>
            <div className="w-full sm:w-56">
              <label className="text-xs font-bold text-slate-700 block mb-1">Evaluation Term</label>
              <Select name="termOrUnit" value={bulkConfig.termOrUnit} onChange={handleBulkConfigChange} options={[{value: '1', label: '1st Term Examination'}, {value: '2', label: '2nd Term Examination'}, {value: '3', label: '3rd Term Examination'}]} />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'unit' && (
        <Card>
          <CardHeader 
            title="Unit Test Modular Marks (Bulk Upload)" 
            description="Upload and record unit test modular assessments aligned with provincial commerce syllabus." 
            action={
              isProvincialAdmin && (
                <Button 
                  size="sm" 
                  onClick={openUnitConfig}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  ⚙️ Configure Unit Names (Provincial Director)
                </Button>
              )
            }
          />

          <div className="flex flex-col md:flex-row gap-4 mb-5 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-full md:w-64">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">A/L Year</label>
                <button
                  type="button"
                  onClick={() => setIsCustomYear(!isCustomYear)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isCustomYear ? '📋 Select from List' : '✏️ Custom Year'}
                </button>
              </div>
              {isCustomYear ? (
                <Input
                  type="number"
                  placeholder="Enter any year e.g. 2029"
                  value={customYearInput}
                  onChange={(e) => {
                    setCustomYearInput(e.target.value);
                    setBulkConfig({ ...bulkConfig, year: e.target.value });
                  }}
                />
              ) : (
                <Select name="year" value={bulkConfig.year} onChange={handleBulkConfigChange} options={yearOptions} />
              )}
            </div>

            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Unit Assessment Module</label>
              <Select 
                name="termOrUnit" 
                value={bulkConfig.termOrUnit} 
                onChange={handleBulkConfigChange} 
                options={unitOptions} 
              />
            </div>
          </div>

          {/* Active Unit Topic Display Card */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 rounded-2xl p-4.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/25 flex-shrink-0">
                #{bulkConfig.termOrUnit}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                    Official Syllabus Topic
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Module Unit {bulkConfig.termOrUnit}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {activeUnitName}
                </h4>
              </div>
            </div>

            {isProvincialAdmin ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openUnitConfig}
                className="text-xs self-start sm:self-auto font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
              >
                ✏️ Edit Unit Syllabus
              </Button>
            ) : (
              <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                <span>🔒 Topic Defined by Provincial Dept</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {['national', 'term', 'unit'].includes(activeTab) && (
        <Card className="border-slate-200">
          <CardHeader 
            title="Bulk Upload CSV / Excel / PDF" 
            description="Upload a file with student marks. Ensure columns map to the subjects."
            action={
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                Download Excel Template
              </Button>
            }
          />
          <div className="p-4 pt-0">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls, .pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Click to upload or drag and drop a file"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">Click to upload or drag and drop</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Upload a .csv, .xlsx, or .pdf file containing student marks.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-4">
              <div>
                <h4 className="text-md font-semibold text-slate-800">Preview & Edit Marks</h4>
                <p className="text-xs text-slate-500">Combine School ID + Index No to uniquely identify and track each student.</p>
              </div>
              <button 
                onClick={() => setParsedMarks([...parsedMarks, { id: Date.now(), indexNumber: '', name: '', gender: 'MALE', whatsapp: '', acc: '', eco: '', bs: '', it: '', zScore: '', districtRank: '', islandRank: '' }])}
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                + Add Empty Row
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Index / Adm No <span className="text-red-500">*</span></th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">{activeTab === 'national' ? 'Status' : 'WhatsApp'}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Accounting</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Economics</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Biz Studies</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">IT</th>
                    {activeTab === 'national' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Z-Score</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Dist Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Isl Rank</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {parsedMarks.length > 0 ? (
                    parsedMarks.map((mark, i) => {
                      // Calculate pass/fail for A/L
                      let status = '';
                      let isPass = false;
                      if (activeTab === 'national') {
                        const grades = [mark.acc, mark.eco, mark.bs, mark.it].map(g => (g || '').toUpperCase().trim());
                        const passedCount = grades.filter(g => ['A', 'B', 'C', 'S'].includes(g)).length;
                        isPass = passedCount >= 3;
                        status = isPass ? 'PASS' : 'FAIL';
                      }

                      return (
                      <tr key={mark.id} className="hover:bg-slate-50">
                        <td className="p-2">
                          <input 
                            value={mark.indexNumber || ''} 
                            onChange={(e) => handleMarkChange(i, 'indexNumber', e.target.value)} 
                            placeholder="e.g. 2025/101" 
                            className="w-28 border border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-md p-1.5 transition-all text-sm font-semibold text-blue-700 bg-blue-50/30" 
                            type="text" 
                          />
                        </td>
                        <td className="p-2"><input value={mark.name} onChange={(e) => handleMarkChange(i, 'name', e.target.value)} placeholder="Full Name" className="w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-medium text-slate-700" type="text" /></td>
                        <td className="p-2">
                          <select value={mark.gender} onChange={(e) => handleMarkChange(i, 'gender', e.target.value)} className="w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-medium text-slate-700 bg-transparent">
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                          </select>
                        </td>
                        <td className="p-2">
                          {activeTab === 'national' ? (
                            <div className={`font-bold text-sm px-2 py-1 rounded-md text-center ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {status}
                            </div>
                          ) : (
                            <input value={mark.whatsapp} onChange={(e) => handleMarkChange(i, 'whatsapp', e.target.value)} className="w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-medium text-slate-700" type="text" />
                          )}
                        </td>
                        <td className="p-2"><input value={mark.acc} onChange={(e) => handleMarkChange(i, 'acc', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="text" /></td>
                        <td className="p-2"><input value={mark.eco} onChange={(e) => handleMarkChange(i, 'eco', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="text" /></td>
                        <td className="p-2"><input value={mark.bs} onChange={(e) => handleMarkChange(i, 'bs', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="text" /></td>
                        <td className="p-2"><input value={mark.it} onChange={(e) => handleMarkChange(i, 'it', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="text" /></td>
                        {activeTab === 'national' && (
                          <>
                            <td className="p-2"><input value={mark.zScore || ''} onChange={(e) => handleMarkChange(i, 'zScore', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="text" placeholder="0.00" /></td>
                            <td className="p-2"><input value={mark.districtRank || ''} onChange={(e) => handleMarkChange(i, 'districtRank', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="number" placeholder="1" /></td>
                            <td className="p-2"><input value={mark.islandRank || ''} onChange={(e) => handleMarkChange(i, 'islandRank', e.target.value)} className="w-20 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-md p-1.5 transition-all text-sm font-bold text-slate-700 text-center" type="number" placeholder="10" /></td>
                          </>
                        )}
                      </tr>
                    );
                  })
                  ) : (
                    <tr>
                      <td colSpan="11" className="p-8 text-center text-slate-400 font-medium">
                        Upload a CSV / Excel file or add an empty row to start entering marks.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <Button leftIcon={Save} disabled={parsedMarks.length === 0 || isUploading} onClick={() => {
                if (activeTab === 'national') handleBulkSubmit('AL_RESULTS');
                else if (activeTab === 'term') handleBulkSubmit('TERM_TEST');
                else if (activeTab === 'unit') handleBulkSubmit('UNIT_TEST');
              }}>
                {isUploading ? 'Saving...' : `Save ${parsedMarks.length > 0 ? parsedMarks.length : ''} Records`}
              </Button>
            </div>
          </div>
          </div>
        </Card>
      )}

      {activeTab === 'national_stats' && isAdmin && (
        <Card>
          <CardHeader 
            title="National Statistics (Soft Data)" 
            description="Enter the true national level totals to be displayed on the website banner and statistics section." 
          />
          <div className="space-y-6">
            <div className="flex gap-4 mb-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-48">
                <Select label="Reporting Year" name="year" value={nationalStats.year} onChange={handleNatStatChange} options={yearOptions} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Total Commerce Schools" name="totalSchools" type="number" value={nationalStats.totalSchools} onChange={handleNatStatChange} />
              <Input label="Total Commerce Students" name="totalStudents" type="number" value={nationalStats.totalStudents} onChange={handleNatStatChange} />
              <Input label="Total Commerce Teachers" name="totalTeachers" type="number" value={nationalStats.totalTeachers} onChange={handleNatStatChange} />
              <Input label="National Pass Rate (%)" name="passRate" type="number" value={nationalStats.passRate} onChange={handleNatStatChange} />
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-end items-center">
              <Button leftIcon={Save} onClick={handleNatStatSubmit}>Save National Statistics</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Provincial Director Modal to Configure Unit Names */}
      {isConfiguringUnits && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Provincial Authority Console
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Define Official Commerce Unit Syllabus Names
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  These topic titles will automatically appear on all Zonal, School Principal, and Teacher consoles across North Central Province.
                </p>
              </div>
              <button 
                onClick={() => setIsConfiguringUnits(false)} 
                className="text-slate-400 hover:text-slate-600 p-2 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-2">
              {unitFormList.map((unit) => (
                <div key={unit.unitNumber} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-16 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                    Unit {unit.unitNumber}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      value={unit.unitName}
                      onChange={(e) => handleUnitNameChange(unit.unitNumber, e.target.value)}
                      placeholder={`Enter topic title for Unit ${unit.unitNumber}...`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsConfiguringUnits(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUnitDefinitions}
                disabled={isSavingUnits}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {isSavingUnits ? 'Saving Syllabus...' : 'Save Official Unit Names'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResultsEntry;
