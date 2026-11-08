import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCog, Building2, ChevronDown, ChevronUp, ChevronRight, BookOpen, Presentation, CalendarDays, X, BarChart3, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const SchoolDetailedCard = ({ school, theme, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-gradient-to-br from-white/5 to-white/0 ${theme.cardHover} backdrop-blur-md rounded-2xl p-6 border border-white/10 ${theme.cardHoverBorder} transition-all duration-300 shadow-lg group overflow-hidden`}
    >
      {/* Ranking Badge */}
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${theme.gradient} opacity-50 rounded-bl-full z-0`} />
      <div className={`absolute top-3 right-4 z-10 text-lg font-black ${theme.textDark || 'text-white/80'}`}>
        #{index + 1}
      </div>

      <div className="relative z-10">
        <div className={`inline-block px-3 py-1 ${theme.iconBg} ${theme.iconColor} text-xs font-bold rounded-full mb-4 shadow-sm`}>
          Type: {school.type}
        </div>
        <h4 className={`text-xl font-bold mb-4 leading-snug pr-8 ${theme.textDark || 'text-white'}`}>{school.name}</h4>
        
        <div className={`space-y-3 text-sm rounded-xl p-4 mb-4 border ${theme.cardBorder || 'border-white/5'} ${theme.cardBg === 'bg-white' ? 'bg-slate-50' : 'bg-black/20'}`}>
          <p className="flex items-center space-x-3">
            <span className={`p-1.5 rounded-md ${theme.cardBg === 'bg-white' ? 'bg-white shadow-sm' : 'bg-white/10'}`}><UserCog className={`w-3.5 h-3.5 ${theme.textDark || 'text-white/90'}`} /></span>
            <span className={`flex-1 font-medium ${theme.textMuted || 'text-white/60'}`}>Principal:</span>
            <span className={`font-medium ${theme.textDark || 'text-white'}`}>{school.principal}</span>
          </p>
          <p className="flex items-center space-x-3">
            <span className={`p-1.5 rounded-md ${theme.cardBg === 'bg-white' ? 'bg-white shadow-sm' : 'bg-white/10'}`}><Users className={`w-3.5 h-3.5 ${theme.textDark || 'text-white/90'}`} /></span>
            <span className={`flex-1 font-medium ${theme.textMuted || 'text-white/60'}`}>Total Students:</span>
            <span className={`font-bold text-base ${theme.textDark || 'text-white'}`}>{school.students}</span>
          </p>
        </div>

        <button 
          onClick={() => setExpanded(true)}
          className={`w-full py-2.5 rounded-xl border flex items-center justify-center space-x-2 text-sm font-semibold transition-colors ${theme.cardBg === 'bg-white' ? 'border-slate-200 text-indigo-600 hover:bg-indigo-50' : 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`}
        >
          <span>View Commerce Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex gap-2 mt-2.5">
          <Link
            to={`/explore/results?schoolId=${school.id}&schoolName=${encodeURIComponent(school.name)}`}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              theme.cardBg === 'bg-white' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Results</span>
          </Link>
          <Link
            to={`/downloads?schoolId=${school.id}&schoolName=${encodeURIComponent(school.name)}`}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              theme.cardBg === 'bg-white' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Papers</span>
          </Link>
        </div>

      {createPortal(
        <AnimatePresence>
          {expanded && school.teachers && school.students2027 && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border ${theme.cardBorder || 'border-white/10'} ${theme.cardBg === 'bg-white' ? 'bg-white' : 'bg-slate-900'}`}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setExpanded(false)} 
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${theme.cardBg === 'bg-white' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="mb-6 pr-8">
                  <div className={`inline-block px-3 py-1 ${theme.iconBg} ${theme.iconColor} text-xs font-bold rounded-full mb-3 shadow-sm`}>
                    School Details
                  </div>
                  <h3 className={`text-2xl font-bold ${theme.textDark || 'text-white'}`}>{school.name}</h3>
                  <p className={`text-sm mt-1 ${theme.textMuted || 'text-white/60'}`}>Commerce Section Information</p>
                </div>

                <div className={`mb-6 flex items-center space-x-3 p-4 rounded-2xl border ${theme.cardBorder || 'border-white/5'} ${theme.cardBg === 'bg-white' ? 'bg-slate-50' : 'bg-white/5'}`}>
                  <span className={`p-2 rounded-xl ${theme.cardBg === 'bg-white' ? 'bg-white shadow-sm' : 'bg-white/10'}`}><Building2 className={`w-5 h-5 ${theme.textDark || 'text-white/90'}`} /></span>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${theme.textMuted || 'text-white/60'}`}>Head of Commerce Section</p>
                    <p className={`text-base font-bold ${theme.textDark || 'text-white'}`}>{school.commerceHead}</p>
                  </div>
                </div>

                {/* Teachers Breakdown */}
                <div className="mb-8">
                  <h5 className={`text-sm font-bold mb-4 flex items-center space-x-2 ${theme.textDark || 'text-white'}`}>
                    <Presentation className={`w-4 h-4 ${theme.iconColor}`} />
                    <span>Commerce Teachers Breakdown</span>
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(school.teachers).map(([subject, count]) => (
                      <div key={subject} className={`flex flex-col justify-center px-4 py-3 rounded-xl border ${theme.cardBorder || 'border-white/5'} ${theme.cardBg === 'bg-white' ? 'bg-white shadow-sm' : 'bg-black/40'}`}>
                        <span className={`text-xs mb-1 ${theme.textMuted || 'text-white/60'}`}>{subject}</span>
                        <span className={`text-lg font-black ${theme.textDark || 'text-white'}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Students Breakdown */}
                <div>
                  <h5 className={`text-sm font-bold mb-4 flex items-center space-x-2 ${theme.textDark || 'text-white'}`}>
                    <BookOpen className={`w-4 h-4 ${theme.iconColor}`} />
                    <span>Commerce Students (A/L)</span>
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[school.cohort1Year || '2027', school.cohort2Year || '2026'].filter(Boolean).map(year => {
                      const studentData = school[`students${year}`] || school.students2027 || [];
                      return (
                        <div key={year}>
                          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 shadow-sm ${theme.iconBg} ${theme.iconColor}`}>
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>A/L {year} Batch</span>
                          </div>
                          <div className={`rounded-xl overflow-hidden border shadow-sm ${theme.cardBorder || 'border-white/5'} ${theme.cardBg === 'bg-white' ? 'bg-white' : 'bg-black/40'}`}>
                            <table className="w-full text-left text-xs">
                              <thead className={theme.cardBg === 'bg-white' ? 'bg-slate-50' : 'bg-white/5'}>
                                <tr>
                                  <th className={`px-4 py-3 font-medium ${theme.textMuted || 'text-white/60'}`}>Subject</th>
                                  <th className={`px-4 py-3 font-medium text-right ${theme.textMuted || 'text-white/60'}`}>M</th>
                                  <th className={`px-4 py-3 font-medium text-right ${theme.textMuted || 'text-white/60'}`}>F</th>
                                  <th className={`px-4 py-3 font-bold text-right ${theme.textDark || 'text-white/90'}`}>Total</th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${theme.cardBg === 'bg-white' ? 'divide-slate-100' : 'divide-white/5'}`}>
                                {Object.entries(studentData).map(([subject, counts]) => (
                                  <tr key={subject} className={`transition-colors ${theme.cardBg === 'bg-white' ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}>
                                    <td className={`px-4 py-3 ${theme.textDark || 'text-white/80'}`}>{subject}</td>
                                    <td className={`px-4 py-3 text-right ${theme.textMuted || 'text-white/70'}`}>{counts.male}</td>
                                    <td className={`px-4 py-3 text-right ${theme.textMuted || 'text-white/70'}`}>{counts.female}</td>
                                    <td className={`px-4 py-3 font-bold text-right ${theme.textDark || 'text-white'}`}>{counts.male + counts.female}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
                  <Link
                    to={`/explore/results?schoolId=${school.id}&schoolName=${encodeURIComponent(school.name)}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Performance Analytics</span>
                  </Link>
                  <Link
                    to={`/downloads?schoolId=${school.id}&schoolName=${encodeURIComponent(school.name)}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Papers & Syllabi</span>
                  </Link>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
      </div>
    </motion.div>
  );
};

export default SchoolDetailedCard;
