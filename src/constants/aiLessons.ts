export interface AiPracticeParagraph {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  focusBigrams: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tip: string;
}

export interface AiLesson {
  id: string;
  title: string;
  category: 'stretches' | 'rolls' | 'rhythm' | 'endurance' | 'developer' | 'precision';
  shortDesc: string;
  targetSkills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
  badgeBg: string;
  paragraphs: AiPracticeParagraph[];
}

export const AI_LESSONS: AiLesson[] = [
  {
    id: 'lesson-awkward-stretches',
    title: 'Awkward Stretches & Pinky Agility',
    category: 'stretches',
    shortDesc: 'Master tricky outer-column keys and cross-hand stretches without breaking hand posture.',
    targetSkills: ['qu', 'wh', 'ph', 'ck', 'pl', 'wr', 'za'],
    difficulty: 'Intermediate',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    paragraphs: [
      {
        id: 'stretch-p1',
        title: 'The Quantum Workshop',
        text: 'The quantum physicist quickly scribbled notes while the antique clock ticked in the quiet workshop. Every phrase required careful proof, yet the phantom whisper of discovery kept his zeal burning bright through the cold winter night.',
        wordCount: 37,
        focusBigrams: ['qu', 'wh', 'ph', 'ck'],
        difficulty: 'Intermediate',
        tip: 'Keep your left wrist stationary when reaching for "q" and "p" on the top row.',
      },
      {
        id: 'stretch-p2',
        title: 'Palace Plaza Photographs',
        text: 'A flock of black birds swept past the quaint plaza as the photographer snapped quick pictures of the queen white palace. Each tricky angle was captured with rapid accuracy before the dusk sky grew dark.',
        wordCount: 36,
        focusBigrams: ['ck', 'qu', 'ph', 'wh'],
        difficulty: 'Intermediate',
        tip: 'Roll smoothly through the "ph" and "qu" pairs without pausing between letters.',
      },
      {
        id: 'stretch-p3',
        title: 'The Solitary Poet',
        text: 'Writing requires patience when awkward phrases twist across the page. The poet wrapped a warm blanket around his wrists, crafting verses about wild whirlpools, quiet queries, and the rhythm of distant echoes.',
        wordCount: 33,
        focusBigrams: ['wr', 'ph', 'wh', 'qu'],
        difficulty: 'Advanced',
        tip: 'Lead with your index finger for support on "wr" transitions.',
      },
      {
        id: 'stretch-p4',
        title: 'Wildlife Observation',
        text: 'The zoologist watched a flock of plumed birds peck at wheat grains near the quicksand pool. With quiet precision, she recorded how their wings flapped without panic or clumsy flight.',
        wordCount: 30,
        focusBigrams: ['pl', 'wh', 'qu', 'ck'],
        difficulty: 'Beginner',
        tip: 'Focus on hitting "p" with the pinky while keeping your middle fingers on home row.',
      },
      {
        id: 'stretch-p5',
        title: 'The Alpine Observatory',
        text: 'Perched upon the highest peak, the alpine observatory captured pulses of quasar light from deep space. Whispering winds shook the zinc roof, while astronomers prepared their photographic plates with painstaking care.',
        wordCount: 32,
        focusBigrams: ['qu', 'ph', 'wh', 'ck'],
        difficulty: 'Intermediate',
        tip: 'Glide between "z" and "q" without dropping your hand below the keyboard plane.',
      },
      {
        id: 'stretch-p6',
        title: 'Quicksilver Alchemy',
        text: 'The antique manuscript spoke of quicksilver flasks locked within secret brick alcoves. Scholars wrestled with obscure phrasing, eager to unpack whether the quiet whispers hid genuine philosophy or theatrical trickery.',
        wordCount: 32,
        focusBigrams: ['qu', 'ck', 'wr', 'ph'],
        difficulty: 'Advanced',
        tip: 'Keep the pinky relaxed immediately after striking outer column keys.',
      },
    ],
  },
  {
    id: 'lesson-consonant-rolls',
    title: 'Consonant Rolls & Double Letters',
    category: 'rolls',
    shortDesc: 'Develop lightning-fast finger transitions across the most common high-speed English letter blends.',
    targetSkills: ['th', 'ch', 'sh', 'gh', 'br', 'tr', 'st', 'pr'],
    difficulty: 'Beginner',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    paragraphs: [
      {
        id: 'rolls-p1',
        title: 'The Forest Trail Expedition',
        text: 'Through the thick forest trail, the brave travelers marched toward the shining castle gates. Strong branches brushed against their shoulders while bright stars pierced the dark midnight sky with sharp beauty.',
        wordCount: 32,
        focusBigrams: ['th', 'tr', 'br', 'sh', 'st', 'gh'],
        difficulty: 'Beginner',
        tip: 'Treat "th" and "sh" as a single unified gesture rather than two separate keystrokes.',
      },
      {
        id: 'rolls-p2',
        title: 'Steam Engine Arrival',
        text: 'Children cheered as the grand brass train rolled into the station with a proud blast of steam. The conductor checked each silver ticket, greeting passengers whose journey stretched across three distant states.',
        wordCount: 33,
        focusBigrams: ['ch', 'br', 'tr', 'st', 'pr', 'th'],
        difficulty: 'Intermediate',
        tip: 'Accelerate through the "tr" and "pr" blends on the top row.',
      },
      {
        id: 'rolls-p3',
        title: 'Architecture of Cadence',
        text: 'Thoughtful practice strengthens both speed and accuracy. When your fingers glide across the home row with steady breath, difficult consonant clusters transition from stumbling blocks into effortless musical beats.',
        wordCount: 30,
        focusBigrams: ['th', 'st', 'pr', 'ch'],
        difficulty: 'Intermediate',
        tip: 'Maintain light fingertip pressure so consonant pairs roll naturally.',
      },
      {
        id: 'rolls-p4',
        title: 'Spring Lightning Tempest',
        text: 'The bright lightning strike shook the wooden church tower during the spring storm. Fresh rain washed the quiet streets, bringing fresh hope and cleansing the dry earth with crisp breezes.',
        wordCount: 30,
        focusBigrams: ['gh', 'st', 'ch', 'sh', 'br'],
        difficulty: 'Intermediate',
        tip: 'Practice releasing each key instantly to avoid lingering keystroke friction.',
      },
      {
        id: 'rolls-p5',
        title: 'The Blacksmith Craft',
        text: 'Bright sparks showered the stone hearth as the smith struck red-hot iron bars with strong, measured blows. Great strength alone could never forge such sharp blades without true patience and steady precision.',
        wordCount: 33,
        focusBigrams: ['br', 'st', 'th', 'sh', 'tr'],
        difficulty: 'Beginner',
        tip: 'Group the "sp" and "st" clusters into rapid two-finger finger rolls.',
      },
      {
        id: 'rolls-p6',
        title: 'Harbor at Dawn',
        text: 'Early morning ships brought fresh timber and broad merchant crates to the busy harbor. Fishermen shouted cheerful greetings as seagulls glided through the golden mist above the crashing tides.',
        wordCount: 30,
        focusBigrams: ['br', 'sh', 'ch', 'tr', 'th'],
        difficulty: 'Beginner',
        tip: 'Keep your finger taps crisp and bouncy as you cross between rows.',
      },
    ],
  },
  {
    id: 'lesson-rhythmic-flow',
    title: 'Rhythmic Flow & Hand Alternation',
    category: 'rhythm',
    shortDesc: 'Eliminate stuttered typing bursts by training consistent, alternating left-right hand cadence.',
    targetSkills: ['hand-balance', 'home-row', 'cadence', 'flow-state'],
    difficulty: 'Intermediate',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    paragraphs: [
      {
        id: 'rhythm-p1',
        title: 'The Pendulum Metaphor',
        text: 'True typing mastery is not about aggressive bursts of speed, but maintaining an uninterrupted cadence. When your hands oscillate like a pendulum, every sentence flows naturally without tension in your forearms.',
        wordCount: 31,
        focusBigrams: ['in', 'an', 'en', 'er'],
        difficulty: 'Intermediate',
        tip: 'Keep your tempo steady—do not rush easy words only to stumble on harder ones.',
      },
      {
        id: 'rhythm-p2',
        title: 'The River Marketplace',
        text: 'The ancient city flourished beside a winding river where merchants traded silk, spices, and radiant crystals. Daily life moved with rhythmic harmony as artisan bells echoed across the sunlit marble courtyards.',
        wordCount: 31,
        focusBigrams: ['an', 'ed', 'in', 'or'],
        difficulty: 'Beginner',
        tip: 'Feel the rhythm alternate between your left and right hands.',
      },
      {
        id: 'rhythm-p3',
        title: 'Focus and Reflex',
        text: 'Balance your focus between looking ahead at upcoming words and letting your finger reflexes execute the current keystrokes. Consistent rhythm always triumphs over erratic sprinting in long typing sessions.',
        wordCount: 30,
        focusBigrams: ['al', 'on', 'en', 'st'],
        difficulty: 'Intermediate',
        tip: 'Read one word ahead of what your fingers are currently typing.',
      },
      {
        id: 'rhythm-p4',
        title: 'The Scholar Sanctuary',
        text: 'In the heart of the library, silence was celebrated like an art form. Scholars turned delicate pages, cataloging forgotten philosophies, sovereign kingdoms, and the timeless evolution of written languages.',
        wordCount: 29,
        focusBigrams: ['th', 'ar', 'or', 'in'],
        difficulty: 'Advanced',
        tip: 'Maintain soft, relaxed shoulders while sustaining a continuous keystroke pace.',
      },
      {
        id: 'rhythm-p5',
        title: 'The Metronome Principle',
        text: 'Listen to the subtle acoustic tempo of each key strike. When keystrokes occur at uniform millisecond intervals, cognitive load diminishes and your subconscious mind takes over text rendering with effortless ease.',
        wordCount: 31,
        focusBigrams: ['me', 'ro', 'in', 'on'],
        difficulty: 'Intermediate',
        tip: 'Aim for identical time gaps between letters rather than rushing vowels.',
      },
      {
        id: 'rhythm-p6',
        title: 'Celestial Navigation',
        text: 'Sailors once read cosmic constellations to navigate uncharted oceans under starlit canopies. With steady hands at the helm, their wooden vessels traced calm courses across boundless tides toward distant shores.',
        wordCount: 30,
        focusBigrams: ['st', 'ar', 'ed', 'in'],
        difficulty: 'Beginner',
        tip: 'Let each alternating syllable rock smoothly between your left and right hand.',
      },
    ],
  },
  {
    id: 'lesson-developer-syntax',
    title: 'Developer Syntax & Technical Flow',
    category: 'developer',
    shortDesc: 'Train muscle memory for technical documentation, camelCase identifiers, and algorithm terms.',
    targetSkills: ['camelCase', 'algorithms', 'code-vocab', 'brackets'],
    difficulty: 'Advanced',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    paragraphs: [
      {
        id: 'dev-p1',
        title: 'State Machines & Cloud Schemas',
        text: 'Modern web applications leverage reactive state machines, modular component trees, and distributed cloud caching. Every network payload must be validated before mutating the database schema to guarantee zero data loss.',
        wordCount: 30,
        focusBigrams: ['st', 'ch', 'sc', 'pl'],
        difficulty: 'Intermediate',
        tip: 'Keep fingers hovering evenly over the home row to handle technical vocabulary.',
      },
      {
        id: 'dev-p2',
        title: 'Algorithmic Partitioning',
        text: 'Binary search trees partition elements into logarithmic hierarchies, enabling fast queries and predictable lookups. When an algorithm minimizes redundant iterations, computational efficiency scales gracefully.',
        wordCount: 24,
        focusBigrams: ['qu', 'ch', 'tr', 'gr'],
        difficulty: 'Advanced',
        tip: 'Practice clean finger transitions for complex technical prefixes and suffixes.',
      },
      {
        id: 'dev-p3',
        title: 'Asynchronous Viewport Rendering',
        text: 'Asynchronous functions await remote API responses while rendering fallback skeletons on the client viewport. Clean interfaces decouple network latency from user interaction, creating a seamless user experience.',
        wordCount: 27,
        focusBigrams: ['sy', 'nc', 'cl', 'sp'],
        difficulty: 'Intermediate',
        tip: 'Do not pause before words beginning with "async" or "viewport".',
      },
      {
        id: 'dev-p4',
        title: 'Continuous Integration Pipelines',
        text: 'Continuous integration pipelines run lint checks, type validations, and regression suites automatically. A well-architected codebase prioritizes readable abstractions, deterministic tests, and clean modular boundaries.',
        wordCount: 25,
        focusBigrams: ['ck', 'nt', 'gr', 'te'],
        difficulty: 'Advanced',
        tip: 'Notice how hyphenated words flow cleanly without lifting your wrists.',
      },
      {
        id: 'dev-p5',
        title: 'Microservices & Telemetry',
        text: 'Distributed microservices stream structured logs into distributed tracing brokers. When latency spikes occur along critical request paths, observability dashboards pinpoint bottlenecked microservices within milliseconds.',
        wordCount: 25,
        focusBigrams: ['st', 'cr', 'tr', 'br'],
        difficulty: 'Advanced',
        tip: 'Maintain rhythmic cadence across multisyllabic technical terms.',
      },
      {
        id: 'dev-p6',
        title: 'Compiler Optimization Passes',
        text: 'Optimizing compilers analyze abstract syntax trees, inline constant values, and eliminate unreachable branches. Machine instructions execute with peak performance when memory access patterns remain cache-friendly.',
        wordCount: 25,
        focusBigrams: ['pt', 'st', 'tr', 'ch'],
        difficulty: 'Intermediate',
        tip: 'Type the prefix "opti" smoothly using home-row finger cooperation.',
      },
    ],
  },
  {
    id: 'lesson-punctuation-precision',
    title: 'Punctuation & Numerical Precision',
    category: 'precision',
    shortDesc: 'Conquer commas, quotes, hyphens, numbers, and capital shifts without slowing down.',
    targetSkills: ['numbers', 'quotes', 'commas', 'capital-shifts'],
    difficulty: 'Advanced',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    paragraphs: [
      {
        id: 'prec-p1',
        title: 'Software Evolution Metrics',
        text: 'In 1984, the team released version 2.5 of their software, noting: "Accuracy must always precede raw velocity." By 1999, over 45,000 typists had improved their speed by 35% using structured drills.',
        wordCount: 31,
        focusBigrams: ['numbers', 'quotes', 'shifts'],
        difficulty: 'Advanced',
        tip: 'Use the opposite shift key for capital letters to keep your hands balanced.',
      },
      {
        id: 'prec-p2',
        title: 'Midnight Milestone',
        text: '"Can you believe it?" asked Sarah, glancing at the clock at 11:45 PM. "We completed all 12 modules—including the final test—with 99.4% accuracy!" Her mentor smiled, nodding in total agreement.',
        wordCount: 29,
        focusBigrams: ['quotes', 'dashes', 'numbers'],
        difficulty: 'Advanced',
        tip: 'Reach for quotation marks with your right pinky without twisting your wrist.',
      },
      {
        id: 'prec-p3',
        title: 'Quarterly Financial Report',
        text: 'Financial analysts reviewed the Q3 reports: revenue grew by 18.2%, expenses dropped 7.5%, and operating cash flow reached $4.2 million. "The fundamentals," the director stated, "remain exceptionally solid."',
        wordCount: 28,
        focusBigrams: ['currency', 'percentages', 'quotes'],
        difficulty: 'Advanced',
        tip: 'Return your fingers immediately to the home row after typing numbers.',
      },
      {
        id: 'prec-p4',
        title: 'Digital Communication Expansion',
        text: 'Between 2010 and 2025, digital communication expanded at a compound rate of 24% annually. Precision punctuation—such as semicolons, em-dashes, and parenthetical remarks—remains vital for clarity.',
        wordCount: 24,
        focusBigrams: ['semicolons', 'numbers', 'dashes'],
        difficulty: 'Intermediate',
        tip: 'Treat punctuation keys as home-row neighbors, not far-off obstacles.',
      },
      {
        id: 'prec-p5',
        title: 'Apollo Flight Telemetry',
        text: 'On July 20, 1969, mission telemetry clocked the lunar descent at 3,050 feet per second. "Eagle has landed," Armstrong reported calmly, marking mankind\'s first footprint on another celestial body.',
        wordCount: 28,
        focusBigrams: ['quotes', 'apostrophe', 'numbers'],
        difficulty: 'Intermediate',
        tip: 'Tap the apostrophe with the right pinky without lifting your right index finger.',
      },
      {
        id: 'prec-p6',
        title: 'Scientific Data Confidence',
        text: 'Across 1,250 trials, researchers recorded a 95% confidence interval [p < 0.001]. Dr. Vance confirmed: "Every anomaly was thoroughly cross-examined before finalizing chapter 4."',
        wordCount: 24,
        focusBigrams: ['brackets', 'decimals', 'quotes'],
        difficulty: 'Advanced',
        tip: 'Strike brackets deliberately and resume home row position instantly.',
      },
    ],
  },
  {
    id: 'lesson-endurance-sprint',
    title: 'Endurance & Cognitive Flow Sprints',
    category: 'endurance',
    shortDesc: 'Build stamina for long tests and prevent fatigue from degrading your second-half speed.',
    targetSkills: ['stamina', 'breathing', 'relaxed-wrists', 'long-phrasing'],
    difficulty: 'Intermediate',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    paragraphs: [
      {
        id: 'endure-p1',
        title: 'The Cultivation of Deep Focus',
        text: 'Deep focus is a cultivated state of mind where external distractions dissolve into background noise. As you maintain deliberate pacing over several continuous minutes, your fingers find an intuitive groove where words appear on screen almost before you consciously think them.',
        wordCount: 42,
        focusBigrams: ['stamina', 'rhythm', 'cohesion'],
        difficulty: 'Intermediate',
        tip: 'Take a relaxed, steady breath at the start of each new sentence clause.',
      },
      {
        id: 'endure-p2',
        title: 'The Human Tapestry',
        text: 'Exploration has always defined the human spirit, driving pioneers across uncharted oceans and toward distant planetary horizons. Each generation inherits the accumulated knowledge of the past, adding new chapters to the grand tapestry of human achievement.',
        wordCount: 35,
        focusBigrams: ['ph', 'ch', 'th', 'stamina'],
        difficulty: 'Intermediate',
        tip: 'Avoid tensing your fingers during longer sentences; let momentum carry you.',
      },
      {
        id: 'endure-p3',
        title: 'Distance Running on Keys',
        text: 'Stamina in typing mirrors distance running: sprinting blindly in the first ten seconds guarantees exhaustion before the finish line. Pace your keystrokes evenly, maintain soft wrists, and let muscle memory carry your momentum through the final stretch.',
        wordCount: 37,
        focusBigrams: ['st', 'pr', 'stamina'],
        difficulty: 'Beginner',
        tip: 'Keep your keystroke sound quiet and light to conserve finger energy.',
      },
      {
        id: 'endure-p4',
        title: 'Light Across Time',
        text: 'The development of modern language mirrors the architecture of human thought itself. From early symbolic inscriptions etched in stone to modern digital code transmitting at the speed of light, precision remains our greatest tool for connection.',
        wordCount: 35,
        focusBigrams: ['th', 'sc', 'stamina'],
        difficulty: 'Advanced',
        tip: 'Focus on zero errors in the first half to establish confidence for the finish.',
      },
      {
        id: 'endure-p5',
        title: 'Cathedral Architecture',
        text: 'Great Gothic cathedrals took centuries to construct, stone upon heavy stone. Master stonecutters sculpted soaring arches with unwavering discipline, knowing their generational labor would outlast kingdoms and withstand storms for a thousand years.',
        wordCount: 33,
        focusBigrams: ['th', 'st', 'stamina'],
        difficulty: 'Intermediate',
        tip: 'Maintain consistent posture and resist the urge to hunch over the desk.',
      },
      {
        id: 'endure-p6',
        title: 'The Symphony of Deep Work',
        text: 'Prolonged cognitive work rewards those who cultivate quiet persistence. When you eliminate phone notifications and embrace single-task devotion, complex ideas crystallize into elegant solutions with effortless clarity and sustained momentum.',
        wordCount: 31,
        focusBigrams: ['ph', 'cl', 'stamina'],
        difficulty: 'Advanced',
        tip: 'Breathe steadily from your diaphragm to regulate heart rate during long sprints.',
      },
    ],
  },
];

// ─── Non-Repeating Rotation Engine ──────────────────────────────────────────

const PRACTICED_STORAGE_KEY = 'typeflow_ai_practiced_paragraphs';

export function getRecentPracticedIds(): string[] {
  try {
    const raw = localStorage.getItem(PRACTICED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPracticedParagraph(id: string): void {
  try {
    const recent = getRecentPracticedIds().filter(existingId => existingId !== id);
    recent.unshift(id);
    // Keep a rolling history of the last 30 practiced paragraphs
    localStorage.setItem(PRACTICED_STORAGE_KEY, JSON.stringify(recent.slice(0, 30)));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Returns a paragraph from the specified lesson that was NOT recently practiced.
 * If excludeId is provided (e.g. user clicks shuffle), guarantees picking a different paragraph.
 * If all paragraphs were recently practiced, picks the one practiced longest ago.
 */
export function getNextNonRepeatingParagraph(
  lessonId: string,
  excludeId?: string
): AiPracticeParagraph {
  const lesson = AI_LESSONS.find(l => l.id === lessonId) || AI_LESSONS[0];
  const recentIds = getRecentPracticedIds();

  // Candidates excluding the currently visible paragraph if requested
  const pool = excludeId
    ? lesson.paragraphs.filter(p => p.id !== excludeId)
    : lesson.paragraphs;

  const validPool = pool.length > 0 ? pool : lesson.paragraphs;

  // Find paragraphs in this lesson that have NOT been practiced recently
  const unpracticed = validPool.filter(p => !recentIds.includes(p.id));

  if (unpracticed.length > 0) {
    // Pick randomly from the unpracticed pool
    return unpracticed[Math.floor(Math.random() * unpracticed.length)];
  }

  // If all candidates have been practiced, pick the one practiced furthest in the past
  let oldestIdx = -1;
  let oldestParagraph = validPool[0];

  for (const p of validPool) {
    const idx = recentIds.indexOf(p.id);
    if (idx > oldestIdx) {
      oldestIdx = idx;
      oldestParagraph = p;
    }
  }

  return oldestParagraph;
}

export function getLessonPracticedCount(lessonId: string): number {
  const lesson = AI_LESSONS.find(l => l.id === lessonId);
  if (!lesson) return 0;
  const recentIds = getRecentPracticedIds();
  return lesson.paragraphs.filter(p => recentIds.includes(p.id)).length;
}
