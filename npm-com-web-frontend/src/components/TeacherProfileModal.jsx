import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, School, GraduationCap, Briefcase, 
  Calendar, CheckCircle2, AlertCircle, Upload, Plus, Trash2, X, Award,
  Sparkles, FileText, Check, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const APPOINTMENT_TYPES = [
  'Graduate Teacher (උපාධිධාරී ගුරු)',
  'Trained Teacher (පුහුණු ගුරු - විද්‍යාපීඨ)',
  'Sri Lanka Teacher Service (SLTS) Open Recruit',
  'Post Graduate Diploma in Education (PGDE)',
  'National Vocational Qualification (NVQ/Diploma)',
  'Other / Development Officer Placement (වෙනත්)'
];

const SERVICE_GRADES = [
  'Class 1 (1 වන ශ්‍රේණිය)',
  'Class 2 - Grade I (2-I ශ්‍රේණිය)',
  'Class 2 - Grade II (2-II ශ්‍රේණිය)',
  'Class 3 - Grade I (3-I ශ්‍රේණිය)',
  'Class 3 - Grade II (3-II ශ්‍රේණිය)'
];

const SERVICE_NATURES = [
  'Permanent (ස්ථිර)',
  'Probationary (ආධුනික / පරිවාස)',
  'Temporary / Contract (තාවකාලික / කොන්ත්‍රාත්)',
  'Development Officer (වාණිජ විෂය සංවර්ධන නිලධාරී)',
  'Other (වෙනත්)'
];

const TeacherProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { currentUser, updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nameWithInitials, setNameWithInitials] = useState('');
  const [nic, setNic] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [personalAddress, setPersonalAddress] = useState('');
  const [officialAddress, setOfficialAddress] = useState('');
  const [currentSchoolName, setCurrentSchoolName] = useState('');
  const [teachingSubjects, setTeachingSubjects] = useState('');
  const [firstAppointmentDate, setFirstAppointmentDate] = useState('');
  const [appointmentType, setAppointmentType] = useState(APPOINTMENT_TYPES[0]);
  const [serviceGrade, setServiceGrade] = useState(SERVICE_GRADES[1]);
  const [serviceNature, setServiceNature] = useState(SERVICE_NATURES[0]);
  const [trainingNeeded, setTrainingNeeded] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Paper marking
  const [paperMarking, setPaperMarking] = useState(false);
  const [paperMarkingLevel, setPaperMarkingLevel] = useState('AL'); // 'AL' | 'OL' | 'BOTH'

  // Dynamic Array Lists
  const [educationalQualifications, setEducationalQualifications] = useState([]);
  const [newEduQual, setNewEduQual] = useState('');

  const [professionalQualifications, setProfessionalQualifications] = useState([]);
  const [newProfQual, setNewProfQual] = useState('');

  const [previousSchools, setPreviousSchools] = useState([]);
  const [newPrevSchool, setNewPrevSchool] = useState('');

  // Missing Fields tracker
  const [missingFields, setMissingFields] = useState([]);

  const token = JSON.parse(localStorage.getItem('auth'))?.token || currentUser?.token || currentUser?.accessToken;

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/teacher-profile/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const p = data.profile || {};

        setFullName(p.fullName || '');
        setNameWithInitials(p.nameWithInitials || currentUser?.name || '');
        setNic(p.nic || currentUser?.username || '');
        setWhatsappNumber(p.whatsappNumber || '');
        setEmail(p.email || currentUser?.email || '');
        setPersonalAddress(p.personalAddress || '');
        setOfficialAddress(p.officialAddress || (currentUser?.schoolName ? `${currentUser.schoolName}, North Central Province` : ''));
        setCurrentSchoolName(p.currentSchoolName || currentUser?.schoolName || '');
        setTeachingSubjects(p.teachingSubjects || (currentUser?.subjects ? currentUser.subjects.join(', ') : 'Commerce'));
        setFirstAppointmentDate(p.firstAppointmentDate || '');
        setAppointmentType(p.appointmentType || APPOINTMENT_TYPES[0]);
        setServiceGrade(p.serviceGrade || SERVICE_GRADES[1]);
        setServiceNature(p.serviceNature || SERVICE_NATURES[0]);
        setTrainingNeeded(p.trainingNeeded || '');
        setProfilePic(p.profilePic || currentUser?.profilePic || '');

        setPaperMarking(Boolean(p.paperMarking));
        setPaperMarkingLevel(p.paperMarkingLevel || 'AL');

        // Parse educational qualifications
        if (p.educationalQualifications) {
          try {
            const parsed = JSON.parse(p.educationalQualifications);
            setEducationalQualifications(Array.isArray(parsed) ? parsed : [p.educationalQualifications]);
          } catch {
            setEducationalQualifications(p.educationalQualifications.split(',').map(s => s.trim()).filter(Boolean));
          }
        } else {
          setEducationalQualifications([]);
        }

        // Parse professional qualifications
        if (p.professionalQualifications) {
          try {
            const parsed = JSON.parse(p.professionalQualifications);
            setProfessionalQualifications(Array.isArray(parsed) ? parsed : [p.professionalQualifications]);
          } catch {
            setProfessionalQualifications(p.professionalQualifications.split(',').map(s => s.trim()).filter(Boolean));
          }
        } else {
          setProfessionalQualifications([]);
        }

        // Parse previous schools
        if (p.previousSchools) {
          try {
            const parsed = JSON.parse(p.previousSchools);
            setPreviousSchools(Array.isArray(parsed) ? parsed : [p.previousSchools]);
          } catch {
            setPreviousSchools(p.previousSchools.split(',').map(s => s.trim()).filter(Boolean));
          }
        } else {
          setPreviousSchools([]);
        }

        setMissingFields(data.missingFields || []);
      }
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid File', 'Please select an image file (JPEG, PNG, WEBP).', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploadingPhoto(true);
    try {
      const res = await fetch('/api/teacher-profile/upload-photo', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setProfilePic(data.url);
        Swal.fire({
          icon: 'success',
          title: 'Photo Uploaded!',
          text: 'Your profile picture has been updated.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Error', 'Failed to upload photo.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Network error during photo upload.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Add Item Helpers
  const addEduQual = (e) => {
    e.preventDefault();
    if (newEduQual.trim()) {
      setEducationalQualifications([...educationalQualifications, newEduQual.trim()]);
      setNewEduQual('');
    }
  };

  const removeEduQual = (idx) => {
    setEducationalQualifications(educationalQualifications.filter((_, i) => i !== idx));
  };

  const addProfQual = (e) => {
    e.preventDefault();
    if (newProfQual.trim()) {
      setProfessionalQualifications([...professionalQualifications, newProfQual.trim()]);
      setNewProfQual('');
    }
  };

  const removeProfQual = (idx) => {
    setProfessionalQualifications(professionalQualifications.filter((_, i) => i !== idx));
  };

  const addPrevSchool = (e) => {
    e.preventDefault();
    if (newPrevSchool.trim()) {
      setPreviousSchools([...previousSchools, newPrevSchool.trim()]);
      setNewPrevSchool('');
    }
  };

  const removePrevSchool = (idx) => {
    setPreviousSchools(previousSchools.filter((_, i) => i !== idx));
  };

  // Handle Form Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !nameWithInitials.trim() || !whatsappNumber.trim()) {
      Swal.fire('Required Fields', 'Please fill in your Full Name, Name with Initials, and WhatsApp Number.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        nameWithInitials: nameWithInitials.trim(),
        nic: nic.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        personalAddress: personalAddress.trim(),
        officialAddress: officialAddress.trim(),
        currentSchoolName: currentSchoolName.trim(),
        teachingSubjects: teachingSubjects.trim(),
        firstAppointmentDate: firstAppointmentDate.trim(),
        appointmentType,
        serviceGrade,
        serviceNature,
        trainingNeeded: trainingNeeded.trim(),
        profilePic,
        paperMarking,
        paperMarkingLevel: paperMarking ? paperMarkingLevel : 'NONE',
        educationalQualifications: JSON.stringify(educationalQualifications),
        professionalQualifications: JSON.stringify(professionalQualifications),
        previousSchools: JSON.stringify(previousSchools)
      };

      const res = await fetch('/api/teacher-profile/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMissingFields(data.missingFields || []);
        if (onProfileUpdated) onProfileUpdated(data.profile);

        // Update Auth user session state if name/email/photo changed
        if (updateUser) {
          updateUser({
            name: nameWithInitials.trim(),
            email: email.trim(),
            profilePic
          });
        }

        if (data.isCompleted) {
          Swal.fire({
            icon: 'success',
            title: 'Profile Complete! 🎉',
            text: 'ඔබගේ ගුරු පැතිකඩ සියලු අත්‍යවශ්‍ය තොරතුරු සමඟ සාර්ථකව සම්පූර්ණ කරන ලදී.',
            confirmButtonColor: '#10b981',
            timer: 2500
          });
          onClose();
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Saved with Incomplete Details',
            html: `විස්තර සුරැකිණි. නමුත් පැතිකඩ සම්පූර්ණ වීමට පහත තොරතුරු අවශ්‍ය වේ:<br/><br/><div class="text-left text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">${data.missingFields.map(f => `• ${f}`).join('<br/>')}</div>`,
            confirmButtonColor: '#3b82f6'
          });
        }
      } else {
        Swal.fire('Error', data.message || 'Failed to save profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Network error while saving profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Completion calculation
  const totalMandatoryFields = 16;
  const missingCount = missingFields.length;
  const completedCount = Math.max(0, totalMandatoryFields - missingCount);
  const completionPercentage = Math.round((completedCount / totalMandatoryFields) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 text-[10px] uppercase font-black tracking-wider text-teal-300">
                  <ShieldCheck size={12} />
                  <span>North Central Province Commerce Directorate</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  ගුරු සේවා නිල පැතිකඩ (Teacher Career & Service Dossier)
                </h3>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Banner */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="text-xs font-bold text-slate-700">
                පැතිකඩ සම්පූර්ණතාව (Profile Status):
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                completionPercentage === 100 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {completionPercentage}% {completionPercentage === 100 ? 'සම්පූර්ණයි (Complete)' : 'අසම්පූර්ණයි (Incomplete)'}
              </span>
            </div>

            {missingFields.length > 0 && (
              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>අත්‍යවශ්‍ය තොරතුරු {missingFields.length} ක් තවමත් ඇතුළත් කර නොමැත</span>
              </span>
            )}
          </div>

          {/* Body Form */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {fetching ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">ගුරු සේවා දත්ත පූරණය වෙමින් පවතී...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* ── SECTION 1: PHOTO & IDENTITY ── */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <User size={15} className="text-blue-600" />
                    <span>1. පෞද්ගලික අනන්‍යතාව සහ ඡායාරූපය (Personal Identity & Photo)</span>
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* Photo Box */}
                    <div className="flex flex-col items-center space-y-2 shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative shadow-sm group">
                        {profilePic ? (
                          <img 
                            src={profilePic.startsWith('http') ? profilePic : (profilePic.startsWith('/') ? profilePic : `/${profilePic}`)} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-center p-2">
                            <User className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                            <span className="text-[9px] font-bold text-slate-500 block leading-tight">No Photo</span>
                          </div>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      <label className="text-[11px] font-black text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl cursor-pointer transition-colors flex items-center space-x-1">
                        <Upload size={12} />
                        <span>ඡායාරූපයක් එක් කරන්න</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ගුරුවරයාගේ සම්පූර්ණ නම (Full Name) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. රත්නායක මුදියන්සේලාගේ සුනිල් ශාන්ත රත්නායක"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          මුලකුරු සමඟ නම (Name with Initials) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ආර්.එම්. සුනිල් ශාන්ත"
                          value={nameWithInitials}
                          onChange={(e) => setNameWithInitials(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ජාතික හැඳුනුම්පත් අංකය (NIC) *
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={nic}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                        />
                        <span className="text-[10px] text-slate-500">පද්ධතියට ලොග්වන NIC අංකයෙන් ස්වයංක්‍රීයව තහවුරු කෙරේ.</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          WhatsApp අංකය (WhatsApp Number) *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0712345678"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          විද්‍යුත් තැපෑල (Email Address) *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. teacher@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          පෞද්ගලික ලිපිනය (Personal Address) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. නො. 45, විජය මාවත, අනුරාධපුර"
                          value={personalAddress}
                          onChange={(e) => setPersonalAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: OFFICIAL SERVICE DETAILS ── */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Briefcase size={15} className="text-emerald-600" />
                    <span>2. සේවා ස්ථානය සහ පත්වීම් විස්තර (Official Placement & Service)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        වත්මන් සේවා ස්ථානය (Current School) *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={currentSchoolName}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-500">ස්ථානගත පාසල අනුව ස්වයංක්‍රීයව ලැබේ.</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        රාජකාරි ලිපිනය (Official Address) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="පාසලේ නිල ලිපිනය"
                        value={officialAddress}
                        onChange={(e) => setOfficialAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        මුල් පත්වීම් දිනය (First Appointment Date) *
                      </label>
                      <input
                        type="date"
                        required
                        value={firstAppointmentDate}
                        onChange={(e) => setFirstAppointmentDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        පත්වීම් වර්ගය (Appointment Type) *
                      </label>
                      <select
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {APPOINTMENT_TYPES.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ගුරු සේවයේ ශ්‍රේණිය (SLTS Grade) *
                      </label>
                      <select
                        value={serviceGrade}
                        onChange={(e) => setServiceGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {SERVICE_GRADES.map((g, idx) => (
                          <option key={idx} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        සේවයේ ස්වභාවය (Service Nature) *
                      </label>
                      <select
                        value={serviceNature}
                        onChange={(e) => setServiceNature(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {SERVICE_NATURES.map((sn, idx) => (
                          <option key={idx} value={sn}>{sn}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        උගන්වන විෂයයන් (Teaching Subjects) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Accounting, Business Studies"
                        value={teachingSubjects}
                        onChange={(e) => setTeachingSubjects(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 3: QUALIFICATIONS & PREVIOUS SCHOOLS ── */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Award size={15} className="text-purple-600" />
                    <span>3. සුදුසුකම් සහ සේවා ඉතිහාසය (Qualifications & Service History)</span>
                  </h4>

                  {/* Educational Qualifications */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      අධ්‍යාපන සුදුසුකම් (Educational Qualifications - එකකට වඩා එක් කළ හැක) *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e.g. B.Com (Special) Hons - University of Kelaniya"
                        value={newEduQual}
                        onChange={(e) => setNewEduQual(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <button
                        type="button"
                        onClick={addEduQual}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {educationalQualifications.map((eq, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg border border-purple-200">
                          <span>{eq}</span>
                          <button type="button" onClick={() => removeEduQual(i)} className="text-purple-600 hover:text-purple-900 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {educationalQualifications.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">සුදුසුකම් ඇතුළත් කර 'Add' ක්ලික් කරන්න.</span>
                      )}
                    </div>
                  </div>

                  {/* Professional Qualifications */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      වෘත්තීය සුදුසුකම් (Professional Qualifications - එකකට වඩා එක් කළ හැක) *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e.g. Post Graduate Diploma in Education (PGDE) - OUSL"
                        value={newProfQual}
                        onChange={(e) => setNewProfQual(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <button
                        type="button"
                        onClick={addProfQual}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {professionalQualifications.map((pq, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
                          <span>{pq}</span>
                          <button type="button" onClick={() => removeProfQual(i)} className="text-blue-600 hover:text-blue-900 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {professionalQualifications.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">සුදුසුකම් ඇතුළත් කර 'Add' ක්ලික් කරන්න.</span>
                      )}
                    </div>
                  </div>

                  {/* Previous Schools */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      පෙර සේවය කළ පාසල් (Previous Schools Served)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e.g. A/ Swarnapali Balika National School (2018 - 2022)"
                        value={newPrevSchool}
                        onChange={(e) => setNewPrevSchool(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <button
                        type="button"
                        onClick={addPrevSchool}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {previousSchools.map((ps, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                          <span>{ps}</span>
                          <button type="button" onClick={() => removePrevSchool(i)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {previousSchools.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">පෙර සේවය කළ පාසල් නොමැති නම් හිස්ව තබන්න.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── SECTION 4: PAPER MARKING & TRAINING ── */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileText size={15} className="text-amber-600" />
                    <span>4. ප්‍රශ්න පත්‍ර ඇගයීම් සහ පුහුණු අවශ්‍යතා (Paper Marking & Training)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Paper Marking Toggle */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block">
                            ප්‍රශ්න පත්‍ර ඇගයීම් මණ්ඩල සහභාගීත්වය (Paper Marking)
                          </label>
                          <span className="text-[11px] text-slate-500">
                            ඔබ විභාග දෙපාර්තමේන්තුවේ ඇගයීම් සඳහා සහභාගී වන්නේද?
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={paperMarking}
                          onChange={(e) => setPaperMarking(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                      </div>

                      {paperMarking && (
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                          <label className="text-xs font-bold text-slate-700">විභාග මට්ටම:</label>
                          <select
                            value={paperMarkingLevel}
                            onChange={(e) => setPaperMarkingLevel(e.target.value)}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                          >
                            <option value="AL">උසස් පෙළ (G.C.E. A/L Marking)</option>
                            <option value="OL">සාමාන්‍ය පෙළ (G.C.E. O/L Marking)</option>
                            <option value="BOTH">දෙකම (Both A/L & O/L)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Training Needed */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ඔබට අවශ්‍ය පුහුණුව (Training Needed) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="උදා: තොරතුරු තාක්ෂණය (ICT) වාණිජ්‍යයට මුසුකිරීම, නව විෂය නිර්දේශ ඇගයීම් ක්‍රමවේද, මූල්‍ය විගණන ප්‍රමිතීන්..."
                        value={trainingNeeded}
                        onChange={(e) => setTrainingNeeded(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">
                    සියලු දත්ත පළාත් හා කලාප අධ්‍යක්ෂ මණ්ඩල සහ විදුහල්පති විසින් නිල වශයෙන් තහවුරු කරනු ලැබේ.
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>{loading ? 'සුරැකෙමින් පවතී...' : 'පැතිකඩ සුරකින්න (Save & Update)'}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeacherProfileModal;

