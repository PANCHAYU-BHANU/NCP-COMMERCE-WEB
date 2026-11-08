import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, Map, Users, School, ChevronRight, UserCog, MapPin, Loader2 } from 'lucide-react';
import SchoolDetailedCard from '../Districts/SchoolDetailedCard';
import { Link } from 'react-router-dom';

const ZonesExplorer = () => {
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  
  const [loading, setLoading] = useState(false);

  // Determine current step for animations
  let step = 0;
  if (selectedDivision) step = 3;
  else if (selectedZone) step = 2;
  else if (selectedDistrict) step = 1;

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/districts');
      if (res.ok) setDistricts(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchZones = async (districtId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/zones?districtId=${districtId}`);
      if (res.ok) setZones(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchDivisions = async (zoneId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/divisions?zoneId=${zoneId}`);
      if (res.ok) setDivisions(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchSchools = async (divisionId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/schools?divisionId=${divisionId}`);
      if (res.ok) setSchools(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    fetchZones(district.id);
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    fetchDivisions(zone.id);
  };

  const handleSelectDivision = (division) => {
    setSelectedDivision(division);
    fetchSchools(division.id);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20">
      
      {/* ── 1. PRESTIGIOUS HERO BANNER WITH REAL LANDMARK IMAGE ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-center">
        {/* Background Landmark Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(/anuradhapura.png)` }}
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
                <MapPin className="w-4 h-4 text-teal-300" />
                <span>North Central Province Administrative Structure</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 drop-shadow-2xl">
                Regions & Zones Explorer
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
                Navigate the 2 Districts, 11 Educational Zones, 30 Divisions, and Commerce Schools across Rajarata.
              </p>
            </div>

            {/* Breadcrumbs in Header */}
            <div className="flex items-center space-x-2 text-xs font-bold bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-3 text-white shadow-2xl flex-shrink-0">
              <button onClick={() => { setSelectedDistrict(null); setSelectedZone(null); setSelectedDivision(null); }} className={`hover:text-blue-300 transition-colors ${step === 0 ? 'text-teal-300 font-black' : ''}`}>
                Districts
              </button>
              {selectedDistrict && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button onClick={() => { setSelectedZone(null); setSelectedDivision(null); }} className={`hover:text-blue-300 transition-colors ${step === 1 ? 'text-teal-300 font-black' : ''}`}>
                    {selectedDistrict.name}
                  </button>
                </>
              )}
              {selectedZone && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button onClick={() => { setSelectedDivision(null); }} className={`hover:text-blue-300 transition-colors ${step === 2 ? 'text-teal-300 font-black' : ''}`}>
                    {selectedZone.name}
                  </button>
                </>
              )}
              {selectedDivision && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-teal-300 font-black">{selectedDivision.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN REGIONAL CONTENT (ZERO OVERLAP!) ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex justify-center my-6">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        <div className="relative min-h-[500px]">
          <AnimatePresence custom={1} mode="wait">

            {/* STEP 0: DISTRICTS WITH RICH PHOTOS */}
            {step === 0 && !loading && (
              <motion.div
                key="step0"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {districts.map((district) => {
                  const isA = district.name?.toLowerCase().includes('anu');
                  const img = isA ? '/anuradhapura.png' : '/polonnaruwa.png';
                  const badge = isA ? 'Historic Capital' : 'Ancient Kingdom';
                  const schoolsDesc = `${district.name} Educational Network`;

                  return (
                    <motion.div
                      key={district.id}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectDistrict(district)}
                      className="cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 hover:border-blue-500 flex flex-col justify-between group transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <img
                          src={img}
                          alt={district.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                          {badge}
                        </div>
                        <div className="absolute bottom-4 left-5 right-5">
                          <h2 className="text-3xl font-black text-white drop-shadow-md">{district.name} District</h2>
                          <p className="text-teal-300 text-xs font-bold drop-shadow">{schoolsDesc}</p>
                        </div>
                      </div>

                      <div className="p-6 flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Click to explore educational zones and division hierarchies</p>
                        </div>
                        <span className="flex items-center space-x-1.5 text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-xl">
                          <span>Explore Zones</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                {districts.length === 0 && (
                  <div className="col-span-2 text-center text-slate-500 py-12">No districts found in the database.</div>
                )}
              </motion.div>
            )}

            {/* STEP 1: ZONES WITH RICH CARDS */}
            {step === 1 && !loading && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Zones in {selectedDistrict.name} District
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Select an educational zone to view its divisions and schools</p>
                  </div>
                  <button
                    onClick={() => { setSelectedDistrict(null); setZones([]); }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
                  >
                    ← Back to Districts
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {zones.map((zone, zIdx) => {
                    const zoneImgs = ['/slide_1.png', '/slide_2.png', '/slide_3.png', '/commerce_students.jpg', '/anuradhapura.png'];
                    const zImg = zoneImgs[zIdx % zoneImgs.length];
                    return (
                      <motion.div
                        key={zone.id}
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectZone(zone)}
                        className="cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 hover:border-blue-500 group transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative h-36 overflow-hidden bg-slate-900">
                          <img
                            src={zImg}
                            alt={zone.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4">
                            <h3 className="text-xl font-black text-white drop-shadow-md">{zone.name} Zone</h3>
                          </div>
                        </div>

                        <div className="p-5 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Educational Zone</span>
                          <span className="text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                            <span>Explore Divisions</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  {zones.length === 0 && (
                    <div className="col-span-3 text-center text-slate-500 py-12">No zones found in the database.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DIVISIONS */}
            {step === 2 && !loading && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Divisions in {selectedZone.name} Zone</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {divisions.map(division => (
                    <motion.div
                      key={division.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectDivision(division)}
                      className="cursor-pointer bg-white rounded-xl p-5 shadow-md border border-slate-100 hover:border-teal-300 group transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <h4 className="text-lg font-bold text-slate-800">{division.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium ml-8">Explore Schools</p>
                    </motion.div>
                  ))}
                  {divisions.length === 0 && (
                    <div className="col-span-4 text-center text-slate-500 py-12">No divisions found in the database.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: SCHOOLS */}
            {step === 3 && !loading && (
              <motion.div
                key="step3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-3">
                    <School className="w-7 h-7 text-indigo-600" />
                    <span>Schools in {selectedDivision.name}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map((school, idx) => {
                      // SchoolDetailedCard usually expects school.type, etc. 
                      // We map the DB entity into the expected mock shape for the UI component
                      const schoolForUi = {
                        ...school,
                        type: '1AB', // default mock type
                        students: 0,
                        principal: 'N/A'
                      };
                      return (
                        <SchoolDetailedCard 
                          key={school.id} 
                          school={schoolForUi} 
                          index={idx}
                          theme={{
                            cardBg: 'bg-white',
                            cardBorder: 'border-slate-100',
                            cardHover: 'hover:bg-slate-50',
                            cardHoverBorder: 'hover:border-indigo-200',
                            shadow: 'shadow-sm',
                            hoverShadow: 'hover:shadow-md',
                            gradient: 'from-indigo-500/20 to-transparent',
                            iconBg: 'bg-indigo-100',
                            iconColor: 'text-indigo-600',
                            iconHoverBg: 'group-hover:bg-indigo-600',
                            iconHoverColor: 'group-hover:text-white',
                            textDark: 'text-slate-800',
                            textMuted: 'text-slate-500'
                          }} 
                        />
                      );
                    })}
                    {schools.length === 0 && (
                      <div className="col-span-3 text-center text-slate-500 py-12">No schools found for this division in the database.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ZonesExplorer;
