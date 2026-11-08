import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { School, Users, GraduationCap, TrendingUp, BookOpen, BarChart3 } from 'lucide-react';

/* --- DYNAMIC DATA --- */
const mockData = {
  anuradhapura: {
    schools: 0, teachers: 0, students: 0, olStudents: 0,
    passRate2025: 0, passRate2024: 0, passRate2023: 0,
    alSubjects: { 'Economics': [], 'Business Studies': [], 'Accounting': [] },
    olSubjects: { 'Business & Accounting': [], 'Entrepreneurship': [] }
  },
  polonnaruwa: {
    schools: 0, teachers: 0, students: 0, olStudents: 0,
    passRate2025: 0, passRate2024: 0, passRate2023: 0,
    alSubjects: { 'Economics': [], 'Business Studies': [], 'Accounting': [] },
    olSubjects: { 'Business & Accounting': [], 'Entrepreneurship': [] }
  }
};

const StatCard = ({ icon: Icon, title, value, subtitle, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} ${theme.cardHover} ${theme.shadow} ${theme.hoverShadow} group`}
  >
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-24 h-24 text-white" />
    </div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${theme.iconBg} ${theme.iconHoverBg}`}>
        <Icon className={`w-6 h-6 ${theme.iconColor}`} />
      </div>
      <h4 className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">{title}</h4>
      <div className="text-3xl font-extrabold text-white mb-1 drop-shadow-md">{value}</div>
      <p className={`text-xs font-medium ${theme.iconColor}`}>{subtitle}</p>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Enforce specific order: Island, Provincial, District, Zone
    const order = ['Island Average', 'Provincial Average', 'District Average', 'Zone Average'];
    const sortedPayload = [...payload].sort((a, b) => {
      const aIndex = order.indexOf(a.dataKey);
      const bIndex = order.indexOf(b.dataKey);
      // Fallback in case a key is missing from the order array
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return (
      <div className="bg-slate-900/95 border border-white/10 p-5 rounded-2xl shadow-xl min-w-[200px]">
        <p className="text-white text-2xl font-black mb-4 pb-2 border-b border-white/10">{label}</p>
        {sortedPayload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
            <div className="flex items-center space-x-3">
              <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
              <p className="text-white/90 text-sm font-medium">{entry.name}</p>
            </div>
            <span className="text-white font-bold text-lg ml-4">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DistrictStatistics = ({ districtId, districtName, theme, selectedZone }) => {
  const regionName = selectedZone ? selectedZone.name : districtName;
  const regionType = selectedZone ? 'Zone' : 'District';
  const [alSubject, setAlSubject] = useState('Economics');
  const [olSubject, setOlSubject] = useState('Business & Accounting');
  
  const [districtStats, setDistrictStats] = useState({
      schools: 0, teachers: 0, students: 0, passRate2025: 0, passRate2024: 0, passRate2023: 0
  });

  React.useEffect(() => {
    // 1 for Anuradhapura, 2 for Polonnaruwa (assuming ID structure)
    const id = districtId === 'anuradhapura' ? 1 : 2;
    fetch(`/api/public/statistics/district/${id}`)
      .then(res => res.json())
      .then(data => {
        setDistrictStats({
            schools: data.schools,
            teachers: data.teachers,
            students: data.students,
            passRate2025: data.passRateCurrent,
            passRate2024: data.passRatePrev1,
            passRate2023: data.passRatePrev2
        });
      })
      .catch(err => console.error(err));
  }, [districtId]);

  const data = mockData[districtId];
  // Map fetched data over mockData structure so charts work (even if empty)
  const displayData = { ...data, ...districtStats };
  const themes = {
    anuradhapura: { primary: { cardBg: 'bg-blue-900/20', iconColor: 'text-blue-400' }, secondary: { cardBg: 'bg-blue-900/20', iconColor: 'text-blue-400' }, accent: { cardBg: 'bg-blue-900/20', iconColor: 'text-blue-400' } },
    polonnaruwa: { primary: { cardBg: 'bg-teal-900/20', iconColor: 'text-teal-400' }, secondary: { cardBg: 'bg-teal-900/20', iconColor: 'text-teal-400' }, accent: { cardBg: 'bg-teal-900/20', iconColor: 'text-teal-400' } }
  };

  if (!data) return null;

  return (
    <div className="mt-12">
      
      {/* 1. Basic Stats & Pass Rates */}
      <h3 className={`text-2xl font-bold text-white mb-6 border-l-4 ${theme?.borderLeft || 'border-white'} pl-4 drop-shadow-md flex items-center space-x-3`}>
        <BarChart3 className={`w-6 h-6 ${theme?.iconColor || 'text-white'}`} />
        <span>{regionName} {regionType} Commerce Statistics</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <StatCard icon={School} title="Commerce Schools" value={displayData.schools.toLocaleString()} subtitle={`In ${regionName}`} theme={theme || themes[districtId].primary} />
        <StatCard icon={Users} title="Commerce Teachers" value={displayData.teachers.toLocaleString()} subtitle="Dedicated Educators" theme={theme || themes[districtId].secondary} />
        <StatCard icon={GraduationCap} title="A/L Students" value={displayData.students.toLocaleString()} subtitle="Currently Enrolled" theme={theme || themes[districtId].accent} />
        
        <StatCard icon={TrendingUp} title="2025 Pass Rate" value={`${displayData.passRate2025}%`} subtitle={`${regionName} Average`} theme={theme || themes[districtId].primary} />
        <StatCard icon={TrendingUp} title="2024 Pass Rate" value={`${displayData.passRate2024}%`} subtitle={`${regionName} Average`} theme={theme || themes[districtId].secondary} />
        <StatCard icon={TrendingUp} title="2023 Pass Rate" value={`${displayData.passRate2023}%`} subtitle={`${regionName} Average`} theme={theme || themes[districtId].accent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <StatCard icon={Users} title="O/L Commerce Students" value={displayData.olStudents.toLocaleString()} subtitle="Total O/L Students" theme={theme || themes[districtId].primary} />
      </div>

      {/* 2. A/L Subjects Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`${theme?.cardBg || 'bg-white/10'} backdrop-blur-2xl p-8 rounded-3xl border ${theme?.cardBorder || 'border-white/10'} ${theme?.shadow || 'shadow-lg'} mb-12 relative z-20`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3 drop-shadow-md">
            <GraduationCap className={`w-6 h-6 ${theme?.iconColor || 'text-white'}`} />
            <span>A/L Subjects: 5-Year Pass Rate Progression</span>
          </h3>
          <div className="flex bg-black/20 backdrop-blur-sm p-1.5 rounded-2xl relative shadow-inner">
            {['Economics', 'Business Studies', 'Accounting'].map(subj => (
              <button
                key={subj}
                onClick={() => setAlSubject(subj)}
                className={`relative px-5 py-2.5 text-sm font-extrabold rounded-xl transition-colors duration-300 ${alSubject === subj ? (theme?.iconColor || 'text-white') : 'text-white/60 hover:text-white'}`}
              >
                {alSubject === subj && (
                  <motion.div
                    layoutId={`alTab_${districtId}`}
                    className="absolute inset-0 bg-white/10 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-white/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {subj.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.alSubjects[alSubject]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <filter id="glowDark" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontWeight: 500 }} domain={[0, 100]} dx={-10} />
              <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', color: 'white' }} />
              <Line type="monotone" dataKey="Island Average" stroke="#94a3b8" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Provincial Average" stroke={districtId === 'anuradhapura' ? '#14b8a6' : '#3b82f6'} strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 9 }} filter="url(#glowDark)" />
              <Line type="monotone" dataKey="District Average" name={`${districtName} District Average`} stroke={districtId === 'anuradhapura' ? '#3b82f6' : '#14b8a6'} strokeWidth={selectedZone ? 3 : 5} dot={{ r: selectedZone ? 5 : 7, strokeWidth: 2 }} filter="url(#glowDark)" />
              {selectedZone && (
                <Line type="monotone" dataKey="Zone Average" name={`${selectedZone.name} Zone Average`} stroke="#f43f5e" strokeWidth={5} dot={{ r: 7, strokeWidth: 2 }} filter="url(#glowDark)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 3. O/L Subjects Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`${theme?.cardBg || 'bg-white/10'} backdrop-blur-2xl p-8 rounded-3xl border ${theme?.cardBorder || 'border-white/10'} ${theme?.shadow || 'shadow-lg'} relative z-20`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3 drop-shadow-md">
            <BookOpen className={`w-6 h-6 ${theme?.iconColor || 'text-white'}`} />
            <span>O/L Subjects: 5-Year Pass Rate Progression</span>
          </h3>
          <div className="flex bg-black/20 backdrop-blur-sm p-1.5 rounded-2xl relative shadow-inner">
            {['Business & Accounting', 'Entrepreneurship'].map(subj => (
              <button
                key={subj}
                onClick={() => setOlSubject(subj)}
                className={`relative px-5 py-2.5 text-sm font-extrabold rounded-xl transition-colors duration-300 ${olSubject === subj ? (theme?.iconColor || 'text-white') : 'text-white/60 hover:text-white'}`}
              >
                {olSubject === subj && (
                  <motion.div
                    layoutId={`olTab_${districtId}`}
                    className="absolute inset-0 bg-white/10 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-white/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {subj.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.olSubjects[olSubject]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <filter id="glowDark2" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontWeight: 500 }} domain={[0, 100]} dx={-10} />
              <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', color: 'white' }} />
              <Line type="monotone" dataKey="Island Average" stroke="#94a3b8" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Provincial Average" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 9 }} filter="url(#glowDark2)" />
              <Line type="monotone" dataKey="District Average" name={`${districtName} District Average`} stroke={districtId === 'anuradhapura' ? '#3b82f6' : '#14b8a6'} strokeWidth={selectedZone ? 3 : 5} dot={{ r: selectedZone ? 5 : 7, strokeWidth: 2 }} filter="url(#glowDark2)" />
              {selectedZone && (
                <Line type="monotone" dataKey="Zone Average" name={`${selectedZone.name} Zone Average`} stroke="#f43f5e" strokeWidth={5} dot={{ r: 7, strokeWidth: 2 }} filter="url(#glowDark2)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
};

export default DistrictStatistics;
