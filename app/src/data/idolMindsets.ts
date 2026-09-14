
export interface IdolMindset {
    name: string;
    archetypeTitle: string; // What they call the user (e.g. "Future Legend")
    quote: string;
    voice: {
        tone: string;
        intro: string; // "I see a lot of myself in you..."
    };
    missions: Record<string, { // Keyed by Gap Trait (e.g. 'discipline')
        title: string;
        desc: string;
        xp: string;
    }>;
    profile: {
        motivation: string;
        risk: string;
        emotional: string;
        social: string;
        passion: string;
        coreValue: string;
    };
    avatarUrl?: string;
}

export const IDOL_MINDSETS: Record<string, IdolMindset> = {
    "Arnold Schwarzenegger": {
        name: "Arnold Schwarzenegger",
        archetypeTitle: "Iron Conqueror",
        quote: "Strength does not come from winning. Your struggles develop your strengths.",
        voice: {
            tone: "Powerful, Direct, No-Nonsense",
            intro: "Listen to me using your own voice. You have the raw material, but do you have the will?"
        },
        missions: {
            discipline: { title: "The Extra Rep", desc: "Do one task today that you absolutely hate doing. Do it perfectly.", xp: "+50 Iron Will" },
            resilience: { title: "Get to the Choppa", desc: "When you fail today (and you will), laugh at it and go again immediately.", xp: "+50 Toughness" },
            risk: { title: "Break the Rules", desc: "Do something unconventional today. Shock the system.", xp: "+50 Boldness" },
            leadership: { title: "Command Presence", desc: "Walk into a room like you own it. Shoulders back, head up.", xp: "+50 Presence" },
            creativity: { title: "Sculpt Your Vision", desc: " visualize your goal clearly. Put it on paper.", xp: "+50 Vision" },
            empathy: { title: "Lift Others", desc: "Spot the weakest person in the room and make them feel strong.", xp: "+50 Heart" },
            vision: { title: "The Blueprint", desc: "Write down exactly where you want to be in 10 years.", xp: "+50 Focus" }
        },
        profile: {
            motivation: 'Fame',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Competitive',
            coreValue: 'Success'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_arnold.webp'
    },
    "Stephen Hawking": {
        name: "Stephen Hawking",
        archetypeTitle: "Cosmic Explorer",
        quote: "Intelligence is the ability to adapt to change.",
        voice: {
            tone: "Intellectual, Cosmic, Dry Wit",
            intro: "Your mind is a singularity of potential. Let us observe the data of your choices."
        },
        missions: {
            discipline: { title: "Universal Constant", desc: "Focus on a single complex problem for 20 minutes without diversion.", xp: "+50 Focus" },
            resilience: { title: "Event Horizon", desc: "When blocked, find an alternative path. There is always a way out of a black hole.", xp: "+50 Adaptability" },
            risk: { title: "Quantum Leap", desc: "Propose an idea that sounds impossible. Theory precedes reality.", xp: "+50 Imagination" },
            leadership: { title: "Grand Design", desc: "Explain a complex idea simply to someone else.", xp: "+50 Clarity" },
            creativity: { title: "Theory of Everything", desc: "Connect two completely unrelated concepts into one solution.", xp: "+50 Synthesis" },
            empathy: { title: "Human Connection", desc: "Observe human behavior today without judgment, only curiosity.", xp: "+50 Observation" },
            vision: { title: "Time Traveler", desc: "Imagine the consequences of your next decision 100 years from now.", xp: "+50 Foresight" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Balanced',
            emotional: 'Analytical',
            social: 'Observer',
            passion: 'Intellectual',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_hawking.webp'
    },
    "Frida Kahlo": {
        name: "Frida Kahlo",
        archetypeTitle: "Vivid Soul",
        quote: "I paint my own reality.",
        voice: {
            tone: "Emotional, Raw, Artistic",
            intro: "I see the colors of your soul. You are not afraid of the pain, are you?"
        },
        missions: {
            discipline: { title: "Ritual of Art", desc: "Commit to your craft for 1 hour, even if your heart feels heavy.", xp: "+50 Devotion" },
            resilience: { title: "Beautiful Scars", desc: "Take a painful memory and turn it into something creative today.", xp: "+50 Depth" },
            risk: { title: "Expose Yourself", desc: "Share a truth about yourself that you usually hide.", xp: "+50 Authenticity" },
            leadership: { title: "Matriarch", desc: "Stand firm in your truth when others disagree.", xp: "+50 Conviction" },
            creativity: { title: "Paint Reality", desc: "Create something—anything—that reflects how you feel right now.", xp: "+50 Expression" },
            empathy: { title: "Deep Roots", desc: "Ask someone about their pain, not just their day.", xp: "+50 Connection" },
            vision: { title: "Dream Awake", desc: "Daydream vividly about your masterpiece lifestyle.", xp: "+50 Dreaming" }
        },
        profile: {
            motivation: 'Freedom',
            risk: 'Bold',
            emotional: 'Sensitive',
            social: 'Creator',
            passion: 'Creative',
            coreValue: 'Art'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_frida.webp'
    },
    "Kobe Bryant": {
        name: "Kobe Bryant",
        archetypeTitle: "Mamba Disciple",
        quote: "Rest at the end, not in the middle.",
        voice: {
            tone: "Obsessive, Competitive, Mythical",
            intro: "Talent is boring. I’m looking for your obsession. Let's see if you have it."
        },
        missions: {
            discipline: { title: "4 AM Club", desc: "Start your work before anyone else wakes up.", xp: "+50 Obsession" },
            resilience: { title: "Airball Recovery", desc: "Miss a shot? Shoot 100 more immediately.", xp: "+50 Grit" },
            risk: { title: "Take the Shot", desc: "Volunteer for the task everyone else is afraid of.", xp: "+50 Clutch" },
            leadership: { title: "Demand Excellence", desc: "Hold a teammate accountable to a higher standard.", xp: "+50 Command" },
            creativity: { title: "Study the Tape", desc: "Analyze a master in your field. Copy their footwork.", xp: "+50 Study" },
            empathy: { title: "Team Glue", desc: "Understand what motivates your teammates. Learn their story.", xp: "+50 Bond" },
            vision: { title: "Championship Mind", desc: "Visualize the confetti falling. Feel the ring.", xp: "+50 Focus" }
        },
        profile: {
            motivation: 'Fame',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Competitive',
            coreValue: 'Success'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_kobe.webp'
    },
    "Taylor Swift": {
        name: "Taylor Swift",
        archetypeTitle: "Master Storyteller",
        quote: "People haven't always been there for me, but music has.",
        voice: {
            tone: "Personal, Narrative, Resilient",
            intro: "Every choice you make is a lyric in your song. Let's read the bridge together."
        },
        missions: {
            discipline: { title: "Studio Time", desc: "Finish the project you started. Don't leave it as a demo.", xp: "+50 Finish" },
            resilience: { title: "Snake into Butterfly", desc: "Take a criticism and write your way out of it.", xp: "+50 Rebirth" },
            risk: { title: "Change Genre", desc: "Pivot your approach completely. Try a new style.", xp: "+50 Reinvention" },
            leadership: { title: "Squad Goals", desc: "Celebrate a friend's success publicly.", xp: "+50 Support" },
            creativity: { title: "Write it Down", desc: "Journal your raw feelings about a problem. Find the hook.", xp: "+50 Songwriting" },
            empathy: { title: "Fan Love", desc: "Send a genuine thank you note to someone who supports you.", xp: "+50 Gratitude" },
            vision: { title: "The Eras Tour", desc: "Plan your next 'Era'. Who will you be next year?", xp: "+50 Identity" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Balanced',
            emotional: 'Sensitive',
            social: 'Creator',
            passion: 'Empathic',
            coreValue: 'Kindness'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_taylor_swift.webp'
    },
    "Mark Zuckerberg": {
        name: "Mark Zuckerberg",
        archetypeTitle: "System Architect",
        quote: "Move fast and break things.",
        voice: {
            tone: "Analytical, Hacker, Future-Focused",
            intro: "Code connects the world. Your mind is the algorithm. Let’s optimize it."
        },
        missions: {
            discipline: { title: "Code Sprint", desc: "Work in a deep flow state for 90 minutes. No notifications.", xp: "+50 Flow" },
            resilience: { title: "Bug Fix", desc: "Treat a personal failure as a bug. Patch it and redeploy.", xp: "+50 Iteration" },
            risk: { title: "Ship It", desc: "Launch something before it's perfect. Get data.", xp: "+50 Speed" },
            leadership: { title: "The Mission", desc: "Align your team on the one metric that matters.", xp: "+50 Alignment" },
            creativity: { title: "Hackathon", desc: "Build a prototype of a new idea in under an hour.", xp: "+50 Hacking" },
            empathy: { title: "User Research", desc: "Watch how someone actually uses your work. Don't guess.", xp: "+50 Data" },
            vision: { title: "Metaverse", desc: "Imagine how technology will change your field in 10 years.", xp: "+50 Scale" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Analytical',
            social: 'Leader',
            passion: 'Intellectual',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/zuck_happy.webp'
    },
    "Steve Jobs": {
        name: "Steve Jobs",
        archetypeTitle: "Crazy One",
        quote: "Stay hungry. Stay foolish.",
        voice: {
            tone: "Visionary, Minimalist, Intense",
            intro: "Everything around you was made by people no smarter than you. You can change it."
        },
        missions: {
            discipline: { title: "Focus is No", desc: "Say 'No' to a good opportunity so you can focus on a great one.", xp: "+50 Focus" },
            resilience: { title: "The Wilderness", desc: "If you get fired/rejected, build NeXT. Start over deeper.", xp: "+50 Rebound" },
            risk: { title: "Distort Reality", desc: "Convince yourself a deadline is possible when it isn't.", xp: "+50 Belief" },
            leadership: { title: "A-Players Only", desc: "Give direct, honest feedback to elevate someone's work.", xp: "+50 Standards" },
            creativity: { title: "Connect the Dots", desc: "Take a calligraphy class (or equivalent). Learn beauty.", xp: "+50 Taste" },
            empathy: { title: "User Experience", desc: "Design an interaction that feels magical for the user.", xp: "+50 Intuition" },
            vision: { title: "Dent the Universe", desc: "What are you building that will outlast you?", xp: "+50 Legacy" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Creative',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_steve_jobs.webp'
    },
    "Walt Disney": {
        name: "Walt Disney",
        archetypeTitle: "Dream Weaver",
        quote: "It's kind of fun to do the impossible.",
        voice: {
            tone: "Whimsical, Optimistic, Grand",
            intro: "If you can dream it, you can do it. Let's look at your imagination."
        },
        missions: {
            discipline: { title: "Keep Moving Forward", desc: "Don't look back. Take the next step on your project now.", xp: "+50 Progress" },
            resilience: { title: "Oswald to Mickey", desc: "Lost your best idea? Draw a better one immediately.", xp: "+50 Magic" },
            risk: { title: "Mortgage it All", desc: "Bet big on your vision. Commit fully to one path.", xp: "+50 Belief" },
            leadership: { title: "Imagineering", desc: "Inspire your team with a story, not a spreadsheet.", xp: "+50 Story" },
            creativity: { title: "Plus It", desc: "Take your current work and add one magical detail.", xp: "+50 Detail" },
            empathy: { title: "Make 'Em Smile", desc: "Do something just to bring joy to someone else.", xp: "+50 Joy" },
            vision: { title: "EPCOT", desc: "Design your ideal city/world. Draw it out.", xp: "+50 Future" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Creative',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_walt_disney.webp'
    },
    "Michael Jackson": {
        name: "Michael Jackson",
        archetypeTitle: "King of Pop",
        quote: "In a world filled with hate, we must still dare to hope. In a world filled with anger, we must still dare to comfort.",
        voice: {
            tone: "Soft, Intense, Passionate",
            intro: "I hear the music in you. Every step, every beat... it all matters. Let's see what you will build."
        },
        missions: {
            discipline: { title: "Perfection in Rehearsal", desc: "Repeat a difficult routine or task 10 times until it is second nature.", xp: "+50 Precision" },
            resilience: { title: "The Show Goes On", desc: "When facing a major setback today, push through and finish what you started.", xp: "+50 Rhythm" },
            risk: { title: "The Moonwalk", desc: "Take a creative risk that goes against what others expect from you.", xp: "+50 Boldness" },
            leadership: { title: "Direct the Stage", desc: "Take charge of a presentation or coordination, ensuring every detail fits your vision.", xp: "+50 Stage Presence" },
            creativity: { title: "Innovate the Costume", desc: "Add a unique, personal touch to your outfit or workspaces today.", xp: "+50 Magic" },
            empathy: { title: "Heal the World", desc: "Do a kind act today for someone who is feeling overwhelmed or left behind.", xp: "+50 Compassion" },
            vision: { title: "Thriller Scope", desc: "Plan a project on a scale that is twice as large as anything you have done before.", xp: "+50 Imagination" }
        },
        profile: {
            motivation: 'Fame',
            risk: 'Bold',
            emotional: 'Sensitive',
            social: 'Creator',
            passion: 'Creative',
            coreValue: 'Art'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp'
    },
    "Ashneer Grover": {
        name: "Ashneer Grover",
        archetypeTitle: "Truth Teller",
        quote: "Make a business that makes money. The rest is just vanity.",
        voice: {
            tone: "Direct, Brutal, Pragmatic",
            intro: "I don't deal in sugarcoated words. Tell me what you're actually building, or don't waste my time."
        },
        missions: {
            discipline: { title: "Dhanda First", desc: "Spend 2 hours today working purely on revenue-generating actions.", xp: "+50 Grit" },
            resilience: { title: "Duggal Sahab", desc: "Ignore advice from fake gurus today. Trust the numbers.", xp: "+50 Truth" },
            risk: { title: "Doglapan Check", desc: "Speak an uncomfortable truth directly to someone. No filters.", xp: "+50 Audacity" },
            leadership: { title: "Command the Boardroom", desc: "Take a decision based on logic, even if the entire group hates it.", xp: "+50 Resolve" },
            creativity: { title: "Disrupt the Space", desc: "Find a simple, low-cost hack to speed up your workflow.", xp: "+50 Hustle" },
            empathy: { title: "Filter the Noise", desc: "Help a colleague see through their own excuses and focus on reality.", xp: "+50 Reality" },
            vision: { title: "Scale to Unicorn", desc: "Write a business plan that is profitable from day one.", xp: "+50 Scale" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Analytical',
            social: 'Leader',
            passion: 'Competitive',
            coreValue: 'Success'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ashneer-grover.webp'
    },
    "Bhuvan Bam": {
        name: "Bhuvan Bam",
        archetypeTitle: "Master Creator",
        quote: "Our work is our identity. Do not let scale dilute the purity of your craft.",
        voice: {
            tone: "Warm, Humorous, Relatable",
            intro: "Hey, nice to meet you. I know how it feels when everything moves too fast. Let's keep our feet on the ground."
        },
        missions: {
            discipline: { title: "One-Man Show", desc: "Write, shoot, and edit a short piece of work entirely by yourself today.", xp: "+50 Craft" },
            resilience: { title: "Ignore the Critics", desc: "When facing doubt or negative comments today, smile and continue creating.", xp: "+50 Smile" },
            risk: { title: "The Next Character", desc: "Try a completely new style or character in your work today. Surprise yourself.", xp: "+50 Versatility" },
            leadership: { title: "Keep it Close", desc: "Refuse to delegate a key creative decision; own it completely.", xp: "+50 Ownership" },
            creativity: { title: "Household Hack", desc: "Create something amazing using only the basic tools or props in your room.", xp: "+50 Resourcefulness" },
            empathy: { title: "Connect to the Roots", desc: "Have a genuine conversation with an old friend who knew you before any success.", xp: "+50 Humility" },
            vision: { title: "Artist's Dream", desc: "Write down your ultimate creative project that goes beyond short-form videos.", xp: "+50 Legacy" }
        },
        profile: {
            motivation: 'Fame',
            risk: 'Bold',
            emotional: 'Sensitive',
            social: 'Creator',
            passion: 'Creative',
            coreValue: 'Art'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhuvan-bam.webp'
    },
    "Cristiano Ronaldo": {
        name: "Cristiano Ronaldo",
        archetypeTitle: "Ultimate Competitor",
        quote: "Your love makes me strong, your hate makes me unstoppable.",
        voice: {
            tone: "Intense, Confident, Demanding",
            intro: "To be the best, there is no compromise. Every detail, every training session, every single day. Let's start."
        },
        missions: {
            discipline: { title: "Uncompromising Practice", desc: "Arrive 1 hour early and leave 1 hour late for your primary task today.", xp: "+50 Precision" },
            resilience: { title: "San Siro Response", desc: "Turn public criticism or a setback today into fuel for your next achievement.", xp: "+50 Drive" },
            risk: { title: "Attack the Defended", desc: "Take on the most difficult problem or opponent in your area today.", xp: "+50 Audacity" },
            leadership: { title: "Set the Benchmark", desc: "Lead by absolute example, showing everyone what maximum effort looks like.", xp: "+50 Standards" },
            creativity: { title: "Unstoppable Routine", desc: "Design a new personal routine or technique that makes you faster and more effective.", xp: "+50 Efficiency" },
            empathy: { title: "Lift the Squad", desc: "Encourage a struggling teammate to raise their game to match the highest standard.", xp: "+50 Synergy" },
            vision: { title: "Ballon d'Or Scope", desc: "Set a target that others say is completely out of reach, and plan the steps to get there.", xp: "+50 Ambition" }
        },
        profile: {
            motivation: 'Success',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Competitive',
            coreValue: 'Achievement'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-cristiano-ronaldo.webp'
    },
    "Ranveer Singh": {
        name: "Ranveer Singh",
        archetypeTitle: "Electric Performer",
        quote: "Express yourself without fear. Put 100% of your energy into whatever you touch.",
        voice: {
            tone: "High-Energy, Passionate, Fearless",
            intro: "Hey! Life is too short to play it small. Whatever you're working on today, give it everything!"
        },
        missions: {
            discipline: { title: "Copywriting Rigor", desc: "Complete a routine professional task with absolute focus before chasing creative work.", xp: "+50 Runway" },
            resilience: { title: "Audition Rejection", desc: "Bounce back immediately after receiving a 'no' today and double your efforts.", xp: "+50 Energy" },
            risk: { title: "Audacious Pitch", desc: "Showcase your work or talent to someone influential, despite fear of judgment.", xp: "+50 Passion" },
            leadership: { title: "Set-Floor Presence", desc: "Bring infectious energy to a group project to elevate everyone's mood.", xp: "+50 Magnetism" },
            creativity: { title: "Unapologetic Style", desc: "Inject raw originality and vibrant energy into your work today.", xp: "+50 Flair" },
            empathy: { title: "Listen to the Director", desc: "Observe and assist someone else's vision with total dedication.", xp: "+50 Proximity" },
            vision: { title: "Band Baaja Vision", desc: "Commit to a long-term dream even when there is no immediate proof of success.", xp: "+50 Breakthrough" }
        },
        profile: {
            motivation: 'Fame',
            risk: 'Bold',
            emotional: 'Passionate',
            social: 'Creator',
            passion: 'Creative',
            coreValue: 'Art'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ranveer-singh.webp'
    },
    "Alia Bhatt": {
        name: "Alia Bhatt",
        archetypeTitle: "Chameleon Star",
        quote: "Don't get too comfortable. If you don't surprise yourself, you will never surprise the audience.",
        voice: {
            tone: "Earnest, Curious, Determined",
            intro: "Hi! Every role is a chance to learn something new about human nature. Let's see what boundaries we can push today."
        },
        missions: {
            discipline: { title: "Character Preparation", desc: "Spend dedicated time today mastering an unfamiliar skill for your project.", xp: "+50 Craft" },
            resilience: { title: "Beyond Expectations", desc: "Ignore preconceived labels and perform with quiet focus.", xp: "+50 Grit" },
            risk: { title: "Unconventional Role", desc: "Say yes to a task or project that steps outside your comfort zone.", xp: "+50 Courage" },
            leadership: { title: "Anchor the Scene", desc: "Support your team members so that the collective performance shines.", xp: "+50 Presence" },
            creativity: { title: "Emotional Range", desc: "Explore a deeper, more nuanced emotion in your creative expression today.", xp: "+50 Depth" },
            empathy: { title: "Understand the Character", desc: "Listen deeply to someone whose life experiences are completely different from yours.", xp: "+50 Perspective" },
            vision: { title: "Beyond the Stars", desc: "Plan your development around long-term mastery rather than short-term acclaim.", xp: "+50 Legacy" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Sensitive',
            social: 'Creator',
            passion: 'Creative',
            coreValue: 'Excellence'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-alia-bhatt.webp'
    },
    "Bhagat Singh": {
        name: "Bhagat Singh",
        archetypeTitle: "Unshakable Idealist",
        quote: "They may kill me, but they cannot kill my ideas. They can crush my body, but they will not be able to crush my spirit.",
        voice: {
            tone: "Resolute, Intellectual, Courageous",
            intro: "Injustice prospers only when good people stay silent. Stand firm in your principles today, no matter the cost."
        },
        missions: {
            discipline: { title: "Unbending Resolve", desc: "Stick to a difficult moral commitment today without compromise.", xp: "+50 Integrity" },
            resilience: { title: "Endure the Trial", desc: "Maintain your composure and dignity in the face of unfair criticism.", xp: "+50 Fortitude" },
            risk: { title: "Speak Truth to Power", desc: "Challenge a flawed process or unjust rule publicly.", xp: "+50 Defiance" },
            leadership: { title: "Unify the Cause", desc: "Rally others around a shared principle rather than personal gain.", xp: "+50 Solidarity" },
            creativity: { title: "The Written Manifesto", desc: "Articulate your core beliefs clearly in writing to inspire others.", xp: "+50 Conviction" },
            empathy: { title: "Stand with the Oppressed", desc: "Advocate for someone who is being treated unfairly.", xp: "+50 Justice" },
            vision: { title: "Legacy of Freedom", desc: "Make a choice today that benefits future generations rather than yourself.", xp: "+50 Purpose" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Competitive',
            coreValue: 'Justice'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhagat-singh.webp'
    },
    "Oprah Winfrey": {
        name: "Oprah Winfrey",
        archetypeTitle: "Soul Connector",
        quote: "Turn your wounds into wisdom.",
        voice: {
            tone: "Warm, Spiritual, Empowering",
            intro: "The biggest adventure you can take is to live the life of your dreams."
        },
        missions: {
            discipline: { title: "Intention", desc: "Start every meeting today by stating the intention.", xp: "+50 Purpose" },
            resilience: { title: "Fail Up", desc: "Identify a failure that pointed you to a new path.", xp: "+50 Wisdom" },
            risk: { title: "Bet on You", desc: "Invest in yourself today. Buy the book, take the course.", xp: "+50 Self-Worth" },
            leadership: { title: "Lift While Climbing", desc: "Promote someone else's work who deserves it.", xp: "+50 Generosity" },
            creativity: { title: "Aha Moment", desc: "Read something spiritual or deep. Find a breakthrough.", xp: "+50 Insight" },
            empathy: { title: "Deep Listening", desc: "Listen to someone's story until they cry (or laugh).", xp: "+50 Connection" },
            vision: { title: "Vision Board", desc: "Cut out images that represent your highest self.", xp: "+50 Manifestation" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Balanced',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Empathic',
            coreValue: 'Kindness'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_oprah.webp'
    },
    "Bill Gates": {
        name: "Bill Gates",
        archetypeTitle: "Global Architect",
        quote: "Content is king.",
        voice: {
            tone: "Analytical, Pragmatic, Optimistic",
            intro: "We overestimate what we can do in two years and underestimate ten."
        },
        missions: {
            discipline: { title: "Think Week", desc: "Dedicate 1 hour to pure reading and thinking.", xp: "+50 Knowledge" },
            resilience: { title: "Feedback Loop", desc: "Ask for negative feedback specifically.", xp: "+50 Growth" },
            risk: { title: "The Bluff", desc: "Commit to a deliverable you haven't built yet.", xp: "+50 Pressure" },
            leadership: { title: "Empowerment", desc: "Give your team the tools they need, then step back.", xp: "+50 Scale" },
            creativity: { title: "Solve Hard Problems", desc: "Pick a global problem. Sketch a solution.", xp: "+50 Impact" },
            empathy: { title: "Philanthropy", desc: "Give time or money to a cause efficiently.", xp: "+50 Aid" },
            vision: { title: "Information Highway", desc: "Predict the next big platform shift.", xp: "+50 Trend" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Balanced',
            emotional: 'Analytical',
            social: 'Leader',
            passion: 'Intellectual',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_bill_gates.webp'
    },
    "J.K. Rowling": {
        name: "J.K. Rowling",
        archetypeTitle: "Phoenix Creator",
        quote: "Rock bottom became the solid foundation on which I rebuilt my life.",
        voice: {
            tone: "Imaginative, Resilient, Honest",
            intro: "Failure is so important. It is the ability to resist failure or use failure that often leads to greater success."
        },
        missions: {
            discipline: { title: "Cafe Writer", desc: "Write for 2 hours in a distracting environment. Focus inward.", xp: "+50 Focus" },
            resilience: { title: "Rejection Letter", desc: "Read a rejection letter or critique, then keep working instantly.", xp: "+50 Steel" },
            risk: { title: "Dream World", desc: "Share a fantasy idea that feels 'silly' to serious people.", xp: "+50 Imagination" },
            leadership: { title: "World Builder", desc: "Define the rules of your own universe/project clearly.", xp: "+50 Structure" },
            creativity: { title: "Magic System", desc: "Create a rule for your life that feels magical.", xp: "+50 Wonder" },
            empathy: { title: "Dementors", desc: "Identify what drains you and cast a Patronus (joy) against it.", xp: "+50 Protection" },
            vision: { title: "The Train Ride", desc: "Let your mind wander for 4 hours. See what comes.", xp: "+50 Inspiration" }
        },
        profile: {
            motivation: 'Freedom',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Creator',
            passion: 'Creative',
            coreValue: 'Imagination'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_jk_rowling.webp'
    },
    "Mary Shelley": {
        name: "Mary Shelley",
        archetypeTitle: "Gothic Visionary",
        quote: "Beware; for I am fearless, and therefore powerful.",
        voice: {
            tone: "Literary, Dark, Intense",
            intro: "Creation is violent. To make something new, you must destroy the silence."
        },
        missions: {
            discipline: { title: "Midnight Oil", desc: "Write or create when the world sleeps. Silence is your ally.", xp: "+50 Focus" },
            resilience: { title: "Tragedy to Art", desc: "Take a personal loss and turn it into a story.", xp: "+50 Sublimation" },
            risk: { title: "Taboo Subject", desc: "Write about something that scares you to admit.", xp: "+50 Courage" },
            leadership: { title: "Intellectual Circle", desc: "Gather smart people and debate a radical idea.", xp: "+50 Discourse" },
            creativity: { title: "Monster Maker", desc: "Combine two innocent things to create something terrifying.", xp: "+50 Synthesis" },
            empathy: { title: "The Outsider", desc: "Talk to the person everyone else ignores.", xp: "+50 Connection" },
            vision: { title: "Sci-Fi Prediction", desc: "Write a prediction for technology 200 years from now.", xp: "+50 Futurism" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Bold',
            emotional: 'Deep',
            social: 'Introvert',
            passion: 'Literary',
            coreValue: 'Truth'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_mary_shelley.webp'
    },
    "Steven Spielberg": {
        name: "Steven Spielberg",
        archetypeTitle: "Blockbuster King",
        quote: "I dream for a living.",
        voice: {
            tone: "Wonder-filled, Narrative, Cinematic",
            intro: "The audience wants to believe. Your job is to give them the magic to do so."
        },
        missions: {
            discipline: { title: "Storyboard", desc: "Plan your entire day scene by scene before it starts.", xp: "+50 Vision" },
            resilience: { title: "Reshoot", desc: "Redo a piece of work you thought was 'good enough'. Make it great.", xp: "+50 Quality" },
            risk: { title: "The Shark is Broken", desc: "Your main tool failed? Improvise a better solution.", xp: "+50 Innovation" },
            leadership: { title: "Direct the Scene", desc: "Take charge of a chaotic situation. Give clear directions.", xp: "+50 Direction" },
            creativity: { title: "John Williams", desc: "Find the right music to change your mood instantly.", xp: "+50 Atmosphere" },
            empathy: { title: "Child's Eyes", desc: "Look at a boring problem with the wonder of a child.", xp: "+50 Wonder" },
            vision: { title: "Close Encounter", desc: "Imagine meeting your future self. What do they tell you?", xp: "+50 Destiny" }
        },
        profile: {
            motivation: 'Wonder',
            risk: 'Calculated',
            emotional: 'Empathetic',
            social: 'Storyteller',
            passion: 'Cinematic',
            coreValue: 'Imagination'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_spielberg_young.webp'
    },
    "Tina Dabi": {
        name: "Tina Dabi",
        archetypeTitle: "Strategic Topper",
        quote: "Success is 1% inspiration and 99% regulation.",
        voice: {
            tone: "Focused, Disciplined, Clear",
            intro: "The syllabus is vast, but your time is limited. Let's optimize your path."
        },
        missions: {
            discipline: { title: "Newspaper Ritual", desc: "Read editorial analysis for 45 mins. Summarize in 3 bullet points.", xp: "+50 Current Affairs" },
            resilience: { title: "Mock Test Fall", desc: "Score low on a practice test? Analyze every mistake immediately.", xp: "+50 Correction" },
            risk: { title: "Exam Strategy", desc: "Change your strategy 1 month before the exam if data says it's failing.", xp: "+50 Pivot" },
            leadership: { title: "Public Service", desc: "Identify one policy that could improve your neighborhood.", xp: "+50 Governance" },
            creativity: { title: "Answer Writing", desc: "Structure a complex argument in a simple, visual flowchart.", xp: "+50 Clarity" },
            empathy: { title: "Ground Reality", desc: "Talk to someone from a different socio-economic background. Listen.", xp: "+50 Perspective" },
            vision: { title: "District Magistrate", desc: "Visualize your first day in office. What is your first order?", xp: "+50 Goal Setting" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Calculated',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Intellectual',
            coreValue: 'Service'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_tina_dabi.webp'
    },
    "Nitin Vijay (NV Sir)": {
        name: "Nitin Vijay (NV Sir)",
        archetypeTitle: "The Mentor",
        quote: "Selection is dependent on discipline and consistency.",
        voice: {
            tone: "Energetic, Hindi-English Mix, Encouraging",
            intro: "Beta, selection padhai se hota hai, baaton se nahi. Let's see your hustle."
        },
        missions: {
            discipline: { title: "Daily Target", desc: "Complete 100% of today's planned tasks before sleeping.", xp: "+50 Consistency" },
            resilience: { title: "Doubt Clearance", desc: "Don't hide your lack of knowledge. Ask the stupid question loudly.", xp: "+50 Bravery" },
            risk: { title: "The Commute", desc: "Take on a responsibility that requires you to travel or go out of your comfort zone.", xp: "+50 Hustle" },
            leadership: { title: "Guide a Junior", desc: "Teach a concept you know well to someone younger.", xp: "+50 Mentorship" },
            creativity: { title: "Simple Analogy", desc: "Explain a difficult concept using a real-world example.", xp: "+50 Clarity" },
            empathy: { title: "Family First", desc: "Do something today that actively relieves stress for your parents.", xp: "+50 Grounded" },
            vision: { title: "The Result", desc: "Visualize yourself checking your final exam/project result and seeing success.", xp: "+50 Focus" }
        },
        profile: {
            motivation: 'Stability',
            risk: 'Balanced',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Intellectual',
            coreValue: 'Success'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_nv_sir.webp'
    },
    // NEW ADDITIONS: AGE 18 INDIAN STORIES
    "Virat Kohli": {
        name: "Virat Kohli",
        archetypeTitle: "The King",
        quote: "Self-belief and hard work will always earn you success.",
        voice: {
            tone: "Intense, Aggressive, Passionate",
            intro: "The pitch doesn't care about your excuses. Show up and dominate."
        },
        missions: {
            discipline: { title: "Diet Check", desc: "Skip your favorite junk food today for a healthier alternative.", xp: "+50 Peak Fitness" },
            resilience: { title: "The Next Train", desc: "If you failed at something recently, try it again immediately without overthinking.", xp: "+50 Mental Toughness" },
            risk: { title: "Take the Shot", desc: "Speak up in a meeting or class where you usually stay quiet.", xp: "+50 Courage" },
            leadership: { title: "Frontline", desc: "Take responsibility for a team mistake.", xp: "+50 Ownership" },
            creativity: { title: "New Technique", desc: "Try a completely new way of studying or working for 1 hour.", xp: "+50 Adaptability" },
            empathy: { title: "Acknowledge the Obo", desc: "Praise a rival or competitor's good work.", xp: "+50 Big Picture" },
            vision: { title: "The Chase", desc: "Set an impossible goal for the day and break it down into overs.", xp: "+50 Masterclass" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Aggressive',
            emotional: 'Passionate',
            social: 'Leader',
            passion: 'Physical',
            coreValue: 'Excellence'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp'
    },
    "Dr. A.P.J. Abdul Kalam": {
        name: "Dr. A.P.J. Abdul Kalam",
        archetypeTitle: "The Visionary",
        quote: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.",
        voice: {
            tone: "Warm, Inspiring, Professor-like",
            intro: "Your background does not define your trajectory, my young friend. Only your dreams do."
        },
        missions: {
            discipline: { title: "Early Rise", desc: "Wake up 1 hour earlier than usual and read something inspiring.", xp: "+50 Dawn of Success" },
            resilience: { title: "Accept Rejection", desc: "Write down a recent failure and extract one positive lesson from it.", xp: "+50 Ignition" },
            risk: { title: "The Unknown", desc: "Learn about a completely different field of science or art today.", xp: "+50 Missile Mind" },
            leadership: { title: "Ignite Minds", desc: "Encourage a friend who is doubting their abilities.", xp: "+50 Empowerment" },
            creativity: { title: "Resourceful", desc: "Fix a problem using only the tools you have right now.", xp: "+50 Innovation" },
            empathy: { title: "The Newspaper", desc: "Read about the struggles of people in a different part of the world.", xp: "+50 Compassion" },
            vision: { title: "India 2020", desc: "Write down your vision for your life 10 years from now.", xp: "+50 Future Ready" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Calculated',
            emotional: 'Stoic',
            social: 'Mentor',
            passion: 'Intellectual',
            coreValue: 'Knowledge'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_apj_kalam.webp'
    },
    "Ratan Tata": {
        name: "Ratan Tata",
        archetypeTitle: "The Patriarch",
        quote: "I don't believe in taking right decisions. I take decisions and then make them right.",
        voice: {
            tone: "Calm, Dignified, Wise",
            intro: "Business is not just about profits. It is about the community you serve."
        },
        missions: {
            discipline: { title: "Quiet Work", desc: "Work for two hours completely uninterrupted.", xp: "+50 Focus" },
            resilience: { title: "The Long Game", desc: "Invest in a skill that will take years to master.", xp: "+50 Compound Interest" },
            risk: { title: "The Bold Buy", desc: "Make a bold choice today that others might doubt.", xp: "+50 Defiance" },
            leadership: { title: "Silent Leader", desc: "Lead a group project without dominating the conversation.", xp: "+50 Grace" },
            creativity: { title: "The Nano", desc: "Think of a way to make an expensive service or product accessible to the poor.", xp: "+50 Frugal Innovation" },
            empathy: { title: "Street Dogs", desc: "Feed a stray animal or help someone who cannot help you back.", xp: "+50 Kindness" },
            vision: { title: "Global Footprint", desc: "Research how your current industry operates in another country.", xp: "+50 Expansion" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Balanced',
            emotional: 'Resilient',
            social: 'Observer',
            passion: 'Intellectual',
            coreValue: 'Integrity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ratan_tata.webp'
    },
    // Age 19: Sachin Tendulkar
    "Sachin Tendulkar": {
        name: "Sachin Tendulkar",
        archetypeTitle: "The Prodigy",
        quote: "People throw stones at you and you convert them into milestones.",
        voice: {
            tone: "Humble, Focused, Relentless",
            intro: "When you step onto the pitch, nothing else exists. Just the ball."
        },
        missions: {
            discipline: { title: "The 6 AM Nets", desc: "Wake up early and practice a single skill for two hours straight.", xp: "+50 Repetition" },
            resilience: { title: "Bouncer to the Chin", desc: "Take a hard critique on your work, wipe the blood, and ask for more.", xp: "+50 Grit" },
            risk: { title: "Step Out", desc: "Take on a task assigned to someone much older/experienced.", xp: "+50 Fast Track" },
            leadership: { title: "Carrying the Weight", desc: "Produce the best results in your team when everyone else is failing.", xp: "+50 Anchor" },
            creativity: { title: "The Upper Cut", desc: "Find an unorthodox solution to a standard problem.", xp: "+50 Innovation" },
            empathy: { title: "Respect the Kit", desc: "Clean and maintain your workspace or tools with immense respect.", xp: "+50 Ritual" },
            vision: { title: "Century Mindset", desc: "Break a massive year-long goal into 100 tiny daily runs.", xp: "+50 Pacing" }
        },
        profile: {
            motivation: 'Mastery',
            risk: 'Calculated',
            emotional: 'Resilient',
            social: 'Introverted',
            passion: 'Physical',
            coreValue: 'Duty'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sachin.webp'
    },
    // Age 19: Sundar Pichai
    "Sundar Pichai": {
        name: "Sundar Pichai",
        archetypeTitle: "The Explorer",
        quote: "Wear your failure as a badge of honor.",
        voice: {
            tone: "Quiet, Analytical, Visionary",
            intro: "Information is powerful, but only if you have the curiosity to seek it."
        },
        missions: {
            discipline: { title: "The Exam Grind", desc: "Study a deeply complex topic you dislike for 3 hours, just to understand the system.", xp: "+50 Logic" },
            resilience: { title: "Hostel Survival", desc: "Navigate a highly stressful bottleneck without losing your calm demeanor.", xp: "+50 Stoicism" },
            risk: { title: "The Silicon Leap", desc: "Apply for a scholarship or position that seems entirely out of reach.", xp: "+50 Audacity" },
            leadership: { title: "Consensus Builder", desc: "Resolve an argument between two friends by finding the quiet middle ground.", xp: "+50 Diplomacy" },
            creativity: { title: "Side Quest", desc: "Spend 2 hours learning coding or a digital skill outside your major.", xp: "+50 Computing" },
            empathy: { title: "The Open Web", desc: "Explain a complex concept to someone in the simplest terms possible.", xp: "+50 Accessibility" },
            vision: { title: "Ten Years Out", desc: "Write down what technology will look like in exactly 10 years.", xp: "+50 Foresight" }
        },
        profile: {
            motivation: 'Innovation',
            risk: 'Calculated',
            emotional: 'Calm',
            social: 'Diplomatic',
            passion: 'Intellectual',
            coreValue: 'Curiosity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sundar.webp'
    },
    // Age 19: Shah Rukh Khan
    "Shah Rukh Khan": {
        name: "Shah Rukh Khan",
        archetypeTitle: "The Entertainer",
        quote: "Success is not a good teacher, failure makes you humble.",
        voice: {
            tone: "Charismatic, Intense, Witty",
            intro: "The world is a stage, and you're not meant to be in the background."
        },
        missions: {
            discipline: { title: "The Delhi Hustle", desc: "Work an exhausting 14-hour day without complaining once.", xp: "+50 Engine" },
            resilience: { title: "Channeling Grief", desc: "Take a painful personal memory and use the energy to create art.", xp: "+50 Alchemy" },
            risk: { title: "The Blank Canvas", desc: "Quit a 'secure' secondary path to go all-in on your primary passion.", xp: "+50 Obsession" },
            leadership: { title: "The Center of the Room", desc: "Command the attention of a group for 5 straight minutes with just your energy.", xp: "+50 Charisma" },
            creativity: { title: "Improvise", desc: "Take a boring prompt or assignment and make it wildly entertaining.", xp: "+50 Flair" },
            empathy: { title: "Look Them in the Eye", desc: "Make someone feel like they are the only person in the room.", xp: "+50 Connection" },
            vision: { title: "The King's Plan", desc: "Visualize yourself at the absolute top of your field. Write it down.", xp: "+50 Audacity" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Bold',
            emotional: 'Passionate',
            social: 'Extroverted',
            passion: 'Creative',
            coreValue: 'Ambition'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp'
    },
    // Generic fallback for others
    "Default": {
        name: "Mentor",
        archetypeTitle: "Rising Star",
        quote: "Success is a journey",
        voice: { tone: "Supportive", intro: "Let's look at your progress." },
        missions: {
            discipline: { title: "Streak Master", desc: "Do one task 3 days in a row.", xp: "+50 Grit" },
            resilience: { title: "Bounce Back", desc: "Fail at something small today.", xp: "+50 Toughness" },
            risk: { title: "Wild Card", desc: "Share a raw, unfinished idea.", xp: "+50 Bravery" },
            leadership: { title: "Captain", desc: "Help a teammate win.", xp: "+50 Influence" },
            creativity: { title: "Remix", desc: "Combine two unrelated hobbies.", xp: "+50 Innovation" },
            empathy: { title: "Listener", desc: "Ask 3 questions before talking.", xp: "+50 Heart" },
            vision: { title: "Futurist", desc: "Write your 5-year headline.", xp: "+50 Insight" }
        },
        profile: {
            motivation: 'Stability',
            risk: 'Balanced',
            emotional: 'Resilient',
            social: 'Supporter',
            passion: 'Empathic',
            coreValue: 'Kindness'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp'
    }
,
    "P.V. Sindhu": {
        name: "P.V. Sindhu",
        archetypeTitle: "The Challenger",
        quote: "The greatest risk is not taking any at all.",
        voice: {
            tone: "Focused, Intense, Determined",
            intro: "Your mind is your fiercest weapon on the court of life."
        },
        missions: {
            discipline: { title: "Unbreakable Routine", desc: "Stick to your hardest habit for 3 days straight.", xp: "+50 Discipline" },
            resilience: { title: "Bouncing Back", desc: "Recover instantly from a minor failure today.", xp: "+50 Recovery" },
            risk: { title: "The Bold Smash", desc: "Take a calculated risk in a conversation.", xp: "+50 Boldness" },
            leadership: { title: "Lead by Example", desc: "Work harder than anyone else in your group today.", xp: "+50 Influence" },
            creativity: { title: "Court Vision", desc: "Find a new angle to approach a stubborn problem.", xp: "+50 Insight" },
            empathy: { title: "Silent Respect", desc: "Acknowledge a rival's strength without feeling inferior.", xp: "+50 Grace" },
            vision: { title: "The Finish Line", desc: "Visualize your ultimate victory before sleeping.", xp: "+50 Focus" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Competitor',
            passion: 'Driven',
            coreValue: 'Excellence'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sindhu.webp'
    },
    "A.R. Rahman": {
        name: "A.R. Rahman",
        archetypeTitle: "The Maestro",
        quote: "All my life I had a choice of hate and love. I chose love.",
        voice: {
            tone: "Calm, Spiritual, Soulful",
            intro: "Listen to the silence between the notes. That is where your path lies."
        },
        missions: {
            discipline: { title: "The Midnight Studio", desc: "Dedicate 2 hours of deep work late at night or early morning.", xp: "+50 Focus" },
            resilience: { title: "Endless Keys", desc: "Keep working on a project when you feel creatively empty.", xp: "+50 Endurance" },
            risk: { title: "New Sounds", desc: "Merge two completely opposing ideas together.", xp: "+50 Innovation" },
            leadership: { title: "Harmonic Leader", desc: "Bring two conflicting people into agreement.", xp: "+50 Harmony" },
            creativity: { title: "The Soundtrack", desc: "Create something beautiful out of a mundane thought.", xp: "+50 Artistry" },
            empathy: { title: "Universal Language", desc: "Connect with someone whose background is entirely different from yours.", xp: "+50 Connection" },
            vision: { title: "The Global Stage", desc: "Imagine your work being appreciated by millions.", xp: "+50 Grandeur" }
        },
        profile: {
            motivation: 'Art',
            risk: 'Balanced',
            emotional: 'Calm',
            social: 'Collaborator',
            passion: 'Creative',
            coreValue: 'Love'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_rahman.webp'
    },
    "Malala Yousafzai": {
        name: "Malala Yousafzai",
        archetypeTitle: "The Peacemaker",
        quote: "One child, one teacher, one book, one pen can change the world.",
        voice: {
            tone: "Brave, Compassionate, Unwavering",
            intro: "Your voice is more powerful than any weapon. Will you use it?"
        },
        missions: {
            discipline: { title: "The Power of Pages", desc: "Read something challenging outside your comfort zone.", xp: "+50 Intellect" },
            resilience: { title: "Unbreakable", desc: "Stand fast when someone tries to silence your opinion.", xp: "+50 Courage" },
            risk: { title: "Speak Truth", desc: "Speak out against a small injustice today.", xp: "+50 Bravery" },
            leadership: { title: "The Advocate", desc: "Stand up for someone who cannot stand up for themselves.", xp: "+50 Justice" },
            creativity: { title: "The Global Classroom", desc: "Teach someone a complex idea using an analogy.", xp: "+50 Wisdom" },
            empathy: { title: "Open Eyes", desc: "Listen deeply to the struggle of a stranger.", xp: "+50 Compassion" },
            vision: { title: "World Peace", desc: "Write out how you intend to leave the world a better place.", xp: "+50 Purpose" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Courageous',
            emotional: 'Resilient',
            social: 'Advocate',
            passion: 'Empathetic',
            coreValue: 'Equality'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_malala.webp'
    },
    "Indra Nooyi": {
        name: "Indra Nooyi",
        archetypeTitle: "The Executive",
        quote: "Leadership is hard to define and good leadership even harder. But if you can get people to follow you to the ends of the earth, you are a great leader.",
        voice: {
            tone: "Sharp, Pragmatic, Inspiring",
            intro: "Break the rules, but do it elegantly and with absolute competence."
        },
        missions: {
            discipline: { title: "The List", desc: "Plan out your entire week down to the hour.", xp: "+50 Efficiency" },
            resilience: { title: "Thick Skin", desc: "Accept harsh criticism without defending yourself, and extract the truth from it.", xp: "+50 Poise" },
            risk: { title: "The Rebel Pitch", desc: "Pitch a disruptive idea to someone in authority.", xp: "+50 Disruption" },
            leadership: { title: "The Conductor", desc: "Organize exactly who is doing what in a group task.", xp: "+50 Management" },
            creativity: { title: "Design Thinking", desc: "Merge the aesthetics of a product with its raw functionality.", xp: "+50 Strategy" },
            empathy: { title: "The Letter", desc: "Write a note of gratitude to the people who support you behind the scenes.", xp: "+50 Grace" },
            vision: { title: "Future Proof", desc: "Identify a trend that will dominate 10 years from now.", xp: "+50 Foresight" }
        },
        profile: {
            motivation: 'Power',
            risk: 'Calculated',
            emotional: 'Poised',
            social: 'Leader',
            passion: 'Strategic',
            coreValue: 'Performance'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_nooyi.webp'
    },
    "Billie Eilish": {
        name: "Billie Eilish",
        archetypeTitle: "The Honest One",
        quote: "I'm the one thing I can control.",
        voice: {
            tone: "Raw, Honest, Vulnerable",
            intro: "You don't have to pretend you're okay. The world needs your real self, not your performed self."
        },
        missions: {
            discipline: { title: "Show Up Broken", desc: "Do the work even when you feel empty. Show up anyway.", xp: "+50 Presence" },
            resilience: { title: "Say It Out Loud", desc: "Tell one person the truth about how you're actually feeling.", xp: "+50 Courage" },
            risk: { title: "No Filter", desc: "Share something unpolished and imperfect with the world.", xp: "+50 Authenticity" },
            leadership: { title: "Use Your Platform", desc: "Speak about something that matters, even if it's uncomfortable.", xp: "+50 Voice" },
            creativity: { title: "Dark Pop", desc: "Create something that captures both pain and beauty.", xp: "+50 Depth" },
            empathy: { title: "Fan Connection", desc: "Acknowledge someone who is struggling — like you once were.", xp: "+50 Bond" },
            vision: { title: "Own Your Era", desc: "Decide who you are becoming in this next chapter.", xp: "+50 Identity" }
        },
        profile: {
            motivation: 'Art',
            risk: 'Vulnerable',
            emotional: 'Sensitive',
            social: 'Introvert',
            passion: 'Creative',
            coreValue: 'Honesty'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_billie.webp'
    },
    "Justin Bieber": {
        name: "Justin Bieber",
        archetypeTitle: "The Comeback Kid",
        quote: "I'm looking forward to influencing others in a positive way. My message is you can do anything if you just put your mind to it.",
        voice: {
            tone: "Vulnerable, Honest, Resilient",
            intro: "You don't have to be perfect. You just have to keep trying."
        },
        missions: {
            discipline: { title: "The Studio Routine", desc: "Work on your craft for 2 hours today without distractions.", xp: "+50 Focus" },
            resilience: { title: "Forgive Yourself", desc: "Acknowledge a recent mistake, forgive yourself, and move on.", xp: "+50 Healing" },
            risk: { title: "Vulnerable Truth", desc: "Share something honest about your struggles with a close friend.", xp: "+50 Authenticity" },
            leadership: { title: "Own the Stage", desc: "Take charge of a situation where others are hesitating.", xp: "+50 Confidence" },
            creativity: { title: "Acoustic Session", desc: "Strip a project down to its bare essentials.", xp: "+50 Clarity" },
            empathy: { title: "Reach Out", desc: "Check in on someone who might be silently struggling.", xp: "+50 Connection" },
            vision: { title: "The Next Chapter", desc: "Write down the kind of person you want to become after this phase.", xp: "+50 Growth" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Vulnerable',
            emotional: 'Sensitive',
            social: 'Extrovert',
            passion: 'Creative',
            coreValue: 'Resilience'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-justin-19.webp'
    },
    "MrBeast": {
        name: "MrBeast",
        archetypeTitle: "The Obsessed",
        quote: "If you're not obsessed, you're not trying hard enough.",
        voice: {
            tone: "Energetic, Absurd, All-In",
            intro: "What's the most ridiculous thing you could do that would actually work? That's the one. Do it."
        },
        missions: {
            discipline: { title: "40-Hour Session", desc: "Work on your most important project for longer than is comfortable.", xp: "+50 Obsession" },
            resilience: { title: "Reupload", desc: "Take your worst failed attempt and try it again with improvements.", xp: "+50 Iteration" },
            risk: { title: "Absurd Idea", desc: "Execute the idea that people would call stupid. Do it well.", xp: "+50 Boldness" },
            leadership: { title: "Team Beast", desc: "Give credit publicly to someone who made your work better.", xp: "+50 Generosity" },
            creativity: { title: "Scale It Up", desc: "Take a small idea and design what it would look like 100x bigger.", xp: "+50 Vision" },
            empathy: { title: "Give Away", desc: "Do something genuinely generous for someone today, with no expectation.", xp: "+50 Humanity" },
            vision: { title: "200M Goal", desc: "Set a subscriber-level goal for your life. Write the number down.", xp: "+50 Ambition" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Reckless',
            emotional: 'Intense',
            social: 'Entertainer',
            passion: 'Obsessive',
            coreValue: 'Scale'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_mrbeast.webp'
    },
    "Ritesh Agarwal": {
        name: "Ritesh Agarwal",
        archetypeTitle: "The Audacious",
        quote: "Don't ask for permission. Just start solving.",
        voice: {
            tone: "Confident, Scrappy, Bold",
            intro: "You don't need a degree, a title, or their blessing. You need the problem and the audacity."
        },
        missions: {
            discipline: { title: "₹2000 Mindset", desc: "Work with exactly what you have. No excuses about resources.", xp: "+50 Resourcefulness" },
            resilience: { title: "Dropout's Grit", desc: "When someone doubts your credentials, let your work speak.", xp: "+50 Proof" },
            risk: { title: "Apply Anyway", desc: "Apply for something you're clearly underqualified for.", xp: "+50 Audacity" },
            leadership: { title: "The Pitch", desc: "Sell your idea to one person who can actually help make it real.", xp: "+50 Persuasion" },
            creativity: { title: "Standardize It", desc: "Find a chaotic, inconsistent experience and design a better version.", xp: "+50 Systems" },
            empathy: { title: "Live the Problem", desc: "Experience your user's frustration first-hand today.", xp: "+50 Insight" },
            vision: { title: "Youngest Billionaire", desc: "Set a timeline for your biggest goal that terrifies you.", xp: "+50 Urgency" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Reckless',
            emotional: 'Resilient',
            social: 'Founder',
            passion: 'Obsessive',
            coreValue: 'Disruption'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ritesh.webp'
    },
    "Muhammad Ali": {
        name: "Muhammad Ali",
        archetypeTitle: "The Greatest",
        quote: "I don't have to be what you want me to be.",
        voice: {
            tone: "Defiant, Poetic, Fearless",
            intro: "Float like a butterfly, sting like a bee. But first — know what you refuse to accept."
        },
        missions: {
            discipline: { title: "Gym at Dawn", desc: "Train your hardest skill before anyone else wakes up.", xp: "+50 Dedication" },
            resilience: { title: "Take the Hit", desc: "Accept a setback publicly and respond with dignity.", xp: "+50 Grace Under Fire" },
            risk: { title: "Refuse", desc: "Say no to something unjust even when compliance would be easier.", xp: "+50 Integrity" },
            leadership: { title: "Loud and Clear", desc: "Speak your truth to a group, even knowing some will disagree.", xp: "+50 Conviction" },
            creativity: { title: "The Rope-a-Dope", desc: "Use an unconventional strategy when everyone expects the obvious.", xp: "+50 Cunning" },
            empathy: { title: "The Medal in the River", desc: "Give up something valuable to stand for something more valuable.", xp: "+50 Principle" },
            vision: { title: "I Am The Greatest", desc: "Declare your biggest goal out loud before you've achieved it.", xp: "+50 Belief" }
        },
        profile: {
            motivation: 'Justice',
            risk: 'Defiant',
            emotional: 'Passionate',
            social: 'Activist',
            passion: 'Physical',
            coreValue: 'Integrity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ali.webp'
    },
    "Dhruv Rathee": {
        name: "Dhruv Rathee",
        archetypeTitle: "The Fact-Checker",
        quote: "Question everything, especially what you want to believe.",
        voice: {
            tone: "Analytical, Passionate, Data-Driven",
            intro: "Democracy needs informed citizens. Start with yourself."
        },
        missions: {
            discipline: { title: "Research First", desc: "Before forming an opinion today, read three primary sources.", xp: "+50 Accuracy" },
            resilience: { title: "Trolls Don't Win", desc: "Receive criticism online without changing your factual position.", xp: "+50 Backbone" },
            risk: { title: "Speak Inconveniently", desc: "Share a fact that challenges the dominant narrative in your circle.", xp: "+50 Courage" },
            leadership: { title: "Educate One Person", desc: "Explain a complex issue clearly to someone who knows nothing about it.", xp: "+50 Impact" },
            creativity: { title: "Explainer Format", desc: "Turn a boring topic into something compelling and visual.", xp: "+50 Storytelling" },
            empathy: { title: "Both Sides", desc: "Genuinely understand the strongest version of a view you disagree with.", xp: "+50 Fairness" },
            vision: { title: "20 Million", desc: "Imagine reaching 20 million people with one important truth.", xp: "+50 Scale" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Calculated',
            emotional: 'Analytical',
            social: 'Educator',
            passion: 'Intellectual',
            coreValue: 'Truth'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_dhruv.webp'
    },
    "Falguni Nayar": {
        name: "Falguni Nayar",
        archetypeTitle: "The Patient Founder",
        quote: "I don't believe age matters. I believe conviction does.",
        voice: {
            tone: "Composed, Strategic, Unstoppable",
            intro: "I built Nykaa at 49. The only clock that matters is your readiness, not your age."
        },
        missions: {
            discipline: { title: "The 19-Year Plan", desc: "Work on a skill today that will compound for a decade.", xp: "+50 Patience" },
            resilience: { title: "Boardroom Woman", desc: "Hold your position in a meeting where you're outnumbered.", xp: "+50 Authority" },
            risk: { title: "Pivot at the Peak", desc: "Leave something good for the pursuit of something great.", xp: "+50 Courage" },
            leadership: { title: "Build the Network", desc: "Have a genuine conversation with someone who can be a long-term ally.", xp: "+50 Relationships" },
            creativity: { title: "See the Gap", desc: "Identify a market or need that existing products completely ignore.", xp: "+50 Insight" },
            empathy: { title: "The Customer Is You", desc: "Design a product or service for the version of yourself that needed it most.", xp: "+50 Clarity" },
            vision: { title: "₹1,000 Crore Vision", desc: "Write down the size of company you intend to build and by when.", xp: "+50 Ambition" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Calculated',
            emotional: 'Poised',
            social: 'Leader',
            passion: 'Strategic',
            coreValue: 'Conviction'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_falguni.webp'
    },
    "Nikola Tesla": {
        name: "Nikola Tesla",
        archetypeTitle: "The Dreamer of Currents",
        quote: "If you only knew the magnificence of 3, 6 and 9, you would have a key to the universe.",
        voice: {
            tone: "Obsessive, Visionary, Solitary",
            intro: "I could close my eyes and build any device in my mind. Your imagination is your laboratory."
        },
        missions: {
            discipline: { title: "20 Hours Deep", desc: "Work on your most complex problem until you break through.", xp: "+50 Focus" },
            resilience: { title: "Ignored Genius", desc: "Continue your work even when nobody is watching or validating.", xp: "+50 Self-Belief" },
            risk: { title: "Contradict the Expert", desc: "Respectfully argue against a widely accepted idea with evidence.", xp: "+50 Boldness" },
            leadership: { title: "The Patent", desc: "Document and protect an original idea before sharing it.", xp: "+50 Ownership" },
            creativity: { title: "Mental Laboratory", desc: "Solve a problem entirely in your mind before touching a tool.", xp: "+50 Visualization" },
            empathy: { title: "The Current Reaches Everyone", desc: "Ensure your work benefits the most people, not just the powerful.", xp: "+50 Humanity" },
            vision: { title: "Power the World", desc: "Design something that could work at global scale.", xp: "+50 Magnitude" }
        },
        profile: {
            motivation: 'Discovery',
            risk: 'Reckless',
            emotional: 'Intense',
            social: 'Introvert',
            passion: 'Obsessive',
            coreValue: 'Innovation'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_tesla.webp'
    },
    "Shubman Gill": {
        name: "Shubman Gill",
        archetypeTitle: "The Prince",
        quote: "Pressure is just a shadow. It disappears when you face the light.",
        voice: {
            tone: "Confident, Aggressive, Focused",
            intro: "Your talent got you here. Your conviction will make you stay."
        },
        missions: {
            discipline: { title: "The Nets", desc: "Practice a single skill until you cannot get it wrong.", xp: "+50 Focus" },
            resilience: { title: "Block the Noise", desc: "Ignore a piece of unhelpful criticism today.", xp: "+50 Grit" },
            risk: { title: "The Counter-Attack", desc: "When put on the defensive, strike back confidently.", xp: "+50 Audacity" },
            leadership: { title: "The Foundation", desc: "Set the tone for a project right from the start.", xp: "+50 Influence" },
            creativity: { title: "Trust Your Hands", desc: "Rely purely on your instincts to solve a problem.", xp: "+50 Instinct" },
            empathy: { title: "Acknowledge the Bowler", desc: "Praise an opponent or rival who did well.", xp: "+50 Grace" },
            vision: { title: "The Big Innings", desc: "Plan out a long-term strategy for a major goal.", xp: "+50 Foresight" }
        },
        profile: {
            motivation: 'Legacy',
            risk: 'Courageous',
            emotional: 'Resilient',
            social: 'Competitor',
            passion: 'Driven',
            coreValue: 'Excellence'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_shubman.webp?v=2'
    },
    "Prajakta Koli": {
        name: "Prajakta Koli",
        archetypeTitle: "The Authentic Voice",
        quote: "Your weirdness is your magic. Stop trying to hide it.",
        voice: {
            tone: "Relatable, Enthusiastic, Honest",
            intro: "If you aren't being yourself, you are already failing."
        },
        missions: {
            discipline: { title: "The Upload Schedule", desc: "Show up and do the work, even when you don't feel like it.", xp: "+50 Consistency" },
            resilience: { title: "Ignore the Trolls", desc: "Brush off an online or offline negative comment.", xp: "+50 Confidence" },
            risk: { title: "The Unfiltered Post", desc: "Share something authentic without worrying about judgment.", xp: "+50 Bravery" },
            leadership: { title: "Community Builder", desc: "Bring people together over a shared joke or experience.", xp: "+50 Connection" },
            creativity: { title: "The Everyday Humor", desc: "Find a funny angle to a completely mundane situation.", xp: "+50 Humor" },
            empathy: { title: "The Relatable Struggle", desc: "Validate someone else's daily frustration.", xp: "+50 Compassion" },
            vision: { title: "Beyond the Screen", desc: "Dream about taking your small idea to a global stage.", xp: "+50 Ambition" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Expressive',
            social: 'Advocate',
            passion: 'Creative',
            coreValue: 'Authenticity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_prajakta.webp?v=2'
    },
    "Viswanathan Anand": {
        name: "Viswanathan Anand",
        archetypeTitle: "The Grandmaster",
        quote: "Intuition is the first step. Calculation is the second. Mastery is both.",
        voice: {
            tone: "Calm, Analytical, Swift",
            intro: "Do not slow down your genius to make others comfortable."
        },
        missions: {
            discipline: { title: "The Opening Theory", desc: "Study the foundational basics of your craft deeply.", xp: "+50 Intellect" },
            resilience: { title: "The Blunder", desc: "Recover instantly from a fast mistake.", xp: "+50 Poise" },
            risk: { title: "The Lightning Move", desc: "Make a quick, instinctive decision on a difficult problem.", xp: "+50 Instinct" },
            leadership: { title: "The Mentor", desc: "Teach someone a complex strategy simply.", xp: "+50 Wisdom" },
            creativity: { title: "The Unseen Angle", desc: "Find a solution that nobody else is looking at.", xp: "+50 Strategy" },
            empathy: { title: "The Silent Respect", desc: "Acknowledge the brilliant move of a competitor.", xp: "+50 Grace" },
            vision: { title: "Ten Moves Ahead", desc: "Anticipate the long-term consequences of today's actions.", xp: "+50 Foresight" }
        },
        profile: {
            motivation: 'Mastery',
            risk: 'Calculated',
            emotional: 'Calm',
            social: 'Competitor',
            passion: 'Strategic',
            coreValue: 'Excellence'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp' // Fallback until avatar_anand.webp is verified
    },
    "Zendaya": {
        name: "Zendaya",
        archetypeTitle: "The Producer",
        quote: "I feel the most beautiful when I'm really in control of my own image.",
        voice: {
            tone: "Bold, Self-Assured, Creative",
            intro: "You have more power than they're letting you believe. Take it."
        },
        missions: {
            discipline: { title: "Own the Set", desc: "Take full ownership of one creative project from start to finish.", xp: "+50 Control" },
            resilience: { title: "Stereotype Breaker", desc: "Do the thing they said you couldn't — professionally and publicly.", xp: "+50 Identity" },
            risk: { title: "Demand the Credit", desc: "Ask for a title, role, or recognition you've been earning but not receiving.", xp: "+50 Power" },
            leadership: { title: "The Youngest in the Room", desc: "Lead a meeting or project even when you're the newest voice there.", xp: "+50 Presence" },
            creativity: { title: "Character Work", desc: "Study one icon outside your field and absorb their approach.", xp: "+50 Craft" },
            empathy: { title: "Amplify Others", desc: "Use your platform to spotlight someone who deserves recognition.", xp: "+50 Generosity" },
            vision: { title: "Producer Mindset", desc: "Plan the next 3 'moves' in your career like a chess game.", xp: "+50 Strategy" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Creative',
            coreValue: 'Authenticity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_zendaya.webp?v=2'
    },
    "Neeraj Chopra": {
        name: "Neeraj Chopra",
        archetypeTitle: "The Monk",
        quote: "Focus on your lane. The gold comes to those who block out the noise.",
        voice: {
            tone: "Quiet, Focused, Relentless",
            intro: "I trained for years in silence. The roar of the crowd is earned, not chased."
        },
        missions: {
            discipline: { title: "The Solitary Practice", desc: "Work on your most important skill completely alone, with no audience.", xp: "+50 Mastery" },
            resilience: { title: "Injury Protocol", desc: "When you're set back, return smarter — not just harder.", xp: "+50 Grit" },
            risk: { title: "The World Stage Throw", desc: "Perform your best work in the highest-pressure moment possible.", xp: "+50 Clutch" },
            leadership: { title: "National Pride", desc: "Do something today that makes your community proud.", xp: "+50 Honor" },
            creativity: { title: "Study the Biomechanics", desc: "Break down a skill you do well into its smallest components.", xp: "+50 Precision" },
            empathy: { title: "Respect the Process", desc: "Acknowledge the behind-the-scenes people who helped you win.", xp: "+50 Gratitude" },
            vision: { title: "Olympic Gold Standard", desc: "Define what your personal 'gold medal' looks like — specifically.", xp: "+50 Clarity" }
        },
        profile: {
            motivation: 'Mastery',
            risk: 'Calculated',
            emotional: 'Stoic',
            social: 'Introverted',
            passion: 'Physical',
            coreValue: 'Excellence'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_neeraj.webp?v=2'
    },
    "Ed Sheeran": {
        name: "Ed Sheeran",
        archetypeTitle: "Heartfelt Storyteller",
        quote: "Success is the best revenge for anything.",
        voice: {
            tone: "Genuine, Relatable, Grounded",
            intro: "Your stories are the most valuable thing you own. Let's see how you tell them."
        },
        missions: {
            discipline: { title: "Daily Strum", desc: "Practice your core skill for 20 minutes.", xp: "+50 Craft" },
            resilience: { title: "Busker's Spirit", desc: "Face rejection today and keep singing anyway.", xp: "+50 Grit" },
            risk: { title: "Open Mic", desc: "Share something you created before it's perfect.", xp: "+50 Courage" },
            leadership: { title: "Connect the Crowd", desc: "Bring two disconnected friends together.", xp: "+50 Harmony" },
            creativity: { title: "Loop Pedal", desc: "Take a simple idea and build layers onto it.", xp: "+50 Invention" },
            empathy: { title: "Write Their Song", desc: "Listen to someone's problem as if it were your own.", xp: "+50 Empathy" },
            vision: { title: "Stadium Dreams", desc: "Plan the biggest possible outcome for your current project.", xp: "+50 Belief" }
        },
        profile: {
            motivation: 'Connection',
            risk: 'Balanced',
            emotional: 'Resilient',
            social: 'Empathic',
            passion: 'Creative',
            coreValue: 'Authenticity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ed-sheeran.webp'
    },
    "Tanmay Bhat": {
        name: "Tanmay Bhat",
        archetypeTitle: "The Creative Risk-Taker",
        quote: "You don't need a guarantee before you bet on a creative idea.",
        voice: {
            tone: "Witty, Observational, Grounded",
            intro: "Small ideas often hold the biggest surprises. Let's see how you navigate the uncertainty of building something new."
        },
        missions: {
            discipline: { title: "Daily Craft", desc: "Spend 30 minutes writing or honing your craft without distractions.", xp: "+50 Focus" },
            resilience: { title: "Test the Waters", desc: "Try a new format or idea publicly, even if it feels unproven.", xp: "+50 Grit" },
            risk: { title: "Bet on the Idea", desc: "Take a creative risk before knowing whether anyone will care.", xp: "+50 Courage" },
            leadership: { title: "Find the Chemistry", desc: "Collaborate with others and focus on building strong group chemistry.", xp: "+50 Synergy" },
            creativity: { title: "Experiment", desc: "Try a new creative angle without overthinking the outcome.", xp: "+50 Innovation" },
            empathy: { title: "Listen to the Room", desc: "Pay close attention to what resonates with your audience.", xp: "+50 Connection" },
            vision: { title: "Think Bigger", desc: "Look beyond current limitations when an idea starts gaining traction.", xp: "+50 Vision" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Collaborative',
            passion: 'Creative',
            coreValue: 'Experimentation'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-tanmay-bhat.webp'
    },
    "Selena Gomez": {
        name: "Selena Gomez",
        archetypeTitle: "The Vulnerable",
        quote: "Who says you're not perfect? Who says you're not worth it?",
        voice: {
            tone: "Warm, Honest, Empowering",
            intro: "The bravest thing I ever did was admit I wasn't okay. That's where the real strength began."
        },
        missions: {
            discipline: { title: "Boundary Work", desc: "Set one firm boundary today — and keep it.", xp: "+50 Self-Respect" },
            resilience: { title: "The Health Pivot", desc: "Turn a limitation into a new direction for your energy.", xp: "+50 Strength" },
            risk: { title: "Tell the Truth", desc: "Share something vulnerable with someone you trust.", xp: "+50 Courage" },
            leadership: { title: "Build the Community", desc: "Create something that makes your audience feel less alone.", xp: "+50 Connection" },
            creativity: { title: "Rare Beauty", desc: "Express who you truly are in one creative act today.", xp: "+50 Identity" },
            empathy: { title: "Mental Health First", desc: "Check in on someone today — genuinely, not performatively.", xp: "+50 Care" },
            vision: { title: "Legacy Over Likes", desc: "Identify one impact you want to have that transcends your platform.", xp: "+50 Purpose" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Balanced',
            emotional: 'Sensitive',
            social: 'Advocate',
            passion: 'Empathic',
            coreValue: 'Authenticity'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_selena.webp?v=2'
    },
    "Elon Musk": {
        name: "Elon Musk",
        archetypeTitle: "The Visionary Architect",
        quote: "When something is important enough, you do it even if the odds are not in your favor.",
        voice: {
            tone: "Intense, Analytical, First-Principles",
            intro: "Think from first principles. What is physically possible?"
        },
        missions: {
            discipline: { title: "Deep Focus", desc: "Spend 2 unbroken hours reading or building something complex.", xp: "+50 Focus" },
            resilience: { title: "Iterate Rapidly", desc: "When your code or project fails, fix it immediately without despair.", xp: "+50 Grit" },
            risk: { title: "First Principles", desc: "Question an assumption that everyone around you takes for granted.", xp: "+50 Innovation" },
            leadership: { title: "Build the Future", desc: "Share a bold vision with someone and explain how to build it.", xp: "+50 Vision" },
            creativity: { title: "Systems Thinking", desc: "Design a solution to a problem using first-principles logic.", xp: "+50 Synthesis" },
            empathy: { title: "Connect", desc: "Listen carefully to a perspective different from yours.", xp: "+50 Connection" },
            vision: { title: "Multiplanetary Horizon", desc: "Write down a long-term goal that sounds impossible today.", xp: "+50 Foresight" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Analytical',
            social: 'Observer',
            passion: 'Intellectual',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_elon_musk.webp'
    },
    "Rani Lakshmibai": {
        name: "Rani Lakshmibai",
        archetypeTitle: "The Sovereign Leader",
        quote: "I shall not give up my Jhansi.",
        voice: {
            tone: "Fierce, Courageous, Unwavering",
            intro: "True courage is protecting your people and holding fast to who you are."
        },
        missions: {
            discipline: { title: "Martial Discipline", desc: "Train your mind and body consistently today.", xp: "+50 Discipline" },
            resilience: { title: "Unshakable Will", desc: "Stand your ground against pressure or doubt.", xp: "+50 Courage" },
            risk: { title: "Lead from Front", desc: "Take initiative in a difficult situation.", xp: "+50 Leadership" },
            leadership: { title: "Protect the Realm", desc: "Help and guide someone who depends on your strength.", xp: "+50 Protection" },
            creativity: { title: "Strategic Vision", desc: "Find a creative way out of a tight constraint.", xp: "+50 Strategy" },
            empathy: { title: "People's Heart", desc: "Listen to the concerns of your peers with respect.", xp: "+50 Compassion" },
            vision: { title: "Sovereign Purpose", desc: "Define your core values and pledge never to compromise them.", xp: "+50 Conviction" }
        },
        profile: {
            motivation: 'Impact',
            risk: 'Bold',
            emotional: 'Resilient',
            social: 'Leader',
            passion: 'Competitive',
            coreValue: 'Impact'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-rani-lakshmibai.webp'
    },
    "Narendra Modi": {
        name: "Narendra Modi",
        archetypeTitle: "The Pracharak",
        quote: "Hard work never brings fatigue. It brings satisfaction.",
        voice: {
            tone: "Determined, Disciplined, Purpose-Driven",
            intro: "True purpose lies at the intersection of your highest ideals and the gritty reality of everyday work."
        },
        missions: {
            discipline: { title: "The Unglamorous Grind", desc: "Complete the single most tedious, unglamorous chore on your list without complaining.", xp: "+50 Pure Discipline" },
            resilience: { title: "Austerity & Resolve", desc: "Deny yourself one immediate comfort today to stay focused on your larger mission.", xp: "+50 Resolve" },
            risk: { title: "Commit to the Mission", desc: "Make a decisive commitment to a cause larger than yourself.", xp: "+50 Conviction" },
            leadership: { title: "Grassroots Connection", desc: "Serve or listen to someone whose background is completely different from yours.", xp: "+50 Grounding" },
            creativity: { title: "Organize the Effort", desc: "Create a simple, structured system to solve a chaotic daily problem.", xp: "+50 Execution" },
            empathy: { title: "Service Without Spotlight", desc: "Do something genuinely helpful for your community or workplace with zero recognition.", xp: "+50 Humility" },
            vision: { title: "The Larger Purpose", desc: "Write down how your daily efforts connect to a purpose bigger than your own comfort.", xp: "+50 Vision" }
        },
        profile: {
            motivation: 'Service',
            risk: 'Bold',
            emotional: 'Disciplined',
            social: 'Organizer',
            passion: 'National Service',
            coreValue: 'Duty'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Narendra Modi.webp'
    },
    "Pratosh Bansal": {
        name: "Pratosh Bansal",
        archetypeTitle: "Experiential Pioneer",
        quote: "Classroom success alone does not prepare you for the real world. True awareness requires actively stepping out.",
        voice: {
            tone: "Grounding, Insightful, Mentoring",
            intro: "Freedom without real-world exposure is an illusion. Let's step beyond the syllabus."
        },
        missions: {
            discipline: { title: "Beyond Syllabus", desc: "Spend 30 minutes researching a real industry standard in your field today.", xp: "+50 Awareness" },
            resilience: { title: "Unstructured Challenge", desc: "Step into an unfamiliar project and learn by getting your hands dirty.", xp: "+50 Real-world Grit" },
            risk: { title: "Step Outside the Bubble", desc: "Reach out to someone actively working in your dream industry.", xp: "+50 Initiative" },
            leadership: { title: "Ground Truth", desc: "Help a peer bridge the gap between classroom theory and real application.", xp: "+50 Mentorship" },
            creativity: { title: "Practical Application", desc: "Take a concept you learned in class and build a prototype of it.", xp: "+50 Practical Vision" },
            empathy: { title: "Listen to the Ground", desc: "Understand the real struggles workers and professionals face on the job.", xp: "+50 Grounded Empathy" },
            vision: { title: "Industry Radar", desc: "Identify 3 skills that classrooms don't teach but your industry requires.", xp: "+50 Strategic Insight" }
        },
        profile: {
            motivation: 'Mastery',
            risk: 'Calculated',
            emotional: 'Grounded',
            social: 'Mentor',
            passion: 'Curiosity',
            coreValue: 'Real-world Truth'
        },
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp'
    }
};

export const IDOL_PROFILES: Record<string, Record<string, number>> = {
    "Arnold Schwarzenegger": { analytical: 60, ambitious: 100, risk: 90, creativity: 50, social: 75 },
    "Stephen Hawking": { analytical: 100, ambitious: 80, risk: 70, creativity: 95, social: 40 },
    "Frida Kahlo": { analytical: 40, ambitious: 70, risk: 95, creativity: 100, social: 80 },
    "Kobe Bryant": { analytical: 85, ambitious: 100, risk: 90, creativity: 60, social: 65 },
    "Cristiano Ronaldo": { analytical: 80, ambitious: 100, risk: 95, creativity: 90, social: 75 },
    "Taylor Swift": { analytical: 75, ambitious: 95, risk: 80, creativity: 100, social: 90 },
    "Mark Zuckerberg": { analytical: 95, ambitious: 90, risk: 85, creativity: 75, social: 60 },
    "Steve Jobs": { analytical: 80, ambitious: 100, risk: 95, creativity: 95, social: 50 },
    "Walt Disney": { analytical: 65, ambitious: 90, risk: 95, creativity: 100, social: 85 },
    "Michael Jackson": { analytical: 75, ambitious: 95, risk: 85, creativity: 100, social: 80 },
    "Ashneer Grover": { analytical: 95, ambitious: 100, risk: 90, creativity: 80, social: 70 },
    "Bhuvan Bam": { analytical: 80, ambitious: 95, risk: 90, creativity: 100, social: 90 },
    "Ranveer Singh": { analytical: 75, ambitious: 100, risk: 95, creativity: 100, social: 95 },
    "Alia Bhatt": { analytical: 80, ambitious: 95, risk: 85, creativity: 100, social: 90 },
    "Bhagat Singh": { analytical: 90, ambitious: 100, risk: 100, creativity: 85, social: 95 },
    "Oprah Winfrey": { analytical: 75, ambitious: 95, risk: 80, creativity: 70, social: 100 },
    "Bill Gates": { analytical: 95, ambitious: 90, risk: 80, creativity: 75, social: 60 },
    "J.K. Rowling": { analytical: 60, ambitious: 85, risk: 80, creativity: 100, social: 55 },
    "Mary Shelley": { analytical: 70, ambitious: 60, risk: 90, creativity: 100, social: 40 },
    "Steven Spielberg": { analytical: 70, ambitious: 90, risk: 85, creativity: 100, social: 80 },
    "Tina Dabi": { analytical: 95, ambitious: 95, risk: 70, creativity: 60, social: 85 },
    "Nitin Vijay (NV Sir)": { analytical: 90, ambitious: 85, risk: 80, creativity: 65, social: 90 },
    "Virat Kohli": { analytical: 75, ambitious: 100, risk: 95, creativity: 60, social: 85 },
    "Dr. A.P.J. Abdul Kalam": { analytical: 100, ambitious: 80, risk: 75, creativity: 95, social: 90 },
    "Ratan Tata": { analytical: 80, ambitious: 85, risk: 85, creativity: 70, social: 95 },
    "Sachin Tendulkar": { analytical: 90, ambitious: 95, risk: 70, creativity: 60, social: 75 },
    "Sundar Pichai": { analytical: 95, ambitious: 85, risk: 75, creativity: 80, social: 85 },
    "Shah Rukh Khan": { analytical: 70, ambitious: 100, risk: 95, creativity: 90, social: 100 },
    "P.V. Sindhu": { analytical: 80, ambitious: 95, risk: 85, creativity: 60, social: 70 },
    "A.R. Rahman": { analytical: 65, ambitious: 75, risk: 70, creativity: 100, social: 50 },
    "Malala Yousafzai": { analytical: 85, ambitious: 85, risk: 100, creativity: 70, social: 95 },
    "Indra Nooyi": { analytical: 95, ambitious: 95, risk: 80, creativity: 70, social: 85 },
    "Billie Eilish": { analytical: 55, ambitious: 85, risk: 80, creativity: 100, social: 60 },
    "Justin Bieber": { analytical: 60, ambitious: 90, risk: 90, creativity: 95, social: 85 },
    "MrBeast": { analytical: 70, ambitious: 100, risk: 95, creativity: 90, social: 85 },
    "Ritesh Agarwal": { analytical: 80, ambitious: 100, risk: 98, creativity: 75, social: 70 },
    "Muhammad Ali": { analytical: 65, ambitious: 100, risk: 95, creativity: 80, social: 90 },
    "Dhruv Rathee": { analytical: 95, ambitious: 85, risk: 80, creativity: 85, social: 75 },
    "Falguni Nayar": { analytical: 90, ambitious: 95, risk: 80, creativity: 75, social: 85 },
    "Nikola Tesla": { analytical: 100, ambitious: 90, risk: 90, creativity: 100, social: 30 },
    "Default": { analytical: 50, ambitious: 50, risk: 50, creativity: 50, social: 50 },
    "Elon Musk": { analytical: 95, ambitious: 100, risk: 95, creativity: 90, social: 50 },
    "Rani Lakshmibai": { analytical: 80, ambitious: 95, risk: 100, creativity: 75, social: 90 },
    "Shubman Gill": { analytical: 80, ambitious: 95, risk: 85, creativity: 70, social: 75 },
    "Prajakta Koli": { analytical: 80, ambitious: 90, risk: 85, creativity: 95, social: 90 },
    "Viswanathan Anand": { analytical: 100, ambitious: 85, risk: 70, creativity: 90, social: 60 },
    "Zendaya": { analytical: 75, ambitious: 90, risk: 100, creativity: 95, social: 85 },
    "Neeraj Chopra": { analytical: 80, ambitious: 95, risk: 85, creativity: 75, social: 70 },
    "Ed Sheeran": { analytical: 40, ambitious: 75, risk: 60, creativity: 90, social: 85 },
    "Tanmay Bhat": { analytical: 75, ambitious: 90, risk: 95, creativity: 100, social: 85 },
    "Selena Gomez": { analytical: 45, ambitious: 80, risk: 65, creativity: 85, social: 95 },
    "Narendra Modi": { analytical: 85, ambitious: 95, risk: 90, creativity: 80, social: 95 },
    "Pratosh Bansal": { analytical: 85, ambitious: 85, risk: 85, creativity: 80, social: 85 },
};
