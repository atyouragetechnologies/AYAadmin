import type { Level } from '../types/gameTypes';



export function generateLevels(_age: number): Level[] {
    // Clamp age to available content range (18-25)
    // const targetAge = Math.max(18, Math.min(25, age)); // Not using age-based skipping anymore if linear

    // Master List of ALL Levels
    const levels: Omit<Level, 'status' | 'isLocked' | 'stars'>[] = [
        // Age 13: Anne Frank (Part 1)
        {
            id: 'lvl_13_anne_1', title: 'The Notebook', description: 'At 13, Anne receives a diary for her birthday. What will she use it for?',
            requiredStars: 0, year: 1942, age: 13, theme: 'History', archetype: 'The Writer', personality: 'Anne Frank', age_mirror_text: 'celebrating your 13th birthday with family and friends',
            bio: 'A 13-year-old girl in Amsterdam experiencing the ordinary joys of a birthday amidst growing restrictions.',
            fame: 'One of the most discussed victims of the Holocaust. Author of a famous diary.',
            achievements: ['Her diary has been translated into over 70 languages', 'A powerful symbol of the Holocaust', 'A lasting voice for humanity'],
            lesson: 'A private creative space can matter before anyone else sees its value.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-anne-frank.webp', scenarioId: 'lvl_age_13_anne_1',
            idolTraits: { discipline: 80, resilience: 90, risk: 70, leadership: 60, creativity: 100, empathy: 95, vision: 85 }
        },
        // Age 13: Anne Frank (Part 2)
        {
            id: 'lvl_13_anne_2', title: 'When Ordinary Life Disappears', description: 'Weeks later, Anne\'s family must go into hiding. How will she cope?',
            requiredStars: 0, year: 1942, age: 13, theme: 'History', archetype: 'The Writer', personality: 'Anne Frank', age_mirror_text: 'packing your belongings to walk to a secret hiding place',
            bio: 'A 13-year-old girl forced into hiding in the Secret Annex, taking her diary with her.',
            fame: 'One of the most discussed victims of the Holocaust. Author of a famous diary.',
            achievements: ['Her diary has been translated into over 70 languages', 'A powerful symbol of the Holocaust', 'A lasting voice for humanity'],
            lesson: 'Sometimes the most important choice is not about controlling the situation, but deciding how to respond.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-anne-frank.webp', scenarioId: 'lvl_age_13_anne_2',
            idolTraits: { discipline: 80, resilience: 100, risk: 70, leadership: 60, creativity: 100, empathy: 95, vision: 85 }
        },
        // Age 15: Elon Musk (One Continuous Story: The Thing You Love)
        {
            id: 'lvl_15_elon_musk', title: 'The Thing You Love', description: 'At 15, Elon Musk navigates being a bookish, introverted teenager with a passion for computers and coding, deciding how to protect his interests.',
            requiredStars: 0, year: 1986, age: 15, theme: 'Technology', age_mirror_text: 'feeling different from others while spending hours reading, coding, and building', archetype: 'The Visionary', personality: 'Elon Musk',
            bio: 'A 15-year-old in South Africa spending his time with books, computers, and self-taught programming.',
            fame: 'Technology Entrepreneur & Engineer.',
            achievements: ['Taught himself computer programming', 'Created and sold code for Blastar video game at age 12', 'Maintained intense reading habit through adolescence'],
            lesson: 'PROTECTING WHAT MAKES YOU DIFFERENT — being different is not weakness; sometimes the thing that makes you different is worth protecting.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_elon_musk.webp', scenarioId: 'lvl_age_15_elon_musk',
            idolTraits: { discipline: 95, resilience: 90, risk: 95, leadership: 90, creativity: 100, empathy: 70, vision: 100 }
        },
        // Age 15: Ratan Tata (One Continuous Story: The Quiet Voice)
        {
            id: 'lvl_15_ratan_tata', title: 'The Quiet Voice', description: 'At 15, Ratan Tata experiences shyness and fear of public speaking while attending school in Bombay, discovering how quiet self-expression can build confidence.',
            requiredStars: 0, year: 1953, age: 15, theme: 'Business', age_mirror_text: 'sitting quietly in a Bombay classroom deciding how to make your voice heard', archetype: 'The Visionary', personality: 'Ratan Tata',
            bio: 'A 15-year-old student in Bombay learning to trust his quiet voice despite shyness and public speaking anxiety.',
            fame: 'Industrialist & Former Chairman of Tata Group.',
            achievements: ['Attended Campion & Cathedral School in Bombay', 'Studied Architecture at Cornell', 'Built one of India\'s most trusted global business conglomerates'],
            lesson: 'QUIET CONFIDENCE — being quiet is not weakness; confidence does not always sound loud.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ratan_tata.webp', scenarioId: 'lvl_age_15_ratan_tata',
            idolTraits: { discipline: 95, resilience: 95, risk: 85, leadership: 95, creativity: 85, empathy: 95, vision: 100 }
        },
        // Age 15: Virat Kohli (One Continuous Story: More Than Your Own Score)
        {
            id: 'lvl_15_virat_kohli', title: 'More Than Your Own Score', description: 'At 15, Virat Kohli is appointed captain of Delhi Under-15, learning the balance between individual performance and team leadership.',
            requiredStars: 0, year: 2003, age: 15, theme: 'Sports', age_mirror_text: 'captaining Delhi U-15 while deciding how to balance scoring runs and leading teammates', archetype: 'The Competitive Prodigy', personality: 'Virat Kohli',
            bio: 'A 15-year-old batsman appointed captain of the Delhi Under-15 team, learning how to carry team responsibility.',
            fame: 'Iconic Indian Cricketer & Former National Captain.',
            achievements: ['Captained Delhi U-15 in 2003–04', 'Scored 390 runs at average 78 in U-15 season', 'Selected for Delhi U-17 team in 2004'],
            lesson: 'LEADERSHIP IS BIGGER THAN PERSONAL SUCCESS — being the best player and being a good leader are not always the same thing.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp', scenarioId: 'lvl_age_15_virat_kohli',
            idolTraits: { discipline: 95, resilience: 95, risk: 90, leadership: 95, creativity: 80, empathy: 75, vision: 95 }
        },
        // Age 15: Michael Jackson (Part 1)
        {
            id: 'lvl_15_michael_1', title: 'When Your Voice Changes', description: 'At 15, Michael Jackson experiences physical and vocal changes during adolescence while continuing his music career.',
            requiredStars: 0, year: 1973, age: 15, theme: 'Music', age_mirror_text: 'noticing your voice and abilities changing as you grow up', archetype: 'The Perfectionist', personality: 'Michael Jackson',
            bio: 'A 15-year-old artist going through adolescence as his singing voice changes and matures.',
            fame: 'Solo Artist & Jackson 5 Lead Singer.',
            achievements: ['Released Music & Me at age 15', 'Multiple solo & Jackson 5 hits', 'Adapted to vocal changes during adolescence'],
            lesson: 'LEARNING TO USE WHAT YOU HAVE NOW — changing does not mean getting worse; it means learning how to use your new abilities.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp', scenarioId: 'lvl_age_15_michael_1',
            idolTraits: { discipline: 95, resilience: 90, risk: 85, leadership: 85, creativity: 100, empathy: 80, vision: 100 }
        },
        // Age 15: Michael Jackson (Part 2)
        {
            id: 'lvl_15_michael_2', title: 'When People Expect the Old You', description: 'At 15, Michael Jackson decides how to navigate audience expectations as he grows out of his childhood identity.',
            requiredStars: 0, year: 1973, age: 15, theme: 'Music', age_mirror_text: 'deciding how to grow up when people remember an older version of you', archetype: 'The Perfectionist', personality: 'Michael Jackson',
            bio: 'A 15-year-old performer growing into a new stage of life while audience expectations remain tied to the past.',
            fame: 'Solo Artist & Jackson 5 Lead Singer.',
            achievements: ['Released Music & Me at age 15', 'Multiple solo & Jackson 5 hits', 'Adapted to vocal changes during adolescence'],
            lesson: 'NOT STAYING THE SAME FOR OTHERS — real growth often happens between staying the same and becoming someone completely different.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp', scenarioId: 'lvl_age_15_michael_2',
            idolTraits: { discipline: 95, resilience: 90, risk: 85, leadership: 85, creativity: 100, empathy: 80, vision: 100 }
        },
        // Age 15: Rani Lakshmibai (One Continuous Story: The Girl and the Crown)
        {
            id: 'lvl_15_rani_lakshmibai', title: 'The Girl and the Crown', description: 'At 15, Manikarnika becomes Lakshmibai, Rani of Jhansi, navigating the identity transition between her past and her new royal responsibilities.',
            requiredStars: 0, year: 1843, age: 15, theme: 'History', age_mirror_text: 'entering a new life in Jhansi as Lakshmibai while holding on to Manu', archetype: 'The Sovereign', personality: 'Rani Lakshmibai',
            bio: 'A 15-year-old in Jhansi transitioning from her independent childhood as Manu into her new royal role as Lakshmibai.',
            fame: 'Rani of Jhansi & Heroine of Indian Resistance.',
            achievements: ['Married Raja Gangadhar Rao in 1842', 'Retained martial skills and literacy in her court life', 'Pioneered independent female leadership in 19th-century India'],
            lesson: 'WHAT YOU CARRY FORWARD — growing up does not mean becoming a completely different person; it means taking what is already strong inside you and learning how to use it responsibly.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-rani-lakshmibai.webp', scenarioId: 'lvl_age_15_rani_lakshmibai',
            idolTraits: { discipline: 100, resilience: 100, risk: 95, leadership: 100, creativity: 85, empathy: 90, vision: 100 }
        },
        // Age 15: Bhagat Singh (Part 1)
        {
            id: 'lvl_15_bhagat_1', title: 'Don\'t Just Be Angry', description: 'At 15, Bhagat Singh witnesses political tension in Lahore and learns how to channel anger into constructive learning and action.',
            requiredStars: 0, year: 1922, age: 15, theme: 'History', age_mirror_text: 'feeling angry about unfairness in Lahore and deciding how to respond', archetype: 'The Revolutionary', personality: 'Bhagat Singh',
            bio: 'A 15-year-old in Lahore developing political awareness and intellectual curiosity during a time of national tension.',
            fame: 'Iconic Indian Revolutionary & Intellectual.',
            achievements: ['Attended National College in Lahore', 'Extensive study of history and political literature', 'Pioneered intellectual approach to social change'],
            lesson: 'LEARNING BEFORE ACTING — strong feelings are important, but understanding a problem is the first step toward changing it.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhagat-singh.webp', scenarioId: 'lvl_age_15_bhagat_1',
            idolTraits: { discipline: 100, resilience: 100, risk: 100, leadership: 95, creativity: 85, empathy: 90, vision: 100 }
        },
        // Age 15: Bhagat Singh (Part 2)
        {
            id: 'lvl_15_bhagat_2', title: 'What If I\'m Wrong?', description: 'At 15, Bhagat Singh learns intellectual humility and the importance of independent thinking when hearing opposing views.',
            requiredStars: 0, year: 1922, age: 15, theme: 'History', age_mirror_text: 'comparing different opinions and reading to form independent beliefs', archetype: 'The Revolutionary', personality: 'Bhagat Singh',
            bio: 'A 15-year-old student exploring history and literature to build a reasoned perspective.',
            fame: 'Iconic Indian Revolutionary & Intellectual.',
            achievements: ['Attended National College in Lahore', 'Extensive study of history and political literature', 'Pioneered intellectual approach to social change'],
            lesson: 'EXPLAINING WHAT YOU BELIEVE AND WHY — real independence means being able to explain why you believe what you believe.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhagat-singh.webp', scenarioId: 'lvl_age_15_bhagat_2',
            idolTraits: { discipline: 100, resilience: 100, risk: 100, leadership: 95, creativity: 85, empathy: 90, vision: 100 }
        },
        // Age 15: Cristiano Ronaldo (One Continuous Story: Far From Home)
        {
            id: 'lvl_15_ronaldo', title: 'Far From Home', description: 'At 15, Cristiano Ronaldo experiences loneliness and homesickness in Lisbon after moving from Madeira, deciding whether to stay and persevere or return home.',
            requiredStars: 0, year: 2000, age: 15, theme: 'Sports', age_mirror_text: 'feeling far from home in Lisbon while deciding whether to stay and pursue your dream', archetype: 'The Competitor', personality: 'Cristiano Ronaldo',
            bio: 'A 15-year-old youth player in Lisbon dealing with homesickness and adjusting to a new environment.',
            fame: 'Iconic Global Footballer & Record Goalscorer.',
            achievements: ['Moved from Madeira to Sporting CP academy at age 12', 'Overcame homesickness and cultural adjustment in Lisbon', 'Promoted through Sporting CP youth ranks'],
            lesson: 'PERSEVERING THROUGH SOLITUDE — being different can feel lonely, but staying does not mean refusing to adapt.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-cristiano-ronaldo.webp', scenarioId: 'lvl_age_15_ronaldo',
            idolTraits: { discipline: 100, resilience: 100, risk: 95, leadership: 95, creativity: 90, empathy: 75, vision: 100 }
        },
        // Age 16: Shahrukh Khan
        {
            id: 'lvl_16_srk_1',
            title: 'The Sword of Honour',
            description: 'At 15, your father suddenly passes away. With your family in emotional and financial turmoil, you must choose how to channel your profound grief.',
            requiredStars: 0,
            year: 1981,
            age: 16,
            theme: 'Arts',
            age_mirror_text: 'dealing with the sudden loss of your father and deciding whether to retreat into grief or push harder at school',
            archetype: 'The Resilient',
            personality: 'Shahrukh Khan',
            bio: 'A 15-year-old schoolboy in New Delhi thrust into the role of "man of the house" after his father\'s sudden death.',
            fame: 'One of the most successful film stars in the world.',
            achievements: ['Awarded the Sword of Honour at St. Columba\'s School', 'Built a global acting empire with zero industry connections', 'Padma Shri recipient and global icon'],
            lesson: 'Extreme grief can either consume you or be converted into extreme drive.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Shah_Rukh_Khan.webp',
            scenarioId: 'lvl_age_16_srk',
            idolTraits: { discipline: 95, resilience: 98, risk: 90, leadership: 90, creativity: 95, empathy: 85, vision: 95 }
        },
        // Age 16: Bhuvan Bam
        {
            id: 'lvl_16_bhuvan',
            title: 'The Night Shift Stage',
            description: 'At 16, balancing parental pressure for a corporate degree with exhausting late-night guitar gigs at a Delhi restaurant.',
            requiredStars: 0,
            year: 2010,
            age: 16,
            theme: 'Arts',
            age_mirror_text: 'playing guitar at a Delhi restaurant from 8 PM to midnight after scoring 74% in Class 12, balancing family expectations with passion',
            archetype: 'The Creator',
            personality: 'Bhuvan Bam',
            bio: 'A 16-year-old high school graduate choosing between a conventional commerce degree and grueling late-night restaurant gigs to fund his musical craft.',
            fame: 'Creator of BB Ki Vines, Actor, Musician & Producer.',
            achievements: ['Creator of BB Ki Vines (26M+ subscribers)', 'Filmfare Award Winner for Plus Minus', 'Star & Producer of Taaza Khabar'],
            lesson: 'Your board exam marks don\'t dictate your future. Pursuing a passion often requires unglamorous, exhausting work first.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_bhuvan bam.webp',
            scenarioId: 'lvl_age_16_bhuvan',
            idolTraits: { discipline: 95, resilience: 92, risk: 88, leadership: 85, creativity: 98, empathy: 90, vision: 92 }
        },
        // Age 16: Virat Kohli
        {
            id: 'lvl_16_virat_kohli',
            title: 'The Morning at Kotla',
            description: 'At 16, hours after your father suddenly passes away at 2:30 AM, your state team is staring at a collapse. You face an agonizing choice between grief and duty.',
            requiredStars: 0,
            year: 2006,
            age: 16,
            theme: 'Sports',
            age_mirror_text: 'sitting in an empty locker room at Feroz Shah Kotla, deciding between mourning at home and walking out to save your team',
            archetype: 'The Resilient',
            personality: 'Virat Kohli',
            bio: 'A 16-year-old batsman waking up at 2:30 AM to sudden personal tragedy hours before a crucial Ranji match for Delhi.',
            fame: 'Indian cricket icon and one of the greatest batsmen of all time.',
            achievements: ['Scored 90 runs under profound grief for Delhi', 'U-19 World Cup winning captain (2008)', '2011 ICC World Cup & 2024 T20 World Cup Champion'],
            lesson: 'When personal tragedy strikes, stepping forward for your team and honoring duty builds unbreakable resilience.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp',
            scenarioId: 'lvl_age_16_virat_kohli',
            idolTraits: { discipline: 98, resilience: 100, risk: 85, leadership: 95, creativity: 80, empathy: 75, vision: 90 }
        },
        // Age 16: Michael Jordan
        {
            id: 'lvl_16_jordan_1',
            title: 'The Roster',
            description: 'At 16, after being cut from the varsity basketball team and assigned to junior varsity, you must decide how to handle the public rejection.',
            requiredStars: 0,
            year: 1978,
            age: 16,
            theme: 'Sports',
            age_mirror_text: 'staring at a posted team roster without your name on it and deciding whether to coast or channel the humiliation into relentless practice',
            archetype: 'The Competitor',
            personality: 'Michael Jordan',
            bio: 'A sophomore high school basketball player dealing with the public humiliation of being placed on the junior varsity team.',
            fame: '6-time NBA Champion, 5-time MVP, and global basketball icon.',
            achievements: ['6-time NBA Champion with Chicago Bulls', '5-time NBA Most Valuable Player', 'Turned high school cut into legendary relentless drive'],
            lesson: 'Rejection isn\'t an assessment of your final potential; only structured, relentless practice turns anger into greatness.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp',
            scenarioId: 'lvl_age_16_jordan',
            idolTraits: { discipline: 100, resilience: 98, risk: 90, leadership: 95, creativity: 90, empathy: 70, vision: 95 }
        },
        // Age 16: Taylor Swift
        {
            id: 'lvl_16_taylor_1',
            title: 'The Development Deal',
            description: 'At 16, facing a major record deal that shelves your songs until age 18, you must choose between corporate security and a brand-new, unproven indie startup.',
            requiredStars: 0,
            year: 2005,
            age: 16,
            theme: 'Music',
            age_mirror_text: 'weighing a safe corporate contract that shelves your original songs against the terrifying risk of launching with an unproven startup',
            archetype: 'The Artist',
            personality: 'Taylor Swift',
            bio: 'A 16-year-old songwriter choosing between corporate label security and the risky freedom of releasing her own authentic music.',
            fame: '14-time Grammy Award winner and global music icon.',
            achievements: ['14 Grammy Awards including 4 Album of the Year wins', 'Built Big Machine Records from zero into a music powerhouse', 'First billionaire artist driven primarily by songwriting and touring'],
            lesson: 'Institutional validation isn\'t worth sacrificing your authentic voice; the biggest risk is waiting for someone else\'s permission.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_taylor_swift.webp',
            scenarioId: 'lvl_age_16_taylor',
            idolTraits: { discipline: 95, resilience: 95, risk: 100, leadership: 90, creativity: 100, empathy: 90, vision: 100 }
        },
        // Age 16: Billie Eilish
        {
            id: 'lvl_16_billie_1',
            title: 'The Bedroom Studio',
            description: 'At 16, under massive pressure to work with famous producers in big LA studios, you must choose between pop conformity and recording in a tiny childhood bedroom.',
            requiredStars: 0,
            year: 2018,
            age: 16,
            theme: 'Music',
            age_mirror_text: 'facing industry pressure to make polished radio pop in expensive studios instead of staying in your brother\'s intimate bedroom studio',
            archetype: 'The Authentic',
            personality: 'Billie Eilish',
            bio: 'A 16-year-old artist choosing between the sterile polish of major LA recording studios and the raw, intimate sound of her brother\'s bedroom.',
            fame: '9-time Grammy Award winner, 2-time Oscar winner, and voice of a generation.',
            achievements: ['Debut album made in a bedroom swept major Grammy categories', 'Youngest artist to write and record an official James Bond theme', '2-time Academy Award winner for Best Original Song'],
            lesson: 'Authentic weirdness will always connect deeper than sterile perfection; you don\'t need experts to validate your vision.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-billie-20.webp',
            scenarioId: 'lvl_age_16_billie',
            idolTraits: { discipline: 90, resilience: 95, risk: 100, leadership: 85, creativity: 100, empathy: 95, vision: 100 }
        },
        // Age 16: Bhagat Singh
        {
            id: 'lvl_16_bhagat_1',
            title: 'The Letter on the Desk',
            description: 'At 16, under immense family pressure to marry and settle down, you must decide whether to accept domestic safety or leave a letter on the desk and flee to Kanpur for the freedom movement.',
            requiredStars: 0,
            year: 1924,
            age: 16,
            theme: 'History',
            age_mirror_text: 'staring at a marriage proposal arranged by your family while feeling a burning conviction to dedicate your life to a higher cause',
            archetype: 'The Revolutionary',
            personality: 'Bhagat Singh',
            bio: 'A 16-year-old student in Lahore choosing between traditional family expectations of marriage and dedicating his life to the freedom struggle.',
            fame: 'Iconic revolutionary and national hero of the Indian independence struggle.',
            achievements: ['Fled home at 16 to dedicate life entirely to India\'s independence', 'Founded Naujawan Bharat Sabha to unite youth across divisions', 'Immortal symbol of fearless sacrifice, discipline, and purpose'],
            lesson: 'Your true calling might require disappointing the people who love you most; extraordinary purpose demands the sacrifice of ordinary comforts.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhagat-singh.webp',
            scenarioId: 'lvl_age_16_bhagat',
            idolTraits: { discipline: 98, resilience: 100, risk: 100, leadership: 95, creativity: 85, empathy: 90, vision: 100 }
        },
        // Age 16: Karan Aujla
        {
            id: 'lvl_16_aujla_1',
            title: 'The Cargo Grind',
            description: 'At 16, orphaned and broke despite writing a hit song, you must choose between staying with relatives in Punjab or taking massive loans to work grueling dock jobs in Canada to fund your music.',
            requiredStars: 0,
            year: 2014,
            age: 16,
            theme: 'Music',
            age_mirror_text: 'working freezing morning shifts unloading cargo containers as an immigrant student while writing lyrics in your head to fund studio time',
            archetype: 'The Resilient',
            personality: 'Karan Aujla',
            bio: 'A 16-year-old orphan choosing between the relative comfort of relatives in Punjab and grueling immigrant manual labor in Canada to fund his music independence.',
            fame: 'Global Punjabi music superstar, record-breaking lyricist and singer.',
            achievements: ['Wrote hit songs in high school before emigrating', 'Funded breakthrough albums through longshoreman manual labor', 'Global chart-topping Punjabi artist and Juno Award winner'],
            lesson: 'Having talent isn\'t enough; you must be willing to fund your own dream through unglamorous work.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
            scenarioId: 'lvl_age_16_aujla',
            idolTraits: { discipline: 95, resilience: 100, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        // Age 17: Karan Aujla
        {
            id: 'lvl_17_aujla_1',
            title: 'The Failed Debut',
            description: 'At 17, after your self-funded debut single flops and gets completely ignored, you must choose between retreating to the safe profit of ghostwriting or absorbing the embarrassment to improve your vocals.',
            requiredStars: 0,
            year: 2014,
            age: 17,
            theme: 'Music',
            age_mirror_text: 'staring at the disappointing streaming numbers of your first self-funded project and deciding whether to quit performing or double down on vocal practice',
            archetype: 'The Resilient',
            personality: 'Karan Aujla',
            bio: 'A 17-year-old immigrant lyricist in Canada facing public indifference after his debut track as a lead singer flops.',
            fame: 'Global Punjabi music superstar, record-breaking lyricist and singer.',
            achievements: ['Turned early flop into relentless motivation', 'Won Juno Award for Fan Choice (2024)', 'Billions of global streams across iconic chart-topping albums'],
            lesson: 'Your first attempt at your true dream will likely fail; that failure is a filter, not a final verdict.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
            scenarioId: 'lvl_age_17_aujla',
            idolTraits: { discipline: 95, resilience: 100, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        // Age 17: Shah Rukh Khan
        {
            id: 'lvl_17_srk', title: 'The Stage or The Books', description: 'At 17, SRK faces an impossible choice — grieve, study, or chase the stage.',
            requiredStars: 0, year: 1982, age: 17, theme: 'Arts', age_mirror_text: 'performing in school plays in Delhi, dreaming of being seen', archetype: 'The Entertainer', personality: 'Shah Rukh Khan',
            bio: 'A grieving 17-year-old with a rare theatrical gift, torn between financial duty and a burning passion for the stage.',
            fame: 'The King of Bollywood. Global Icon.',
            achievements: ['14 Filmfare Awards', 'Padma Shri Awardee', 'One of the most recognized actors internationally'],
            lesson: 'DUAL COMMITMENT — sometimes the answer isn\'t either/or, it\'s both, and harder.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp', scenarioId: 'lvl_age_17_srk',
            idolTraits: { discipline: 85, resilience: 100, risk: 90, leadership: 90, creativity: 98, empathy: 95, vision: 85 }
        },
        // Age 17: P.V. Sindhu
        {
            id: 'lvl_17_sindhu', title: 'The Olympic Prelude', description: 'At 17, Sindhu faced the seemingly invincible Olympic gold medalist.',
            requiredStars: 0, year: 2012, age: 17, theme: 'Sports', archetype: 'The Challenger', personality: 'P.V. Sindhu',
            bio: 'A 17-year-old badminton prodigy facing a brutal match against the reigning Olympic champion, Li Xuerui.',
            fame: 'India\'s badminton icon and two-time Olympic medalist.',
            achievements: ['First Indian woman to win two Olympic medals', 'World Champion 2019', 'Padma Bhushan Awardee'],
            lesson: 'RESPECT for your opponent does not mean fearing them.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sindhu.webp', scenarioId: 'lvl_age_17_sindhu',
            idolTraits: { discipline: 100, resilience: 95, risk: 75, leadership: 70, creativity: 80, empathy: 85, vision: 90 }
        },
        // Age 17: A.R. Rahman
        {
            id: 'lvl_17_rahman', title: 'The Silent Melody', description: 'At 17, a grieving son drops out of school to support his family through music.',
            requiredStars: 0, year: 1984, age: 17, theme: 'Arts', archetype: 'The Maestro', personality: 'A.R. Rahman',
            bio: 'Forced to become the breadwinner after his father\'s death, playing keyboards endlessly in studios.',
            fame: 'Two-time Academy Award-winning composer.',
            achievements: ['2 Academy Awards', '2 Grammy Awards', 'Padma Shri & Padma Bhushan Awardee'],
            lesson: 'SACRIFICE can forge the greatest talent.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_rahman.webp', scenarioId: 'lvl_age_17_rahman',
            idolTraits: { discipline: 95, resilience: 90, risk: 85, leadership: 80, creativity: 100, empathy: 95, vision: 98 }
        },
        // Age 17: Malala Yousafzai
        {
            id: 'lvl_17_malala', title: 'The Price of Peace', description: 'At 17, Malala won the Nobel Prize. But was the global spotlight worth the trauma?',
            requiredStars: 0, year: 2014, age: 17, theme: 'Activism', archetype: 'The Peacemaker', personality: 'Malala Yousafzai',
            bio: 'Surviving an assassination attempt to become the global face of girls\' education while trying to finish high school.',
            fame: 'Youngest-ever Nobel Prize laureate.',
            achievements: ['Nobel Peace Prize', 'UN Messenger of Peace', 'Bestselling Author'],
            lesson: 'PURPOSE transcends personal comfort.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_malala.webp', scenarioId: 'lvl_age_17_malala',
            idolTraits: { discipline: 90, resilience: 100, risk: 95, leadership: 95, creativity: 80, empathy: 100, vision: 95 }
        },
        // Age 17: Steve Jobs
        {
            id: 'lvl_17_jobs', title: 'The Dropout\'s Intuition', description: 'At 17, Jobs dropped out of Harvard to audit calligraphy classes.',
            requiredStars: 0, year: 1972, age: 17, theme: 'Tech', archetype: 'The Visionary', personality: 'Steve Jobs',
            bio: 'A college freshman wasting his working-class parents\' savings on an education that feels meaningless.',
            fame: 'Co-founder of Apple Inc. and pioneer of the personal computer revolution.',
            achievements: ['Created iPhone, Mac, iPad', 'Transformed Pixar Animation', 'Changed multiple industries permanently'],
            lesson: 'INTUITION is the compass when the map fails.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_jobs.webp', scenarioId: 'lvl_age_17_jobs',
            idolTraits: { discipline: 75, resilience: 90, risk: 100, leadership: 90, creativity: 100, empathy: 60, vision: 100 }
        },
        // Age 17: Indra Nooyi
        {
            id: 'lvl_17_nooyi', title: 'The Rulebreaker', description: 'At 17, a young Indian woman played in an all-girls rock band and broke every conventional rule.',
            requiredStars: 0, year: 1972, age: 17, theme: 'Business', archetype: 'The Executive', personality: 'Indra Nooyi',
            bio: 'A college student in conservative Madras joining a rock band and playing cricket against societal norms.',
            fame: 'Former CEO and Chairperson of PepsiCo.',
            achievements: ['Ranked consistently among World\'s 100 Most Powerful Women', 'Increased PepsiCo\'s revenue by 80%', 'Padma Bhushan Awardee'],
            lesson: 'AUTHENTICITY requires braving societal friction.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_nooyi.webp', scenarioId: 'lvl_age_17_nooyi',
            idolTraits: { discipline: 95, resilience: 90, risk: 90, leadership: 100, creativity: 85, empathy: 85, vision: 95 }
        },
        // Age 18: Pratosh Bansal (The Classroom Illusion) - Top of Age 18
        {
            id: 'lvl_18_pratosh',
            title: 'The Classroom Illusion',
            description: 'At 18, entering engineering with newfound freedom, you must choose between staying in the comfortable bubble of classroom syllabus or venturing out into real-world industry exposure.',
            requiredStars: 0,
            year: 2000,
            age: 18,
            theme: 'Education',
            age_mirror_text: 'navigating the sudden freedom of your first year in college, deciding between relying solely on class lectures or stepping out to understand the real industry',
            archetype: 'The Explorer',
            personality: 'Pratosh Bansal',
            bio: 'An 18-year-old engineering student learning how to navigate open college freedom and the limits of textbook learning.',
            fame: 'Mechanical Engineering Topper & Industrial Leader.',
            achievements: ['Transitioned from rote schooling to self-directed engineering', 'Recognized the critical value of early industry exposure', 'Turned academic discipline into leadership in engineering'],
            lesson: 'Classroom success alone does not prepare you for the real world. Lack of early industry exposure creates harder struggles later. True awareness requires actively stepping out of your environment.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp',
            scenarioId: 'lvl_age_18_pratosh',
            idolTraits: { discipline: 90, resilience: 85, risk: 85, leadership: 85, creativity: 80, empathy: 85, vision: 90 }
        },
        // Age 18: Karan Aujla
        {
            id: 'lvl_18_aujla_1',
            title: 'The Double Shift',
            description: 'At 18, living alone in Canada after a flopped debut, you must choose between safe ghostwriting, quitting music for dock jobs, or enduring brutal all-night studio sessions with producer Deep Jandu.',
            requiredStars: 0,
            year: 2015,
            age: 18,
            theme: 'Music',
            age_mirror_text: 'stumbling into a basement studio exhausted after an 8-hour dock shift, deciding whether to sleep or push through another all-night recording session',
            archetype: 'The Resilient',
            personality: 'Karan Aujla',
            bio: 'An 18-year-old immigrant laborer in Canada balancing the physical exhaustion of cargo dock shifts with late-night recording studio sessions.',
            fame: 'Global Punjabi music superstar, record-breaking lyricist and singer.',
            achievements: ['Pushed through extreme physical exhaustion to record breakout tracks', 'Formed powerhouse Canadian collaborative team', 'Multi-platinum recording artist and global headliner'],
            lesson: 'Building a dream from the bottom often requires enduring extreme, unglamorous physical and mental exhaustion.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
            scenarioId: 'lvl_age_18_aujla',
            idolTraits: { discipline: 100, resilience: 100, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        // Age 18: Siddhu Moosewala
        {
            id: 'lvl_18_moosewala_1',
            title: 'The Engineering Vault',
            description: 'At 18, leaving Moosa village for GNDEC Ludhiana to study electrical engineering, you must choose between abandoning music for a safe corporate job, dropping out recklessly, or finishing your degree while secretly building a lyrical vault.',
            requiredStars: 0,
            year: 2011,
            age: 18,
            theme: 'Music',
            age_mirror_text: 'sitting in a Ludhiana engineering dorm room late at night, balancing electrical circuit diagrams with handwritten Punjabi lyrics inspired by Tupac',
            archetype: 'The Resilient',
            personality: 'Siddhu Moosewala',
            bio: 'An 18-year-old engineering student from Moosa village carrying his family\'s dreams of a safe degree while secretly building a vast lyrical vault inspired by Tupac Shakur.',
            fame: 'Iconic Punjabi singer, lyricist, and global cultural legend.',
            achievements: ['Completed Electrical Engineering degree while mastering lyricism', 'Built a vault of hundreds of iconic original songs in college', 'Global Billboard chart-topper and voice of Punjabi youth'],
            lesson: 'Fulfilling a practical responsibility does not mean you have to surrender your true passion; the discipline of a tough degree forges the work ethic to dominate your craft.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_SiddhuMoosewala.webp',
            scenarioId: 'lvl_age_18_moosewala',
            idolTraits: { discipline: 100, resilience: 100, risk: 90, leadership: 95, creativity: 100, empathy: 85, vision: 95 }
        },
        // Age 18: Kobe Bryant (The Four Airballs)
        {
            id: 'lvl_18_kobe_1',
            title: 'The Four Airballs',
            description: 'At 18, after shooting 4 crushing airballs in crunch time to knock the Lakers out of the playoffs, you face brutal media mockery. How will you respond?',
            requiredStars: 0,
            year: 1997,
            age: 18,
            theme: 'Sports',
            age_mirror_text: 'standing under the roaring boos in Utah after missing 4 straight clutch shots in an elimination game, deciding whether to hide or hit the gym',
            archetype: 'The Mamba',
            personality: 'Kobe Bryant',
            bio: 'An 18-year-old rookie thrust into NBA playoff crunch time against the Utah Jazz when veteran stars fouled out.',
            fame: '5-time NBA Champion, 2-time Finals MVP, and global basketball icon.',
            achievements: ['Youngest starter in NBA playoff history', 'Turned four playoff airballs into the foundational Mamba Mentality', '5-time NBA Champion and 18-time NBA All-Star'],
            lesson: 'Failure is not a verdict; it is diagnostic data. Humiliation only destroys you if you run away from what caused it.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_kobe.webp',
            scenarioId: 'lvl_age_18_kobe_1',
            idolTraits: { discipline: 100, resilience: 100, risk: 95, leadership: 90, creativity: 85, empathy: 70, vision: 100 }
        },
        {
            id: 'lvl_18', title: 'The Beginning (Country)', description: 'At 18, Taylor faced a choice: Security or Authenticity.',
            requiredStars: 0, year: 2008, age: 18, theme: 'Music', archetype: 'The Artist', personality: 'Taylor Swift',
            bio: 'A country singer on the verge of crossover fame. She faces pressure to stay in her lane.',
            fame: 'The biggest pop star in the world.',
            achievements: ['14 Grammy Awards', 'Only artist to win Album of the Year 4 times', 'Billionaire from music alone'],
            lesson: 'COURAGE to pivot when everyone tells you to stay safe.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_taylor_swift.webp', scenarioId: 'lvl_age_18',
            idolTraits: { discipline: 80, resilience: 85, risk: 70, leadership: 60, creativity: 90, empathy: 95, vision: 80 }
        },
        // Age 18: Zendaya
        {
            id: 'lvl_18_zendaya', title: 'The Identity Strike', description: 'At 18, Zendaya risked her Disney career for creative control.',
            requiredStars: 0, year: 2014, age: 18, theme: 'Arts', archetype: 'The Producer', personality: 'Zendaya',
            bio: 'A Disney star who refused to be just another hollow stereotype.',
            fame: 'Emmy-winning actress and global fashion icon.',
            achievements: ['Youngest two-time Emmy winner', 'Time 100 Most Influential', 'Producer at 18'],
            lesson: 'POWER ISN\'T GIVEN, IT\'S TAKEN.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_zendaya.webp?v=2', scenarioId: 'lvl_age_18_zendaya',
            idolTraits: { discipline: 90, resilience: 95, risk: 100, leadership: 90, creativity: 95, empathy: 85, vision: 95 }
        },
        // Age 18: Viswanathan Anand
        {
            id: 'lvl_18_anand', title: 'The Lightning Kid', description: 'At 18, Anand became India\'s first Grandmaster.',
            requiredStars: 0, year: 1988, age: 18, theme: 'Sports', archetype: 'The Grandmaster', personality: 'Viswanathan Anand',
            bio: 'A chess prodigy who played with such speed and intuition that opponents were left bewildered.',
            fame: 'Five-time World Chess Champion.',
            achievements: ['India\'s first Chess Grandmaster', 'Padma Vibhushan Awardee', 'First recipient of Khel Ratna'],
            lesson: 'INTUITION IS THE FIRST STEP. CALCULATION IS THE SECOND.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp', scenarioId: 'lvl_age_18_anand',
            idolTraits: { discipline: 100, resilience: 90, risk: 75, leadership: 70, creativity: 95, empathy: 60, vision: 100 }
        },
        // Age 18: Virat Kohli
        {
            id: 'lvl_18_kohli', title: 'The Hardest Day', description: 'At 18, Virat faced the ultimate test of duty and grief.',
            requiredStars: 0, year: 2006, age: 18, theme: 'Sports', archetype: 'The King', personality: 'Virat Kohli',
            bio: 'A rising cricketing star who loses his father in the middle of a crucial match.',
            fame: 'One of the greatest batsmen in cricket history.',
            achievements: ['Most runs in a single IPL season', 'Fastest to 10k ODI runs', 'World Cup Winner'],
            lesson: 'DUTY to team and self in the face of unimaginable grief.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp', scenarioId: 'lvl_age_18_kohli',
            idolTraits: { discipline: 95, resilience: 100, risk: 85, leadership: 90, creativity: 75, empathy: 70, vision: 85 }
        },
        // Age 18: Virat Kohli (Conversational)
        {
            id: 'lvl_18_kohli_conv', title: 'Virat Conversational', description: 'Experience Virat\'s journey at 18 through conversational choice slides.',
            requiredStars: 0, year: 2006, age: 18, theme: 'Sports', archetype: 'The King', personality: 'Virat Kohli',
            bio: 'A rising cricketing star who loses his father in the middle of a crucial match.',
            fame: 'One of the greatest batsmen in cricket history.',
            achievements: ['Most runs in a single IPL season', 'Fastest to 10k ODI runs', 'World Cup Winner'],
            lesson: 'DUTY to team and self in the face of unimaginable grief.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp', scenarioId: 'lvl_age_18_virat',
            idolTraits: { discipline: 95, resilience: 100, risk: 85, leadership: 90, creativity: 75, empathy: 70, vision: 85 }
        },
        // Age 18: Dr. A.P.J. Abdul Kalam
        {
            id: 'lvl_18_kalam', title: 'The Big Leap', description: 'At 18, Kalam left his humble town for a prestigious college.',
            requiredStars: 0, year: 1949, age: 18, theme: 'Education', archetype: 'The Visionary', personality: 'Dr. A.P.J. Abdul Kalam',
            bio: 'A brilliant student from a modest background facing the intimidating world of city-bred prodigies.',
            fame: 'The Missile Man of India, 11th President of India.',
            achievements: ['Developed India\'s missile program', 'Bharat Ratna Awardee', 'Beloved People\'s President'],
            lesson: 'SELF-BELIEF is stronger than circumstances.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_apj_kalam.webp', scenarioId: 'lvl_age_18_kalam',
            idolTraits: { discipline: 98, resilience: 95, risk: 70, leadership: 90, creativity: 95, empathy: 100, vision: 100 }
        },
        // Age 18: Ratan Tata
        {
            id: 'lvl_18_tata', title: 'The Defiant Blueprint', description: 'At 18, Ratan chose architecture over his father\'s engineering dreams.',
            requiredStars: 0, year: 1955, age: 18, theme: 'Business', archetype: 'The Patriarch', personality: 'Ratan Tata',
            bio: 'A young heir who defies family pressure to study what he truly loves.',
            fame: 'Iconic leader of the Tata Group.',
            achievements: ['Grew Tata Group revenues 40X', 'Acquired Jaguar Land Rover & Tetley', 'Padma Vibhushan Awardee'],
            lesson: 'AUTHENTICITY over expectation.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ratan_tata.webp', scenarioId: 'lvl_age_18_tata',
            idolTraits: { discipline: 90, resilience: 90, risk: 85, leadership: 100, creativity: 85, empathy: 95, vision: 98 }
        },
        // Age 19: Pratosh Bansal (The Classroom Illusion) - Top of Age 19
        {
            id: 'lvl_19_pratosh',
            title: 'The Classroom Illusion',
            description: 'At 19, navigating the early years of engineering with newfound freedom, you must choose between syllabus comfort or venturing out for real-world industry exposure.',
            requiredStars: 0,
            year: 1991,
            age: 19,
            theme: 'Education',
            age_mirror_text: 'navigating newfound college freedom, deciding whether classroom syllabus comfort is enough or if you need real-world industry exposure',
            archetype: 'The Explorer',
            personality: 'Pratosh Bansal',
            bio: 'An engineering student navigating newfound freedom and the trap of classroom comfort.',
            fame: 'Mechanical Engineering Topper & Industrial Leader.',
            achievements: ['Pioneered self-directed experiential learning', 'Recognized the critical value of early industry exposure', 'Turned academic discipline into leadership in engineering'],
            lesson: 'Classroom success alone does not prepare you for the real world. Lack of early industry exposure creates harder struggles later. True awareness requires actively stepping out of your environment.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp',
            scenarioId: 'lvl_age_19_pratosh',
            idolTraits: { discipline: 85, resilience: 80, risk: 85, leadership: 85, creativity: 80, empathy: 85, vision: 90 }
        },
        // Age 19: Justin Bieber
        {
            id: 'lvl_19_justin', title: 'The Hotel Room at 2AM', description: 'At 19, you sit alone in a hotel room deciding whether to text an ex or face the emptiness underneath.',
            requiredStars: 0, year: 2013, age: 19, theme: 'Music', age_mirror_text: 'sitting in a silent hotel room after playing for a screaming arena', archetype: 'The Resilient', personality: 'Justin Bieber',
            bio: 'A 19-year-old pop phenomenon struggling to find his identity outside of fame and a highly publicized relationship.',
            fame: 'Global pop sensation.',
            achievements: ['Multiple Grammy Awards', 'One of the best-selling music artists', 'Record-breaking stadium tours'],
            lesson: 'THE EMPTINESS UNDERNEATH — finding yourself starts when the noise stops.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-justin-19.webp', scenarioId: 'lvl_age_19_justin',
            idolTraits: { discipline: 70, resilience: 90, risk: 85, leadership: 85, creativity: 95, empathy: 90, vision: 70 }
        },
        // Age 19: Karan Aujla
        {
            id: 'lvl_19_aujla_1',
            title: 'The Ghostwriter\'s Dilemma',
            description: 'At 19, established stars offer big cash for your best lyrics. You must choose between selling out for safe money, risking an unfunded solo release, or leveraging a featured vocal verse.',
            requiredStars: 0,
            year: 2016,
            age: 19,
            theme: 'Music',
            age_mirror_text: 'holding your best written song while an established star offers immediate cash, deciding whether to remain a ghostwriter or negotiate your vocal debut',
            archetype: 'The Strategist',
            personality: 'Karan Aujla',
            bio: 'A 19-year-old sought-after ghostwriter in Canada choosing how to strategically transition from behind-the-scenes lyricist to front-facing superstar.',
            fame: 'Global Punjabi music superstar, record-breaking lyricist and singer.',
            achievements: ['Pioneered the strategic collaboration model to launch solo career', 'Turned ghostwriting leverage into global vocal stardom', 'Billions of streams and sold-out worldwide arena tours'],
            lesson: 'Sometimes you have to leverage what you are known for to get what you actually want; strategic compromise builds lasting foundations.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
            scenarioId: 'lvl_age_19_aujla',
            idolTraits: { discipline: 95, resilience: 95, risk: 90, leadership: 90, creativity: 100, empathy: 85, vision: 100 }
        },
        {
            id: 'lvl_19', title: 'The Visionary', description: 'At 19, Mark had to choose between Harvard and his side project.',
            requiredStars: 3, year: 2004, age: 19, theme: 'Tech', archetype: 'The Founder', personality: 'Mark Zuckerberg',
            bio: 'A Harvard sophomore with a little website called "The Facebook".',
            fame: 'Connects 3 billion people daily.',
            achievements: ['Founder of Facebook', 'Youngest self-made billionaire', 'Revolutionized social media'],
            lesson: 'RISK taking when the "safe path" (Harvard) looks perfect.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/zuck_happy.webp', scenarioId: 'lvl_age_19', // Placeholder avatar
            idolTraits: { discipline: 90, resilience: 80, risk: 95, leadership: 85, creativity: 75, empathy: 40, vision: 99 }
        },
        // Age 19: Neeraj Chopra
        {
            id: 'lvl_19_neeraj', title: 'The Lonely Flight', description: 'At 19, Neeraj chose isolation over fame.',
            requiredStars: 0, year: 2016, age: 19, theme: 'Sports', archetype: 'The Monk', personality: 'Neeraj Chopra',
            bio: 'A 19-year-old Javelin World Junior Record holder who chose a lonely path to Olympic Gold.',
            fame: 'Olympic Gold Medalist. National Hero.',
            achievements: ['Olympic Gold (Tokyo 2020)', 'World Athletics Champion', 'First Indian to win Diamond League'],
            lesson: 'FAME IS A DISTRACTION; MASTERY IS THE GOAL.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_neeraj.webp?v=2', scenarioId: 'lvl_age_19_neeraj',
            idolTraits: { discipline: 100, resilience: 95, risk: 85, leadership: 80, creativity: 75, empathy: 70, vision: 95 }
        },
        // Age 19: Shubman Gill
        {
            id: 'lvl_19_shubman', title: 'The Prince', description: 'At 19, Shubman was named Player of the Tournament in the U-19 World Cup.',
            requiredStars: 0, year: 2018, age: 19, theme: 'Sports', archetype: 'The Prince', personality: 'Shubman Gill',
            bio: 'A cricket prodigy who carried the weight of a nation\'s expectations with quiet grace.',
            fame: 'Indian International Cricketer.',
            achievements: ['U-19 World Cup Player of the Tournament', 'Fastest to 2000 ODI runs', 'Orange Cap Winner (IPL 2023)'],
            lesson: 'PRESSURE IS JUST A SHADOW. IT DISAPPEARS WHEN YOU FACE THE LIGHT.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_shubman.webp?v=2', scenarioId: 'lvl_age_19_shubman',
            idolTraits: { discipline: 90, resilience: 85, risk: 90, leadership: 80, creativity: 85, empathy: 75, vision: 90 }
        },
        // Age 19: Sachin Tendulkar
        {
            id: 'lvl_19_sachin', title: 'The Trial of Fire', description: 'At 19, you must face the most lethal fast bowlers on Earth.',
            requiredStars: 0, year: 1992, age: 19, theme: 'Sports', archetype: 'The Prodigy', personality: 'Sachin Tendulkar',
            bio: 'A teenage prodigy entrusted with the hopes of a billion people on the fiercest cricket pitch in the world.',
            fame: 'The God of Cricket.',
            achievements: ['100 International Centuries', 'Bharat Ratna Awardee', 'Highest run-scorer in cricket history'],
            lesson: 'COURAGE to stand your ground when veterans fall.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sachin.webp', scenarioId: 'lvl_age_19_sachin',
            idolTraits: { discipline: 100, resilience: 98, risk: 80, leadership: 85, creativity: 95, empathy: 85, vision: 90 }
        },
        // Age 19: Sundar Pichai
        {
            id: 'lvl_19_sundar', title: 'The Divided Mind', description: 'At 19, the pressure of IIT threatens to crush your curiosity.',
            requiredStars: 0, year: 1991, age: 19, theme: 'Tech', archetype: 'The Explorer', personality: 'Sundar Pichai',
            bio: 'An introverted student at IIT Kharagpur, fascinated by computers but drowning in metallurgical coursework.',
            fame: 'CEO of Google and Alphabet.',
            achievements: ['Led development of Google Chrome', 'Became CEO of Alphabet', 'Padma Bhushan Awardee'],
            lesson: 'CURIOSITY to explore outside the assigned path.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sundar.webp', scenarioId: 'lvl_age_19_sundar',
            idolTraits: { discipline: 95, resilience: 90, risk: 70, leadership: 95, creativity: 85, empathy: 90, vision: 95 }
        },
        // Age 19: Shah Rukh Khan
        {
            id: 'lvl_19_srk', title: 'A Stage For Grief', description: 'At 19, you lose your father and immerse yourself in the chaotic world of theatre.',
            requiredStars: 0, year: 1984, age: 19, theme: 'Arts', age_mirror_text: 'studying economics while sneaking into theatre rehearsals every evening', archetype: 'The Entertainer', personality: 'Shah Rukh Khan',
            bio: 'A grieving economics student who finds solace and explosive energy under the lights of Delhi theatre.',
            fame: 'The King of Bollywood. Global Icon.',
            achievements: ['14 Filmfare Awards', 'Padma Shri Awardee', 'One of the most recognized actors internationally'],
            lesson: 'PASSION as the ultimate antidote to despair.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp', scenarioId: 'lvl_age_19_srk',
            idolTraits: { discipline: 85, resilience: 100, risk: 90, leadership: 90, creativity: 98, empathy: 95, vision: 85 }
        },
        // Age 19: Shah Rukh Khan (Story 2)
        {
            id: 'lvl_19_srk_2', title: 'Leave Delhi or Stay', description: 'At 19, SRK must choose between family duty and the pull of Mumbai.',
            requiredStars: 0, year: 1984, age: 19, theme: 'Arts', age_mirror_text: 'studying economics while sneaking into theatre rehearsals every evening', archetype: 'The Entertainer', personality: 'Shah Rukh Khan',
            bio: 'A rising theatre star whose family needs him in Delhi while Mumbai beckons with opportunity.',
            fame: 'The King of Bollywood. Global Icon.',
            achievements: ['14 Filmfare Awards', 'Padma Shri Awardee', 'One of the most recognized actors internationally'],
            lesson: 'TIMING IS STRATEGY — ambition without roots collapses.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp', scenarioId: 'lvl_age_19_srk_2',
            idolTraits: { discipline: 85, resilience: 100, risk: 90, leadership: 90, creativity: 98, empathy: 95, vision: 85 }
        },
        // Age 20: Pratosh Bansal
        {
            id: 'lvl_20_pratosh', title: 'The Classroom Illusion', description: 'At 20, Pratosh faced a choice: rely on syllabus comfort or venture out for industry exposure.',
            requiredStars: 0, year: 1990, age: 20, theme: 'Education', archetype: 'The Pioneer', personality: 'Pratosh Bansal',
            age_mirror_text: 'navigating newfound college freedom and deciding whether syllabus comfort is enough',
            bio: 'An engineering student navigating newfound freedom and the trap of classroom comfort.',
            fame: 'Distinguished educator and engineering mentor.',
            achievements: ['Overcame the classroom illusion', 'Pioneered experiential learning', 'Champion of early industry exposure'],
            lesson: 'Classroom success alone does not prepare you for the real world. True awareness requires actively stepping out.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp', scenarioId: 'lvl_age_20_pratosh',
            idolTraits: { discipline: 85, resilience: 80, risk: 85, leadership: 85, creativity: 80, empathy: 85, vision: 90 }
        },
        // Age 20: Billie Eilish (Story 2)
        {
            id: 'lvl_20_billie_2', title: 'The Person Who Left You On Seen', description: 'At 20, you must choose between chasing someone who ghosts you, or turning the pain into art.',
            requiredStars: 0, year: 2022, age: 20, theme: 'Music', age_mirror_text: 'waiting for a text back while your songs play everywhere', archetype: 'The Vulnerable', personality: 'Billie Eilish',
            bio: 'A 20-year-old global superstar learning the painful difference between emotional dependence and actual love.',
            fame: 'Grammy record-holder. Gen Z\'s most honest voice.',
            achievements: ['5 Grammys at age 18', 'Youngest artist to record a Bond theme', 'TIME100 Most Influential'],
            lesson: 'THE COST OF ATTACHMENT — sometimes the most loving thing you can do for yourself is remove access.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-billie-20.webp', scenarioId: 'lvl_age_20_billie_2',
            idolTraits: { discipline: 80, resilience: 90, risk: 85, leadership: 70, creativity: 100, empathy: 95, vision: 85 }
        },
        // Age 20: Narendra Modi
        {
            id: 'lvl_20_modi', title: 'The Canteen and the Calling', description: 'At 20, working in a canteen, a young man feels a deep pull toward a life of ascetic national service.',
            requiredStars: 0, year: 1970, age: 20, theme: 'Leadership', age_mirror_text: 'serving tea in a canteen while dreaming of dedicating your entire life to a larger cause', archetype: 'The Ascetic', personality: 'Narendra Modi',
            bio: 'A 20-year-old running a tea stall in Ahmedabad, torn between a regular livelihood and joining the RSS as a full-time Pracharak.',
            fame: 'Prime Minister of India.',
            achievements: ['Longest-serving non-Congress Prime Minister of India', 'Chief Minister of Gujarat for 12 years', 'Time Person of the Year Reader\'s Poll Winner'],
            lesson: 'PURPOSE REQUIRES SACRIFICE — choosing a calling often means leaving conventional security behind.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Narendra Modi.webp', scenarioId: 'lvl_age_20_modi',
            idolTraits: { discipline: 100, resilience: 95, risk: 85, leadership: 100, creativity: 70, empathy: 80, vision: 100 }
        },
        // Age 20: Prajakta Koli
        {
            id: 'lvl_20_prajakta', title: 'The 2 AM Panic', description: 'At 20, Prajakta quit her 10-year dream job for a risky YouTube career.',
            requiredStars: 0, year: 2014, age: 20, theme: 'Media', archetype: 'The Authentic', personality: 'Prajakta Koli',
            bio: 'A disillusioned Radio Jockey intern who took a leap of faith to become MostlySane.',
            fame: 'India\'s top female comedy creator. Actor.',
            achievements: ['7M+ YouTube Subscribers', 'Forbes 30 Under 30', 'Climate Change Ambassador'],
            lesson: 'DON\'T CLING TO A MISTAKE JUST BECAUSE YOU SPENT A LONG TIME MAKING IT.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_prajakta.webp?v=2', scenarioId: 'lvl_age_20_prajakta',
            idolTraits: { discipline: 85, resilience: 90, risk: 95, leadership: 85, creativity: 95, empathy: 100, vision: 90 }
        },
        // Age 20: Selena Gomez
        {
            id: 'lvl_20_selena', title: 'The Invisible War', description: 'At 20, Selena battled Lupus behind the perfect pop-star facade.',
            requiredStars: 0, year: 2012, age: 20, theme: 'Music', archetype: 'The Vulnerable', personality: 'Selena Gomez',
            bio: 'A global superstar who chose to reveal her illness rather than maintain a perfect image.',
            fame: 'Global pop sensation and mental health advocate.',
            achievements: ['Most followed woman on Instagram', 'Founder of Rare Beauty', 'Mental health philanthropist'],
            lesson: 'VULNERABILITY IS THE ULTIMATE STRENGTH.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_selena.webp?v=2', scenarioId: 'lvl_age_20_selena',
            idolTraits: { discipline: 85, resilience: 100, risk: 90, leadership: 95, creativity: 90, empathy: 100, vision: 85 }
        },
        // Age 20: Kobe
        {
            id: 'lvl_20_kobe',
            title: 'The Mamba',
            description: 'At 20, Kobe chose the gym over the party.',
            requiredStars: 6, year: 1998, age: 20, theme: 'Sports', archetype: 'The Mamba', personality: 'Kobe Bryant',
            bio: 'A young NBA prodigy who realizes talent isnt enough.',
            fame: 'One of the greatest basketball players ever.',
            achievements: ['5-time NBA Champion', '18-time All-Star', 'Oscar Winner (Dear Basketball)'],
            lesson: 'DISCIPLINE to do the boring work when no one is watching.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/kobe-portrait.webp', scenarioId: 'lvl_age_20_kobe',
            idolTraits: { discipline: 100, resilience: 100, risk: 75, leadership: 88, creativity: 70, empathy: 60, vision: 85 }
        },
        // Age 20: NV Sir
        {
            id: 'lvl_20_nv_sir',
            title: 'The Educator\'s Dilemma',
            description: 'At 20, NV Sir chose teaching over immediate financial relief.',
            requiredStars: 6, year: 2003, age: 20, theme: 'Education', archetype: 'The Mentor', personality: 'Nitin Vijay (NV Sir)',
            bio: 'An aspiring engineer whose family needs financial support NOW.',
            fame: 'One of the most loved Physics teachers in India.',
            achievements: ['Founder of Motion Education', 'Mentored thousands of IITians', 'Revolutionized online teaching'],
            lesson: 'LONG-TERM VISION beats short-term comfort.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_nv_sir.webp', scenarioId: 'lvl_age_20_nv_sir',
            idolTraits: { discipline: 90, resilience: 95, risk: 85, leadership: 90, creativity: 80, empathy: 95, vision: 100 }
        },
        // Age 20: Taylor (Soloist)
        {
            id: 'lvl_20_taylor',
            title: 'The Soloist',
            description: 'At 20, Taylor faced critics who said she had ghostwriters.',
            requiredStars: 6, year: 2010, age: 20, theme: 'Music', archetype: 'The Soloist', personality: 'Taylor Swift',
            bio: 'Already a star, but critics say shes a fake. She needs to prove her voice is hers.',
            fame: 'The biggest pop star in the world.',
            achievements: ['Wrote "Speak Now" album entirely alone', 'Highest-grossing tour in history', 'Time Person of the Year'],
            lesson: 'OWNERSHIP of your work and your narrative.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_taylor_swift.webp', scenarioId: 'lvl_age_20_music',
            idolTraits: { discipline: 88, resilience: 90, risk: 75, leadership: 80, creativity: 98, empathy: 95, vision: 85 }
        },
        // Age 20: Frida
        {
            id: 'lvl_20_frida',
            title: 'The Icon',
            description: 'At 20, Frida painted from her bed in pain.',
            requiredStars: 6, year: 1927, age: 20, theme: 'Art', archetype: 'The Icon', personality: 'Frida Kahlo',
            bio: 'Bedridden after a tragic bus accident. Her body is broken, but her spirit is vivid.',
            fame: 'Mexico\'s most famous artist.',
            achievements: ['First Mexican artist in the Louvre', 'Icon of feminism and LGBTQ+', 'Master of self-portraits'],
            lesson: 'RESILIENCE to turn pain into power and art.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_frida.webp', scenarioId: 'lvl_age_20_art',
            idolTraits: { discipline: 70, resilience: 100, risk: 80, leadership: 70, creativity: 99, empathy: 95, vision: 80 }
        },
        // Age 20: Arnold
        {
            id: 'lvl_20_arnold',
            title: 'The AWOL Gamble',
            description: 'At 20, Arnold escaped the army to chase a dream.',
            requiredStars: 6, year: 1967, age: 20, theme: 'Sports', archetype: 'The Terminator', personality: 'Arnold Schwarzenegger',
            bio: 'A tank driver in the Austrian Army who dreams of being the strongest man on Earth.',
            fame: 'Action Hero, Governor, Bodybuilder.',
            achievements: ['7-time Mr. Olympia', 'Highest paid actor of the 90s', 'Governor of California'],
            lesson: 'VISION that is so clear, defying authority becomes a necessity.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_arnold.webp', scenarioId: 'scenario_arnold_awol',
            idolTraits: { discipline: 95, resilience: 90, risk: 90, leadership: 90, creativity: 60, empathy: 60, vision: 100 }
        },
        // Age 20: Hawking
        {
            id: 'lvl_20_hawking',
            title: 'The Death Sentence',
            description: 'At 20, Stephen was given 2 years to live.',
            requiredStars: 6, year: 1962, age: 20, theme: 'Science', archetype: 'The Genius', personality: 'Stephen Hawking',
            bio: 'A brilliant PhD student whose own body becomes his prison.',
            fame: 'Solved the mysteries of the universe.',
            achievements: ['Discovered Hawking Radiation', 'Author of A Brief History of Time', 'Lived 55 years longer than predicted'],
            lesson: 'PURPOSE to find infinite space within a finite time.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_hawking.webp', scenarioId: 'scenario_hawking_diagnosis',
            idolTraits: { discipline: 95, resilience: 100, risk: 60, leadership: 85, creativity: 95, empathy: 75, vision: 100 }
        },
        // Age 20: Mary Shelley
        {
            id: 'lvl_20_shelley',
            title: 'The Monster\'s Birth',
            description: 'At 20, Mary wrote the first sci-fi novel during a storm.',
            requiredStars: 6, year: 1817, age: 20, theme: 'Writing', archetype: 'The Creator', personality: 'Mary Shelley',
            bio: 'The daughter of radicals who created a monster that outlived them all.',
            fame: 'Author of Frankenstein.',
            achievements: ['Invented Science Fiction', 'Wrote Frankenstein at 19', 'Literary Icon'],
            lesson: 'IMAGINATION to look into the darkness.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_mary_shelley.webp', scenarioId: 'lvl_age_20_literature',
            idolTraits: { discipline: 85, resilience: 90, risk: 85, leadership: 70, creativity: 100, empathy: 95, vision: 90 }
        },
        // Age 20: Steven Spielberg
        {
            id: 'lvl_20_spielberg',
            title: 'The Director',
            description: 'At 20, Steven sneaked into Universal Studios and pretended he worked there.',
            requiredStars: 6, year: 1966, age: 20, theme: 'Cinema', archetype: 'The Director', personality: 'Steven Spielberg',
            bio: 'A college reject who refused to take no for an answer.',
            fame: 'Most successful director in history.',
            achievements: ['3 Academy Awards', 'Creator of the Blockbuster', 'Co-founded DreamWorks'],
            lesson: 'AUDACITY to authorize yourself.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_spielberg_young.webp', scenarioId: 'lvl_age_20_cinema',
            idolTraits: { discipline: 90, resilience: 95, risk: 90, leadership: 95, creativity: 100, empathy: 85, vision: 100 }
        },
        // Age 20: Bill Gates (Default)
        {
            id: 'lvl_20_gate',
            title: 'The Architect',
            description: 'At 20, Bill saw the future and had to bluff his way into it.',
            requiredStars: 6, year: 1975, age: 20, theme: 'Tech', archetype: 'The Architect', personality: 'Bill Gates',
            bio: 'A dropout selling software he hasn\'t written yet to a company he\'s never visited.',
            fame: 'Founder of Microsoft.',
            achievements: ['The richest man in the world for 18 years', 'Revolutionized Personal Computing', 'Major Philanthropist'],
            lesson: 'CONFIDENCE to bet on yourself before you are ready.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_bill_gates.webp', scenarioId: 'lvl_age_20',
            idolTraits: { discipline: 92, resilience: 85, risk: 90, leadership: 95, creativity: 85, empathy: 70, vision: 98 }
        },
        // Age 20: Narendra Modi
        {
            id: 'lvl_20_modi',
            title: 'The Canteen and the Calling',
            description: 'At 20, serving tea at a bus depot canteen while torn between monastic life, family business, and grassroots national service.',
            requiredStars: 0,
            year: 1970,
            age: 20,
            theme: 'Leadership',
            age_mirror_text: 'working at a bustling bus depot canteen, balancing spiritual ideals against the reality of grassroots national service',
            archetype: 'The Pracharak',
            personality: 'Narendra Modi',
            bio: 'A 20-year-old serving tea at Ahmedabad bus depot canteen after two years in the Himalayas, deciding how to ground spiritual ideals into disciplined national service.',
            fame: 'Prime Minister of India and grassroots organizer.',
            achievements: ['Prime Minister of India (2014–present)', 'Chief Minister of Gujarat (2001–2014)', 'Full-time grassroots pracharak from youth'],
            lesson: 'True purpose often lies at the intersection of your highest ideals and the gritty reality of everyday work.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Narendra Modi.webp',
            scenarioId: 'lvl_age_20_modi',
            idolTraits: { discipline: 98, resilience: 95, risk: 90, leadership: 98, creativity: 80, empathy: 85, vision: 95 }
        },
        // Age 21: Pratosh Bansal (The Opinion Trap) - Top of Age 21
        {
            id: 'lvl_21_pratosh',
            title: 'The Opinion Trap',
            description: 'At 21, branch topper Pratosh had to overcome shyness and fear of judgment to commit to his career.',
            requiredStars: 0,
            year: 1993,
            age: 21,
            theme: 'Education',
            archetype: 'The Pioneer',
            personality: 'Pratosh Bansal',
            age_mirror_text: 'standing at graduation with top marks, confronting shyness and the fear of what others think',
            bio: 'A top engineering graduate and GATE qualifier confronting extreme shyness, social anxiety, and career direction.',
            fame: 'Distinguished educator and engineering mentor.',
            achievements: ['Branch topper & GATE qualifier', 'Overcame social judgment & early shyness', 'Pioneered mindset-driven engineering education'],
            lesson: 'Either do the work you love, or actively choose to love the work you do. The biggest disease is worrying what people will say.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp',
            scenarioId: 'lvl_age_21_pratosh',
            idolTraits: { discipline: 90, resilience: 90, risk: 80, leadership: 85, creativity: 80, empathy: 85, vision: 90 }
        },
        // Age 21: Karan Aujla
        {
            id: 'lvl_21_aujla_1',
            title: 'The Crossover Gamble',
            description: 'At 21, with loyal underground hip-hop credibility, you must choose between staying in your safe niche or risking your street cred by fusing rap with traditional folk vocals on \'Don\'t Worry\'.',
            requiredStars: 0,
            year: 2018,
            age: 21,
            theme: 'Music',
            age_mirror_text: 'standing in a high-end recording studio in 2018, deciding whether to protect your underground hip-hop street cred or gamble on a commercial folk fusion',
            archetype: 'The Innovator',
            personality: 'Karan Aujla',
            bio: 'A 21-year-old rising Punjabi hip-hop artist deciding whether to risk his underground street credibility to attempt a bold mainstream folk crossover.',
            fame: 'Global Punjabi music superstar, record-breaking lyricist and singer.',
            achievements: ['Pioneered modern hip-hop and Punjabi folk genre fusion', 'Broke international streaming records with "Don\'t Worry"', 'Became first Punjabi artist to win Juno Fan Choice Award'],
            lesson: 'True artistic growth often requires risking the approval of your earliest supporters; blending your unique edge with unexpected traditions creates culture-shifting breakthroughs.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
            scenarioId: 'lvl_age_21_aujla',
            idolTraits: { discipline: 95, resilience: 95, risk: 100, leadership: 90, creativity: 100, empathy: 85, vision: 100 }
        },
        // Age 21: Virat Kohli
        {
            id: 'lvl_21_virat_kohli',
            title: 'The Ego Check',
            description: 'At 21, dropped from the national team and labeled an arrogant flash-in-the-pan, you are sent to play in empty Australian grounds. How do you respond?',
            requiredStars: 0,
            year: 2009,
            age: 21,
            theme: 'Sports',
            age_mirror_text: 'standing in an empty sun-baked stadium in Australia, deciding whether to nurse a bruised ego or rebuild through relentless discipline',
            archetype: 'The Resilient',
            personality: 'Virat Kohli',
            bio: 'A 21-year-old batsman experiencing his first major career demotion after early international hype.',
            fame: 'Indian cricket icon and one of the greatest batsmen of all time.',
            achievements: ['Scored 104* in the 2009 Emerging Players Tournament Final', 'Earned immediate senior team recall', 'ICC Cricketer of the Decade'],
            lesson: 'Natural talent only gets you to the door; extreme ownership and discipline keep you in the room. Your response to demotion defines your actual character.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp',
            scenarioId: 'lvl_age_21_virat_kohli',
            idolTraits: { discipline: 100, resilience: 95, risk: 85, leadership: 95, creativity: 80, empathy: 75, vision: 95 }
        },
        
        {
            id: 'lvl_21_sheeran_1', title: 'The Photo She Might See', description: 'At 21, you must choose how to handle the painful intersection of a recent breakup and sudden public attention.',
            requiredStars: 0, year: 2012, age: 21, theme: 'Music', archetype: 'The Artist', personality: 'Ed Sheeran',
            bio: 'A 21-year-old musician dealing with a breakup while his career takes off.',
            fame: 'Grammy-winning Singer-Songwriter',
            achievements: ['One of the best-selling music artists of all time'],
            lesson: 'Sometimes it is learning how to carry personal pain while the rest of your life keeps moving.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ed-sheeran.webp', scenarioId: 'lvl_age_21_sheeran_1',
            idolTraits: { discipline: 85, resilience: 90, risk: 80, leadership: 70, creativity: 100, empathy: 95, vision: 85 }
        },
        {
            id: 'lvl_21_sheeran_2', title: 'The People That Still Feel Like Home', description: 'At 21, you must decide what success is allowed to cost you in your personal life.',
            requiredStars: 0, year: 2012, age: 21, theme: 'Music', archetype: 'The Artist', personality: 'Ed Sheeran',
            bio: 'A 21-year-old musician dealing with a breakup while his career takes off.',
            fame: 'Grammy-winning Singer-Songwriter',
            achievements: ['One of the best-selling music artists of all time'],
            lesson: 'Success changes your schedule before it changes your identity.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ed-sheeran.webp', scenarioId: 'lvl_age_21_sheeran_2',
            idolTraits: { discipline: 85, resilience: 90, risk: 80, leadership: 70, creativity: 100, empathy: 95, vision: 85 }
        },

        
        {
            id: 'lvl_21_selena_1', title: 'When Everyone Has an Opinion', description: 'At 21, you must choose how to handle the painful intersection of a recent relationship and sudden public attention.',
            requiredStars: 0, year: 2013, age: 21, theme: 'Music', archetype: 'The Vulnerable', personality: 'Selena Gomez',
            bio: 'A 21-year-old musician trying to understand what she wants from a relationship while everyone else tries to decide for her.',
            fame: 'Global pop star transitioning to a mature era',
            achievements: ['First Billboard 200 number-one album with Stars Dance'],
            lesson: 'A relationship becomes harder to understand when everyone outside it has an opinion.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_selena.webp?v=2', scenarioId: 'lvl_age_21_selena_1',
            idolTraits: { discipline: 85, resilience: 90, risk: 80, leadership: 70, creativity: 100, empathy: 95, vision: 85 }
        },
        {
            id: 'lvl_21_selena_2', title: 'Your Own Name', description: 'At 21, you must decide how much of the person people know is actually the person you want to become.',
            requiredStars: 0, year: 2013, age: 21, theme: 'Music', archetype: 'The Vulnerable', personality: 'Selena Gomez',
            bio: 'A 21-year-old establishing her independent creative identity while the world watches her grow up.',
            fame: 'Global pop star transitioning to a mature era',
            achievements: ['First Billboard 200 number-one album with Stars Dance'],
            lesson: 'You do not need to remain the same person simply because other people became comfortable with who you used to be.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_selena.webp?v=2', scenarioId: 'lvl_age_21_selena_2',
            idolTraits: { discipline: 85, resilience: 90, risk: 80, leadership: 70, creativity: 100, empathy: 95, vision: 85 }
        },
        {
            id: 'lvl_21_tanmay_1', title: 'Should I Really Do This?', description: 'At 21, Tanmay Bhat enters the Mumbai stand-up comedy circuit, deciding how seriously to take his talent before having proof it will work.',
            requiredStars: 0, year: 2008, age: 21, theme: 'Arts', age_mirror_text: 'performing open mics in Mumbai while deciding whether comedy can become a career', archetype: 'The Creator', personality: 'Tanmay Bhat',
            bio: 'A 21-year-old performing at Mumbai open-mic events, figuring out if stand-up comedy is worth taking seriously.',
            fame: 'Co-founder of All India Bakchod. Comedian and Digital Creator.',
            achievements: ['Won Weirdass Ham-ateur Night (2009)', 'Over 100 stand-up shows by 2011', 'Co-founded AIB'],
            lesson: 'A CREATIVE CAREER BEGINS BEFORE THE EVIDENCE — you are choosing whether to keep showing up long enough to find out what you might become.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-tanmay-bhat.webp', scenarioId: 'lvl_age_21_tanmay_1',
            idolTraits: { discipline: 80, resilience: 90, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        {
            id: 'lvl_21_tanmay_2', title: 'The Five Minutes', description: 'At 21, Tanmay Bhat gets his first major breakthrough opportunity at the Weirdass Ham-ateur Night competition in Mumbai.',
            requiredStars: 0, year: 2009, age: 21, theme: 'Arts', age_mirror_text: 'standing backstage at Ham-ateur Night in Mumbai with five minutes to show his style', archetype: 'The Creator', personality: 'Tanmay Bhat',
            bio: 'A 21-year-old comedian competing at Weirdass Ham-ateur Night, deciding how to approach a high-stakes 5-minute set.',
            fame: 'Co-founder of All India Bakchod. Comedian and Digital Creator.',
            achievements: ['Won Weirdass Ham-ateur Night (2009)', 'Joined Weirdass Comedy writing team', 'Opened for Vir Das'],
            lesson: 'THE FIRST BREAKTHROUGH IS EVIDENCE — a single opportunity can turn a possibility into evidence.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-tanmay-bhat.webp', scenarioId: 'lvl_age_21_tanmay_2',
            idolTraits: { discipline: 80, resilience: 90, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        {
            id: 'lvl_21_michael_1', title: 'Not Just the Jackson 5', description: 'At 21, Michael Jackson enters the Off the Wall era in Los Angeles, deciding how to shape his adult solo musical identity with Quincy Jones.',
            requiredStars: 0, year: 1979, age: 21, theme: 'Music', age_mirror_text: 'recording Off the Wall in Los Angeles, establishing an adult solo sound', archetype: 'The Perfectionist', personality: 'Michael Jackson',
            bio: 'A 21-year-old artist in Los Angeles transitioning from child stardom to adult solo musical independence.',
            fame: 'Grammy-winning Solo Artist. Off the Wall Era.',
            achievements: ['First solo album with four Top 10 Billboard hits', 'Grammy winner for Don\'t Stop \'Til You Get Enough', 'Pioneered adult R&B/pop crossover'],
            lesson: 'NOT REJECTING WHERE YOU CAME FROM — growing up does not mean becoming completely different; it means deciding which parts of your old identity still belong to you.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp', scenarioId: 'lvl_age_21_michael_1',
            idolTraits: { discipline: 95, resilience: 90, risk: 85, leadership: 85, creativity: 100, empathy: 80, vision: 100 }
        },
        {
            id: 'lvl_21_michael_2', title: 'Good Enough or Your Best?', description: 'At 21, as the music takes shape, Michael Jackson faces the tension between continuous refinement and releasing his work.',
            requiredStars: 0, year: 1979, age: 21, theme: 'Music', age_mirror_text: 'in the Los Angeles recording studio, refining vocal takes and rhythm arrangements', archetype: 'The Perfectionist', personality: 'Michael Jackson',
            bio: 'A 21-year-old solo artist learning when perfectionism serves the music and when the work must be released into the world.',
            fame: 'Grammy-winning Solo Artist. Off the Wall Era.',
            achievements: ['First solo album with four Top 10 Billboard hits', 'Grammy winner for Don\'t Stop \'Til You Get Enough', 'Pioneered adult R&B/pop crossover'],
            lesson: 'LEAVING THE WORK IN THE WORLD — perfection can be a strength, but creative work also requires knowing when to release something into the world.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp', scenarioId: 'lvl_age_21_michael_2',
            idolTraits: { discipline: 95, resilience: 90, risk: 85, leadership: 85, creativity: 100, empathy: 80, vision: 100 }
        },

        // Age 21: Shah Rukh Khan
        {
            id: 'lvl_21_srk', title: 'The Role That Could Destroy You', description: 'At 21, SRK faces a villain role that could define or end his career.',
            requiredStars: 0, year: 1986, age: 21, theme: 'Arts', age_mirror_text: 'doing small TV roles, completely broke, sharing a tiny Delhi flat', archetype: 'The Entertainer', personality: 'Shah Rukh Khan',
            bio: 'A young performer offered a psychologically complex villain role that everyone warns against.',
            fame: 'The King of Bollywood. Global Icon.',
            achievements: ['14 Filmfare Awards', 'Padma Shri Awardee', 'One of the most recognized actors internationally'],
            lesson: 'COMPLEXITY OVER COMFORT — playing safe builds a career, playing true builds a legend.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp', scenarioId: 'lvl_age_21_srk',
            idolTraits: { discipline: 85, resilience: 100, risk: 95, leadership: 90, creativity: 98, empathy: 95, vision: 85 }
        },
        // Age 21
        {
            id: 'lvl_21', title: 'The Rebel', description: 'At 21, Steve started a company in a garage with no money.',
            requiredStars: 9, year: 1976, age: 21, theme: 'Tech', archetype: 'The Rebel', personality: 'Steve Jobs',
            bio: 'Hippy, fruitarian, and dropout. He sees personal computers as a bicycle for the mind.',
            fame: 'Co-Founder of Apple.',
            achievements: ['Created iPhone, Mac, and Pixar', 'Changed 5 industries forever', 'Design genius'],
            lesson: 'SIMPLICITY in a world of clutter and noise.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_steve_jobs.webp', scenarioId: 'lvl_age_21',
            idolTraits: { discipline: 85, resilience: 90, risk: 95, leadership: 90, creativity: 100, empathy: 50, vision: 100 }
        },
        // Age 22: Pratosh Bansal
        {
            id: 'lvl_22_pratosh',
            title: 'The Biggest Disease',
            description: 'At 22, Pratosh joined an Art of Living course to overcome the paralyzing fear of what people say and learn true acceptance.',
            requiredStars: 0,
            year: 1994,
            age: 22,
            theme: 'Philosophy',
            archetype: 'The Pioneer',
            personality: 'Pratosh Bansal',
            age_mirror_text: 'dealing with acceptance and social judgment, wondering what principles will guide your life',
            bio: 'A 22-year-old engineering graduate overcoming the paralyzing fear of "what people will say" through deep personal acceptance.',
            fame: 'Distinguished educator and engineering mentor.',
            achievements: ['Overcame the paralyzing fear of social judgment', 'Attended Art of Living and mastered internal acceptance', 'Champion of purpose and conviction over external approval'],
            lesson: 'The biggest disease is worrying about what people will say. If your intentions are right, you don\'t need to fear being proven wrong.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp',
            scenarioId: 'lvl_age_22_pratosh',
            idolTraits: { discipline: 90, resilience: 95, risk: 85, leadership: 85, creativity: 80, empathy: 90, vision: 90 }
        },
        // Age 22: Karan Aujla
        {
            id: 'lvl_22_aujla_1',
            title: 'The Name Nobody Knew Yet',
            description: 'At 22, past the first spike of \'Don\'t Worry\', you face the quiet stretch: do you take safe ghostwriting checks for stars, or keep staking your own name on uncertain solo tracks like \'Chitta Kurta\'?',
            requiredStars: 0,
            year: 2019,
            age: 22,
            theme: 'Music',
            age_mirror_text: 'sitting in a modest home studio in Surrey in late 2019, deciding whether to take safe songwriting cash or keep releasing music under your own name',
            archetype: 'The Resilient',
            personality: 'Karan Aujla',
            bio: 'A 22-year-old artist in Surrey, BC working through the post-breakout grind to prove his first hit wasn\'t a fluke.',
            fame: 'Global Punjabi music superstar, record-breaking lyricist and singer.',
            achievements: ['Proved breakout success was not a one-hit fluke with "Chitta Kurta"', 'Maintained creative independence without safe ghostwriting compromises', 'Set the stage for record-shattering 2021 debut album BTFU'],
            lesson: 'One hit doesn\'t buy security — the real test is what you do in the quiet stretch after it; being good enough to write for others doesn\'t mean you\'re finished being an artist yourself.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
            scenarioId: 'lvl_age_22_aujla',
            idolTraits: { discipline: 95, resilience: 100, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        // Age 22: Siddhu Moosewala
        {
            id: 'lvl_22_moosewala_1',
            title: 'The One-Way Ticket',
            description: 'At 22, freshly graduated with an electrical engineering degree in Punjab, you must decide whether to take a safe corporate job or take on massive student loans to move to Canada and chase your music.',
            requiredStars: 0,
            year: 2016,
            age: 22,
            theme: 'Music',
            age_mirror_text: 'staring at your freshly printed engineering degree in Punjab while holding a one-way visa to Canada, deciding whether to take the safe corporate job or leap into the unknown',
            archetype: 'The Audacious',
            personality: 'Siddhu Moosewala',
            bio: 'A 22-year-old engineering graduate in Punjab choosing between local corporate security and taking on international student debt to forge his musical identity in Canada.',
            fame: 'Iconic Punjabi singer, lyricist, and global cultural legend.',
            achievements: ['Graduated in Electrical Engineering before taking the leap to Canada', 'Embraced massive immigrant struggle to build an original sound', 'Global phenomenon who revolutionized modern Punjabi music'],
            lesson: 'Sometimes you have to finish the path others laid out for you before you can forge your own; true growth requires leaving behind home safety to struggle in an unknown environment.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_SiddhuMoosewala.webp',
            scenarioId: 'lvl_age_22_moosewala',
            idolTraits: { discipline: 95, resilience: 100, risk: 100, leadership: 95, creativity: 100, empathy: 85, vision: 100 }
        },
        {
            id: 'lvl_22', title: 'The Dreamer', description: 'At 22, Walt lost everything and drew a mouse on a train.',
            requiredStars: 12, year: 1923, age: 22, theme: 'Art', archetype: 'The Dreamer', personality: 'Walt Disney',
            bio: 'Bankrupt cartoonist. He has a one-way ticket to Hollywood and $40 in his pocket.',
            fame: 'Creator of the Disney Magic.',
            achievements: ['Winner of 22 Academy Awards', 'Creator of Mickey Mouse', 'Built Disneyland'],
            lesson: 'IMAGINATION to see a kingdom where others see a blank page.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_walt_disney.webp', scenarioId: 'lvl_age_22',
            idolTraits: { discipline: 85, resilience: 95, risk: 90, leadership: 85, creativity: 100, empathy: 85, vision: 100 }
        },
        {
            id: 'lvl_22_michael', title: 'The Life You Built', description: 'At 22, Michael must balance the Triumph Tour with his brothers and his rising solo aspirations.',
            requiredStars: 0, year: 1981, age: 22, theme: 'Music', age_mirror_text: 'rehearsing in Van Nuys while carrying the weight of two careers', archetype: 'The Perfectionist', personality: 'Michael Jackson',
            bio: 'A 22-year-old superstar preparing the Triumph Tour while preparing to redefine the global music landscape.',
            fame: 'The King of Pop. Global Icon.',
            achievements: ['8 Grammy Awards in one night (Thriller)', 'Best-selling album of all time (Thriller)', 'Pioneered modern music videos'],
            lesson: 'TWO CAREERS, ONE LIFE — a choice can be meaningful without being permanent.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp', scenarioId: 'lvl_age_22_michael',
            idolTraits: { discipline: 95, resilience: 90, risk: 85, leadership: 85, creativity: 100, empathy: 80, vision: 100 }
        },
        {
            id: 'lvl_22_ashneer', title: 'The Next Degree', description: 'At 22, Ashneer Grover stands between IIT Delhi and IIM Ahmedabad, deciding how to shape his career direction.',
            requiredStars: 0, year: 2004, age: 22, theme: 'Business', age_mirror_text: 'entering IIM Ahmedabad after IIT Delhi, facing career uncertainty', archetype: 'The Analyst', personality: 'Ashneer Grover',
            bio: 'A 22-year-old IIT Delhi graduate entering IIM Ahmedabad, learning to bridge engineering and finance.',
            fame: 'Co-founder of BharatPe. Former Shark Tank India judge.',
            achievements: ['IIT Delhi & INSA Lyon Exchange', 'IIM Ahmedabad MBA in Finance', 'Built BharatPe into a fintech giant'],
            lesson: 'DON\'T OVERPROTECT YOUR PAST — combine technical skill and finance for a broader toolkit.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ashneer-grover.webp', scenarioId: 'lvl_age_22_ashneer',
            idolTraits: { discipline: 90, resilience: 85, risk: 95, leadership: 90, creativity: 85, empathy: 60, vision: 95 }
        },
        {
            id: 'lvl_22_bhuvan', title: 'When the Phone Started Working', description: 'At 22, Bhuvan Bam must choose between his original craft of music and the sudden explosive growth of BB Ki Vines.',
            requiredStars: 0, year: 2016, age: 22, theme: 'Arts', age_mirror_text: 'performing live music in Delhi while his comedy channel crosses one million subscribers', archetype: 'The Creator', personality: 'Bhuvan Bam',
            bio: 'A 22-year-old history graduate and musician whose home-shot YouTube comedy videos have suddenly gone viral in millions.',
            fame: 'Pioneering Indian digital creator. Creator of BB Ki Vines.',
            achievements: ['First Indian individual creator to cross 10 million subscribers', 'TEDx Speaker at age 22', 'Most Popular Channel award at WebTVAsia 2016'],
            lesson: 'PROTECT WHAT MADE YOU DIFFERENT — build systems to support your growth without losing your unique voice.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhuvan-bam.webp', scenarioId: 'lvl_age_22_bhuvan',
            idolTraits: { discipline: 85, resilience: 90, risk: 95, leadership: 85, creativity: 100, empathy: 90, vision: 95 }
        },
        {
            id: 'lvl_22_ronaldo', title: 'The Price of Becoming Complete', description: 'At 22, Cristiano Ronaldo faces intense pressure to transform from a flamboyant young winger into a complete, decisive superstar.',
            requiredStars: 0, year: 2007, age: 22, theme: 'Sports', age_mirror_text: 'celebrating a Premier League title at Manchester United while facing European pressure', archetype: 'The Competitor', personality: 'Cristiano Ronaldo',
            bio: 'A 22-year-old Portuguese winger who has won his first Premier League title, learning to turn individual flair into clinical output.',
            fame: 'One of the greatest footballers in history. Global Icon.',
            achievements: ['5-time Ballon d\'Or winner', '5 Champions League titles', 'All-time leading goalscorer in international football'],
            lesson: 'THE STANDARD MOVES — success does not remove pressure; it changes who applies it.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-cristiano-ronaldo.webp', scenarioId: 'lvl_age_22_ronaldo',
            idolTraits: { discipline: 100, resilience: 95, risk: 95, leadership: 90, creativity: 95, empathy: 70, vision: 95 }
        },
        {
            id: 'lvl_22_ranveer', title: 'The Role You Can\'t See Yet', description: 'At 22, Ranveer Singh returns to Mumbai after studying in the US, figuring out how to build a runway toward acting.',
            requiredStars: 0, year: 2007, age: 22, theme: 'Arts', age_mirror_text: 'working in advertising and assistant directing in Mumbai while holding onto an acting dream', archetype: 'The Performer', personality: 'Ranveer Singh',
            bio: 'A 22-year-old returnee from Indiana University, working in advertising and assistant directing while looking for a way into acting.',
            fame: 'A-list Hindi Cinema Superstar. Filmfare Award Winner.',
            achievements: ['Breakthrough debut in Band Baaja Baaraat', '5 Filmfare Awards', 'One of highest-grossing Indian actors'],
            lesson: 'PROXIMITY IS NOT THE DESTINATION — stepping stones are useful, but eventually you must pursue the target directly.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-ranveer-singh.webp', scenarioId: 'lvl_age_22_ranveer',
            idolTraits: { discipline: 85, resilience: 95, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        {
            id: 'lvl_22_alia', title: 'More Than a Star', description: 'At 22, Alia Bhatt faces rising expectations after early success, deciding how to stretch her range beyond early acclaim.',
            requiredStars: 0, year: 2015, age: 22, theme: 'Arts', age_mirror_text: 'balancing commercial expectations with a desire for deeper artistic growth in Mumbai', archetype: 'The Prodigy', personality: 'Alia Bhatt',
            bio: 'A 22-year-old actor with four successful films behind her, looking to expand her artistic range beyond early expectations.',
            fame: 'Critically acclaimed Hindi Cinema Superstar. National Film Award Winner.',
            achievements: ['National Film Award for Best Actress', '6 Filmfare Awards', 'Time 100 Most Influential People'],
            lesson: 'DON\'T LET EARLY SUCCESS DEFINE THE CEILING — use leverage to make yourself harder to categorize.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-alia-bhatt.webp', scenarioId: 'lvl_age_22_alia',
            idolTraits: { discipline: 90, resilience: 90, risk: 85, leadership: 80, creativity: 100, empathy: 90, vision: 95 }
        },
        {
            id: 'lvl_22_bhagat', title: 'The Price of a Voice', description: 'At 22, Bhagat Singh fights for political prisoner rights from inside Lahore Central Jail and turns the court into a platform.',
            requiredStars: 0, year: 1929, age: 22, theme: 'History', age_mirror_text: 'enduring prison and courtroom trials in Lahore, defining conviction through sacrifice', archetype: 'The Revolutionary', personality: 'Bhagat Singh',
            bio: 'A 22-year-old freedom fighter imprisoned in Lahore, leading historical hunger strikes and challenging colonial courts.',
            fame: 'Iconic Indian Revolutionary Leader. Shaheed-e-Azam.',
            achievements: ['116-day historical hunger strike', 'Central Assembly protest for worker rights', 'Enduring national symbol of courage'],
            lesson: 'CONVICTION HAS A COST — deciding what price you are willing to pay for your principles.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhagat-singh.webp', scenarioId: 'lvl_age_22_bhagat',
            idolTraits: { discipline: 100, resilience: 100, risk: 100, leadership: 95, creativity: 85, empathy: 90, vision: 100 }
        },
        {
            id: 'lvl_22_tanmay_1', title: 'Just 200 People', description: 'At 22, Tanmay Bhat and Gursimran Khamba start the All India Bakchod podcast, aiming for 200 people in a room before knowing how big it would become.',
            requiredStars: 0, year: 2012, age: 22, theme: 'Arts', age_mirror_text: 'starting a podcast in Mumbai with no guarantee of who will show up', archetype: 'The Creator', personality: 'Tanmay Bhat',
            bio: 'A 22-year-old comedy writer and performer in Mumbai, experimenting with a new podcast format before knowing if anyone will care.',
            fame: 'Co-founder of All India Bakchod. Comedian and Digital Creator.',
            achievements: ['Co-founded AIB', 'Pioneered Indian podcasting & digital sketch comedy', 'Leading YouTube creator and producer'],
            lesson: 'SMALL BEGINNINGS ARE STILL DECISIONS — you do not always know whether an idea is good before you invest in it.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-tanmay-bhat.webp', scenarioId: 'lvl_age_22_tanmay_1',
            idolTraits: { discipline: 80, resilience: 90, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        {
            id: 'lvl_22_tanmay_2', title: 'What If We Go Bigger?', description: 'At 22, the small podcast experiment begins exceeding original expectations as audiences grow.',
            requiredStars: 0, year: 2012, age: 22, theme: 'Arts', age_mirror_text: 'watching an experimental podcast grow into a larger comedy platform in Mumbai', archetype: 'The Creator', personality: 'Tanmay Bhat',
            bio: 'A 22-year-old comedian in Mumbai whose small project is growing faster than expected.',
            fame: 'Co-founder of All India Bakchod. Comedian and Digital Creator.',
            achievements: ['Co-founded AIB', 'Pioneered Indian podcasting & digital sketch comedy', 'Leading YouTube creator and producer'],
            lesson: 'WHEN REALITY EXCEEDS EXPECTATIONS — you do not need to know that something will become huge before taking it seriously.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-tanmay-bhat.webp', scenarioId: 'lvl_age_22_tanmay_2',
            idolTraits: { discipline: 80, resilience: 90, risk: 95, leadership: 85, creativity: 100, empathy: 85, vision: 95 }
        },
        // Age 23: Siddhu Moosewala
        {
            id: 'lvl_23_moosewala_1',
            title: 'The Brampton Hustle',
            description: 'At 23, an international student doing manual labor in Brampton, you must decide whether to save your money for tuition safety or gamble it on recording your solo debut track, \'G-Wagon\'.',
            requiredStars: 0,
            year: 2016,
            age: 23,
            theme: 'Music',
            age_mirror_text: 'standing in a cold Brampton basement apartment in 2016, deciding whether to put your hard-earned labor savings into tuition or gamble it on your first music video',
            archetype: 'The Audacious',
            personality: 'Siddhu Moosewala',
            bio: 'A 23-year-old international student in Brampton, Canada balancing manual labor survival with a high-stakes gamble to fund his solo singing debut.',
            fame: 'Iconic Punjabi singer, lyricist, and global cultural legend.',
            achievements: ['Self-funded debut solo track "G-Wagon" as an immigrant student', 'Pioneered modern gangster-folk Punjabi rap globally', 'First Indian artist to perform at Wireless Festival and chart on Global Billboard 200'],
            lesson: 'True independence often requires risking the very safety nets you worked hard to build; betting on yourself is terrifying, but it is the only way to own your future.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_SiddhuMoosewala.webp',
            scenarioId: 'lvl_age_23_moosewala',
            idolTraits: { discipline: 95, resilience: 100, risk: 100, leadership: 95, creativity: 100, empathy: 85, vision: 100 }
        },
        // Age 23: Shah Rukh Khan
        {
            id: 'lvl_23_srk', title: 'Gauri or Career', description: 'At 23, SRK must choose between love and the career opportunity of a lifetime.',
            requiredStars: 0, year: 1988, age: 23, theme: 'Arts', age_mirror_text: 'newly married, juggling love and an uncertain acting career in Mumbai', archetype: 'The Entertainer', personality: 'Shah Rukh Khan',
            bio: 'A young actor in love, facing family resistance, while Mumbai\'s Bollywood doors are finally opening.',
            fame: 'The King of Bollywood. Global Icon.',
            achievements: ['14 Filmfare Awards', 'Padma Shri Awardee', 'One of the most recognized actors internationally'],
            lesson: 'LOVE IS NOT A DISTRACTION — the right relationship makes you MORE yourself, not less.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp', scenarioId: 'lvl_age_23_srk',
            idolTraits: { discipline: 85, resilience: 100, risk: 90, leadership: 90, creativity: 98, empathy: 100, vision: 85 }
        },
        {
            id: 'lvl_23', title: 'The Voice', description: 'At 23, Oprah was fired for being too emotional. It was a gift.',
            requiredStars: 15, year: 1977, age: 23, theme: 'Media', archetype: 'The Voice', personality: 'Oprah Winfrey',
            bio: 'An evening news anchor who creates too much connection with the stories.',
            fame: 'Queen of Media.',
            achievements: ['First black female billionaire', 'Highest-rated talk show in history', 'Presidential Medal of Freedom'],
            lesson: 'AUTHENTICITY is your superpower, not your weakness.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_oprah.webp', scenarioId: 'lvl_age_23',
            idolTraits: { discipline: 88, resilience: 92, risk: 80, leadership: 90, creativity: 85, empathy: 100, vision: 90 }
        },
        // Age 24: Tina Dabi (Story 1)
        {
            id: 'lvl_24_tina_1', title: 'The College Sacrifice', description: 'At 21, Tina had to choose between social life and The Hindu.',
            requiredStars: 18, year: 2014, age: 24, theme: 'Civil Services', archetype: 'The Strategist', personality: 'Tina Dabi',
            bio: 'A college student with a singular goal: The hardest exam in the world.',
            fame: 'UPSC Topper (AIR 1, 2015).',
            achievements: ['Cleared UPSC at age 22', 'First attempt topper', 'Inspiration to millions of aspirants'],
            lesson: 'SACRIFICE of the good (fun) for the great (legacy).',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_tina_dabi.webp', scenarioId: 'scenario_upsc_tina_college',
            idolTraits: { discipline: 98, resilience: 95, risk: 60, leadership: 85, creativity: 65, empathy: 80, vision: 90 }
        },
        // Age 25: Shah Rukh Khan
        {
            id: 'lvl_25_srk', title: 'Mumbai Is Eating Me Alive', description: 'At 25, SRK is running out of money in Mumbai. One bet could change everything.',
            requiredStars: 0, year: 1990, age: 25, theme: 'Arts', age_mirror_text: 'struggling in Mumbai with a handful of films, not yet a star', archetype: 'The Entertainer', personality: 'Shah Rukh Khan',
            bio: 'A struggling actor in Mumbai with dwindling funds and one last high-stakes decision to make.',
            fame: 'The King of Bollywood. Global Icon.',
            achievements: ['14 Filmfare Awards', 'Padma Shri Awardee', 'One of the most recognized actors internationally'],
            lesson: 'BET ON YOURSELF — when you know what you came for, don\'t settle for anything less.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_srk.webp', scenarioId: 'lvl_age_25_srk',
            idolTraits: { discipline: 85, resilience: 100, risk: 98, leadership: 90, creativity: 98, empathy: 95, vision: 90 }
        },
        // Age 19: Billie Eilish
        {
            id: 'lvl_19_billie', title: 'Fame Is Eating Me Alive', description: 'At 19, Billie won 5 Grammys and was falling apart inside.',
            requiredStars: 0, year: 2020, age: 19, theme: 'Music', age_mirror_text: 'recording her debut album in her childhood bedroom, battling depression', archetype: 'The Vulnerable', personality: 'Billie Eilish',
            bio: 'The most streamed artist on the planet, battling body dysmorphia and depression behind closed doors.',
            fame: 'Grammy record-holder. Gen Z\'s most honest voice.',
            achievements: ['5 Grammys at age 18', 'Youngest artist to record a Bond theme', 'TIME100 Most Influential'],
            lesson: 'VULNERABILITY IS STRENGTH — stopping to heal is the most courageous act.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_billie.webp', scenarioId: 'lvl_age_19_billie',
            idolTraits: { discipline: 80, resilience: 90, risk: 85, leadership: 70, creativity: 100, empathy: 95, vision: 85 }
        },
        // Age 19: MrBeast
        {
            id: 'lvl_19_mrbeast', title: 'Drop Out or Keep Uploading', description: 'At 19, Jimmy had 30K subscribers and a ridiculous idea. College apps were due tomorrow.',
            requiredStars: 0, year: 2017, age: 19, theme: 'Media', age_mirror_text: 'uploading YouTube videos daily to an audience of almost nobody', archetype: 'The Disruptor', personality: 'MrBeast',
            bio: 'Five years of uploading with almost no success. One absurd idea that nobody thought would work.',
            fame: '200M+ YouTube subscribers. Gave away $100M+.',
            achievements: ['Largest YouTube channel by subscribers', 'Created MrBeast Burger', 'Planted 20 million trees'],
            lesson: 'ABSURD IDEAS CHANGE THE WORLD — delusional confidence is a superpower.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_mrbeast.webp', scenarioId: 'lvl_age_19_mrbeast',
            idolTraits: { discipline: 90, resilience: 85, risk: 100, leadership: 85, creativity: 95, empathy: 80, vision: 95 }
        },
        // Age 19: Ritesh Agarwal
        {
            id: 'lvl_19_ritesh', title: 'The Dropout Founder', description: 'At 19, Ritesh had ₹2,000, a dropout status, and a world-changing idea.',
            requiredStars: 0, year: 2012, age: 19, theme: 'Business', age_mirror_text: 'dropping out of college to build OYO from a single rented room', archetype: 'The Audacious', personality: 'Ritesh Agarwal',
            bio: 'A college dropout from Odisha who personally lived the problem he was about to solve.',
            fame: 'World\'s youngest billionaire at 25. Founder of OYO Rooms.',
            achievements: ['Thiel Fellowship winner', 'OYO became one of world\'s largest hotel chains', 'Forbes 30 Under 30'],
            lesson: 'PERMISSION IS A TRAP — winners take it, they don\'t wait for it.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ritesh.webp', scenarioId: 'lvl_age_19_ritesh',
            idolTraits: { discipline: 85, resilience: 90, risk: 100, leadership: 85, creativity: 80, empathy: 75, vision: 95 }
        },
        // Age 19: Muhammad Ali
        {
            id: 'lvl_19_ali', title: 'Throw The Medal Away', description: 'At 19, Ali won Olympic gold — then was refused service at a restaurant because of his race.',
            requiredStars: 0, year: 1960, age: 19, theme: 'Activism', age_mirror_text: 'training 6 hours a day after winning Olympic gold, turning professional', archetype: 'The Defiant', personality: 'Muhammad Ali',
            bio: 'Olympic champion. Refused entry to a restaurant in his own hometown. A decision awaited.',
            fame: 'Greatest boxer of all time. Greatest activist of his generation.',
            achievements: ['3-time World Heavyweight Champion', 'Olympic Gold Medalist', 'Presidential Medal of Freedom'],
            lesson: 'YOUR INTEGRITY IS WORTH MORE THAN ANY TROPHY.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ali.webp', scenarioId: 'lvl_age_19_ali',
            idolTraits: { discipline: 90, resilience: 100, risk: 95, leadership: 95, creativity: 80, empathy: 85, vision: 90 }
        },
        // Age 20: Dhruv Rathee
        {
            id: 'lvl_20_dhruv', title: 'Germany or India', description: 'At 20, an engineering scholar in Germany felt India needed his voice more than his degree.',
            requiredStars: 6, year: 2014, age: 20, theme: 'Media', age_mirror_text: 'studying engineering in Germany while making political videos on the side', archetype: 'The Educator', personality: 'Dhruv Rathee',
            bio: 'A scholarship student in Germany watching misinformation spread in India, with 500 YouTube subscribers.',
            fame: 'India\'s most influential YouTube journalist. 20M+ subscribers.',
            achievements: ['20M+ YouTube subscribers', 'Covered 2024 Indian elections extensively', 'CNN-News18 Digital Influencer Award'],
            lesson: 'BUILD THE BRIDGE WHILE CROSSING IT — patience in the building phase is architecture.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_dhruv.webp', scenarioId: 'lvl_age_20_dhruv',
            idolTraits: { discipline: 90, resilience: 85, risk: 80, leadership: 75, creativity: 90, empathy: 95, vision: 95 }
        },
        // Age 19: Falguni Nayar (shown at 19 as college beginning)
        {
            id: 'lvl_19_falguni', title: 'Science or Business', description: 'At 19 at IIM Ahmedabad, Falguni had a fire inside her — but the world said wait.',
            requiredStars: 0, year: 1982, age: 19, theme: 'Business', age_mirror_text: 'studying commerce in Mumbai, quietly watching how businesses were built', archetype: 'The Patient Founder', personality: 'Falguni Nayar',
            bio: 'One of few women at IIM in 1982, told to play it safe. Her real company was 30 years away.',
            fame: 'India\'s first self-made female billionaire. Founder of Nykaa.',
            achievements: ['Founded Nykaa at age 49', 'India\'s first self-made female billionaire (2021)', 'Nykaa IPO at $13B valuation'],
            lesson: 'THERE IS NO WRONG TIME TO BEGIN — the entrepreneurship window never closes.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_falguni.webp', scenarioId: 'lvl_age_19_falguni',
            idolTraits: { discipline: 95, resilience: 90, risk: 80, leadership: 95, creativity: 75, empathy: 85, vision: 100 }
        },
        // Age 19: Nikola Tesla
        {
            id: 'lvl_19_tesla', title: 'Trust Your Visions', description: 'At 19, Tesla\'s professors called his mental visualizations a breakdown. They were his superpower.',
            requiredStars: 0, year: 1875, age: 19, theme: 'Science', age_mirror_text: 'studying physics in Austria, obsessed with alternating current theory', archetype: 'The Visionary', personality: 'Nikola Tesla',
            bio: 'A 19-year-old engineering student in Austria whose mind could build and test machines before touching a single component.',
            fame: 'His alternating current system powers the entire modern world.',
            achievements: ['Invented AC power system', 'Pioneered radio technology', 'Holds 300+ patents'],
            lesson: 'THE MIND THAT SEES DIFFERENTLY IS NOT BROKEN — trust the vision that others call delusion.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_tesla.webp', scenarioId: 'lvl_age_19_tesla',
            idolTraits: { discipline: 95, resilience: 85, risk: 90, leadership: 60, creativity: 100, empathy: 60, vision: 100 }
        },
        // Age 22: Rani Lakshmibai
        {
            id: 'lvl_22_rani_lakshmibai', title: 'The Silent Palace', description: 'At 22, the Queen of Jhansi faces the death of her infant son and an empire waiting to take her kingdom.',
            requiredStars: 0, year: 1851, age: 22, theme: 'Leadership', age_mirror_text: 'bearing an entire kingdom\'s future while processing the most devastating personal loss of your life', archetype: 'The Sovereign', personality: 'Rani Lakshmibai',
            bio: 'A 22-year-old Queen forced to suppress her grief as a young mother and project absolute strength while a foreign empire watched for any sign of weakness.',
            fame: 'The Rani of Jhansi. India\'s most celebrated warrior-queen and symbol of resistance against British colonial rule.',
            achievements: ['Led the defence of Jhansi during the 1857 uprising', 'Died in battle at age 29, still fighting for Jhansi\'s freedom', 'Immortalised in Indian national memory as a symbol of courage and sovereignty'],
            lesson: 'IN POSITIONS OF IMMENSE RESPONSIBILITY, personal grief is often politically weaponized — forcing leaders to process their pain behind a mask of strength.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-rani-lakshmibai.webp', scenarioId: 'lvl_age_22_rani_lakshmibai',
            idolTraits: { discipline: 95, resilience: 100, risk: 90, leadership: 98, creativity: 75, empathy: 85, vision: 90 }
        },
        // Age 11: Virat Kohli
        {
            id: 'lvl_11_virat_kohli', title: 'The Extra Hour', description: 'At 11, young Virat Kohli trains at West Delhi Cricket Academy, facing decisions between raw instinct and disciplined technical correction.',
            requiredStars: 0, year: 2000, age: 11, theme: 'Sports', age_mirror_text: 'pushing through extra practice rounds at the academy while others pack up', archetype: 'The Competitive Prodigy', personality: 'Virat Kohli',
            bio: 'An 11-year-old training at the West Delhi Cricket Academy under coach Raj Kumar Sharma, driven by intense competitive desire and relentless practice.',
            fame: 'Indian cricket icon and one of the greatest batsmen of all time.',
            achievements: ['U-19 World Cup winning captain (2008)', '2011 ICC World Cup Champion', '2024 T20 World Cup Champion'],
            lesson: 'PERSISTENCE AND TECHNIQUE — Natural ability shows capability; disciplined practice determines consistency.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp', scenarioId: 'lvl_age_11_virat_kohli',
            idolTraits: { discipline: 95, resilience: 95, risk: 85, leadership: 90, creativity: 80, empathy: 75, vision: 90 }
        },
        {
            id: 'lvl_25', title: 'The Storyteller', description: 'At 25, J.K. Rowling got the idea for Harry Potter on a delayed train.',
            requiredStars: 21, year: 1990, age: 25, theme: 'Writing', archetype: 'The Storyteller', personality: 'J.K. Rowling',
            bio: 'A secretary day-dreaming about wizards on a 4-hour delayed train to London.',
            fame: 'Author of Harry Potter.',
            achievements: ['Best-selling book series in history', 'First billionaire author', 'Defined a generation of readers'],
            lesson: 'CREATIVITY strikes in the quiet moments of life.',
            avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_jk_rowling.webp', scenarioId: 'lvl_age_25',
            idolTraits: { discipline: 85, resilience: 98, risk: 85, leadership: 75, creativity: 100, empathy: 90, vision: 95 }
        }
    ];

    // Instead of isolating the user to only one age group,
    // we return the entire timeline of scenarios mapped together into a massive journey.
    return levels.map((l) => {
        // Unlock all levels initially for testing and immediate availability
        return {
            ...l,
            status: 'unlocked',
            isLocked: false,
            stars: 0
        } as Level;
    });
}
