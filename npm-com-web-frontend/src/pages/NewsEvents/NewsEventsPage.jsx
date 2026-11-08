import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsEventsPage = () => {
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [levelFilter, setLevelFilter] = useState('ALL'); // 'ALL', 'AL', 'OL'

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();

    // Global function for sweetalert image full screen
    window.openFullImage = (url) => {
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          imageUrl: url,
          imageAlt: 'Full Image',
          showConfirmButton: false,
          showCloseButton: true,
          width: '90%',
          padding: '0',
          background: 'transparent',
          backdrop: 'rgba(0,0,0,0.9)',
          customClass: {
            image: 'rounded-xl max-h-[90vh] object-contain w-auto mx-auto',
            popup: 'bg-transparent shadow-none',
            closeButton: 'bg-black/50 text-white rounded-full hover:bg-black p-2 mt-4'
          }
        });
      });
    };

    return () => {
      delete window.openFullImage;
    };
  }, []);

  const fetchData = async () => {
    try {
      const [resNews, resEvents] = await Promise.all([
        fetch('/api/public/news'),
        fetch('/api/public/events')
      ]);
      const newsData = await resNews.json();
      const eventsData = await resEvents.json();
      
      // Filter published news and only show news from the last 5 days
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      setNews(newsData.filter(n => {
        const isPublished = n.status === 'Published';
        const isRecent = new Date(n.createdAt) >= fiveDaysAgo;
        const isNotAutoEvent = !n.title.startsWith('Upcoming Event:');
        return isPublished && isRecent && isNotAutoEvent;
      }));
      
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching news and events:', err);
    }
  };

  const handleNewsClick = (item) => {
    import('sweetalert2').then((Swal) => {
      const date = new Date(item.createdAt);
      const formattedDate = date.toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });
      
      Swal.default.fire({
        title: `<span class="text-2xl font-black text-blue-800">${item.title}</span>`,
        html: `
          <div class="text-left space-y-5 mt-4">
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">${item.category}</span>
              <span class="text-sm font-semibold text-slate-500">${formattedDate}</span>
            </div>
            <div class="text-slate-700 leading-relaxed text-base p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-sm">
              ${item.content.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        width: '36rem',
        customClass: {
          popup: 'rounded-3xl border-0 shadow-2xl',
        }
      });
    });
  };

  const handleEventClick = (event) => {
    import('sweetalert2').then((Swal) => {
      const date = new Date(event.eventDate);
      const formattedDate = date.toLocaleString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      Swal.default.fire({
        title: `<span class="text-2xl font-black text-teal-800">${event.title}</span>`,
        html: `
          <div class="text-left space-y-5 mt-4">
            ${event.imageUrl ? `
            <div class="rounded-2xl overflow-hidden shadow-md relative group cursor-pointer" onclick="window.openFullImage('${event.imageUrl.startsWith('http') ? event.imageUrl : (event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`)}')">
              <img src="${event.imageUrl.startsWith('http') ? event.imageUrl : (event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`)}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" alt="${event.title}" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span class="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg> View Full Image</span>
              </div>
            </div>` : ''}
            <div class="flex items-center text-teal-600 bg-teal-50 p-3 rounded-xl border border-teal-100 font-semibold shadow-inner">
               <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               ${formattedDate}
            </div>
            <div class="text-slate-700 leading-relaxed text-base p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
              ${event.description.replace(/\\n/g, '<br/>')}
            </div>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        width: '36rem',
        customClass: {
          popup: 'rounded-3xl border-0 shadow-2xl',
        }
      });
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    weekdays.forEach(day => {
      days.push(<div key={`h-${day}`} className="text-center font-bold text-xs text-slate-400 py-2">{day}</div>);
    });

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} className="p-2 bg-slate-50/50 rounded-lg"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.eventDate.startsWith(dateStr));
      const hasEvents = dayEvents.length > 0;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={d} className={`p-1.5 border ${hasEvents ? 'border-teal-200 bg-teal-50/20' : 'border-slate-100 bg-white'} rounded-lg min-h-[80px] hover:border-teal-300 transition-colors group flex flex-col ${isToday ? 'ring-2 ring-teal-500 shadow-sm' : ''}`}>
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-teal-500 text-white' : (hasEvents ? 'bg-teal-100 text-teal-700' : 'text-slate-500 group-hover:text-teal-600')}`}>{d}</span>
          <div className="flex-1 space-y-1 overflow-y-auto max-h-[60px] scrollbar-hide">
            {dayEvents.map(e => (
               <div 
                 key={e.id} 
                 onClick={() => handleEventClick(e)}
                 className="text-[10px] bg-teal-50 text-teal-700 p-1 px-1.5 rounded-md truncate cursor-pointer hover:bg-teal-500 hover:text-white transition-colors font-semibold border border-teal-100 hover:border-teal-500 shadow-sm"
                 title={e.title}
               >
                 {e.title}
               </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h3 className="text-lg font-bold text-slate-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

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
                <Globe className="w-4 h-4 text-teal-300" />
                <span>Provincial Bulletin & Calendar</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                News & Events
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Official circulars, provincial announcements, teacher workshop schedules, and upcoming student competitions.
              </p>
            </div>

            {/* Level Filter */}
            <div className="flex space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl flex-shrink-0">
              {[{id:'ALL', label:'All Announcements'}, {id:'AL', label:'G.C.E. A/L'}, {id:'OL', label:'G.C.E. O/L'}].map(lv => (
                <button
                  key={lv.id}
                  onClick={() => setLevelFilter(lv.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    levelFilter === lv.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >{lv.label}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN NEWS & EVENTS CONTENT (ZERO OVERLAP!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LATEST NEWS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-blue-600" /> Latest News
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news
              .filter(item => levelFilter === 'ALL' || item.examLevel === 'GENERAL' || item.examLevel === levelFilter)
              .map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id} 
                  onClick={() => handleNewsClick(item)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
                >
                  <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-teal-400"></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{item.category}</span>
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">{item.content}</p>
                  </div>
                </motion.div>
              ))}
              {news.length === 0 && (
                <div className="col-span-2 p-10 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                  <p className="text-slate-500 font-medium">No recent news available.</p>
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-teal-600" /> Events
              </h2>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  List
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Calendar
                </button>
              </div>
            </div>
            
            {viewMode === 'list' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-2 max-h-[800px] overflow-y-auto">
                {events
                  .filter(event => new Date(event.eventDate) >= new Date(new Date().setHours(0,0,0,0)))
                  .filter(event => levelFilter === 'ALL' || event.examLevel === 'GENERAL' || event.examLevel === levelFilter)
                  .map((event, i) => {
                  const date = new Date(event.eventDate);
                  const month = date.toLocaleString('default', { month: 'short' });
                const day = date.getDate();
                const time = date.toLocaleString('default', { hour: 'numeric', minute: '2-digit' });
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="flex p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-teal-50 text-teal-700 flex-shrink-0 mr-4 border border-teal-100">
                      <span className="text-xs font-bold uppercase">{month}</span>
                      <span className="text-2xl font-black leading-none">{day}</span>
                    </div>
                    
                    {event.imageUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 mr-4 bg-slate-100 hidden sm:block">
                        <img src={event.imageUrl.startsWith('http') ? event.imageUrl : (event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`)} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-teal-600 transition-colors">{event.title}</h4>
                      <p className="text-sm text-slate-500 mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-xs font-semibold text-slate-400">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {time}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {events.filter(e => new Date(e.eventDate) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-slate-500 font-medium">No upcoming events scheduled.</p>
                </div>
              )}
            </div>
            ) : (
              renderCalendar()
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewsEventsPage;
