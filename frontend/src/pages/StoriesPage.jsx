// pages/StoriesPage.jsx — Heritage Stories & Narratives
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout.jsx";
import { GradientBadge, AnimatedButton } from "../components/ui/index.jsx";

// Heritage Stories Database
const STORIES = [
  {
    id: 1,
    title: "The Sculptor's Dream",
    subtitle: "Legend of Mahabalipuram's Shore Temple",
    category: "Legend",
    dynasty: "Pallava",
    period: "7th Century CE",
    location: "Mahabalipuram",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/mahabalipuram/800/500",
    excerpt: "In the 7th century, under Pallava king Narasimhavarman I, a young sculptor named Dhanu arrived at the coastal town with a vision that would echo through millennia...",
    content: `In the 7th century CE, under the reign of the great Pallava king Narasimhavarman I, a young sculptor named Dhanu arrived at the coastal town of Mahabalipuram. He had traveled from distant lands, drawn by tales of the king's grand vision — to carve temples directly from living rock.

For months, Dhanu worked alongside master craftsmen, his chisel dancing across granite faces. The sound of metal on stone echoed through the coastal air, mixing with the crash of waves against the shore.

One moonlit night, as the tide rose and fell, Dhanu began work on what would become his masterpiece — a panel depicting Arjuna's penance. The rock seemed to come alive under his hands, each strike revealing the divine story hidden within the stone.

The panel showed the great warrior Arjuna standing on one leg in deep meditation, seeking Lord Shiva's blessing. Around him, all of creation watched — celestial beings, animals, and sages — each carved with such detail that they seemed ready to step from the stone.

When King Narasimhavarman saw the completed work, tears filled his eyes. "You have captured not just stone," he said, "but the very essence of dharma itself. This work shall stand as long as the ocean touches our shores."

Today, 1,300 years later, Dhanu's creation remains — a UNESCO World Heritage Site, inspiring millions with its timeless beauty. The waves still crash against Mahabalipuram's shores, and Arjuna still stands in eternal meditation, a testament to the sculptor's dream.`,
    tags: ["Architecture", "UNESCO", "Mythology", "Art"],
    heritage_id: 2,
  },
  {
    id: 2,
    title: "The Temple That Defied Gravity",
    subtitle: "Engineering Marvel of Brihadeeswarar Temple",
    category: "Architecture",
    dynasty: "Chola",
    period: "1010 CE",
    location: "Thanjavur",
    readTime: "6 min read",
    image: "https://picsum.photos/seed/thanjavur/800/500",
    excerpt: "Raja Raja Chola I stood before his architects with an impossible demand: 'Build me a temple tower that touches the heavens, using only granite, without mortar...'",
    content: `In 1010 CE, the great Chola emperor Raja Raja Chola I envisioned a temple that would stand as the ultimate expression of devotion and architectural brilliance. He summoned the kingdom's finest architects and presented them with what seemed an impossible challenge.

"I want a vimana that rises 66 meters into the sky," he declared, "built entirely from granite, without using a single grain of mortar."

The architects were stunned. The engineering challenges were immense. How could they transport an 80-ton capstone to the top of such a massive structure? How would the tower remain stable without mortar?

Legend says that the chief architect, whose name has been lost to time, spent months in meditation seeking divine inspiration. The solution came to him in a dream — a 6-kilometer ramp that would gradually rise to the temple's peak.

Thousands of elephants hauled the massive granite blocks. The capstone alone required 100 elephants and took months to transport. The stones were cut so precisely that they fit together like pieces of a divine puzzle, each supporting the others through pure engineering genius.

The temple's shadow was designed never to fall on the ground at noon — a feat of astronomical precision. The acoustic design allows a whisper at the sanctum to be heard 100 feet away.

When the temple was completed, Raja Raja stood before it in awe. The Nandi bull statue at the entrance, carved from a single rock and weighing 25 tons, seemed to guard not just a temple, but a miracle of human achievement.

Today, this UNESCO World Heritage Site stands as proof that with vision, devotion, and engineering excellence, humans can indeed build dreams that touch the heavens.`,
    tags: ["Engineering", "UNESCO", "Chola", "Innovation"],
    heritage_id: 1,
  },
  {
    id: 3,
    title: "The Warrior Queen's Fort",
    subtitle: "Rani Mangammal's Legacy at Madurai",
    category: "History",
    dynasty: "Nayak",
    period: "17th Century CE",
    location: "Madurai",
    readTime: "7 min read",
    image: "https://picsum.photos/seed/madurai/800/500",
    excerpt: "When enemies surrounded the kingdom, a widow became a warrior, a mother became a strategist, and a queen became a legend...",
    content: `In 1689, when Chokkanatha Nayak died, his kingdom faced a crisis. His son was too young to rule, and enemies circled like vultures. The court expected chaos. Instead, they got Rani Mangammal.

The queen dowager, a woman in her fifties, stepped forward. "I will serve as regent until my grandson comes of age," she declared. The court laughed. The enemies rejoiced. They were all wrong.

Mangammal's first act was to inspect the kingdom's defenses personally. Dressed in simple cotton, she walked the fort walls of Madurai, noting every weakness. She spoke with soldiers, listened to merchants, and learned the people's concerns.

When the Mysore army attacked, expecting an easy victory over a "woman's kingdom," they encountered something unexpected. Mangammal had modernized the artillery, trained new battalions, and established a spy network that knew the enemy's plans before they did.

The siege lasted six months. Inside the fort, Mangammal ensured food was rationed fairly, the injured were cared for, and morale remained high. She would appear on the ramparts each dawn, visible to both her people and the enemy, a symbol of unbreakable resolve.

One night, using intelligence from her spies, she led a surprise counterattack. The enemy, thinking they faced a weak opponent, were routed. The siege was broken.

But Mangammal's true legacy wasn't military. She built temples, established schools, improved irrigation systems, and created a judicial system known for its fairness. She ruled for 30 years, and when she finally passed power to her grandson, she handed him not just a kingdom, but a thriving empire.

Today, the Meenakshi Amman Temple stands as a testament to her devotion. The city's prosperity reflects her economic wisdom. And her story reminds us that true power comes not from titles, but from courage, intelligence, and service.`,
    tags: ["Women", "Leadership", "Warfare", "Legacy"],
    heritage_id: 5,
  },
  {
    id: 4,
    title: "The Dancing God of Bronze",
    subtitle: "Birth of the Chola Bronze Tradition",
    category: "Art",
    dynasty: "Chola",
    period: "9th-13th Century CE",
    location: "Thanjavur",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/nataraja/800/500",
    excerpt: "In a small workshop, a master craftsman prepared to attempt what no one had done before — capture the cosmic dance of Lord Shiva in metal...",
    content: `In the 10th century, in a workshop near Thanjavur, master bronze caster Vishvakarma prepared for his life's greatest work. He had been commissioned to create an icon of Nataraja — Shiva in his cosmic dance — but not just any icon. This would be the perfect representation, the one that would set the standard for centuries.

The lost-wax casting process was known, but to capture the dynamic movement of the dance, the perfect balance of multiple arms, the subtle expression of divine bliss — this required something more. It required divine inspiration.

Vishvakarma began with meditation. For forty days, he fasted and prayed, studying the dance form, understanding the philosophy behind each mudra (gesture), each stance. The Nataraja wasn't just a sculpture — it was a theological statement in bronze.

The Ananda Tandava, the Dance of Bliss, represented the five cosmic functions: creation, preservation, destruction, concealment, and liberation. Four arms: one holding the drum of creation, one with the flame of destruction, one in abhaya (fearless) mudra, one pointing to the raised foot symbolizing liberation.

The preparation of the wax model took months. Every detail had to be perfect — the rhythm of the dance captured in stillness, the serene face amidst cosmic activity, the demon of ignorance crushed under the right foot.

The casting day arrived. The furnace burned at precisely the right temperature. The molten bronze — a secret mixture of copper, tin, and traces of other metals — flowed like liquid gold. The entire workshop held its breath.

When the mold was broken and the sculpture emerged, there was absolute silence. Then, slowly, everyone prostrated. They had witnessed not just a casting, but a miracle. The bronze Nataraja seemed to dance even in stillness, every proportion perfect, every symbol clear.

This technique, perfected by the Cholas, created some of the finest bronzes the world has ever seen. Today, the dancing Shiva is India's cultural ambassador, adorning CERN in Geneva and countless museums worldwide — a dance of atoms, a dance of the cosmos, forever captured in eternal bronze.`,
    tags: ["Art", "Bronze", "Dance", "Philosophy"],
    heritage_id: 1,
  },
  {
    id: 5,
    title: "The Seven Pagodas Mystery",
    subtitle: "Lost Temples of Mahabalipuram",
    category: "Mystery",
    dynasty: "Pallava",
    period: "7th-9th Century CE",
    location: "Mahabalipuram",
    readTime: "6 min read",
    image: "https://picsum.photos/seed/shore/800/500",
    excerpt: "Sailors spoke of seven magnificent pagodas rising from the sea. Today, only one remains visible. What happened to the other six?",
    content: `For centuries, sailors navigating the Coromandel Coast spoke of seven magnificent pagodas rising from the sea near Mahabalipuram. European traders in the 17th century recorded seeing multiple temple towers. Today, only one — the Shore Temple — stands visible above the waves.

What happened to the other six?

The mystery deepened in 2004 when the devastating tsunami temporarily pulled back the waters. For a few precious hours, divers and fishermen reported seeing ancient structures — walls, carvings, even what appeared to be lion sculptures — beneath the waves before the sea returned.

The Archaeological Survey of India launched underwater expeditions. What they found was astonishing: extensive underwater structures stretching over several kilometers, submerged under 5-8 meters of water.

But were these the legendary "Seven Pagodas"?

Historical accounts suggest that the Pallava kings built multiple shore temples as part of a grand coastal complex. Some theories propose that rising sea levels over 1,300 years gradually submerged these structures. Others suggest that the shifting coastline and tidal patterns buried them under sand.

Recent excavations have revealed that what was once called "Mahabalipuram" might have been much larger than the current site. Ancient Tamil texts refer to "Kadal Mallai" (Mountain of Waves) and describe a great port city with numerous temples.

Geologists studying the area have found evidence of multiple tsunamis and cyclones throughout history. Each event could have submerged more structures, gradually reducing the "seven" to one.

The Shore Temple itself shows signs of having been partially submerged at various points in history. The eastern wall bears marks of wave action far above the current high-tide line, suggesting the sea level was once much higher.

In 2005, divers recovered several artifacts from the underwater site — stone blocks with carvings, broken sculptures, and architectural remains. Carbon dating and stylistic analysis confirmed they were from the Pallava period.

Today, the Shore Temple stands as a survivor, the last visible witness to what might have been a magnificent coastal complex. As technology advances, each underwater survey reveals more secrets. Perhaps one day we'll fully uncover the truth about Mahabalipuram's lost temples.

The seven pagodas remain both a mystery and a promise — a reminder that beneath the waves lie stories waiting to be told, civilizations waiting to be rediscovered, and mysteries that connect us to our ancient past.`,
    tags: ["Mystery", "UNESCO", "Underwater", "Discovery"],
    heritage_id: 2,
  },
  {
    id: 6,
    title: "The Forgotten Language of Stone",
    subtitle: "Tamil-Brahmi Inscriptions Discovery",
    category: "Discovery",
    dynasty: "Sangam Period",
    period: "3rd Century BCE - 3rd Century CE",
    location: "Various Sites",
    readTime: "8 min read",
    image: "https://picsum.photos/seed/inscriptions/800/500",
    excerpt: "Deep in a cave, forgotten for 2,000 years, lay inscriptions that would rewrite Tamil history...",
    content: `In 1819, a British officer named Colonel Colin Mackenzie was surveying the Madurai region when a local guide mentioned ancient writings in nearby caves. What Mackenzie found would revolutionize our understanding of Tamil history.

Inside shallow rock shelters, barely visible in the dim light, were inscriptions in a script nobody could read. They weren't in any known language or writing system. These were the Tamil-Brahmi inscriptions — the earliest written records of the Tamil language.

For decades, these mysterious writings remained undeciphered. Scholars knew they were ancient, but how ancient? And what did they say?

The breakthrough came in the early 20th century when linguists realized the script was an adaptation of Brahmi (used for Sanskrit) modified for Tamil sounds. Slowly, painstakingly, the inscriptions began to reveal their secrets.

The messages were surprisingly mundane, yet profound: "This cave is given by...", "May this gift bring merit...", "Here lies the donation of...". These were records of donations, usually by merchants or chieftains, gifting caves as shelters for wandering monks.

But the implications were staggering. These inscriptions proved that Tamil had a written tradition dating back to at least the 3rd century BCE — contemporary with the great Mauryan Empire. Tamil wasn't just oral; it was a sophisticated written language with its own script adaptation.

More discoveries followed. In Jambai, inscriptions spoke of trade guilds. In Mangulam, names of donors revealed a cosmopolitan society with Sanskrit, Tamil, and Prakrit names living side by side. In Pugalur, references to kings unknown to later Tamil literature emerged.

One inscription changed everything about Tamil literary history. Found in Adichanallur, it mentioned "Thamizhi," which scholars believe refers to a Tamil poet or the Tamil language itself — proof that even in the 2nd century BCE, there was awareness of Tamil as a distinct linguistic identity.

The most poignant discovery was in a cave near Arittapatti. There, a simple inscription read: "The cave of Kalyan, who gave knowing he would not see the fruits of his gift."

This unnamed Kalyan, dead for over 2,000 years, had donated a cave expecting no reward. His gift outlasted empires. His name, forgotten by his great-grandchildren, was preserved in stone.

Today, over 80 Tamil-Brahmi sites have been discovered across Tamil Nadu. Each new find adds words to our ancient vocabulary, names to our forgotten history, and depth to our understanding of how Tamil civilization evolved.

These inscriptions in stone are more than historical records. They're voices from 2,000 years ago, telling us: "We were here. We thought. We gave. We wrote. Remember us."

And now, we do.`,
    tags: ["Language", "Discovery", "History", "Ancient"],
    heritage_id: null,
  },
];

const CATEGORIES = ["All", "Legend", "Architecture", "History", "Art", "Mystery", "Discovery"];
const DYNASTIES = ["All", "Chola", "Pallava", "Pandya", "Nayak", "Sangam Period"];

function StoryCard({ story, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer animate-fade-up"
    >
      <div className="glass-dark rounded-2xl overflow-hidden hover:border-gold/40 transition-all duration-500 border border-gold/10">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/60 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <GradientBadge color="gold">{story.category}</GradientBadge>
          </div>

          {/* Dynasty Badge */}
          <div className="absolute top-4 left-4">
            <GradientBadge color="ember">{story.dynasty}</GradientBadge>
          </div>

          {/* Read Time */}
          <div className="absolute bottom-4 right-4 glass-dark px-3 py-1 rounded-full border border-gold/20">
            <span className="text-gold/80 text-xs">📖 {story.readTime}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-cream/40 mb-3">
            <span>{story.period}</span>
            <span>•</span>
            <span>{story.location}</span>
          </div>

          <h3 className="font-display text-2xl text-cream mb-2 group-hover:text-gold-light transition-colors">
            {story.title}
          </h3>
          
          <p className="text-gold/60 text-sm mb-3 italic">
            {story.subtitle}
          </p>

          <p className="text-cream/60 text-sm leading-relaxed mb-4 line-clamp-3">
            {story.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 rounded-full bg-gold/5 border border-gold/15 text-gold/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Read More */}
          <div className="flex items-center gap-2 text-gold text-sm group-hover:gap-3 transition-all">
            <span>Read Story</span>
            <span className="text-lg">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryModal({ story, onClose }) {
  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-dark rounded-3xl border border-gold/20 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right w-10 h-10 rounded-full glass-dark border border-gold/30 flex items-center justify-center hover:bg-ember/20 hover:border-ember transition-all z-10"
        >
          <span className="text-cream">✕</span>
        </button>

        {/* Hero Image */}
        <div className="relative h-96 -mt-10">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/40 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-3 mb-4">
              <GradientBadge color="gold">{story.category}</GradientBadge>
              <GradientBadge color="ember">{story.dynasty}</GradientBadge>
              <span className="text-cream/60 text-sm">{story.period}</span>
            </div>
            <h1 className="font-display text-5xl text-cream mb-2">
              {story.title}
            </h1>
            <p className="text-gold text-xl italic">{story.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 text-sm text-cream/50">
            <span>📍 {story.location}</span>
            <span>•</span>
            <span>📖 {story.readTime}</span>
          </div>

          <div
            className="prose prose-invert max-w-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.125rem",
              lineHeight: "1.8",
              color: "rgba(245, 238, 220, 0.85)",
            }}
          >
            {story.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gold/10">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-gold/5 border border-gold/15 text-gold/70 text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Heritage Site */}
          {story.heritage_id && (
            <div className="mt-8 p-6 rounded-xl bg-gold/5 border border-gold/20">
              <p className="text-gold/60 text-sm mb-2">Related Heritage Site</p>
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = `/heritage/${story.heritage_id}`}
              >
                Visit Heritage Site →
              </AnimatedButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StoriesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDynasty, setSelectedDynasty] = useState("All");
  const [selectedStory, setSelectedStory] = useState(null);

  const filteredStories = STORIES.filter((story) => {
    const categoryMatch = selectedCategory === "All" || story.category === selectedCategory;
    const dynastyMatch = selectedDynasty === "All" || story.dynasty === selectedDynasty;
    return categoryMatch && dynastyMatch;
  });

  return (
    <MainLayout title="Heritage Stories">
      <div className="min-h-screen">
        
        {/* Hero Section */}
        <section className="relative px-6 py-20 text-center">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 animate-fade-in">
              <div className="h-px w-8 bg-gold/40" />
              <span className="text-gold/70 text-sm font-mono tracking-wider uppercase">
                Narratives & Legends
              </span>
              <div className="h-px w-8 bg-gold/40" />
            </div>

            <h1 className="font-display text-6xl md:text-7xl text-cream mb-6 animate-fade-up">
              Heritage <span className="text-shimmer">Stories</span>
            </h1>

            <p className="text-cream/60 text-lg leading-relaxed max-w-2xl mx-auto animate-fade-up stagger-2">
              Journey through time with tales of valor, devotion, and artistry. 
              Each story brings ancient Tamil Nadu to life through the eyes of 
              those who shaped its magnificent heritage.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Category Filter */}
            <div className="mb-6">
              <p className="text-cream/50 text-sm mb-3">Filter by Category:</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      selectedCategory === cat
                        ? "bg-gold/20 border border-gold/40 text-gold"
                        : "glass border border-gold/10 text-cream/60 hover:border-gold/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynasty Filter */}
            <div>
              <p className="text-cream/50 text-sm mb-3">Filter by Dynasty:</p>
              <div className="flex flex-wrap gap-2">
                {DYNASTIES.map((dyn) => (
                  <button
                    key={dyn}
                    onClick={() => setSelectedDynasty(dyn)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      selectedDynasty === dyn
                        ? "bg-ember/20 border border-ember/40 text-ember"
                        : "glass border border-gold/10 text-cream/60 hover:border-gold/30"
                    }`}
                  >
                    {dyn}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 text-cream/40 text-sm">
              Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story, i) => (
                <div key={story.id} style={{ animationDelay: `${i * 0.1}s` }}>
                  <StoryCard
                    story={story}
                    onClick={() => setSelectedStory(story)}
                  />
                </div>
              ))}
            </div>

            {filteredStories.length === 0 && (
              <div className="text-center py-20">
                <span className="text-6xl mb-4 block">📖</span>
                <p className="text-cream/50 mb-4">No stories found</p>
                <p className="text-cream/30 text-sm">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </MainLayout>
  );
}

export default StoriesPage;