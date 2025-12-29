
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, Store, Users, Settings, Bell, LogOut, Sun, Moon, MessageSquare, 
  ShieldCheck, ShoppingBag, Search, Filter, CreditCard, PlusCircle, TrendingUp, X, 
  Send, Download, CheckCircle, AlertCircle, Calendar as CalendarIcon, MapPin, Star, ChevronLeft, 
  ChevronRight, Wallet, UserPlus, Trash2, Ban, Volume2, Share2, Eye, BadgeCheck, Handshake,
  BarChart3, PieChart as PieChartIcon, FileText, Image as ImageIcon, Clock, Check, Heart,
  Smartphone, Shield, Zap, Globe, ThumbsUp, Radio, Megaphone, Flag, Award, History,
  Lock, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import { jsPDF } from 'jspdf';
import { UserRole, User, Event, Booking, Notification, ChatMessage, BusinessStatus, Negotiation } from './types';
import { BrandIcon, CATEGORIES, MOCK_EVENTS, CAROUSEL_SLIDES } from './constants';
import { getGeminiChatResponse, generateMarketplaceInsights } from './services/geminiService';

// --- Components ---

const GlossyCard = ({ children, className = "", ...props }: { children?: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`glossy-card p-6 rounded-[2rem] transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const LandingCarousel = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % CAROUSEL_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${CAROUSEL_SLIDES[index].color} opacity-40 mix-blend-multiply z-10`} />
          <img src={CAROUSEL_SLIDES[index].image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-black/40 z-20 flex flex-col justify-center px-12 md:px-24">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mb-6"
            >
              {CAROUSEL_SLIDES[index].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/80 max-w-xl font-medium leading-relaxed"
            >
              {CAROUSEL_SLIDES[index].desc}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-10 right-12 z-30 flex space-x-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'w-12 bg-white' : 'w-2 bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  // Modals & States
  const [paymentModal, setPaymentModal] = useState({ open: false, amount: 0, event: null as Event | null });
  const [seatModal, setSeatModal] = useState({ open: false, event: null as Event | null });
  const [regModal, setRegModal] = useState({ open: false, role: UserRole.CUSTOMER });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data for new features
  const [disputes, setDisputes] = useState([
    { id: 'DIS-1', customer: 'Jane Doe', business: 'Elite Events', reason: 'Unfair cancellation', status: 'PENDING' }
  ]);

  const handleLogin = (role: UserRole) => {
    setUser({
      id: `u_${Math.random().toString(36).substr(2, 5)}`,
      name: role === UserRole.SUPER_ADMIN ? 'Platform Executive' : role === UserRole.ADMIN ? 'System Moderator' : role === UserRole.BUSINESS ? 'Elite Events Co.' : 'Alex Explorer',
      email: `${role.toLowerCase()}@eventhub.com`,
      role,
      avatar: `https://i.pravatar.cc/150?u=${role}`,
      isBanned: false,
      walletBalance: role === UserRole.CUSTOMER ? 1200 : 50000,
      isVerified: role !== UserRole.CUSTOMER,
    });
    setIsAppLaunched(true);
    if (role === UserRole.BUSINESS) fetchAiInsights();
  };

  const fetchAiInsights = async () => {
    try {
      const insights = await generateMarketplaceInsights(events, bookings);
      setAiInsights(insights);
    } catch (e) {
      console.error("AI Insights failed", e);
    }
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    setNotifications(prev => [{ id: Date.now().toString(), title, message, type, timestamp: new Date() }, ...prev]);
  };

  const downloadReceipt = (booking: Booking) => {
    const doc = new jsPDF();
    const event = events.find(e => e.id === booking.eventId);
    doc.setFontSize(22);
    doc.text('EventHub Receipt', 20, 30);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${booking.id}`, 20, 50);
    doc.text(`Event: ${event?.title}`, 20, 60);
    doc.text(`Amount: $${booking.amount.toFixed(2)}`, 20, 70);
    doc.text(`Date: ${new Date(booking.timestamp).toLocaleString()}`, 20, 80);
    doc.save(`receipt-${booking.id}.pdf`);
  };

  const broadcastAlert = (msg: string) => {
    setBroadcastMessage(msg);
    setTimeout(() => setBroadcastMessage(null), 10000);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  // --- Landing View ---
  if (!isAppLaunched) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 overflow-y-auto font-['Plus_Jakarta_Sans'] transition-colors duration-500 pb-20">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 px-6 md:px-20 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BrandIcon className="w-10 h-10" />
            <span className="text-2xl font-black dark:text-white tracking-tighter uppercase italic">EventHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setRegModal({ open: true, role: UserRole.BUSINESS })} className="text-sm font-black text-gray-500 hover:text-blue-600 transition-colors hidden md:block">Host an Event</button>
            <button onClick={() => handleLogin(UserRole.CUSTOMER)} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30">Sign In</button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 pt-12">
          <LandingCarousel />

          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
            <RoleCard icon={Zap} title="Customer" desc="Book tickets, select seats, and negotiate prices instantly." onClick={() => handleLogin(UserRole.CUSTOMER)} />
            <RoleCard icon={Handshake} title="Business" desc="SaaS level control for your events and custom negotiations." onClick={() => handleLogin(UserRole.BUSINESS)} />
            <RoleCard icon={ShieldCheck} title="Moderator" desc="Enforce rules, resolve disputes, and manage identity." onClick={() => handleLogin(UserRole.ADMIN)} />
            <RoleCard icon={Radio} title="Platform Lead" desc="Full stack control, AI engine management, and broadcasts." onClick={() => handleLogin(UserRole.SUPER_ADMIN)} />
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-5xl font-black dark:text-white leading-tight">Scale Your Events <br/><span className="text-blue-600">Without Limits.</span></h3>
              <p className="text-xl text-gray-500 dark:text-gray-400">Our enterprise-grade infrastructure handles everything from localized workshops to international stadium tours.</p>
              <div className="flex space-x-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-950" />)}
                </div>
                <div>
                   <p className="text-sm font-black dark:text-white">Trusted by 10k+ Hosts</p>
                   <p className="text-xs text-gray-400">Global Event Protocol</p>
                </div>
              </div>
            </div>
            <GlossyCard className="bg-blue-600/5 border-blue-600/20 p-10">
               <h4 className="text-2xl font-black dark:text-white mb-6">Request Business Access</h4>
               <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(UserRole.BUSINESS); }}>
                 <input type="text" placeholder="Legal Entity Name" className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none" required />
                 <input type="email" placeholder="Business Email" className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none" required />
                 <div className="flex space-x-4">
                   <select className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none"><option>Music & Ent</option><option>Tech & SaaS</option></select>
                   <button className="flex-1 bg-blue-600 text-white font-black rounded-2xl shadow-xl">Start Onboarding</button>
                 </div>
               </form>
            </GlossyCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans'] transition-colors duration-500">
      
      {/* Broadcast Layer */}
      <AnimatePresence>
        {broadcastMessage && (
          <motion.div initial={{ y: -50 }} animate={{ y: 20 }} exit={{ y: -50 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg px-4">
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-4">
              <Megaphone size={20} className="animate-pulse" /><p className="font-bold flex-1">{broadcastMessage}</p><button onClick={() => setBroadcastMessage(null)}><X size={18}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center space-x-3 mb-12 px-2">
          <BrandIcon className="w-8 h-8" />
          <span className="text-xl font-black dark:text-white tracking-tighter uppercase italic">EventHub</span>
        </div>
        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Pulse" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={Store} label="Market" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
          {user?.role !== UserRole.CUSTOMER && <NavItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />}
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && <NavItem icon={ShieldCheck} label="Moderation" active={activeTab === 'moderation'} onClick={() => setActiveTab('moderation')} />}
          <NavItem icon={ShoppingBag} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <NavItem icon={Wallet} label="Financials" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
          <NavItem icon={UserIcon} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
        <button onClick={() => setIsAppLaunched(false)} className="mt-auto flex items-center space-x-3 p-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all">
          <LogOut size={20} /><span>Sign Out</span>
        </button>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex-1 max-w-xl hidden md:flex items-center bg-gray-100 dark:bg-gray-900 rounded-2xl px-5 py-2.5">
            <Search size={18} className="text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Global search..." className="bg-transparent border-none focus:ring-0 text-sm w-full ml-3 dark:text-white outline-none" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-amber-500 flex items-center space-x-2">
              <Star size={18} fill="currentColor" />
              <span className="text-xs font-black">4.9/5.0 Trust Score</span>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-blue-400">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
          </div>
        </header>

        <div className="p-6 md:p-10 space-y-10">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <DashboardStat icon={TrendingUp} label="Reach" value="2.8M" color="bg-blue-500" />
                 <DashboardStat icon={ShoppingBag} label="Sales" value="4.2k" color="bg-green-500" />
                 <DashboardStat icon={Users} label="Auth Nodes" value="842" color="bg-purple-500" />
                 <DashboardStat icon={AlertCircle} label="Uptime" value="99.9%" color="bg-amber-500" />
               </div>

               {user?.role === UserRole.SUPER_ADMIN && (
                 <GlossyCard className="bg-red-600/5 border-red-600/20">
                    <h3 className="text-xl font-black dark:text-white mb-6 flex items-center"><Megaphone size={20} className="mr-3"/> Global Alert System</h3>
                    <div className="flex space-x-4">
                       <input id="bcInput" type="text" placeholder="Type message for all users..." className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-2xl outline-none" />
                       <button onClick={() => broadcastAlert((document.getElementById('bcInput') as HTMLInputElement).value)} className="px-10 bg-red-600 text-white font-black rounded-2xl shadow-xl">Broadcast Now</button>
                    </div>
                 </GlossyCard>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <GlossyCard className="dark:text-white">
                       <h3 className="text-xl font-black mb-8">Ecosystem Growth</h3>
                       <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={[{n: 'Mon', v: 40}, {n: 'Tue', v: 90}, {n: 'Wed', v: 75}, {n: 'Thu', v: 120}, {n: 'Fri', v: 210}, {n: 'Sat', v: 180}, {n: 'Sun', v: 240}]}>
                                <defs><linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                                <XAxis dataKey="n" hide />
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={1} fill="url(#blueG)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </GlossyCard>
                    <div className="grid grid-cols-2 gap-6">
                       <GlossyCard className="bg-blue-600 text-white">
                          <h4 className="font-bold opacity-80 uppercase text-[10px] tracking-widest mb-2">Platform Wallet</h4>
                          <p className="text-3xl font-black">${user?.walletBalance.toLocaleString()}</p>
                          <button className="mt-4 px-4 py-2 bg-white/20 rounded-xl text-xs font-black">Add Funds</button>
                       </GlossyCard>
                       <GlossyCard className="bg-gray-900 text-white">
                          <h4 className="font-bold opacity-80 uppercase text-[10px] tracking-widest mb-2">Trust Level</h4>
                          <p className="text-3xl font-black flex items-center">Gold <Award className="ml-2 text-yellow-500"/></p>
                          <button className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-xs font-black">View Perks</button>
                       </GlossyCard>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <GlossyCard className="dark:text-white h-full">
                       <h3 className="text-xl font-black mb-8">System Activity</h3>
                       <div className="space-y-6">
                          {notifications.slice(0, 5).map(n => (
                            <div key={n.id} className="flex space-x-4 items-start">
                               <div className={`p-2 rounded-xl bg-opacity-10 ${n.type === 'SUCCESS' ? 'bg-green-500 text-green-500' : 'bg-blue-500 text-blue-500'}`}><Zap size={16}/></div>
                               <div><p className="text-sm font-bold">{n.title}</p><p className="text-[10px] text-gray-400">{n.message}</p></div>
                            </div>
                          ))}
                       </div>
                    </GlossyCard>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div><h2 className="text-3xl font-black dark:text-white tracking-tight">Active Opportunities</h2><p className="text-gray-400">Secure node bookings for verified experiences.</p></div>
                 <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setCategoryFilter('all')} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${categoryFilter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-800'}`}>Global</button>
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${categoryFilter === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-800'}`}>{cat.label}</button>
                    ))}
                 </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {events.filter(e => categoryFilter === 'all' || e.category === categoryFilter).map(event => {
                    const isSoldOut = event.soldSeats >= event.totalSeats;
                    return (
                      <motion.div key={event.id} layout className={`group glossy-card rounded-[2.5rem] overflow-hidden dark:text-white bg-white dark:bg-gray-900 relative ${isSoldOut ? 'opacity-70' : ''}`}>
                        {isSoldOut && <div className="absolute inset-0 bg-black/40 z-30 flex flex-col items-center justify-center p-6 text-center text-white"><Ban size={48} className="mb-4"/><h4 className="text-2xl font-black">Sold Out</h4><button className="mt-4 px-6 py-2 bg-white/20 rounded-xl text-xs font-black backdrop-blur-md">Join Waitlist</button></div>}
                        <div className="h-44 overflow-hidden relative">
                           <img src={event.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                           <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black">${event.price}</div>
                        </div>
                        <div className="p-6">
                           <h4 className="text-lg font-black truncate mb-2">{event.title}</h4>
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center text-[10px] font-bold text-gray-400"><MapPin size={12} className="mr-1"/> Area 51</div>
                              <div className="flex items-center text-amber-500 font-black text-xs"><Star size={12} className="mr-1" fill="currentColor"/> {event.rating}</div>
                           </div>
                           <button onClick={() => setSeatModal({ open: true, event })} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black">Check Availability</button>
                        </div>
                      </motion.div>
                    );
                  })}
               </div>
            </div>
          )}

          {activeTab === 'analytics' && (
             <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black dark:text-white tracking-tight">Market Analytics</h2>
                   {aiInsights && <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center space-x-2 text-xs font-black"><Zap size={16}/><span>AI Optimization Active</span></div>}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <GlossyCard className="dark:text-white">
                      <h3 className="text-xl font-black mb-8">Conversion Funnel</h3>
                      <div className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                               <Tooltip />
                               <Funnel data={[{value: 1000, name: 'Visitors', fill: '#3b82f6'}, {value: 400, name: 'Engaged', fill: '#1d4ed8'}, {value: 150, name: 'Checkout', fill: '#1e40af'}, {value: 80, name: 'Conversions', fill: '#1e3a8a'}]} dataKey="value" nameKey="name" isAnimationActive>
                                  <LabelList position="right" fill="#888" stroke="none" dataKey="name" />
                               </Funnel>
                            </FunnelChart>
                         </ResponsiveContainer>
                      </div>
                   </GlossyCard>
                   <GlossyCard className="dark:text-white">
                      <h3 className="text-xl font-black mb-8">AI Strategic Insights</h3>
                      <div className="space-y-6">
                         <div className="p-6 bg-blue-600/5 rounded-[2rem] border border-blue-600/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Growth Opportunity</p>
                            <p className="text-sm font-bold">{aiInsights?.revenueOpportunity || "Increasing price by 12% on Tech events could yield +$4k/mo based on high demand."}</p>
                         </div>
                         <div className="p-6 bg-purple-600/5 rounded-[2rem] border border-purple-600/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2">Platform Suggestion</p>
                            <p className="text-sm font-bold">{aiInsights?.growthSuggestion || "Launch weekend early-bird specials to boost conversion on high-priced workshops."}</p>
                         </div>
                         <button className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black rounded-2xl text-xs" onClick={fetchAiInsights}>Regenerate Insights</button>
                      </div>
                   </GlossyCard>
                </div>
             </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-10">
               <h2 className="text-3xl font-black dark:text-white tracking-tight">Security & Moderation</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlossyCard className="dark:text-white">
                     <h3 className="text-xl font-black mb-8 flex items-center"><Flag size={20} className="mr-3 text-red-500"/> Dispute Resolution</h3>
                     <div className="space-y-4">
                        {disputes.map(d => (
                          <div key={d.id} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                             <div><p className="text-sm font-black">{d.reason}</p><p className="text-[10px] text-gray-400">By {d.customer} vs {d.business}</p></div>
                             <div className="flex space-x-2">
                                <button className="p-2 bg-green-500/10 text-green-500 rounded-xl"><Check size={16}/></button>
                                <button className="p-2 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={16}/></button>
                             </div>
                          </div>
                        ))}
                     </div>
                  </GlossyCard>
                  <GlossyCard className="dark:text-white">
                     <h3 className="text-xl font-black mb-8 flex items-center"><Shield size={20} className="mr-3 text-blue-500"/> Business Verification</h3>
                     <div className="space-y-4">
                        {[
                          { name: 'Creative Labs', score: 88, status: 'PENDING' },
                          { name: 'Sky High Co.', score: 42, status: 'SUSPICIOUS' }
                        ].map(b => (
                          <div key={b.name} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                             <div><p className="text-sm font-black">{b.name}</p><p className="text-[10px] text-gray-400">Trust Score: {b.score}%</p></div>
                             <button className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl">Review File</button>
                          </div>
                        ))}
                     </div>
                  </GlossyCard>
               </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-10">
               <h2 className="text-3xl font-black dark:text-white tracking-tight">Account Parameters</h2>
               <GlossyCard className="dark:text-white bg-white dark:bg-gray-900">
                  <div className="flex items-center space-x-8 mb-12">
                     <div className="relative group">
                        <img src={user?.avatar} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-blue-600/20" />
                        <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-all flex items-center justify-center"><ImageIcon size={24}/></button>
                     </div>
                     <div>
                        <h4 className="text-2xl font-black">{user?.name}</h4>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                        <div className="mt-4 flex space-x-2">
                           <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{user?.role}</span>
                           {user?.isVerified && <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg uppercase tracking-widest">Verified Identity</span>}
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Legal Name</label>
                        <input type="text" value={user?.name} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Communication Node</label>
                        <input type="email" value={user?.email} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Access</label>
                        <button className="w-full p-4 bg-gray-100 dark:bg-gray-800 text-left rounded-2xl flex items-center justify-between"><span className="text-sm font-bold">Two-Factor Auth</span><Radio size={16}/></button>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Sessions</label>
                        <button className="w-full p-4 bg-gray-100 dark:bg-gray-800 text-left rounded-2xl flex items-center justify-between"><span className="text-sm font-bold">View History</span><History size={16}/></button>
                     </div>
                  </div>
                  <div className="mt-12 flex justify-end space-x-4 border-t border-gray-100 dark:border-gray-800 pt-8">
                     <button className="px-8 py-3 font-bold text-gray-400 hover:text-red-500 transition-all">Deactivate</button>
                     <button onClick={() => addNotification('Profile Updated', 'Cloud parameters sync complete.', 'SUCCESS')} className="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20">Sync Changes</button>
                  </div>
               </GlossyCard>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-10">
               <h2 className="text-3xl font-black dark:text-white tracking-tight">Active Reservations</h2>
               {bookings.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center text-gray-400 opacity-40">
                    <Clock size={64} className="mb-4" /><p className="font-bold">No active reservations detected.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-6">
                    {bookings.map(b => (
                      <GlossyCard key={b.id} className="dark:text-white flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-900 border border-transparent hover:border-blue-500">
                         <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xs">BKD</div>
                            <div>
                               <h4 className="text-xl font-black">{events.find(e => e.id === b.eventId)?.title}</h4>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Ref: {b.id} • Confirmed</p>
                            </div>
                         </div>
                         <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                            <div className="text-right"><p className="text-xl font-black text-green-500">${b.amount.toFixed(2)}</p><p className="text-[10px] text-gray-400 font-bold">Wallet Transaction</p></div>
                            <button onClick={() => downloadReceipt(b)} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Download size={20}/></button>
                         </div>
                      </GlossyCard>
                    ))}
                 </div>
               )}
            </div>
          )}

        </div>

        {/* AI FAB */}
        <div className="fixed bottom-10 right-10 z-[120]">
          <AnimatePresence>{isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} contextData={{ events, bookings, user }} />}</AnimatePresence>
          <motion.button whileHover={{ scale: 1.1, rotate: 5 }} onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white border-4 border-white dark:border-gray-950">
            <MessageSquare size={28} />
          </motion.button>
        </div>
      </main>

      {/* Mobile Nav */}
      <footer className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 p-4 flex justify-around z-50">
        <MobileNavItem icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={Store} active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
        <MobileNavItem icon={ShoppingBag} active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
        <MobileNavItem icon={UserIcon} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </footer>

      {/* Modals */}
      {seatModal.open && <SeatSelector event={seatModal.event} onConfirm={(seats: number[]) => { setSeatModal({ open: false, event: null }); setPaymentModal({ open: true, amount: (seatModal.event?.price || 0) * seats.length, event: seatModal.event }); }} onCancel={() => setSeatModal({ open: false, event: null })} />}
      <PaymentModal isOpen={paymentModal.open} amount={paymentModal.amount} onComplete={() => {
        const b: Booking = { id: `HUB-${Math.random().toString(16).substr(2, 6).toUpperCase()}`, eventId: paymentModal.event?.id!, customerId: user?.id!, status: 'CONFIRMED', amount: paymentModal.amount, timestamp: Date.now(), paymentMethod: 'WALLET' };
        setBookings(prev => [b, ...prev]);
        addNotification('Booking Secure', `System reservation confirmed for ${paymentModal.event?.title}`, 'SUCCESS');
      }} onClose={() => setPaymentModal({ open: false, amount: 0, event: null })} />

    </div>
  );
}

// --- Helpers ---

const RoleCard = ({ icon: Icon, title, desc, onClick }: any) => (
  <GlossyCard onClick={onClick} className="cursor-pointer group hover:border-blue-500 border border-transparent bg-white dark:bg-gray-900">
    <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all"><Icon size={28} /></div>
    <h4 className="text-xl font-black dark:text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
  </GlossyCard>
);

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-white'}`}>
    <Icon size={20} /><span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-3 rounded-2xl ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}><Icon size={24}/></button>
);

const DashboardStat = ({ icon: Icon, label, value, color }: any) => (
  <GlossyCard className="bg-white dark:bg-gray-900">
    <div className="flex items-center justify-between mb-4"><div className={`p-3 rounded-2xl ${color} bg-opacity-10`}><Icon size={20} className={color.replace('bg-', 'text-')} /></div><div className="text-[10px] font-black text-green-500">+14% Growth</div></div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p><p className="text-3xl font-black dark:text-white tracking-tight">{value}</p>
  </GlossyCard>
);

const SeatSelector = ({ event, onConfirm, onCancel }: any) => {
  const [selected, setSelected] = useState<number[]>([]);
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-950 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10"><div><h3 className="text-2xl font-black dark:text-white">Venue Layout</h3><p className="text-sm text-gray-400">{event.title}</p></div><button onClick={onCancel} className="p-2 dark:text-white"><X/></button></div>
        <div className="grid grid-cols-8 gap-3 mb-10">
          {Array.from({ length: 40 }).map((_, i) => (
            <button key={i} onClick={() => selected.includes(i) ? setSelected(selected.filter(s => s !== i)) : setSelected([...selected, i])} className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${selected.includes(i) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-blue-100'}`}>{i+1}</button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-8">
          <div className="text-sm font-black dark:text-white">Total Value: <span className="text-blue-600">${(selected.length * event.price).toFixed(2)}</span></div>
          <button disabled={selected.length === 0} onClick={() => onConfirm(selected)} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl disabled:opacity-50">Confirm {selected.length} Slots</button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentModal = ({ isOpen, amount, onComplete, onClose }: any) => {
  const [step, setStep] = useState(1);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
        {step === 1 ? (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-black dark:text-white">Finalize Order</h3>
            <div className="p-8 bg-blue-600/5 dark:bg-blue-600/10 rounded-[2.5rem] border border-blue-600/20">
               <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest mb-1">Due Amount</p>
               <p className="text-5xl font-black text-blue-600">${amount.toFixed(2)}</p>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30">Authorize Transaction</button>
            <button onClick={onClose} className="text-sm font-bold text-gray-400">Cancel Request</button>
          </div>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40"><CheckCircle size={56}/></div>
            <h3 className="text-3xl font-black dark:text-white">Success</h3>
            <p className="text-gray-400 text-sm">Booking has been hashed to the platform ledger.</p>
            <button onClick={() => { onComplete(); onClose(); }} className="px-12 py-5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black rounded-2xl shadow-xl">Complete</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ChatWindow = ({ onClose, contextData }: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', senderId: 'ai', senderName: 'Concierge', text: 'EventHub AI Core initialized. How can I facilitate your experience today?', timestamp: Date.now(), isAi: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), senderId: 'user', senderName: 'You', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const response = await getGeminiChatResponse(input, contextData);
      setMessages(prev => [...prev, { id: Date.now().toString(), senderId: 'ai', senderName: 'Concierge', text: response || "Analysis complete.", timestamp: Date.now(), isAi: true }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', senderId: 'ai', senderName: 'Concierge', text: "Link error. Check API.", timestamp: Date.now(), isAi: true }]);
    } finally { setLoading(false); }
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-[420px] h-[600px] bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="p-6 bg-blue-600 text-white flex justify-between items-center"><div className="flex items-center space-x-3 font-black tracking-tight"><span>EventHub Concierge</span></div><button onClick={onClose}><X size={20}/></button></div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-hide">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-sm ${m.isAi ? 'bg-white dark:bg-gray-800 dark:text-white shadow-sm' : 'bg-blue-600 text-white font-bold'}`}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex space-x-1 shadow-sm"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
      </div>
      <div className="p-5 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800"><div className="relative flex items-center"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Consult the AI Core..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 px-5 pr-14 text-sm dark:text-white border-none focus:ring-2 focus:ring-blue-600 outline-none" /><button onClick={handleSend} className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl shadow-md"><Send size={18}/></button></div></div>
    </motion.div>
  );
};
