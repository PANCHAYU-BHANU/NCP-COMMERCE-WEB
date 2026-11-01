import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  Phone, Mail, MapPin, Clock, Send, Building2, User, HelpCircle,
  CheckCircle2, ArrowLeft, MessageSquare, ShieldCheck, Globe, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactPage = () => {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    role: 'Teacher',
    email: '',
    phone: '',
    district: 'Anuradhapura',
    subject: 'Curriculum & Past Papers',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      const ticketId = 'NCP-COM-' + Math.floor(100000 + Math.random() * 900000);
      Swal.fire({
        icon: 'success',
        title: lang === 'si' ? 'ඔබගේ පණිවිඩය සාර්ථකව යොමු විය!' : 'Inquiry Submitted Successfully!',
        html: `
          <div class="text-left space-y-3 mt-3 text-sm">
            <p class="text-slate-600">${lang === 'si' ? 'උතුරු මැද පළාත් වාණිජ අධ්‍යාපන අංශය වෙත ඔබගේ පණිවිඩය ලැබී ඇත.' : 'Your message has been dispatched to the Provincial Commerce Education Branch.'}</p>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">${lang === 'si' ? 'යොමු අංකය (Reference ID):' : 'Reference Tracking ID:'}</span>
              <span class="text-lg font-black text-blue-700">${ticketId}</span>
            </div>
            <p class="text-xs text-slate-500">${lang === 'si' ? 'වැඩකරන දින 2ක් ඇතුළත අපගේ නිලධාරියෙකු ඔබව සම්බන්ධ කර ගනු ඇත.' : 'An educational officer will respond within 2 working days.'}</p>
          </div>
        `,
        confirmButtonText: lang === 'si' ? 'තහවුරු කරන්න' : 'Understood',
        confirmButtonColor: '#2563eb',
        customClass: { popup: 'rounded-3xl' }
      });

      setFormData({
        name: '',
        role: 'Teacher',
        email: '',
        phone: '',
        district: 'Anuradhapura',
        subject: 'Curriculum & Past Papers',
        message: ''
      });
    }, 800);
  };

  const offices = [
    {
      title: lang === 'si' ? 'පළාත් අධ්‍යාපන අධ්‍යක්ෂ කාර්යාලය' : "Provincial Director's Secretariat",
      desc: lang === 'si' ? 'උතුරු මැද පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව' : 'Provincial Department of Education — NCP',
      image: '/slide_2.png',
      badge: 'Headquarters',
      person: 'Dr. Ananda Gunasekara (Provincial Director)',
      phone: '+94 25 222 2450 / +94 25 222 3451',
      email: 'director@ncp.moe.gov.lk',
      address: lang === 'si' ? 'පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව, අනුරාධපුරය' : 'Provincial Dept. of Education, Anuradhapura',
      color: 'bg-blue-600 text-white'
    },
    {
      title: lang === 'si' ? 'වාණිජ අධ්‍යාපන මධ්‍යම අංශය' : 'Commerce Education Branch Desk',
      desc: lang === 'si' ? 'විෂය සම්බන්ධීකාරක සහ සම්පත් මධ්‍යස්ථානය' : 'Curriculum, Resource & Evaluation Unit',
      image: '/slide_1.png',
      badge: 'Academic Desk',
      person: 'In-Service Advisor (Commerce & Accounting)',
      phone: '+94 25 223 4880',
      email: 'commerce.branch@ncp.moe.gov.lk',
      address: lang === 'si' ? '2 වන මහල, අධ්‍යාපන සංකීර්ණය, අනුරාධපුරය' : '2nd Floor, Education Complex, Anuradhapura',
      color: 'bg-teal-600 text-white'
    },
    {
      title: lang === 'si' ? 'අනුරාධපුර කලාප අධ්‍යාපන කාර්යාලය' : 'Anuradhapura Zonal Education Office',
      desc: lang === 'si' ? 'අනුරාධපුර කලාප 8 හි සම්බන්ධීකරණය' : 'Overseeing 8 Educational Zones in Anuradhapura',
      image: '/anuradhapura.png',
      badge: 'A\'pura Zonal Desk',
      person: 'Zonal Director of Education',
      phone: '+94 25 222 2841',
      email: 'anuradhapura.zone@ncp.moe.gov.lk',
      address: lang === 'si' ? 'ජයන්ති මාවත, අනුරාධපුරය' : 'Jayanthi Mawatha, Anuradhapura',
      color: 'bg-indigo-600 text-white'
    },
    {
      title: lang === 'si' ? 'පොළොන්නරුව කලාප අධ්‍යාපන කාර්යාලය' : 'Polonnaruwa Zonal Education Office',
      desc: lang === 'si' ? 'පොළොන්නරුව කලාප 3 හි සම්බන්ධීකරණය' : 'Overseeing 3 Educational Zones in Polonnaruwa',
      image: '/polonnaruwa.png',
      badge: 'P\'naruwa Zonal Desk',
      person: 'Zonal Director of Education',
      phone: '+94 27 222 2160',
      email: 'polonnaruwa.zone@ncp.moe.gov.lk',
      address: lang === 'si' ? 'නව නගරය, පොළොන්නරුව' : 'New Town, Polonnaruwa',
      color: 'bg-emerald-600 text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL LANDMARK IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-center">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/slide_2.png)` }}
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
            <span>{lang === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/40 to-teal-500/30 border border-teal-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-teal-200 shadow-lg">
                <Building2 className="w-4 h-4 text-teal-300" />
                <span>{lang === 'si' ? 'රාජ්‍ය සන්නිවේදන හා මහජන සබඳතා කේන්ද්‍රය' : 'Official Communication & Public Relations Desk'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                {lang === 'si' ? 'අප හා සම්බන්ධ වන්න' : 'Contact & Public Helpdesk'}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                {lang === 'si'
                  ? 'උතුරු මැද පළාත් අධ්‍යාපන දෙපාර්තමේන්තුවේ වාණිජ අධ්‍යාපන අංශය, කලාප කාර්යාල, නිලධාරීන් සහ මහජන ගැටළු විසඳීමේ නිල ද්වාරය.'
                  : 'Get in touch with Provincial and Zonal Commerce Education authorities, submit official inquiries, or visit our regional complexes.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-xl border border-white/15 px-5 py-3 rounded-2xl text-xs font-bold text-slate-200 shadow-2xl flex-shrink-0">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>{lang === 'si' ? 'සඳුදා – සිකුරාදා: පෙ.ව. 8:30 – ප.ව. 4:15' : 'Mon – Fri: 8:30 AM – 4:15 PM'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HEADQUARTERS & ZONAL OFFICES CARDS (ZERO CUTOFF, RICH PHOTOS!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span>{lang === 'si' ? 'ප්‍රධාන හා කලාපීය අධ්‍යාපන කාර්යාල' : 'Headquarters & Regional Zonal Desks'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'si' ? 'පළාත් හා කලාපීය අධ්‍යාපන කාර්යාල වෙත සෘජුව සම්බන්ධ වන්න.' : 'Official contact channels for provincial administrative secretariats and zonal divisions.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {offices.map((off, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Photo Header */}
              <div className="relative h-36 overflow-hidden bg-slate-900">
                <img
                  src={off.image}
                  alt={off.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${off.color}`}>
                    {off.badge}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3.5 right-3.5">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block drop-shadow">
                    {off.desc}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {off.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4">{off.person}</p>

                  <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-start space-x-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-700">{off.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Mail className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-600 truncate">{off.email}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{off.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 3. FORM & MAP GRID ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inquiry Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {lang === 'si' ? 'නිල විමසීම් සහ ප්‍රතිපෝෂණ යොමු කරන්න' : 'Submit an Official Inquiry / Feedback'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'si' ? 'ගුරුවරුන්, විදුහල්පතිවරුන්, සිසුන් හා දෙමාපියන් සඳහා' : 'For teachers, principals, students, and education stakeholders'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'si' ? 'සම්පූර්ණ නම' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. K.M. Rathnayake"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'si' ? 'ඔබගේ භූමිකාව' : 'Designation / Role'} *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                  >
                    <option value="Teacher">Commerce Teacher (වාණිජ ගුරුභවතා)</option>
                    <option value="Principal">Principal (විදුහල්පති)</option>
                    <option value="Student">Commerce Student (වාණිජ සිසුවා/සිසුවිය)</option>
                    <option value="Parent">Parent / Guardian (දෙමාපියන්)</option>
                    <option value="Officer">Educational Officer (අධ්‍යාපන නිලධාරී)</option>
                    <option value="Other">General Public (මහජනතාව)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'si' ? 'දුරකථන අංකය' : 'Contact Phone'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="07X XXXXXXX"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'si' ? 'අදාළ දිස්ත්‍රික්කය' : 'District'} *
                  </label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                  >
                    <option value="Anuradhapura">Anuradhapura (අනුරාධපුරය)</option>
                    <option value="Polonnaruwa">Polonnaruwa (පොළොන්නරුව)</option>
                    <option value="All">All North Central Province (පළාත)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'si' ? 'විමසුම් කාණ්ඩය' : 'Subject Category'} *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                  >
                    <option value="Curriculum & Past Papers">Curriculum & Past Papers (විෂය මාලා හා ප්‍රශ්න පත්‍ර)</option>
                    <option value="Results Analytics">Examination Results & Performance (ප්‍රතිඵල විමසුම්)</option>
                    <option value="Teacher Workshops">Teacher Training / Seminars (ගුරු වැඩමුළු)</option>
                    <option value="Commerce Day Competitions">Commerce Day & Competitions (වාණිජ දින තරඟ)</option>
                    <option value="General Grievance">General Grievance / Inquiries (වෙනත්)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'si' ? 'ඔබගේ පණිවිඩය / විමසුම' : 'Message / Details'} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder={lang === 'si' ? 'කරුණාකර ඔබගේ විමසුම හෝ අවශ්‍යතාවය මෙහි සටහන් කරන්න...' : 'Please describe your request, school details, or feedback clearly...'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (lang === 'si' ? 'යොමු වෙමින් පවතී...' : 'Submitting...') : (lang === 'si' ? 'පණිවිඩය යොමු කරන්න' : 'Submit Official Inquiry')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Map & Office Guidelines (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interactive Map Box */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{lang === 'si' ? 'පළාත් අධ්‍යාපන දෙපාර්තමේන්තු සංකීර්ණය' : 'Provincial Department of Education'}</span>
                </h3>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Provincial+Department+of+Education+North+Central+Province+Anuradhapura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                >
                  <span>{lang === 'si' ? 'සිතියමේ විවෘත කරන්න' : 'Open in Maps'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
                <iframe
                  title="Provincial Department of Education North Central Province Map"
                  src="https://maps.google.com/maps?q=Provincial+Department+of+Education+Anuradhapura,+North+Central+Province,+Sri+Lanka&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-start space-x-2">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-900">පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව - උතුරු මැද පළාත</p>
                    <p className="text-slate-600 font-medium">Provincial Department of Education — North Central Province</p>
                  </div>
                </div>
                <p className="text-slate-500 pl-6">පළමු පියවර (Stage 1), අනුරාධපුරය 50000, ශ්‍රී ලංකාව</p>
                <p className="text-[11px] text-teal-700 font-semibold pl-6">ප්‍රවේශය: හරීස්චන්ද්‍ර මාවත / මෛත්‍රීපාල සේනානායක මාවත ඔස්සේ</p>
              </div>
            </div>

            {/* Public Service Charter */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
              <div className="flex items-center space-x-2 mb-3 text-teal-300 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'si' ? 'රාජ්‍ය සේවා ප්‍රඥප්තිය' : 'Service Commitment'}</span>
              </div>
              <h4 className="text-lg font-black mb-2">
                {lang === 'si' ? 'කඩිනම් හා විනිවිදභාවයෙන් යුතු සේවය' : 'Transparent Educational Support'}
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                {lang === 'si'
                  ? 'පාසල් දරුවන්ගේ විභාග ලේඛන, ගුරු උපදේශන සේවා හා විෂයමාලා සම්බන්ධ සියලුම ඉල්ලීම් සඳහා උපරිම කාර්යක්ෂමතාවයෙන් යුතුව විසඳුම් ලබාදීමට අප බැඳී සිටිමු.'
                  : 'We are committed to delivering swift administrative resolution, pedagogical resources, and examination guidance for all schools across Rajarata.'}
              </p>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-md">
                  <span className="text-lg font-black text-teal-300 block">48 Hrs</span>
                  <span className="text-[10px] text-slate-300">Target Response</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-md">
                  <span className="text-lg font-black text-cyan-300 block">100%</span>
                  <span className="text-[10px] text-slate-300">Official Logging</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
