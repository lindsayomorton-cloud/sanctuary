// Sanctuary — single source of truth for the rebuild.
// The prototypes predate this file and still carry local copies; the production app should import from here only.

export const PALETTE = {
  ground: '#1A0F1D', groundRaised: '#2B1730',
  surface: '#FFF8EF', surfaceRaised: '#FFFCF6', ink: '#241A20', inkSoft: '#4E3B43',
  action: '#A9522A', selection: '#9A4FA8', ai: '#F4E5F7', person: '#FCD9CF', protected: '#D4EFE6',
  context: '#E2ECF7', recovery: '#BCD3AB', reviewCarefully: '#FBE4AE', paper: '#F1E8DC',
  gold: '#E8B45C', goldLight: '#F1C877', goldPale: '#F6D58E',
  primary: '#1F6F5E', primaryHover: '#185A4C', primaryInk: '#1F5F57',
  personInk: '#7A2E14', aiInk: '#5E2A6C', onDark: '#FFF6FB', onDarkSoft: '#EADCCF', onDarkMuted: '#D9C6BA'
};

export const DECKS = {
  pro:      { id: 'pro',      name: 'Work',   color: '#1F7F6B', tint: '#E6F3EE' },
  creative: { id: 'creative', name: 'Craft',  color: '#A9522A', tint: '#FBEDE5' },
  home:     { id: 'home',     name: 'Hearth', color: '#9A4FA8', tint: '#F5ECF7' }
};

export const IMPORTANCE = [
  null,
  { level: 1, label: 'A small call',      ink: '#4E7A5A' },
  { level: 2, label: 'Matters this week', ink: '#9A6A14' },
  { level: 3, label: 'Matters a lot',     ink: '#A9522A' }
];

export const TYPE = { sizes: [14, 15.5, 17, 20, 22, 26, 30], headline: 'clamp(36px, 6vh, 64px)', moment: 'clamp(52px, 9vh, 104px)', weights: [400, 600, 650], display: "'Cormorant Garamond', serif", ui: "'Karla', sans-serif" };
export const RADII = { chip: 12, card: 20, pill: 999 };
export const MOTION = { ease: 'cubic-bezier(.22,.8,.3,1)', fast: 250, base: 600, slow: 1200 };

// Prototype localStorage keys → where they belong in the real data model.
export const STORAGE_MAP = {
  'sanctuary-onboarding': 'user.profile', 'sanctuary-low-sensory': 'user.prefs.lowSensory', 'sanctuary-easy': 'user.prefs.easyReading',
  'sanctuary-notify': 'user.prefs.notifications', 'sanctuary-bg': 'user.prefs.background', 'sanctuary-orb': 'user.prefs.orb', 'sanctuary-cloth': 'user.prefs.cloth', 'sanctuary-birthday': 'user.profile.birthday',
  'sanctuary-schema': 'decks', 'sanctuary-custom-decks': 'decks', 'sanctuary-deck-covers': 'decks[].cover', 'sanctuary-deck-snapshot': 'decks (cache)',
  'sanctuary-extra-cards': 'cards', 'sanctuary-done': 'cards[].status=done', 'sanctuary-drafts': 'cards[].artifacts.drafts', 'sanctuary-first-reading': 'cards (seed)',
  'sanctuary-altar': 'stones', 'sanctuary-extra-stones': 'stones', 'sanctuary-streaks': 'streaks', 'sanctuary-leaps': 'badges', 'sanctuary-week-seen': 'user.seen.weekly',
  'sanctuary-spells': 'rituals', 'sanctuary-spells-paused': 'rituals[].paused', 'sanctuary-spells-ready': 'rituals[].ready',
  'sanctuary-teach': 'profile (decks defs, people, projects, rules, voice, corrections)', 'sanctuary-last-visit': 'user.seen.lastVisit'
};

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

export const isLowSensory = () => !!store.get('sanctuary-low-sensory', false) || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

export const ICON_STYLE = "font-family:'Material Symbols Rounded'; line-height:1; font-feature-settings:'liga'; -webkit-font-feature-settings:'liga'; font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;";

// Sample data shared by every prototype. Replace with real data.
export const SAMPLE = {
  user: { name: 'Sam', kids: ['Van', 'Dean'] },
  people: [
    { name: 'Dana Okafor', role: 'Client, Northlight', deck: 'pro', level: 3 },
    { name: 'Priya Shah', role: 'Legal, Northlight', deck: 'pro', level: 2 },
    { name: 'Maya Lin', role: 'Team lead', deck: 'pro', level: 3 },
    { name: 'Ines Duarte', role: 'Mural collaborator', deck: 'creative', level: 2 },
    { name: 'Riverside Clinic', role: 'Dentist', deck: 'home', level: 1 }
  ],
  projects: [
    { name: 'Northlight pilot', deck: 'pro' }, { name: 'Essay series', deck: 'creative' },
    { name: 'Council mural', deck: 'creative' }, { name: 'House upkeep', deck: 'home' }
  ]
};
