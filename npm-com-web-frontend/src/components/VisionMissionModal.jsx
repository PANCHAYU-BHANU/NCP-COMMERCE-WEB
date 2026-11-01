import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const VisionMissionModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = {
    vision: {
      title: "Our Vision",
      si: "දැක්ම: වාණිජ හා ව්‍යාපාර අධ්‍යයනයෙන් විශිෂ්ටත්වය කරා පියනගන අනාගත පරපුරක් බිහිකිරීම.",
      ta: "தரிசனம்: வர்த்தக மற்றும் வணிக ஆய்வுகளில் சிறந்த எதிர்கால சந்ததியினரை உருவாக்குதல்.",
      en: "Vision: To create a future generation that strives for excellence in commerce and business studies."
    },
    mission: {
      title: "Our Mission",
      si: "මෙහෙවර: නවීන තාක්ෂණය හා ප්‍රායෝගික කුසලතා මුසු කරමින්, සිසුන්ගේ ව්‍යාපාරික ඥානය වර්ධනය කිරීම.",
      ta: "பணி: நவீன தொழில்நுட்பம் மற்றும் நடைமுறை திறன்களை இணைத்து மாணவர்களின் வணிக அறிவை மேம்படுத்துதல்.",
      en: "Mission: To enhance students' business acumen by blending modern technology with practical skills."
    }
  };

  const data = content[type] || content.vision;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-2xl w-full"
        >
          {/* Traditional Ornate Container */}
          <div className="relative bg-[#FFFBF0] rounded-lg p-1 shadow-2xl border-2 border-[#D4AF37]">
            {/* Inner Border with Liyawela/Traditional Feel */}
            <div className="border-4 border-double border-[#8B0000] p-8 sm:p-12 text-center rounded relative overflow-hidden">
              
              {/* Corner Ornaments (CSS drawn) */}
              <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl"></div>
              <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl"></div>
              <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl"></div>
              <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl"></div>
              
              {/* Decorative top motif */}
              <div className="flex justify-center mb-6 opacity-80">
                <svg width="80" height="40" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 C60 20, 80 30, 100 25 C80 40, 60 50, 50 50 C40 50, 20 40, 0 25 C20 30, 40 20, 50 0 Z" fill="#D4AF37" />
                  <circle cx="50" cy="25" r="5" fill="#8B0000" />
                </svg>
              </div>

              <h2 className="text-3xl font-extrabold text-[#8B0000] mb-8 uppercase tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
                {data.title}
              </h2>

              <div className="space-y-6 relative z-10">
                {/* Sinhala */}
                <div className="bg-[#FFFBF0]/80 p-4 rounded border border-[#D4AF37]/30 shadow-sm">
                  <p className="text-lg font-bold text-slate-800 leading-relaxed">{data.si}</p>
                </div>
                
                {/* Tamil */}
                <div className="bg-[#FFFBF0]/80 p-4 rounded border border-[#D4AF37]/30 shadow-sm">
                  <p className="text-[15px] font-bold text-slate-700 leading-relaxed">{data.ta}</p>
                </div>
                
                {/* English */}
                <div className="bg-[#FFFBF0]/80 p-4 rounded border border-[#D4AF37]/30 shadow-sm">
                  <p className="text-base font-semibold text-slate-600 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>{data.en}</p>
                </div>
              </div>

              {/* Decorative bottom motif */}
              <div className="flex justify-center mt-8 opacity-80 rotate-180">
                <svg width="80" height="40" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 C60 20, 80 30, 100 25 C80 40, 60 50, 50 50 C40 50, 20 40, 0 25 C20 30, 40 20, 50 0 Z" fill="#D4AF37" />
                  <circle cx="50" cy="25" r="5" fill="#8B0000" />
                </svg>
              </div>

              {/* Watermark Background pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8B0000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute -top-4 -right-4 w-10 h-10 bg-[#8B0000] rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-red-900 transition-colors shadow-lg border-2 border-[#D4AF37]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VisionMissionModal;
