export const expandedStrategies = [
  {
    category: "opening", name: "Four Knights Game", family: "OPEN GAME", level: "Balanced development", moves: ["e2e4","e7e5","g1f3","b8c6","b1c3","g8f6","f1b5"],
    plan: "Develop both knights, castle quickly, and choose between a calm center or a timely d4 break.", watch: "Symmetry feels safe, but copying moves forever can let the first player strike first.",
    steps: [["Four pieces race out", "Both sides use simple development to build a sound position."],["Claim e4", "White opens lines and takes central space."],["Answer in kind", "Black contests the center with e5."],["Develop with tempo", "The knight attacks e5."],["Protect and develop", "Black's knight defends the pawn."],["Bring the second knight", "White controls d5 and e4."],["Complete the knight pair", "Black develops toward the center."],["Pin and prepare", "The bishop develops while increasing pressure on c6."]]
  },
  {
    category: "opening", name: "Scandinavian Defense", family: "BLACK DEFENSE", level: "Immediate challenge", moves: ["e2e4","d7d5","e4d5","d8d5","b1c3","d5d8"],
    plan: "Black challenges e4 immediately, then develops rapidly after the queen moves to safety.", watch: "The early queen can lose time when White develops pieces by attacking it.",
    steps: [["Challenge right away", "Black refuses to let White keep an easy pawn center."],["Take the center", "White begins with e4."],["Strike immediately", "Black attacks the e4 pawn."],["Accept the challenge", "White captures and opens the position."],["Recover the pawn", "The queen recaptures, but becomes a target."],["Develop with tempo", "White's knight attacks the queen."],["Step back safely", "Black preserves the queen and prepares normal development."]]
  },
  {
    category: "opening", name: "Pirc Defense", family: "HYPERMODERN", level: "Invite then strike", moves: ["e2e4","d7d6","d2d4","g8f6","b1c3","g7g6"],
    plan: "Let White occupy the center, develop safely, then attack that center with pieces and pawn breaks.", watch: "Black must challenge the center before White gains too much space.",
    steps: [["A flexible defense", "Black plans to pressure the center instead of occupying it immediately."],["White takes space", "The e-pawn claims key squares."],["Prepare development", "Black supports e5 and keeps options open."],["Build the pawn center", "White creates a strong duo."],["Attack e4", "The knight develops with pressure."],["Defend the center", "White adds another developing piece."],["Prepare the long bishop", "Black plans a kingside fianchetto."]]
  },
  {
    category: "opening", name: "Slav Defense", family: "QUEEN'S GAMBIT", level: "Solid and active", moves: ["d2d4","d7d5","c2c4","c7c6","g1f3","g8f6"],
    plan: "Support d5 with the c-pawn while keeping the light-squared bishop free to develop.", watch: "Solid does not mean passive—look for ...dxc4 or ...e5 at the right moment.",
    steps: [["A sturdy answer", "The Slav supports the center without locking in the c8 bishop."],["Take d4", "White claims central space."],["Match the center", "Black establishes d5."],["Apply pressure", "White challenges with the c-pawn."],["Build the Slav triangle", "Black supports d5 with c6."],["Develop smoothly", "White prepares to castle."],["Add another defender", "Black develops and reinforces d5."]]
  },
  {
    category: "opening", name: "English Opening", family: "FLANK OPENING", level: "Flexible pressure", moves: ["c2c4","e7e5","b1c3","g8f6","g2g3","d7d5","c4d5","f6d5"],
    plan: "Control d5 from the side, fianchetto the bishop, and choose the best central break later.", watch: "A flank opening still needs central control; do not ignore an opponent's pawn center.",
    steps: [["Control from the wing", "The c-pawn influences d5 without committing the center pawns."],["Start with c4", "White grabs queenside space."],["Claim central ground", "Black builds an e5 foothold."],["Increase d5 control", "The knight supports the English plan."],["Develop naturally", "Black attacks the center."],["Prepare the long diagonal", "White will place the bishop on g2."],["Break in the center", "Black challenges White's c4 pawn."],["Clarify the structure", "White exchanges on d5."],["Centralize the knight", "Black recaptures with an active piece."]]
  },
  {
    category: "opening", name: "King's Gambit", family: "OPEN GAME", level: "Brave attack", moves: ["e2e4","e7e5","f2f4","e5f4","g1f3"],
    plan: "Offer a pawn to open the f-file, gain development time, and attack the black king.", watch: "Moving the f-pawn weakens your own king, so develop quickly and calculate checks.",
    steps: [["A historic attacking try", "White trades material for time and open lines."],["Open the center", "White begins with e4."],["Meet the challenge", "Black takes equal central space."],["Offer the f-pawn", "White attacks e5 and invites a sharp game."],["Accept the gambit", "Black wins a pawn but gives White open lines."],["Develop before recovering", "The knight attacks e5 and helps White castle."]]
  },
  {
    category: "opening", name: "Nimzo-Indian Defense", family: "INDIAN DEFENSE", level: "Pin and control", moves: ["d2d4","g8f6","c2c4","e7e6","b1c3","f8b4"],
    plan: "Pin the c3 knight, control e4, and be ready to damage White's pawn structure.", watch: "Giving up the bishop pair should win something useful, such as structure or time.",
    steps: [["Control without occupying", "Black uses pieces to stop White from building the perfect center."],["White claims d4", "The queen pawn takes space."],["Develop flexibly", "Black's knight watches e4."],["Add queenside space", "White supports a broad center."],["Prepare the bishop", "Black opens the f8 bishop."],["Develop the knight", "White adds pressure to d5 and e4."],["The Nimzo pin", "The bishop ties the knight to the king."]]
  },
  {
    category: "opening", name: "Dutch Defense", family: "BLACK DEFENSE", level: "Kingside ambition", moves: ["d2d4","f7f5","g2g3","g8f6","f1g2","g7g6"],
    plan: "Fight for e4 and build a kingside attack while accepting a slightly looser king position.", watch: "The f-pawn move opens a diagonal toward Black's king and can create tactical weaknesses.",
    steps: [["An ambitious reply", "Black immediately fights for e4."],["White takes d4", "The queen pawn claims the center."],["The Dutch move", "Black uses the f-pawn to control e4."],["Prepare a fianchetto", "White plans long-diagonal pressure."],["Develop and defend", "Black brings out the knight."],["Activate the bishop", "White's bishop watches the center."],["Build a dark-square shell", "Black prepares to develop the bishop on g7."]]
  },
  {
    category: "middlegame", name: "Rook on the Seventh", family: "ROOK ACTIVITY", level: "Invade the back line", startFen: "6k1/7p/8/8/8/8/4R3/6K1 w - - 0 1", moves: ["e2e7","g8f8","e7h7"],
    plan: "Invade the seventh rank to attack pawns and restrict the enemy king.", watch: "Check that the rook has an escape route before it grabs pawns.",
    steps: [["The seventh-rank dream", "A rook can attack pawns sideways while trapping the king behind them."],["Invade", "Re7 enters with threats."],["The king steps away", "Black tries to defend the loose pawn."],["Collect the target", "Rxh7 wins the pawn from the side."]]
  },
  {
    category: "middlegame", name: "The Skewer", family: "TACTICAL PRESSURE", level: "Attack through the king", startFen: "6kq/8/8/8/8/8/8/R5K1 w - - 0 1", moves: ["a1a8","g8f7","a8h8"],
    plan: "Attack a valuable piece through the king; when the king moves, capture what was behind it.", watch: "A skewer works only if the attacking piece survives after taking the second target.",
    steps: [["King first, treasure second", "The king stands in front of the queen on the eighth rank."],["Check along the rank", "Ra8 forces the king to move."],["Leave the queen behind", "The king escapes but cannot carry the queen with it."],["Win the queen", "Rxh8 completes the skewer."]]
  },
  {
    category: "middlegame", name: "Discovered Attack", family: "TACTICAL PRESSURE", level: "Uncover a hidden line", startFen: "4k3/8/8/8/8/8/4B3/4R1K1 w - - 0 1", moves: ["e2b5","e8f8"],
    plan: "Move one piece away to reveal an attack from the piece behind it.", watch: "Choose a useful square for the moving piece so both parts of the discovery matter.",
    steps: [["A rook waits behind", "The bishop blocks the rook's view of the king."],["Move with purpose", "Bb5 uncovers the e-file and adds bishop pressure."],["The king must answer", "The discovered check gains a free tempo."]]
  },
  {
    category: "middlegame", name: "Double the Rooks", family: "ROOK ACTIVITY", level: "Build a battery", startFen: "6k1/8/8/8/8/8/8/R2R2K1 w - - 0 1", moves: ["d1d8","g8f7","a1d1"],
    plan: "Place both rooks on the same open file so they protect each other and multiply pressure.", watch: "Make sure the front rook has room; doubled rooks can become awkward if blocked.",
    steps: [["Two rooks, one road", "The d-file is clear and ready for a battery."],["Lead with tempo", "Rd8 checks the king."],["Force the king away", "Black leaves the back rank."],["Bring the partner", "Rad1 doubles the rooks on the open file."]]
  },
  {
    category: "middlegame", name: "Create a Passed Pawn", family: "PAWN STRATEGY", level: "Use a pawn break", startFen: "4k3/8/8/3p4/2P5/8/8/4K3 w - - 0 1", moves: ["c4d5","e8d7","d5d6"],
    plan: "Use a pawn capture or break to remove the pawn that blocks your runner.", watch: "Calculate whether the new passed pawn can be blockaded before exchanging.",
    steps: [["Break the barrier", "The black d-pawn is the only pawn stopping White's c-pawn from transforming."],["Capture toward freedom", "cxd5 removes the blocker and creates a passed pawn."],["Approach the runner", "The king moves closer."],["Advance with purpose", "d6 brings promotion another step closer."]]
  },
  {
    category: "middlegame", name: "Improve the Worst Piece", family: "PIECE ACTIVITY", level: "Upgrade the whole team", startFen: "6k1/8/8/8/8/8/N7/6K1 w - - 0 1", moves: ["a2c3","g8f7","c3d5"],
    plan: "Find the piece doing the least and route it toward a useful central square.", watch: "Do not force tactics when a quiet improving move makes every future plan stronger.",
    steps: [["The rim needs a rescue", "The knight on a2 controls very little."],["Head inward", "Nc3 opens several useful routes."],["The king centralizes", "Black also improves a piece."],["Reach the outpost", "Nd5 turns the sleepy knight into the star of the position."]]
  },
  {
    category: "middlegame", name: "Use the Bishop Pair", family: "PIECE ACTIVITY", level: "Open both diagonals", startFen: "4k3/8/8/8/8/2B2B2/8/4K3 w - - 0 1", moves: ["f3c6","e8f7","c3d4"],
    plan: "In open positions, aim the two bishops at opposite color complexes so escape squares disappear.", watch: "Bishops need open lines; avoid locking both behind your own pawns.",
    steps: [["Two colors covered", "The bishops can work together across the whole board."],["Check from afar", "Bc6+ uses the long diagonal."],["The king sidesteps", "Black searches for a safer square."],["Centralize the partner", "Bd4 controls a second family of squares."]]
  },
  {
    category: "middlegame", name: "Queen and Knight Team", family: "KING ATTACK", level: "Cover every escape", startFen: "6k1/5ppp/8/6NQ/8/8/8/6K1 w - - 0 1", moves: ["h5f7","g8h8"],
    plan: "Combine the queen's long range with the knight's unusual jumps near the king.", watch: "A queen attack without support can turn into lost material; keep the knight close.",
    steps: [["A dangerous duo", "The knight covers squares the queen cannot safely occupy alone."],["Enter with check", "Qxf7+ combines the queen's reach with nearby knight pressure."],["The king retreats", "Black is pushed toward the corner while White keeps the initiative."]]
  },
  {
    category: "middlegame", name: "Centralize the Queen", family: "COORDINATION", level: "Connect both wings", startFen: "6k1/8/8/8/8/8/3Q4/6K1 w - - 0 1", moves: ["d2d5","g8f8","d5a8"],
    plan: "A centralized queen can switch between both wings and create threats in several directions.", watch: "Central queens are powerful but can be chased; verify that enemy pieces cannot gain tempo.",
    steps: [["One square, many jobs", "The queen is ready to improve from a quiet square."],["Take the center", "Qd5 controls ranks, files, and diagonals."],["The king reacts", "Black tries to reduce the checking ideas."],["Switch wings", "Qa8 demonstrates how quickly a queen can change targets."]]
  },
  {
    category: "endgame", name: "Rook Checkmate", family: "BASIC CHECKMATE", level: "Build the final wall", startFen: "7k/8/6K1/8/8/8/8/R7 w - - 0 1", moves: ["a1a8"],
    plan: "Use your king to cover the escape rank, then let the rook deliver the final check.", watch: "A rook cannot mate alone; bring the king close enough to control escape squares.",
    steps: [["The king does the quiet work", "White's king controls h7 and g7."],["Close the last door", "Ra8 is checkmate because the black king has nowhere legal to go."]]
  },
  {
    category: "endgame", name: "Key Squares", family: "KING & PAWN", level: "Lead the pawn home", startFen: "8/4k3/8/3KP3/8/8/8/8 w - - 0 1", moves: ["d5c6","e7d8","e5e6"],
    plan: "Move the king onto a key square in front of the pawn so promotion can be forced.", watch: "Pushing the pawn too early can surrender opposition and turn a win into a draw.",
    steps: [["King before pawn", "The king should lead when the path is contested."],["Reach a key square", "Kc6 steps ahead and to the side of the pawn."],["Black gives ground", "The defending king is pushed backward."],["Advance safely", "e6 follows because the king already controls the route."]]
  },
  {
    category: "endgame", name: "Outside Passed Pawn", family: "PAWN ENDGAME", level: "Stretch the defender", startFen: "8/8/4k3/P6P/8/8/8/6K1 w - - 0 1", moves: ["a5a6","e6e7","h5h6"],
    plan: "Use a faraway passed pawn to pull the enemy king away from the other side of the board.", watch: "Choose the pawn that creates the greatest distance for the defending king.",
    steps: [["Two wings, one king", "Black cannot chase both pawns at once."],["Send the decoy", "a6 demands attention far from the h-pawn."],["The king chooses a route", "Black starts moving, but distance matters."],["Run on the other wing", "h6 creates a second promotion threat."]]
  },
  {
    category: "endgame", name: "Triangulation", family: "KING MANEUVER", level: "Lose a move on purpose", startFen: "8/8/4k3/8/4K3/8/8/8 w - - 0 1", moves: ["e4d4","e6d6","d4c4"],
    plan: "Use a three-square king route to return to a useful area with the opponent to move.", watch: "Triangulation changes the move order; first confirm that every square remains safe.",
    steps: [["Tempo is a resource", "Sometimes you want the same position with the other player to move."],["Start the triangle", "Kd4 begins a safe detour."],["Black must choose", "The opposing king also changes squares."],["Complete the route", "Kc4 keeps useful opposition options available."]]
  },
  {
    category: "endgame", name: "Rook Behind the Pawn", family: "ROOK ENDGAME", level: "Support from behind", startFen: "6k1/8/3P4/8/8/8/8/R5K1 w - - 0 1", moves: ["a1d1","g8f7","d6d7"],
    plan: "Place the rook behind your passed pawn so its support grows as the pawn advances.", watch: "Against an enemy passer, the same rule applies: get your rook behind it when possible.",
    steps: [["The rook belongs behind", "From behind, the rook supports every forward step."],["Line up the file", "Rd1 takes the ideal supporting position."],["The king approaches", "Black tries to blockade."],["Advance with backup", "d7 is protected from behind and threatens promotion."]]
  },
  {
    category: "endgame", name: "Protected Rook Pawn", family: "PAWN ENDGAME", level: "Avoid stalemate", startFen: "7k/p7/7P/6K1/8/8/8/1B6 w - - 0 1", moves: ["h6h7","h8g7","h7h8"],
    plan: "Protect the pawn's promotion square and make sure the defender still has a legal move before the final push.", watch: "A rook pawn near the corner can stalemate the king if you remove every waiting move too soon.",
    steps: [["The bishop guards the pawn", "The bishop protects h7 along its long diagonal."],["Push with support", "h7 is safe from the king."],["The king leaves the corner", "Black must make room on h8."],["Promote", "h8 creates a new queen and a winning advantage."]]
  },
  {
    category: "endgame", name: "Knight Stops Promotion", family: "MINOR-PIECE ENDGAME", level: "Find the stopping square", startFen: "7k/8/8/8/1N6/p7/8/7K b - - 0 1", moves: ["a3a2","b4c2","a2a1","c2a1"],
    plan: "Route the knight to a square that controls the promotion square, even when the pawn looks too far ahead.", watch: "Knights are slow over long distances, so calculate the exact route before the pawn advances.",
    steps: [["The pawn is almost home", "Black needs only two pushes to promote."],["Advance", "a2 creates an urgent threat."],["Find the forked route", "Nc2 controls a1 just in time."],["Promotion happens", "The pawn becomes a queen, but only briefly."],["Capture the new queen", "Nxa1 removes the promoted piece."]]
  },
  {
    category: "endgame", name: "Cut Off the King", family: "ROOK ENDGAME", level: "Build a fence", startFen: "7k/8/8/8/8/8/2R5/6K1 w - - 0 1", moves: ["c2c7","h8g8","c7c8"],
    plan: "Use the rook to prevent the king from crossing a rank or file, then improve your own king.", watch: "Keep enough distance that the enemy king cannot attack your rook with tempo.",
    steps: [["Rooks make fences", "A rook can deny an entire rank from far away."],["Build the barrier", "Rc7 confines the king to the back rank."],["The king searches", "Black has only limited squares."],["Check from a safe distance", "Rc8+ keeps the king boxed in."]]
  },
  {
    category: "endgame", name: "Shoulder the King", family: "KING MANEUVER", level: "Win the race", startFen: "8/2k5/8/4KP2/8/8/8/8 w - - 0 1", moves: ["e5d5","c7b6","f5f6"],
    plan: "Use your king to block the enemy king's shortest route while your pawn advances.", watch: "Do not shoulder so far that you abandon the pawn you are trying to promote.",
    steps: [["Kings can block paths", "The white king can make Black take the long way around."],["Step into the lane", "Kd5 claims important approach squares."],["Black is pushed aside", "The defending king loses time."],["Advance the passer", "f6 moves while the king keeps the route controlled."]]
  }
];
