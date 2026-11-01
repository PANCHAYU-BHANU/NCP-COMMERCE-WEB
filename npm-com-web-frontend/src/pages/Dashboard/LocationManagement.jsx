import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Save, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const LocationManagement = () => {
  const { currentUser } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  const [newZoneName, setNewZoneName] = useState('');
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrict) fetchZones(selectedDistrict);
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedZone) fetchDivisions(selectedZone);
  }, [selectedZone]);

  useEffect(() => {
    if (selectedDivision) fetchSchools(selectedDivision);
  }, [selectedDivision]);

  const fetchDistricts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/public/districts');
      const data = await res.json();
      setDistricts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchZones = async (districtId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/public/zones?districtId=${districtId}`);
      const data = await res.json();
      setZones(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDivisions = async (zoneId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/public/divisions?zoneId=${zoneId}`);
      const data = await res.json();
      setDivisions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchools = async (divisionId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/public/schools?divisionId=${divisionId}`);
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
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
    e.preventDefault();
    if (!selectedZone || !newDivisionName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Please enter a division name.', timer: 2000, showConfirmButton: false });
      return;
    }
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/division?zoneId=${selectedZone}&name=${encodeURIComponent(newDivisionName.trim())}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Division added successfully!', showConfirmButton: false, timer: 1500 });
        setNewDivisionName('');
        fetchDivisions(selectedZone);
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
    e.preventDefault();
    if (!selectedDivision || !newSchoolName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Please enter a school name.', timer: 2000, showConfirmButton: false });
      return;
    }
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch(`http://localhost:8080/api/locations/school?divisionId=${selectedDivision}&name=${encodeURIComponent(newSchoolName.trim())}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'School added successfully!', showConfirmButton: false, timer: 1500 });
        setNewSchoolName('');
        fetchSchools(selectedDivision);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Failed to add school', text: errData.message || 'Unknown error' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error adding school' });
    }
    setLoading(false);
  };

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
        if (selectedZone) fetchDivisions(selectedZone);
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
        if (selectedDivision) fetchSchools(selectedDivision);
      } else {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: errData.message || 'Failed to delete school.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error deleting school' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* ── PRESTIGIOUS HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 border border-teal-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span>🗺️ Institutional Geographic Structure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Zones, Divisions & School Directory</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
            Configure the North Central Province educational hierarchy: Anuradhapura and Polonnaruwa zones, divisional councils, and schools.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 text-xs font-bold text-slate-300">
          <span className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <MapPin size={14} className="text-teal-400" />
            <span>2 Districts • 11 Zones • 30 Divisions</span>
          </span>
          <span className="text-teal-300 text-[11px] font-semibold">118 Commerce Secondary Schools</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Add Zone */}
        <Card>
          <CardHeader title="Add New Zone" />
          <form onSubmit={handleAddZone} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Select District</label>
              <select 
                required 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="" disabled>Choose District...</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">New Zone Name</label>
              <input 
                required 
                type="text" 
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="e.g. Medawachchiya Zone"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <Button type="button" onClick={handleAddZone} isLoading={loading} disabled={!selectedDistrict} className="w-full" leftIcon={Plus}>
              Save Zone
            </Button>
          </form>
        </Card>

        {/* Add Division */}
        <Card>
          <CardHeader title="Add New Division" />
          <form onSubmit={handleAddDivision} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Zone</label>
              <div className="flex gap-2">
                <select 
                  required 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="" disabled>Choose Zone...</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
                {selectedZone && (
                  <Button type="button" variant="danger" className="px-3" onClick={() => handleDeleteZone(selectedZone)} title="Delete selected zone">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">New Division Name</label>
              <input 
                required 
                type="text" 
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                placeholder="e.g. Medawachchiya Division"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <Button type="button" onClick={handleAddDivision} isLoading={loading} disabled={!selectedZone} className="w-full" leftIcon={Plus}>
              Save Division
            </Button>
          </form>
        </Card>

        {/* Add School */}
        <Card>
          <CardHeader title="Add New School" />
          <form onSubmit={handleAddSchool} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Division</label>
              <div className="flex gap-2">
                <select 
                  required 
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="" disabled>Choose Division...</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {selectedDivision && (
                  <Button type="button" variant="danger" className="px-3" onClick={() => handleDeleteDivision(selectedDivision)} title="Delete selected division">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-1.5 mt-2">Select School (to Delete)</label>
              <div className="flex gap-2 mb-4">
                <select 
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Choose School to delete...</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {selectedSchool && (
                  <Button type="button" variant="danger" className="px-3" onClick={() => handleDeleteSchool(selectedSchool)} title="Delete selected school">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">New School Name (to Add)</label>
              <input 
                type="text" 
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="e.g. Medawachchiya Central College"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <Button type="button" onClick={handleAddSchool} isLoading={loading} disabled={!selectedDivision || !newSchoolName.trim()} className="w-full" leftIcon={Plus}>
              Save School
            </Button>
          </form>
        </Card>

      </div>
    </div>
  );
};

export default LocationManagement;
