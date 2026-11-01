// Committees Page Component
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, X, Users, Shield, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const Committees = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('PROVINCIAL');
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [members, setMembers] = useState([]);
  
  const [systemUsers, setSystemUsers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  const [committeeName, setCommitteeName] = useState('');
  const [memberFormData, setMemberFormData] = useState({ userId: '', position: '' });

  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROVINCIAL_DIRECTOR' || currentUser?.role === 'ZONAL_DIRECTOR';

  useEffect(() => {
    fetchZones();
    if (canManage) {
        fetchSystemUsers();
    }
  }, []);

  useEffect(() => {
    fetchCommittees();
    setSelectedCommittee(null);
    setMembers([]);
  }, [activeTab, selectedZoneId]);

  useEffect(() => {
    if (selectedCommittee) {
        fetchMembers(selectedCommittee.id);
    }
  }, [selectedCommittee]);

  const fetchZones = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/public/zones');
      if (res.ok) {
        const data = await res.json();
        setZones(data);
        if (data.length > 0) setSelectedZoneId(data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSystemUsers = async () => {
      try {
          const res = await fetch('http://localhost:8080/api/auth/users');
          if (res.ok) {
              const data = await res.json();
              setSystemUsers(data);
          }
      } catch (err) {
          console.error(err);
      }
  }

  const fetchCommittees = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8080/api/public/committees?type=${activeTab}`;
      if (activeTab === 'ZONAL' && selectedZoneId) {
        url += `&zoneId=${selectedZoneId}`;
      } else if (activeTab === 'ZONAL' && !selectedZoneId) {
        setCommittees([]);
        setLoading(false);
        return;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCommittees(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchMembers = async (committeeId) => {
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:8080/api/public/committees/${committeeId}/members`);
        if (res.ok) {
            const data = await res.json();
            setMembers(data);
        }
    } catch (err) {
        console.error(err);
    }
    setLoading(false);
  }

  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    try {
      const token = currentUser?.token || currentUser?.accessToken || JSON.parse(localStorage.getItem('auth'))?.token;
      
      const payload = new URLSearchParams();
      payload.append('name', committeeName);
      payload.append('type', activeTab);
      if (activeTab === 'ZONAL') {
        payload.append('zoneId', selectedZoneId);
      }

      const res = await fetch('http://localhost:8080/api/cms/committees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });
      
      if (res.ok) {
        setIsCommitteeModalOpen(false);
        setCommitteeName('');
        fetchCommittees();
        Swal.fire('Success', 'Committee created successfully', 'success');
      } else {
        Swal.fire('Error', 'Failed to create committee', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred', 'error');
    }
  };

  const handleDeleteCommittee = async (id, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the committee and all its members!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const token = currentUser?.token || currentUser?.accessToken || JSON.parse(localStorage.getItem('auth'))?.token;
      const res = await fetch(`http://localhost:8080/api/cms/committees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedCommittee?.id === id) {
            setSelectedCommittee(null);
            setMembers([]);
        }
        fetchCommittees();
        Swal.fire('Deleted!', 'Committee has been deleted.', 'success');
      } else {
        Swal.fire('Error', 'Failed to delete committee', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedCommittee) return;

    try {
      const token = currentUser?.token || currentUser?.accessToken || JSON.parse(localStorage.getItem('auth'))?.token;
      
      const payload = new URLSearchParams();
      payload.append('userId', memberFormData.userId);
      payload.append('position', memberFormData.position);

      const res = await fetch(`http://localhost:8080/api/cms/committees/${selectedCommittee.id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });
      
      if (res.ok) {
        setIsMemberModalOpen(false);
        setMemberFormData({ userId: '', position: '' });
        fetchMembers(selectedCommittee.id);
        Swal.fire('Success', 'Member added successfully', 'success');
      } else {
        const errData = await res.json();
        Swal.fire('Error', errData.message || 'Failed to add member', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred', 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    const result = await Swal.fire({
        title: 'Remove Member?',
        text: "Are you sure you want to remove this member from the committee?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, remove'
      });
  
      if (!result.isConfirmed) return;

    try {
      const token = currentUser?.token || currentUser?.accessToken || JSON.parse(localStorage.getItem('auth'))?.token;
      const res = await fetch(`http://localhost:8080/api/cms/committees/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchMembers(selectedCommittee.id);
      } else {
        Swal.fire('Error', 'Failed to delete member', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const memberColumns = [
    { 
        header: 'Name', 
        accessor: (row) => (
            <div>
                <div className="font-bold text-slate-800">{row.user?.username || 'Unknown'}</div>
                {row.user?.email && <div className="text-xs text-slate-500">{row.user.email}</div>}
            </div>
        ), 
        className: 'w-1/3' 
    },
    { header: 'Position', accessor: 'position', className: 'w-1/4' },
    { 
        header: 'Location / Role', 
        accessor: (row) => (
            <div>
                <div className="text-sm">{row.user?.location || '-'}</div>
                <div className="text-xs text-blue-600 font-semibold">{row.user?.role?.replace(/_/g, ' ') || '-'}</div>
            </div>
        ), 
        className: 'w-1/3' 
    },
  ];

  if (canManage) {
    memberColumns.push({
      header: 'Actions',
      className: 'w-24 text-right',
      render: (row) => (
        <button 
          onClick={() => handleDeleteMember(row.id)} 
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors float-right"
        >
          <Trash2 size={16} />
        </button>
      )
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commerce Committees</h1>
          <p className="text-slate-500 mt-1">Manage and view Provincial and Zonal Committees.</p>
        </div>
        {canManage && (
          <Button leftIcon={FolderPlus} onClick={() => setIsCommitteeModalOpen(true)}>Create Committee</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl w-max">
          <button
            onClick={() => setActiveTab('PROVINCIAL')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'PROVINCIAL'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Provincial Level
          </button>
          <button
            onClick={() => setActiveTab('ZONAL')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'ZONAL'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Zonal Level
          </button>
        </div>

        {activeTab === 'ZONAL' && (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-slate-600">Select Zone:</span>
            <select 
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Committees List (Sidebar) */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Available Committees</h3>
            {loading && committees.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Loading committees...</div>
            ) : committees.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-100">
                    <Shield className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No committees found for this level.</p>
                </div>
            ) : (
                committees.map(committee => (
                    <motion.div 
                        key={committee.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCommittee(committee)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedCommittee?.id === committee.id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-100 shadow-sm hover:border-blue-100 hover:bg-blue-50/30'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className={`font-bold ${selectedCommittee?.id === committee.id ? 'text-blue-900' : 'text-slate-800'}`}>
                                    {committee.name}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">{committee.type} Level</p>
                            </div>
                            {canManage && (
                                <button 
                                    onClick={(e) => handleDeleteCommittee(committee.id, e)}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))
            )}
          </div>

          {/* Members Table */}
          <div className="md:col-span-2">
              {selectedCommittee ? (
                  <Card>
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
                          <div>
                              <h2 className="text-xl font-bold text-slate-900">{selectedCommittee.name} Members</h2>
                          </div>
                          {canManage && (
                              <Button leftIcon={Users} onClick={() => setIsMemberModalOpen(true)}>
                                  Add System User
                              </Button>
                          )}
                      </div>
                      <DataTable columns={memberColumns} data={members} isLoading={loading} />
                  </Card>
              ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 border-dashed h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                      <Users size={48} className="mb-4 opacity-50" />
                      <p>Select a committee to view its members</p>
                  </div>
              )}
          </div>
      </div>

      {/* Create Committee Modal */}
      <AnimatePresence>
        {isCommitteeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Create Committee</h3>
                <button onClick={() => setIsCommitteeModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1"><X size={20} /></button>
              </div>
              <div className="p-6">
                <form id="committeeForm" onSubmit={handleCreateCommittee} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Committee Name</label>
                    <input type="text" required value={committeeName} onChange={e => setCommitteeName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. IT Steering Committee" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Scope / Level</label>
                    <input type="text" disabled value={activeTab} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" />
                    <p className="text-xs text-slate-400 mt-1">To create a committee for another level, change the active tab first.</p>
                  </div>
                  {activeTab === 'ZONAL' && (
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Zone</label>
                        <select disabled value={selectedZoneId} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed">
                            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </select>
                     </div> 
                  )}
                </form>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <Button onClick={() => setIsCommitteeModalOpen(false)} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Cancel</Button>
                <Button type="submit" form="committeeForm">Create</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Add System User</h3>
                <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1"><X size={20} /></button>
              </div>
              <div className="p-6">
                <form id="memberForm" onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Select User</label>
                    <select 
                      required 
                      value={memberFormData.userId} 
                      onChange={e => setMemberFormData({...memberFormData, userId: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="" disabled>Search or select user...</option>
                        {systemUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.username} {u.email ? `(${u.email})` : ''} - {u.role.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Position in Committee</label>
                    <input type="text" required value={memberFormData.position} onChange={e => setMemberFormData({...memberFormData, position: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. Secretary, Member, Coordinator" />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <Button onClick={() => setIsMemberModalOpen(false)} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Cancel</Button>
                <Button type="submit" form="memberForm">Add Member</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Committees;
