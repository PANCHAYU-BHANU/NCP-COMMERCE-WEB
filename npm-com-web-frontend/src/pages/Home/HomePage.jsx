import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from './translations';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  GraduationCap, BarChart3, Users, BookOpen, Award, ChevronRight,
  School, TrendingUp, FileText, Globe, Star, ArrowRight, LogIn,
  Building2, Map, BookMarked, Layers, BarChart2, PieChart,
  ClipboardList, UserCog, GitCompare, BookCopy, TestTube,
  FileQuestion, Trophy, Briefcase, Target, Compass, Sparkles,
  CheckCircle2, Calendar, Phone, Mail, MapPin, Clock, Download,
  ExternalLink, ArrowUpRight, ShieldCheck, Newspaper
} from 'lucide-react';

/* ───── Animated Counter Component ───── */
const Counter = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.ceil(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
   ════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;
  const slides = ['/slide_1.png', '/slide_2.png', '/slide_3.png'];

  // Load Provincial Director CMS settings from localStorage
  const [cmsSettings, setCmsSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ncp_homepage_settings');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [stats, setStats] = useState({
    schools: 118,
    students: 12540,
    teachers: 462,
    passRate: 82.4
  });

  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);

  // Fetch real statistics & news from API
  useEffect(() => {
    fetch('http://localhost:8080/api/public/statistics/overview')
      .then(res => res.json())
      .then(data => {
        if (data && data.provincial) {
          setStats({
            schools: cmsSettings?.schoolsCount || data.provincial.schools || 118,
            students: cmsSettings?.studentsCount || (data.provincial.students ? (data.provincial.students > 1000 ? data.provincial.students : 12540) : 12540),
            teachers: cmsSettings?.teachersCount || (data.provincial.teachers ? (data.provincial.teachers > 100 ? data.provincial.teachers : 462) : 462),
            passRate: cmsSettings?.passRate || data.provincial.passRatePrev1 || 82.4
          });
        }
      })
      .catch(err => console.error("Error fetching stats:", err));

    fetch('http://localhost:8080/api/public/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNewsList(data.slice(0, 3));
        } else {
          // Fallback curated news
          setNewsList([
            {
              id: 1,
              title: "NCP Commerce Day & Excellence Awards 2026",
              category: "WORKSHOP",
              content: "Provincial commerce gathering and student awards ceremony recognizing top island-rank achievers and innovative entrepreneurship projects.",
              createdAt: "2026-10-15"
            },
            {
              id: 2,
              title: "A/L Accounting & Economics Master Revision Workshop",
              category: "SEMINAR",
              content: "Special seminar series conducted by National Subject In-Service Advisors (ISA) for Grade 13 Commerce students across all 11 zones.",
              createdAt: "2026-10-10"
            },
            {
              id: 3,
              title: "Release of 2026 NCP Term & Unit Evaluation Papers",
              category: "EXAMINATION",
              content: "Standardized evaluation question papers and marking rubrics for Business Studies, Accounting, and ICT are now available in the download portal.",
              createdAt: "2026-10-05"
            }
          ]);
        }
      })
      .catch(() => {
        setNewsList([
          {
            id: 1,
            title: "NCP Commerce Day & Excellence Awards 2026",
            category: "WORKSHOP",
            content: "Provincial commerce gathering and student awards ceremony recognizing top island-rank achievers across Rajarata schools.",
            createdAt: "2026-10-15"
          },
          {
            id: 2,
            title: "A/L Accounting & Economics Master Revision Workshop",
            category: "SEMINAR",
            content: "Special seminar series conducted by National In-Service Advisors (ISA) for Grade 13 Commerce students across 11 zones.",
            createdAt: "2026-10-10"
          },
          {
            id: 3,
            title: "Release of 2026 NCP Term & Unit Evaluation Papers",
            category: "EXAMINATION",
            content: "Standardized evaluation question papers and marking rubrics for all subjects are now available in the resource portal.",
            createdAt: "2026-10-05"
          }
        ]);
      });
  }, []);

  // Slide carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-blue-600 selection:text-white">

      {/* ══════════════════════════════════════════════════════════════
          1. HERO SECTION (Prestigious Institutional Showcase)
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[82vh] lg:min-h-[86vh] flex items-center overflow-hidden py-14 lg:py-18">
        {/* Background Slides */}
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide]}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover"
            alt={`NCP Education slide ${currentSlide + 1}`}
          />
        </AnimatePresence>

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column: Headlines, CTAs & Quick Highlights */}
            <div className="lg:col-span-7 text-left space-y-6">

              {/* Department Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center"
              >
                <div className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-blue-600/30 to-teal-500/20 border border-teal-400/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg shadow-teal-500/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-teal-200 text-xs md:text-sm font-bold tracking-wide uppercase">
                    {t.hero.provincialDept}
                  </span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.2] mb-4 tracking-tight drop-shadow-xl">
                  {t.hero.welcomeTo}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-400 to-cyan-300">
                    {t.hero.commerceSection}
                  </span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
                  {lang === 'si'
                    ? 'අනුරාධපුරය සහ පොළොන්නරුව දිස්ත්‍රික්කයන්හි පාසල් 118 කට අධික සංඛ්‍යාවක වාණිජ, ගිණුම්කරණ, ආර්ථික විද්‍යා සහ ව්‍යවසායකත්ව අධ්‍යාපනය ජාතික විශිෂ්ටත්වය කරා මෙහෙයවන නිල අධ්‍යාපන ද්වාරය.'
                    : lang === 'ta'
                      ? 'அனுராதபுரம் மற்றும் பொலன்னறுவை மாவட்டங்களில் வர்த்தகக் கல்வியை வழிநடத்தும் வடமத்திய மாகாண கல்வித் திணைக்களத்தின் உத்தியோகபூர்வ இணையத்தளம்.'
                      : 'Guiding academic excellence, financial acumen, and entrepreneurial innovation across 118+ commerce schools in Anuradhapura & Polonnaruwa districts.'}
                </p>
              </motion.div>

              {/* Quick Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-wrap gap-3.5"
              >
                <a
                  href="#districts"
                  className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>{lang === 'si' ? 'දිස්ත්‍රික් පුවරු (Districts)' : 'Explore District Hubs'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <Link
                  to="/downloads"
                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-2xl backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <BookOpen className="w-4 h-4 text-teal-300" />
                  <span>{lang === 'si' ? 'ප්‍රශ්න පත්‍ර හා සම්පත්' : 'Past Papers & Resources'}</span>
                </Link>

                <Link
                  to="/explore/results"
                  className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm px-5 py-3 rounded-2xl backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'si' ? 'කාර්යසාධන විශ්ලේෂණය' : 'Performance Analytics'}</span>
                </Link>
              </motion.div>

              {/* Elegant Quick Highlights Strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/15"
              >
                <Link
                  to="/districts/anuradhapura"
                  className="inline-flex items-center space-x-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'si' ? 'අනුරාධපුරය (කලාප 8)' : 'Anuradhapura (8 Zones)'}</span>
                </Link>

                <Link
                  to="/districts/polonnaruwa"
                  className="inline-flex items-center space-x-2 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-200 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                >
                  <Map className="w-3.5 h-3.5 text-teal-400" />
                  <span>{lang === 'si' ? 'පොළොන්නරුව (කලාප 3)' : 'Polonnaruwa (3 Zones)'}</span>
                </Link>

                <span className="inline-flex items-center space-x-1.5 bg-white/10 border border-white/15 text-slate-300 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <School className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{stats.schools}+ {lang === 'si' ? 'පාසල්' : 'Schools'}</span>
                </span>

                <span className="inline-flex items-center space-x-1.5 bg-white/10 border border-white/15 text-slate-300 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'si' ? 'උසස් පෙළ & සාමාන්‍ය පෙළ' : 'A/L & O/L Stream'}</span>
                </span>
              </motion.div>

            </div>

          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-teal-400 shadow-md shadow-teal-400/50' : 'w-2 bg-white/30 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. PROVINCIAL METRICS BAND (Animated Counters)
         ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-14 relative border-y border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter end={stats.schools} label={lang === 'si' ? 'වාණිජ පාසල්' : 'Commerce Schools'} suffix="+" />
          <Counter end={stats.students} label={lang === 'si' ? 'වාණිජ සිසුන්' : 'Commerce Students'} suffix="+" />
          <Counter end={stats.teachers} label={lang === 'si' ? 'සුදුසුකම්ලත් ගුරුවරුන්' : 'Certified Teachers'} suffix="+" />
          <Counter end={Math.round(stats.passRate)} label={lang === 'si' ? 'සාමාන්‍ය සමත් ප්‍රතිශතය' : 'Average Pass Benchmark'} suffix="%" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. ABOUT DEPARTMENT SECTION (With students image)
         ══════════════════════════════════════════════════════════════ */}
      <section id="about-department" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: High-impact photo of our students */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 group">
                <img
                  src="/commerce_students.jpg"
                  alt="NCP Commerce Students in Classroom"
                  className="w-full h-[430px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-white shadow-xl">
                  <div className="flex items-center space-x-3 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'si' ? 'අධ්‍යාපනික විශිෂ්ටත්වය' : 'Academic Excellence'}
                      </p>
                      <h4 className="text-sm font-black text-slate-900">
                        {lang === 'si' ? 'නූතන වාණිජ හා ඩිජිටල් තාක්ෂණ ඒකාබද්ධතාව' : 'Modern Commercial & Digital Pedagogy'}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Narrative Description */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.about.badge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {t.about.title}
              </h2>

              <p className="text-base text-blue-700 font-bold leading-relaxed">
                {t.about.subtitle}
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t.about.desc1}
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t.about.desc2}
              </p>

              {/* Key Highlights Checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {t.about.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/subjects"
                  className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  <span>{lang === 'si' ? 'විෂය නිර්දේශ ගවේෂණය කරන්න' : 'Explore Subjects'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/news-events"
                  className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-5 py-3 rounded-xl transition-all"
                >
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'si' ? 'නවතම පුවත් හා වැඩමුළු' : 'News & Announcements'}</span>
                </Link>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. PROVINCIAL DIRECTOR'S MESSAGE (With official portrait)
         ══════════════════════════════════════════════════════════════ */}
      <section id="director-message" className="py-24 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Director Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left"
            >
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
                <div className="relative w-64 sm:w-80 h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900">
                  <img
                    src={cmsSettings?.directorPhoto || "/director.jpg"}
                    alt="Provincial Director of Education NCP"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-black text-lg">{cmsSettings?.directorName || t.director.name}</p>
                    <p className="text-teal-300 text-xs font-semibold">{cmsSettings?.directorRole || t.director.role}</p>
                  </div>
                </div>
              </div>

              {/* Official Credential Badge */}
              <div className="mt-5 flex items-center space-x-3 bg-white/10 border border-white/15 px-4 py-2 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <p className="text-xs text-slate-300 font-medium">
                  {lang === 'si'
                    ? 'උතුරු මැද පළාත් අධ්‍යාපන අමාත්‍යාංශය හා දෙපාර්තමේන්තුව'
                    : 'Provincial Ministry & Department of Education NCP'}
                </p>
              </div>
            </motion.div>

            {/* Right: Inspiring Message Quote */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>{t.director.badge}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                "{cmsSettings?.directorTitle || t.director.title}"
              </h2>

              <blockquote className="text-slate-300 text-sm sm:text-base leading-relaxed italic border-l-4 border-teal-400 pl-4 py-1">
                {lang === "si" ? (cmsSettings?.directorQuoteSi || t.director.quote) : (cmsSettings?.directorQuote || t.director.quote)}
              </blockquote>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">{cmsSettings?.directorName || t.director.name}</h4>
                  <p className="text-xs text-slate-400">{cmsSettings?.directorRole || t.director.role}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-teal-300 font-bold bg-teal-500/20 px-3 py-1.5 rounded-lg border border-teal-400/30">
                    {lang === 'si' ? 'කලාප 11 ක මගපෙන්වීම' : 'Overseeing 11 Zones'}
                  </span>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. VISION & MISSION CARDS
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-700/15 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Target className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black">{t.visionMission.visionTitle}</h3>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                  {lang === "si" ? (cmsSettings?.visionSi || t.visionMission.visionDesc) : (cmsSettings?.vision || t.visionMission.visionDesc)}
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white shadow-xl shadow-teal-700/15 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Compass className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black">{t.visionMission.missionTitle}</h3>
                <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
                  {lang === "si" ? (cmsSettings?.missionSi || t.visionMission.missionDesc) : (cmsSettings?.mission || t.visionMission.missionDesc)}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. OUR PILLAR DISTRICTS & 11 ZONES SECTION
         ══════════════════════════════════════════════════════════════ */}
      <section id="districts" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.districtsSection.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {t.districtsSection.title}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {t.districtsSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Anuradhapura District Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/anuradhapura.png"
                  alt="Anuradhapura District"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                    {t.districtsSection.anuBadge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="text-2xl font-black text-white">{t.hero.anuradhapura} District</h3>
                  <p className="text-xs text-blue-200 font-medium">Historic Cultural Capital & Academic Nucleus</p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Educational Zones:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Anuradhapura', 'Kebithigollewa', 'Medawachchiya', 'Thambuttegama', 'Kekirawa', 'Galenbindunuwewa', 'Padaviya', 'Nochchiyagama'].map((z, i) => (
                      <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {z}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">80+ Secondary Schools</span>
                  <Link
                    to="/districts/anuradhapura"
                    className="inline-flex items-center space-x-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>{t.districtsSection.exploreBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Polonnaruwa District Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/polonnaruwa.png"
                  alt="Polonnaruwa District"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-teal-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                    {t.districtsSection.polBadge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="text-2xl font-black text-white">{t.hero.polonnaruwa} District</h3>
                  <p className="text-xs text-teal-200 font-medium">Vibrant Agrarian Hub & Commercial Potential</p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Educational Zones:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Polonnaruwa', 'Hingurakgoda', 'Dimbulagala', 'Medirigiriya', 'Welikanda'].map((z, i) => (
                      <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {z}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">38+ Secondary Schools</span>
                  <Link
                    to="/districts/polonnaruwa"
                    className="inline-flex items-center space-x-1.5 text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors"
                  >
                    <span>{t.districtsSection.exploreBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. COMMERCE ACADEMIC STREAM DISCIPLINES (5 Subjects)
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t.subjectsList.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {t.subjectsList.title}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {t.subjectsList.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. Accounting */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.subjectsList.accTitle}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.subjectsList.accDesc}</p>
              </div>
              <Link to="/subjects" className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800">
                <span>View Syllabus & Resources</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Economics */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.subjectsList.ecoTitle}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.subjectsList.ecoDesc}</p>
              </div>
              <Link to="/subjects" className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:text-teal-800">
                <span>View Syllabus & Resources</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Business Studies */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.subjectsList.bsTitle}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.subjectsList.bsDesc}</p>
              </div>
              <Link to="/subjects" className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-600 hover:text-purple-800">
                <span>View Syllabus & Resources</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Information Technology */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.subjectsList.itTitle}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.subjectsList.itDesc}</p>
              </div>
              <Link to="/subjects" className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-800">
                <span>View Syllabus & Resources</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Entrepreneurship Studies */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.subjectsList.entTitle}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.subjectsList.entDesc}</p>
              </div>
              <Link to="/subjects" className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 hover:text-amber-800">
                <span>View Syllabus & Resources</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Curricular Committees Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-7 rounded-3xl text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Subject Development Committees</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Master educators, ISAs, and education directors working collaboratively to upgrade assessment standards.
                </p>
              </div>
              <Link to="/dashboard/committees" className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-300 hover:text-teal-200">
                <span>View Committee Members</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. STUDENT & EDUCATOR RESOURCES HUB (4 Quick Cards)
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
              <Download className="w-3.5 h-3.5" />
              <span>{t.quickLinks.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {t.quickLinks.title}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {t.quickLinks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1 */}
            <Link to="/explore/resources?type=PAST_PAPER" className="group block">
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <BookCopy className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{t.quickLinks.pastPapers}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.quickLinks.pastPapersDesc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Download Papers</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Card 2 */}
            <Link to="/explore/resources?type=TERM_TEST" className="group block">
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{t.quickLinks.ncpTests}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.quickLinks.ncpTestsDesc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                  <span>Access Test Banks</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Card 3 */}
            <Link to="/dashboard/committees" className="group block">
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{t.quickLinks.committees}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.quickLinks.committeesDesc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                  <span>View Committees</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Card 4 */}
            <Link to="/explore/results" className="group block">
              <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{t.quickLinks.analytics}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.quickLinks.analyticsDesc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Charts</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          9. PERFORMANCE & ANALYTICS SHOWCASE (Clean summary banner)
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-gradient-to-r from-blue-900/60 to-teal-900/40 rounded-3xl p-8 sm:p-12 border border-blue-500/30 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">

            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-400/30 uppercase tracking-widest">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{t.analyticsPreview.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {t.analyticsPreview.title}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {t.analyticsPreview.subtitle}
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                to="/explore/results"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base px-7 py-4 rounded-2xl shadow-xl shadow-teal-500/20 hover:scale-105 transition-all"
              >
                <span>{t.analyticsPreview.ctaBtn}</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          10. LATEST NEWS, WORKSHOPS & ANNOUNCEMENTS
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'නවතම තොරතුරු' : 'Official Bulletins'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {lang === 'si' ? 'නවතම පුවත්, විභාග හා වැඩමුළු' : 'Latest News, Exams & Workshops'}
              </h2>
            </div>

            <Link
              to="/news-events"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>{lang === 'si' ? 'සියලුම පුවත් බලන්න' : 'View All News & Events'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsList.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => setSelectedNews(item)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {item.category || 'News'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'si' ? 'විස්තර කියවන්න' : 'Read Full Bulletin'}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                {selectedNews.category}
              </span>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-slate-400 hover:text-slate-600 font-black text-xl"
              >
                ✕
              </button>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">{selectedNews.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-6">
              {selectedNews.content}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          11. INSTITUTIONAL FOOTER & CONTACT
         ══════════════════════════════════════════════════════════════ */}
      <footer id="contact" className="bg-slate-950 text-white pt-20 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-white/10">

            {/* Col 1: Emblem & Bio */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/emblem.png" alt="Sri Lanka National Emblem" className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="font-black text-base leading-tight">NCP Commerce Hub</h4>
                  <p className="text-slate-400 text-xs">Provincial Department of Education</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {lang === 'si'
                  ? 'උතුරු මැද පළාත් අධ්‍යාපන දෙපාර්තමේන්තුවේ වාණිජ අධ්‍යාපන අංශයේ නිල වෙබ් අඩවිය. අනුරාධපුරය හා පොළොන්නරුව දිස්ත්‍රික්කයන්හි පාසල් සඳහා වූ තොරතුරු කේන්ද්‍රය.'
                  : 'Official portal of the Commerce Branch, Provincial Department of Education - North Central Province. Connecting schools, educators and students.'}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-teal-400">Quick Portals</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/districts/anuradhapura" className="hover:text-white transition-colors">Anuradhapura District Portal</Link></li>
                <li><Link to="/districts/polonnaruwa" className="hover:text-white transition-colors">Polonnaruwa District Portal</Link></li>
                <li><Link to="/explore/results" className="hover:text-white transition-colors">A/L Exam Performance Analytics</Link></li>
                <li><Link to="/explore/resources" className="hover:text-white transition-colors">Past Papers & Marking Schemes</Link></li>
                <li><Link to="/subjects" className="hover:text-white transition-colors">Core Commerce Subject Syllabi</Link></li>
              </ul>
            </div>

            {/* Col 3: Academic Committees */}
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-teal-400">Administration</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/dashboard/committees" className="hover:text-white transition-colors">Provincial Development Committee</Link></li>
                <li><Link to="/dashboard/committees" className="hover:text-white transition-colors">Zonal Commerce Committees</Link></li>
                <li><Link to="/news-events" className="hover:text-white transition-colors">Teacher Training Calendar</Link></li>
                <li><Link to="/downloads" className="hover:text-white transition-colors">Circulars & Official Guidelines</Link></li>
                <li><Link to="/login" className="text-teal-300 font-bold hover:underline">Official Portal Login →</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-teal-400">Contact Us</h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Provincial Department of Education, North Central Province, Anuradhapura, Sri Lanka.</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>+94 25 222 2450 / +94 25 222 2452</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>commerce@ncp.moe.gov.lk</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Mon - Fri: 8:30 AM - 4:15 PM</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Provincial Department of Education - North Central Province. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Democratic Socialist Republic of Sri Lanka</span>
              <span>•</span>
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors">Staff Login</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
