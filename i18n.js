(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const STORAGE_KEY = "on-your-code-language";
  const JA = {
    "Skip to adventures": "冒険を選ぶへ移動",
    "ADVENTURE MENU": "アドベンチャーメニュー",
    "LEARN · PLAY · CREATE": "学ぶ・遊ぶ・創る",
    "Where will your code take you?": "コードで、どこまで行ける？",
    "Where will your": "コードで、",
    "take you?": "どこまで行ける？",
    "Start with a single command. End by turning your own ideas into interactive art. Choose any adventure below.": "ひとつのコマンドから始めて、自分のアイデアを動くアートに変えてみよう。下から好きな冒険を選んでください。",
    "4 PLAYABLE PROJECTS": "遊べる4つのプロジェクト",
    "Choose your adventure": "冒険を選ぼう",
    "Play in order or jump to the project that sparks your curiosity.": "順番に遊んでも、気になるプロジェクトから始めても大丈夫です。",
    "START HERE": "ここからスタート",
    "3 CHALLENGES": "3つのチャレンジ",
    "10 MISSIONS": "10のミッション",
    "2 CREATIVE SCENES": "2つの創作シーン",
    "SCENE 1 · COMMANDS": "シーン1・コマンド",
    "First Steps": "はじめの一歩",
    "Build your first program and guide Maro across the board.": "初めてのプログラムを作り、マロをボードの向こうへ案内しよう。",
    "PLAY SCENE 1": "シーン1を遊ぶ",
    "SCENE 2 · DEBUG": "シーン2・デバッグ",
    "Think Ahead": "先を考えよう",
    "Predict, repair, and discover how repeat makes code powerful.": "予測と修正をしながら、繰り返しでコードが強くなる仕組みを学ぼう。",
    "PLAY SCENE 2": "シーン2を遊ぶ",
    "SMART LAB · PROBLEM SOLVING": "スマートラボ・問題解決",
    "Challenge Lab": "チャレンジラボ",
    "Level up with algorithms, variables, functions, and logic.": "アルゴリズム、変数、関数、論理を使ってレベルアップしよう。",
    "ENTER THE LAB": "ラボに入る",
    "CREATIVE CODING · ALGORITHM ART": "クリエイティブコーディング・アルゴリズムアート",
    "Maro's Workshop": "マロのワークショップ",
    "Turn motion, patterns, and your own marks into living art.": "動き、模様、自分で描いた線を、生き生きとしたアートに変えよう。",
    "OPEN THE WORKSHOP": "ワークショップを開く",
    "ON YOUR MARK": "準備しよう",
    "Small commands. Big ideas.": "小さなコマンドから、大きなアイデアへ。",

    "PLAYGROUND 01": "プレイグラウンド 01",
    "Build a program for Maro.": "マロのためにプログラムを作ろう。",
    "1 · BUILD": "1・組み立てる",
    "Your commands": "あなたのコマンド",
    "Clear commands": "コマンドを消す",
    "Tap a command to begin.": "コマンドを押して始めよう。",
    "Maro moves forward in the direction he is facing.": "マロは向いている方向へ前進します。",
    "Move forward": "前に進む",
    "1 tile": "1マス",
    "Turn left": "左を向く",
    "Turn right": "右を向く",
    "turn only": "向きだけ変える",
    "2 · TRY IT": "2・試してみる",
    "▶ Run all commands": "▶ すべて実行",
    "Next step": "次のステップ",
    "Reset Maro": "マロをリセット",
    "keeps commands": "コマンドは残ります",
    "Undo": "元に戻す",
    "Reset Maro returns him to the start. Clear commands removes the program.": "「マロをリセット」はスタート地点へ戻します。「コマンドを消す」はプログラムを削除します。",
    "returns him to the start.": "はスタート地点へ戻します。",
    "removes the program.": "はプログラムを削除します。",
    "Boop! The edge blocked MOVE.": "おっと！ボードの端で MOVE が止まりました。",
    "Add a command first.": "最初にコマンドを追加してください。",
    "Program finished. Reset Maro to play it again.": "プログラムは終了しました。もう一度動かすにはマロをリセットしてください。",
    "Program finished. Reset Maro to run it again.": "プログラムは終了しました。もう一度実行するにはマロをリセットしてください。",
    "Running your program…": "プログラムを実行中…",
    "Program complete!": "プログラム完了！",
    "Maro returned to the start. Commands kept.": "マロはスタート地点に戻りました。コマンドは残っています。",
    "Last action undone.": "最後の操作を元に戻しました。",
    "Commands cleared. Maro stayed in place.": "コマンドを消しました。マロの位置はそのままです。",

    "DAY 2": "2日目",
    "Lantern": "ランタン",
    "Debug": "デバッグ",
    "Repeat": "繰り返し",
    "Reach the lantern": "ランタンまで進もう",
    "Use four commands and follow the glowing path.": "4つのコマンドで光る道を進もう。",
    "Sequence": "順序",
    "Build a four-command program.": "4つのコマンドでプログラムを作ろう。",
    "BUILD": "組み立てる",
    "Maro’s program": "マロのプログラム",
    "Clear": "消す",
    "New tool: Repeat": "新しい道具：繰り返し",
    "Put two commands inside and Maro will do them four times.": "中に2つのコマンドを入れると、マロが4回繰り返します。",
    "forward 1 tile": "1マス前へ",
    "Try: Move, Move, Turn right, Move.": "ヒント：Move、Move、Turn right、Move の順で試そう。",
    "▶ Run program": "▶ プログラムを実行",
    "Undo command": "コマンドを元に戻す",
    "WHAT YOU FOUND": "わかったこと",
    "A program follows a sequence.": "プログラムは順番どおりに動きます。",
    "The computer followed your commands in order, one at a time.": "コンピューターはコマンドを上から順に、ひとつずつ実行しました。",
    "Next challenge →": "次のチャレンジ →",
    "Repair the mistake": "まちがいを直そう",
    "Predict the result, run it, then repair the one wrong command.": "結果を予測して実行し、まちがったコマンドを1つ直そう。",
    "Debugging": "デバッグ",
    "Tap your predicted stopping tile first.": "最初に、止まると思うマスを押してください。",
    "The program is locked until you predict and run it.": "予測して実行するまで、プログラムは変更できません。",
    "Debugging starts with prediction.": "デバッグは予測から始まります。",
    "Comparing what you expected with what happened helped you find the wrong turn.": "予想と実際の動きを比べることで、まちがった向きを見つけられました。",
    "Too many commands": "コマンドが多すぎる",
    "Trace the little square and return Maro to the starting tile.": "小さな四角形をたどり、マロをスタート地点へ戻そう。",
    "Repetition": "繰り返し",
    "The square needs 8 commands, but you have only 6 slots.": "四角形には8個のコマンドが必要ですが、スロットは6個しかありません。",
    "Try building the route with the commands you already know.": "知っているコマンドで道順を作ってみよう。",
    "Repeats make patterns shorter.": "繰り返しを使うとパターンを短く書けます。",
    "Repeat 4× turned eight actions into one reusable instruction block.": "Repeat 4× によって、8つの動作を再利用できる1つの命令ブロックにまとめられました。",
    "6 slots · route needs 8": "6スロット・必要な動作は8つ",
    "Before running, tap the tile where you think Maro will stop.": "実行する前に、マロが止まると思うマスを押してください。",
    "add command": "コマンドを追加",
    "inside repeat": "繰り返しの中",
    "slots": "スロット",
    "Tap the wrong command above to select it.": "上にあるまちがったコマンドを押して選んでください。",
    "Challenge complete!": "チャレンジ完了！",
    "Your prediction is revealed. Tap the wrong command to select it.": "予測結果を確認しました。まちがったコマンドを押して選んでください。",
    "Eight actions will not fit. You unlocked Repeat 4×!": "8つの動作は入りません。Repeat 4× が使えるようになりました！",
    "Not there yet. Reset Maro, adjust the program, and try again.": "まだ到着していません。マロをリセットし、プログラムを直して再挑戦しよう。",
    "Maro reset so you can test the program again.": "もう一度テストできるように、マロをリセットしました。",
    "Commands cleared. Maro stayed in place.": "コマンドを消しました。マロの位置はそのままです。",
    "Last command change undone.": "最後のコマンド変更を元に戻しました。",
    "Repeat block added. Put two commands inside it.": "Repeat ブロックを追加しました。中に2つのコマンドを入れてください。",
    "Day 2 complete!": "2日目クリア！",

    "DAY 2+": "2日目+",
    "Guided": "ガイド付き",
    "Sequence · Debug · Repeat": "順序・デバッグ・繰り返し",
    "NEXT SCENE": "次のシーン",
    "Smart Lab": "スマートラボ",
    "10 problem-solving missions": "10の問題解決ミッション",
    "Order matters": "順番が大切",
    "Choose your first instruction.": "最初の命令を選んでください。",
    "THINK → TEST → CHANGE": "考える → 試す → 変える",
    "Your algorithm": "あなたのアルゴリズム",
    "Predict the result": "結果を予測する",
    "Repair the algorithm": "アルゴリズムを修正する",
    "Reset": "リセット",
    "▶ Test algorithm": "▶ アルゴリズムをテスト",
    "? Hint": "？ ヒント",
    "NEW IDEA UNLOCKED": "新しい考え方を獲得",
    "No typing. No syntax traps. Solve by predicting, testing, and revising.": "文字入力も構文の落とし穴もありません。予測し、試し、直しながら解決しよう。",
    "Build the exact route. The same commands in a different order can end somewhere else.": "正しい道順を作ろう。同じコマンドでも順番が違うと、別の場所に着くことがあります。",
    "An algorithm is an ordered set of steps. Order changes behaviour.": "アルゴリズムは順序のある手順の集まりです。順番によって動きが変わります。",
    "Think before Run": "実行する前に考えよう",
    "Tracing state": "状態を追跡する",
    "Do not run yet. Read the program and tap the tile where Maro will finish.": "まだ実行せず、プログラムを読んでマロが最後に止まるマスを押そう。",
    "Tracing means following state changes in your head before execution. Prediction makes debugging easier.": "追跡とは、実行前に状態の変化を頭の中でたどることです。予測するとデバッグしやすくなります。",
    "One bad instruction": "まちがった命令は1つ",
    "One command is wrong. Select it, replace it, then test the repaired program.": "1つのコマンドがまちがっています。選んで置き換え、修正したプログラムを試そう。",
    "Debugging is not guessing randomly: compare intended behaviour with actual behaviour, then change the smallest cause.": "デバッグは当てずっぽうではありません。意図した動きと実際の動きを比べ、原因となる最小の部分を直します。",
    "Say it smaller": "もっと短く表そう",
    "Loop / repetition": "ループ・繰り返し",
    "Make a square without writing all eight actions. Choose the two-step pattern and the repeat count.": "8つの動作を全部書かずに四角形を作ろう。2ステップのパターンと繰り返す回数を選んでください。",
    "A loop expresses a repeated pattern once, then reuses it. Good algorithms remove needless repetition.": "ループは繰り返すパターンを一度だけ書き、再利用します。良いアルゴリズムは不要な重複を減らします。",
    "One command, different distance": "同じコマンドで距離を変える",
    "Parameters": "引数",
    "Set the two MOVE values so Maro reaches the beacon using only three blocks.": "3つのブロックだけでビーコンに着くように、2つの MOVE の値を設定しよう。",
    "A parameter changes what a command does without inventing a new command. MOVE 1 and MOVE 4 share the same idea with different values.": "引数を使うと、新しいコマンドを作らずに動作を変えられます。MOVE 1 と MOVE 4 は同じ考え方で、値だけが違います。",
    "Make the program react": "状況に反応させよう",
    "Conditionals": "条件分岐",
    "Maro does not know exactly where the wall is. Choose a rule that reacts to what is ahead.": "マロは壁の正確な場所を知りません。前の状況に反応するルールを選ぼう。",
    "A conditional chooses an action from the current situation. This makes programs respond instead of only replaying fixed steps.": "条件分岐は現在の状況から動作を選びます。決まった手順を再生するだけでなく、状況に応じて反応できます。",
    "Remember a value": "値を覚えよう",
    "Variables": "変数",
    "The distance changes between tests. Choose the program that still works without rewriting its number.": "テストごとに距離が変わります。数値を書き直さなくても動くプログラムを選ぼう。",
    "A variable gives a name to a value. When the value changes, instructions using the name can adapt automatically.": "変数は値に名前をつけます。値が変わると、その名前を使う命令も自動的に対応できます。",
    "Teach Maro a shortcut": "マロに近道を教えよう",
    "Functions / procedures": "関数・手続き",
    "A corner manoeuvre appears twice. Build it once as CORNER(), then reuse the new command.": "角を曲がる動きが2回登場します。CORNER() として一度作り、新しいコマンドを再利用しよう。",
    "A function packages a useful mini-algorithm behind a name. Reuse makes larger programs easier to understand and change.": "関数は便利な小さなアルゴリズムに名前をつけてまとめます。再利用すると、大きなプログラムも理解・変更しやすくなります。",
    "Same result, less work": "同じ結果を、少ない手間で",
    "Efficiency": "効率",
    "All three programs claim to solve the same task. Test them and choose the clearest valid program with the fewest written blocks.": "3つのプログラムをテストし、正しく動く中から、書くブロックが最も少なく分かりやすいものを選ぼう。",
    "Algorithms can be compared, not only marked correct or wrong. Simpler or more efficient solutions can be easier to maintain and reason about.": "アルゴリズムは正解・不正解だけでなく比較できます。より単純で効率的な解決方法は、理解や修正もしやすくなります。",
    "One program, three mazes": "1つのプログラムで3つの迷路",
    "Generalization": "一般化",
    "A hard-coded route works on one map. Choose an algorithm that can react and solve all three test maps.": "決め打ちの道順は1つの地図でしか動きません。状況に反応して3つすべてを解けるアルゴリズムを選ぼう。",
    "A stronger algorithm captures a rule that works across cases, not just one memorized answer. That is a step from instructions toward problem solving.": "より良いアルゴリズムは、覚えた1つの答えではなく、複数の場合に使えるルールを表します。これは命令から問題解決へ進む一歩です。",
    "PROGRAM": "プログラム",
    "COMMANDS": "コマンド",
    "Tap one board tile first. Only then can you test the program.": "先にボードのマスを1つ押してください。その後でプログラムをテストできます。",
    "SET THE TWO VALUES": "2つの値を設定",
    "Always MOVE. If blocked, try MOVE again.": "常に MOVE。止められても、もう一度 MOVE。",
    "IF wall ahead → TURN RIGHT, ELSE → MOVE.": "IF 前が壁 → TURN RIGHT、ELSE → MOVE。",
    "IF wall ahead → TURN LEFT, ELSE → MOVE.": "IF 前が壁 → TURN LEFT、ELSE → MOVE。",
    "TURN RIGHT after every MOVE.": "MOVE のたびに TURN RIGHT。",
    "Write everything": "すべて書く",
    "Use a loop": "ループを使う",
    "Extra checking": "追加チェック",
    "Memorized route": "覚えた道順",
    "Reactive rule": "反応するルール",
    "Fixed rhythm": "決まったリズム",
    "Dark tiles are walls. Maro cannot enter them.": "濃い色のマスは壁です。マロは入れません。",
    "Follow position and direction; both are part of the program state.": "位置と向きの両方を追いましょう。どちらもプログラムの状態です。",
    "You solved this before. Try it again or inspect the idea another way.": "この問題は解決済みです。もう一度試すか、別の見方で考えてみよう。",
    "Think first, then test.": "まず考えて、それから試そう。",
    "Solved. You unlocked a new idea.": "正解！新しい考え方を獲得しました。",
    "Not yet. Use what you observed and change one thing.": "まだです。観察したことを使い、1か所だけ変えてみよう。",
    "Fill all four program slots first.": "最初に4つすべてのプログラムスロットを埋めてください。",
    "The computer followed your order exactly—but the order did not reach the beacon.": "コンピューターは順番どおりに動きましたが、ビーコンには着きませんでした。",
    "Prediction saved. Now test it.": "予測を保存しました。テストしてみよう。",
    "Predict a final tile before running.": "実行前に最後のマスを予測してください。",
    "Your prediction and the execution differ. Trace each command again from Maro's starting direction.": "予測と実行結果が違います。マロの最初の向きから、各コマンドをもう一度たどろう。",
    "Select the command you want to replace first.": "最初に置き換えたいコマンドを選んでください。",
    "Replacement made. Test the program.": "置き換えました。プログラムをテストしよう。",
    "Still not at the beacon. Look for the first point where the path turns the wrong way.": "まだビーコンに着いていません。道順が最初に違う方向へ曲がる場所を探そう。",
    "Put two commands inside the loop.": "ループの中に2つのコマンドを入れてください。",
    "Watch the shape Maro traced. What tiny pattern must repeat to close a square?": "マロが描いた形を見よう。四角形を閉じるには、どの小さなパターンを繰り返せばよいでしょう？",
    "The block structure is right. Only the parameter values need changing.": "ブロックの構造は正しいです。引数の値だけを変えてみよう。",
    "Choose one rule first.": "最初にルールを1つ選んでください。",
    "That rule does not reliably get around the wall. Which one looks at the current situation before choosing?": "そのルールでは確実に壁を回避できません。動作を選ぶ前に現在の状況を見るのはどれでしょう？",
    "Choose one program.": "プログラムを1つ選んでください。",
    "One test passed, but the rule should survive a changed value without rewriting the instruction.": "1つのテストは成功しましたが、命令を書き直さずに値の変化へ対応できるルールが必要です。",
    "Define three steps for CORNER(), then call it twice.": "CORNER() に3つのステップを定義し、それを2回呼び出してください。",
    "Your function runs exactly as defined. Change the definition once, then both calls will use the new behaviour.": "関数は定義どおりに動きます。定義を1回変えると、2つの呼び出しの両方に新しい動きが使われます。",
    "Choose a candidate to test.": "テストする候補を選んでください。",
    "That candidate does not even preserve the required final state.": "その候補では必要な最終状態を保てません。",
    "It works, but another valid program expresses the same pattern with fewer written blocks.": "正しく動きますが、同じパターンをもっと少ないブロックで表すプログラムがあります。",
    "Choose one algorithm to test across all three maps.": "3つすべての地図でテストするアルゴリズムを1つ選んでください。",
    "Generalization": "一般化",
    "A useful algorithm captures a rule that survives new cases. Reactive logic is more flexible than memorizing one route.": "役に立つアルゴリズムは、新しい場合にも通用するルールを表します。反応するロジックは、1つの道順を覚えるより柔軟です。",
    "Imagine being Maro. Which instruction changes direction before the final move?": "マロになったつもりで考えよう。最後の MOVE の前に向きを変える命令はどれ？",
    "Track three things after every command: x position, y position, and facing direction.": "各コマンドの後で、x位置、y位置、向きの3つを追いましょう。",
    "Find the earliest command after which Maro's route diverges from the beacon path.": "マロの道順がビーコンへの道から最初に外れるコマンドを探そう。",
    "A square repeats the same two actions four times.": "四角形は同じ2つの動作を4回繰り返します。",
    "The route is an L shape: first horizontal distance, then vertical distance.": "道順はL字型です。最初に横の距離、次に縦の距離を考えよう。",
    "Look for the option that asks a question before choosing an action.": "動作を選ぶ前に質問する選択肢を探そう。",
    "A named value can change while the instruction stays the same.": "名前のついた値は、命令を変えなくても中身を変えられます。",
    "The repeated mini-route is MOVE, turn toward the next leg, MOVE.": "繰り返す小さな道順は、MOVE、次の辺へ向く、MOVE です。",
    "Correctness first. Then compare how much you have to write to express the same behaviour.": "まず正しく動くか確認し、その後で同じ動きを表すために書く量を比べよう。",
    "A memorized route knows one map. A reactive rule observes what is happening now.": "覚えた道順は1つの地図しか知りません。反応するルールは今の状況を観察します。",

    "CREATIVE CODING": "クリエイティブコーディング",
    "MARO'S WORKSHOP": "マロのワークショップ",
    "PATTERN": "パターン",
    "Draw with repeated motion": "繰り返す動きで描く",
    "ALGORITHM ART": "アルゴリズムアート",
    "Transform your own mark": "自分の線を変化させる",
    "SCENE 01 · PATTERN STUDIO": "シーン01・パターンスタジオ",
    "Turn repeated movement into a drawing.": "繰り返す動きを絵に変えよう。",
    "Choose a prepared motif and compose a pattern with repeat, rotate, and size.": "用意された形を選び、繰り返し・回転・大きさを組み合わせて模様を作ろう。",
    "LINE": "線",
    "CIRCLE": "円",
    "TRIANGLE": "三角形",
    "▶ DRAW PATTERN": "▶ パターンを描く",
    "SCENE 02 · CREATIVE LAB": "シーン02・クリエイティブラボ",
    "Algorithm Art Studio": "アルゴリズムアート・スタジオ",
    "Give instructions to light, shape, colour, and time.": "光、形、色、時間に命令を与えよう。",
    "motion becomes a drawing": "動きが絵になる",
    "one rule grows a flower": "1つのルールで花が育つ",
    "a loop builds complexity": "ループが複雑さを作る",
    "your mark becomes art": "自分の線がアートになる",
    "DISCOVER": "発見",
    "A point learns to dance.": "点が踊り始める。",
    "Predict the path, change one relationship, then watch motion leave a trace.": "軌道を予測し、関係を1つ変えて、動きが線を残す様子を見よう。",
    "WAVE": "波",
    "ORBIT": "軌道",
    "▶ PLAY": "▶ 再生",
    "Ⅱ PAUSE": "Ⅱ 一時停止",
    "EXPERIMENT": "実験",
    "Make one rule bloom.": "1つのルールを咲かせよう。",
    "There is no correct flower. Change one number and discover a new visual species.": "正解の花はありません。数字を1つ変え、新しい形を発見しよう。",
    "CHANGE COLOUR": "色を変える",
    "UNDERSTAND": "理解",
    "One mark. Many moments.": "1つの線から、たくさんの瞬間へ。",
    "The active instruction lights up while the same small actions build a complex pattern.": "同じ小さな動作が複雑な模様を作る間、実行中の命令が光ります。",
    "▶ RUN PATTERN": "▶ パターンを実行",
    "EXPRESS": "表現",
    "Your mark. Your instructions.": "あなたの線。あなたの命令。",
    "Draw personal material, compose its behaviour, observe what emerges, then revise intentionally.": "自分の線を描き、動きを組み立て、生まれた形を観察して、意図を持って直そう。",
    "DRAW YOUR SEED": "元になる線を描く",
    "An initial, leaf, face, bolt, or squiggle.": "イニシャル、葉、顔、稲妻、自由な線などを描こう。",
    "UNDO STROKE": "1画戻す",
    "CLEAR SEED": "線を消す",
    "Draw a small mark first.": "最初に小さな線を描いてください。",
    "Good—now choose how the computer should transform it.": "いいですね。次に、コンピューターがどう変化させるか選ぼう。",
    "BEFORE saved. Change one instruction, then run again.": "変更前を保存しました。命令を1つ変えて、もう一度実行しよう。",
    "AFTER saved. Compare the two and keep what you prefer.": "変更後を保存しました。2つを比べ、好きな方を残そう。",
    "Making BEFORE…": "変更前を作成中…",
    "Making AFTER…": "変更後を作成中…",
    "▶ RUN ART": "▶ アートを実行",
    "MAKING…": "作成中…",
    "BUILD THE BEHAVIOUR": "動きを組み立てる",
    "Tap or drag a value. The code stays readable.": "値を押すかドラッグしてください。コードは読みやすいままです。",
    "MIRROR": "鏡映",
    "ALTERNATE": "交互",
    "OFF": "オフ",
    "COLOUR": "色",
    "↓ EXPORT IMAGE": "↓ 画像を書き出す",
    "TITLE": "タイトル",
    "COMPARE & REVISE": "比較して直す",
    "Changing your mind is part of making.": "考えを変えることも、ものづくりの一部です。",
    "BEFORE": "変更前",
    "AFTER": "変更後",
    "Change one instruction and run again.": "命令を1つ変えて、もう一度実行しよう。",
    "← PREVIOUS STAGE": "← 前のステージ",
    "NEXT STAGE →": "次のステージ →",
    "← PREVIOUS SCENE": "← 前のシーン",
    "NEXT SCENE →": "次のシーン →",

    "LIVE PSEUDOCODE": "実行中の疑似コード",
    "MY ALGORITHM": "自分のアルゴリズム",
    "WHAT THE GAME IS DOING": "ゲーム内で起きていること",
    "ORDER OF OPERATIONS": "処理の順番",
    "The computer reads these instructions from top to bottom.": "コンピューターは命令を上から下へ読みます。",
    "HOW THE FUNCTIONS WORK": "関数の仕組み",
    "Scroll here to see what each instruction changes behind the scenes.": "スクロールすると、それぞれの命令が内部で何を変えるか確認できます。",
    "These definitions show what each instruction changes behind the scenes.": "これらの定義は、各命令が内部で何を変えるかを示しています。",
    "COPY CODE": "コードをコピー",
    "CLOSE": "閉じる"
  };

  const EN = Object.fromEntries(Object.entries(JA).map(([english, japanese]) => [japanese, english]));
  const SKIP_SELECTOR = [
    "pre",
    "code",
    "[data-command]",
    ".command-chip",
    ".block",
    ".slot",
    ".program-strip",
    ".code-line",
    ".algorithm-strip",
    ".code-token",
    ".command-stack",
    ".lab-chip",
    "[data-language-toggle]"
  ].join(",");

  let language = localStorage.getItem(STORAGE_KEY) === "ja" ? "ja" : "en";
  let observer;
  let toggle;
  const originalTitle = document.title;

  function translatePattern(value, target) {
    const ja = target === "ja";
    let match;
    if ((match = value.match(/^CHALLENGE (\d+) OF (\d+)$/))) return ja ? `チャレンジ ${match[1]} / ${match[2]}` : value;
    if ((match = value.match(/^チャレンジ (\d+) \/ (\d+)$/))) return ja ? value : `CHALLENGE ${match[1]} OF ${match[2]}`;
    if ((match = value.match(/^LEVEL (\d+)$/))) return ja ? `レベル ${match[1]}` : value;
    if ((match = value.match(/^レベル (\d+)$/))) return ja ? value : `LEVEL ${match[1]}`;
    if ((match = value.match(/^(\d+) command slots$/))) return ja ? `コマンドスロット ${match[1]}個` : value;
    if ((match = value.match(/^コマンドスロット (\d+)個$/))) return ja ? value : `${match[1]} command slots`;
    if ((match = value.match(/^(\d+)\/(\d+) slots$/))) return ja ? `${match[1]}/${match[2]} スロット` : value;
    if ((match = value.match(/^(\d+)\/(\d+) スロット$/))) return ja ? value : `${match[1]}/${match[2]} slots`;
    if ((match = value.match(/^(\d+)\/2 inside repeat$/))) return ja ? `繰り返しの中 ${match[1]}/2` : value;
    if ((match = value.match(/^繰り返しの中 (\d+)\/2$/))) return ja ? value : `${match[1]}/2 inside repeat`;
    if ((match = value.match(/^Command (\d+) selected\.$/))) return ja ? `コマンド ${match[1]} を選びました。` : value;
    if ((match = value.match(/^コマンド (\d+) を選びました。$/))) return ja ? value : `Command ${match[1]} selected.`;
    if ((match = value.match(/^Command (\d+) selected\. Choose a replacement\.$/))) return ja ? `コマンド ${match[1]} を選びました。置き換えるコマンドを選んでください。` : value;
    if ((match = value.match(/^コマンド (\d+) を選びました。置き換えるコマンドを選んでください。$/))) return ja ? value : `Command ${match[1]} selected. Choose a replacement.`;
    if ((match = value.match(/^Prediction placed at column (\d+), row (\d+)\. Now run it\.$/))) return ja ? `${match[1]}列 ${match[2]}行に予測を置きました。実行してみよう。` : value;
    if ((match = value.match(/^(\d+)列 (\d+)行に予測を置きました。実行してみよう。$/))) return ja ? value : `Prediction placed at column ${match[1]}, row ${match[2]}. Now run it.`;
    if ((match = value.match(/^(\d+)\/3 maps passed\. A smarter algorithm needs to react to the map instead of assuming one fixed route\.$/))) return ja ? `${match[1]}/3 の地図で成功しました。より良いアルゴリズムは、道順を決めつけず地図に反応する必要があります。` : value;
    if ((match = value.match(/^(\d+)\/3 の地図で成功しました。より良いアルゴリズムは、道順を決めつけず地図に反応する必要があります。$/))) return ja ? value : `${match[1]}/3 maps passed. A smarter algorithm needs to react to the map instead of assuming one fixed route.`;
    if ((match = value.match(/^COPY (\d+) \/ (\d+)$/))) return ja ? `コピー ${match[1]} / ${match[2]}` : value;
    if ((match = value.match(/^コピー (\d+) \/ (\d+)$/))) return ja ? value : `COPY ${match[1]} / ${match[2]}`;
    if ((match = value.match(/^(MOVE|TURN LEFT|TURN RIGHT) added\.$/))) return ja ? `${match[1]} を追加しました。` : value;
    if ((match = value.match(/^(MOVE|TURN LEFT|TURN RIGHT) を追加しました。$/))) return ja ? value : `${match[1]} added.`;
    if ((match = value.match(/^(↑ MOVE FORWARD|↶ TURN LEFT|↷ TURN RIGHT) added\.$/))) return ja ? `${match[1]} を追加しました。` : value;
    if ((match = value.match(/^(↑ MOVE FORWARD|↶ TURN LEFT|↷ TURN RIGHT) を追加しました。$/))) return ja ? value : `${match[1]} added.`;
    if ((match = value.match(/^(↑ MOVE FORWARD|↶ TURN LEFT|↷ TURN RIGHT) executed\.$/))) return ja ? `${match[1]} を実行しました。` : value;
    if ((match = value.match(/^(↑ MOVE FORWARD|↶ TURN LEFT|↷ TURN RIGHT) を実行しました。$/))) return ja ? value : `${match[1]} executed.`;
    if ((match = value.match(/^(MOVE|TURN LEFT|TURN RIGHT) replaced command (\d+)\. Run it again\.$/))) return ja ? `コマンド ${match[2]} を ${match[1]} に置き換えました。もう一度実行しよう。` : value;
    if ((match = value.match(/^コマンド (\d+) を (MOVE|TURN LEFT|TURN RIGHT) に置き換えました。もう一度実行しよう。$/))) return ja ? value : `${match[2]} replaced command ${match[1]}. Run it again.`;
    if ((match = value.match(/^(\d+) written blocks? · (\d+) executed actions$/))) return ja ? `記述ブロック ${match[1]}個・実行動作 ${match[2]}個` : value;
    if ((match = value.match(/^記述ブロック (\d+)個・実行動作 (\d+)個$/))) return ja ? value : `${match[1]} written block${match[1] === "1" ? "" : "s"} · ${match[2]} executed actions`;
    if ((match = value.match(/^SCENE 2 · (.+)$/))) return ja ? `シーン2・${JA[match[1]] || match[1]}` : value;
    if ((match = value.match(/^シーン2・(.+)$/))) return ja ? value : `SCENE 2 · ${EN[match[1]] || match[1]}`;
    if ((match = value.match(/^CHALLENGE (\d+) · (.+)$/))) return ja ? `チャレンジ ${match[1]}・${JA[match[2]] || match[2]}` : value;
    if ((match = value.match(/^チャレンジ (\d+)・(.+)$/))) return ja ? value : `CHALLENGE ${match[1]} · ${EN[match[2]] || match[2]}`;
    return value;
  }

  function translated(value) {
    const table = language === "ja" ? JA : EN;
    return table[value] || translatePattern(value, language);
  }

  function isSkipped(element) {
    return element?.closest?.(SKIP_SELECTOR);
  }

  function translateTextNode(node) {
    if (!node.parentElement || isSkipped(node.parentElement)) return;
    const value = node.nodeValue || "";
    const trimmed = value.trim();
    if (!trimmed) return;
    const next = translated(trimmed);
    if (next === trimmed) return;
    const start = value.match(/^\s*/)?.[0] || "";
    const end = value.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${start}${next}${end}`;
  }

  function translateElement(element) {
    if (!(element instanceof Element)) return;
    if (!isSkipped(element)) {
      for (const attribute of ["aria-label", "title", "placeholder"]) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        const next = translated(value);
        if (next !== value) element.setAttribute(attribute, next);
      }
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    if (document.body) translateElement(document.body);
    document.title = language === "ja" ? (JA[originalTitle] || originalTitle) : (EN[document.title] || originalTitle);
    if (toggle) {
      toggle.textContent = language === "ja" ? "EN" : "日本語";
      toggle.setAttribute("aria-label", language === "ja" ? "Switch to English" : "日本語に切り替える");
      toggle.setAttribute("aria-pressed", String(language === "ja"));
      toggle.title = language === "ja" ? "English" : "日本語";
    }
    window.dispatchEvent(new CustomEvent("oyc-language-change", { detail: { language } }));
  }

  function mount() {
    if (document.querySelector("[data-language-toggle]")) return;
    const style = document.createElement("style");
    style.textContent = `.language-toggle{position:fixed;z-index:30;right:max(100px,calc(env(safe-area-inset-right) + 100px));top:max(14px,env(safe-area-inset-top));min-width:70px;min-height:44px;padding:0 13px;border:2px solid #17233d;border-radius:8px;background:#fffdf8;color:#17233d;box-shadow:3px 4px 0 #17233d;font:900 13px/1 Arial,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif;cursor:pointer}.language-toggle:hover{transform:translateY(-2px);background:#f4c900}.language-toggle:focus-visible{outline:4px solid rgba(21,88,214,.35);outline-offset:3px}.site-header .language-toggle{position:static;margin-left:auto;margin-right:12px;box-shadow:2px 3px 0 #17233d}@media(max-width:520px){.language-toggle{right:max(14px,env(safe-area-inset-right));min-width:64px}.site-header .language-toggle{margin-right:6px}}`;
    document.head.append(style);

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "language-toggle";
    toggle.dataset.languageToggle = "true";
    toggle.addEventListener("click", () => {
      language = language === "en" ? "ja" : "en";
      localStorage.setItem(STORAGE_KEY, language);
      applyLanguage();
    });

    const menuHeader = document.querySelector(".site-header");
    const menuLabel = menuHeader?.querySelector(".menu-label");
    if (menuHeader && menuLabel) menuHeader.insertBefore(toggle, menuLabel);
    else document.body.append(toggle);

    observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateTextNode(mutation.target);
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node);
        }
      }
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    applyLanguage();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
