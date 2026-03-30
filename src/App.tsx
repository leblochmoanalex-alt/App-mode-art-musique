import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Search, 
  TrendingUp, 
  User as UserIcon, 
  Music, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Layers,
  ChevronLeft,
  Eye,
  DollarSign,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileCheck,
  LineChart,
  Activity,
  LogOut,
  LogIn,
  Loader2,
  FileText
} from 'lucide-react';
import { PROFILES, UserProfile, ProfileData, ARTISTIC_MAPPINGS, LEXICON } from './types';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType,
  User
} from './firebase';
import { getArtisticMatches, ArtisticMatch } from './services/geminiService';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  setProfile: (p: ProfileData) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, setProfile: () => {} });

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-white text-black font-mono">
          <div className="border-4 border-black p-8 max-w-xl w-full brutal-shadow">
            <h1 className="text-4xl font-black uppercase mb-4 flex items-center gap-2">
              <AlertTriangle size={32} className="text-red-600" /> System Error
            </h1>
            <p className="mb-6 opacity-70">Une erreur critique est survenue dans l'application ARTWORKS.</p>
            <pre className="bg-gray-100 p-4 text-[10px] overflow-auto mb-6 border-2 border-black">
              {JSON.stringify(this.state.error, null, 2)}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white p-4 font-black uppercase hover:bg-gray-800 transition-colors"
            >
              Redémarrer le système
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'login' | 'selection' | 'dashboard'>('landing');
  const [selectedMatch, setSelectedMatch] = useState<ArtisticMatch | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const foundProfile = PROFILES.find(p => p.id === userData.role);
            if (foundProfile) {
              setProfile(foundProfile);
              // If we were at login or selection, move forward
              setView(prev => (prev === 'login' || prev === 'selection') ? 'dashboard' : prev);
            } else {
              setView('selection');
            }
          } else {
            setView('selection');
          }
        } else {
          setProfile(null);
          setView(prev => (prev === 'dashboard' || prev === 'selection') ? 'landing' : prev);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={48} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
        <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
          <AnimatePresence mode="wait">
            {view === 'landing' && (
              <Landing 
                key="landing" 
                onLogin={() => setView('login')}
                onEnterDashboard={(match) => {
                  if (match) setSelectedMatch(match);
                  if (!profile) setView('selection');
                  else setView('dashboard');
                }}
              />
            )}
            {view === 'login' && (
              <Login 
                key="login" 
                onBack={() => setView('landing')}
              />
            )}
            {view === 'selection' && (
              <ProfileSelection 
                key="selection" 
                onBack={() => setView('landing')}
              />
            )}
            {view === 'dashboard' && profile && (
              <Dashboard 
                key="dashboard" 
                profile={profile} 
                onBack={() => setView('landing')} 
                initialMatch={selectedMatch}
              />
            )}
          </AnimatePresence>
        </div>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

function Login({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center relative"
    >
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 font-mono text-[10px] uppercase font-bold hover:bg-black hover:text-white px-4 py-2 border-2 border-black transition-all"
      >
        <ChevronLeft size={14} /> Retour à la recherche
      </button>
      <h1 className="text-[10vw] font-black tracking-tighter leading-[0.8] uppercase mb-12">REJOINDRE ARTWORKS</h1>
      <p className="text-xl max-w-xl mb-12 font-medium opacity-70">
        Connectez-vous pour valider vos choix artistiques, sauvegarder votre profil et accéder au dashboard stratégique.
      </p>
      <button 
        onClick={loginWithGoogle}
        className="flex items-center gap-4 bg-black text-white px-12 py-6 text-xl font-black uppercase tracking-tighter brutal-shadow hover:translate-x-1 hover:-translate-y-1 transition-transform"
      >
        <LogIn size={32} /> Se connecter avec Google
      </button>
      <div className="mt-24 font-mono text-[10px] uppercase tracking-widest opacity-30">
        Gouvernance by Design · Human in the Loop · IA Suno
      </div>
    </motion.div>
  );
}

function ProfileSelection({ onBack }: { onBack: () => void }) {
  const { user, setProfile } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (profileData: ProfileData) => {
    if (!user) {
      setProfile(profileData);
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: profileData.id,
        displayName: user.displayName,
        updatedAt: serverTimestamp()
      });
      setProfile(profileData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 relative"
    >
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 font-mono text-[10px] uppercase font-bold hover:bg-black hover:text-white px-4 py-2 border-2 border-black transition-all"
      >
        <ChevronLeft size={14} /> Retour à la recherche
      </button>
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-12 text-center">Choisissez votre profil</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {PROFILES.map((p) => (
          <button 
            key={p.id}
            disabled={saving}
            onClick={() => handleSelect(p)}
            className="border-4 border-black p-8 text-left hover:bg-black hover:text-white transition-all group brutal-shadow disabled:opacity-50"
          >
            <h3 className="text-3xl font-black uppercase mb-2 group-hover:translate-x-2 transition-transform">{p.title}</h3>
            <p className="opacity-70 leading-tight">{p.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Landing({ onEnterDashboard, onLogin }: { onEnterDashboard: (match?: ArtisticMatch) => void; onLogin: () => void }) {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArtisticMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validatedStyles, setValidatedStyles] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setValidatedStyles([]);

    // Check local mappings first
    const localMatch = Object.entries(ARTISTIC_MAPPINGS).find(([key]) => searchQuery.toLowerCase().includes(key));
    if (localMatch) {
      setSearchResults([localMatch[1]]);
      setIsSearching(false);
      return;
    }

    // Otherwise use Gemini
    try {
      const matches = await getArtisticMatches(searchQuery);
      setSearchResults(matches);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleValidate = async (match: ArtisticMatch) => {
    if (!user) {
      // Trigger login flow by calling onEnterDashboard which checks for user
      onEnterDashboard(match);
      return;
    }
    try {
      await addDoc(collection(db, 'validations'), {
        uid: user.uid,
        style: match.style,
        query: searchQuery,
        timestamp: serverTimestamp()
      });
      setValidatedStyles(prev => [...prev, match.style]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'validations');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 max-w-7xl mx-auto w-full"
    >
      <header className="text-center mb-12 w-full">
        <div className="flex justify-between items-center mb-8 h-8">
          {user ? (
            <>
              <div className="font-mono text-[10px] uppercase font-bold opacity-50">User: {user.email}</div>
              <button onClick={logout} className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold hover:text-red-600 transition-colors">
                <LogOut size={12} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <div className="font-mono text-[10px] uppercase font-bold opacity-50">Mode Invité</div>
              <button 
                onClick={onLogin} 
                className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold hover:bg-black hover:text-white px-3 py-1 border-2 border-black transition-all"
              >
                <LogIn size={12} /> Se connecter
              </button>
            </>
          )}
        </div>
        
        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[12vw] font-black tracking-tighter leading-[0.8] uppercase mb-12"
        >
          ARTWORKS
        </motion.h1>
        
        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto w-full group">
          <input 
            type="text" 
            placeholder="RECHERCHER UN GENRE OU UNE MARQUE..."
            className="w-full text-2xl md:text-4xl font-black uppercase tracking-tighter p-8 border-4 border-black focus:bg-black focus:text-white transition-all outline-none placeholder:opacity-20 brutal-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-white hover:opacity-100 transition-opacity">
            {isSearching ? <Loader2 className="animate-spin" size={40} /> : <Search size={40} />}
          </button>
        </form>
      </header>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
          >
            {searchResults.map((match, idx) => (
              <div key={idx} className="flex flex-col border-4 border-black brutal-shadow group bg-white">
                <div className="aspect-square relative overflow-hidden border-b-4 border-black">
                  <img 
                    src={`https://picsum.photos/seed/${match.imageSeed}/800/800?grayscale`} 
                    alt={match.style}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-black p-3 font-mono text-[10px] font-bold uppercase flex justify-between items-center">
                    <span className="flex items-center gap-2"><Sparkles size={10} /> Option {idx + 1}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Match Artistique</span>
                      {validatedStyles.includes(match.style) ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-green-600 uppercase font-bold">
                          <CheckCircle2 size={12} /> Validé
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-600 uppercase font-bold">
                          <AlertTriangle size={12} /> À valider
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 leading-none">{match.style}</h2>
                    <p className="text-sm opacity-80 leading-tight mb-4">{match.description}</p>
                    
                    <div className="mb-6 p-3 bg-gray-50 border-2 border-black border-dashed">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] uppercase opacity-50">Estimation de Valeur (IA)</span>
                        <span className="font-mono text-[10px] font-bold">
                          {(match.pricingFactors.rarity * 100 + match.pricingFactors.notoriety * 150 + match.pricingFactors.dataVolume * 50 - match.pricingFactors.carbon * 20).toLocaleString()} €
                        </span>
                      </div>
                      <div className="h-1 w-full bg-gray-200">
                        <div 
                          className="h-full bg-black transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (match.pricingFactors.notoriety + match.pricingFactors.rarity) / 2)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleValidate(match)}
                    className={`w-full px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors ${validatedStyles.includes(match.style) ? 'bg-black text-white' : 'bg-white text-black border-2 border-black hover:bg-black hover:text-white'}`}
                  >
                    {validatedStyles.includes(match.style) ? <CheckCircle2 size={16} /> : <UserIcon size={16} />}
                    {validatedStyles.includes(match.style) ? 'Validé (HITL)' : 'Valider ce style'}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {searchResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12"
        >
          <button 
            onClick={() => onEnterDashboard()}
            className="bg-black text-white px-12 py-6 font-black uppercase text-xl tracking-tighter brutal-shadow flex items-center gap-4 hover:translate-x-1 hover:-translate-y-1 transition-transform"
          >
            Accéder au Dashboard Stratégique <ArrowRight size={24} />
          </button>
        </motion.div>
      )}

      <footer className="mt-auto pt-16 w-full flex justify-between items-end font-mono text-[10px] uppercase tracking-widest opacity-30">
        <div>© 2026 · ARTWORKS SYSTEM</div>
        <div className="text-right">7 152 TRACKS · IA SUNO · STRATÉGIE CONSOLIDÉE</div>
      </footer>
    </motion.div>
  );
}

function Dashboard({ profile, onBack, initialMatch }: { profile: ProfileData; onBack: () => void; initialMatch: ArtisticMatch | null }) {
  const [activeModule, setActiveModule] = useState<'search' | 'pricing' | 'ethics' | 'bias' | 'community' | 'profile' | 'report'>('search');
  const [juryMode, setJuryMode] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ArtisticMatch | null>(initialMatch);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col"
    >
      <nav className="border-b-4 border-black p-6 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center text-sm font-black uppercase tracking-tighter hover:bg-black hover:text-white px-4 py-2 border-2 border-black transition-all"
          >
            <ChevronLeft size={20} className="mr-1" /> Retour
          </button>
          <button 
            onClick={() => setJuryMode(!juryMode)}
            className={`hidden lg:flex items-center gap-2 text-[10px] font-mono uppercase font-bold px-3 py-1 border-2 border-black transition-all ${juryMode ? 'bg-yellow-400' : 'bg-white opacity-50'}`}
          >
            {juryMode ? <ShieldCheck size={12} /> : <Zap size={12} />} Jury Mode
          </button>
        </div>
        <div className="text-2xl font-black tracking-tighter uppercase">
          {profile.title} <span className="opacity-30">/</span> Dashboard
        </div>
        <div className="hidden md:flex gap-2 font-mono text-[10px] font-bold uppercase">
          <span className="border-2 border-black px-2 py-1">Status: Online</span>
          <span className="bg-black text-white px-2 py-1">Mode: PoC v1.0</span>
        </div>
      </nav>

      {juryMode && (
        <div className="bg-yellow-400 border-b-4 border-black p-4 font-mono text-[10px] font-bold uppercase flex justify-center gap-8 overflow-x-auto whitespace-nowrap">
          <span>Focus : Transformation Numérique</span>
          <span>•</span>
          <span>Gouvernance by Design</span>
          <span>•</span>
          <span>Human in the Loop</span>
          <span>•</span>
          <span>Ethique IA</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="lg:w-80 border-r-4 border-black p-8 bg-gray-50 flex flex-col gap-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 opacity-50">Modules IA</h3>
          <ModuleButton 
            active={activeModule === 'search'} 
            onClick={() => setActiveModule('search')}
            icon={<Search size={18} />}
            label="Cross-Navigator"
          />
          <ModuleButton 
            active={activeModule === 'pricing'} 
            onClick={() => setActiveModule('pricing')}
            icon={<DollarSign size={18} />}
            label="Pricing IA"
          />
          <ModuleButton 
            active={activeModule === 'ethics'} 
            onClick={() => setActiveModule('ethics')}
            icon={<Scale size={18} />}
            label="Gouvernance"
          />
          <ModuleButton 
            active={activeModule === 'bias'} 
            onClick={() => setActiveModule('bias')}
            icon={<ShieldCheck size={18} />}
            label="Détection de Biais"
          />
          <ModuleButton 
            active={activeModule === 'community'} 
            onClick={() => setActiveModule('community')}
            icon={<Activity size={18} />}
            label="Communauté (HITL)"
          />
          <ModuleButton 
            active={activeModule === 'profile'} 
            onClick={() => setActiveModule('profile')}
            icon={<UserIcon size={18} />}
            label={`Espace ${profile.title}`}
          />
          <ModuleButton 
            active={activeModule === 'report'} 
            onClick={() => setActiveModule('report')}
            icon={<FileText size={18} />}
            label="Générer Rapport"
          />

          <div className="mt-auto pt-8 border-t-2 border-black">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 opacity-50">Contexte Projet (EMBA)</h3>
            <div className="space-y-4">
              <div className="p-3 bg-black text-white text-[10px] font-mono leading-tight">
                Transformation Numérique : Mode & Art.
                Focus : Gouvernance IA & HITL.
              </div>
              <p className="text-[10px] font-bold italic leading-tight opacity-70">
                "{profile.message}"
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeModule === 'search' && (
              <SearchModule 
                key="search" 
                onSelectMatch={(match) => {
                  setSelectedMatch(match);
                  setActiveModule('pricing');
                }} 
              />
            )}
            {activeModule === 'pricing' && <PricingModule key="pricing" initialData={selectedMatch?.pricingFactors} />}
            {activeModule === 'ethics' && <EthicsModule key="ethics" />}
            {activeModule === 'bias' && <BiasModule key="bias" />}
            {activeModule === 'community' && <CommunityModule key="community" />}
            {activeModule === 'report' && <ReportModule key="report" profile={profile} selectedMatch={selectedMatch} />}
            {activeModule === 'profile' && <ProfileSpace profile={profile} key="profile" />}
          </AnimatePresence>

          <section className="mt-20 pt-12 border-t-4 border-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase opacity-50">Insight Spotify</p>
              <p className="text-xl font-black leading-tight uppercase tracking-tighter">{profile.spotifyInsight}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase opacity-50">Point de Bascule</p>
              <p className="text-4xl font-black tracking-tighter">2015</p>
              <p className="text-[10px] font-mono uppercase opacity-50">Fast-Fashion & NFTs</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase opacity-50">Prédiction 2030</p>
              <p className="text-4xl font-black tracking-tighter">45%</p>
              <p className="text-[10px] font-mono uppercase opacity-50">Création assistée par IA</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase opacity-50">Popularité Moyenne</p>
              <p className="text-4xl font-black tracking-tighter">23.5 <span className="text-sm opacity-30">/ 30</span></p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t-2 border-black border-dashed">
            <h3 className="text-[10px] font-mono font-bold uppercase opacity-30 mb-4 tracking-[0.5em]">Lexique Stratégique</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {LEXICON.map((item, i) => (
                <div key={i} className="group cursor-help">
                  <span className="text-[10px] font-black uppercase border-b border-black/20 group-hover:border-black transition-colors">{item.term}</span>
                  <div className="hidden group-hover:block absolute bg-white border-2 border-black p-4 brutal-shadow max-w-xs z-30 text-[10px] font-bold uppercase leading-tight mt-1">
                    {item.definition}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  );
}

function SearchModule({ onSelectMatch }: { onSelectMatch?: (match: ArtisticMatch) => void }) {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArtisticMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validatedStyles, setValidatedStyles] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setValidatedStyles([]);
    try {
      const matches = await getArtisticMatches(searchQuery);
      setSearchResults(matches);
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback to static mapping if Gemini fails
      const lowerQuery = searchQuery.toLowerCase();
      const fallback = Object.entries(ARTISTIC_MAPPINGS).find(([k]) => lowerQuery.includes(k));
      if (fallback) {
        setSearchResults([{
          ...fallback[1],
          pricingFactors: { rarity: 60, notoriety: 80, dataVolume: 40, carbon: 15 }
        }]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleValidate = async (match: ArtisticMatch) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'validations'), {
        uid: user.uid,
        style: match.style,
        query: searchQuery,
        timestamp: serverTimestamp()
      });
      setValidatedStyles(prev => [...prev, match.style]);
      if (onSelectMatch) onSelectMatch(match);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'validations');
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl"
    >
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Cross-Navigator</h2>
      <form onSubmit={handleSearch} className="relative mb-12">
        <input 
          type="text" 
          placeholder="Ex: Techno, Balenciaga, Hip Hop, Gucci..."
          className="w-full text-3xl font-black uppercase tracking-tighter p-6 border-4 border-black focus:bg-black focus:text-white transition-all outline-none placeholder:opacity-20 brutal-shadow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100">
          {isSearching ? <Loader2 className="animate-spin" size={32} /> : <Search size={32} />}
        </button>
      </form>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {searchResults.map((match, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-4 border-black p-6 bg-black text-white brutal-shadow relative overflow-hidden flex flex-col justify-between min-h-[400px]"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-50">Option {idx + 1}</span>
                  {validatedStyles.includes(match.style) && (
                    <span className="flex items-center gap-2 text-[10px] font-mono text-green-400 uppercase">
                      <CheckCircle2 size={12} /> Validé
                    </span>
                  )}
                </div>
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none">{match.style}</h3>
                <p className="text-sm opacity-80 leading-tight mb-8">{match.description}</p>
                
                {!validatedStyles.includes(match.style) && (
                  <button 
                    onClick={() => handleValidate(match)}
                    className="bg-white text-black px-4 py-2 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors mt-auto"
                  >
                    <UserIcon size={14} /> Valider
                  </button>
                )}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none">
                <img 
                  src={`https://picsum.photos/seed/${match.imageSeed}/800/800?grayscale`} 
                  className="w-full h-full object-cover grayscale contrast-150"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : searchQuery && !isSearching && (
        <div className="p-10 border-4 border-black border-dashed opacity-30 text-center">
          <p className="font-mono uppercase font-bold">Aucun courant artistique identifié.</p>
        </div>
      )}
    </motion.section>
  );
}

function ModuleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border-2 border-black font-bold uppercase text-xs tracking-tighter transition-all ${active ? 'bg-black text-white brutal-shadow' : 'hover:bg-gray-200'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PricingModule({ initialData }: { initialData?: ArtisticMatch['pricingFactors'] }) {
  const [rarity, setRarity] = useState(initialData?.rarity ?? 50);
  const [notoriety, setNotoriety] = useState(initialData?.notoriety ?? 70);
  const [dataVolume, setDataVolume] = useState(initialData?.dataVolume ?? 30);
  const [carbon, setCarbon] = useState(initialData?.carbon ?? 10);

  // Update state if initialData changes
  useEffect(() => {
    if (initialData) {
      setRarity(initialData.rarity);
      setNotoriety(initialData.notoriety);
      setDataVolume(initialData.dataVolume);
      setCarbon(initialData.carbon);
    }
  }, [initialData]);

  const price = useMemo(() => {
    return (rarity * 100 + notoriety * 150 + dataVolume * 50 - carbon * 20);
  }, [rarity, notoriety, dataVolume, carbon]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Simulateur de Pricing IA</h2>
      <div className="border-4 border-black p-8 space-y-6">
        <PricingSlider label="Rareté Algorithmique" value={rarity} onChange={setRarity} />
        <PricingSlider label="Notoriété de l'Artiste" value={notoriety} onChange={setNotoriety} />
        <PricingSlider label="Volume de Données" value={dataVolume} onChange={setDataVolume} />
        <PricingSlider label="Empreinte Carbone (Impact Négatif)" value={carbon} onChange={setCarbon} />
        
        <div className="pt-8 border-t-4 border-black flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase opacity-50">Estimation de Valeur</p>
            <p className="text-7xl font-black tracking-tighter">{price.toLocaleString()} €</p>
          </div>
          <div className="text-right w-full md:w-auto">
            <div className="p-4 bg-gray-100 border-2 border-black text-[10px] font-mono uppercase font-bold text-left">
              <p className="mb-1">Facteurs d'ajustement :</p>
              <ul className="space-y-1 opacity-70">
                <li>• Rareté : +{(rarity * 100).toLocaleString()}€</li>
                <li>• Notoriété : +{(notoriety * 150).toLocaleString()}€</li>
                <li>• Data : +{(dataVolume * 50).toLocaleString()}€</li>
                <li>• Carbone : -{(carbon * 20).toLocaleString()}€</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function PricingSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="font-mono text-[10px] uppercase font-bold">{label}</label>
        <span className="font-mono text-[10px] font-bold">{value}%</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-4 bg-gray-200 appearance-none border-2 border-black cursor-pointer accent-black"
      />
    </div>
  );
}

function EthicsModule() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Gouvernance by Design</h2>
      <div className="space-y-8">
        <div className="border-4 border-black p-8 bg-black text-white brutal-shadow">
          <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-3">
            <Eye size={24} /> 1. Transparence Explicable
          </h3>
          <p className="opacity-80 leading-tight">
            Toute décision ou action de l'IA doit être traçable, justifiable et compréhensible par un humain. 
            Expliquer pourquoi une recommandation est faite, conserver les sources et documenter les limites.
          </p>
        </div>

        <div className="border-4 border-black p-8 brutal-shadow">
          <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-3">
            <ShieldCheck size={24} /> 2. Conformité & Protection
          </h3>
          <p className="opacity-70 leading-tight">
            Les exigences réglementaires (AI Act, RGPD) sont intégrées dès la conception. 
            Privacy-by-design, data minimization et contrôle d'accès automatique dans les pipelines.
          </p>
        </div>

        <div className="border-4 border-black p-8 brutal-shadow">
          <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-3">
            <UserIcon size={24} /> 3. Responsabilités & Contrôle Humain
          </h3>
          <p className="opacity-70 leading-tight">
            Définition claire des rôles (RACI). L'humain reste maître de ses pensées et envies. 
            Seuils de risque déclenchant une validation humaine obligatoire et présence d'un "Kill Switch".
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function BiasModule() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Détection de Biais</h2>
      <div className="border-4 border-black p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-4 h-4 bg-red-600 animate-ping" />
          <p className="font-mono font-bold uppercase text-red-600">Alerte : Biais de morphologie détecté</p>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase text-sm">Diversité Culturelle</span>
            <span className="font-mono text-xs font-bold">CRITIQUE (12%)</span>
          </div>
          <div className="h-4 w-full bg-gray-100 border-2 border-black">
            <div className="h-full bg-black w-[12%]" />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase text-sm">Inclusion Morphologique</span>
            <span className="font-mono text-xs font-bold">FAIBLE (28%)</span>
          </div>
          <div className="h-4 w-full bg-gray-100 border-2 border-black">
            <div className="h-full bg-black w-[28%]" />
          </div>
        </div>
        <p className="mt-8 text-xs opacity-50 italic">
          Note : Le style de chaque maison de mode varie en fonction du client. L'IA doit s'adapter sans exclure.
        </p>
      </div>
    </motion.section>
  );
}

function CommunityModule() {
  const [validations, setValidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValidations = async () => {
      try {
        const { getDocs, query, orderBy, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'validations'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setValidations(docs);
      } catch (error) {
        console.error("Error fetching validations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchValidations();
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Flux de Validation (HITL)</h2>
      <p className="mb-8 opacity-70 font-mono text-sm uppercase tracking-widest">
        Données réelles issues de l'interaction humaine avec l'IA. 
        Preuve du concept "Human in the Loop" (HITL).
      </p>

      {loading ? (
        <div className="flex items-center gap-4 p-8 border-4 border-black border-dashed">
          <Loader2 className="animate-spin" size={24} />
          <span className="font-mono uppercase font-bold">Synchronisation des données...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {validations.map((v, i) => (
            <div key={v.id || i} className="border-4 border-black p-6 flex justify-between items-center bg-white brutal-shadow">
              <div>
                <p className="text-xs font-mono font-bold uppercase opacity-50 mb-1">Requête : {v.query}</p>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{v.style}</h3>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-600 font-black uppercase text-xs mb-1">
                  <CheckCircle2 size={14} /> Validé
                </div>
                <p className="text-[10px] font-mono opacity-50">
                  {v.timestamp?.toDate ? v.timestamp.toDate().toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>
          ))}
          {validations.length === 0 && (
            <div className="p-12 border-4 border-black border-dashed text-center opacity-30">
              <p className="font-mono uppercase font-bold">Aucune validation enregistrée pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}

function ProfileSpace({ profile }: { profile: ProfileData }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Espace {profile.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-4 border-black p-8 bg-black text-white brutal-shadow">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-6 opacity-50 flex items-center gap-2">
            <Activity size={14} /> KPIs Prioritaires
          </h3>
          <div className="space-y-4">
            {profile.kpis.map((kpi, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-sm font-bold uppercase">{kpi}</span>
                <span className="font-mono text-xs">{(Math.random() * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {profile.id === 'curious' && (
          <div className="border-4 border-black p-8 brutal-shadow">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-6 opacity-50 flex items-center gap-2">
              <BookOpen size={14} /> Lexique Pédagogique
            </h3>
            <div className="space-y-4">
              {LEXICON.map((item, i) => (
                <div key={i}>
                  <p className="text-sm font-black uppercase mb-1">{item.term}</p>
                  <p className="text-[10px] opacity-70 leading-tight">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.id === 'collector' && (
          <div className="border-4 border-black p-8 brutal-shadow flex flex-col items-center justify-center text-center">
            <FileCheck size={64} className="mb-6" />
            <h3 className="text-xl font-black uppercase mb-2">Certificat d'Authenticité</h3>
            <p className="text-[10px] font-mono uppercase opacity-50 mb-6">Blockchain ID: 0x7152...A30</p>
            <div className="w-full p-4 border-2 border-black border-dashed font-mono text-[10px]">
              Provenance IA Suno Certifiée // 2026
            </div>
          </div>
        )}

        {profile.id === 'investor' && (
          <div className="border-4 border-black p-8 brutal-shadow">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-6 opacity-50 flex items-center gap-2">
              <LineChart size={14} /> Volatilité & Côtes
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-xs font-bold uppercase">Indice de Volatilité</p>
                <p className="text-3xl font-black text-red-600">+14.2%</p>
              </div>
              <div className="h-20 w-full flex items-end gap-1">
                {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-black" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-[10px] opacity-50 italic">Côte par œuvre : Analyse prédictive active.</p>
            </div>
          </div>
        )}

        {profile.id === 'amateur' && (
          <div className="border-4 border-black p-8 brutal-shadow bg-gray-100">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-6 opacity-50">Attention & Conversion</h3>
            <div className="space-y-4">
              <p className="text-sm font-bold leading-tight">
                L'engagement sur les courants "Street-Futurisme" a augmenté de 22% ce mois-ci.
              </p>
              <div className="p-4 border-2 border-black bg-white">
                <p className="text-[10px] font-mono uppercase opacity-50 mb-2">Top Interaction</p>
                <p className="text-lg font-black tracking-tighter uppercase">Scroll Infini / Mode IA</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function ReportModule({ profile, selectedMatch }: { profile: ProfileData; selectedMatch: ArtisticMatch | null }) {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        uid: user?.uid || 'guest',
        email,
        profileId: profile.id,
        style: selectedMatch?.style || 'General',
        timestamp: serverTimestamp(),
        pricingFactors: selectedMatch?.pricingFactors || null
      });
      setIsSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-20"
      >
        <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 brutal-shadow">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">Rapport Envoyé</h2>
        <p className="text-xl font-medium opacity-70 mb-12">
          Votre analyse stratégique personnalisée a été envoyée à <span className="font-black border-b-2 border-black">{email}</span>.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest brutal-shadow hover:translate-x-1 hover:-translate-y-1 transition-transform"
        >
          Nouvelle Analyse
        </button>
      </motion.section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <h2 className="text-6xl font-black tracking-tighter uppercase mb-2 leading-none">Générer le Rapport</h2>
        <p className="text-xl font-medium opacity-50 uppercase tracking-widest">Consolidation Stratégique Finale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className="border-4 border-black p-8 brutal-shadow bg-white">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-6 opacity-50">Résumé de l'Analyse</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase opacity-50 mb-1">Profil Utilisateur</p>
              <p className="text-2xl font-black uppercase tracking-tighter">{profile.title}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase opacity-50 mb-1">Style Artistique Sélectionné</p>
              <p className="text-2xl font-black uppercase tracking-tighter">{selectedMatch?.style || 'Non spécifié'}</p>
            </div>
            {selectedMatch && (
              <div className="pt-6 border-t-2 border-black border-dashed">
                <p className="text-[10px] font-mono uppercase opacity-50 mb-4">Indicateurs de Valeur</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 border-2 border-black">
                    <p className="text-[10px] font-mono uppercase opacity-50">Rareté</p>
                    <p className="text-xl font-black">{selectedMatch.pricingFactors.rarity}%</p>
                  </div>
                  <div className="p-3 bg-gray-50 border-2 border-black">
                    <p className="text-[10px] font-mono uppercase opacity-50">Notoriété</p>
                    <p className="text-xl font-black">{selectedMatch.pricingFactors.notoriety}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-mono font-bold uppercase tracking-widest block">
                Votre adresse email pour recevoir le rapport complet
              </label>
              <input 
                type="email" 
                required
                placeholder="EMAIL@EXAMPLE.COM"
                className="w-full p-6 border-4 border-black text-2xl font-black uppercase tracking-tighter outline-none focus:bg-black focus:text-white transition-all brutal-shadow placeholder:opacity-20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="p-6 bg-yellow-400 border-4 border-black font-mono text-[10px] font-bold uppercase leading-tight brutal-shadow">
              En générant ce rapport, vous acceptez que vos données de navigation soient utilisées pour affiner nos algorithmes de prédiction culturelle (HITL).
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-8 bg-black text-white font-black uppercase text-2xl tracking-tighter brutal-shadow hover:translate-x-1 hover:-translate-y-1 transition-transform disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={32} /> : <FileText size={32} />}
              Générer & Envoyer
            </button>
          </form>
        </div>
      </div>

      <div className="border-t-4 border-black pt-8 flex justify-between items-center opacity-30 font-mono text-[10px] uppercase tracking-widest">
        <span>Artworks System v1.0</span>
        <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
      </div>
    </motion.section>
  );
}
