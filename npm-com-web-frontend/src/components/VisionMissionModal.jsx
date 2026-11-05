import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target } from 'lucide-react';

const VisionMissionModal = ({ isOpen, onClose, type }) => {
  const [currentTab, setCurrentTab] = useState(type || 'vision');

  useEffect(() => {
    if (type) setCurrentTab(type);
  }, [type]);

  if (!isOpen) return null;

  const content = {
    vision: {
      title: "Our Vision",
      subtitle: "අපගේ දැක්ම • எங்கள் தரிசனம்",
      si: "දැක්ම: වාණිජ හා ව්‍යාපාර අධ්‍යයනයෙන් විශිෂ්ටත්වය කරා පියනගන අනාගත පරපුරක් බිහිකිරීම.",
      ta: "தரிசனம்: வர்த்தக மற்றும் வணிக ஆய்வுகளில் சிறந்த எதிர்கால சந்ததியினரை உருவாக்குதல்.",
      en: "Vision: To create a future generation that strives for excellence in commerce and business studies."
    },
    mission: {
      title: "Our Mission",
      subtitle: "අපගේ මෙහෙවර • எங்கள் பணி",
      si: "මෙහෙවර: නවීන තාක්ෂණය හා ප්‍රායෝගික කුසලතා මුසු කරමින්, සිසුන්ගේ ව්‍යාපාරික ඥානය වර්ධනය කිරීම.",
      ta: "பணி: நவீன தொழில்நுட்பம் மற்றும் நடைமுறை திறன்களை இணைத்து மாணவர்களின் வணிக அறிவை மேம்படுத்துதல்.",
      en: "Mission: To enhance students' business acumen by blending modern technology with practical skills."
    }
  };

  const data = content[currentTab] || content.vision;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-xl w-full my-auto"
        >
          {/* Traditional Ornate Container */}
          <div className="relative bg-[#FFFBF0] rounded-2xl p-1 shadow-2xl border-2 border-[#D4AF37] max-h-[92vh] overflow-hidden flex flex-col">
            
            {/* Prominent Fixed Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-[#8B0000] rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-red-950 transition-transform active:scale-90 shadow-xl border-2 border-[#D4AF37] z-30 cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Inner Scrollable Certificate Area */}
            <div className="border-3 sm:border-4 border-double border-[#8B0000] p-4 sm:p-7 text-center rounded-xl relative overflow-y-auto max-h-[88vh]">
              
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-7 h-7 sm:w-10 sm:h-10 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-[#D4AF37] rounded-tl-lg pointer-events-none"></div>
              <div className="absolute top-2 right-2 w-7 h-7 sm:w-10 sm:h-10 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-[#D4AF37] rounded-tr-lg pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 w-7 h-7 sm:w-10 sm:h-10 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-[#D4AF37] rounded-bl-lg pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-10 sm:h-10 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-[#D4AF37] rounded-br-lg pointer-events-none"></div>
              
              {/* Decorative top motif */}
              <div className="flex justify-center mb-2 opacity-80">
                <svg width="50" height="25" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 C60 20, 80 30, 100 25 C80 40, 60 50, 50 50 C40 50, 20 40, 0 25 C20 30, 40 20, 50 0 Z" fill="#D4AF37" />
                  <circle cx="50" cy="25" r="5" fill="#8B0000" />
                </svg>
              </div>

              {/* Toggle Switch between Vision & Mission */}
              <div className="flex justify-center mb-4 relative z-20 pr-8 sm:pr-0">
                <div className="inline-flex p-1 bg-[#8B0000]/10 rounded-xl border border-[#D4AF37]/50 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('vision')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentTab === 'vision'
                        ? 'bg-[#8B0000] text-[#D4AF37] shadow-sm'
                        : 'text-[#8B0000] hover:bg-[#8B0000]/10'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>Vision (දැක්ම)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('mission')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentTab === 'mission'
                        ? 'bg-[#8B0000] text-[#D4AF37] shadow-sm'
                        : 'text-[#8B0000] hover:bg-[#8B0000]/10'
                    }`}
                  >
                    <Target size={14} />
                    <span>Mission (මෙහෙවර)</span>
                  </button>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#8B0000] mb-0.5 uppercase tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                {data.title}
              </h2>
              <p className="text-[11px] sm:text-xs font-bold text-amber-900/80 mb-3.5 tracking-wide">
                {data.subtitle}
              </p>

              <div className="space-y-2.5 sm:space-y-3.5 relative z-10 text-left">
                {/* Sinhala */}
                <div className="bg-[#FFFBF0]/90 p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/50 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-[#8B0000] block mb-0.5">සිංහල මාධ්‍යය</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">{data.si}</p>
                </div>
                
                {/* Tamil */}
                <div className="bg-[#FFFBF0]/90 p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/50 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-[#8B0000] block mb-0.5">தமிழ் மொழி</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">{data.ta}</p>
                </div>
                
                {/* English */}
                <div className="bg-[#FFFBF0]/90 p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/50 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-[#8B0000] block mb-0.5">English Medium</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>{data.en}</p>
                </div>
              </div>

              {/* Close Action Button at bottom */}
              <div className="mt-4 pt-3 border-t border-[#D4AF37]/40 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-1.5 sm:py-2 bg-[#8B0000] hover:bg-red-950 text-[#D4AF37] font-bold text-xs rounded-xl shadow-md border border-[#D4AF37] transition-all cursor-pointer active:scale-95"
                >
                  Close Window (වසන්න)
                </button>
              </div>

              {/* Watermark Background pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8B0000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VisionMissionModal;
