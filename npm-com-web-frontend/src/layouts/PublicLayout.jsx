import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ChevronDown, Camera, Film, Menu, X, Globe, BookOpen, BarChart3, Newspaper, Download, Phone, MapPin, Building2, Map, Trophy, Home, Sparkles, Award, FileText, Bell } from 'lucide-react';
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
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 pr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-300 tracking-wide truncate">
                <span className="sm:hidden">
                  {lang === 'si' ? '🏛️ උතුරු මැද පළාත් අධ්‍යාපනය' : lang === 'ta' ? '🏛️ வடமத்திய மாகாண கல்வி' : '🏛️ NCP Education • gov.lk'}
                </span>
                <span className="hidden sm:inline">
                  {lang === 'si'
                    ? 'ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය | උතුරු මැද පළාත'
                    : lang === 'ta'
                    ? 'இலங்கை ஜனநாயக சோசலிசக் குடியரசு | வடமத்திய மாகாணம்'
                    : 'Democratic Socialist Republic of Sri Lanka | North Central Province'}
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
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
          <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-2 sm:space-x-3 group min-w-0 flex-1 pr-2">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/emblem.png"
              alt="NCP Emblem"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-slate-900 font-black text-[11px] sm:text-[14px] lg:text-[15px] leading-tight tracking-tight truncate">
                {lang === 'si'
                  ? 'පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව — NCP'
                  : lang === 'ta'
                  ? 'வடமத்திய மாகாண கல்வித் திணைக்களம்'
                  : 'Provincial Dept. of Education — NCP'}
              </span>
              <span className="text-blue-600 font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider leading-tight truncate">
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
                  <span>{lang === 'si' ? 'අනුරාධපුර දිස්ත්‍රික්කය' : 'Anuradhapura District'}</span>
                </Link>
                <Link
                  to="/districts/polonnaruwa"
                  className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-teal-600 hover:bg-teal-50/80 rounded-xl font-bold transition-all"
                >
                  <Map className="w-3.5 h-3.5 mr-2 text-teal-500" />
                  <span>{lang === 'si' ? 'පොළොන්නරුව දිස්ත්‍රික්කය' : 'Polonnaruwa District'}</span>
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
          <div className="flex items-center space-x-1.5 lg:hidden shrink-0">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full flex items-center space-x-1 transition-all active:scale-95"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        
      </motion.nav>

      {/* 3. MODERN SLIDE-OVER EXECUTIVE MOBILE DRAWER (MATCHING CMS DESIGN) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Dark Blur Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm lg:hidden"
              />

              {/* Side Drawer Content */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                className="fixed inset-y-0 left-0 z-[130] w-72 max-w-[85vw] h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col shadow-2xl border-r border-slate-800 lg:hidden"
              >
                {/* Brand Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70 backdrop-blur-md">
                  <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-2.5">
                    <img src="/emblem.png" alt="Emblem" className="w-9 h-9 object-contain shrink-0 drop-shadow-md" />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-xs text-white uppercase tracking-wide">NCP Commerce</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-600/40 text-blue-300 border border-blue-500/30">
                          Portal
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-amber-400/90 leading-tight">Commerce Education Branch</p>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">Dept of Education — NCP</p>
                    </div>
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close navigation"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Trilingual Language Selector */}
                <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language:</span>
                  <div className="flex bg-slate-800 rounded-full p-0.5 border border-slate-700">
                    {['si', 'ta', 'en'].map(l => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                          lang === l ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {l === 'si' ? 'සිංහල' : l === 'ta' ? 'தமிழ்' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Nav Items */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar text-xs">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Home size={15} className="text-blue-400" />
                    <span>{lang === 'si' ? 'මුල් පිටුව (Home)' : 'Home'}</span>
                  </Link>

                  <button
                    onClick={() => { handleAboutNavigation('about-department'); closeMobileMenu(); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left cursor-pointer"
                  >
                    <Building2 size={15} className="text-teal-400" />
                    <span>{lang === 'si' ? 'දෙපාර්තමේන්තුව' : 'Department Overview'}</span>
                  </button>

                  <button
                    onClick={() => { handleAboutNavigation('director-message'); closeMobileMenu(); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left cursor-pointer"
                  >
                    <Sparkles size={15} className="text-amber-400" />
                    <span>{lang === 'si' ? 'අධ්‍යක්ෂ පණිවිඩය' : "Director's Desk"}</span>
                  </button>

                  <button
                    onClick={() => { setModalType('vision'); closeMobileMenu(); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left cursor-pointer"
                  >
                    <Award size={15} className="text-yellow-400" />
                    <span>{lang === 'si' ? 'දැක්ම සහ මෙහෙවර' : 'Vision & Mission'}</span>
                  </button>

                  <div className="pt-2 pb-1 px-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Districts & Hubs</span>
                  </div>

                  <Link
                    to="/districts/anuradhapura"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <MapPin size={15} className="text-blue-400" />
                    <span>{lang === 'si' ? 'අනුරාධපුර දිස්ත්‍රික්කය' : 'Anuradhapura District'}</span>
                  </Link>

                  <Link
                    to="/districts/polonnaruwa"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <MapPin size={15} className="text-teal-400" />
                    <span>{lang === 'si' ? 'පොළොන්නරුව දිස්ත්‍රික්කය' : 'Polonnaruwa District'}</span>
                  </Link>

                  <div className="pt-2 pb-1 px-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Academic & Results</span>
                  </div>

                  <Link
                    to="/subjects"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <BookOpen size={15} className="text-emerald-400" />
                    <span>Core Subjects (විෂයයන්)</span>
                  </Link>

                  <Link
                    to="/explore/results"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <BarChart3 size={15} className="text-sky-400" />
                    <span>Performance Analytics</span>
                  </Link>

                  <Link
                    to="/rankings"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-amber-300 hover:bg-slate-800/80 hover:text-amber-200 transition-all bg-amber-500/10 border border-amber-500/20"
                  >
                    <Trophy size={15} className="text-amber-400" />
                    <span>Rankings & Leaderboard</span>
                  </Link>

                  <Link
                    to="/downloads"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <FileText size={15} className="text-indigo-400" />
                    <span>Downloads & Papers</span>
                  </Link>

                  <Link
                    to="/news-events"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <Bell size={15} className="text-rose-400" />
                    <span>News & Events (පුවත්)</span>
                  </Link>

                  <Link
                    to="/contact"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <Phone size={15} className="text-teal-400" />
                    <span>Contact Us (සම්බන්ධ වන්න)</span>
                  </Link>
                </div>

                {/* Bottom CTA / CMS Portal Login */}
                <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <LogIn size={14} />
                    <span>Officer & Teacher Portal (CMS Login)</span>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


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
