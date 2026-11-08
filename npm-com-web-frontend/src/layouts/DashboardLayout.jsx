import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  UserCheck,
  ChevronDown,
  Bell,
  UserPlus,
  Globe,
  MapPin,
  GraduationCap,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Building,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import TeacherProfileModal from '../components/TeacherProfileModal';

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeCycleYear, setActiveCycleYear] = useState(null);

  // Teacher Profile state & persistent alert
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [missingCount, setMissingCount] = useState(0);

  const isTeacher = currentUser?.role === 'TEACHER' || currentUser?.role === 'SECTION_HEAD';

  const fetchMyProfileStatus = async () => {
    if (!currentUser || !isTeacher) return;
    const token = JSON.parse(localStorage.getItem('auth'))?.token || currentUser?.token || currentUser?.accessToken;
    try {
      const res = await fetch('/api/teacher-profile/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.profile || {});
        const incomplete = !data.isCompleted;
        setIsProfileIncomplete(incomplete);
        setMissingCount(Array.isArray(data.missingFields) ? data.missingFields.length : 0);
      }
    } catch (err) {
      console.warn('Could not check teacher profile completion:', err);
    }
  };

  useEffect(() => {
    fetchMyProfileStatus();
  }, [currentUser]);

  useEffect(() => {
    fetch('/api/public/statistics/overview')
      .then(r => r.json())
      .then(data => {
        if (data && data.activeYear) {
          setActiveCycleYear(data.activeYear);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper for role details
  const getRoleConfig = (role) => {
    switch (role) {
      case 'PROVINCIAL_DIRECTOR':
        return {
          title: 'Provincial Director',
          siTitle: 'පළාත් අධ්‍යාපන අධ්‍යක්ෂ',
          badgeBg: 'bg-amber-500/15 border-amber-400/40 text-amber-300',
          dot: 'bg-amber-400',
          icon: '🏛️'
        };
      case 'ZONAL_DIRECTOR':
        return {
          title: 'Zonal Director',
          siTitle: 'කලාප අධ්‍යාපන අධ්‍යක්ෂ',
          badgeBg: 'bg-indigo-500/15 border-indigo-400/40 text-indigo-300',
          dot: 'bg-indigo-400',
          icon: '🏢'
        };
      case 'DIVISIONAL_DIRECTOR':
        return {
          title: 'Divisional Director',
          siTitle: 'කොට්ඨාස අධ්‍යාපන අධ්‍යක්ෂ',
          badgeBg: 'bg-sky-500/15 border-sky-400/40 text-sky-300',
          dot: 'bg-sky-400',
          icon: '🏬'
        };
      case 'PRINCIPAL':
        return {
          title: 'School Principal',
          siTitle: 'විදුහල්පති',
          badgeBg: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300',
          dot: 'bg-emerald-400',
          icon: '🏫'
        };
      case 'SECTION_HEAD':
        return {
          title: 'Commerce Section Head',
          siTitle: 'වාණිජ අංශ ප්‍රධානී',
          badgeBg: 'bg-teal-500/15 border-teal-400/40 text-teal-300',
          dot: 'bg-teal-400',
          icon: '📋'
        };
      case 'TEACHER':
        return {
          title: 'Commerce Teacher',
          siTitle: 'වාණිජ ගුරුභවතා',
          badgeBg: 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300',
          dot: 'bg-cyan-400',
          icon: '👨‍🏫'
        };
      default:
        return {
          title: 'System Administrator',
          siTitle: 'පද්ධති පරිපාලක',
          badgeBg: 'bg-purple-500/15 border-purple-400/40 text-purple-300',
          dot: 'bg-purple-400',
          icon: '🛡️'
        };
    }
  };

  const roleMeta = getRoleConfig(currentUser?.role);
  const isNIC = (val) => /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(val || '');
  let displayName = currentUser?.name;
  if (!displayName || isNIC(displayName)) {
    if (currentUser?.role === 'ZONAL_DIRECTOR') {
      displayName = currentUser?.zoneName ? `${currentUser.zoneName} Zonal Director` : 'Zonal Director';
    } else if (currentUser?.role === 'DIVISIONAL_DIRECTOR') {
      displayName = currentUser?.divisionName ? `${currentUser.divisionName} Divisional Director` : 'Divisional Director';
    } else if (currentUser?.role === 'PROVINCIAL_DIRECTOR') {
      displayName = 'Provincial Director';
    } else {
      displayName = roleMeta.title || currentUser?.username || 'Officer';
    }
  }
  const initialLetter = displayName.charAt(0).toUpperCase();

  // Grouped navigation based on roles
  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        {
          name: 'Dashboard & Analytics',
          siName: 'ප්‍රධාන පුවරුව',
          path: '/dashboard',
          icon: LayoutDashboard,
          tag: 'Live',
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'ADMIN']
        }
      ]
    },
    {
      group: 'ACADEMICS & RESULTS',
      items: [
        {
          name: 'Exam Results Entry',
          siName: 'විභාග ලකුණු ඇතුළත් කිරීම',
          path: '/dashboard/results',
          icon: FileText,
          tag: activeCycleYear ? `${activeCycleYear} Ready` : 'Ready',
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'ADMIN']
        },
        {
          name: 'Student Statistics',
          siName: 'ශිෂ්‍ය සංඛ්‍යාලේඛන',
          path: '/dashboard/students',
          icon: GraduationCap,
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'ADMIN']
        }
      ]
    },
    {
      group: 'FACULTY & GOVERNANCE',
      items: [
        {
          name: 'My Teacher Profile',
          siName: 'මගේ ගුරු පැතිකඩ',
          onClick: () => setIsProfileModalOpen(true),
          icon: User,
          tag: isProfileIncomplete ? 'Pending' : 'Complete',
          tagAlert: isProfileIncomplete,
          roles: ['TEACHER', 'SECTION_HEAD']
        },
        {
          name: 'Teachers Directory',
          siName: 'ගුරු නාමාවලිය',
          path: '/dashboard/teachers',
          icon: UserCheck,
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'ADMIN']
        },
        {
          name: 'Committees & Panels',
          siName: 'වාණිජ කමිටු',
          path: '/dashboard/committees',
          icon: Users,
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'ADMIN']
        }
      ]
    },
    {
      group: 'PORTAL CONTENT & ASSETS',
      items: [
        {
          name: 'Commerce Subjects',
          siName: 'විෂය මාලාව කළමනාකරණය',
          path: '/subjects?manage=true',
          icon: BookOpen,
          tag: 'Curriculum',
          roles: ['PROVINCIAL_DIRECTOR', 'ADMIN']
        },
        {
          name: 'Educational Resources',
          siName: 'අධ්‍යාපනික සම්පත් හා ප්‍රශ්න පත්‍ර',
          path: '/dashboard/resources',
          icon: BookOpen,
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'ADMIN']
        },
        {
          name: 'Website Content',
          siName: 'වෙබ් අඩවි කළමනාකරණය',
          path: '/dashboard/content',
          icon: Globe,
          roles: ['PROVINCIAL_DIRECTOR', 'ADMIN']
        },
        {
          name: 'Zones & Locations',
          siName: 'කලාප හා පාසල් ස්ථාන',
          path: '/dashboard/locations',
          icon: MapPin,
          roles: ['PROVINCIAL_DIRECTOR', 'ADMIN', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR']
        },
        {
          name: 'User Management',
          siName: 'පරිශීලක කළමනාකරණය',
          path: '/dashboard/users',
          icon: UserPlus,
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'ADMIN']
        }
      ]
    }
  ];

  // Flat list for active item lookup
  const allNavItems = navSections.flatMap(s => s.items);
  const currentNavItem = allNavItems.find(item => 
    item.path === '/dashboard' 
      ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  );

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden font-sans">
      
      {/* ── 1. MODERN EXECUTIVE SIDEBAR ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col fixed inset-y-0 z-50 md:relative border-r border-slate-800/80 shadow-2xl"
          >
            {/* Department Brand Emblem */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between relative bg-slate-900/60 backdrop-blur-md">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:bg-amber-400/30 transition-all" />
                  <img src="/emblem.png" alt="Sri Lanka National Emblem" className="w-11 h-11 object-contain relative z-10 drop-shadow-md" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-black text-sm tracking-wide text-white uppercase group-hover:text-amber-300 transition-colors">
                      NCP Commerce
                    </span>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-600/40 text-blue-300 border border-blue-500/30">
                      CMS
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-400/90 leading-tight">Commerce Education Branch</p>
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">Dept of Education — NCP</p>
                </div>
              </Link>
              <button 
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" 
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Officer Profile Badge */}
            <div className="px-4 py-3 border-b border-slate-800/60">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/70 via-slate-800/40 to-slate-900/80 border border-slate-700/60 shadow-lg relative overflow-hidden group">
                <div className="flex items-center space-x-3 relative z-10">
                  {currentUser?.profilePic || profileData?.profilePic ? (
                    <img
                      src={(currentUser?.profilePic || profileData?.profilePic).startsWith('http') 
                        ? (currentUser?.profilePic || profileData?.profilePic) 
                        : ((currentUser?.profilePic || profileData?.profilePic).startsWith('/') ? (currentUser?.profilePic || profileData?.profilePic) : `/${currentUser?.profilePic || profileData?.profilePic}`)}
                      alt={displayName}
                      className="w-10 h-10 rounded-xl object-cover shadow-md flex-shrink-0 border border-amber-400/80 bg-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0 border border-white/20">
                      {initialLetter}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-black text-white truncate">{displayName}</p>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" title="Active Session" />
                    </div>
                    {currentUser?.name && currentUser?.name !== currentUser?.username && (
                      <p className="text-[10px] text-slate-400 font-mono truncate">NIC: {currentUser?.username}</p>
                    )}
                    <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-black border mt-1 ${roleMeta.badgeBg}`}>
                      <span>{roleMeta.icon}</span>
                      <span className="truncate">{roleMeta.title}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-2 truncate flex items-center gap-1">
                  <MapPin size={11} className="text-teal-400 flex-shrink-0" />
                  <span>{currentUser?.location || 'North Central Province'}</span>
                </p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
              {navSections.map((section, idx) => {
                const sectionItems = section.items.filter(item => item.roles.includes(currentUser?.role));
                if (sectionItems.length === 0) return null;

                return (
                  <div key={idx} className="space-y-1">
                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-2">
                      {section.group}
                    </p>
                    {sectionItems.map((item) => {
                      const isRoot = item.path === '/dashboard';
                      const isActive = isRoot 
                        ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
                        : item.path && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));
                      const Icon = item.icon;

                      if (item.onClick) {
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              item.onClick();
                              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                setSidebarOpen(false);
                              }
                            }}
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-200 group text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer"
                          >
                            <div className="flex items-center min-w-0 space-x-3">
                              <Icon 
                                size={18} 
                                className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0 text-slate-400 group-hover:text-amber-400" 
                              />
                              <div className="truncate text-left">
                                <span className="text-xs font-semibold block leading-tight">{item.name}</span>
                              </div>
                            </div>

                            {item.tag && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                                item.tagAlert
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              }`}>
                                {item.tag}
                              </span>
                            )}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center min-w-0 space-x-3">
                            <Icon 
                              size={18} 
                              className={`transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                              }`} 
                            />
                            <div className="truncate">
                              <span className="text-xs font-semibold block leading-tight">{item.name}</span>
                            </div>
                          </div>

                          {item.tag && (
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              isActive 
                                ? 'bg-white/20 text-white' 
                                : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                            }`}>
                              {item.tag}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Bottom Action Deck */}
            <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-900/60 backdrop-blur-md">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all group shadow-sm"
              >
                <div className="flex items-center space-x-2.5">
                  <Globe size={15} className="text-teal-400 group-hover:rotate-45 transition-transform" />
                  <span>Public Portal</span>
                </div>
                <ExternalLink size={13} className="text-slate-400 group-hover:text-white" />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full px-3.5 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all active:scale-95"
              >
                <LogOut size={15} />
                <span>Sign Out ({displayName})</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* ── 2. EXECUTIVE CONTENT WRAPPER ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        
        {/* Top Executive Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 z-20 shadow-xs">
          
          {/* Left: Hamburger & Dynamic Breadcrumbs */}
          <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0 flex-1 mr-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Toggle Navigation Sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="flex flex-col justify-center min-w-0 flex-1">
              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 leading-none mb-1">
                <Link to="/dashboard" className="hover:text-blue-600 transition-colors">CMS Overview</Link>
                <span>/</span>
                <span className="text-slate-600 font-semibold truncate max-w-[150px]">{currentNavItem?.name || 'Academic Console'}</span>
              </div>
              <div className="flex items-center space-x-2 min-w-0">
                <h2 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-none truncate">
                  {currentNavItem?.name || 'Commerce Oversight Dashboard'}
                </h2>
                {currentNavItem?.tag && (
                  <span className="hidden sm:inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 tracking-wide leading-none items-center shrink-0">
                    {currentNavItem.tag}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Academic Cycle Banner, Quick Actions & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Live Academic Batch Tag */}
            <div className="hidden 2xl:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-900 shadow-2xs h-9.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>{activeCycleYear ? `${activeCycleYear} A/L Active` : 'A/L Academic Cycle'}</span>
              <span className="text-blue-300">•</span>
              <span className="text-slate-500 text-[11px]">Term Evaluation</span>
            </div>

            {/* Quick Public Site Link */}
            <Link
              to="/rankings"
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 transition-all shadow-2xs h-9.5"
              title="View Public Provincial Leaderboard"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Leaderboard</span>
            </Link>

            {/* Notifications / Live Ping */}
            <button 
              className="w-9.5 h-9.5 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all relative cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </button>

            {/* Subtle Divider */}
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 px-2.5 py-1 rounded-xl hover:bg-slate-100 transition-all border border-slate-200/90 cursor-pointer shadow-2xs bg-white h-9.5"
              >
                {currentUser?.profilePic || profileData?.profilePic ? (
                  <img
                    src={(currentUser?.profilePic || profileData?.profilePic).startsWith('http') 
                      ? (currentUser?.profilePic || profileData?.profilePic) 
                      : ((currentUser?.profilePic || profileData?.profilePic).startsWith('/') ? (currentUser?.profilePic || profileData?.profilePic) : `/${currentUser?.profilePic || profileData?.profilePic}`)}
                    alt={displayName}
                    className="w-7 h-7 rounded-lg object-cover shadow-2xs border border-amber-400/80 bg-slate-800"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                    {initialLetter}
                  </div>
                )}
                <div className="hidden md:block text-left pr-0.5">
                  <p className="text-xs font-black text-slate-900 leading-tight">{displayName}</p>
                  <p className="text-[10px] font-bold text-blue-600 leading-none">{roleMeta.title}</p>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100"
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Signed In Account</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{displayName}</p>
                      {currentUser?.username && currentUser?.name && currentUser?.name !== currentUser?.username && (
                        <p className="text-[10px] text-slate-400 font-mono">NIC: {currentUser?.username}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || 'NCP Education Domain'}</p>
                      
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span>{roleMeta.icon}</span>
                          <span>{roleMeta.title}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{roleMeta.siTitle}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      {isTeacher && (
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
                        >
                          <div className="flex items-center">
                            <User size={14} className="mr-2.5 text-amber-600" />
                            <span>My Teacher Profile (මගේ පැතිකඩ)</span>
                          </div>
                          {isProfileIncomplete ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              Pending
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Complete
                            </span>
                          )}
                        </button>
                      )}

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <LayoutDashboard size={14} className="mr-2.5 text-slate-400" />
                        Executive Dashboard
                      </Link>
                      <Link
                        to="/rankings"
                        target="_blank"
                        className="flex items-center px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                      >
                        <Sparkles size={14} className="mr-2.5 text-amber-500" />
                        Public Leaderboard
                      </Link>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut size={14} className="mr-2" />
                        Sign Out of Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* ── 3. MAIN DASHBOARD CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100/90 p-2.5 sm:p-5 lg:p-6">
          
          {/* Persistent Incomplete Profile Alert for Teachers */}
          {isTeacher && isProfileIncomplete && (
            <div className="mb-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-black text-amber-950">
                      අවධානය පිණිසයි: ඔබගේ ගුරු සේවා පැතිකඩ (Teacher Profile) තවමත් සම්පූර්ණ කර නොමැත!
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                      {missingCount > 0 ? `${missingCount} Fields Pending` : 'Action Required'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 font-medium mt-1 leading-relaxed">
                    විදුහල්පති, කොට්ඨාස, කලාප සහ පළාත් අධ්‍යක්ෂ මණ්ඩලයේ විස්තරාත්මක වාර්තා (Executive Dossier) සඳහා කරුණාකර ඔබගේ අත්‍යවශ්‍ය තොරතුරු, සේවා ශ්‍රේණිය, අධ්‍යාපන/වෘත්තීය සුදුසුකම් සහ WhatsApp අංකය ඇතුළත් කරන්න.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles size={15} />
                  <span>පැතිකඩ සම්පූර්ණ කරන්න / Complete Profile Now</span>
                </button>
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>

      {/* ── TEACHER PROFILE EDIT MODAL ── */}
      {isTeacher && (
        <TeacherProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={fetchMyProfileStatus}
        />
      )}

    </div>
  );
};

export default DashboardLayout;
