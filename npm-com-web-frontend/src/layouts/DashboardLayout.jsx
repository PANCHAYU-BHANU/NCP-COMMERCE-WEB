import React, { useState } from 'react';
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
  Compass
} from 'lucide-react';

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

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
          tag: '2027 Ready',
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
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'ADMIN']
        }
      ]
    },
    {
      group: 'PORTAL CONTENT & ASSETS',
      items: [
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
          roles: ['PROVINCIAL_DIRECTOR', 'ADMIN']
        },
        {
          name: 'User Management',
          siName: 'පරිශීලක කළමනාකරණය',
          path: '/dashboard/users',
          icon: UserPlus,
          roles: ['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'ADMIN']
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
                  <p className="text-[11px] font-bold text-amber-400/90 leading-tight">වාණිජ අධ්‍යාපන අංශය</p>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0 border border-white/20">
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-black text-white truncate">{currentUser?.username}</p>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" title="Active Session" />
                    </div>
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
                        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.name}
                          to={item.path}
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
                              <span className="text-[10px] text-slate-400/80 block leading-tight group-hover:text-slate-300 truncate font-normal">
                                {item.siName}
                              </span>
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
                <span>Sign Out ({currentUser?.username})</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── 2. EXECUTIVE CONTENT WRAPPER ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        
        {/* Top Executive Header */}
        <header className="h-18 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-8 z-20 shadow-sm">
          
          {/* Left: Hamburger & Dynamic Breadcrumbs */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-800 focus:outline-none p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Navigation Sidebar"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                <Link to="/dashboard" className="hover:text-blue-600 transition-colors">CMS Overview</Link>
                <span>/</span>
                <span className="text-slate-700">{currentNavItem?.name || 'Academic Console'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center flex-wrap sm:flex-nowrap gap-2">
                <span className="whitespace-nowrap">{currentNavItem?.name || 'Commerce Oversight Dashboard'}</span>
                {currentNavItem?.tag && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap inline-flex items-center">
                    {currentNavItem.tag}
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Right: Academic Cycle Banner, Quick Actions & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Live Academic Batch Tag */}
            <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>2027 A/L Cycle Active</span>
              <span className="text-blue-400">•</span>
              <span className="text-slate-600 text-[11px]">Term 1 Evaluation Phase</span>
            </div>

            {/* Quick Public Site Link */}
            <Link
              to="/rankings"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 transition-all shadow-sm"
              title="View Public Provincial Leaderboard"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Leaderboard</span>
            </Link>

            {/* Notifications / Live Ping */}
            <button 
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/80 cursor-pointer shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-black text-slate-900 leading-tight">{currentUser?.username}</p>
                  <p className="text-[10px] font-bold text-blue-600 leading-tight">{roleMeta.title}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100"
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Signed In Account</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{currentUser?.username}</p>
                      <p className="text-xs text-slate-500">{currentUser?.email || 'NCP Education Domain'}</p>
                      
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span>{roleMeta.icon}</span>
                          <span>{roleMeta.title}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{roleMeta.siTitle}</p>
                      </div>
                    </div>

                    <div className="py-1">
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
        <main className="flex-1 overflow-y-auto bg-slate-100/90 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
