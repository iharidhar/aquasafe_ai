/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CaseManagement from './pages/CaseManagement';
import NewSurvey from './pages/NewSurvey';
import PredictionResult from './pages/PredictionResult';
import SurveyGuide from './pages/SurveyGuide';
import HistoryPage from './pages/HistoryPage';
import VolunteerRegistry from './pages/VolunteerRegistry';
import VolunteerUploads from './pages/VolunteerUploads';
import TrackResponses from './pages/TrackResponses';

// Import Icons
import { 
  Droplet, LayoutDashboard, Clipboard, PlusCircle, BookOpen, 
  History, LogOut, Bell, Menu, X, User, Shield, Clock, MapPin, ChevronDown 
} from 'lucide-react';

// Main Inner App (contains context access)
function DashboardLayout() {
  const { currentUser, logout, activePage, setActivePage, timeline } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) {
    return <LandingPage />;
  }

  // Sidebar Menu Config
  const sidebarItems = currentUser.role === 'admin'
    ? [
        {
          id: 'admin-dashboard',
          label: 'Operational Control',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'volunteer-registry',
          label: 'Volunteer Registry',
          icon: <User className="w-4 h-4" />
        },
        {
          id: 'volunteer-uploads',
          label: 'Volunteer Uploads',
          icon: <Clipboard className="w-4 h-4" />
        }
      ]
    : [
        {
          id: 'volunteer-dashboard',
          label: 'Operational Control',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'case-management',
          label: 'Case Registry',
          icon: <Clipboard className="w-4 h-4" />
        },
        {
          id: 'new-survey',
          label: 'Field Survey Stepper',
          icon: <PlusCircle className="w-4 h-4" />
        },
        {
          id: 'survey-guide',
          label: 'Surveillance Guide',
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          id: 'history',
          label: 'Archived Records',
          icon: <History className="w-4 h-4" />
        },
        {
          id: 'track-responses',
          label: 'Track Responses',
          icon: <Clock className="w-4 h-4" />
        }
      ];

  // Map active page to a clean heading for display
  const getPageTitle = () => {
    switch (activePage) {
      case 'volunteer-dashboard': return 'Surveillance Terminal';
      case 'admin-dashboard': return 'Epidemiological Hub';
      case 'case-management': return 'Case File Registry';
      case 'new-survey': return 'New Water Assessment';
      case 'prediction-result': return 'AI Outbreak Forecast';
      case 'survey-guide': return 'Field Reference Guide';
      case 'history': return 'Archived Case Logs';
      case 'volunteer-registry': return 'Volunteer Credential Registry';
      case 'volunteer-uploads': return 'Volunteer Outbreak Interventions';
      case 'track-responses': return 'Admin Solutions Tracking';
      default: return 'Surveillance Terminal';
    }
  };

  // Render active page component
  const renderActivePage = () => {
    switch (activePage) {
      case 'volunteer-dashboard': return <VolunteerDashboard />;
      case 'admin-dashboard': return <AdminDashboard />;
      case 'case-management': return <CaseManagement />;
      case 'new-survey': return <NewSurvey />;
      case 'prediction-result': return <PredictionResult />;
      case 'survey-guide': return <SurveyGuide />;
      case 'history': return <HistoryPage />;
      case 'volunteer-registry': return <VolunteerRegistry />;
      case 'volunteer-uploads': return <VolunteerUploads />;
      case 'track-responses': return <TrackResponses />;
      default: return currentUser.role === 'admin' ? <AdminDashboard /> : <VolunteerDashboard />;
    }
  };

  return (
    <div className="h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative overflow-hidden dark">
      
      {/* Interactive Glowing Neon Ambient Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/12 blur-[130px] pointer-events-none animate-float" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-purple-500/12 blur-[150px] pointer-events-none animate-float" style={{ animationDuration: '12s', animationDelay: '-4s' }} />
      <div className="absolute top-[35%] right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-float" style={{ animationDuration: '14s', animationDelay: '-7s' }} />
      <div className="absolute bottom-[30%] left-[5%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[110px] pointer-events-none animate-float" style={{ animationDuration: '11s', animationDelay: '-2s' }} />
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090d22]/85 backdrop-blur-md border-b border-slate-800/80 shadow-xs px-4 sm:px-6 h-16 flex items-center justify-between text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        
        {/* Left Side: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 lg:hidden focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
          
          <div className="flex items-center gap-2 select-none" onClick={() => setActivePage(currentUser.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-teal-500 rounded-xl text-white shadow-sm shadow-cyan-600/15 animate-float">
              <Droplet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-black text-slate-800 text-lg leading-none tracking-tight block">AquaSafe <span className="text-cyan-600 font-extrabold text-xs ml-0.5 uppercase tracking-wide">AI</span></span>
              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase leading-none block mt-0.5">District Command</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clock, Location, Alerts, Profile */}
        <div className="flex items-center gap-3.5">
          
          {/* Live UTC Dynamic Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-500 select-none">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
            <span className="text-slate-300">•</span>
            <span>{currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>

          {/* Active Sector Info */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50/50 border border-cyan-100/50 rounded-xl text-xs font-bold text-cyan-800 select-none">
            <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span>Ramanagara Sector 3</span>
          </div>

          {/* Functional Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
              }}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200/50 rounded-xl transition-all cursor-pointer relative"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 z-40 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-xs font-bold font-display text-slate-800">Alert Registry Logs</span>
                      <span className="text-[10px] text-slate-400">Real-time alerts</span>
                    </div>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {timeline.slice(0, 4).map(event => (
                        <div key={event.id} className="text-[11px] space-y-0.5 leading-snug">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700">{event.title}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-500">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3">
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-cyan-500/10 shrink-0 select-none"
            />
            <div className="hidden sm:block leading-none text-left select-none">
              <span className="text-xs font-bold text-slate-700 block">{currentUser.username}</span>
              <span className="text-[9px] font-bold text-slate-400 block mt-0.5 uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Medical Admin' : 'Field Worker'}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Desktop Collapsible Sidebar */}
        <aside className="hidden lg:block w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 text-left h-[calc(100vh-64px)] sticky top-16 overflow-hidden">
          <div className="p-5 flex flex-col justify-between h-full overflow-hidden">
            
            <div className="space-y-6">
              {/* Sidebar Title Info */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase font-mono">Surveillance Workspaces</span>
                <div className="text-xs text-slate-400">Government Portal Panel</div>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map(item => {
                  const isActive = activePage === item.id || (item.id.includes('dashboard') && activePage.includes('dashboard'));
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                      className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-950 to-cyan-900 text-cyan-400 border border-cyan-800/50' 
                          : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Controls / Logout */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase font-mono">
                  <Shield className="w-3.5 h-3.5" /> Outbreak Watch
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  You are viewing the authorized Government health network database. Log out when leaving field terminals.
                </p>
              </div>

              <button
                onClick={logout}
                className="w-full px-4 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Terminal
              </button>
            </div>

          </div>
        </aside>

        {/* Mobile Navigation Drawer menu (AnimatePresence slide) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay Backdrop */}
              <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
              
              {/* Drawer panel */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 z-40 p-5 text-left flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-cyan-500 animate-float" />
                      <span className="font-display font-black text-white text-base">AquaSafe AI</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    {sidebarItems.map(item => {
                      const isActive = activePage === item.id || (item.id.includes('dashboard') && activePage.includes('dashboard'));
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActivePage(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' 
                              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-5">
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Terminal
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Central Workspace Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-6 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Humble Professional Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/50 text-center text-[10px] text-slate-400 font-medium">
            © 2026 Ministry of Public Health, Department of Water Sanitation & Outbreak Biosurveillance. Ramanagara District, India.
          </footer>
        </main>

      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardLayout />
    </AppProvider>
  );
}
