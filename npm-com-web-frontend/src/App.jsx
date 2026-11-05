import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/Home/HomePage';
import DistrictPage from './pages/Districts/DistrictPage';
import ZonesExplorer from './pages/Zones/ZonesExplorer';
import Login from './pages/Auth/Login';
import ResultsExplorer from './pages/Explore/ResultsExplorer';
import StudentsExplorer from './pages/Explore/StudentsExplorer';
import ResourcesExplorer from './pages/Explore/ResourcesExplorer';
import SubjectsPage from './pages/Subjects/SubjectsPage';
import MediaGallery from './pages/Media/MediaGallery';
import DownloadsPage from './pages/Downloads/DownloadsPage';
import NewsEventsPage from './pages/NewsEvents/NewsEventsPage';
import ContactPage from './pages/Contact/ContactPage';
import SchoolProfilePage from './pages/Schools/SchoolProfilePage';
import RankingsLeaderboardPage from './pages/Rankings/RankingsLeaderboardPage';
import DashboardLayout from './layouts/DashboardLayout';
import StudentStats from './pages/DataEntry/StudentStats';
import TeacherStats from './pages/DataEntry/TeacherStats';
import ResultsEntry from './pages/DataEntry/ResultsEntry';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import Committees from './pages/Committees/Committees';
import ResourceRepo from './pages/Downloads/ResourceRepo';
import UserManagement from './pages/Dashboard/UserManagement';
import ContentManagement from './pages/Dashboard/ContentManagement';
import LocationManagement from './pages/Dashboard/LocationManagement';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public home page and other public pages — visible to everyone */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/zones" element={<ZonesExplorer />} />
            <Route path="/districts/:id" element={<DistrictPage />} />
            <Route path="/explore/results" element={<ResultsExplorer />} />
            <Route path="/explore/students" element={<StudentsExplorer />} />
            <Route path="/explore/resources" element={<ResourcesExplorer />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/media/:type" element={<MediaGallery />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/news-events" element={<NewsEventsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/schools/:id" element={<SchoolProfilePage />} />
            <Route path="/rankings" element={<RankingsLeaderboardPage />} />
          </Route>

          {/* Login page without public layout */}
          <Route path="/login" element={<Login />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AnalyticsDashboard />} />
            <Route path="students" element={<StudentStats />} />
            <Route 
              path="teachers" 
              element={
                <RoleRoute allowedRoles={['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'ADMIN']}>
                  <TeacherStats />
                </RoleRoute>
              } 
            />
            <Route path="results" element={<ResultsEntry />} />
            <Route path="schools" element={<div className="p-4 text-slate-500">Schools Overview (Coming Soon)</div>} />
            <Route 
              path="committees" 
              element={
                <RoleRoute allowedRoles={['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'ADMIN']}>
                  <Committees />
                </RoleRoute>
              } 
            />
            <Route path="resources" element={<ResourceRepo />} />
            <Route 
              path="users" 
              element={
                <RoleRoute allowedRoles={['PROVINCIAL_DIRECTOR', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR', 'PRINCIPAL', 'ADMIN']}>
                  <UserManagement />
                </RoleRoute>
              } 
            />
            <Route 
              path="locations" 
              element={
                <RoleRoute allowedRoles={['PROVINCIAL_DIRECTOR', 'ADMIN', 'ZONAL_DIRECTOR', 'DIVISIONAL_DIRECTOR']}>
                  <LocationManagement />
                </RoleRoute>
              } 
            />
            <Route 
              path="content" 
              element={
                <RoleRoute allowedRoles={['PROVINCIAL_DIRECTOR', 'ADMIN']}>
                  <ContentManagement />
                </RoleRoute>
              } 
            />
          </Route>

        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;