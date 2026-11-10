import React, { useState } from 'react';

// --- TYPES & INTERFACES ---

type ViewState = 'dashboard' | 'theory' | 'practice';
type ModalType = 'success' | 'error' | 'warning' | 'info' | null;

interface Email {
  id: number;
  sender: string;
  subject: string;
  date: string;
  isPhishing: boolean;
  redFlags?: string[];
  content: React.ReactNode;
}

interface ModalState {
  type: ModalType;
  data: Email | null;
  message?: string; // Used for generic info messages (e.g., safe links)
}

interface LeaderboardUser {
  id: number;
  name: string;
  points: number;
  rank: string;
}

interface Module {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'locked';
}

// --- INLINE SVG ICONS (Replaces lucide-react) ---

const Icon = ({ name, className = "w-5 h-5" }: { name: string, className?: string }) => {
  switch (name) {
    case 'shield': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
    case 'alert': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
    case 'check': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
    case 'lock': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
    case 'mail': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    case 'chevron-right': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>;
    case 'user': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    case 'trophy': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4h10M6 4v5a6 6 0 0 0 12 0V4M4 4h2M18 4h2M4 9h2M18 9h2"></path></svg>;
    case 'play': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
    case 'arrow-left': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
    case 'mail-open': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>;
    case 'crosshair': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>;
    case 'info': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
    default: return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>;
  }
};

// --- MOCK DATA ---

const LEADERBOARD: LeaderboardUser[] = [
  { id: 1, name: 'Sarah Connor', points: 1250, rank: 'Elite Guardian' },
  { id: 2, name: 'Neo Anderson', points: 1100, rank: 'Senior Defender' },
  { id: 3, name: 'Alex Ambers', points: 450, rank: 'Junior Defender' },
];

const MODULES: Module[] = [
  { id: 1, title: 'Fake Invoice', status: 'completed' },
  { id: 2, title: 'Password Expiry', status: 'completed' },
  { id: 3, title: 'Phishing', status: 'active' },
  { id: 4, title: 'Ransomware Attachments', status: 'locked' },
  { id: 5, title: 'Wi-Fi Security', status: 'locked' },
  { id: 6, title: 'USB Drops', status: 'locked' },
  { id: 7, title: 'Social Engineering', status: 'locked' },
];

const EMAILS: Email[] = [
  {
    id: 1,
    sender: 'HR Department <hr@company.internal>',
    subject: 'Monthly Newsletter: November',
    date: '10:00 AM',
    isPhishing: false,
    content: (
      <div className="space-y-4">
        <p>Hi Team,</p>
        <p>Welcome to November! Here are some highlights from last month and what to look forward to:</p>
        <ul className="list-disc pl-5">
          <li>Q3 All-Hands Meeting recording is now available.</li>
          <li>New cafeteria menu launching next week.</li>
          <li>Open enrollment for benefits begins on the 15th.</li>
        </ul>
        <div className="py-4 flex justify-start">
          {/* Using a data attribute to pass the info message, and the safe-button class for interaction mapping */}
          <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded safe-button" data-message="Navigating to internal HR portal...">
            View Newsletter on Intranet
          </button>
        </div>
        <p>Best,<br/>The HR Team</p>
      </div>
    )
  },
  {
    id: 2,
    sender: 'IT Support <support-admin@it-company-helpdesk.com>', // Spoofed domain
    subject: 'URGENT: Reset IT Password Within 2 Hours',
    date: '10:15 AM',
    isPhishing: true,
    redFlags: ['External/Spoofed Sender Domain', 'Sense of extreme urgency', 'Suspicious login link'],
    content: (
      <div className="space-y-4">
        <p>Dear User,</p>
        <p>We detected unusual login activity on your corporate account from an unrecognized device.</p>
        <p className="text-red-600 font-semibold">To prevent immediate account suspension, you must verify your identity and reset your password within the next 2 hours.</p>
        <div className="py-4 flex justify-center">
          {/* The trap-button class acts as the hook for the phishing failure */}
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg trap-button">
            Click Here to Verify Account
          </button>
        </div>
        <p>Failure to comply will result in a temporary lockout pending manual HR review.</p>
        <p>Regards,<br/>IT Administration Desk</p>
      </div>
    )
  },
  {
    id: 3,
    sender: 'Sarah Jenkins <s.jenkins@company.internal>',
    subject: 'Lunch at 1?',
    date: '10:30 AM',
    isPhishing: false,
    content: (
      <div className="space-y-4">
        <p>Hey Alex,</p>
        <p>Are we still on for lunch today? Thinking about grabbing tacos from that place down the street.</p>
        <div className="py-2">
          <button className="text-blue-600 underline hover:text-blue-800 safe-button" data-message="Opening Google Maps for 'Taco Palace'...">
            Link to the restaurant
          </button>
        </div>
        <p>Let me know!<br/>Sarah</p>
      </div>
    )
  },
  {
    id: 4,
    sender: 'Accounting <invoices@secure-billing-corp.net>', // Phishing
    subject: 'Invoice #8493 - Overdue Payment',
    date: '11:00 AM',
    isPhishing: true,
    redFlags: ['Generic sender domain', 'Unsolicited invoice', 'Vague details requiring you to open the link'],
    content: (
      <div className="space-y-4">
        <p>Hello,</p>
        <p>Please find attached the invoice for services rendered in October. This payment is now 3 days overdue.</p>
        <p>To avoid late fees, please process this immediately.</p>
        <div className="py-4 flex justify-start">
          <button className="px-4 py-2 border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded flex items-center gap-2 trap-button">
            <Icon name="mail" className="w-4 h-4" /> Download Invoice_8493.pdf
          </button>
        </div>
        <p>Thank you,<br/>Accounts Receivable</p>
      </div>
    )
  },
  {
    id: 5,
    sender: 'Calendar <calendar@company.internal>',
    subject: 'Invitation: Weekly Sync @ Thursday 2pm',
    date: '12:10 PM',
    isPhishing: false,
    content: (
      <div className="space-y-4">
        <p>You have been invited to a meeting.</p>
        <p><strong>Title:</strong> Weekly Sync<br/>
        <strong>Time:</strong> Thursday, 2:00 PM - 3:00 PM<br/>
        <strong>Location:</strong> Room 4B / Zoom</p>
        <div className="flex gap-4 py-2">
          <button className="px-4 py-1 bg-green-100 text-green-800 rounded font-semibold safe-button" data-message="Event accepted. Added to your calendar.">Accept</button>
          <button className="px-4 py-1 bg-red-100 text-red-800 rounded font-semibold safe-button" data-message="Event declined.">Decline</button>
        </div>
      </div>
    )
  },
  {
    id: 6,
    sender: 'Facilities <facilities@company.internal>',
    subject: 'Office Fridge Cleaning on Friday',
    date: '2:15 PM',
    isPhishing: false,
    content: (
      <div className="space-y-4">
        <p>Friendly reminder!</p>
        <p>The breakroom refrigerators will be deep-cleaned this Friday at 5:00 PM. Please remove any personal containers or food items before then.</p>
        <p>Anything left behind will be thrown away.</p>
        <p>Thank you,<br/>Facilities Management</p>
      </div>
    )
  }
];


// --- COMPONENT ---

export default function Sentinel() {
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [score, setScore] = useState<number>(450);
  const [completedModules, setCompletedModules] = useState<number[]>([1, 2]);
  
  // Exercise State
  const [activeEmailId, setActiveEmailId] = useState<number>(EMAILS[0].id);
  const [modalState, setModalState] = useState<ModalState>({ type: null, data: null });

  const activeEmail: Email | undefined = EMAILS.find(e => e.id === activeEmailId);

  // Handlers
  const handleStartTheory = () => {
    setViewState('theory');
  };

  const handleStartPractice = () => {
    setViewState('practice');
    setActiveEmailId(EMAILS[0].id);
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Check if the user clicked a trap link
    if (target.closest('.trap-button')) {
      if (activeEmail) {
        setModalState({ type: 'error', data: activeEmail });
      }
    } 
    // Check if the user clicked a safe link
    else if (target.closest('.safe-button')) {
      const safeBtn = target.closest('.safe-button');
      const message = safeBtn?.getAttribute('data-message') || 'Navigating to safe site...';
      setModalState({ type: 'info', data: null, message });
    }
  };

  const handleReportPhishing = () => {
    if (!activeEmail) return;

    if (activeEmail.isPhishing) {
      setModalState({ type: 'success', data: activeEmail });
    } else {
      setModalState({ type: 'warning', data: activeEmail });
    }
  };

  const handleCloseModal = () => {
    if (modalState.type === 'success') {
      if (!completedModules.includes(3)) {
        setScore(prev => prev + 50);
        setCompletedModules(prev => [...prev, 3]);
      }
      setViewState('dashboard');
    }
    setModalState({ type: null, data: null });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="relative">
            <div className="text-green-400"><Icon name="shield" className="w-8 h-8" /></div>
            <div className="absolute inset-0 bg-green-400 blur-md opacity-20 rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Sen<span className="text-blue-500">tinel</span></h1>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8 overflow-y-auto">
          {/* User Profile */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-blue-500 flex items-center justify-center text-xl font-bold text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                AA
              </div>
              <div>
                <h2 className="text-slate-100 font-semibold">Alex Ambers</h2>
                <p className="text-xs text-blue-400 uppercase tracking-wide">Junior Defender</p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-950 rounded-lg p-3 border border-slate-800">
              <span className="text-sm text-slate-400">Total Score</span>
              <span className="text-lg font-mono font-bold text-green-400 flex items-center gap-1">
                <Icon name="crosshair" className="w-4 h-4" /> {score}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu</p>
            <button 
              onClick={() => setViewState('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${viewState === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-[inset_4px_0_0_rgba(59,130,246,1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Icon name="alert" />
              <span>Training Hub</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 cursor-not-allowed opacity-50">
              <Icon name="trophy" />
              <span>Global Rankings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 cursor-not-allowed opacity-50">
              <Icon name="user" />
              <span>My Profile</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* VIEW: DASHBOARD */}
        {viewState === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <header className="mb-10">
              <h2 className="text-3xl font-bold text-slate-100 mb-2">Welcome back, Alex.</h2>
              <p className="text-slate-400">Ready to hunt some threats today?</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area (Modules) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Progress Card */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">Active Curriculum</h3>
                      <p className="text-sm text-slate-400">Phishing & Social Engineering Core</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-400">{completedModules.length}</span>
                      <span className="text-slate-500"> / {MODULES.length} Completed</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 relative z-10 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${(completedModules.length / MODULES.length) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>

                {/* Modules Grid */}
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <span className="text-blue-500"><Icon name="alert" /></span> Tactical Modules
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MODULES.map((mod) => {
                      const isCompleted = completedModules.includes(mod.id);
                      const isActive = mod.id === (completedModules.length + 1);
                      const isLocked = mod.id > (completedModules.length + 1);

                      return (
                        <div 
                          key={mod.id} 
                          className={`
                            relative rounded-xl p-5 border transition-all duration-300
                            ${isCompleted ? 'bg-slate-900 border-green-500/30' : ''}
                            ${isActive ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-pointer hover:bg-blue-900/30 group' : ''}
                            ${isLocked ? 'bg-slate-900/50 border-slate-800 opacity-60' : ''}
                          `}
                          onClick={isActive ? handleStartTheory : undefined}
                        >
                          {isActive && (
                            <div className="absolute -inset-[1px] rounded-xl border border-blue-400 animate-pulse pointer-events-none"></div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              {isCompleted && <span className="text-green-400"><Icon name="check" className="w-6 h-6" /></span>}
                              {isActive && <span className="text-blue-400 fill-blue-400/20 group-hover:scale-110 transition-transform"><Icon name="play" className="w-6 h-6" /></span>}
                              {isLocked && <span className="text-slate-600"><Icon name="lock" className="w-6 h-6" /></span>}
                              <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-green-500' : isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                                  Module 0{mod.id}
                                </span>
                                <h4 className={`font-semibold mt-1 ${isCompleted || isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                                  {mod.title}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            {isCompleted && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Verified</span>}
                            {isActive && <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow-lg transition-colors flex items-center gap-1">Initiate <Icon name="chevron-right" className="w-3 h-3"/></button>}
                            {isLocked && <span className="text-xs text-slate-500 uppercase">Locked</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar / Leaderboard */}
              <div className="space-y-8">
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <span className="text-yellow-500"><Icon name="trophy" /></span> Company Leaderboard
                  </h3>
                  <div className="space-y-4">
                    {LEADERBOARD.map((user, idx) => (
                      <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border ${user.id === 3 ? 'bg-blue-900/10 border-blue-500/30' : 'bg-slate-950 border-slate-800'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-slate-300/20 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${user.id === 3 ? 'text-blue-400' : 'text-slate-200'}`}>{user.name} {user.id === 3 && '(You)'}</p>
                            <p className="text-xs text-slate-500">{user.rank}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-green-400 font-bold">{user.points}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: THEORY BRIEFING */}
        {viewState === 'theory' && (
          <div className="flex-1 flex flex-col h-full bg-slate-950 animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full p-8 lg:p-12">
              <button 
                onClick={() => setViewState('dashboard')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors mb-8"
              >
                <Icon name="arrow-left" className="w-4 h-4" /> Back to Dashboard
              </button>
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                <div className="p-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-6">
                    <span className="text-blue-500"><Icon name="mail-open" className="w-8 h-8" /></span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-100 mb-2 uppercase tracking-wide">Intel Briefing</h2>
                  <h3 className="text-xl text-blue-400 mb-8 font-mono border-b border-slate-800 pb-6">Threat Vector: Phishing</h3>
                  
                  <div className="space-y-6 text-slate-300 text-base leading-relaxed mb-10">
                    <p>
                      Phishing remains the number one vector for corporate breaches. Cybercriminals use fraudulent emails to manipulate employees into initiating unauthorized wire transfers, downloading ransomware, or handing over sensitive login credentials.
                    </p>
                    
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                      <h4 className="font-bold text-slate-100 mb-4 flex items-center gap-2 text-lg">
                        <span className="text-red-400"><Icon name="alert" /></span> Primary Red Flags to Memorize
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex gap-3 items-start">
                          <span className="text-red-500 mt-1"><Icon name="crosshair" className="w-5 h-5" /></span>
                          <div>
                            <strong className="text-slate-200 block mb-1">Mismatched or Spoofed Domains</strong>
                            <span className="text-sm text-slate-400">The sender display name might look legitimate (e.g., "IT Support"), but inspecting the actual email address reveals a fake domain like <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-red-300">support@it-company-helpdesk.com</code>.</span>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start">
                          <span className="text-red-500 mt-1"><Icon name="crosshair" className="w-5 h-5" /></span>
                          <div>
                            <strong className="text-slate-200 block mb-1">Sense of Extreme Urgency</strong>
                            <span className="text-sm text-slate-400">Demands immediate action to bypass your critical thinking ("Your account will be suspended in 2 hours!").</span>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start">
                          <span className="text-red-500 mt-1"><Icon name="crosshair" className="w-5 h-5" /></span>
                          <div>
                            <strong className="text-slate-200 block mb-1">Suspicious Links or Attachments</strong>
                            <span className="text-sm text-slate-400">Unsolicited invoices or requests to log in to verify your identity via embedded links.</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button 
                      onClick={handleStartPractice}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                      Start Simulation <Icon name="play" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PRACTICE SIMULATION */}
        {viewState === 'practice' && (
          <div className="flex-1 flex flex-col h-full bg-slate-950 animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 shrink-0">
              <button 
                onClick={() => setViewState('dashboard')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <Icon name="arrow-left" className="w-4 h-4" /> Abort Mission
              </button>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-blue-400 bg-blue-950 px-3 py-1 rounded border border-blue-900">
                  Target: Identify Phishing
                </span>
              </div>
            </div>

            {/* Inbox Simulator */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              {/* Left Pane: Email List */}
              <div className="w-full md:w-2/5 border-r border-slate-800 flex flex-col overflow-y-auto bg-slate-900/50">
                <div className="p-3 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <Icon name="mail" className="w-4 h-4 text-slate-400" /> Inbox
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{EMAILS.length}</span>
                </div>
                <div className="flex-1 divide-y divide-slate-800/50">
                  {EMAILS.map(email => (
                    <button
                      key={email.id}
                      onClick={() => setActiveEmailId(email.id)}
                      className={`w-full text-left p-4 transition-colors hover:bg-slate-800/50 ${activeEmailId === email.id ? 'bg-slate-800 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`font-semibold truncate text-sm ${activeEmailId === email.id ? 'text-blue-100' : 'text-slate-300'}`}>
                          {email.sender.split(' <')[0]}
                        </h4>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">{email.date}</span>
                      </div>
                      <p className={`text-xs truncate ${activeEmailId === email.id ? 'text-blue-300/80 font-medium' : 'text-slate-400'}`}>
                        {email.subject}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Pane: Email Viewer */}
              <div className="w-full md:w-3/5 flex flex-col bg-[#0f172a] relative">
                {activeEmail ? (
                  <>
                    {/* Viewer Header Actions */}
                    <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="mail-open" className="w-4 h-4" />
                        <span className="text-sm font-medium">Message Viewer</span>
                      </div>
                      <button 
                        onClick={handleReportPhishing}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-3 py-1.5 rounded text-sm font-semibold transition-all shadow-sm group"
                      >
                        <span className="group-hover:animate-pulse"><Icon name="alert" className="w-4 h-4" /></span>
                        Report Phishing
                      </button>
                    </div>
                    
                    {/* Email Headers */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900/30">
                      <h2 className="text-xl font-bold text-slate-100 mb-4">{activeEmail.subject}</h2>
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                        <span className="text-slate-500 text-right">From:</span>
                        <span className="text-slate-300 font-mono bg-slate-800/50 px-2 py-0.5 rounded w-fit select-all">{activeEmail.sender}</span>
                        
                        <span className="text-slate-500 text-right">To:</span>
                        <span className="text-slate-400">Alex Ambers &lt;a.ambers@company.internal&gt;</span>
                        
                        <span className="text-slate-500 text-right">Date:</span>
                        <span className="text-slate-400">Today, {activeEmail.date}</span>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div 
                      className="p-8 flex-1 overflow-y-auto text-slate-900 bg-white" 
                      onClick={handleContentClick}
                    >
                      <div className="max-w-2xl text-[15px] leading-relaxed font-sans">
                        {activeEmail.content}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    Select an email to read
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- MODALS OVERLAY --- */}
        {modalState.type && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/70 animate-in fade-in zoom-in duration-200">
            
            {/* FAILURE MODAL */}
            {modalState.type === 'error' && (
              <div className="max-w-lg w-full bg-slate-950 border-2 border-red-600 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
                <div className="p-8 text-center">
                  <div className="mx-auto w-20 h-20 bg-red-950 rounded-full flex items-center justify-center border border-red-500/30 mb-6 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                    <span className="text-red-500 animate-pulse"><Icon name="alert" className="w-10 h-10" /></span>
                  </div>
                  <h2 className="text-3xl font-black text-red-500 mb-2 tracking-widest uppercase">System Compromised</h2>
                  <p className="text-slate-300 mb-6">
                    You interacted with a malicious element. In reality, attackers would have just stolen credentials or infected your network.
                  </p>
                  
                  {modalState.data?.redFlags && (
                    <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-4 text-left mb-8">
                      <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                        <Icon name="crosshair" className="w-4 h-4" /> Missed Red Flags:
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-red-200/90 space-y-2">
                        {modalState.data.redFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button 
                    onClick={handleCloseModal}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl border border-slate-600 transition-colors uppercase tracking-wide"
                  >
                    Acknowledge & Try Again
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS MODAL */}
            {modalState.type === 'success' && (
              <div className="max-w-lg w-full bg-slate-950 border-2 border-green-500 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                
                <div className="p-8 text-center relative z-10">
                  <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-6 relative">
                    <div className="absolute inset-0 rounded-full border border-green-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
                    <span className="text-green-400"><Icon name="shield" className="w-12 h-12" /></span>
                  </div>
                  
                  <h2 className="text-3xl font-black text-green-400 mb-2 tracking-widest uppercase">Threat Neutralized</h2>
                  <p className="text-slate-300 mb-6">
                    Outstanding work. You successfully identified the phishing attempt and protected the corporate network.
                  </p>
                  
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-8 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Reward Earned</p>
                      <p className="text-lg font-bold text-slate-100">Bounty Claimed</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-mono font-black text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                        +50
                      </span>
                      <span className="text-green-500/80 ml-1">pts</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCloseModal}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] uppercase tracking-wide"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* WARNING MODAL (False Positive on Report) */}
            {modalState.type === 'warning' && (
              <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                <div className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-yellow-500"><Icon name="info" className="w-8 h-8" /></span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">False Alarm</h3>
                  <p className="text-slate-400 mb-6 text-sm">
                    This email is legitimate internal communication. No threat detected. However, maintaining a cautious mindset is always encouraged.
                  </p>
                  <button 
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700"
                  >
                    Return to Inbox
                  </button>
                </div>
              </div>
            )}

            {/* INFO MODAL (Safe Link Clicked) */}
            {modalState.type === 'info' && (
              <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <div className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-blue-400"><Icon name="info" className="w-6 h-6" /></span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Action Confirmed</h3>
                  <p className="text-slate-400 mb-6 text-sm">
                    {modalState.message}
                  </p>
                  <button 
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700 w-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}