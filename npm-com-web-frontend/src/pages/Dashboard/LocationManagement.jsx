import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Building, Landmark, School as SchoolIcon, ShieldCheck, BookOpen } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import SubjectManagementModal from '../../components/SubjectManagementModal';

const LocationManagement = () => {
  const { currentUser } = useAuth();

  const isProvincialAdmin = ['PROVINCIAL_DIRECTOR', 'ADMIN'].includes(currentUser?.role);
  const isZonal = currentUser?.role === 'ZONAL_DIRECTOR';
  const isDivisional = currentUser?.role === 'DIVISIONAL_DIRECTOR';

  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  const [newZoneName, setNewZoneName] = useState('');
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Initialize data based on role
  useEffect(() => {
    if (isProvincialAdmin) {
      fetchDistricts();
    } else if (isZonal) {
      if (currentUser?.zoneId) {
        setSelectedZone(String(currentUser.zoneId));
        fetchDivisions(currentUser.zoneId);
      } else {
        // Fallback: fetch zones so they can select their appointed zone if not pre-linked
        fetch('http://localhost:8080/api/public/zones')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setZones(data);
          })
          .catch(console.error);
      }
    } else if (isDivisional) {
      if (currentUser?.divisionId) {
        setSelectedDivision(String(currentUser.divisionId));
        fetchSchools(currentUser.divisionId);
      } else {
        // Fallback: fetch divisions
        fetch('http://localhost:8080/api/public/divisions')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setDivisions(data);
          })
          .catch(console.error);
      }
    }
  }, [currentUser?.role, currentUser?.zoneId, currentUser?.divisionId]);

  useEffect(() => {
    if (isProvincialAdmin && selectedDistrict) {
      fetchZones(selectedDistrict);
    }
  }, [selectedDistrict, isProvincialAdmin]);

  useEffect(() => {
    if ((isProvincialAdmin || isZonal) && selectedZone) {
      fetchDivisions(selectedZone);
    }
  }, [selectedZone, isProvincialAdmin, isZonal]);

  useEffect(() => {
    if (selectedDivision) {
      fetchSchools(selectedDivision);
    }
  }, [selectedDivision]);

  const fetchDistricts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/public/districts');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setDistricts(data);
        if (!selectedDistrict) setSelectedDistrict(String(data[0].id));
      } else {
        setDistricts([
          { id: 1, name: 'Anuradhapura' },
          { id: 2, name: 'Polonnaruwa' }
        ]);
        if (!selectedDistrict) setSelectedDistrict('1');
      }
    } catch (err) {
      console.error(err);
      setDistricts([
        { id: 1, name: 'Anuradhapura' },
        { id: 2, name: 'Polonnaruwa' }
      ]);
      if (!selectedDistrict) setSelectedDistrict('1');
    }
  };

  const fetchZones = async (districtId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/public/zones?districtId=${districtId}`);
      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setZones([]);
    }
  };

  const fetchDivisions = async (zoneId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/public/divisions?zoneId=${zoneId}`);
      const data = await res.json();
      setDivisions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDivisions([]);
    }
  };

  const fetchSchools = async (divisionId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/public/schools?divisionId=${divisionId}`);
      const data = await res.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSchools([]);
    }
  };

  // Add Handlers
  const handleAddZone = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDistrict || !newZoneName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Please enter a zone name.', timer: 2000, showConfirmButton: false });
      return;
    }
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/zone?districtId=${selectedDistrict}&name=${encodeURIComponent(newZoneName.trim())}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Zone added successfully!', showConfirmButton: false, timer: 1500 });
        setNewZoneName('');
        fetchZones(selectedDistrict);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Failed to add zone', text: errData.message || 'Unknown error' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error adding zone' });
    }
    setLoading(false);
  };

  const handleAddDivision = async (e) => {
    if (e) e.preventDefault();
    const zoneIdToUse = isZonal ? (currentUser?.zoneId || selectedZone) : selectedZone;
    if (!zoneIdToUse || !newDivisionName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Please select a zone and enter division name.', timer: 2000, showConfirmButton: false });
      return;
    }
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/division?zoneId=${zoneIdToUse}&name=${encodeURIComponent(newDivisionName.trim())}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Division added successfully!', showConfirmButton: false, timer: 1500 });
        setNewDivisionName('');
        fetchDivisions(zoneIdToUse);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Failed to add division', text: errData.message || 'Unknown error' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error adding division' });
    }
    setLoading(false);
  };

  const handleAddSchool = async (e) => {
    if (e) e.preventDefault();
    const divisionIdToUse = isDivisional ? (currentUser?.divisionId || selectedDivision) : selectedDivision;
    if (!divisionIdToUse || !newSchoolName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Please select a division and enter school name.', timer: 2000, showConfirmButton: false });
      return;
    }
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/school?divisionId=${divisionIdToUse}&name=${encodeURIComponent(newSchoolName.trim())}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'School added successfully!', showConfirmButton: false, timer: 1500 });
        setNewSchoolName('');
        fetchSchools(divisionIdToUse);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Failed to add school', text: errData.message || 'Unknown error' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error adding school' });
    }
    setLoading(false);
  };

  // Delete Handlers
  const handleDeleteZone = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/zone/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Zone deleted successfully!', showConfirmButton: false, timer: 1500 });
        setSelectedZone('');
        if (selectedDistrict) fetchZones(selectedDistrict);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: errData.message || 'Failed to delete zone.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error deleting zone' });
    }
    setLoading(false);
  };

  const handleDeleteDivision = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/division/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Division deleted successfully!', showConfirmButton: false, timer: 1500 });
        setSelectedDivision('');
        const zoneIdToUse = isZonal ? (currentUser?.zoneId || selectedZone) : selectedZone;
        if (zoneIdToUse) fetchDivisions(zoneIdToUse);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: errData.message || 'Failed to delete division.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error deleting division' });
    }
    setLoading(false);
  };

  const handleDeleteSchool = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/school/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'School deleted successfully!', showConfirmButton: false, timer: 1500 });
        setSelectedSchool('');
        const divIdToUse = isDivisional ? (currentUser?.divisionId || selectedDivision) : selectedDivision;
        if (divIdToUse) fetchSchools(divIdToUse);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: errData.message || 'Failed to delete school.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error deleting school' });
    }
    setLoading(false);
  };

  // Grid layout class based on role
  const gridClass = isProvincialAdmin
    ? "grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6"
    : isZonal
      ? "grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6"
      : "grid grid-cols-1 max-w-xl mx-auto gap-3.5 sm:gap-6";

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* ── PRESTIGIOUS HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
            <MapPin size={12} className="text-teal-400" />
            <span>
              {isZonal 
                ? `🏢 Zonal Management • ${currentUser?.zoneName || 'Your Zone'}`
                : isDivisional
                  ? `🏛️ Divisional Management • ${currentUser?.divisionName || 'Your Division'}`
                  : 'Geographic Hierarchy'}
            </span>
          </div>
          <h1 className="text-base sm:text-2xl font-black text-white tracking-tight leading-snug">
            {isZonal
              ? `Manage Divisions & Schools (${currentUser?.zoneName || 'Zonal Scope'})`
              : isDivisional
                ? `Manage Schools (${currentUser?.divisionName || 'Divisional Scope'})`
                : 'Zones, Divisions & School Directory'}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl font-medium leading-relaxed hidden sm:block">
            {isZonal
              ? `Manage divisions and educational institutions within ${currentUser?.zoneName || 'your appointed zone'}.`
              : isDivisional
                ? `Manage secondary schools and institutional profiles within ${currentUser?.divisionName || 'your appointed division'}.`
                : 'Configure the North Central Province educational hierarchy: Anuradhapura and Polonnaruwa zones, divisional councils, and schools.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
          {isProvincialAdmin && (
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Add or Delete Curriculum Subjects"
            >
              <BookOpen size={14} />
              <span>Manage Subjects</span>
            </button>
          )}
          <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] sm:text-xs">
            <ShieldCheck size={13} className="text-teal-400" />
            <span>
              {isZonal
                ? `${divisions.length} Divisions in ${currentUser?.zoneName || 'Zone'}`
                : isDivisional
                  ? `${schools.length} Schools in ${currentUser?.divisionName || 'Division'}`
                  : '2 Districts • 11 Zones • 30 Divisions'}
            </span>
          </span>
        </div>
      </div>

      <div className={gridClass}>
        
        {/* ── CARD 1: ADD NEW ZONE (Provincial Director / Admin Only) ── */}
        {isProvincialAdmin && (
          <Card>
            <CardHeader title="Add New Zone" />
            <form onSubmit={handleAddZone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select District</label>
                <select 
                  required 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="" disabled>Choose District...</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Zone Name</label>
                <input 
                  required 
                  type="text" 
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Medawachchiya Zone"
                  className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <Button type="button" onClick={handleAddZone} isLoading={loading} disabled={!selectedDistrict} size="sm" className="w-full text-xs font-bold py-1.5 sm:py-2 cursor-pointer shadow-xs" leftIcon={Plus}>
                Save Zone
              </Button>
            </form>
          </Card>
        )}

        {/* ── CARD 2: ADD NEW DIVISION (Provincial Admin & Zonal Directors) ── */}
        {(isProvincialAdmin || isZonal) && (
          <Card>
            <CardHeader title={isZonal ? `Add Division to ${currentUser?.zoneName || 'Your Zone'}` : "Add New Division"} />
            <form onSubmit={handleAddDivision} className="space-y-4">
              
              {/* Zone selection or locked scope */}
              {isZonal && (currentUser?.zoneName || currentUser?.zoneId) ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointed Zone</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building size={14} className="text-blue-600" />
                      <span>{currentUser?.zoneName || 'Your Appointed Zone'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      Locked Scope
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Zone</label>
                  <div className="flex gap-2">
                    <select 
                      required 
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="" disabled>Choose Zone...</option>
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                    {isProvincialAdmin && selectedZone && (
                      <Button type="button" size="sm" variant="danger" className="px-2.5 py-1.5 text-xs cursor-pointer" onClick={() => handleDeleteZone(selectedZone)} title="Delete selected zone">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Division Name</label>
                <input 
                  required 
                  type="text" 
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  placeholder="e.g. Medawachchiya Division"
                  className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <Button 
                type="button" 
                onClick={handleAddDivision} 
                isLoading={loading} 
                disabled={isZonal ? (!currentUser?.zoneId && !selectedZone) : !selectedZone} 
                size="sm" 
                className="w-full text-xs font-bold py-1.5 sm:py-2 cursor-pointer shadow-xs" 
                leftIcon={Plus}
              >
                Save Division
              </Button>

              {/* Existing divisions list & delete strictly for Provincial Director / Admin */}
              {isProvincialAdmin && divisions.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Existing Divisions ({divisions.length})</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select Division to inspect / delete...</option>
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    {selectedDivision && (
                      <Button type="button" size="sm" variant="danger" className="px-2.5 py-1.5 text-xs cursor-pointer" onClick={() => handleDeleteDivision(selectedDivision)} title="Delete selected division">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

            </form>
          </Card>
        )}

        {/* ── CARD 3: ADD NEW SCHOOL (Provincial Admin, Zonal & Divisional Directors) ── */}
        <Card>
          <CardHeader title={isDivisional ? `Add School to ${currentUser?.divisionName || 'Your Division'}` : "Add New School"} />
          <form onSubmit={handleAddSchool} className="space-y-4">
            
            {/* Division selection or locked scope */}
            {isDivisional && (currentUser?.divisionName || currentUser?.divisionId) ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointed Division</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Landmark size={14} className="text-teal-600" />
                    <span>{currentUser?.divisionName || 'Your Appointed Division'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    Locked Scope
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Division {isZonal ? `(in ${currentUser?.zoneName || 'your Zone'})` : ''}
                </label>
                <div className="flex gap-2">
                  <select 
                    required 
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="" disabled>Choose Division...</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {isProvincialAdmin && selectedDivision && (
                    <Button type="button" size="sm" variant="danger" className="px-2.5 py-1.5 text-xs cursor-pointer" onClick={() => handleDeleteDivision(selectedDivision)} title="Delete selected division">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">New School Name (to Add)</label>
              <input 
                type="text" 
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="e.g. Medawachchiya Central College"
                className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <Button 
              type="button" 
              onClick={handleAddSchool} 
              isLoading={loading} 
              disabled={isDivisional ? (!currentUser?.divisionId && !selectedDivision || !newSchoolName.trim()) : (!selectedDivision || !newSchoolName.trim())} 
              size="sm" 
              className="w-full text-xs font-bold py-1.5 sm:py-2 cursor-pointer shadow-xs" 
              leftIcon={Plus}
            >
              Save School
            </Button>

            {/* School deletion section strictly for Provincial Director / Admin */}
            {isProvincialAdmin && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1 mt-1">Existing Schools ({schools.length}) (to Delete)</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Choose School to delete...</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {selectedSchool && (
                    <Button type="button" size="sm" variant="danger" className="px-2.5 py-1.5 text-xs cursor-pointer" onClick={() => handleDeleteSchool(selectedSchool)} title="Delete selected school">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

          </form>
        </Card>

      </div>

      {/* Curriculum Subject Management Modal for Provincial Director */}
      <SubjectManagementModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />
    </div>
  );
};

export default LocationManagement;
