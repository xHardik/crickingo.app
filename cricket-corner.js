const QUIZZES = [
  {
    q: "Virat Kohli scored how many runs in IPL 2016 — his record-breaking season?",
    opts: ["849", "919", "973", "1002"],
    ans: 2,
    exp: "Kohli scored 973 runs in IPL 2016 — the highest in a single IPL season, a record that still stands."
  },
  {
    q: "Who dismissed Sachin Tendulkar the most times in Test cricket?",
    opts: ["Shane Warne", "Glenn McGrath", "Muttiah Muralitharan", "Wasim Akram"],
    ans: 1,
    exp: "Glenn McGrath dismissed Sachin Tendulkar 8 times in Tests — more than any other bowler."
  },
  {
    q: "MS Dhoni made his ODI debut against which team — and what happened?",
    opts: ["Pakistan, scored 0", "Sri Lanka, run out for 0", "Bangladesh, run out for 0", "Zimbabwe, scored 0"],
    ans: 2,
    exp: "Dhoni made his ODI debut against Bangladesh in December 2004 and was run out for 0 without facing a ball."
  },
  {
    q: "What was unique about Anil Kumble taking all 10 wickets against Pakistan in 1999?",
    opts: ["It was his 100th Test", "He bowled with a fractured jaw", "He took all 10 in one session", "He bowled off-spin that day"],
    ans: 1,
    exp: "Kumble took all 10 wickets with a fractured jaw that was wired shut — one of cricket's most extraordinary feats."
  },
  {
    q: "Which player has been dismissed for 99 in Test cricket the most number of times?",
    opts: ["Mahela Jayawardene", "Sourav Ganguly", "Steve Waugh", "Michael Slater"],
    ans: 2,
    exp: "Steve Waugh was dismissed for 99 in Tests three times — more than any other batter in history."
  },
  {
    q: "Brendon McCullum's fastest Test century — how many balls did it take?",
    opts: ["56", "54", "57", "60"],
    ans: 1,
    exp: "McCullum scored a 54-ball century against Australia in 2016 — the fastest hundred in Test cricket history."
  },
  {
    q: "Which team holds the record for the lowest score in an IPL match?",
    opts: ["Pune Warriors (58)", "KKR (67)", "RCB (49)", "DC (66)"],
    ans: 2,
    exp: "RCB scored just 49 all out against KKR in 2017 — the lowest total in IPL history."
  },
  {
    q: "Rohit Sharma's 264 ODI world record — against which team and in which year?",
    opts: ["Sri Lanka, 2013", "Australia, 2013", "Sri Lanka, 2014", "West Indies, 2014"],
    ans: 2,
    exp: "Rohit scored 264 against Sri Lanka in Kolkata on 13 November 2014 — the highest individual score in ODI history."
  },
  {
    q: "Who was the first bowler to take a hat-trick in the very first over of a Test innings?",
    opts: ["Harbhajan Singh", "Irfan Pathan", "Mohammad Nissar", "Javagal Srinath"],
    ans: 1,
    exp: "Irfan Pathan took a hat-trick in the first over against Pakistan in Karachi 2006 — unique in Test history."
  },
  {
    q: "Kumar Sangakkara and Mahela Jayawardene's 624-run partnership — which wicket was it for?",
    opts: ["1st wicket", "2nd wicket", "3rd wicket", "4th wicket"],
    ans: 3,
    exp: "Their 624-run 4th-wicket partnership against South Africa in 2006 is the highest for any wicket in Test history."
  },
  {
    q: "Which player featured in all 16 IPL seasons from 2008 to 2023 without missing one?",
    opts: ["MS Dhoni", "Rohit Sharma", "Dinesh Karthik", "Suresh Raina"],
    ans: 2,
    exp: "Dinesh Karthik played in every single IPL season from 2008 to 2023 — the only player to achieve this."
  },
  {
    q: "The fastest ball in international cricket history was bowled by Shoaib Akhtar — at what speed?",
    opts: ["157.6 km/h", "160.1 km/h", "161.3 km/h", "163.0 km/h"],
    ans: 2,
    exp: "Shoaib Akhtar bowled 161.3 km/h against England in the 2003 World Cup — the fastest delivery ever recorded."
  },
  {
    q: "Don Bradman needed how many runs off his last innings to average exactly 100?",
    opts: ["2", "4", "6", "8"],
    ans: 1,
    exp: "Bradman needed just 4 runs but was bowled for 0 — finishing with the legendary 99.94 average instead."
  },
  {
    q: "Which IPL franchise was the first to have its contract terminated by the BCCI?",
    opts: ["Kochi Tuskers Kerala", "Deccan Chargers", "Pune Warriors India", "Rising Pune Supergiant"],
    ans: 0,
    exp: "Kochi Tuskers Kerala's contract was terminated in 2011 after just one season due to a payment dispute."
  },
  {
    q: "Muttiah Muralitharan's 800th Test wicket — what was extraordinary about the timing?",
    opts: ["It was the first ball of his last Test", "It was the last ball of his last Test", "He took it on his birthday", "It was against his former team"],
    ans: 1,
    exp: "Muralitharan took his 800th wicket on the very last ball of his final Test against India in 2010."
  },
  {
    q: "Adam Gilchrist admitted to wearing something unusual in his glove during the 2007 WC final — what was it?",
    opts: ["A sponge", "A squash ball", "Cotton wool", "A rubber band"],
    ans: 1,
    exp: "Gilchrist wore a squash ball in his glove to change his grip trigger movement — and scored 149 off 104 balls."
  },
  {
    q: "Shane Warne's Ball of the Century to Mike Gatting in 1993 — what number ball was it in Warne's Ashes career?",
    opts: ["1st ball", "2nd ball", "5th ball", "10th ball"],
    ans: 1,
    exp: "Warne's ball of the century to Gatting was literally the 2nd ball he ever bowled in an Ashes Test — he'd bowled one wide first."
  },
  {
    q: "Which country did Brian Lara score his world record 501* against in first-class cricket?",
    opts: ["Hampshire", "Durham", "Glamorgan", "Northamptonshire"],
    ans: 0,
    exp: "Lara scored 501* for Warwickshire against Durham in 1994 — still the highest individual first-class innings ever."
  },
  {
    q: "Virat Kohli went how many innings without an international century before ending his drought in 2023?",
    opts: ["53 innings", "64 innings", "76 innings", "88 innings"],
    ans: 2,
    exp: "Kohli went 76 international innings spanning 3 years without a century before finally scoring one vs Sri Lanka in Jan 2023."
  },
  {
    q: "Jacques Kallis finished his Test career with how many wickets alongside his 13,289 runs?",
    opts: ["218", "254", "292", "316"],
    ans: 2,
    exp: "Kallis took 292 Test wickets — combined with his runs, no other player comes close to his dual contribution in Tests."
  },
];

const FACTS = [
  "Don Bradman needed just 4 runs in his final Test innings to retire with a 100 average — but was bowled second ball for 0, finishing at 99.94.",
  "The IPL's entire 2009 season was held in South Africa due to India's general elections — the only time the tournament was played outside India.",
  "Muttiah Muralitharan's 800th Test wicket came on the very last ball of his farewell Test against India in Galle, 2010.",
  "Shane Warne's Ball of the Century to Mike Gatting in 1993 was only the 2nd ball Warne had ever bowled in an Ashes Test — he'd sent down one wide before it.",
  "Brian Lara scored 501* in a first-class match and 400* in Tests — both world records — having originally taken the Test record from himself after it was broken.",
  "Adam Gilchrist admitted years after the 2007 World Cup final that he had a squash ball in his batting glove — it changed his trigger movement and he scored 149 off 104 balls.",
  "Anil Kumble bowled his famous 10-wicket innings against Pakistan in Delhi 1999 with his jaw fractured and wired shut.",
  "The Duckworth-Lewis-Stern method was invented by two British statisticians who reportedly scribbled the first version of the formula on a napkin while watching a rain-affected ODI.",
  "The Lord's Cricket Ground drops 8 feet from one boundary to the other — bowlers must adjust their run-ups depending on which end they operate from.",
  "Rohit Sharma has scored three ODI double centuries — a feat no other batter in the history of the game has achieved even once.",
  "Virat Kohli went 76 international innings across three years without a century before ending the drought against Sri Lanka in January 2023.",
  "The IPL stumps contain hollow LED systems that trigger within 1/1000th of a second of being struck — faster than any human eye can perceive.",
  "Jasprit Bumrah had no formal coaching until age 16 and taught himself to bowl largely by watching YouTube videos and practising alone.",
  "The first day-night Test match was played in 2015 between Australia and New Zealand — the pink ball was developed specifically because red balls were invisible under stadium lights.",
  "Chris Gayle has hit more sixes in T20 cricket than the entire all-time T20 six tallies of many Test-playing nations.",
  "MS Dhoni was run out for 0 without facing a single delivery on his ODI debut against Bangladesh in December 2004.",
  "Kumar Sangakkara and Mahela Jayawardene's 624-run 4th-wicket partnership against South Africa in 2006 is the highest partnership for any wicket in all of Test cricket.",
  "Geoff Allott of New Zealand batted for 77 minutes against South Africa in 1999 without scoring a single run — the longest duck in Test cricket history.",
  "Kieron Pollard hit six sixes in one over in a T20I against Sri Lanka in 2021, joining a list of only four players to achieve the feat in international cricket.",
  "Brendon McCullum scored 158* in the very first IPL match in 2008 — setting the tone for the entire tournament's entertainment brand in a single innings.",
  "Jacques Kallis is the only cricketer in history to score over 10,000 Test runs and take over 250 Test wickets — by a significant margin over every other player.",
  "Irfan Pathan took a hat-trick against Pakistan in 2006 in the first over of the day — the only hat-trick in Test history to come in the very first over of an innings.",
];

const GLOSSARY = [
  {
    t: "Doosra",
    d: "An off-spin delivery that turns from leg to off for a right-hander — the opposite of a conventional off-break. Bowled with the same grip and action to completely deceive the batter.",
    ex: "Saqlain Mushtaq invented the doosra; Muralitharan's version became arguably the most unplayable delivery in cricket history."
  },
  {
    t: "Carrom ball",
    d: "A delivery flicked out between the thumb and a bent middle finger — similar to flicking a carrom board piece. Can turn either way based on subtle changes in finger angle at release.",
    ex: "Ravichandran Ashwin uses the carrom ball to dismiss right-handers through the off side after setting them up with conventional off-spin."
  },
  {
    t: "Reverse swing",
    d: "When an old, roughed-up ball swings in the opposite direction to conventional swing. The rough side must face the direction of travel — counter-intuitive and lethal in the right hands.",
    ex: "Wasim Akram and Waqar Younis mastered reverse swing with balls over 40 overs old, cleaning up tail-enders with devastating late movement."
  },
  {
    t: "Chinaman",
    d: "Left-arm wrist spin that turns from off to leg for a right-hander — the mirror image of leg spin. Extremely rare in professional cricket because it is so difficult to control.",
    ex: "Kuldeep Yadav is one of the only chinaman bowlers playing international cricket today at the highest level."
  },
  {
    t: "Corridor of uncertainty",
    d: "The area just outside off stump where a batsman cannot comfortably decide whether to play or leave — too close to ignore but too wide to drive safely without risk.",
    ex: "Glenn McGrath's entire career was built on landing the ball relentlessly in this corridor, creating doubt and forcing errors."
  },
  {
    t: "Mankad",
    d: "When a bowler runs out the non-striking batsman who has backed up too far before the ball is delivered. Completely legal under the Laws of Cricket, now officially termed 'run out (non-striker)'.",
    ex: "Named after Vinoo Mankad who ran out Bill Brown in 1947 — the dismissal remains controversial despite being entirely within the rules."
  },
  {
    t: "Zooter",
    d: "A Shane Warne invention — a leg-spin delivery that slides straight on rather than turning, bowled with a strong wrist roll that makes it look identical to a big-turning leg-break.",
    ex: "Warne reportedly bowled the zooter only a handful of times, but the mere threat of it planted doubt in every batter who faced him."
  },
  {
    t: "Death bowling",
    d: "The specialised art of bowling in the final 4–5 overs of a limited-overs innings when batsmen swing freely. Requires perfect yorkers, disguised slower balls, and nerves of steel.",
    ex: "Bumrah's combination of undetectable slower balls and pinpoint yorkers makes him the benchmark for death bowling worldwide."
  },
  {
    t: "Nurdle",
    d: "A soft, deliberate deflection of the ball — particularly behind square on the leg side — to rotate the strike without playing a full attacking shot. A skill of placement over power.",
    ex: "MS Dhoni's ability to nurdle the ball into gaps for ones and twos was a key reason CSK so consistently defend totals from the 18th over onwards."
  },
  {
    t: "Obstructing the field",
    d: "One of the 10 ways to be dismissed in cricket — when a batsman deliberately prevents a fielder from catching or effecting a run-out. Extremely rare at any level.",
    ex: "Len Hutton became the most famous batter dismissed this way in Test cricket in 1951 — a moment still debated by historians."
  },
  {
    t: "Googly",
    d: "A leg-spin delivery that turns from off to leg for a right-hander — the opposite of a conventional leg-break. Bowled with the back of the hand facing the batter at release.",
    ex: "Warne's googly to Andrew Strauss at Edgbaston 2005 was considered by many the ball of that entire Ashes series."
  },
  {
    t: "Powerplay",
    d: "Mandatory fielding restriction overs in limited-overs cricket. In T20Is, the first 6 overs allow only 2 fielders outside the 30-yard circle — creating scoring windows for openers.",
    ex: "Teams that score 60+ in a T20 powerplay statistically win over 70% of such matches, making powerplay dominance a primary strategic target."
  },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function renderCricketCorner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const quiz  = pickRandom(QUIZZES);
  const fact  = pickRandom(FACTS);
  const gloss = pickRandom(GLOSSARY);

  let answered = false;
  const id = 'cc_' + Math.random().toString(36).slice(2, 7);

  container.innerHTML = `
    <style>
      #${id} { font-family: inherit; }
      #${id} .cc-card {
        background: rgba(79,142,247,0.05);
        border: 1px solid rgba(79,142,247,0.18);
        border-radius: 18px; overflow: hidden; position: relative;
      }
      #${id} .cc-card::before {
        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
        background: linear-gradient(180deg, #4F8EF7, #A855F7);
      }
      #${id} .cc-tabs {
        display: flex; border-bottom: 1px solid rgba(255,255,255,0.07);
      }
      #${id} .cc-tab {
        flex: 1; padding: 11px 8px; font-size: 0.7rem; font-weight: 800;
        text-align: center; cursor: pointer; color: rgba(240,240,240,0.35);
        border: none; background: transparent; border-bottom: 2px solid transparent;
        text-transform: uppercase; letter-spacing: 1.5px; transition: all 0.18s; font-family: inherit;
      }
      #${id} .cc-tab.active { color: #4F8EF7; border-bottom-color: #4F8EF7; background: rgba(79,142,247,0.05); }
      #${id} .cc-body { padding: 20px 22px; min-height: 170px; }
      #${id} .panel { display: none; }
      #${id} .panel.active { display: block; }

      #${id} .quiz-q { font-size: 0.88rem; font-weight: 600; line-height: 1.6; color: #F0F0F0; margin-bottom: 14px; }
      #${id} .quiz-opts { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
      #${id} .quiz-opt {
        padding: 9px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04); font-size: 0.8rem; cursor: pointer;
        color: rgba(240,240,240,0.75); text-align: left; transition: all 0.15s; font-family: inherit;
      }
      #${id} .quiz-opt:hover:not([disabled]) { border-color: rgba(79,142,247,0.4); background: rgba(79,142,247,0.08); color: #F0F0F0; }
      #${id} .quiz-opt.correct { background: rgba(61,214,140,0.12); border-color: rgba(61,214,140,0.45); color: #3DD68C; }
      #${id} .quiz-opt.wrong   { background: rgba(232,64,64,0.1);   border-color: rgba(232,64,64,0.4);   color: #E84040; }
      #${id} .quiz-exp { font-size: 0.77rem; color: rgba(240,240,240,0.5); line-height: 1.6; min-height: 16px; }

      #${id} .fact-label {
        font-size: 0.63rem; font-weight: 800; letter-spacing: 2px;
        text-transform: uppercase; color: rgba(240,240,240,0.3); margin-bottom: 10px;
      }
      #${id} .fact-text { font-size: 0.86rem; color: rgba(240,240,240,0.72); line-height: 1.72; }

      #${id} .gloss-term {
        font-family: 'Bebas Neue', sans-serif; font-size: 1.55rem;
        letter-spacing: 2px; color: #F0F0F0; margin-bottom: 8px; line-height: 1;
      }
      #${id} .gloss-def { font-size: 0.84rem; color: rgba(240,240,240,0.62); line-height: 1.72; margin-bottom: 12px; }
      #${id} .gloss-ex {
        font-size: 0.77rem; color: rgba(240,240,240,0.35); font-style: italic;
        border-left: 2px solid rgba(79,142,247,0.28); padding-left: 12px; line-height: 1.6;
      }
    </style>

    <div id="${id}">
      <div class="cc-card">
        <div class="cc-tabs">
          <button class="cc-tab active" data-tab="quiz">Quiz</button>
          <button class="cc-tab" data-tab="fact">Did You Know</button>
          <button class="cc-tab" data-tab="gloss">Glossary</button>
        </div>
        <div class="cc-body">

          <div id="${id}-quiz" class="panel active">
            <div class="quiz-q" id="${id}-qtext"></div>
            <div class="quiz-opts" id="${id}-qopts"></div>
            <div class="quiz-exp" id="${id}-qexp"></div>
          </div>

          <div id="${id}-fact" class="panel">
            <div class="fact-label">Cricket Fact</div>
            <div class="fact-text" id="${id}-facttext"></div>
          </div>

          <div id="${id}-gloss" class="panel">
            <div class="gloss-term" id="${id}-gterm"></div>
            <div class="gloss-def"  id="${id}-gdef"></div>
            <div class="gloss-ex"   id="${id}-gex"></div>
          </div>

        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.cc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.cc-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#${id}-${tab.dataset.tab}`).classList.add('active');
    });
  });

  document.getElementById(`${id}-qtext`).textContent = quiz.q;
  const optsEl = document.getElementById(`${id}-qopts`);
  quiz.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'quiz-opt';
    b.textContent = o;
    b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      optsEl.querySelectorAll('.quiz-opt').forEach((btn, bi) => {
        btn.disabled = true;
        if (bi === quiz.ans) btn.classList.add('correct');
        else if (bi === i)   btn.classList.add('wrong');
      });
      document.getElementById(`${id}-qexp`).textContent = (i === quiz.ans ? '✓ ' : '✗ ') + quiz.exp;
    });
    optsEl.appendChild(b);
  });

  document.getElementById(`${id}-facttext`).textContent = fact;

  document.getElementById(`${id}-gterm`).textContent = gloss.t;
  document.getElementById(`${id}-gdef`).textContent  = gloss.d;
  document.getElementById(`${id}-gex`).textContent   = '"' + gloss.ex + '"';
}