import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TeacherStats = () => {
  const [teachers, setTeachers] = useState([
    { id: 1, name: '', subject: '', grade: '' }
  ]);

  const subjects = [
    { value: 'accounting', label: 'Accounting' },
    { value: 'economics', label: 'Economics' },
    { value: 'business_studies', label: 'Business Studies' },
    { value: 'it', label: 'Information Technology' }
  ];

  const grades = [
    { value: '12', label: 'Grade 12' },
    { value: '13', label: 'Grade 13' },
    { value: '10', label: 'Grade 10 (O/L)' },
    { value: '11', label: 'Grade 11 (O/L)' }
  ];

  const handleAddRow = () => {
    setTeachers([...teachers, { id: Date.now(), name: '', subject: '', grade: '' }]);
  };

  const handleRemoveRow = (id) => {
    if (teachers.length > 1) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const handleChange = (id, field, value) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const { currentUser } = useAuth();
  const [targetSchoolId, setTargetSchoolId] = useState(currentUser?.schoolId || null);
  const [targetSchoolName, setTargetSchoolName] = useState(currentUser?.schoolName || '');

  React.useEffect(() => {
    if (currentUser?.schoolId) {
      setTargetSchoolId(currentUser.schoolId);
      if (currentUser.schoolName) {
        setTargetSchoolName(currentUser.schoolName);
      } else {
        api.get('/public/schools')
          .then(res => {
            const sc = res.data.find(s => String(s.id) === String(currentUser.schoolId));
            if (sc) setTargetSchoolName(sc.name);
          })
          .catch(console.error);
      }
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeSchoolId = targetSchoolId || currentUser?.schoolId;
    if (!activeSchoolId) {
      Swal.fire({ icon: "info", title: "Error: No school assigned to your account.", timer: 2000, showConfirmButton: false });
      return;
    }

    try {
      for (const teacher of teachers) {
        if (teacher.name.trim() !== '') {
          await api.post(`/school/${activeSchoolId}/teachers`, { name: teacher.name });
        }
      }
      Swal.fire({ icon: 'success', title: 'Teacher statistics saved successfully!', timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Failed to save teacher statistics.', timer: 2000, showConfirmButton: false });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── PRESTIGIOUS HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span>👨‍🏫 Faculty & Teacher Directory Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Commerce Teachers & Faculty Roster</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
            Record appointed commerce educators across Accounting, Business Studies, Economics, and ICT for zonal training and panel assignments.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 text-xs font-bold text-slate-300">
          <Button onClick={handleAddRow} leftIcon={Plus} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 cursor-pointer">
            + Add Teacher Row
          </Button>
          <span className="text-emerald-300 text-[11px] font-semibold">Provincial Commerce Board NCP</span>
        </div>
      </div>
      {/* ── APPOINTED SCHOOL BANNER ── */}
      {targetSchoolId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-emerald-600/30">
              <span className="text-xl">🏫</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Appointed School Jurisdiction</span>
                <span className="text-[10px] bg-emerald-200/90 text-emerald-900 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Institutional Scope</span>
              </div>
              <p className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
                {targetSchoolName || currentUser?.schoolName || `School #${targetSchoolId}`}
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                Managing appointed faculty roster and commerce teachers for this school.
              </p>
            </div>
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-2xl border border-emerald-200 text-right self-start sm:self-auto shadow-xs">
            <span className="text-[10px] text-emerald-600 uppercase font-black block">Institutional Census ID</span>
            <span className="text-sm font-mono font-black text-emerald-900">#{targetSchoolId}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader title="Teacher Roster" description="Please list all commerce teachers, their subjects, and grades taught." />
          
          <div className="space-y-4">
            {teachers.map((teacher, index) => (
              <div key={teacher.id} className="flex flex-col md:flex-row items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 w-full">
                  <Input 
                    label="Teacher Name" 
                    value={teacher.name}
                    onChange={(e) => handleChange(teacher.id, 'name', e.target.value)}
                    placeholder="e.g. Mr. Nimal Perera"
                    required
                  />
                </div>
                <div className="flex-1 w-full">
                  <Select 
                    label="Subject Taught"
                    options={subjects}
                    value={teacher.subject}
                    onChange={(e) => handleChange(teacher.id, 'subject', e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1 w-full">
                  <Select 
                    label="Grade"
                    options={grades}
                    value={teacher.grade}
                    onChange={(e) => handleChange(teacher.id, 'grade', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Button 
                    type="button" 
                    variant="danger" 
                    onClick={() => handleRemoveRow(teacher.id)}
                    disabled={teachers.length === 1}
                    className="mb-[2px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-slate-100">
            <Button type="submit" leftIcon={Save} size="lg">
              Save Teacher Roster
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default TeacherStats;
