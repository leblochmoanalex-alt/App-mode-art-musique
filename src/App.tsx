import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Palette, 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  User, 
  History, 
  Info, 
  Loader2, 
  Sparkles,
  ExternalLink,
  Plus,
  Check
} from 'lucide-react';
import { 
  MusicGenre, 
  Mood, 
  Brand, 
  UserPreferences, 
  MoodMuseState, 
  GENRES, 
  BRANDS, 
  MOODS, 
  BRAND_DATA 
} from './types';
import { 
  musicCuratorAgent, 
  artMatcherAgent, 
  tasteExplainerAgent, 
  isGeminiEnabled 
} from './services/gemini';

// --- Components ---

const LandingPage = ({ onStart }: { onStart: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="h-screen flex flex-col items-center justify-center text-center px-6"
  >
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center"
    >
      <img 
        src="https://res.cloudinary.com/dn4ouiabs/image/upload/v1775565162/Anneau_elliptique_minimaliste_lumineux_sp5iaf.png" 
        alt="NEXUS Logo" 
        className="w-32 h-32 mb-8 object-contain invert"
        referrerPolicy="no-referrer"
      />
      <h1 className="text-7xl md:text-9xl font-serif font-black mb-6 tracking-tighter text-gradient">
        NEXUS
      </h1>
      <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto font-light">
        AI Taste Explorer — Where music meets visual art and brand identity.
      </p>
      <button 
        onClick={onStart}
        className="button-premium text-lg group flex items-center gap-3"
      >
        Explorer mon univers
        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
    
    <div className="absolute bottom-12 flex gap-8 opacity-40 text-xs uppercase tracking-widest">
      <div className="flex items-center gap-2"><Music size={14} /> Music Analysis</div>
      <div className="flex items-center gap-2"><Palette size={14} /> Art Matching</div>
      <div className="flex items-center gap-2"><Zap size={14} /> Brand Influence</div>
    </div>
  </motion.div>
);

const Onboarding = ({ onComplete }: { onComplete: (prefs: UserPreferences) => void }) => {
  const [step, setStep] = useState(1);
  const [artists, setArtists] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<MusicGenre[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else if (selectedMood && selectedBrand) {
      onComplete({
        selectedArtists: artists.split(",").map(s => s.trim()).filter(s => s),
        selectedGenres,
        selectedMood,
        selectedBrand
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
    >
      <div className="max-w-4xl w-full">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Step 0{step} / 04</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold">
              {step === 1 && "Who are your favorite artists?"}
              {step === 2 && "Which genres do you vibe with?"}
              {step === 3 && "What's your current mood?"}
              {step === 4 && "Choose a brand universe."}
            </h2>
          </div>
          <button 
            onClick={handleNext}
            disabled={
              (step === 2 && selectedGenres.length === 0) ||
              (step === 3 && !selectedMood) ||
              (step === 4 && !selectedBrand)
            }
            className="button-premium disabled:opacity-20 flex items-center gap-2"
          >
            {step === 4 ? "Generate Universe" : "Next"}
            <ChevronRight size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <textarea 
                value={artists}
                onChange={(e) => setArtists(e.target.value)}
                placeholder="Drake, The Weeknd, Radiohead..."
                className="w-full bg-transparent border-b-2 border-white/10 py-4 text-2xl md:text-4xl outline-none focus:border-white transition-colors h-32 resize-none"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {GENRES.map(g => (
                <button 
                  key={g}
                  onClick={() => setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                  className={`p-6 rounded-2xl border transition-all text-left ${selectedGenres.includes(g) ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/40'}`}
                >
                  {g}
                </button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MOODS.map(m => (
                <button 
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`p-6 rounded-2xl border transition-all text-left ${selectedMood === m ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/40'}`}
                >
                  {m}
                </button>
              ))}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {BRANDS.map(b => (
                <button 
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`p-6 rounded-2xl border transition-all text-left ${selectedBrand === b ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/40'}`}
                >
                  <div className="font-bold mb-1">{b}</div>
                  <div className="text-[10px] uppercase opacity-60">{BRAND_DATA[b].uiStyle}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ state, onSelect }: { state: MoodMuseState, onSelect: () => void }) => {
  if (!state.analysis || !state.artMatch || !state.brandInfluence) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-32 pb-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-4">Your AI-Generated Universe</h2>
            <h3 className="text-5xl md:text-7xl font-serif font-black">
              {state.analysis.mood} {state.analysis.genre}
            </h3>
          </div>
          <div className="flex gap-4">
            {!isGeminiEnabled && (
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/40">
                Simulation Mode
              </div>
            )}
            <div 
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: state.brandInfluence.accentColor, color: state.brandInfluence.accentColor === '#FFFFFF' ? '#000' : '#fff' }}
            >
              {state.brandInfluence.name} Vibe
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Art Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="md:col-span-8 premium-card rounded-3xl overflow-hidden cursor-pointer group"
            onClick={onSelect}
          >
            <div className="relative aspect-[16/9]">
              <img 
                src={state.artMatch.imageUrl} 
                alt={state.artMatch.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Selected Masterpiece</div>
                <h4 className="text-4xl font-serif font-bold">{state.artMatch.title}</h4>
                <p className="text-white/60 italic">by {state.artMatch.artist}</p>
              </div>
              <div className="absolute top-8 right-8 glass p-4 rounded-full">
                <Sparkles size={24} />
              </div>
            </div>
          </motion.div>

          {/* Analysis Sidebar */}
          <div className="md:col-span-4 space-y-8">
            <div className="premium-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6 text-white/40">
                <Music size={18} />
                <span className="text-xs uppercase tracking-widest">Music Curator Agent</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase opacity-40 mb-1">Dominant Genre</div>
                  <div className="text-xl font-bold">{state.analysis.genre}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase opacity-40 mb-1">Energy Level</div>
                  <div className="text-xl font-bold">{state.analysis.energy}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  {state.analysis.tags.map(t => (
                    <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="premium-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6 text-white/40">
                <Zap size={18} />
                <span className="text-xs uppercase tracking-widest">Brand Influence</span>
              </div>
              <p className="text-lg font-serif italic leading-relaxed opacity-80">
                "{state.brandInfluence.vibe}"
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-bold">
                  {state.brandInfluence.name[0]}
                </div>
                <div className="text-xs uppercase tracking-widest opacity-40">
                  UI: {state.brandInfluence.uiStyle}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exploration Libre Section */}
        <div className="mt-20">
          <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-8">Exploration Libre</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Techno x Balenciaga", desc: "Cyber-Brutalism exploration", icon: <Zap size={20} /> },
              { title: "Ambient x Aesop", desc: "Soft Minimalism journey", icon: <Palette size={20} /> },
              { title: "Jazz x Yohji Yamamoto", desc: "Poetic Darkness study", icon: <Music size={20} /> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="premium-card p-8 rounded-3xl cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white/40 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-white/40">{item.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Launch <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailView = ({ state, onBack }: { state: MoodMuseState, onBack: () => void }) => {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getExpl = async () => {
      if (state.analysis && state.artMatch && state.brandInfluence) {
        const text = await tasteExplainerAgent(state.analysis, state.artMatch, state.brandInfluence.name);
        setExplanation(text);
        setLoading(false);
      }
    };
    getExpl();
  }, [state]);

  if (!state.artMatch) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <div className="fixed top-8 left-8 z-50">
        <button onClick={onBack} className="button-outline flex items-center gap-2">
          <ChevronRight className="rotate-180" size={20} />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div className="relative h-[60vh] md:h-screen overflow-hidden">
          <img 
            src={state.artMatch.imageUrl} 
            alt={state.artMatch.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        <div className="p-12 md:p-24 flex flex-col justify-center">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.4em] text-white/40 mb-4 block">Taste Explainer Agent</span>
            <h2 className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight">
              {state.artMatch.title}
            </h2>
            
            <div className="space-y-12">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">The Connection</h3>
                {loading ? (
                  <div className="flex items-center gap-3 text-white/40">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating explanation...</span>
                  </div>
                ) : (
                  <p className="text-2xl md:text-3xl font-serif italic leading-relaxed text-white/90">
                    "{explanation}"
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Style</h4>
                  <div className="text-lg">{state.artMatch.style}</div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Artist</h4>
                  <div className="text-lg">{state.artMatch.artist}</div>
                </div>
              </div>

              <div className="flex gap-4">
                {state.artMatch.colors.map(c => (
                  <div key={c} className="w-12 h-12 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Profile = ({ state, onBack }: { state: MoodMuseState, onBack: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="min-h-screen pt-32 px-6"
  >
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-5xl font-serif font-bold">Your Profile</h2>
        <button onClick={onBack} className="button-outline">Close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="premium-card p-8 rounded-3xl text-center">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-4">Current Vibe</div>
          <div className="text-3xl font-serif">{state.analysis?.mood || "None"}</div>
        </div>
        <div className="premium-card p-8 rounded-3xl text-center">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-4">Brand Influence</div>
          <div className="text-3xl font-serif">{state.brandInfluence?.name || "None"}</div>
        </div>
        <div className="premium-card p-8 rounded-3xl text-center">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-4">Explorations</div>
          <div className="text-3xl font-serif">{state.history.length}</div>
        </div>
      </div>

      <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-8">Exploration History</h3>
      <div className="space-y-4">
        {state.history.map((h, i) => (
          <div key={i} className="premium-card p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden">
                <img src={h.artMatch.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="font-bold">{h.analysis.genre}</div>
                <div className="text-xs opacity-40">{h.artMatch.title}</div>
              </div>
            </div>
            <div className="text-xs uppercase tracking-widest opacity-40">{h.brandInfluence.name}</div>
          </div>
        ))}
        {state.history.length === 0 && (
          <div className="text-center py-20 text-white/20 italic">No history yet.</div>
        )}
      </div>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard' | 'detail' | 'profile'>('landing');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<MoodMuseState>({
    preferences: null,
    analysis: null,
    artMatch: null,
    brandInfluence: null,
    history: []
  });

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setLoading(true);
    setView('dashboard');

    try {
      // Agent 1: Music Curator
      const analysis = await musicCuratorAgent(prefs.selectedArtists, prefs.selectedGenres, prefs.selectedMood);
      
      // Agent 2: Art Matcher
      const artMatch = await artMatcherAgent(analysis, prefs.selectedBrand);
      
      // Brand Influence
      const brandInfluence = BRAND_DATA[prefs.selectedBrand];

      setState(prev => ({
        ...prev,
        preferences: prefs,
        analysis,
        artMatch,
        brandInfluence,
        history: [{ analysis, artMatch, brandInfluence }, ...prev.history]
      }));
    } catch (error) {
      console.error("Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Global Header */}
      {view !== 'landing' && view !== 'onboarding' && (
        <nav className="fixed top-0 left-0 w-full z-[100] glass px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <img 
              src="https://res.cloudinary.com/dn4ouiabs/image/upload/v1775565162/Anneau_elliptique_minimaliste_lumineux_sp5iaf.png" 
              alt="NEXUS Logo" 
              className="w-8 h-8 object-contain invert"
              referrerPolicy="no-referrer"
            />
            <div className="text-xl font-serif font-black tracking-tighter">
              NEXUS
            </div>
          </div>
          <div className="flex gap-6 items-center">
            <button 
              onClick={() => setView('profile')}
              className="text-xs uppercase tracking-widest hover:text-white/60 transition-colors flex items-center gap-2"
            >
              <User size={14} /> Profile
            </button>
            <button 
              onClick={() => setView('onboarding')}
              className="px-4 py-2 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/80 transition-all"
            >
              New Exploration
            </button>
          </div>
        </nav>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <Loader2 className="animate-spin mb-6 text-white" size={48} strokeWidth={1} />
            <div className="text-center">
              <h3 className="text-2xl font-serif italic mb-2">Agents are working...</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Analyzing tastes • Matching art • Influencing brand
              </p>
            </div>
          </motion.div>
        )}

        {view === 'landing' && <LandingPage key="landing" onStart={() => setView('onboarding')} />}
        
        {view === 'onboarding' && <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />}
        
        {view === 'dashboard' && state.analysis && (
          <Dashboard key="dashboard" state={state} onSelect={() => setView('detail')} />
        )}

        {view === 'detail' && <DetailView key="detail" state={state} onBack={() => setView('dashboard')} />}

        {view === 'profile' && <Profile key="profile" state={state} onBack={() => setView('dashboard')} />}
      </AnimatePresence>

      {/* Background Noise/Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
}
