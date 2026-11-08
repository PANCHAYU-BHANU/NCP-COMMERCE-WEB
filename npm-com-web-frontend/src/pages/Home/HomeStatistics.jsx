import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { School, Users, GraduationCap, TrendingUp, BarChart2, BookOpen } from 'lucide-react';

/* --- DYNAMIC DATA --- */
const districtComparisonData = []; // To be replaced with real API data when built
const alData = {
  'Economics': [],
  'Business Studies': [],
  'Accounting': []
};
const olData = {
  'Business & Accounting': [],
  'Entrepreneurship': []
};

const StatCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-3xl p-6 shadow-xl bg-gradient-to-br ${gradient} border border-white/20`}
  >
    <div className="absolute top-0 right-0 p-6 opacity-10">
      <Icon className="w-24 h-24 text-white" />
    </div>
    <div className="relative z-10">
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">{title}</h4>
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <p className="text-white/70 text-xs font-medium">{subtitle}</p>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Enforce specific order: National, Provincial, Anuradhapura, Polonnaruwa
    const order = ['National', 'Provincial', 'Anuradhapura', 'Polonnaruwa'];
    const sortedPayload = [...payload].sort((a, b) => {
      const aIndex = order.indexOf(a.dataKey);
      const bIndex = order.indexOf(b.dataKey);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return (
      <div className="bg-white/95 border border-slate-200 p-5 rounded-2xl shadow-xl min-w-[200px]">
        <p className="text-slate-800 text-2xl font-black mb-4 pb-2 border-b border-slate-100">{label}</p>
        {sortedPayload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
            <div className="flex items-center space-x-3">
              <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
              <p className="text-slate-600 text-sm font-medium">{entry.name}</p>
            </div>
            <span className="text-slate-800 font-bold text-lg ml-4">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const HomeStatistics = () => {
  const [alSubject, setAlSubject] = useState('Economics');
  const [olSubject, setOlSubject] = useState('Business & Accounting');
  const [stats, setStats] = useState({
      national: { schools: 0, teachers: 0, students: 0, passRateCurrent: 0, passRatePrev1: 0, passRatePrev2: 0, currentYear: new Date().getFullYear() },
      provincial: { schools: 0, teachers: 0, students: 0, passRateCurrent: 0, passRatePrev1: 0, passRatePrev2: 0 }
  });

  React.useEffect(() => {
    fetch('/api/public/statistics/overview')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        


        {/* 1. National & Provincial Cards */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 border-l-4 border-blue-600 pl-4">National Statistics</h3>
                    {/* National Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <StatCard icon={School} title="Island Commerce Schools" value={(stats.national?.schools ?? 0).toLocaleString()} subtitle="Offering Commerce A/L" gradient="from-slate-700 to-slate-900" />
            <StatCard icon={Users} title="Island Commerce Teachers" value={(stats.national?.teachers ?? 0).toLocaleString()} subtitle="Commerce Educators" gradient="from-slate-600 to-slate-800" />
            <StatCard icon={GraduationCap} title="Island Commerce Students" value={(stats.national?.students ?? 0).toLocaleString()} subtitle="Commerce Students" gradient="from-slate-700 to-slate-900" />
            
            <StatCard icon={TrendingUp} title={`${stats.national?.currentYear || new Date().getFullYear()} Pass Rate`} value={`${stats.national?.passRateCurrent ?? 0}%`} subtitle="National Average" gradient="from-indigo-600 to-indigo-900" />
            <StatCard icon={TrendingUp} title={`${(stats.national?.currentYear || new Date().getFullYear()) - 1} Pass Rate`} value={`${stats.national?.passRatePrev1 ?? 0}%`} subtitle="National Average" gradient="from-blue-600 to-blue-900" />
            <StatCard icon={TrendingUp} title={`${(stats.national?.currentYear || new Date().getFullYear()) - 2} Pass Rate`} value={`${stats.national?.passRatePrev2 ?? 0}%`} subtitle="National Average" gradient="from-slate-800 to-black" />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center justify-center">Provincial Level (NCP)</h3>
          {/* Provincial Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={School} title="Province Commerce Schools" value={(stats.provincial?.schools ?? 0).toLocaleString()} subtitle="North Central Province" gradient="from-blue-500 to-blue-700" />
            <StatCard icon={Users} title="Province Commerce Teachers" value={(stats.provincial?.teachers ?? 0).toLocaleString()} subtitle="Commerce Educators" gradient="from-teal-500 to-teal-700" />
            <StatCard icon={GraduationCap} title="Province Commerce Students" value={(stats.provincial?.students ?? 0).toLocaleString()} subtitle="Commerce Students" gradient="from-blue-600 to-indigo-700" />
            
            <StatCard icon={TrendingUp} title={`${stats.national?.currentYear || new Date().getFullYear()} Pass Rate`} value={`${stats.provincial?.passRateCurrent ?? 0}%`} subtitle="NCP Average" gradient="from-emerald-500 to-emerald-700" />
            <StatCard icon={TrendingUp} title={`${(stats.national?.currentYear || new Date().getFullYear()) - 1} Pass Rate`} value={`${stats.provincial?.passRatePrev1 ?? 0}%`} subtitle="NCP Average" gradient="from-teal-600 to-teal-800" />
            <StatCard icon={TrendingUp} title={`${(stats.national?.currentYear || new Date().getFullYear()) - 2} Pass Rate`} value={`${stats.provincial?.passRatePrev2 ?? 0}%`} subtitle="NCP Average" gradient="from-cyan-600 to-cyan-800" />
          </div>
        </div>

        {/* 2. District Comparison (3 Years) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-20"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center space-x-3">
            <BookOpen className="text-blue-600 w-6 h-6" />
            <span>5-Year Commerce Pass Rate Comparison (Districts)</span>
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorPol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 14 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} domain={[0, 100]} dx={-10} />
                <Tooltip cursor={{ fill: '#f8fafc', opacity: 0.5 }} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '12px 16px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
                <Bar dataKey="Anuradhapura" name="Anuradhapura District" fill="url(#colorAnu)" radius={[8, 8, 0, 0]} maxBarSize={45} />
                <Bar dataKey="Polonnaruwa" name="Polonnaruwa District" fill="url(#colorPol)" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. A/L Subjects Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <GraduationCap className="text-indigo-600 w-6 h-6" />
              <span>A/L Subjects: 5-Year Comparison</span>
            </h3>
            <div className="flex bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-2xl relative shadow-inner">
              {['Economics', 'Business Studies', 'Accounting'].map(subj => (
                <button
                  key={subj}
                  onClick={() => setAlSubject(subj)}
                  className={`relative px-5 py-2.5 text-sm font-extrabold rounded-xl transition-colors duration-300 ${alSubject === subj ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {alSubject === subj && (
                    <motion.div
                      layoutId="alTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
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
              <LineChart data={alData[alSubject]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 14 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} domain={[0, 100]} dx={-10} />
                <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
                <Line type="monotone" dataKey="National" name="Island Average" stroke="#94a3b8" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Provincial" name="Province Average" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 9 }} filter="url(#glow)" />
                <Line type="monotone" dataKey="Anuradhapura" name="Anuradhapura" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} filter="url(#glow)" />
                <Line type="monotone" dataKey="Polonnaruwa" name="Polonnaruwa" stroke="#14b8a6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} filter="url(#glow)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. O/L Subjects Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <School className="text-teal-600 w-6 h-6" />
              <span>O/L Subjects: 5-Year Comparison</span>
            </h3>
            <div className="flex bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-2xl relative shadow-inner">
              {['Business & Accounting', 'Entrepreneurship'].map(subj => (
                <button
                  key={subj}
                  onClick={() => setOlSubject(subj)}
                  className={`relative px-5 py-2.5 text-sm font-extrabold rounded-xl transition-colors duration-300 ${olSubject === subj ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {olSubject === subj && (
                    <motion.div
                      layoutId="olTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
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
              <LineChart data={olData[olSubject]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 14 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} domain={[0, 100]} dx={-10} />
                <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
                <Line type="monotone" dataKey="National" name="Island Average" stroke="#94a3b8" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Provincial" name="Province Average" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 9 }} filter="url(#glow2)" />
                <Line type="monotone" dataKey="Anuradhapura" name="Anuradhapura" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} filter="url(#glow2)" />
                <Line type="monotone" dataKey="Polonnaruwa" name="Polonnaruwa" stroke="#14b8a6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} filter="url(#glow2)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HomeStatistics;
