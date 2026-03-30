export type UserProfile = 'curious' | 'amateur' | 'collector' | 'investor';

export interface ProfileData {
  id: UserProfile;
  title: string;
  description: string;
  focus: string[];
  spotifyInsight: string;
  kpis: string[];
  message: string;
}

export const PROFILES: ProfileData[] = [
  {
    id: 'curious',
    title: 'Curieux',
    description: 'Découverte des tendances globales et initiation aux enjeux de l\'IA dans la culture.',
    focus: ['Tendances Globales', 'Initiation IA', 'Culture Digitale'],
    spotifyInsight: 'Évolution de la popularité moyenne (2010-2025).',
    kpis: ['Pages vues', 'Temps de lecture', 'Partages'],
    message: 'La digitalisation est une opportunité de médiation culturelle augmentée.'
  },
  {
    id: 'amateur',
    title: 'Amateur',
    description: 'Analyse approfondie des genres et des courants artistiques émergents.',
    focus: ['Analyse de Genres', 'Courants Émergents', 'Expérience Immersive'],
    spotifyInsight: 'Domination du Hip Hop post-2018 et raccourcissement des morceaux.',
    kpis: ['Clics', 'Scroll', 'Ajouts favoris'],
    message: 'L\'IA comme levier d\'expérience pour une immersion artistique totale.'
  },
  {
    id: 'collector',
    title: 'Collectionneur',
    description: 'Focus sur la rareté, la provenance et l\'authenticité des œuvres augmentées.',
    focus: ['Rareté Digitale', 'Authenticité', 'Provenance (Blockchain/IA)'],
    spotifyInsight: 'Distribution des émotions : IA Suno vs Production Humaine.',
    kpis: ['Certificats consultés', 'Provenance vérifiée'],
    message: 'Garantir l\'authenticité dans un monde de reproductibilité algorithmique.'
  },
  {
    id: 'investor',
    title: 'Investisseur',
    description: 'Analyse de la valeur, du pricing informé et des opportunités de marché.',
    focus: ['Pricing Informé', 'ROI Culturel', 'Analytics Marché'],
    spotifyInsight: 'Volume de production franchissant les 10 000 morceaux actifs.',
    kpis: ['Conversion', 'ROI', 'Volatilité'],
    message: 'Mesurer la valeur sans réduire l\'art à une simple donnée marchande.'
  }
];

export const LEXICON = [
  { term: 'Human in the Loop', definition: 'Principe où l\'humain garde le contrôle final sur les décisions de l\'IA.' },
  { term: 'Gouvernance by Design', definition: 'Intégration de l\'éthique et des règles dès la conception technique.' },
  { term: 'Bulle de filtre', definition: 'Isolement intellectuel causé par des algorithmes de recommandation.' },
  { term: 'IA Générative', definition: 'Systèmes capables de créer du contenu original (images, musique, texte).' },
  { term: 'NFT / Blockchain', definition: 'Technologie permettant de certifier la propriété d\'un actif numérique.' }
];

export const ARTISTIC_MAPPINGS: Record<string, { style: string; description: string; imageSeed: string; pricingFactors: { rarity: number; notoriety: number; dataVolume: number; carbon: number } }> = {
  'techno': { style: 'Cyber-Brutalisme', description: 'Esthétique industrielle, contrastes forts, minimalisme radical.', imageSeed: 'industrial', pricingFactors: { rarity: 40, notoriety: 60, dataVolume: 80, carbon: 30 } },
  'jazz': { style: 'Modernisme Classique', description: 'Harmonie complexe, élégance intemporelle, structure organique.', imageSeed: 'jazz', pricingFactors: { rarity: 70, notoriety: 90, dataVolume: 50, carbon: 10 } },
  'hip hop': { style: 'Street-Futurisme', description: 'Dynamisme urbain, collages numériques, hyper-réalité.', imageSeed: 'street', pricingFactors: { rarity: 30, notoriety: 95, dataVolume: 90, carbon: 20 } },
  'rap': { style: 'Réalisme Brut', description: 'Narration crue, esthétique de la rue, impact social direct.', imageSeed: 'urban', pricingFactors: { rarity: 20, notoriety: 98, dataVolume: 95, carbon: 15 } },
  'metal': { style: 'Gothisme Industriel', description: 'Puissance sonore, imagerie sombre, complexité structurelle.', imageSeed: 'dark', pricingFactors: { rarity: 50, notoriety: 70, dataVolume: 60, carbon: 25 } },
  'rock': { style: 'Vintage Analogique', description: 'Énergie brute, grain nostalgique, authenticité instrumentale.', imageSeed: 'guitar', pricingFactors: { rarity: 40, notoriety: 90, dataVolume: 85, carbon: 15 } },
  'edm': { style: 'Hyper-Fluorescence', description: 'Énergie synthétique, couleurs néon, rythme mathématique.', imageSeed: 'neon', pricingFactors: { rarity: 25, notoriety: 85, dataVolume: 95, carbon: 40 } },
  'country': { style: 'Néo-Folk Organique', description: 'Simplicité narrative, textures naturelles, héritage revisité.', imageSeed: 'nature', pricingFactors: { rarity: 60, notoriety: 75, dataVolume: 40, carbon: 5 } },
  'pop': { style: 'Néo-Pop Digital', description: 'Couleurs saturées, lissage algorithmique, accessibilité maximale.', imageSeed: 'pop', pricingFactors: { rarity: 10, notoriety: 100, dataVolume: 100, carbon: 30 } },
  'soft pop': { style: 'Minimalisme Éthéré', description: 'Douceur mélodique, espaces vides, émotion subtile.', imageSeed: 'cloud', pricingFactors: { rarity: 55, notoriety: 80, dataVolume: 30, carbon: 8 } },
  'balenciaga': { style: 'Minimalisme Industriel', description: 'Volumes architecturaux, matériaux bruts, fonctionnalité sombre.', imageSeed: 'architecture', pricingFactors: { rarity: 85, notoriety: 95, dataVolume: 40, carbon: 20 } },
  'chanel': { style: 'Art Déco Revival', description: 'Lignes épurées, luxe discret, symétrie parfaite.', imageSeed: 'luxury', pricingFactors: { rarity: 90, notoriety: 100, dataVolume: 60, carbon: 15 } },
  'gucci': { style: 'Maximalisme Baroque', description: 'Surcharge ornementale, éclectisme historique, narration visuelle.', imageSeed: 'baroque', pricingFactors: { rarity: 75, notoriety: 98, dataVolume: 70, carbon: 25 } },
  'prada': { style: 'Intellectualisme Conceptuel', description: 'Sobriété subversive, recherche de la forme pure, avant-garde.', imageSeed: 'conceptual', pricingFactors: { rarity: 88, notoriety: 92, dataVolume: 35, carbon: 12 } },
  'louis vuitton': { style: 'Nomadisme Digital', description: 'Voyage futuriste, monogrammes augmentés, luxe technologique.', imageSeed: 'travel', pricingFactors: { rarity: 80, notoriety: 100, dataVolume: 80, carbon: 22 } },
  'dior': { style: 'Romantisme Algorithmique', description: 'Féminité structurée, détails floraux complexes, élégance IA.', imageSeed: 'flower', pricingFactors: { rarity: 82, notoriety: 99, dataVolume: 55, carbon: 18 } },
  'hermes': { style: 'Artisanat Augmenté', description: 'Perfection manuelle assistée par la précision de la donnée.', imageSeed: 'leather', pricingFactors: { rarity: 98, notoriety: 100, dataVolume: 30, carbon: 10 } },
  'jacquemus': { style: 'Surréalisme Solaire', description: 'Proportions ludiques, minimalisme méditerranéen, poésie visuelle.', imageSeed: 'sun', pricingFactors: { rarity: 70, notoriety: 88, dataVolume: 25, carbon: 14 } },
  'off-white': { style: 'Déconstructivisme Urbain', description: 'Typographie comme art, guillemets ironiques, fusion street/luxe.', imageSeed: 'streetwear', pricingFactors: { rarity: 65, notoriety: 94, dataVolume: 50, carbon: 28 } },
  'rick owens': { style: 'Brutalisme Primitif', description: 'Formes sculpturales, palette monochrome, esthétique post-apocalyptique.', imageSeed: 'statue', pricingFactors: { rarity: 92, notoriety: 85, dataVolume: 20, carbon: 16 } }
};
