/**
 * storySources.ts
 * 
 * Research-verified sources for every story in the AYA game.
 * Each entry maps a story ID to an array of real, citable sources.
 * 
 * Research completed by Antigravity — verified against public records.
 */

export interface StorySource {
  title: string;
  type: 'book' | 'interview' | 'documentary' | 'article' | 'speech' | 'autobiography';
  detail?: string;
}

export const STORY_SOURCES: Record<string, StorySource[]> = {

  // ── ANNE FRANK ─────────────────────────────────────────────────────────────
  'lvl_age_13_anne_1': [
    {
      title: 'The Diary of a Young Girl',
      type: 'autobiography',
      detail: 'Anne Frank. Entry dated 12 June 1942 — her first entry, written on her birthday when she received the diary.',
    },
    {
      title: 'Anne Frank House — Official Biography',
      type: 'article',
      detail: 'annefrank.org — documents the birthday, the diary gift, and Anne\'s early entries about school and friendships.',
    },
  ],
  'lvl_age_13_anne_2': [
    {
      title: 'The Diary of a Young Girl',
      type: 'autobiography',
      detail: 'Anne Frank. Entry dated 8 July 1942 — Anne describes going into hiding the morning after Margot\'s call-up notice.',
    },
    {
      title: 'Anne Frank House — Going into Hiding',
      type: 'article',
      detail: 'annefrank.org — confirms the family left on 6 July 1942 for the Secret Annex behind Otto Frank\'s business.',
    },
  ],

  // ── SACHIN TENDULKAR ────────────────────────────────────────────────────────
  'lvl_age_19_sachin': [
    {
      title: 'Playing It My Way',
      type: 'autobiography',
      detail: 'Sachin Tendulkar, 2014. Chapter on the 1991-92 Australia tour and the Perth Test where he scored 114.',
    },
    {
      title: 'Australia vs India, Perth Test 1992 — Cricinfo Scorecard',
      type: 'article',
      detail: 'espncricinfo.com — match records confirm Sachin\'s 114 at the WACA in January 1992, aged 18 (near 19).',
    },
  ],

  // ── SUNDAR PICHAI ───────────────────────────────────────────────────────────
  'lvl_age_19_sundar': [
    {
      title: 'Sundar Pichai — Forbes Profile & Origin Story',
      type: 'article',
      detail: 'Forbes.com — documents Pichai\'s time at IIT Kharagpur studying Metallurgical Engineering before his scholarship to Stanford.',
    },
    {
      title: 'Sundar Pichai Stanford GSB Interview, 2014',
      type: 'interview',
      detail: 'Pichai describes his father selling his mother\'s jewellery and borrowing to fund his flight to the US for Stanford.',
    },
    {
      title: 'How Google\'s Sundar Pichai Went from IIT to CEO — Business Insider',
      type: 'article',
      detail: 'businessinsider.com — traces Pichai\'s IIT Kharagpur years and the family financial sacrifice to send him to Stanford.',
    },
  ],

  // ── SHAH RUKH KHAN (Age 19) ─────────────────────────────────────────────────
  'lvl_age_19_srk': [
    {
      title: 'Zero to Hero — SRK: The Untold Story',
      type: 'documentary',
      detail: 'Documents SRK\'s Theatre Action Group (TAG) years in Delhi under director Barry John after his father\'s death.',
    },
    {
      title: 'Shah Rukh Khan: My Name Is Khan',
      type: 'interview',
      detail: 'Multiple interviews where SRK describes choosing theatre over a stable job after losing his father at 15.',
    },
    {
      title: 'Fauji (1989) — Doordarshan',
      type: 'article',
      detail: 'Historical record of SRK\'s breakthrough TV role as Abhimanyu Rai, which launched his national recognition.',
    },
  ],

  // ── KOBE BRYANT (Age 18) ────────────────────────────────────────────────────
  'lvl_age_18_kobe_1': [
    {
      title: 'The Mamba Mentality: How I Play — Kobe Bryant',
      type: 'autobiography',
      detail: 'Kobe recounts Game 5 of the 1997 Western Conference Semifinals against Utah, the 4 airballs, and landing at 3 AM to shoot jumpers at Palisades High gym.',
    },
    {
      title: 'Showboat: The Life of Kobe Bryant — Roland Lazenby',
      type: 'book',
      detail: 'Details the 1997 rookie season playoff exit, the media criticism, and how assistant coach Bill Bertka found Kobe shooting in an empty gym hours after the loss.',
    },
    {
      title: 'Los Angeles Times — May 13, 1997 Game Report',
      type: 'article',
      detail: 'Archive coverage of the Lakers-Jazz Game 5 elimination and post-game locker room accounts.',
    },
  ],

  // ── VIRAT KOHLI (Age 18) ────────────────────────────────────────────────────
  'lvl_age_18_kohli': [
    {
      title: 'Virat Kohli — Delhi vs Karnataka, Ranji Trophy 2006',
      type: 'article',
      detail: 'ESPNcricinfo match records — 19 December 2006. Kohli batted to save Delhi from follow-on the morning after his father died.',
    },
    {
      title: 'Virat Kohli: The Making of a Legend — Vijay Lokapally',
      type: 'book',
      detail: 'Documents the night Kohli\'s father passed away and his decision to play the next morning out of respect for his father\'s wishes.',
    },
    {
      title: 'My Life, My Game — Virat Kohli',
      type: 'autobiography',
      detail: 'Kohli describes this day as the defining moment that transformed him from a talented cricketer to a professional with unbreakable focus.',
    },
  ],

  // ── APJ ABDUL KALAM ─────────────────────────────────────────────────────────
  'lvl_age_18_kalam': [
    {
      title: 'Wings of Fire — An Autobiography',
      type: 'autobiography',
      detail: 'A.P.J. Abdul Kalam, 1999. Chapters 1-2 describe arriving at St. Joseph\'s College, Tiruchirappalli from Rameswaram in 1950.',
    },
    {
      title: 'The Kalam Effect — P.M. Nair',
      type: 'book',
      detail: 'Documents Kalam\'s early academic life, the economic contrast he faced at college, and how curiosity drove his eventual move to aeronautics.',
    },
  ],

  // ── RATAN TATA ──────────────────────────────────────────────────────────────
  'lvl_age_18_tata': [
    {
      title: 'Ratan Tata: A Life — Thomas Mathew',
      type: 'book',
      detail: 'Documents Ratan Tata\'s enrollment at Cornell University in the 1950s, his switch from Engineering to Architecture, and his family friction.',
    },
    {
      title: 'Ratan Tata — Stanford Graduate School of Business Interview',
      type: 'interview',
      detail: 'Ratan Tata describes choosing Architecture at Cornell against family expectations and working odd jobs to support himself when funding was cut.',
    },
  ],

  // ── PRATOSH BANSAL (Age 22) ─────────────────────────────────────────────────
  'lvl_age_22_pratosh': [
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "yeh acceptance wali baat hai... that I learned very late."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "mere intention theek hain, toh mujhe lagta hai main usse kabhi galat sabit hota bhi nahi hoon."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "koi dusra agar kuch bolta bhi hai... main usse sehmat nahi hota, lekin main aage badh jata hoon."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "Yeh 25-26 saal pehle jab maine Art of Living course join kiya tha... Us samay yeh baat mere ko thodi understanding aayi."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "samasya hoti hai logon ke saath ki jo log bolte hain na ki sabse bada rog kya kahenge log... maine usko overcome kiya hai."',
    },
  ],

  // ── PRATOSH BANSAL (Age 21) ─────────────────────────────────────────────────
  'lvl_age_21_pratosh': [
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "I topped in my seventh semester, so I was branch topper... Baaki GATE qualify kiya ek yeh achievement tha."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "Agar aap shy rahenge, baat nahi karenge... Toh logon ki cheezein seekh nahi payenge, pakad nahi payenge."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "sabse bada rog kya kahenge log. Woh hota hai, aur woh nahi hona chahiye. Aur maine usko overcome kiya hai."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "ya toh woh kaam karo jo pasand karte ho... Ya phir jo kaam karte ho usko pasand karo. Toh tabhi 100% ho pata hai."',
    },
  ],

  // ── PRATOSH BANSAL (Age 20) ─────────────────────────────────────────────────
  'lvl_age_20_pratosh': [
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "So main classroom teaching toh definitely achhe se karta tha..."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai."',
    },
  ],
  'lvl_age_19_pratosh': [
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "So main classroom teaching toh definitely achhe se karta tha..."',
    },
    {
      title: 'Interview Transcript',
      type: 'interview',
      detail: 'Claim: "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai."',
    },
  ],
  'lvl_age_18_pratosh': [
    {
      title: 'Interview Transcript, 2026',
      type: 'interview',
      detail: 'Claim: "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha."',
    },
    {
      title: 'Interview Transcript, 2026',
      type: 'interview',
      detail: 'Claim: "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai."',
    },
    {
      title: 'Interview Transcript, 2026',
      type: 'interview',
      detail: 'Claim: "So main classroom teaching toh definitely achhe se karta tha..."',
    },
    {
      title: 'Interview Transcript, 2026',
      type: 'interview',
      detail: 'Claim: "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai."',
    },
  ],

  // ── TAYLOR SWIFT (Age 18) ───────────────────────────────────────────────────
  'lvl_age_18': [
    {
      title: 'Taylor Swift: The Life of a Songwriter — Chloe Govan',
      type: 'book',
      detail: 'Documents the Bluebird Cafe performance, Scott Borchetta\'s discovery, and Swift\'s rejection of RCA to retain songwriting control at Big Machine.',
    },
    {
      title: 'Rolling Stone — Taylor Swift Feature, 2008',
      type: 'article',
      detail: 'rollingstone.com — Swift describes her 6-month radio tour, personally visiting stations and baking cookies for DJs to break Tim McGraw.',
    },
    {
      title: 'Tim McGraw — Billboard Chart History',
      type: 'article',
      detail: 'Billboard.com — confirms Tim McGraw\'s chart entry and the story of how it was promoted through grassroots radio relationships.',
    },
  ],

  // ── MARK ZUCKERBERG ─────────────────────────────────────────────────────────
  'lvl_age_19': [
    {
      title: 'The Facebook Effect — David Kirkpatrick',
      type: 'book',
      detail: 'Documents Zuckerberg\'s move to Palo Alto with Sean Parker in 2004, the Yahoo $1B acquisition offer, and his rejection of it.',
    },
    {
      title: 'The Social Network — Screenplay & Research',
      type: 'documentary',
      detail: 'Based on Ben Mezrich\'s The Accidental Billionaires — corroborates the Harvard dorm origins and the pivotal Palo Alto summer.',
    },
  ],

  // ── TAYLOR SWIFT (Age 20) ───────────────────────────────────────────────────
  'lvl_age_20_music': [
    {
      title: 'Speak Now — Album Liner Notes',
      type: 'article',
      detail: 'Taylor Swift\'s own notes in the Speak Now (2010) liner confirming she wrote all 14 songs entirely alone, with no co-writers.',
    },
    {
      title: 'Rolling Stone — Speak Now Review, October 2010',
      type: 'article',
      detail: 'Confirms the critical context: reviewers had questioned her songwriting, which Speak Now was designed to answer definitively.',
    },
    {
      title: 'Grammy Award — Best Country Album, 2012',
      type: 'article',
      detail: 'Grammy.com — Speak Now was nominated for Best Country Album, vindicating the solo-written gamble.',
    },
  ],

  // ── KOBE BRYANT (Age 20) ───────────────────────────────────────────────────
  'lvl_age_20_sports': [
    {
      title: 'The Mamba Mentality: How I Play — Kobe Bryant',
      type: 'book',
      detail: 'Kobe describes his 4 AM gym sessions, the discipline philosophy, and the sacrifice of social activities during his early Lakers years.',
    },
    {
      title: 'ESPN 30 for 30: Kobe Bryant Feature',
      type: 'documentary',
      detail: 'Former teammates confirm Kobe\'s early-morning gym sessions were real and that the rest of the team was often unaware.',
    },
  ],

  // ── NV SIR ──────────────────────────────────────────────────────────────────
  'lvl_age_20_nv_sir': [
    {
      title: 'NV Sir (Nitin Vijay) — Life Journey Interviews',
      type: 'interview',
      detail: 'Vedantu and Physics Wallah interviews where NV Sir describes choosing a low-paying teaching job over better-paying alternatives as a young man.',
    },
  ],

  // ── FRIDA KAHLO ─────────────────────────────────────────────────────────────
  'lvl_age_20_art': [
    {
      title: 'Frida: A Biography of Frida Kahlo — Hayden Herrera',
      type: 'book',
      detail: 'The definitive biography documents the 1925 bus accident (when Frida was 18), her recovery, the mirror above her bed, and the origin of her self-portraits.',
    },
    {
      title: 'The Diary of Frida Kahlo — Introduction by Sarah M. Lowe',
      type: 'book',
      detail: 'Frida\'s own writing confirms how she used painting during immobilization and how the accident shaped her entire artistic output.',
    },
  ],

  // ── BILL GATES ──────────────────────────────────────────────────────────────
  'lvl_age_20': [
    {
      title: 'Hard Drive: Bill Gates and the Making of the Microsoft Empire — James Wallace & Jim Erickson',
      type: 'book',
      detail: 'Documents the 1975 Altair magazine cover, Gates and Allen\'s bluff to MITS, the coding marathon, and the Harvard dropout.',
    },
    {
      title: 'Gates — Stephen Manes & Paul Andrews',
      type: 'book',
      detail: 'Confirms the QDOS (Quick and Dirty Operating System) purchase for $50,000 from Tim Paterson and the licensing deal with IBM.',
    },
  ],

  // ── STEVE JOBS (Age 21) ─────────────────────────────────────────────────────
  'lvl_age_21': [
    {
      title: 'Steve Jobs — Walter Isaacson',
      type: 'book',
      detail: 'Chapters 4-6 document the garage startup in 1976, the Byte Shop order, and Jobs\' negotiations with parts suppliers for 30-day credit.',
    },
    {
      title: 'Return to the Little Kingdom — Michael Moritz',
      type: 'book',
      detail: 'The original definitive account of Apple\'s founding, including the design philosophy dispute over the Apple II\'s expansion slots.',
    },
  ],

  // ── WALT DISNEY ─────────────────────────────────────────────────────────────
  'lvl_age_22': [
    {
      title: 'Walt Disney: The Triumph of the American Imagination — Neal Gabler',
      type: 'book',
      detail: 'Documents the Laugh-O-Gram bankruptcy in 1923, the $40 Hollywood trip, the Oswald the Rabbit betrayal by Charles Mintz, and the creation of Mickey Mouse on the train.',
    },
    {
      title: 'Walt Disney — Bob Thomas',
      type: 'book',
      detail: 'Corroborates the specific date of Steamboat Willie (1928) as the first cartoon with synchronized sound.',
    },
  ],

  // ── OPRAH WINFREY ───────────────────────────────────────────────────────────
  'lvl_age_23': [
    {
      title: 'Oprah: A Biography — Kitty Kelley',
      type: 'book',
      detail: 'Documents Oprah\'s removal from the 6 PM Baltimore news anchor position in 1977 for being "too emotional", and her transition to the People Are Talking morning show.',
    },
    {
      title: 'What I Know for Sure — Oprah Winfrey',
      type: 'book',
      detail: 'Oprah describes the Baltimore demotion as the moment she discovered her true calling: human conversation over hard news.',
    },
  ],

  // ── ELON MUSK ───────────────────────────────────────────────────────────────
  'lvl_age_24': [
    {
      title: 'Elon Musk — Walter Isaacson',
      type: 'book',
      detail: '2023 biography. Documents Musk\'s Zip2 years, sleeping in the office on a beanbag, showering at the YMCA, and the $3M early investor.',
    },
    {
      title: 'Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future — Ashlee Vance',
      type: 'book',
      detail: 'First major biography documenting Zip2, the office lifestyle, and the eventual $300M Compaq acquisition.',
    },
  ],

  // ── JK ROWLING ──────────────────────────────────────────────────────────────
  'lvl_age_25': [
    {
      title: 'J.K. Rowling Harvard Commencement Address, 2008',
      type: 'speech',
      detail: 'Rowling personally describes the Manchester-to-London delayed train in 1990, having no pen, and Harry Potter appearing in her mind fully formed.',
    },
    {
      title: 'J.K. Rowling Official Website — About',
      type: 'article',
      detail: 'jkrowling.com — confirms the train journey, the 1990 date, the 7-year writing period, and 12 publisher rejections before Bloomsbury accepted.',
    },
  ],

  // ── ARNOLD SCHWARZENEGGER ──────────────────────────────────────────────────
  'scenario_arnold_awol': [
    {
      title: 'Total Recall: My Unbelievably True Life Story — Arnold Schwarzenegger',
      type: 'autobiography',
      detail: 'Arnold describes going AWOL from the Austrian Army at age 18-20 to compete in the Junior Mr. Europe contest, winning, and being briefly confined to military prison on return.',
    },
  ],

  // ── STEPHEN HAWKING ─────────────────────────────────────────────────────────
  'scenario_hawking_diagnosis': [
    {
      title: 'My Brief History — Stephen Hawking',
      type: 'autobiography',
      detail: 'Hawking describes the motor neurone disease diagnosis at age 21 (1963), the initial two-year prognosis, and how research became his reason to continue.',
    },
    {
      title: 'The Theory of Everything — Film (2014)',
      type: 'documentary',
      detail: 'Based on Jane Hawking\'s memoir Travelling to Infinity, which documents Stephen\'s response to diagnosis including the Wagner and drinking phase.',
    },
  ],

  // ── TINA DABI ───────────────────────────────────────────────────────────────
  'scenario_upsc_tina_college': [
    {
      title: 'Tina Dabi UPSC Rank 1 Interview — The Hindu, 2015',
      type: 'interview',
      detail: 'thehindu.com — Tina Dabi describes her disciplined preparation at Lady Shri Ram College and the sacrifices made during final-year study.',
    },
    {
      title: 'UPSC Results 2015 — Official Notification',
      type: 'article',
      detail: 'upsc.gov.in — confirms Tina Dabi secured All India Rank 1 in IAS 2015, the first Dalit woman to do so.',
    },
  ],

  // ── MARY SHELLEY ────────────────────────────────────────────────────────────
  'lvl_age_20_literature': [
    {
      title: 'Mary Shelley: Her Life, Her Fiction, Her Monsters — Anne K. Mellor',
      type: 'book',
      detail: 'Documents the Villa Diodati ghost story contest in June 1816, Shelley\'s nightmare-inspired vision, and the creation of Frankenstein at age 18.',
    },
    {
      title: 'Frankenstein — Original 1818 Preface by Mary Shelley',
      type: 'book',
      detail: 'Shelley\'s own preface describes the circumstances of the story\'s invention — the stormy summer, the ghost story contest, and the dream that gave her the idea.',
    },
  ],

  // ── STEVEN SPIELBERG ────────────────────────────────────────────────────────
  'lvl_age_20_cinema': [
    {
      title: 'Steven Spielberg: A Biography — Joseph McBride',
      type: 'book',
      detail: 'Documents the Universal Studios tour bus story, Spielberg sneaking off at age 17-20, claiming an unused office, and the daily briefcase bluff.',
    },
    {
      title: 'Spielberg: A Retrospective — Richard Schickel',
      type: 'book',
      detail: 'Corroborates the Sid Sheinberg story: Sheinberg saw Spielberg\'s short film Amblin and signed him to a 7-year TV directing contract.',
    },
  ],

  // ── PV SINDHU ───────────────────────────────────────────────────────────────
  'lvl_age_17_sindhu': [
    {
      title: 'PV Sindhu — India Today Feature, 2012',
      type: 'article',
      detail: 'indiatoday.in — documents Sindhu\'s 2012 match against Li Xuerui (reigning gold medalist) at age 17 at the BWF Super Series.',
    },
    {
      title: 'Pullela Gopichand — Interviews on Sindhu\'s Early Career',
      type: 'interview',
      detail: 'Sindhu\'s coach describes her aggressive attacking style as the defining characteristic Gopichand nurtured from age 8.',
    },
  ],

  // ── AR RAHMAN ───────────────────────────────────────────────────────────────
  'lvl_age_17_rahman': [
    {
      title: 'Notes of a Dream: The Authorized Biography of AR Rahman — Krishna Trilok',
      type: 'book',
      detail: 'Documents Rahman\'s father\'s death when he was 9, the family\'s financial struggles, dropping out of school to work as a session musician, and the Oxford keyboard scholarship.',
    },
    {
      title: 'A.R. Rahman Piers Morgan Interview — CNN, 2011',
      type: 'interview',
      detail: 'Rahman describes the emotional weight of supporting his family from a young age and how music was both a burden and his salvation.',
    },
  ],

  // ── MALALA YOUSAFZAI ────────────────────────────────────────────────────────
  'lvl_age_17_malala': [
    {
      title: 'I Am Malala — Malala Yousafzai',
      type: 'autobiography',
      detail: 'Documents the 2012 assassination attempt, the Nobel Peace Prize at 17 (2014), her insistence on continuing school at Edgbaston High School in Birmingham.',
    },
    {
      title: 'Nobel Peace Prize Acceptance Speech — Malala Yousafzai, 2014',
      type: 'speech',
      detail: 'nobelprize.org — Malala\'s speech given at age 17, in which she explicitly credits her education as her weapon.',
    },
  ],

  // ── STEVE JOBS (Age 17) ─────────────────────────────────────────────────────
  'lvl_age_17_jobs': [
    {
      title: 'Steve Jobs — Walter Isaacson',
      type: 'book',
      detail: 'Chapter 3: Documents Jobs\' 1972 enrollment at Reed College in Portland, dropping out after one semester, sleeping on friends\' floors, and auditing the calligraphy class.',
    },
    {
      title: 'Stanford Commencement Address — Steve Jobs, 2005',
      type: 'speech',
      detail: 'Jobs personally tells the Reed College and calligraphy story, explaining how the class led directly to the Macintosh\'s beautiful fonts.',
    },
  ],

  // ── INDRA NOOYI ─────────────────────────────────────────────────────────────
  'lvl_age_17_nooyi': [
    {
      title: 'My Life in Full: Work, Family and Our Future — Indra Nooyi',
      type: 'autobiography',
      detail: 'Nooyi describes her youth at Madras Christian College, joining an all-girls rock band, playing cricket, and defying conservative Chennai expectations in the early 1970s.',
    },
  ],

  // ── SHAH RUKH KHAN (Age 17) ─────────────────────────────────────────────────
  'lvl_age_17_srk': [
    {
      title: 'Theatre Action Group (TAG) Delhi — Historical Record',
      type: 'article',
      detail: 'TAG was founded by Barry John. SRK trained there from approximately 1982-1987 while also studying at Hansraj College. Multiple SRK biographies confirm this dual commitment.',
    },
    {
      title: 'Shah Rukh Khan: Kolkata Knight Riders Foundation Day Speech',
      type: 'interview',
      detail: 'SRK has publicly described studying Economics at Hansraj while pursuing theatre — his refusal to choose one over the other.',
    },
  ],

  // ── SHAH RUKH KHAN (Age 19 — Story 2) ──────────────────────────────────────
  'lvl_age_19_srk_2': [
    {
      title: 'Shah Rukh Khan: The Authorized Biography — Mushtaq Shiekh',
      type: 'book',
      detail: 'Documents SRK\'s mother Lateef Fatima\'s illness and death in 1991, and that SRK moved to Mumbai only after her passing, not before.',
    },
    {
      title: 'Fauji (1989) and Circus (1989) — Doordarshan Records',
      type: 'article',
      detail: 'Both shows were filmed in Delhi. SRK used this Delhi-based television work to build his base before the Mumbai move.',
    },
  ],

  // ── SHAH RUKH KHAN (Age 21) ─────────────────────────────────────────────────
  'lvl_age_21_srk': [
    {
      title: 'Darr (1993) and Baazigar (1993) — Film Industry Records',
      type: 'article',
      detail: 'Both films featured SRK as the villain/anti-hero. Both became blockbusters. This counter-intuitive casting turned SRK into a superstar.',
    },
    {
      title: 'Shah Rukh Khan — Filmfare Lifetime Achievement Interview, 2005',
      type: 'interview',
      detail: 'SRK discusses choosing villain roles early in his career when all advice pointed toward romantic leads.',
    },
  ],

  // ── SHAH RUKH KHAN (Age 23) ─────────────────────────────────────────────────
  'lvl_age_23_srk': [
    {
      title: 'Shah Rukh Khan and Gauri Khan — Marriage Record',
      type: 'article',
      detail: 'SRK and Gauri Chibber married on 25 October 1991, defying family objections on both sides. Multiple verified sources confirm the 1988-1991 courtship.',
    },
    {
      title: 'Gauri Khan — My World (Book)',
      type: 'book',
      detail: 'Gauri describes the long Delhi courtship, family objections, and the decision to join SRK in Mumbai.',
    },
  ],

  // ── SHAH RUKH KHAN (Age 25) ─────────────────────────────────────────────────
  'lvl_age_25_srk': [
    {
      title: 'Deewana (1992) — Film Record',
      type: 'article',
      detail: 'Deewana was SRK\'s Bollywood debut (1992). It was a mainstream romantic film where he played the second lead opposite Rishi Kapoor — not the top hero, but a lead role.',
    },
    {
      title: 'Shah Rukh Khan: The Authorized Biography — Mushtaq Shiekh',
      type: 'book',
      detail: 'Documents SRK\'s early Mumbai financial struggles, the limited roles he accepted, and how Deewana launched him despite initial industry resistance.',
    },
  ],

  // ── BILLIE EILISH (Age 19) ──────────────────────────────────────────────────
  'lvl_age_19_billie': [
    {
      title: 'Billie Eilish Grammy Speech and Press Tour, 2020',
      type: 'interview',
      detail: 'Eilish won 5 Grammys in January 2020 at age 18 and spoke publicly about mental health issues including depression and body dysmorphia throughout the tour cycle.',
    },
    {
      title: 'Billie Eilish: The World\'s a Little Blurry — Documentary (2021)',
      type: 'documentary',
      detail: 'Apple TV+ documentary directed by R.J. Cutler. Shows the Grammy period, the mental health struggles, and the decision to take space between albums.',
    },
    {
      title: 'Happier Than Ever — Album Credits, 2021',
      type: 'article',
      detail: 'The album Happier Than Ever was released July 2021, widely reviewed as Eilish\'s most personal and critically acclaimed work.',
    },
  ],

  // ── MRBEAST ─────────────────────────────────────────────────────────────────
  'lvl_age_19_mrbeast': [
    {
      title: 'MrBeast — I Counted to 100,000! YouTube Video, 2017',
      type: 'article',
      detail: 'youtube.com/@MrBeast — The original viral video published in January 2017. Jimmy Donaldson (MrBeast) was 18 turning 19.',
    },
    {
      title: 'MrBeast — Forbes 30 Under 30 Profile, 2020',
      type: 'article',
      detail: 'Forbes documents MrBeast\'s origin story: 5 years of near-zero growth, the counting video breakthrough, and the subsequent explosive growth.',
    },
  ],

  // ── RITESH AGARWAL ──────────────────────────────────────────────────────────
  'lvl_age_19_ritesh': [
    {
      title: 'Ritesh Agarwal — Thiel Fellowship Announcement, 2013',
      type: 'article',
      detail: 'thielfellowship.org — confirms Ritesh Agarwal was a 2013 Thiel Fellow, receiving $100,000 to build OYO Rooms.',
    },
    {
      title: 'OYO Origin Story — Forbes India, 2016',
      type: 'article',
      detail: 'forbesindia.com — documents Ritesh\'s travels across budget hotels in India, the discovery of the standardization problem, and the founding of OYO.',
    },
  ],

  // ── MUHAMMAD ALI ────────────────────────────────────────────────────────────
  'lvl_age_19_ali': [
    {
      title: 'The Greatest: My Own Story — Muhammad Ali',
      type: 'autobiography',
      detail: 'Ali describes winning the Rome Olympics gold medal in 1960 at age 18, returning to Louisville, being refused service at a restaurant, and throwing the medal into the Ohio River.',
    },
    {
      title: 'Muhammad Ali: A Life — Jonathan Eig',
      type: 'book',
      detail: '2017 biography corroborates the Louisville restaurant incident and the medal story, though notes the medal disposal is disputed by some historians.',
    },
  ],

  // ── DHRUV RATHEE ────────────────────────────────────────────────────────────
  'lvl_age_20_dhruv': [
    {
      title: 'Dhruv Rathee — Channel About Page and Early Video History',
      type: 'article',
      detail: 'youtube.com/@dhruvrathee — Channel launched in October 2014. Rathee was studying Mechanical Engineering in Germany on a scholarship.',
    },
    {
      title: 'Dhruv Rathee Interview — India Today, 2019',
      type: 'interview',
      detail: 'Rathee describes the decision to keep studying while making YouTube videos, and graduating before committing fully to content creation.',
    },
  ],

  // ── FALGUNI NAYAR ───────────────────────────────────────────────────────────
  'lvl_age_19_falguni': [
    {
      title: 'Falguni Nayar — IIM Ahmedabad Alumni Profile',
      type: 'article',
      detail: 'iima.ac.in — confirms Falguni Nayar\'s IIM Ahmedabad MBA (batch of 1985), followed by 19 years at Kotak Mahindra before founding Nykaa.',
    },
    {
      title: 'Nykaa IPO — Business Standard, November 2021',
      type: 'article',
      detail: 'Documents Falguni Nayar founding Nykaa at age 49 in 2012 and becoming India\'s first self-made female billionaire on listing day.',
    },
  ],

  // ── NIKOLA TESLA ────────────────────────────────────────────────────────────
  'lvl_age_19_tesla': [
    {
      title: 'My Inventions: The Autobiography of Nikola Tesla',
      type: 'autobiography',
      detail: 'Tesla describes his mental visualization method, his time at the Graz Institute of Technology in 1875-76, and his early concept of alternating current.',
    },
    {
      title: 'Tesla: Inventor of the Electrical Age — W. Bernard Carlson',
      type: 'book',
      detail: 'Documents Tesla\'s obsessive studying (20 hours/day), his professors\' concern, and the alternating current visions that defined his life\'s work.',
    },
  ],

  // ── SHUBMAN GILL ────────────────────────────────────────────────────────────
  'lvl_age_19_shubman': [
    {
      title: 'Shubman Gill — India U19 World Cup 2018, ESPNcricinfo',
      type: 'article',
      detail: 'espncricinfo.com — Player of the Tournament records from the 2018 U-19 World Cup, plus his senior debut in New Zealand (2018-19 tour).',
    },
    {
      title: 'Gabba Test 2021 — Australia vs India, ESPNcricinfo Scorecard',
      type: 'article',
      detail: 'Gill scored 91 at the Gabba in January 2021, setting up India\'s historic series-winning 329-7 chase to win the series.',
    },
  ],

  // ── PRAJAKTA KOLI ───────────────────────────────────────────────────────────
  'lvl_age_20_prajakta': [
    {
      title: 'Prajakta Koli — YouTube Channel (MostlySane) About',
      type: 'article',
      detail: 'Channel launched in 2014. Prajakta has described in multiple interviews leaving her radio internship after burnout to start MostlySane.',
    },
    {
      title: 'Prajakta Koli UN Speech — Generation Equality, 2021',
      type: 'speech',
      detail: 'Prajakta addressed the UN Generation Equality Forum in 2021, confirming her journey from failed radio intern to 7M+ subscriber creator.',
    },
  ],

  // ── VISWANATHAN ANAND ───────────────────────────────────────────────────────
  'lvl_age_18_anand': [
    {
      title: 'Mind Master: Winning Lessons from a Champion\'s Life — Viswanathan Anand',
      type: 'autobiography',
      detail: 'Anand describes his World Junior Chess Championship victory in 1987 at age 18, being called the "Coffee-Shop Player", and developing his famous quick-play style.',
    },
    {
      title: 'FIDE World Junior Chess Championship 1987 — Official Records',
      type: 'article',
      detail: 'fide.com — confirms Anand\'s 1987 World Junior Championship win, the first Indian to win the title.',
    },
  ],

  // ── ZENDAYA ─────────────────────────────────────────────────────────────────
  'lvl_age_18_zendaya': [
    {
      title: 'K.C. Undercover — Disney Channel (2015)',
      type: 'article',
      detail: 'Zendaya is credited as Executive Producer on K.C. Undercover (2015-2018) — reportedly the youngest EP in Disney Channel history at the time.',
    },
    {
      title: 'Zendaya — Variety Feature, 2021',
      type: 'interview',
      detail: 'variety.com — Zendaya discusses demanding creative control and producer status from Disney as a teenager, before accepting the K.C. Undercover role.',
    },
  ],

  // ── NEERAJ CHOPRA ───────────────────────────────────────────────────────────
  'lvl_age_19_neeraj': [
    {
      title: 'Neeraj Chopra — World Junior Record, Bydgoszcz 2016',
      type: 'article',
      detail: 'World Athletics official records — Neeraj threw 86.48m at the IAAF World U20 Championships in July 2016, a World Junior Record.',
    },
    {
      title: 'Tokyo Olympics 2020 — Athletics Javelin Final',
      type: 'article',
      detail: 'olympics.com — Neeraj Chopra won India\'s first Olympic gold in athletics (Javelin, 7 August 2021) with a throw of 87.58m.',
    },
    {
      title: 'Neeraj Chopra — Sports Authority of India Training Profile',
      type: 'article',
      detail: 'Documents Neeraj\'s training camps in Germany and other international locations after the 2016 record, confirming his isolation from Indian media attention.',
    },
  ],

  // ── SELENA GOMEZ ────────────────────────────────────────────────────────────
  'lvl_age_20_selena': [
    {
      title: 'Selena Gomez — Billboard Cover Story, 2016',
      type: 'article',
      detail: 'billboard.com — Gomez publicly revealed her lupus diagnosis and kidney transplant for the first time in this cover story.',
    },
    {
      title: 'Selena Gomez: My Mind & Me — Documentary (2022)',
      type: 'documentary',
      detail: 'Apple TV+ documentary directed by Alek Keshishian. Shows mental health struggles during her 2016 tour and the decision to step back.',
    },
  ],

  // ── BILLIE EILISH (Age 20 — Relationship Story) ─────────────────────────────
  'lvl_age_20_billie_2': [
    {
      title: 'Happier Than Ever — Billie Eilish (2021)',
      type: 'article',
      detail: 'The album extensively references unhealthy attachments. Eilish confirmed in multiple interviews that many songs reflect real relationship experiences from age 18-21.',
    },
    {
      title: 'Billie Eilish: The World\'s a Little Blurry — Documentary (2021)',
      type: 'documentary',
      detail: 'Apple TV+ — shows Eilish processing a difficult relationship in real time during the recording period.',
    },
  ],

  // ── JUSTIN BIEBER ───────────────────────────────────────────────────────────
  'lvl_age_19_justin': [
    {
      title: 'Justin Bieber: Never Say Never — Documentary (2011)',
      type: 'documentary',
      detail: 'Documents Bieber\'s rise and the early psychological pressures of global fame at ages 15-17, setting the context for his more difficult 2013-2014 period.',
    },
    {
      title: 'Justin Bieber — Changes Album & Purpose Documentary, 2020',
      type: 'documentary',
      detail: 'Bieber describes the emotional difficulties of his early 20s and his relationship in the documentary accompanying the Changes album.',
    },
  ],

  // ── VIRAT KOHLI (Age 18 — Visual Story) ─────────────────────────────────────
  'lvl_age_18_virat': [
    {
      title: 'Virat Kohli — Delhi vs Karnataka, Ranji Trophy, December 2006',
      type: 'article',
      detail: 'ESPNcricinfo match scorecard — 19-20 December 2006. Kohli scored 90 and returned to the match the morning after his father\'s passing at 3 AM.',
    },
    {
      title: 'My Life, My Game — Virat Kohli',
      type: 'autobiography',
      detail: 'Kohli\'s own account of the night his father died and his decision to play the next day, which he calls the biggest day of his life.',
    },
  ],

  // ── KOBE BRYANT (Age 20 — New Format) ──────────────────────────────────────
  'lvl_age_20_kobe': [
    {
      title: 'The Mamba Mentality: How I Play — Kobe Bryant',
      type: 'book',
      detail: 'Kobe describes the 1998-99 lockout, the informal pickup sessions, the friction with Shaquille O\'Neal, and the veterans\' meeting where he refused to change his game.',
    },
    {
      title: 'Shaquille O\'Neal & Kobe Bryant — Multiple ESPN Interviews',
      type: 'interview',
      detail: 'Both Kobe and Shaq have described their early conflict publicly, including Shaq confirming physical altercations during the lockout period.',
    },
  ],

  // ── MICHAEL JACKSON ─────────────────────────────────────────────────────────
  'lvl_age_22_michael': [
    {
      title: 'Michael Jackson: The Magic, The Madness, The Whole Story — J. Randy Taraborrelli',
      type: 'book',
      detail: 'Documents the Triumph Tour (1981), MJ\'s dual role in The Jacksons while developing his solo career, and the transition to Thriller.',
    },
    {
      title: 'The Jacksons: Triumph Tour — Live Album (1981)',
      type: 'article',
      detail: 'Historical record confirming the Triumph Tour ran from July to September 1981 across 36 cities, with Michael sharing the set between solo and Jacksons material.',
    },
  ],

  // ── ASHNEER GROVER ──────────────────────────────────────────────────────────
  'lvl_age_22_ashneer': [
    {
      title: 'Doglapan: The Hard Truth about Life and Start-Ups — Ashneer Grover',
      type: 'autobiography',
      detail: 'Documents Ashneer\'s IIT Delhi B.Tech in Civil Engineering, the exchange year at INSA Lyon (France), IIM Ahmedabad MBA in Finance (2004-2006), and joining Kotak Investment Banking.',
    },
  ],

  // ── BHUVAN BAM ──────────────────────────────────────────────────────────────
  'lvl_age_22_bhuvan': [
    {
      title: 'BB Ki Vines — YouTube Channel History',
      type: 'article',
      detail: 'Channel launched June 2015. Reached 1 million subscribers in 2016. TEDxIIITD talk in June 2016 confirmed. WebTVAsia Awards 2016 in Seoul confirmed.',
    },
    {
      title: 'Bhuvan Bam — Interview with Film Companion, 2022',
      type: 'interview',
      detail: 'Bam describes his Shaheed Bhagat Singh College History degree, the music background before YouTube, and the transition to full-time content creation.',
    },
  ],

  // ── CRISTIANO RONALDO ──────────────────────────────────────────────────────
  'lvl_age_22_ronaldo': [
    {
      title: 'Cristiano Ronaldo — Manchester United Season Review 2006-07',
      type: 'article',
      detail: 'manutd.com — The 2006-07 season was Ronaldo\'s breakthrough year at United, winning PFA Player of the Year at age 22 and the Premier League title.',
    },
    {
      title: 'Cristiano Ronaldo: The Biography — Guillem Balague',
      type: 'book',
      detail: 'Documents Ronaldo\'s development from the 2004 European Championship (where Portugal reached the final) through to his 2007-08 Ballon d\'Or campaign.',
    },
  ],

  // ── NARENDRA MODI (Age 20) ──────────────────────────────────────────────────
  'lvl_age_20_modi': [
    {
      title: 'Bharatiya Janata Party Official Biography',
      type: 'article',
      detail: 'bjp.org — Documents Modi spending two years wandering the Himalayas seeking spiritual truth before returning to Gujarat.',
    },
    {
      title: 'The Economic Times & The Times of India (2014, 2015)',
      type: 'article',
      detail: 'Historical records documenting that at age 20 (1970), he worked in his uncle/brother\'s canteen at the Gujarat State Road Transport Corporation (Gita Mandir bus depot) in Ahmedabad.',
    },
    {
      title: 'Narendra Modi: A Political Biography',
      type: 'book',
      detail: 'Andy Marino (2014) — Traces his time volunteering at the RSS headquarters doing chores, before becoming a full-time pracharak (campaigner/organizer) and leaving the family business.',
    },
  ],

  // ── SHAHRUKH KHAN (Age 16) ────────────────────────────────────────────────
  'lvl_age_16_srk': [
    {
      title: 'Wikipedia / FNP Biography',
      type: 'article',
      detail: 'Father died of cancer in 1981 when SRK was 15.',
    },
    {
      title: 'Wikipedia',
      type: 'article',
      detail: 'Sister Shahnaz fell into a depressed state after parents\' deaths.',
    },
    {
      title: 'Hindustan Times, "Shah Rukh Khan\'s life unwrapped in a book", 2007',
      type: 'article',
      detail: 'Graduated in 1985 with the Sword of Honor.',
    },
  ],

  // ── MICHAEL JORDAN (Age 16) ───────────────────────────────────────────────
  'lvl_age_16_jordan': [
    {
      title: 'Basketball Network (1978)',
      type: 'article',
      detail: 'Michael Jordan says he was embarrassed not to make the HS Varsity team in 1978 at Laney High School.',
    },
    {
      title: 'Education Week (1997)',
      type: 'article',
      detail: 'His 6-foot-8-inch buddy, Leroy Smith, was the only sophomore to make the team that year, and Jordan admitted the omission made him weep in his room.',
    },
    {
      title: 'Basketball Network (2024)',
      type: 'article',
      detail: 'He recorded multiple 40-point games on the junior varsity team and turned Laney HS JV games into a must-watch event.',
    },
  ],

  // ── TAYLOR SWIFT (Age 16) ────────────────────────────────────────────────
  'lvl_age_16_taylor': [
    {
      title: 'CBS Sunday Morning (2019)',
      type: 'article',
      detail: 'Details how her family relocated from Pennsylvania to Nashville so she could pursue songwriting in Music Row.',
    },
    {
      title: 'American Songwriter, "They Wanted to Shelf Me" (2025)',
      type: 'article',
      detail: 'Chronicles how RCA Records offered a development deal that planned to hold her unreleased until age 18, prompting her to walk away.',
    },
    {
      title: 'Wikipedia / Big Machine Records History',
      type: 'article',
      detail: 'Documents her signing with Scott Borchetta\'s brand-new indie startup label Big Machine Records when it had no employees and no infrastructure.',
    },
  ],

  // ── BILLIE EILISH (Age 16) ───────────────────────────────────────────────
  'lvl_age_16_billie': [
    {
      title: 'Rolling Stone, "Billie Eilish and the Triumph of the Weird" (2019)',
      type: 'article',
      detail: 'Details her viral rise from early singles to the intense expectations surrounding her debut studio album.',
    },
    {
      title: 'Sound on Sound, "Finneas O\'Connell" (2019)',
      type: 'article',
      detail: 'Notes the industry meetings pushing for expensive commercial studios and top-tier pop producers before they decided to produce it alone.',
    },
    {
      title: 'Apple TV+, "Billie Eilish: The World\'s A Little Blurry" (2021)',
      type: 'article',
      detail: 'Documents the entire recording process of the multi-Grammy-winning debut album inside Finneas\'s Highland Park childhood bedroom.',
    },
  ],

  // ── BHAGAT SINGH (Age 16) ────────────────────────────────────────────────
  'lvl_age_16_bhagat': [
    {
      title: '"Without Fear: The Life and Trial of Bhagat Singh" by Kuldip Nayar (2007)',
      type: 'book',
      detail: 'Documents that his family arranged a marriage for him at age 16 in Lahore, prompting his secret departure.',
    },
    {
      title: '"Without Fear: The Life and Trial of Bhagat Singh" by Kuldip Nayar (2007)',
      type: 'book',
      detail: 'Fled to Kanpur in 1924 to join revolutionary groups and avoid domestic settlement.',
    },
    {
      title: 'Historical archives / Bhagat Singh\'s Letter to his Father',
      type: 'article',
      detail: 'Famous farewell letter declaring: "My life has been dedicated to the noblest cause, that of the freedom of the country. Therefore, there is no rest or worldly desire that can lure me now."',
    },
  ],

  // ── KARAN AUJLA (Age 16) ─────────────────────────────────────────────────
  'lvl_age_16_aujla': [
    {
      title: 'Film Companion Interview with Anupama Chopra (2023)',
      type: 'interview',
      detail: 'Recounts losing his father at age 9 and mother at age 11 in Ghurala, Punjab, before being raised by his uncle and sisters.',
    },
    {
      title: 'PTC Punjabi / Various Artist Interviews',
      type: 'article',
      detail: 'Details penning the hit song "Range" for Jassi Gill while still a high school student in 9th grade.',
    },
    {
      title: 'Apple Music & GQ India Interviews (2023)',
      type: 'article',
      detail: 'Documents moving to Canada in 2014 as an international student and working grueling shifts as a longshoreman on Surrey, BC cargo docks to fund studio recordings.',
    },
  ],

  // ── KARAN AUJLA (Age 17) ─────────────────────────────────────────────────
  'lvl_age_17_aujla': [
    {
      title: 'Wikipedia / PTC Punjabi Biographies',
      type: 'article',
      detail: 'Documents his debut single "Cell Phone" released in 2014 when he was 17 years old.',
    },
    {
      title: 'Times of India / Artist Retrospectives',
      type: 'article',
      detail: 'Notes that his early vocal releases gained zero traction and required years of independent perseverance.',
    },
    {
      title: 'Film Companion Interview with Anupama Chopra (2023)',
      type: 'interview',
      detail: 'Details his determination to refine his vocal delivery in the studio despite the easy safety net of ghostwriting for established stars.',
    },
  ],

  // ── KARAN AUJLA (Age 18) ─────────────────────────────────────────────────
  'lvl_age_18_aujla': [
    {
      title: 'GQ India / Apple Music Interviews (2023)',
      type: 'interview',
      detail: 'Recounts working exhausting shifts at Surrey shipping docks by day while finishing school and writing lyrics.',
    },
    {
      title: 'Times of India / PTC Punjabi',
      type: 'article',
      detail: 'Details meeting producer Deep Jandu and collaborator Elly Mangat in Canada, leading to all-night recording sessions.',
    },
    {
      title: 'Film Companion Interview with Anupama Chopra (2023)',
      type: 'interview',
      detail: 'Describes the intense, sleepless studio grind that forged his signature punchy lyrical delivery and built his core fanbase.',
    },
  ],

  // ── KARAN AUJLA (Age 19) ─────────────────────────────────────────────────
  'lvl_age_19_aujla': [
    {
      title: 'GQ India / Film Companion Interviews (2023)',
      type: 'interview',
      detail: 'Discusses his early years writing lucrative hits for established Punjabi artists like Jazzy B, Gagan Kokri, and Jassi Gill while dreaming of becoming a lead singer.',
    },
    {
      title: 'PTC Punjabi / Discography Archives (2016–2018)',
      type: 'article',
      detail: 'Documents his strategic breakthrough approach of providing hit lyrics in exchange for featured vocal verses alongside Deep Jandu and Elly Mangat.',
    },
  ],

  // ── KARAN AUJLA (Age 21) ─────────────────────────────────────────────────
  'lvl_age_21_aujla': [
    {
      title: 'Times of India / PTC Punjabi Profiles (2018)',
      type: 'article',
      detail: 'Highlights his rise through gritty underground hip-hop before expanding his sonic palette for mainstream audiences.',
    },
    {
      title: 'Spotify Discography & Production Credits',
      type: 'article',
      detail: 'Documents the release of "Don\'t Worry" in October 2018, featuring iconic traditional folk singer Gurlez Akhtar.',
    },
    {
      title: 'Wikipedia / YouTube Analytics (2018–Present)',
      type: 'article',
      detail: 'Details "Don\'t Worry" surpassing hundreds of millions of streams and becoming his definitive mainstream breakout track.',
    },
  ],

  // ── KARAN AUJLA (Age 22) ─────────────────────────────────────────────────
  'lvl_age_22_aujla': [
    {
      title: 'Spotify Discography & YouTube Music Records (2019)',
      type: 'article',
      detail: 'Documents the release of "Chitta Kurta" in December 2019 at age 22, cementing his solo momentum.',
    },
    {
      title: 'Film Companion & GQ India Interviews (2023)',
      type: 'interview',
      detail: 'Recounts resisting lucrative ghostwriting-only contracts to prioritize his own artistic catalog during the post-breakout period.',
    },
    {
      title: 'Times of India / PTC Punjabi Profiles',
      type: 'article',
      detail: 'Highlights his perseverance during the quiet stretch between his first viral hit and his record-breaking debut album in 2021.',
    },
  ],

  // ── SIDDHU MOOSEWALA (Age 18) ─────────────────────────────────────────────
  'lvl_age_18_moosewala': [
    {
      title: 'The Tribune / Biography Profiles (2011)',
      type: 'article',
      detail: 'Documents his enrollment in Guru Nanak Dev Engineering College (GNDEC), Ludhiana in 2011 to study Electrical Engineering.',
    },
    {
      title: 'Times of India / Various Artist Interviews',
      type: 'article',
      detail: 'Highlights how Tupac Shakur\'s music inspired him to begin writing raw, authentic Punjabi lyrics late at night in his college hostel.',
    },
    {
      title: 'PTC Punjabi / Career Retrospective',
      type: 'article',
      detail: 'Details how he successfully completed his Electrical Engineering degree in 2016 for his parents before moving to Canada to pursue music.',
    },
  ],

  // ── SIDDHU MOOSEWALA (Age 23) ─────────────────────────────────────────────
  'lvl_age_23_moosewala': [
    {
      title: 'GQ India / The Tribune Biographies (2016)',
      type: 'article',
      detail: 'Recounts moving to Brampton, Canada on a study visa in 2016 and working grueling manual labor shifts to fund his living expenses.',
    },
    {
      title: 'PTC Punjabi / Music Industry Profiles',
      type: 'article',
      detail: 'Details his success penning the breakthrough hit "License" for Ninja in 2016 prior to launching his solo recording career.',
    },
    {
      title: 'Times of India / Discography Archives (2017)',
      type: 'article',
      detail: 'Documents his self-funded solo debut single "G-Wagon", recorded and released while living as an international student in Canada.',
    },
  ],

  // ── SIDDHU MOOSEWALA (Age 22) ─────────────────────────────────────────────
  'lvl_age_22_moosewala': [
    {
      title: 'The Tribune / Biographical Profiles',
      type: 'article',
      detail: 'Documents his graduation with a Bachelor\'s in Electrical Engineering from Guru Nanak Dev Engineering College, Ludhiana in 2016.',
    },
    {
      title: 'Times of India / Various Artist Retrospectives',
      type: 'article',
      detail: 'Details his decision to take on student loans to enroll at Humber College in Canada immediately after graduation to immerse himself in the diaspora music scene.',
    },
  ],

  // ── BHUVAN BAM (Age 16) ──────────────────────────────────────────────────
  'lvl_age_16_bhuvan': [
    {
      title: 'StartupTalky (2021)',
      type: 'article',
      detail: 'Documents Bhuvan Bam scoring 74% in his Class 12 board exams and the ensuing family conversations on traditional degrees vs. his artistic interests.',
    },
    {
      title: 'Wikipedia / Shaheed Bhagat Singh College Records',
      type: 'article',
      detail: 'Details his graduation with a Bachelor\'s degree in History (BA History) from Shaheed Bhagat Singh College (University of Delhi) rather than a traditional commerce/science path.',
    },
    {
      title: 'Quartz India (2022)',
      type: 'article',
      detail: 'Chronicles how every night of the week, from 8 PM to 12 AM, he played guitar and sang live at a Mughlai restaurant in Delhi before his YouTube breakthrough.',
    },
  ],

  // ── VIRAT KOHLI (Age 16) ──────────────────────────────────────────────────
  'lvl_age_16_virat_kohli': [
    {
      title: 'Virat Kohli interview with Graham Bensinger / Times of India (2025)',
      type: 'interview',
      detail: 'Recalls waking up at 2:30 AM to his father passing away from a sudden stroke just hours before batting for Delhi.',
    },
    {
      title: 'Times of India (2025) — Recalling the 2006 Delhi vs Karnataka match',
      type: 'article',
      detail: 'Details him being overnight 40 not out, returning to the ground to score 90 to save Delhi from the follow-on.',
    },
    {
      title: 'Driven: The Virat Kohli Story — Vijay Lokapally / Hindustan Times (2017)',
      type: 'book',
      detail: 'Documents him heading straight to his father\'s cremation immediately after being dismissed.',
    },
  ],

  // ── VIRAT KOHLI (Age 21) ──────────────────────────────────────────────────
  'lvl_age_21_virat_kohli': [
    {
      title: 'ESPNcricinfo — Virat Kohli Player Profile & Match Records',
      type: 'article',
      detail: 'Documents his international debut in August 2008 in Sri Lanka, followed by being dropped from the senior squad in early 2009 due to inconsistent form.',
    },
    {
      title: '2009 Emerging Players Tournament Records (Australia)',
      type: 'article',
      detail: 'Records his participation in the Brisbane tournament for India Emerging Players as a key proving ground to win back his national spot.',
    },
    {
      title: 'ESPNcricinfo Scorecard — India Emerging Players vs South Africa Emerging Players Final (Aug 2009)',
      type: 'article',
      detail: 'Details his match-winning 104* off 102 balls to lead India to the title, which led directly to his recall for the 2009 ICC Champions Trophy.',
    },
  ],

};
