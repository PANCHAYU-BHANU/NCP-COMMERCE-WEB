import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Mail, Phone, MapPin, School, GraduationCap, Briefcase, 
  Calendar, CheckCircle2, AlertCircle, Award, Printer, ExternalLink, 
  BookOpen, Sparkles, Building, Landmark, ShieldCheck, MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TeacherDossierModal = ({ isOpen, onClose, teacher }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = JSON.parse(localStorage.getItem('auth'))?.token || currentUser?.token || currentUser?.accessToken;

  useEffect(() => {
    if (!isOpen || !teacher) {
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const teacherId = teacher.id || teacher.userId;
    const fetchUrl = `/api/teacher-profile/user/${teacherId}`;

    fetch(fetchUrl, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to load dossier (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setProfile(data.profile || {});
      })
      .catch(err => {
        console.error('Error fetching teacher profile dossier:', err);
        setError(err.message || 'Could not load official teacher dossier.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, teacher, token]);

  if (!isOpen) return null;

  // Format WhatsApp Link
  const rawWa = profile?.whatsappNumber || teacher?.whatsapp || '';
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  const waUrl = cleanWa 
    ? (cleanWa.startsWith('0') 
        ? `https://wa.me/94${cleanWa.slice(1)}` 
        : cleanWa.startsWith('94') 
          ? `https://wa.me/${cleanWa}` 
          : `https://wa.me/94${cleanWa}`)
    : null;

  // Display photo
  const photoSrc = profile?.profilePic || teacher?.profilePic;
  const fullPhotoUrl = photoSrc 
    ? (photoSrc.startsWith('http') ? photoSrc : (photoSrc.startsWith('/') ? photoSrc : `/${photoSrc}`)) 
    : null;

  const displayName = profile?.nameWithInitials || profile?.fullName || teacher?.name || teacher?.username || 'Teacher';
  const fullName = profile?.fullName || displayName;
  const nic = profile?.nic || teacher?.username || 'N/A';
  const currentSchool = profile?.currentSchoolName || teacher?.schoolName || 'Appointed School';
  const subjects = profile?.teachingSubjects || (teacher?.subjects ? teacher.subjects.map(s => typeof s === 'string' ? s : s?.name).join(', ') : 'Commerce Stream');
  
  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (typeof val === 'string' && val.includes(',')) {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [val];
  };

  const eduQuals = parseList(profile?.educationalQualifications);
  const profQuals = parseList(profile?.professionalQualifications);
  const prevSchools = parseList(profile?.previousSchools);

  const isCompleted = Boolean(profile?.isCompleted);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm print:p-0 print:bg-white">
        
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none"
        >
          {/* Top Decorative Banner */}
          <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white px-6 sm:px-8 pt-6 pb-8 border-b border-slate-800">
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer shadow-xs"
                title="Print Official Dossier"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print Dossier</span>
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-300 flex items-center justify-center transition border border-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Department Header */}
            <div className="flex items-center gap-3">
              <img src="/emblem.png" alt="National Emblem" className="w-10 h-10 object-contain drop-shadow" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  Provincial Dept. of Education — North Central Province
                </p>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Official Commerce Educator Dossier (ගුරු සේවා විස්තර වාර්තාව)
                </h2>
              </div>
            </div>

            {/* Profile Hero Block */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                {fullPhotoUrl ? (
                  <img
                    src={fullPhotoUrl}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-amber-400/80 shadow-xl bg-slate-800"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-3 border-white/20 ${fullPhotoUrl ? 'hidden' : 'flex'}`}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {isCompleted && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow border-2 border-slate-900" title="Verified Complete Profile">
                    <CheckCircle2 size={16} />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {displayName}
                  </h3>
                  {isCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Complete Profile
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <AlertCircle size={12} className="text-amber-400" /> Incomplete Profile
                    </span>
                  )}
                  {profile?.serviceGrade && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {profile.serviceGrade}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {fullName !== displayName ? `${fullName} • ` : ''}
                  <span className="font-mono text-amber-300 font-bold">NIC: {nic}</span>
                </p>

                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                  <School size={13} className="text-blue-400 shrink-0" />
                  <span className="text-white font-bold">{currentSchool}</span>
                  {(teacher?.divisionName || teacher?.zoneName) && (
                    <span className="text-slate-400">
                      ({teacher?.divisionName ? `${teacher.divisionName} Div • ` : ''}{teacher?.zoneName || 'NCP'})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact & Action Ribbon */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp: {profile?.whatsappNumber}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 text-slate-500 font-semibold text-xs">
                  <Phone size={13} />
                  <span>No WhatsApp listed</span>
                </span>
              )}

              {profile?.email || teacher?.email ? (
                <a
                  href={`mailto:${profile?.email || teacher?.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition"
                >
                  <Mail size={13} />
                  <span>{profile?.email || teacher?.email}</span>
                </a>
              ) : null}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Registered Role: <strong className="text-slate-800">{teacher?.role || 'Commerce Educator'}</strong>
            </div>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Loading comprehensive educator dossier...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-sm font-bold text-red-800">{error}</p>
                <p className="text-xs text-red-600">Please make sure the teacher has an active profile record.</p>
              </div>
            ) : (
              <>
                {/* 1. Official Service & Appointment Information */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-blue-600" />
                    <span>Official Service & Appointment Details (සේවා හා පත්වීම් තොරතුරු)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold uppercase text-slate-400">First Appointment Date</p>
                      <p className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1">
                        <Calendar size={13} className="text-slate-500" />
                        <span>{profile?.firstAppointmentDate || 'Not specified'}</span>
                      </p>
                      <span className="text-[10px] text-slate-400">මුල් පත්වීම් දිනය</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Appointment Type</p>
                      <p className="text-xs font-black text-slate-800 mt-1 truncate">
                        {profile?.appointmentType || 'Graduate Teacher'}
                      </p>
                      <span className="text-[10px] text-slate-400">පත්වීම් වර්ගය</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold uppercase text-slate-400">SLTS Grade / Class</p>
                      <p className="text-xs font-black text-slate-800 mt-1">
                        {profile?.serviceGrade || 'Class 2-I'}
                      </p>
                      <span className="text-[10px] text-slate-400">ගුරු සේවා ශ්‍රේණිය</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Nature of Service</p>
                      <p className="text-xs font-black text-slate-800 mt-1">
                        {profile?.serviceNature || 'Permanent (ස්ථිර)'}
                      </p>
                      <span className="text-[10px] text-slate-400">සේවා ස්වභාවය</span>
                    </div>
                  </div>
                </div>

                {/* 2. Teaching Subjects & Examination Marking Allocation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subjects */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                    <p className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-blue-600" />
                      <span>Assigned Teaching Subject(s) (උගන්වන විෂයයන්)</span>
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {subjects || 'Commercial Studies / Commerce'}
                    </p>
                    <p className="text-xs text-slate-600">
                      Assigned to teach at: <strong className="text-slate-800">{currentSchool}</strong>
                    </p>
                  </div>

                  {/* Paper Marking */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                    <p className="text-[11px] font-black uppercase text-purple-900 flex items-center gap-1.5">
                      <Award size={14} className="text-purple-600" />
                      <span>National Paper Marking Participation (ප්‍රශ්න පත්‍ර ඇගයීම්)</span>
                    </p>
                    <div className="flex items-center gap-2">
                      {profile?.paperMarking ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-600 text-white shadow-xs">
                          {profile.paperMarkingLevel === 'AL' && 'Active: G.C.E. A/L Evaluation Panel'}
                          {profile.paperMarkingLevel === 'OL' && 'Active: G.C.E. O/L Evaluation Panel'}
                          {profile.paperMarkingLevel === 'BOTH' && 'Active: Dual A/L & O/L Evaluation Panel'}
                          {(!profile.paperMarkingLevel || profile.paperMarkingLevel === 'NONE') && 'Active Marking Examiner'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-200 text-slate-600">
                          Not currently participating in national marking
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-purple-800 font-medium">
                      {profile?.paperMarking 
                        ? 'Registered as an evaluation examiner with the Department of Examinations.'
                        : 'No current exam evaluation assignment registered.'}
                    </p>
                  </div>
                </div>

                {/* 3. Qualifications Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Educational Qualifications */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-indigo-600" />
                      <span>Educational Qualifications (අධ්‍යාපන සුදුසුකම්)</span>
                    </h5>
                    {eduQuals.length > 0 ? (
                      <div className="space-y-2">
                        {eduQuals.map((qual, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-bold text-indigo-950 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{qual}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No educational qualifications registered yet.</p>
                    )}
                  </div>

                  {/* Professional Qualifications */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Award size={15} className="text-emerald-600" />
                      <span>Professional Qualifications (වෘත්තීය සුදුසුකම්)</span>
                    </h5>
                    {profQuals.length > 0 ? (
                      <div className="space-y-2">
                        {profQuals.map((qual, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs font-bold text-emerald-950 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{qual}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No professional qualifications registered yet.</p>
                    )}
                  </div>
                </div>

                {/* 4. Previous Schools Served */}
                <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Landmark size={15} className="text-amber-600" />
                    <span>Prior Institutional Placements (පෙර සේවය කළ පාසල්)</span>
                  </h5>
                  {prevSchools.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {prevSchools.map((sch, idx) => (
                        <div key={idx} className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Building size={13} className="text-amber-600" />
                          <span>{sch}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Current appointment is the first registered school or no prior schools listed.</p>
                  )}
                </div>

                {/* 5. Teacher's Training Needed (Continuous Professional Development Request) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600" />
                      <span>Requested Training & Development (ඔබට අවශ්‍ය පුහුණුව)</span>
                    </h5>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                      CPD Request for Directors
                    </span>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs font-semibold text-slate-800 leading-relaxed">
                    {profile?.trainingNeeded ? (
                      profile.trainingNeeded
                    ) : (
                      <span className="text-slate-400 italic">
                        No specific training request indicated by educator yet.
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-700 font-medium">
                    This training need is surfaced to the School Principal, Divisional Director, Zonal Director, and Provincial Commerce Directorate for workshop scheduling.
                  </p>
                </div>

                {/* 6. Addresses (Official & Personal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Building size={12} /> Official Address (රාජකාරි ලිපිනය)
                    </p>
                    <p className="text-xs font-semibold text-slate-800">
                      {profile?.officialAddress || `${currentSchool}, North Central Province`}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <MapPin size={12} /> Personal Address (පෞද්ගලික ලිපිනය)
                    </p>
                    <p className="text-xs font-semibold text-slate-800">
                      {profile?.personalAddress || 'Not provided'}
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
            <span className="text-[11px] text-slate-500 font-medium">
              Data verified under Sri Lanka Ministry of Education — NCP Commerce Portal.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeacherDossierModal;