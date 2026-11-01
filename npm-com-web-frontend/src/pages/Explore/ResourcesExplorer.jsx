import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookMarked, Search, ArrowLeft, Download, FileText, Filter
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ResourcesExplorer = () => {
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Filters State
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    level: searchParams.get('level') || 'all',
    subjectId: searchParams.get('subjectId') || 'all'
  });

  // Reference Data
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);

  // Fetch Reference Data on mount
  useEffect(() => {
    const fetchRefData = async () => {
      try {
        const subjRes = await fetch('http://localhost:8080/api/public/subjects');
        if(subjRes.ok) setSubjects(await subjRes.json());
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };
    fetchRefData();
  }, []);

  // Fetch Resources based on filters
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        let url = new URL('http://localhost:8080/api/public/resources');
        if (filters.type !== 'all') url.searchParams.append('type', filters.type);
        if (filters.level !== 'all') url.searchParams.append('level', filters.level);
        if (filters.subjectId !== 'all') url.searchParams.append('subjectId', filters.subjectId);
        
        const res = await fetch(url);
        if(res.ok) {
          setResources(await res.json());
        }
      } catch(err) {
        console.error("Error fetching resources", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'PAST_PAPER': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MARKING_SCHEME': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'TERM_TEST': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'UNIT_TEST': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatType = (type) => type.replace('_', ' ');

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL EDUCATIONAL IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-center">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/slide_3.png)` }}
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
                <BookMarked className="w-4 h-4 text-teal-300" />
                <span>Provincial Digital Library</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                Resource Repository
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Search, filter, and download curriculum modules, marking guides, and model question papers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN REPOSITORY CONTENT (ZERO OVERLAP!) ── */}
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resource Type</label>
                  <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 outline-none transition-colors">
                    <option value="all">All Types</option>
                    <option value="PAST_PAPER">National Past Papers</option>
                    <option value="MARKING_SCHEME">Marking Schemes</option>
                    <option value="TERM_TEST">Term Test Papers (NCP)</option>
                    <option value="UNIT_TEST">Unit Test Papers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Exam Level</label>
                  <select name="level" value={filters.level} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 outline-none transition-colors">
                    <option value="all">A/L & O/L</option>
                    <option value="AL">A/L (Advanced Level)</option>
                    <option value="OL">O/L (Ordinary Level)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                  <select name="subjectId" value={filters.subjectId} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 outline-none transition-colors">
                    <option value="all">All Subjects</option>
                    {subjects.filter(s => filters.level === 'all' || s.type === filters.level).map(s => 
                      <option key={s.id} value={s.id}>{s.name} ({s.type} - {s.medium})</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS AREA */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Resources Found</h3>
                <p className="text-slate-500 text-center max-w-sm">We couldn't find any documents matching your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((res, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={res.id} 
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:border-teal-100 transition-all group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeStyle(res.resourceType)}`}>
                            {formatType(res.resourceType)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {res.examYear}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg mb-1 flex-1 leading-snug">{res.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {res.subject?.name} • {res.examLevel} • {res.subject?.medium}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <span className="text-xs text-slate-400">
                        Uploaded: {new Date(res.uploadedAt).toLocaleDateString()}
                      </span>
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResourcesExplorer;
