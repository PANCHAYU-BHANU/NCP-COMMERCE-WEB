import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, Layout, Image as ImageIcon, FileText, Upload, Plus, Trash2, Edit2, Save, X, Settings } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const ContentManagement = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('news');

  const tabs = [
    { id: 'news', label: 'News & Announcements', icon: Globe },
    { id: 'events', label: 'Calendar Events', icon: Layout },
    { id: 'media', label: 'Media Gallery', icon: ImageIcon },
    { id: 'resources', label: 'Resource / Paper Uploads', icon: FileText },
    { id: 'homepage', label: 'Homepage Settings', icon: Layout },
  ];

  const [newsList, setNewsList] = useState([]);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsFormData, setNewsFormData] = useState({ title: '', content: '', category: 'General', status: 'Published', examLevel: 'GENERAL' });
  const [loading, setLoading] = useState(false);

  
  const [eventsList, setEventsList] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState({ title: '', description: '', eventDate: '', image: null, examLevel: 'GENERAL' });

  const [subjects, setSubjects] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    resourceType: 'PAST_PAPER',
    examLevel: 'AL',
    examYear: 2025,
    subjectId: '',
    file: null,
    targetAudience: 'PUBLIC'
  });

  const [photoAlbum, setPhotoAlbum] = useState('');
  const [videoAlbum, setVideoAlbum] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [photoExamLevel, setPhotoExamLevel] = useState('GENERAL');
  const [videoExamLevel, setVideoExamLevel] = useState('GENERAL');

  const defaultHomepageSettings = {
    directorName: 'Dr. Ananda Gunasekara',
    directorRole: 'Provincial Director of Education — North Central Province',
    directorTitle: 'Empowering Next-Generation Commerce Leaders',
    directorQuote: "Commerce education is the lifeblood of our nation's socioeconomic progress. In the North Central Province, across Anuradhapura and Polonnaruwa, we are dedicated to providing modern financial literacy, accounting rigor, and entrepreneurial skills to equip every student for university excellence and global enterprise.",
    directorQuoteSi: 'වාණිජ හා ව්‍යාපාර අධ්‍යාපනය රටක ආර්ථික සංවර්ධනයේ ජීවනාලියයි. උතුරු මැද පළාතේ අනුරාධපුර හා පොළොන්නරුව දිස්ත්‍රික්කවල පාසල් දරුවන්ට නවීන මූල්‍ය සාක්ෂරතාව, ගිණුම්කරණ විශිෂ්ටත්වය හා ව්‍යවසායකත්ව කුසලතා ලබා දෙමින්, ඔවුන් ජාතික හා ජාත්‍යන්තර මට්ටමට ඔසවා තැබීම අපගේ ඒකායන අරමුණයි.',
    directorPhoto: '/director.jpg',
    vision: 'To be the leading province in Sri Lanka for Commerce & Management education, producing ethical, innovative, and financially astute citizens.',
    visionSi: 'වාණිජ හා ව්‍යාපාර අධ්‍යයනයෙන් දිවයිනේ විශිෂ්ටතම පළාත බවට පත්වෙමින්, සදාචාර සම්පන්න, නව්‍යතා සපිරි සහ මූල්‍ය ඥානයෙන් පිරිපුන් පුරවැසියන් බිහිකිරීම.',
    mission: 'Delivering world-class commercial pedagogy, modern technological integration, continuous teacher empowerment, and student-centered entrepreneurship across all 11 educational zones.',
    missionSi: 'කලාප 11 පුරා ගුණාත්මක වාණිජ ඉගැන්වීම් ක්‍රමවේද, නවීන තාක්ෂණය, අඛණ්ඩ ගුරු සංවර්ධනය සහ ප්‍රායෝගික ව්‍යවසායකත්ව අවස්ථා සලසමින් සිසුන් සවිබල ගැන්වීම.',
    schoolsCount: 118,
    studentsCount: 12540,
    teachersCount: 462,
    passRate: 82.4
  };

  const [homepageSettings, setHomepageSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ncp_homepage_settings');
      return saved ? { ...defaultHomepageSettings, ...JSON.parse(saved) } : defaultHomepageSettings;
    } catch (e) {
      return defaultHomepageSettings;
    }
  });

  useEffect(() => {
    fetchNews();
    fetchEvents();
    fetchSubjects();
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch('http://localhost:8080/api/resources/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setResourcesList(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/public/subjects');
      const data = await res.json();
      setSubjects(data);
      if (data.length > 0) {
        setResourceFormData(prev => ({ ...prev, subjectId: data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchNews = async () => {
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch('http://localhost:8080/api/cms/news', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setNewsList(data);
    } catch (err) {
      console.error('Error fetching news:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const res = await fetch('http://localhost:8080/api/cms/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setEventsList(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      const url = newsFormData.id ? `http://localhost:8080/api/cms/news/${newsFormData.id}` : 'http://localhost:8080/api/cms/news';
      const method = newsFormData.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newsFormData)
      });
      if (res.ok) {
        setIsNewsModalOpen(false);
        setNewsFormData({ title: '', content: '', category: 'General', status: 'Published', examLevel: 'GENERAL' });
        fetchNews();
        Swal.fire({ icon: 'success', title: newsFormData.id ? 'News updated successfully!' : 'News added successfully!', timer: 2000, showConfirmButton: false })
      } else {
        Swal.fire({ icon: 'error', title: 'Failed to add news.', timer: 2000, showConfirmButton: false })
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Network error.', timer: 2000, showConfirmButton: false })
    }
    setLoading(false);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      
      
      const formData = new FormData();
      if (eventFormData.id) formData.append('id', eventFormData.id);
      formData.append('title', eventFormData.title);
      formData.append('description', eventFormData.description);
      
      // Convert datetime-local to ISO format that backend likes
      if(eventFormData.eventDate) {
        formData.append('eventDate', eventFormData.eventDate + ':00');
      }
      
      if(eventFormData.image) {
        formData.append('image', eventFormData.image);
      }
      formData.append('examLevel', eventFormData.examLevel || 'GENERAL');

      const url = eventFormData.id ? `http://localhost:8080/api/cms/events/${eventFormData.id}` : 'http://localhost:8080/api/cms/events';
      const method = eventFormData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        setIsEventModalOpen(false);
        setEventFormData({ title: '', description: '', eventDate: '', image: null, examLevel: 'GENERAL' });
        fetchEvents();
        Swal.fire({ icon: 'success', title: eventFormData.id ? 'Event updated successfully!' : 'Event added successfully!', timer: 2000, showConfirmButton: false })
      } else {
        Swal.fire({ icon: 'error', title: 'Failed to add event.', timer: 2000, showConfirmButton: false })
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Network error.', timer: 2000, showConfirmButton: false })
    }
    setLoading(false);
  };

  const handleDeleteNews = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, delete it!' });
    if (!result.isConfirmed) return;
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      
      const res = await fetch(`http://localhost:8080/api/cms/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if(res.ok) {
        fetchNews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditNewsClick = (news) => {
    setNewsFormData({ id: news.id, title: news.title, content: news.content, category: news.category, status: news.status });
    setIsNewsModalOpen(true);
  };

  const handleEditEventClick = (event) => {
    setEventFormData({ id: event.id, title: event.title, description: event.description, eventDate: event.eventDate ? event.eventDate.slice(0, 16) : '', image: null });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, delete it!' });
    if (!result.isConfirmed) return;
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      
      const res = await fetch(`http://localhost:8080/api/cms/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if(res.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaUploadSubmit = async (type) => {
    const file = type === 'photo' ? photoFile : videoFile;
    if (!file) {
      Swal.fire({ icon: 'info', title: 'Please select a file first.', timer: 2000, showConfirmButton: false });
      return;
    }

    const album = type === 'photo' ? photoAlbum : videoAlbum;
    if (!album) {
      Swal.fire({ icon: 'info', title: 'Please select a category first.', timer: 2000, showConfirmButton: false });
      return;
    }

    const { value: title } = await Swal.fire({
      title: `Enter title for this ${type}`,
      input: 'text',
      inputPlaceholder: 'Title...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write a title!';
        }
      }
    });

    if (!title) return; // User cancelled

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    formData.append('album', album);
    formData.append('examLevel', type === 'photo' ? photoExamLevel : videoExamLevel);
    
    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      
      const res = await fetch('http://localhost:8080/api/cms/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Media uploaded successfully!', timer: 2000, showConfirmButton: false });
        if (type === 'photo') {
          setPhotoFile(null);
          document.getElementById('photoInput').value = '';
        } else {
          setVideoFile(null);
          document.getElementById('videoInput').value = '';
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Failed to upload media.', timer: 2000, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Network error.', timer: 2000, showConfirmButton: false });
    }
    setLoading(false);
  };

  const handleResourceUpload = async () => {
    if (!resourceFormData.file) {
      Swal.fire({ icon: 'info', title: 'Please select a file to upload', timer: 2000, showConfirmButton: false })
      return;
    }
    if (!resourceFormData.title) {
      Swal.fire({ icon: 'info', title: 'Please enter a title', timer: 2000, showConfirmButton: false })
      return;
    }

    const formData = new FormData();
    formData.append('title', resourceFormData.title);
    formData.append('resourceType', resourceFormData.resourceType);
    formData.append('examLevel', resourceFormData.examLevel);
    formData.append('examYear', resourceFormData.examYear);
    formData.append('subjectId', resourceFormData.subjectId);
    formData.append('targetAudience', resourceFormData.targetAudience || 'PUBLIC');
    formData.append('file', resourceFormData.file);

    setLoading(true);
    try {
      const token = currentUser?.token || currentUser?.accessToken;
      
      const res = await fetch('http://localhost:8080/api/resources/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Resource uploaded successfully!', timer: 2000, showConfirmButton: false })
        setResourceFormData({ ...resourceFormData, title: '', file: null });
        fetchResources();
        // Reset file input
        const fileInput = document.getElementById('resourceFile');
        if (fileInput) fileInput.value = '';
      } else {
        Swal.fire({ icon: 'error', title: 'Failed to upload resource.', timer: 2000, showConfirmButton: false })
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Network error.', timer: 2000, showConfirmButton: false })
    }
    setLoading(false);
  };

  const renderNewsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">News & Announcements</h2>
          <p className="text-sm text-slate-500">Manage updates shown on the public homepage.</p>
        </div>
        <Button leftIcon={Plus} onClick={() => { setNewsFormData({ title: '', content: '', category: 'General', status: 'Published', examLevel: 'GENERAL' }); setIsNewsModalOpen(true); }}>Add News</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Title</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Publish Date</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {newsList.map(news => (
              <tr key={news.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 font-semibold text-slate-800">{news.title}</td>
                <td className="py-4 px-6 text-slate-500 text-sm">{news.createdAt ? new Date(news.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${news.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {news.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditNewsClick(news)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteNews(news.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* News Modal */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{newsFormData.id ? 'Edit' : 'Add'} News & Announcements</h3>
                <button onClick={() => setIsNewsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-6">
                <form id="newsForm" onSubmit={handleAddNews} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
                    <input type="text" required value={newsFormData.title} onChange={e => setNewsFormData({...newsFormData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Content</label>
                    <textarea rows="4" required value={newsFormData.content} onChange={e => setNewsFormData({...newsFormData, content: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                      <select value={newsFormData.category} onChange={e => setNewsFormData({...newsFormData, category: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                        <option>General</option>
                        <option>Exam</option>
                        <option>Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                      <select value={newsFormData.status} onChange={e => setNewsFormData({...newsFormData, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                        <option>Published</option>
                        <option>Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Exam Level</label>
                      <select value={newsFormData.examLevel} onChange={e => setNewsFormData({...newsFormData, examLevel: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                        <option value="GENERAL">General (All)</option>
                        <option value="AL">A/L Only</option>
                        <option value="OL">O/L Only</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <Button onClick={() => setIsNewsModalOpen(false)} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Cancel</Button>
                <Button type="submit" form="newsForm" isLoading={loading}>Save News</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Calendar Events</h2>
          <p className="text-sm text-slate-500">Manage events shown on the News & Events page calendar.</p>
        </div>
        <Button leftIcon={Plus} onClick={() => { setEventFormData({ title: '', description: '', eventDate: '', image: null, examLevel: 'GENERAL' }); setIsEventModalOpen(true); }}>Add Event</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Title</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eventsList.map(event => (
              <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 font-semibold text-slate-800">{event.title}</td>
                <td className="py-4 px-6 text-slate-500 text-sm">
                  {event.eventDate ? new Date(event.eventDate).toLocaleString() : 'N/A'}
                </td>
                <td className="py-4 px-6 text-slate-500 text-sm truncate max-w-xs">{event.description}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditEventClick(event)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isEventModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{eventFormData.id ? 'Edit' : 'Add'} Calendar Event</h3>
                <button onClick={() => setIsEventModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-6">
                <form id="eventForm" onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Title</label>
                    <input type="text" required value={eventFormData.title} onChange={e => setEventFormData({...eventFormData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Date & Time</label>
                    <input type="datetime-local" required value={eventFormData.eventDate} onChange={e => setEventFormData({...eventFormData, eventDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                    <textarea rows="4" required value={eventFormData.description} onChange={e => setEventFormData({...eventFormData, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Exam Level</label>
                    <select value={eventFormData.examLevel} onChange={e => setEventFormData({...eventFormData, examLevel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                      <option value="GENERAL">General (All)</option>
                      <option value="AL">A/L Only</option>
                      <option value="OL">O/L Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setEventFormData({...eventFormData, image: e.target.files[0]})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <Button onClick={() => setIsEventModalOpen(false)} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Cancel</Button>
                <Button type="submit" form="eventForm" isLoading={loading}>Save Event</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Media Gallery Uploads</h2>
          <p className="text-sm text-slate-500">Upload photos and videos to category galleries.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-slate-100 shadow-sm relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center font-bold text-blue-600">Uploading...</div>}
          <CardHeader title="Upload Photos" description="JPEG, PNG up to 5MB" />
          <div className="p-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50 transition-colors relative group">
              <input id="photoInput" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="text-slate-400 group-hover:text-blue-500 mb-4" size={32} />
              <p className="font-semibold text-slate-700">Click or Drag & Drop Photos Here</p>
              {photoFile && <p className="text-sm text-blue-600 mt-2 font-medium">Selected: {photoFile.name}</p>}
            </div>
            
            <div className="mt-4 space-y-4">
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white relative z-20" value={photoAlbum} onChange={(e) => setPhotoAlbum(e.target.value)}>
                <option value="">Select Category...</option>
                <option value="unit_test">Unit Test</option>
                <option value="term_test">Term Test</option>
                <option value="teacher_prog">Teacher Programme</option>
              </select>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white relative z-20" value={photoExamLevel} onChange={(e) => setPhotoExamLevel(e.target.value)}>
                <option value="GENERAL">General (All)</option>
                <option value="AL">A/L</option>
                <option value="OL">O/L</option>
              </select>
              <Button className="w-full" leftIcon={Upload} onClick={() => handleMediaUploadSubmit('photo')} disabled={!photoFile || loading}>
                Upload Photo
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-100 shadow-sm relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center font-bold text-red-600">Uploading...</div>}
          <CardHeader title="Upload Videos" description="MP4, WebM up to 50MB" />
          <div className="p-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-red-50 transition-colors relative group">
              <input id="videoInput" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="text-slate-400 group-hover:text-red-500 mb-4" size={32} />
              <p className="font-semibold text-slate-700">Click or Drag & Drop Videos Here</p>
              {videoFile && <p className="text-sm text-red-600 mt-2 font-medium">Selected: {videoFile.name}</p>}
            </div>

            <div className="mt-4 space-y-4">
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white relative z-20" value={videoAlbum} onChange={(e) => setVideoAlbum(e.target.value)}>
                <option value="">Select Category...</option>
                <option value="unit_test">Unit Test</option>
                <option value="term_test">Term Test</option>
                <option value="extra_act">Extra Activities</option>
              </select>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white relative z-20" value={videoExamLevel} onChange={(e) => setVideoExamLevel(e.target.value)}>
                <option value="GENERAL">General (All)</option>
                <option value="AL">A/L</option>
                <option value="OL">O/L</option>
              </select>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" leftIcon={Upload} onClick={() => handleMediaUploadSubmit('video')} disabled={!videoFile || loading}>
                Upload Video
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  const renderResourcesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource & Paper Management</h2>
          <p className="text-sm text-slate-500">Publish and manage past papers, term test papers, and unit modular evaluations.</p>
        </div>
      </div>

      {/* Upload New Paper / Resource Card */}
      <Card className="border border-slate-100 shadow-sm">
        <div className="p-6">
          <h3 className="text-sm font-black uppercase text-indigo-700 tracking-wider mb-4 flex items-center gap-2">
            <span>📤 Upload New Paper or Syllabus Material</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Title (ප්‍රශ්න පත්‍රයේ මාතෘකාව)</label>
              <input type="text" placeholder="e.g. 2025 AL Accounting 2nd Term Evaluation Paper" value={resourceFormData.title} onChange={e => setResourceFormData({...resourceFormData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Document Type (ප්‍රශ්න පත්‍ර වර්ගය)</label>
              <select value={resourceFormData.resourceType} onChange={e => setResourceFormData({...resourceFormData, resourceType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                <option value="PAST_PAPER">A/L Past Paper (පසුගිය විභාග ප්‍රශ්න පත්‍ර)</option>
                <option value="TERM_TEST">Provincial Term Test Paper (වාර විභාග ප්‍රශ්න පත්‍ර)</option>
                <option value="UNIT_TEST">Unit Test Paper (ඒකක පරීක්ෂණ ප්‍රශ්න පත්‍ර)</option>
                <option value="OTHER_PROVINCE">Other Province Paper (අනෙකුත් පළාත් ප්‍රශ්න පත්‍ර)</option>
                <option value="MARKING_SCHEME">Marking Scheme (ලකුණු ලබාදීමේ පටිපාටිය)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Exam Level (විභාග මට්ටම)</label>
              <select value={resourceFormData.examLevel} onChange={e => setResourceFormData({...resourceFormData, examLevel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                <option value="AL">G.C.E. A/L (උසස් පෙළ)</option>
                <option value="OL">G.C.E. O/L (සාමාන්‍ය පෙළ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject (අදාළ විෂය)</label>
              <select value={resourceFormData.subjectId} onChange={e => setResourceFormData({...resourceFormData, subjectId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Academic Year (අදාළ වසර)</label>
              <input type="number" value={resourceFormData.examYear} onChange={e => setResourceFormData({...resourceFormData, examYear: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Select File (PDF ගොනුව තෝරන්න)</label>
              <input id="resourceFile" type="file" accept=".pdf" onChange={e => setResourceFormData({...resourceFormData, file: e.target.files[0]})} className="w-full px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50" />
            </div>

            {/* Target Audience / Confidentiality Selector */}
            <div className="col-span-1 md:col-span-2 p-4.5 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                🔒 Access Scope & Audience (ප්‍රවේශ බලතල / රහස්‍යතා සීමාව)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  resourceFormData.targetAudience === 'PUBLIC'
                    ? 'border-blue-600 bg-white shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="PUBLIC"
                    checked={resourceFormData.targetAudience === 'PUBLIC'}
                    onChange={() => setResourceFormData({ ...resourceFormData, targetAudience: 'PUBLIC' })}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                      <span>🌐 Public Web & Students</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">Public</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">
                      Visible to all visitors, students, and educators on the Public Portal & Downloads page.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  resourceFormData.targetAudience === 'TEACHERS_ONLY'
                    ? 'border-indigo-600 bg-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="TEACHERS_ONLY"
                    checked={resourceFormData.targetAudience === 'TEACHERS_ONLY'}
                    onChange={() => setResourceFormData({ ...resourceFormData, targetAudience: 'TEACHERS_ONLY' })}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-black text-xs text-indigo-950">
                      <span>🔒 Subject Teacher & Section Head Only</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">Confidential</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">
                      Strictly confidential. Visible strictly to appointed Subject Teachers and Section Heads in their Teacher Console. Hidden from public web.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button leftIcon={Save} onClick={handleResourceUpload} isLoading={loading}>
              Upload & Publish Paper
            </Button>
          </div>
        </div>
      </Card>

      {/* Published Resources List */}
      <Card className="border border-slate-100 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Published Resources & Papers</h3>
              <p className="text-xs text-slate-500">Currently active learning resources in the provincial repository ({resourcesList.length})</p>
            </div>
            <button 
              onClick={fetchResources}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              🔄 Refresh List
            </button>
          </div>

          {resourcesList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No resources uploaded yet. Use the form above to publish papers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-3 px-3">Title & Exam</th>
                    <th className="pb-3 px-3">Subject</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Year / Level</th>
                    <th className="pb-3 px-3">Audience Scope</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resourcesList.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">
                        {res.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {res.subject?.name || 'General Commerce'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {res.resourceType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {res.examYear} • {res.examLevel}
                      </td>
                      <td className="py-3 px-3">
                        {res.targetAudience === 'TEACHERS_ONLY' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            🔒 Teachers & Section Heads Only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            🌐 Public Web
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {res.fileUrl && (
                          <a
                            href={res.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            ⬇️ Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

    const handleSaveHomepageSettings = () => {
    try {
      localStorage.setItem('ncp_homepage_settings', JSON.stringify(homepageSettings));
      Swal.fire({
        icon: 'success',
        title: 'Homepage Settings Saved!',
        text: "Provincial Director's settings, messages, vision, mission, and provincial benchmarks are now updated and live on the public website.",
        timer: 2500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed to save settings' });
    }
  };

  const handleResetHomepageSettings = () => {
    Swal.fire({
      title: 'Reset to System Defaults?',
      text: "This will restore the default Director's message, vision, mission, and provincial benchmarks.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel'
    }).then((res) => {
      if (res.isConfirmed) {
        setHomepageSettings(defaultHomepageSettings);
        localStorage.removeItem('ncp_homepage_settings');
        Swal.fire({ icon: 'success', title: 'Settings reset to defaults', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const renderHomepageTab = () => (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Homepage & Director's Desk CMS</h2>
          <p className="text-sm text-slate-500">
            Control the Provincial Director's official message, Vision, Mission, and public statistics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleResetHomepageSettings}>
            Reset Defaults
          </Button>
          <Button leftIcon={Save} onClick={handleSaveHomepageSettings}>
            Save All Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Director's Desk & Official Message */}
        <Card className="border border-slate-100 shadow-sm lg:col-span-2">
          <CardHeader
            title="Provincial Director's Official Desk"
            description="Manage the featured director portrait, title, and public message on the homepage."
          />
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={homepageSettings.directorPhoto || '/director.jpg'}
                  alt="Provincial Director"
                  className="w-32 h-32 rounded-2xl object-cover shadow-md border-2 border-white mb-3"
                />
                <span className="text-xs font-bold text-slate-600 mb-2">Current Official Portrait</span>
                <input
                  type="text"
                  value={homepageSettings.directorPhoto}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, directorPhoto: e.target.value })}
                  placeholder="/director.jpg"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-mono"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Director's Name</label>
                  <input
                    type="text"
                    value={homepageSettings.directorName}
                    onChange={(e) => setHomepageSettings({ ...homepageSettings, directorName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Official Designation / Role</label>
                  <input
                    type="text"
                    value={homepageSettings.directorRole}
                    onChange={(e) => setHomepageSettings({ ...homepageSettings, directorRole: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Headline</label>
                  <input
                    type="text"
                    value={homepageSettings.directorTitle}
                    onChange={(e) => setHomepageSettings({ ...homepageSettings, directorTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Official Message Quote (English)</label>
                <textarea
                  rows={4}
                  value={homepageSettings.directorQuote}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, directorQuote: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Official Message Quote (Sinhala / සිංහල)</label>
                <textarea
                  rows={4}
                  value={homepageSettings.directorQuoteSi}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, directorQuoteSi: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Vision & Mission Statements */}
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader title="Vision Statement" description="Shown in the Vision & Mission cards and modals." />
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vision (English)</label>
              <textarea
                rows={3}
                value={homepageSettings.vision}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, vision: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vision (Sinhala / සිංහල)</label>
              <textarea
                rows={3}
                value={homepageSettings.visionSi}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, visionSi: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-100 shadow-sm">
          <CardHeader title="Mission Statement" description="Shown in the Vision & Mission cards and modals." />
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mission (English)</label>
              <textarea
                rows={3}
                value={homepageSettings.mission}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, mission: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mission (Sinhala / සිංහල)</label>
              <textarea
                rows={3}
                value={homepageSettings.missionSi}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, missionSi: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </Card>

        {/* 3. Provincial Live Benchmark Statistics */}
        <Card className="border border-slate-100 shadow-sm lg:col-span-2">
          <CardHeader
            title="Provincial Benchmark Statistics Overrides"
            description="Control public-facing headline metrics displayed on the animated counter band."
          />
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Commerce Schools</label>
              <input
                type="number"
                value={homepageSettings.schoolsCount}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, schoolsCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Commerce Students</label>
              <input
                type="number"
                value={homepageSettings.studentsCount}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, studentsCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Certified Teachers</label>
              <input
                type="number"
                value={homepageSettings.teachersCount}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, teachersCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pass Benchmark (%)</label>
              <input
                type="number"
                step="0.1"
                value={homepageSettings.passRate}
                onChange={(e) => setHomepageSettings({ ...homepageSettings, passRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-800"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 text-white">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
          <span>🌐 Public Web CMS & Publishing Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Website Content & Media Management</h1>
        <p className="text-slate-300 text-sm mt-1">
          Manage public-facing website content. Scope restricted to: <span className="font-bold text-amber-300">{currentUser?.location || 'Your Jurisdiction'}</span>
        </p>
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 mt-6 pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'news' && renderNewsTab()}
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'media' && renderMediaTab()}
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'homepage' && renderHomepageTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ContentManagement;
