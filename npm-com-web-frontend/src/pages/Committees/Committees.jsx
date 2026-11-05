// Committees Page Component with Private Committee Messaging, 24-hr Ephemeral Purge, Pinning & PDF/Photo Attachments
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { 
  Plus, Trash2, X, Users, Shield, FolderPlus, 
  MessageSquare, Send, Lock, RefreshCw, Sparkles, 
  MessageCircle, CheckCircle2, AlertCircle, Building2, MapPin,
  Paperclip, Image as ImageIcon, FileText, Download, Clock, Pin, PinOff,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const Committees = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('PROVINCIAL');
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  
  const [committees, setCommittees] = useState([]);
  const [myCommitteeIds, setMyCommitteeIds] = useState(new Set());
  const [sidebarFilter, setSidebarFilter] = useState('ALL'); // 'ALL' | 'MY'
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [members, setMembers] = useState([]);
  
  const [systemUsers, setSystemUsers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  const [committeeName, setCommitteeName] = useState('');
  const [memberFormData, setMemberFormData] = useState({ userId: '', position: '' });
  const [mobileView, setMobileView] = useState('LIST'); // 'LIST' | 'DETAIL' for small screens

  // Messaging State
  const [activeViewTab, setActiveViewTab] = useState('MEMBERS'); // 'MEMBERS' | 'MESSAGES'
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasMessageAccess, setHasMessageAccess] = useState(true);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  
  // Attachment State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Requirement: Only Provincial Director (and System Administrator) can manage committees & members
  const canManage = currentUser?.role === 'PROVINCIAL_DIRECTOR' || currentUser?.role === 'ADMIN';

  // Check if current user is an appointed member of the selected committee
  const isCurrentUserMember = members.some(m => m.user?.id === currentUser?.id);

  // Requirement: Only committee members, Provincial Director, or Admin can see or participate in discussion
  const canAccessDiscussion = isCurrentUserMember || canManage;

  useEffect(() => {
    fetchZones();
    fetchMyCommittees();
    if (canManage) {
        fetchSystemUsers();
    }
  }, [canManage]);

  useEffect(() => {
    fetchCommittees();
    setSelectedCommittee(null);
    setMembers([]);
    setMessages([]);
    handleClearFile();
    setShowPinnedOnly(false);
  }, [activeTab, selectedZoneId]);

  useEffect(() => {
    if (selectedCommittee) {
        fetchMembers(selectedCommittee.id);
        fetchMessages(selectedCommittee.id);
        handleClearFile();
        setShowPinnedOnly(false);
    }
  }, [selectedCommittee]);

  // Requirement: If non-member, ensure view tab is always MEMBERS (do not show discussion at all)
  useEffect(() => {
    if (!canAccessDiscussion && activeViewTab === 'MESSAGES') {
      setActiveViewTab('MEMBERS');
    }
  }, [selectedCommittee, members, canAccessDiscussion, activeViewTab]);

  // Polling for live messages when on MESSAGES tab
  useEffect(() => {
    let interval;
    if (selectedCommittee && activeViewTab === 'MESSAGES' && canAccessDiscussion) {
      fetchMessages(selectedCommittee.id, true);
      interval = setInterval(() => {
        fetchMessages(selectedCommittee.id, true);
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCommittee, activeViewTab, canAccessDiscussion]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (activeViewTab === 'MESSAGES' && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, activeViewTab]);

  const getAuthToken = () => {
    try {
      if (currentUser?.token) return currentUser.token;
      if (currentUser?.accessToken) return currentUser.accessToken;
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.token || parsed?.accessToken || '';
      }
    } catch (e) {
      console.error("Error retrieving token:", e);
    }
    return '';
  };

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
      const token = getAuthToken();
      const res = await fetch('http://localhost:8080/api/auth/users', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSystemUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyCommittees = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:8080/api/committees/my-committees', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const idSet = new Set(data.map(c => c.id));
          setMyCommitteeIds(idSet);
        }
      }
    } catch (err) {
      console.error("Error fetching user's committees:", err);
    }
  };

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
  };

  const fetchMessages = async (committeeId, isSilent = false) => {
    if (!isSilent) setMessagesLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/api/committees/${committeeId}/messages`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        setHasMessageAccess(true);
      } else if (res.status === 403) {
        setHasMessageAccess(false);
      }
    } catch (err) {
      console.error("Error fetching committee messages:", err);
    }
    if (!isSilent) setMessagesLoading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      Swal.fire('File Too Large', 'Please select a file smaller than 20MB.', 'warning');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      Swal.fire('Unsupported Format', 'Please upload a photo (JPG, PNG, WebP) or a PDF file.', 'info');
      return;
    }

    setSelectedFile(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => setFilePreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedCommittee) return;
    if (!newMessage.trim() && !selectedFile) return;

    setSendingMessage(true);
    const contentToSend = newMessage.trim();

    try {
      const token = getAuthToken();
      const formData = new FormData();
      if (contentToSend) {
        formData.append('content', contentToSend);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`http://localhost:8080/api/committees/${selectedCommittee.id}/messages`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages(prev => [...prev, savedMsg]);
        setNewMessage('');
        handleClearFile();
      } else {
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.message || `Server error (${res.status})`;
        if (res.status === 403) {
          Swal.fire('Restricted', errMsg || 'Only appointed members of this committee can send messages.', 'warning');
        } else {
          Swal.fire('Error', errMsg, 'error');
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire('Error', err.message || 'Failed to send message. Please ensure the backend is running.', 'error');
    }
    setSendingMessage(false);
  };

  const handleTogglePin = async (messageId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/api/committees/${selectedCommittee.id}/messages/${messageId}/pin`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(prev => prev.map(m => m.id === messageId ? updatedMsg : m));
        
        if (updatedMsg.isPinned) {
          Swal.fire({
            title: 'Pinned!',
            text: 'This message is now pinned and will not be auto-deleted after 24 hours.',
            icon: 'success',
            timer: 2200,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: 'Unpinned',
            text: 'This message is now unpinned and will follow the 24-hr deletion schedule.',
            icon: 'info',
            timer: 2200,
            showConfirmButton: false
          });
        }
      } else {
        const errData = await res.json().catch(() => null);
        Swal.fire('Error', errData?.message || 'Could not update pin status', 'error');
      }
    } catch (err) {
      console.error("Error toggling pin:", err);
      Swal.fire('Error', 'Could not update pin status', 'error');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirm = await Swal.fire({
      title: 'Delete Message?',
      text: 'Are you sure you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/api/committees/${selectedCommittee.id}/messages/${messageId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
        Swal.fire('Error', 'Could not delete message', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Could not delete message', 'error');
    }
  };

  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
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
        fetchMyCommittees();
        Swal.fire('Success', 'Committee created successfully', 'success');
      } else {
        const errJson = await res.json().catch(() => null);
        Swal.fire('Error', errJson?.message || 'Failed to create committee', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred while creating committee', 'error');
    }
  };

  const handleDeleteCommittee = async (id, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the committee, member records, and discussion messages!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/api/cms/committees/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        if (selectedCommittee?.id === id) {
          setSelectedCommittee(null);
          setMembers([]);
          setMessages([]);
        }
        fetchCommittees();
        fetchMyCommittees();
        Swal.fire('Deleted!', 'Committee has been deleted.', 'success');
      } else {
        Swal.fire('Error', 'Failed to delete committee', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete committee', 'error');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedCommittee) return;

    try {
      const token = getAuthToken();
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
        fetchMyCommittees();
        Swal.fire('Success', 'Member added successfully to committee', 'success');
      } else {
        const errJson = await res.json().catch(() => null);
        Swal.fire('Error', errJson?.message || 'Failed to add member', 'error');
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
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/api/cms/committees/members/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        fetchMembers(selectedCommittee.id);
        fetchMyCommittees();
      } else {
        Swal.fire('Error', 'Failed to delete member', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Member';
    return role.replace(/^ROLE_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Today, ${timeStr}`;
      }
      const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${datePart}, ${timeStr}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTimeRemaining = (expiresAtStr) => {
    if (!expiresAtStr) return null;
    try {
      const exp = new Date(expiresAtStr).getTime();
      const now = new Date().getTime();
      const diffMs = exp - now;
      if (diffMs <= 0) return 'Expiring soon';
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
        return `${diffMins}m left`;
      }
      return `${diffHours}h left`;
    } catch (e) {
      return null;
    }
  };

  const getLocation = (user) => {
    if (!user) return '-';
    if (user.school?.name) return user.school.name;
    if (user.division?.name) return `${user.division.name} Division`;
    if (user.zone?.name) return `${user.zone.name} Zone`;
    if (user.district?.name) return `${user.district.name} District`;
    if (user.province?.name) return user.province.name;
    return user.location || 'North Central Province';
  };

  // Filter available committees
  const displayedCommittees = committees.filter(c => {
    if (sidebarFilter === 'MY') {
      return myCommitteeIds.has(c.id);
    }
    return true;
  });

  const pinnedMessages = messages.filter(m => m.isPinned);
  const displayedMessages = showPinnedOnly ? pinnedMessages : messages;

  const memberColumns = [
    { 
      header: 'Name', 
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.user?.username || row.user?.name || 'Unknown'}</div>
          {row.user?.email && <div className="text-xs text-slate-500">{row.user.email}</div>}
        </div>
      ), 
      className: 'w-1/3' 
    },
    { 
      header: 'Position', 
      accessor: 'position',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {row.position || 'Member'}
        </span>
      ),
      className: 'w-1/4' 
    },
    { 
      header: 'Location / Role', 
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-slate-800">{getLocation(row.user)}</div>
          <div className="text-xs text-indigo-600 font-semibold">{formatRole(row.user?.role)}</div>
        </div>
      ), 
      className: 'w-1/3' 
    },
  ];

  // Requirement: Only Provincial Director can delete/remove members
  if (canManage) {
    memberColumns.push({
      header: 'Actions',
      className: 'w-24 text-right',
      render: (row) => (
        <button 
          onClick={() => handleDeleteMember(row.id)} 
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors float-right"
          title="Remove Member"
        >
          <Trash2 size={16} />
        </button>
      )
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commerce Subject Committees</h1>
          <p className="text-slate-500 mt-1">Manage committees, appointed members, and collaborative discussions.</p>
        </div>
        {canManage && (
          <Button leftIcon={FolderPlus} onClick={() => setIsCommitteeModalOpen(true)}>
            Create Committee
          </Button>
        )}
      </div>

      {/* Level Tabs & Zone Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl w-max">
          <button
            onClick={() => setActiveTab('PROVINCIAL')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'PROVINCIAL'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Provincial Level
          </button>
          <button
            onClick={() => setActiveTab('ZONAL')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'ZONAL'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
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
        <div className={`md:col-span-1 space-y-3 ${selectedCommittee && mobileView === 'DETAIL' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Committees</h3>
            
            {/* Filter Toggle: All vs My */}
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setSidebarFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  sidebarFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({committees.length})
              </button>
              <button
                onClick={() => setSidebarFilter('MY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  sidebarFilter === 'MY' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My ({committees.filter(c => myCommitteeIds.has(c.id)).length})
              </button>
            </div>
          </div>

          {loading && committees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Loading committees...</div>
          ) : displayedCommittees.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-100">
              <Shield className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">
                {sidebarFilter === 'MY' ? "You haven't been assigned to any committees in this view." : 'No committees found for this level.'}
              </p>
            </div>
          ) : (
            displayedCommittees.map(committee => {
              const isMember = myCommitteeIds.has(committee.id);
              const isSelected = selectedCommittee?.id === committee.id;

              return (
                <motion.div 
                  key={committee.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setSelectedCommittee(committee);
                    setMobileView('DETAIL');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-50/90 border-blue-300 shadow-sm ring-1 ring-blue-400/20' 
                      : 'bg-white border-slate-100 shadow-sm hover:border-blue-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                          {committee.name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] font-medium text-slate-500">
                          {committee.type === 'PROVINCIAL' ? 'Provincial Level' : `${committee.zone?.name || 'Zonal'} Zone`}
                        </span>

                        {isMember && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            Your Committee
                          </span>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <button 
                        onClick={(e) => handleDeleteCommittee(committee.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete Committee"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Selected Committee Details & Tabs */}
        <div className={`md:col-span-2 ${!selectedCommittee || mobileView === 'LIST' ? 'hidden md:block' : 'block'}`}>
          {selectedCommittee ? (
            <Card className="overflow-hidden flex flex-col min-h-[500px]">
              {/* Committee Banner & Action Tabs */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50">
                {/* Mobile Back Button */}
                <div className="md:hidden mb-3">
                  <button
                    type="button"
                    onClick={() => setMobileView('LIST')}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>All Committees ({committees.length})</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {selectedCommittee.type === 'PROVINCIAL' ? 'North Central Province' : `${selectedCommittee.zone?.name || 'Zonal'} Education Office`}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedCommittee.name}
                    </h2>
                  </div>

                  {canManage && activeViewTab === 'MEMBERS' && (
                    <Button leftIcon={Users} onClick={() => setIsMemberModalOpen(true)} className="w-fit">
                      Add System User
                    </Button>
                  )}
                </div>

                {/* Tabs: Show Discussion tab ONLY if user has access (is member or Provincial Director) */}
                <div className="flex items-center space-x-2 border-b border-slate-200 -mb-4 sm:-mb-5 pt-1 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveViewTab('MEMBERS')}
                    className={`pb-3 px-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                      activeViewTab === 'MEMBERS'
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Committee Members</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200/80 text-slate-700 font-bold">
                      {members.length}
                    </span>
                  </button>

                  {/* Requirement: Do not even show discussion tab to non-members */}
                  {canAccessDiscussion && (
                    <button
                      onClick={() => setActiveViewTab('MESSAGES')}
                      className={`pb-3 px-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                        activeViewTab === 'MESSAGES'
                          ? 'border-blue-600 text-blue-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Committee Discussion</span>
                      {messages.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
                          {messages.length}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: MEMBERS DIRECTORY */}
              {activeViewTab === 'MEMBERS' && (
                <div className="p-2 flex-1">
                  <DataTable columns={memberColumns} data={members} isLoading={loading} />
                </div>
              )}

              {/* TAB 2: COMMITTEE MESSAGING & DISCUSSION (Only visible to members and Provincial Director) */}
              {activeViewTab === 'MESSAGES' && canAccessDiscussion && (
                <div className="flex flex-col flex-1 bg-slate-50/40">
                  {/* Notice & Refresh Bar with 24-Hour Ephemeral Badge & Pinned Filter */}
                  <div className="px-3.5 sm:px-6 py-2.5 bg-blue-50/70 border-b border-blue-100/70 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-blue-900 gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-1">
                      <span className="inline-flex items-center space-x-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] sm:text-xs">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Auto-deletes in 24 hours</span>
                      </span>
                      <span className="text-slate-400 hidden sm:inline">•</span>
                      <span className="inline-flex items-center space-x-1 text-slate-600 font-medium text-[11px] sm:text-xs">
                        <Lock className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Members only</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 w-full sm:w-auto">
                      {/* Pinned filter toggle if pinned messages exist */}
                      {pinnedMessages.length > 0 && (
                        <button
                          onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            showPinnedOnly 
                              ? 'bg-amber-500 text-white shadow-xs' 
                              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          <Pin size={12} className={showPinnedOnly ? "fill-white" : "fill-amber-500"} />
                          <span>Pinned ({pinnedMessages.length})</span>
                        </button>
                      )}

                      <button 
                        onClick={() => fetchMessages(selectedCommittee.id)}
                        disabled={messagesLoading}
                        className="inline-flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold cursor-pointer text-xs"
                        title="Refresh messages"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${messagesLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Pinned Announcement Bar (if pinned messages exist and not in filtered view) */}
                  {pinnedMessages.length > 0 && !showPinnedOnly && (
                    <div className="px-6 py-2 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center space-x-2 truncate">
                        <Pin size={14} className="text-amber-600 fill-amber-500 shrink-0" />
                        <span className="font-bold shrink-0">Pinned Note:</span>
                        <span className="truncate text-amber-800">
                          {pinnedMessages[pinnedMessages.length - 1].content || pinnedMessages[pinnedMessages.length - 1].fileName || 'Pinned attachment'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowPinnedOnly(true)} 
                        className="text-amber-700 font-bold hover:underline shrink-0 ml-2"
                      >
                        View all ({pinnedMessages.length})
                      </button>
                    </div>
                  )}

                  {/* Message Thread Stream */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 max-h-[460px] min-h-[360px]"
                  >
                    {messagesLoading && messages.length === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs font-medium">Loading committee discussion...</p>
                      </div>
                    ) : displayedMessages.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 my-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">
                          {showPinnedOnly ? 'No pinned messages' : 'No active messages'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          {showPinnedOnly 
                            ? 'No messages have been pinned yet. Click the pin icon on any message to keep it permanently.' 
                            : 'Messages disappear after 24 hours. Pin important guidelines or papers to keep them indefinitely!'}
                        </p>
                        {showPinnedOnly && (
                          <button onClick={() => setShowPinnedOnly(false)} className="mt-3 text-xs font-bold text-blue-600 hover:underline">
                            View All Messages
                          </button>
                        )}
                      </div>
                    ) : (
                      displayedMessages.map((msg) => {
                        const isMe = msg.isOwnMessage || msg.senderId === currentUser?.id;
                        const timeLeft = getTimeRemaining(msg.expiresAt);

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            {/* Header / Sender Info & Action Controls */}
                            <div className={`flex items-center flex-wrap gap-1.5 mb-1 px-1 text-xs text-slate-500 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="font-bold text-slate-800">
                                {isMe ? 'You' : msg.senderUsername}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                                {msg.senderPosition || 'Member'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {formatMessageTime(msg.createdAt)}
                              </span>

                              {/* Pinned vs Time Left Badge */}
                              {msg.isPinned ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300 shadow-2xs" title="Pinned permanently until unpinned">
                                  <Pin size={10} className="fill-amber-600 text-amber-600" />
                                  <span>Pinned {msg.pinnedBy ? `by ${msg.pinnedBy}` : ''}</span>
                                </span>
                              ) : timeLeft ? (
                                <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200" title="Expires and auto-deletes in">
                                  ⏳ {timeLeft}
                                </span>
                              ) : null}

                              {/* Action Buttons: Pin & Delete (Mobile Touch + Desktop Friendly, No Horizontal Overflow) */}
                              <div className="inline-flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePin(msg.id)}
                                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                                    msg.isPinned
                                      ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 shadow-2xs'
                                      : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                                  }`}
                                  title={msg.isPinned ? "Unpin message (will follow 24h expiration)" : "Pin message (keep permanently)"}
                                >
                                  <Pin size={12} className={msg.isPinned ? "fill-amber-500 text-amber-600" : ""} />
                                </button>

                                {(isMe || canManage) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete message"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Bubble */}
                            <div className="group relative max-w-[88%] sm:max-w-[75%]">
                              <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words transition-all ${
                                  msg.isPinned ? 'ring-2 ring-amber-400/80' : ''
                                } ${
                                  isMe 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs' 
                                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                                }`}
                              >
                                {/* Text Content */}
                                {msg.content && msg.content.trim() !== '' && (
                                  <div className="mb-1">{msg.content}</div>
                                )}

                                {/* Image Attachment */}
                                {msg.fileUrl && msg.fileType === 'image' && (
                                  <div className="mt-2 rounded-xl overflow-hidden border border-black/10 bg-black/5 relative group/img">
                                    <img 
                                      src={msg.fileUrl} 
                                      alt={msg.fileName || 'Attachment'} 
                                      className="max-h-72 w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                                      onClick={() => window.open(msg.fileUrl, '_blank')}
                                    />
                                    <a
                                      href={msg.fileUrl}
                                      download={msg.fileName || 'photo.jpg'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-xs font-semibold flex items-center space-x-1.5 backdrop-blur-xs transition-colors shadow-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Download size={13} />
                                      <span>Download</span>
                                    </a>
                                  </div>
                                )}

                                {/* PDF Attachment */}
                                {msg.fileUrl && msg.fileType === 'pdf' && (
                                  <div className={`mt-2 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                    isMe ? 'bg-white/15 border-white/25 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}>
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                        isMe ? 'bg-white text-red-600' : 'bg-red-50 text-red-600 border border-red-100'
                                      }`}>
                                        <FileText size={18} />
                                      </div>
                                      <div className="truncate">
                                        <div className="text-xs font-bold truncate max-w-[170px] sm:max-w-[240px]">
                                          {msg.fileName || 'Document.pdf'}
                                        </div>
                                        <div className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                          {formatFileSize(msg.fileSize)} • PDF Document
                                        </div>
                                      </div>
                                    </div>

                                    <a
                                      href={msg.fileUrl}
                                      download={msg.fileName || 'document.pdf'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-colors shrink-0 ${
                                        isMe ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      <Download size={13} />
                                      <span>Download</span>
                                    </a>
                                  </div>
                                )}

                                {/* Generic File Attachment */}
                                {msg.fileUrl && msg.fileType !== 'image' && msg.fileType !== 'pdf' && (
                                  <div className={`mt-2 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                    isMe ? 'bg-white/15 border-white/25 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}>
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      <Paperclip size={16} className={isMe ? 'text-blue-200' : 'text-slate-500'} />
                                      <div className="truncate">
                                        <div className="text-xs font-bold truncate max-w-[180px]">
                                          {msg.fileName || 'File'}
                                        </div>
                                        <div className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                          {formatFileSize(msg.fileSize)}
                                        </div>
                                      </div>
                                    </div>

                                    <a
                                      href={msg.fileUrl}
                                      download={msg.fileName || 'file'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-colors shrink-0 ${
                                        isMe ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      <Download size={13} />
                                      <span>Download</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer Area with Photo/PDF Attachment */}
                  <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80">
                    {/* Hidden file input */}
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />

                    {/* Attachment Preview Chip */}
                    {selectedFile && (
                      <div className="mb-2.5 p-2 sm:p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
                        <div className="flex items-center space-x-2.5 truncate">
                          {filePreviewUrl ? (
                            <img src={filePreviewUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-blue-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold truncate block max-w-[200px] sm:max-w-md">{selectedFile.name}</span>
                            <span className="text-[10px] text-blue-600">{formatFileSize(selectedFile.size)} • Ready to send</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors ml-2 shrink-0 cursor-pointer"
                          title="Remove file"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}

                    {/* Unified Mobile & Tablet Messenger Input Bar */}
                    <form onSubmit={handleSendMessage} className="space-y-1.5">
                      <div className="flex items-end gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-1.5 transition-all">
                        {/* Attachment Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 sm:p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0 mb-0.5 cursor-pointer"
                          title="Attach Photo or PDF"
                        >
                          <Paperclip size={18} />
                        </button>

                        {/* Full Width Textarea */}
                        <textarea
                          rows={1}
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          placeholder={
                            selectedFile 
                              ? `Add an optional note... (Enter to send)` 
                              : `Message ${selectedCommittee.name} members...`
                          }
                          className="flex-1 min-w-0 bg-transparent border-0 px-1 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none max-h-28 overflow-y-auto leading-relaxed"
                        />

                        {/* Send Button */}
                        <button
                          type="submit"
                          disabled={(!newMessage.trim() && !selectedFile) || sendingMessage}
                          className="px-3 sm:px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 shrink-0 mb-0.5 cursor-pointer active:scale-95"
                          title="Send Message"
                        >
                          {sendingMessage ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <span className="hidden sm:inline">Send</span>
                              <Send className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Clean Subtext Row Under Composer */}
                      <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-slate-400 px-2 gap-1">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-amber-500 shrink-0" />
                          <span>Messages auto-delete in 24h unless pinned (📌)</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Lock size={11} className="text-blue-500 shrink-0" />
                          <span>Members only</span>
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 border-dashed h-full min-h-[350px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <Users size={32} className="opacity-70" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Select a Committee</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a committee from the sidebar to view appointed members or participate in committee discussions.
              </p>
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
                            <option key={u.id} value={u.id}>
                              {u.name || u.username} ({formatRole(u.role)}) {u.schoolName ? ` • ${u.schoolName}` : u.zoneName ? ` • ${u.zoneName} Zone` : u.location ? ` • ${u.location}` : ''}
                            </option>
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
