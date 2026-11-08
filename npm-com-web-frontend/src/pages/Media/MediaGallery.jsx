import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Film, BookOpen, GraduationCap, Users, UserCog, Activity, Search, X } from 'lucide-react';

const MediaGallery = () => {
  const { type } = useParams(); // 'photos' or 'videos'
  const isVideo = type === 'videos';
  const pageTitle = isVideo ? 'Video Gallery' : 'Photo Gallery';
  const Icon = isVideo ? Film : Camera;

  const [activeCategory, setActiveCategory] = useState('unit_test');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL'); // 'ALL', 'AL', 'OL'

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMedia();
  }, [type]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/media`);
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const categories = [
    { id: 'unit_test', name: 'Unit Test', icon: BookOpen },
    { id: 'term_test', name: 'Term Test', icon: GraduationCap },
    { id: 'teacher_prog', name: 'Teacher Programme', icon: UserCog },
    { id: 'student_prog', name: 'Student Programme', icon: Users },
    { id: 'extra_act', name: 'Extra Activities', icon: Activity },
  ];

  const currentMedia = mediaItems
    .filter(item => {
      const itemType = (item.type || '').toLowerCase();
      const isItemVideo = itemType.includes('video');
      return isVideo ? isItemVideo : !isItemVideo;
    })
    .filter(item => {
      const album = (item.album || '').toLowerCase().replace(' ', '_');
      return album.includes(activeCategory);
    })
    .filter(item => {
      if (levelFilter === 'ALL') return true;
      const el = item.examLevel || 'GENERAL';
      return el === 'GENERAL' || el === levelFilter;
    })
    .map(item => ({
      id: item.id,
      title: item.title,
      url: item.url.startsWith('http') ? item.url : (item.url.startsWith('/') ? item.url : `/${item.url}`)
    }));

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL EDUCATIONAL IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-center">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/slide_1.png)` }}
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
                <Icon className="w-4 h-4 text-teal-300" />
                <span>Provincial Multimedia Archives</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {pageTitle}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Official photographic and video archives of North Central Province commerce seminars, competitions, and exhibitions.
              </p>
            </div>

            {/* Level Filter */}
            <div className="flex space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl flex-shrink-0">
              {[{id:'ALL',label:'All Categories'},{id:'AL',label:'G.C.E. A/L'},{id:'OL',label:'G.C.E. O/L'}].map(lv => (
                <button key={lv.id} onClick={() => setLevelFilter(lv.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    levelFilter === lv.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-300 hover:text-white'
                  }`}>{lv.label}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN MEDIA CONTENT (ZERO OVERLAP!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* CATEGORIES SIDEBAR */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 px-2">Categories</h3>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              {categories.map(cat => {
                const CatIcon = cat.icon;
                return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap md:whitespace-normal flex-shrink-0 ${
                    activeCategory === cat.id 
                      ? 'bg-white shadow-md text-blue-600 border border-slate-100 scale-[1.02]' 
                      : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                  }`}
                >
                  <CatIcon className={`w-5 h-5 ${activeCategory === cat.id ? 'text-blue-500' : 'opacity-70'}`} />
                  <span className="font-bold text-sm">{cat.name}</span>
                </button>
              )})}
            </div>
          </div>

          {/* MEDIA GRID */}
          <div className="flex-1 p-6 md:p-10 bg-white min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <div className="bg-slate-100 rounded-full px-4 py-1.5 text-xs font-bold text-slate-500">
                {currentMedia.length} Items
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCategory + type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {loading ? (
                  <div className="col-span-full flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : currentMedia.length > 0 ? (
                  currentMedia.map((media, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={media.id} 
                      onClick={() => setSelectedMedia(media)}
                      className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-video cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      {isVideo ? (
                        <video 
                          src={media.url}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          preload="metadata"
                          onMouseEnter={(e) => e.target.play().catch(() => {})}
                          onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                          muted
                          loop
                        />
                      ) : (
                        <img 
                          src={media.url} 
                          alt={media.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                        <h4 className="text-white font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{media.title}</h4>
                        {isVideo && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                            <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium text-lg">No media found for this category.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 cursor-pointer"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl bg-black flex flex-col"
            >
              <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center">
                {isVideo ? (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.title} 
                    className="w-full h-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
              <div className="p-6 md:p-8 bg-slate-900 border-t border-white/10">
                <h3 className="text-white text-xl md:text-2xl font-bold">{selectedMedia.title}</h3>
                {isVideo && <p className="text-white/60 mt-2 flex items-center"><Film className="w-4 h-4 mr-2"/> Video Playback</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
