import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Shield, BookOpen, Search, ArrowRight, 
  CheckCircle2, Sparkles, Building2, MapPin, Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DEFAULT_COMMITTEES = [
  {
    id: 1,
    name: "Provincial Commerce Subject Development Committee",
    type: "PROVINCIAL",
    zone: null,
    subjectArea: "Commerce & Management",
    description: "Formulates provincial learning benchmarks, monitors commerce stream curricula, and coordinates provincial teacher master-training programs."
  },
  {
    id: 2,
    name: "Accounting Curriculum & Assessment Panel",
    type: "PROVINCIAL",
    zone: null,
    subjectArea: "Accounting",
    description: "Standardizes G.C.E. A/L Accounting term assessments, prepares model rubrics, and conducts provincial evaluation seminars."
  },
  {
    id: 3,
    name: "Business Studies Curriculum Committee",
    type: "PROVINCIAL",
    zone: null,
    subjectArea: "Business Studies",
    description: "Upgrades pedagogical frameworks for case-study based business instruction, modern commerce trends, and structured model papers."
  },
  {
    id: 4,
    name: "Economics Academic & Evaluation Committee",
    type: "PROVINCIAL",
    zone: null,
    subjectArea: "Economics",
    description: "Monitors economic syllabus updates, contemporary Sri Lankan and global financial trends analysis, and unit test question banking."
  },
  {
    id: 5,
    name: "Information & Communication Technology Panel",
    type: "PROVINCIAL",
    zone: null,
    subjectArea: "ICT in Commerce",
    description: "Integrates software tools, computerized accounting modules, and digital applications into modern commerce classrooms."
  },
  {
    id: 6,
    name: "Entrepreneurship Studies Curriculum Committee",
    type: "PROVINCIAL",
    zone: null,
    subjectArea: "Entrepreneurship",
    description: "Coordinates practical project evaluations, business pitch simulations, and youth enterprise incubation across provincial schools."
  },
  {
    id: 7,
    name: "Anuradhapura Zonal Commerce Committee",
    type: "ZONAL",
    zone: { id: 1, name: "Anuradhapura" },
    subjectArea: "Zonal Development",
    description: "Local zonal cluster implementation, teacher mentorship, term evaluation review, and student performance improvement in Anuradhapura zone."
  },
  {
    id: 8,
    name: "Polonnaruwa Zonal Commerce Committee",
    type: "ZONAL",
    zone: { id: 2, name: "Polonnaruwa" },
    subjectArea: "Zonal Development",
    description: "Local zonal cluster implementation, teacher mentorship, and examination preparedness for commerce students in Polonnaruwa zone."
  }
];

const SubjectCommitteesModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PROVINCIAL' | 'ZONAL'
  const [searchQuery, setSearchQuery] = useState('');
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      fetchCommittees();
      fetchZones();
    }
  }, [isOpen]);

  const fetchCommittees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/committees');
      if (res.data && res.data.length > 0) {
        setCommittees(res.data);
      } else {
        setCommittees(DEFAULT_COMMITTEES);
      }
    } catch (err) {
      console.error("Error fetching committees, using defaults:", err);
      setCommittees(DEFAULT_COMMITTEES);
    }
    setLoading(false);
  };

  const fetchZones = async () => {
    try {
      const res = await api.get('/public/zones');
      if (res.data) {
        setZones(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Filter committees
  const filteredCommittees = committees.filter(c => {
    // Type tab filter
    if (activeTab === 'PROVINCIAL' && c.type !== 'PROVINCIAL') return false;
    if (activeTab === 'ZONAL' && c.type !== 'ZONAL') return false;

    // Zone filter
    if (activeTab === 'ZONAL' && selectedZoneId !== 'ALL') {
      const zId = c.zone?.id || c.zoneId;
      if (zId && zId.toString() !== selectedZoneId.toString()) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = c.name?.toLowerCase().includes(query);
      const zoneMatch = c.zone?.name?.toLowerCase().includes(query);
      const descMatch = c.description?.toLowerCase().includes(query);
      if (!nameMatch && !zoneMatch && !descMatch) return false;
    }

    return true;
  });

  const getCommitteeBadge = (comm) => {
    if (comm.type === 'PROVINCIAL') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Building2 className="w-3 h-3 mr-1" />
          Provincial Level
        </span>
      );
    }
    const zoneName = comm.zone?.name || 'Zonal';
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <MapPin className="w-3 h-3 mr-1" />
        {zoneName} Zone
      </span>
    );
  };

  const handlePortalNavigate = () => {
    onClose();
    if (currentUser) {
      navigate('/dashboard/committees');
    } else {
      navigate('/login');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-4 sm:p-7 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 sm:space-x-3 mb-2 sm:mb-3 pr-10">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-teal-300 border border-white/20 shrink-0">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-300 block truncate">
                  Department of Education — NCP
                </span>
                <h2 className="text-lg sm:text-3xl font-extrabold text-white truncate">
                  Subject Development Committees
                </h2>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed hidden sm:block">
              Active curriculum development panels, assessment moderators, and academic advisory bodies 
              collaborating across the North Central Province to elevate Commerce education standards.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="p-3.5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
            {/* Level Filter Tabs */}
            <div className="flex items-center overflow-x-auto bg-slate-200/80 p-1 rounded-2xl max-w-full space-x-1 shrink-0">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'ALL'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Committees ({committees.length})
              </button>
              <button
                onClick={() => setActiveTab('PROVINCIAL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'PROVINCIAL'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Provincial Level
              </button>
              <button
                onClick={() => setActiveTab('ZONAL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'ZONAL'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Zonal Level
              </button>
            </div>

            {/* Zone Dropdown & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {activeTab === 'ZONAL' && zones.length > 0 && (
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">All Zones</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              )}

              {/* Search Box */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search committees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Committee Cards List */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {loading ? (
              <div className="text-center py-16 text-slate-400">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-medium">Loading active committees...</p>
              </div>
            ) : filteredCommittees.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-base font-bold text-slate-700">No committees found</h4>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or level filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommittees.map((comm) => (
                  <motion.div
                    key={comm.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        {getCommitteeBadge(comm)}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
                        {comm.name}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {comm.description || "Official subject committee facilitating assessment criteria, term review, and instructional standard upgrade across schools."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center text-teal-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        Active Committee
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {comm.type === 'PROVINCIAL' ? 'North Central Province' : `${comm.zone?.name || 'Zonal'} Commerce`}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              🔒 <span className="font-semibold text-slate-700">Member Workspace & Discussions:</span> Appointed committee members can sign in to view agendas and exchange messages.
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePortalNavigate}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center space-x-1.5"
              >
                <span>{currentUser ? 'Open Committee Workspace' : 'Staff Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubjectCommitteesModal;

