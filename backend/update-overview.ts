import * as fs from 'fs';
import * as path from 'path';

const overviewPath = path.join(process.cwd(), '../frontend/src/components/dashboard/sections/overview-section.tsx');
let content = fs.readFileSync(overviewPath, 'utf8');

// Ensure imports for ScheduleDemoModal and Bot icon are present
if (!content.includes('ScheduleDemoModal')) {
  content = content.replace(
    /import { ProductTour, TourStep } from '@\/components\/ui\/product-tour'/,
    `import { ProductTour, TourStep } from '@/components/ui/product-tour'\nimport { ScheduleDemoModal } from '@/components/modals/ScheduleDemoModal'`
  );
}
if (!content.includes('Bot,')) {
  content = content.replace(
    /Sparkles } from 'lucide-react'/,
    `Sparkles, Bot, Calendar } from 'lucide-react'`
  );
}

// Add state for Demo Modal
if (!content.includes('isDemoModalOpen')) {
  content = content.replace(
    /const \[isTourOpen, setIsTourOpen\] = useState\(false\)/,
    `const [isTourOpen, setIsTourOpen] = useState(false)\n  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)`
  );
}

// Add the two cards UI right before the Welcome Section motion.div
const cardsUI = `
      {/* HR Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Book a Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl bg-[#0f172a] p-6 shadow-lg border border-slate-800"
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Book a Demo</h3>
              <p className="text-slate-300 text-sm mt-1">Schedule a session with our team to learn how to maximize your hiring process.</p>
            </div>
            <Button 
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white w-full sm:w-auto self-start border-none shadow-md transition-transform hover:scale-105"
            >
              Schedule now
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Calendar className="h-40 w-40 transform translate-x-8 translate-y-8" />
          </div>
        </motion.div>

        {/* HR Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-[#1e1b4b] p-6 shadow-lg border border-indigo-900"
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mb-3">
                <Bot className="h-5 w-5 text-indigo-200" />
              </div>
              <h3 className="text-xl font-semibold text-white">HR Assistant</h3>
              <p className="text-indigo-200/80 text-sm mt-1">Have a question? Ask our AI assistant for instant help with your recruitment tasks.</p>
            </div>
            <Button 
              onClick={() => {
                // Dispatch custom event to open ChatbotWidget
                document.dispatchEvent(new CustomEvent('open-hr-assistant'));
              }}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white w-full sm:w-auto self-start border-none shadow-md transition-transform hover:scale-105"
            >
              Ask a question
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Bot className="h-40 w-40 transform translate-x-8 translate-y-8 text-indigo-300" />
          </div>
        </motion.div>
      </div>

      <ScheduleDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
`;

if (!content.includes('HR Action Cards')) {
  content = content.replace(
    /\{\/\* Welcome Section with Job Selector \*\/\}/,
    `${cardsUI}\n      {/* Welcome Section with Job Selector */}`
  );
  fs.writeFileSync(overviewPath, content);
  console.log('Added HR Action cards to OverviewSection');
} else {
  console.log('Cards already exist');
}
