import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, HelpCircle, FileText, Settings, Award, 
  Database, ShieldAlert, Sparkles, Sliders, CheckCircle2, 
  HelpCircle as QuestionIcon, Flame, Gift, ArrowBigUp, 
  Download, History, Trash2, Key, Search, ChevronRight, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

export const UserManual: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'seo' | 'rewards' | 'privacy' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('upload');

  const manualSections = [
    {
      id: 'upload',
      category: 'basics',
      title: 'Batch Image Upload & Cloud Extraction',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      tagline: 'Power AI analysis for up to 50 high-resolution visual assets at once.',
      steps: [
        'Navigate to the Generator Workspace inside METAGEN.AI.',
        'Drag and drop files onto the holographic scanner region, or click the viewport to trigger your browser file chooser.',
        'View live upload items queued with "Pending" status badge indicators.',
        'Ensure you hold sufficient credits to trigger processing. Each successfully generated image uses exactly 1 PTS credit card balance.',
        'Click "Generate Metadata" to kickstart the parallel Gemini 3 Flash execution stream. Active progress percentages update live per-file in real-time!'
      ],
      details: 'The system loads images asynchronously, generating titles, detailed keywords, dominant color hexes, mood diagnostics, and physical entity labels simultaneously without bottlenecking your connection.'
    },
    {
      id: 'rules',
      category: 'seo',
      title: 'Adobe Stock Optimization Settings & Rules',
      icon: <Sliders className="w-5 h-5 text-purple-400" />,
      tagline: 'Scope and direct target metadata range before triggering AI generation.',
      steps: [
        'Target Character Range Slider: Adjusts requested length restraints of the title output. We recommend setting this between 45 to 110 characters to bypass Adobe Stock rejection limits while embedding maximum descriptive density.',
        'Keywords Selector Slider: Define strict target tag arrays from 5 up to 50 keywords per asset. Adobe Stock allows up to 50, but our diagnostic algorithm shows 25 to 45 represents the sweet spot for search index coverage.',
        'Click "Reset to Default" to immediately restore industry-standard settings (70 characters, 35 tags).'
      ],
      details: 'Modifying these settings immediately scales the prompt construction rules queried to the Gemini neural network. Note: Changing sliders does not retroactively rewrite completed scans; it guides subsequent requests.'
    },
    {
      id: 'seo-gauge',
      category: 'seo',
      title: 'Holographic SEO Optimization Gauge',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      tagline: 'Verify commercial search readiness with a live intelligent scoring dial.',
      steps: [
        'View the 0% to 100% circular readiness progress gauge inside any expanded results tab.',
        'Color Thresholds: Red/Amber (<50%) requires immediate revision; Yellow (51%-80%) represents stable quality; Emerald Green (81%+) indicates premium indexable density.',
        'Check the live interactive SEO parameters list:',
        '✔ Title Length Sweetspot Check: Ensures the title matches 45-110 characters.',
        '✔ Keyword Volume Check: Ensures the asset features 25+ keywords.',
        '✔ Gold Star Sync: Highlights that the critical Gold Seed Zone holds at least 5 prioritized tags.'
      ],
      details: 'This scoring matches live stock indexing standards. As you edit text fields and re-arrange keywords, the gauge dynamically calculates and updates your rating instantly!'
    },
    {
      id: 'keywords-workspace',
      category: 'seo',
      title: 'Interactive Keywords Sorter Workspace',
      icon: <ArrowBigUp className="w-5 h-5 text-yellow-400" />,
      tagline: 'Prioritize keywords to leverage Adobe Stock’s search ranking algorithms.',
      steps: [
        'Gold Seed zone (First 5 Tags): Adobe Stock assigns extreme index weight to the first 5 keywords. These are showcased inside Gold Crown border blocks labeled #1 through #5.',
        'Single-Click Promotion: Click any keyword in the regular tag pool below to immediately bump it to the #1 Gold Slot. Existing tags shift down gracefully.',
        'Up & Down Priority Changers: Use micro-arrows on tags to shift their order increment by increment.',
        'Delete & Remove Tags: Click the "X" button on any keyword to prune generic tags.',
        'Manual Addition: Type custom tags comma-separated into the bottom text injector bar and click "Add Tag" for bulk manual injections.',
        'Double-Click Editing: Double-click any text bubble to activate inline text replacement. Press Enter to confirm or Escape to abort!'
      ],
      details: 'All changes write directly back to your persistent active scan state. There is no need to manually reload pages.'
    },
    {
      id: 'rewards',
      category: 'rewards',
      title: 'Durable Points, Daily Reset & Streaks',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      tagline: 'Recharge credit reserves through our gamified loyalty rewards suite.',
      steps: [
        'Starting Capital: Regular users start with 100 free PTS credits upon initial Google Authentication.',
        'Daily 6:00 AM Reset: Log in daily to secure an automatic 50 PTS top-up. The system checks against UTC cycles on launch to boost active users.',
        'Daily Reward Lootbox Booster: Venture to the Loyalty Zone, click "Activate Daily Booster" once daily and roll a guaranteed random prize of +10 to +25 PTS!',
        'Sustained Visiting Streaks: Logging in consecutive days increment your fire streak. Maximize streaks to support claim validity.',
        'Auth Sync Guard: Authenticate with Google to back up and lock points permanently on Firestore databases.'
      ],
      details: 'Point values and claim dates protect themselves in our secure server-side Firestore operations to prevent client manipulation. Guest users operate under localStorage backup state.'
    },
    {
      id: 'privacy',
      category: 'privacy',
      title: 'Enterprise Data Privacy & Bulk Exports',
      icon: <Download className="w-5 h-5 text-[#00f3ff]" />,
      tagline: 'Extract commercial stock values while maintaining perfect privacy limits.',
      steps: [
        '60-Minute Memory Auto-Wipe: For strict compliance and local security, all local browser state images and raw binaries are permanently purged after 60 minutes of inactivity.',
        'Individual CSV Export: Labeled "CSV" icon inside results header. Instantly downloads optimized, RFC-compliant layout format of that specific file.',
        'Bulk Export: Labeled "Export CSV" or "Bulk Export (Adobe Stock CSV)". Downloads a consolidated multi-row spreadsheet matching precise filename, title, and keywords columns.'
      ],
      details: 'Created spreadsheets are formatted perfectly to plug straight into Adobe Stock contributor portals, bypassing manual copy-pasting entirely.'
    },
    {
      id: 'admin',
      category: 'admin',
      title: 'Administrative Security Protocol (Admins Only)',
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      tagline: 'Authorized site controllers gain server-level user and security dials.',
      steps: [
        'Security Status Audit: Monitor registered users, login hostnames, roles, and points balances live.',
        'Credit Adjustments: Admin-integrated controls allow direct +/-10, +/-1 adjustments, or custom specific override points.',
        'Access Termination (Ban/Unban): Quarantine flagged users instantly. Set specific public reason codes explaining policy violations.',
        'Strict Account Shielding: System administrators hold terminal immunities; the master admin account can never be self-deactivated.'
      ],
      details: 'Requires configured Admin privileges (' + 'sajewel132@gmail.com) synced with Firestore profile credentials.'
    }
  ];

  const filteredSections = manualSections.filter(section => {
    const categoryMatches = activeCategory === 'all' || section.category === activeCategory;
    const searchMatches = 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase())) ||
      section.details.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && searchMatches;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">METAGEN.AI Complete Manual</h2>
              <p className="text-xs text-gray-400">Step-by-step documentation and configuration secrets for maximum indexing reach.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-cyan-950/20 border border-cyan-500/10 px-3 py-1 bg-black/40 rounded-full w-fit">
            <QuestionIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">HELP STATION V1.4</span>
          </div>
        </div>
      </div>

      {/* Control Station */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keyword sorting, rewards levels..."
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>

        {/* Categories togglers */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl w-fit">
          {(['all', 'basics', 'seo', 'rewards', 'privacy', 'admin'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                activeCategory === cat
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-gray-400 hover:text-white border border-transparent"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Content Accordion */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="glass-panel p-16 text-center opacity-65 space-y-3">
            <HelpCircle className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">No matching guidelines found</h4>
            <p className="text-xs text-gray-500">Simplify your search terms or verify your category filter tab.</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const isCurrentlyExpanded = expandedSection === section.id;
            return (
              <div 
                key={section.id} 
                className={cn(
                  "glass-panel border-white/5 overflow-hidden transition-all duration-300",
                  isCurrentlyExpanded ? "ring-1 ring-cyan-500/30 border-cyan-500/25 bg-cyan-950/5" : "hover:border-white/10"
                )}
              >
                {/* Section trigger */}
                <div 
                  onClick={() => setExpandedSection(isCurrentlyExpanded ? null : section.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:scale-105 transition-all">
                      {section.icon}
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-cyan-500 uppercase tracking-widest font-mono">
                        {section.category}
                      </span>
                      <h3 className="text-sm font-black text-white mt-0.5">{section.title}</h3>
                    </div>
                  </div>
                  <div>
                    {isCurrentlyExpanded ? (
                      <ChevronDown className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Extended guide steps with nice spacing */}
                <AnimatePresence>
                  {isCurrentlyExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="p-6 pt-0 border-t border-white/5 space-y-5">
                        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-cyan-400 italic font-medium leading-relaxed">
                            "{section.tagline}"
                          </p>
                        </div>

                        {/* List of actions/steps */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black tracking-widest text-white uppercase flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-gray-400" /> OPERATION PROTOCOL
                          </h4>
                          <div className="space-y-2.5">
                            {section.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-300">
                                <span className="font-mono text-cyan-500 bg-cyan-950/30 border border-cyan-500/20 w-5 h-5 flex items-center justify-center rounded shrink-0 text-[10px] font-black">
                                  {idx + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Technical detail footer label */}
                        <div className="pt-4 border-t border-white/5">
                          <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Architectural Insight</span>
                          <p className="text-[11px] text-gray-400/80 leading-relaxed font-mono">
                            {section.details}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Gamified Loyalty Card mini widget */}
      <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-yellow-500/15 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl relative">
            <Flame className="w-5 h-5 fill-current text-yellow-500 animate-[bounce_1.8s_infinite]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">HAVE QUESTIONS ON ACCUMULATED CREDITS?</h4>
            <p className="text-[10px] text-gray-400">Remember, you can claim free +10 to +25 PTS daily boosters under Stock Settings!</p>
          </div>
        </div>
        <div className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3.5 py-1.5 rounded-xl border border-yellow-500/20 shrink-0">
          Earn +50 pts every UTC calendar day
        </div>
      </div>
    </div>
  );
};
