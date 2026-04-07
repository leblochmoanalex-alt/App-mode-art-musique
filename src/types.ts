export type MusicGenre = 
  | 'Techno' 
  | 'House' 
  | 'Rap US' 
  | 'Trap' 
  | 'Drill' 
  | 'Ambient' 
  | 'Classical' 
  | 'Jazz' 
  | 'Metal' 
  | 'Hyperpop';

export type Brand = 
  | 'Balenciaga' 
  | 'Rick Owens' 
  | 'Dior' 
  | 'Chanel' 
  | 'Maison Margiela' 
  | 'Yohji Yamamoto' 
  | 'Prada' 
  | 'Louis Vuitton' 
  | 'Celine' 
  | 'Alexander McQueen';

export type Mood = 'Energetic' | 'Melancholic' | 'Nocturnal' | 'Bright' | 'Introspective' | 'Minimalist' | 'Maximalist';

export interface MusicAnalysis {
  genre: string;
  mood: string;
  energy: string;
  tags: string[];
}

export interface ArtMatch {
  title: string;
  artist: string;
  style: string;
  imageUrl: string;
  explanation: string;
  colors: string[];
}

export interface BrandInfluence {
  name: Brand;
  accentColor: string;
  uiStyle: 'minimal' | 'bold' | 'tech' | 'organic';
  vibe: string;
}

export interface UserPreferences {
  selectedArtists: string[];
  selectedGenres: MusicGenre[];
  selectedMood: Mood;
  selectedBrand: Brand;
}

export interface MoodMuseState {
  preferences: UserPreferences | null;
  analysis: MusicAnalysis | null;
  artMatch: ArtMatch | null;
  brandInfluence: BrandInfluence | null;
  history: {
    analysis: MusicAnalysis;
    artMatch: ArtMatch;
    brandInfluence: BrandInfluence;
  }[];
}

export const GENRES: MusicGenre[] = [
  'Techno', 'House', 'Rap US', 'Trap', 'Drill', 
  'Ambient', 'Classical', 'Jazz', 'Metal', 'Hyperpop'
];

export const BRANDS: Brand[] = [
  'Balenciaga', 'Rick Owens', 'Dior', 'Chanel', 'Maison Margiela', 
  'Yohji Yamamoto', 'Prada', 'Louis Vuitton', 'Celine', 'Alexander McQueen'
];

export const MOODS: Mood[] = [
  'Energetic', 'Melancholic', 'Nocturnal', 'Bright', 'Introspective', 'Minimalist', 'Maximalist'
];

export const BRAND_DATA: Record<Brand, BrandInfluence> = {
  'Balenciaga': { name: 'Balenciaga', accentColor: '#111111', uiStyle: 'bold', vibe: 'Post-Ironic Brutalism' },
  'Rick Owens': { name: 'Rick Owens', accentColor: '#222222', uiStyle: 'tech', vibe: 'Gothic Minimalism' },
  'Dior': { name: 'Dior', accentColor: '#FFFFFF', uiStyle: 'minimal', vibe: 'Structured Elegance' },
  'Chanel': { name: 'Chanel', accentColor: '#000000', uiStyle: 'minimal', vibe: 'Timeless Minimal Luxury' },
  'Maison Margiela': { name: 'Maison Margiela', accentColor: '#F0F0F0', uiStyle: 'tech', vibe: 'Conceptual Deconstruction' },
  'Yohji Yamamoto': { name: 'Yohji Yamamoto', accentColor: '#000000', uiStyle: 'organic', vibe: 'Poetic Darkness' },
  'Prada': { name: 'Prada', accentColor: '#000000', uiStyle: 'minimal', vibe: 'Intellectual Minimalism' },
  'Louis Vuitton': { name: 'Louis Vuitton', accentColor: '#8B4513', uiStyle: 'bold', vibe: 'Global Luxury Hybrid' },
  'Celine': { name: 'Celine', accentColor: '#000000', uiStyle: 'minimal', vibe: 'Modern Bourgeois Minimalism' },
  'Alexander McQueen': { name: 'Alexander McQueen', accentColor: '#000000', uiStyle: 'bold', vibe: 'Dramatic Romanticism' },
};
