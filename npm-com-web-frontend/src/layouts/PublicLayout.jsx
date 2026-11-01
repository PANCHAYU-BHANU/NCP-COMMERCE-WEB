import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ChevronDown, Camera, Film, Menu, X, Globe, BookOpen, BarChart3, Newspaper, Download, Phone, MapPin, Building2, Map, Trophy } from 'lucide-react';
import { translations } from '../pages/Home/translations';
import { useLanguage } from '../contexts/LanguageContext';
import VisionMissionModal from '../components/VisionMissionModal';
import LogoIntroPreloader from '../components/LogoIntroPreloader';

const PublicLayout = () => {
  const { lang, setLang } = useLanguage();
  const t = translations[lang] || translations.en;
  const [modalType, setModalType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleAboutNavigation = (anchorId) => {
    closeMobileMenu();
    if (location.pathname === '/') {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/#${anchorId}`);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  // Automatic Page & Logo Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    return !sessionStorage.getItem('ncp_initial_intro_done');
  });
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);
  const prevPathRef = useRef(location.pathname);

  const handleInitialLoadComplete = () => {
    setIsInitialLoading(false);
    sessionStorage.setItem('ncp_initial_intro_done', 'true');
  };

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      if (!isInitialLoading) {
        setIsRouteTransitioning(true);
        const timer = setTimeout(() => {
          setIsRouteTransitioning(false);
        }, 450);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, isInitialLoading]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── AUTOMATIC NCP COMMERCE LOGO PAGE PRELOADER ── */}
      <LogoIntroPreloader
        isOpen={isInitialLoading}
        mode="initial"
        onComplete={handleInitialLoadComplete}
      />

      <LogoIntroPreloader
        isOpen={!isInitialLoading && isRouteTransitioning}
        mode="transition"
        onComplete={() => setIsRouteTransitioning(false)}
      />
      {/* ── PRESTIGIOUS HEADER / NAVBAR ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80"
      >
        {/* 1. TOP GOVERNMENT UTILITY BAR */}
        <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] sm:text-[11px] py-1 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-300 tracking-wide">
                {lang === 'si'
                  ? 'ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය | උතුරු මැද පළාත'
                  : lang === 'ta'
                  ? 'இலங்கை ஜனநாயக சோசலிசக் குடியரசு | வடமத்திய மாகாணம்'
                  : 'Democratic Socialist Republic of Sri Lanka | North Central Province'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Trilingual Toggle */}
              <div className="flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
                {['si', 'ta', 'en'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded-full transition-all ${
                      lang === l ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l === 'si' ? 'සිංහල' : l === 'ta' ? 'தமிழ்' : 'EN'}
                  </button>
                ))}
              </div>

              {/* Staff Portal Login */}
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center space-x-1 text-slate-200 hover:text-white font-bold bg-blue-600 hover:bg-blue-500 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] shadow-sm transition-all"
              >
                <LogIn className="w-3 h-3" />
                <span>{lang === 'si' ? 'ඇතුල්වීම (CMS)' : 'Staff Login'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. MAIN BRAND & MENU BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          
          {/* Logo & Department Brand */}
          <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3 group">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/emblem.png"
              alt="NCP Emblem"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-slate-900 font-extrabold text-[12px] sm:text-[14px] lg:text-[15px] leading-tight tracking-tight">
                {lang === 'si'
                  ? 'පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව — උතුරු මැද පළාත'
                  : lang === 'ta'
                  ? 'வடமத்திய மாகாண கல்வித் திணைக்களம்'
                  : 'Provincial Department of Education — NCP'}
              </span>
              <span className="text-blue-600 font-black text-[10px] sm:text-[11px] uppercase tracking-wider leading-tight">
                {lang === 'si'
                  ? 'වාණිජ අධ්‍යාපන අංශය'
                  : lang === 'ta'
                  ? 'வர்த்தகப் பிரிவு'
                  : 'Commerce Education Branch'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Clean Single Row with Dropdowns) */}
          <div className="hidden lg:flex items-center space-x-5 text-xs font-bold text-slate-700">
            <Link
              to="/"
              className={`hover:text-blue-600 transition-colors py-1 ${location.pathname === '/' ? 'text-blue-600 font-black' : ''}`}
            >
              {lang === 'si' ? 'මුල් පිටුව' : 'Home'}
            </Link>

            {/* About Us Dropdown */}
            <div className="relative group py-1">
              <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <span>{lang === 'si' ? 'අප ගැන' : 'About Us'}</span>
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 z-50">
                <button
                  onClick={() => handleAboutNavigation('about-department')}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all text-left"
                >
                  {lang === 'si' ? 'දෙපාර්තමේන්තුව' : 'Department Overview'}
                </button>
                <button
                  onClick={() => handleAboutNavigation('director-message')}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all text-left"
                >
                  {lang === 'si' ? 'අධ්‍යක්ෂ පණිවිඩය' : "Director's Desk"}
                </button>
                <button
                  onClick={() => setModalType('vision')}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all text-left"
                >
                  {lang === 'si' ? 'දැක්ම (Vision)' : 'Vision'}
                </button>
                <button
                  onClick={() => setModalType('mission')}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all text-left"
                >
                  {lang === 'si' ? 'මෙහෙවර (Mission)' : 'Mission'}
                </button>
              </div>
            </div>

            {/* Districts Dropdown */}
            <div className="relative group py-1">
              <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <span>{lang === 'si' ? 'දිස්ත්‍රික්ක' : 'Districts'}</span>
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 z-50">
                <Link
                  to="/districts/anuradhapura"
                  className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 mr-2 text-blue-500" />
                  <span>Anuradhapura (කලාප 8)</span>
                </Link>
                <Link
                  to="/districts/polonnaruwa"
                  className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-teal-600 hover:bg-teal-50/80 rounded-xl font-bold transition-all"
                >
                  <Map className="w-3.5 h-3.5 mr-2 text-teal-500" />
                  <span>Polonnaruwa (කලාප 3)</span>
                </Link>
              </div>
            </div>

            <Link
              to="/subjects"
              className={`hover:text-blue-600 transition-colors py-1 ${location.pathname === '/subjects' ? 'text-blue-600 font-black' : ''}`}
            >
              {lang === 'si' ? 'විෂයයන්' : 'Subjects'}
            </Link>

            <Link
              to="/explore/results"
              className={`hover:text-blue-600 transition-colors py-1 ${location.pathname === '/explore/results' ? 'text-blue-600 font-black' : ''}`}
            >
              {lang === 'si' ? 'විශ්ලේෂණ' : 'Analytics'}
            </Link>

            <Link
              to="/rankings"
              className={`hover:text-blue-600 transition-colors py-1 flex items-center space-x-1 ${location.pathname === '/rankings' ? 'text-amber-600 font-black' : ''}`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'si' ? 'ශ්‍රේණිගත කිරීම්' : 'Rankings'}</span>
            </Link>

            <Link
              to="/downloads"
              className={`hover:text-blue-600 transition-colors py-1 ${location.pathname === '/downloads' ? 'text-blue-600 font-black' : ''}`}
            >
              {lang === 'si' ? 'ප්‍රශ්න පත්‍ර & සම්පත්' : 'Downloads'}
            </Link>

            {/* News & Media Dropdown */}
            <div className="relative group py-1">
              <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <span>{lang === 'si' ? 'පුවත් & මාධ්‍ය' : 'News & Media'}</span>
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 z-50">
                <Link
                  to="/news-events"
                  className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all"
                >
                  <Newspaper className="w-3.5 h-3.5 mr-2 text-blue-500" />
                  <span>{lang === 'si' ? 'පුවත් & සිදුවීම්' : 'News & Events'}</span>
                </Link>
                <Link
                  to="/media/photos"
                  className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-bold transition-all"
                >
                  <Camera className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                  <span>{lang === 'si' ? 'ඡායාරූප' : 'Photo Gallery'}</span>
                </Link>
                <Link
                  to="/media/videos"
                  className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl font-bold transition-all"
                >
                  <Film className="w-3.5 h-3.5 mr-2 text-red-500" />
                  <span>{lang === 'si' ? 'වීඩියෝ' : 'Video Gallery'}</span>
                </Link>
              </div>
            </div>

            <Link to="/contact" className={`hover:text-blue-600 transition-colors py-1 ${location.pathname === '/contact' ? 'text-blue-600 font-black' : ''}`}>
              {lang === 'si' ? 'සම්බන්ධ වන්න' : 'Contact'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <Link
              to="/login"
              className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* 3. MOBILE SLIDE-DOWN DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-6 py-5 shadow-2xl overflow-hidden"
            >
              {/* Language Picker on Mobile */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language:</span>
                <div className="flex bg-slate-100 rounded-full p-0.5 border border-slate-200">
                  {['si', 'ta', 'en'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                        lang === l ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      {l === 'si' ? 'සිංහල' : l === 'ta' ? 'தமிழ்' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col space-y-3 text-sm font-bold text-slate-700">
                <Link to="/" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Home (මුල් පිටුව)</Link>
                <button
                  onClick={() => handleAboutNavigation('about-department')}
                  className="text-left hover:text-blue-600 py-1"
                >
                  {lang === 'si' ? 'දෙපාර්තමේන්තුව (Department Overview)' : 'Department Overview'}
                </button>
                <button
                  onClick={() => handleAboutNavigation('director-message')}
                  className="text-left hover:text-blue-600 py-1"
                >
                  {lang === 'si' ? 'අධ්‍යක්ෂ පණිවිඩය (Director Desk)' : "Director's Desk"}
                </button>
                <Link to="/districts/anuradhapura" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Anuradhapura District (කලාප 8)</Link>
                <Link to="/districts/polonnaruwa" onClick={closeMobileMenu} className="hover:text-teal-600 py-1">Polonnaruwa District (කලාප 3)</Link>
                <Link to="/subjects" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Core Subjects (විෂයයන්)</Link>
                <Link to="/explore/results" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Performance Analytics (විශ්ලේෂණ)</Link>
                <Link to="/rankings" onClick={closeMobileMenu} className="hover:text-amber-600 py-1 flex items-center space-x-1.5 text-amber-700">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rankings & Leaderboard (ශ්‍රේණිගත කිරීම්)</span>
                </Link>
                <Link to="/downloads" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Downloads & Papers (ප්‍රශ්න පත්‍ර)</Link>
                <Link to="/news-events" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">News & Events (පුවත්)</Link>
                <Link to="/media/photos" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Media Gallery (මාධ්‍ය)</Link>
                <button
                  onClick={() => { setModalType('vision'); closeMobileMenu(); }}
                  className="text-left hover:text-blue-600 py-1"
                >
                  Vision & Mission (දැක්ම සහ මෙහෙවර)
                </button>
                <Link to="/contact" onClick={closeMobileMenu} className="hover:text-blue-600 py-1">Contact Us (සම්බන්ධ වන්න)</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── MAIN CONTENT AREA WITH EXACT HEADER CLEARANCE ── */}
      <main className="pt-[92px] sm:pt-[98px] min-h-screen flex flex-col flex-1">
        <Outlet />
      </main>

      {/* Vision & Mission Modal */}
      <VisionMissionModal
        isOpen={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
};

export default PublicLayout;
