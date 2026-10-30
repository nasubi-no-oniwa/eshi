// =============================================
//  ことば（日本語・English・繁體中文・한국어）
//  ===========================================

(function () {
  var LANGS = ['ja', 'en', 'zh', 'ko'];
  var KEY = 'eshi-lang';
  var D = {
 "lang_label": [
  "ことば",
  "Language",
  "語言",
  "언어"
 ],
 "home": [
  "なすびのお庭へ",
  "Nasubi's Garden (more games)",
  "前往茄子的庭院",
  "가지의 정원으로"
 ],
 "howto": [
  "あそびかた",
  "How to play",
  "玩法",
  "플레이 방법"
 ],
 "close": [
  "とじる",
  "Close",
  "關閉",
  "닫기"
 ],
 "back": [
  "もどる",
  "Back",
  "返回",
  "돌아가기"
 ],
 "to_title": [
  "タイトルへ",
  "Back to title",
  "回到標題",
  "타이틀로"
 ],
 "again": [
  "もう一回",
  "Play again",
  "再來一局",
  "한 판 더"
 ],
 "easy": [
  "よわい",
  "Easy",
  "簡單",
  "약함"
 ],
 "normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "hard": [
  "つよい",
  "Hard",
  "困難",
  "강함"
 ],
 "vs_cpu": [
  "CPUとたいせん",
  "VS CPU",
  "對戰CPU",
  "CPU와 대전"
 ],
 "online": [
  "あいことばで対戦",
  "Play with a passcode",
  "用暗號對戰",
  "암호로 대전"
 ],
 "passcode": [
  "あいことば",
  "Passcode",
  "暗號",
  "암호"
 ],
 "name": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "noname": [
  "ななし",
  "Anonymous",
  "無名氏",
  "익명"
 ],
 "online_hint": [
  "同じあいことばを入れた人と対戦。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 관전이 됩니다."
 ],
 "join": [
  "はいる",
  "Join",
  "進入",
  "입장"
 ],
 "wait_pre": [
  "あいことば「",
  "Passcode: ",
  "暗號「",
  "암호 「"
 ],
 "wait_post": [
  "」",
  "",
  "」",
  "」"
 ],
 "waiting": [
  "あいてを待っています…",
  "Waiting for an opponent…",
  "等待對手中…",
  "상대를 기다리는 중…"
 ],
 "copy_link": [
  "さそうリンクをコピー",
  "Copy invite link",
  "複製邀請連結",
  "초대 링크 복사"
 ],
 "copied": [
  "コピーしました！",
  "Copied!",
  "已複製！",
  "복사했어요!"
 ],
 "send_link": [
  "このリンクを送ってください",
  "Send this link",
  "請傳送這個連結",
  "이 링크를 보내 주세요"
 ],
 "err_code": [
  "あいことばを入れてください（. # $ / [ ] は使えません）",
  "Enter a passcode (. # $ / [ ] are not allowed)",
  "請輸入暗號（不能使用 . # $ / [ ]）",
  "암호를 입력해 주세요 (. # $ / [ ] 는 사용할 수 없어요)"
 ],
 "err_code_short": [
  "あいことばを入れてください",
  "Enter a passcode",
  "請輸入暗號",
  "암호를 입력해 주세요"
 ],
 "connecting": [
  "つないでいます…",
  "Connecting…",
  "連線中…",
  "연결 중…"
 ],
 "err_net": [
  "通信できませんでした。電波のよいところでもう一度ためしてください",
  "Couldn't connect. Please try again where the signal is better.",
  "無法連線。請在訊號好的地方再試一次。",
  "연결하지 못했어요. 신호가 좋은 곳에서 다시 시도해 주세요."
 ],
 "err_notready": [
  "オンライン対戦はまだ準備中です",
  "Online play isn't ready yet",
  "線上對戰還在準備中",
  "온라인 대전은 아직 준비 중이에요"
 ],
 "err_conn": [
  "つながりませんでした",
  "Couldn't connect",
  "無法連線",
  "연결되지 않았어요"
 ],
 "left_win": [
  "相手が抜けたので、あなたの勝ち！",
  "Your opponent left, so you win!",
  "對手離開了，你贏了！",
  "상대가 나가서 당신의 승리!"
 ],
 "left": [
  "あいてが退室しました",
  "Your opponent left",
  "對手已離開",
  "상대가 퇴장했어요"
 ],
 "watch_in": [
  "観戦で入りました。試合が始まるのを待っています…",
  "You joined as a spectator. Waiting for the game to start…",
  "已用觀戰身分進入。等待比賽開始…",
  "관전으로 입장했어요. 경기 시작을 기다리는 중…"
 ],
 "wait_next": [
  "次の試合が始まるのを待っています…",
  "Waiting for the next game…",
  "等待下一局開始…",
  "다음 경기를 기다리는 중…"
 ],
 "wait_rematch": [
  "あいての「もう一回」を待っています…",
  "Waiting for your opponent to choose \"Play again\"…",
  "等待對手按「再來一局」…",
  "상대의 '한 판 더'를 기다리는 중…"
 ],
 "you": [
  "あなた",
  "You",
  "你",
  "나"
 ],
 "cpu": [
  "CPU",
  "CPU",
  "CPU",
  "CPU"
 ],
 "your_turn": [
  "あなたの番",
  "Your turn",
  "輪到你",
  "내 차례"
 ],
 "cpu_wait_label": [
  "CPU（ふつう）と遊びながら待つ",
  "Play the CPU (Normal) while waiting",
  "一邊和CPU（普通）玩一邊等",
  "기다리는 동안 CPU(보통)와 플레이"
 ],
 "qm_btn": [
  "だれかと対戦",
  "Play someone online",
  "隨機對戰",
  "아무나와 대전"
 ],
 "qm_stat": [
  "対戦待ち <b>{w}</b>人・対戦中 <b>{p}</b>組",
  "<b>{w}</b> waiting · <b>{p}</b> playing",
  "等待中 <b>{w}</b>人・對戰中 <b>{p}</b>組",
  "대기 <b>{w}</b>명 · 대전 중 <b>{p}</b>쌍"
 ],
 "qm_prime_hot": [
  "🔥 いま対戦タイム！（22時まで）",
  "🔥 Battle time now! (until 22:00 JST)",
  "🔥 現在是對戰時間！（到日本時間22點）",
  "🔥 지금은 대전 타임! (일본 시간 22시까지)"
 ],
 "qm_prime": [
  "🌙 毎晩21時〜22時は対戦タイム",
  "🌙 Battle time every night 21:00–22:00 JST",
  "🌙 每晚日本時間21〜22點是對戰時間",
  "🌙 매일 밤 일본 시간 21~22시는 대전 타임"
 ],
 "qm_sub": [
  "いま待っている人と、自動でつながります。",
  "You'll be matched automatically with someone who's waiting.",
  "自動和正在等待的人配對。",
  "기다리고 있는 사람과 자동으로 연결돼요."
 ],
 "qm_go": [
  "さがす",
  "Find a match",
  "尋找",
  "찾기"
 ],
 "qm_badname": [
  "その名前は使えません。ほかの名前にしてね",
  "That name can't be used. Please choose another.",
  "這個名字不能使用，請換一個。",
  "그 이름은 사용할 수 없어요. 다른 이름으로 해 주세요."
 ],
 "qm_searching": [
  "相手をさがしています",
  "Looking for an opponent",
  "正在尋找對手",
  "상대를 찾는 중"
 ],
 "qm_wait_pre": [
  "いま対戦待ち ",
  "Waiting now: ",
  "目前等待中 ",
  "현재 대기 "
 ],
 "qm_wait_post": [
  "人",
  "",
  "人",
  "명"
 ],
 "qm_cpu": [
  "CPUと遊びながら待つ",
  "Play the CPU while waiting",
  "一邊和CPU玩一邊等",
  "기다리는 동안 CPU와 플레이"
 ],
 "qm_cancel": [
  "やめる",
  "Cancel",
  "取消",
  "그만두기"
 ],
 "qm_retry": [
  "もう一度さがす",
  "Search again",
  "再找一次",
  "다시 찾기"
 ],
 "qm_searching_t": [
  "相手をさがしています… {t}",
  "Looking for an opponent… {t}",
  "正在尋找對手… {t}",
  "상대를 찾는 중… {t}"
 ],
 "qm_calling": [
  "CPUと遊んでいる人に声をかけています…",
  "Inviting someone who is playing the CPU…",
  "正在邀請正在和CPU玩的人…",
  "CPU와 플레이 중인 사람에게 신청하는 중…"
 ],
 "qm_declined": [
  "相手が見送りました。ほかの人をさがします",
  "They passed. Looking for someone else.",
  "對方跳過了，改找其他人。",
  "상대가 넘겼어요. 다른 사람을 찾을게요."
 ],
 "qm_found": [
  "相手が見つかりました！",
  "Opponent found!",
  "找到對手了！",
  "상대를 찾았어요!"
 ],
 "qm_avail": [
  "対戦できる相手がいます！",
  "Someone is ready to play!",
  "有可以對戰的對手！",
  "대전할 수 있는 상대가 있어요!"
 ],
 "qm_play": [
  "対戦する",
  "Play",
  "對戰",
  "대전하기"
 ],
 "qm_pass": [
  "見送る",
  "Pass",
  "跳過",
  "넘기기"
 ],
 "qm_taken": [
  "さっきの相手は、ほかの人と対戦を始めました。もう少し待ってね",
  "That player started a match with someone else. Please wait a little longer.",
  "剛才的對手已經和別人開始對戰了。請再等一下。",
  "방금 상대는 다른 사람과 대전을 시작했어요. 조금만 더 기다려 주세요."
 ],
 "qm_fail": [
  "相手とつながりませんでした（{c}）",
  "Couldn't connect to your opponent ({c})",
  "無法和對手連線（{c}）",
  "상대와 연결되지 않았어요 ({c})"
 ],
 "qm_nojoin": [
  "入れませんでした",
  "Couldn't join",
  "無法進入",
  "들어가지 못했어요"
 ],
 "qm_next": [
  "次の相手をさがす",
  "Find next opponent",
  "尋找下一位對手",
  "다음 상대 찾기"
 ],
 "doc_title": [
  "絵私（えし）",
  "Eshi — Draw & Fight",
  "繪我（Eshi）",
  "에시"
 ],
 "doc_desc": [
  "頭と体・うで・あしを描いて、骨を入れて戦う。描いたキャラで、あいことば対戦。",
  "Draw a head & body, arms and legs, add bones, and fight. Battle friends with your drawing using a passcode.",
  "畫出頭和身體、手、腳，放入骨頭來戰鬥。用畫的角色進行暗號對戰。",
  "머리와 몸·팔·다리를 그리고 뼈를 넣어 싸워요. 그린 캐릭터로 암호 대전."
 ],
 "kana": [
  "え　し",
  "E · S · H · I",
  "Eshi",
  "에 · 시"
 ],
 "logo": [
  "絵<span>私</span>",
  "E<span>shi</span>",
  "繪<span>我</span>",
  "에<span>시</span>"
 ],
 "tag": [
  "描いて、骨を入れて、たたかえ。",
  "Draw it. Add bones. Fight!",
  "畫出來、放入骨頭、戰鬥吧！",
  "그리고, 뼈를 넣고, 싸워라!"
 ],
 "home_e": [
  "🍆 なすびのお庭へ",
  "🍆 Nasubi's Garden (more games)",
  "🍆 前往茄子的庭院",
  "🍆 가지의 정원으로"
 ],
 "no_char": [
  "まだキャラがいません",
  "No character yet",
  "還沒有角色",
  "아직 캐릭터가 없어요"
 ],
 "make_char": [
  "キャラをつくる",
  "Make a character",
  "做角色",
  "캐릭터 만들기"
 ],
 "edit_char": [
  "キャラをなおす",
  "Edit character",
  "修改角色",
  "캐릭터 고치기"
 ],
 "noname_c": [
  "なまえなし",
  "No name",
  "未命名",
  "이름 없음"
 ],
 "pool": [
  "ライバル帳 {n}体（CPUの相手に出てきます）",
  "Rivals: {n} (they show up as CPU opponents)",
  "對手簿 {n}個（會成為CPU的對手）",
  "라이벌 수첩 {n}명 (CPU 상대로 나와요)"
 ],
 "id_c": [
  "ID：",
  "ID: ",
  "ID：",
  "ID: "
 ],
 "copy": [
  "コピー",
  "Copy",
  "複製",
  "복사"
 ],
 "copied2": [
  "コピーしました",
  "Copied",
  "已複製",
  "복사했어요"
 ],
 "id_again": [
  "もう一度IDをもらう",
  "Get a new ID",
  "重新取得ID",
  "ID 다시 받기"
 ],
 "find_btn": [
  "IDでよぶ",
  "Load by ID",
  "用ID叫出",
  "ID로 부르기"
 ],
 "gal_btn": [
  "みんなのキャラ",
  "Everyone's characters",
  "大家的角色",
  "모두의 캐릭터"
 ],
 "draw_first": [
  "まずはキャラを描こう！",
  "Draw your character first!",
  "先來畫角色吧！",
  "먼저 캐릭터를 그리자!"
 ],
 "prev_char": [
  "前のキャラ",
  "Old character",
  "之前的角色",
  "예전 캐릭터"
 ],
 "rival": [
  "ライバル",
  "Rival",
  "對手",
  "라이벌"
 ],
 "cpu_name": [
  "{name}（{lv}）",
  "{name} ({lv})",
  "{name}（{lv}）",
  "{name} ({lv})"
 ],
 "p_body": [
  "頭と体",
  "Head & body",
  "頭和身體",
  "머리와 몸"
 ],
 "p_armL": [
  "左うで",
  "Left arm",
  "左手",
  "왼팔"
 ],
 "p_armR": [
  "右うで",
  "Right arm",
  "右手",
  "오른팔"
 ],
 "p_legL": [
  "左あし",
  "Left leg",
  "左腳",
  "왼다리"
 ],
 "p_legR": [
  "右あし",
  "Right leg",
  "右腳",
  "오른다리"
 ],
 "p_ex1": [
  "かざり1",
  "Extra 1",
  "裝飾1",
  "장식1"
 ],
 "p_ex2": [
  "かざり2",
  "Extra 2",
  "裝飾2",
  "장식2"
 ],
 "p_ex3": [
  "かざり3",
  "Extra 3",
  "裝飾3",
  "장식3"
 ],
 "p_ex4": [
  "かざり4",
  "Extra 4",
  "裝飾4",
  "장식4"
 ],
 "ps_armL": [
  "左うで",
  "L arm",
  "左手",
  "왼팔"
 ],
 "ps_armR": [
  "右うで",
  "R arm",
  "右手",
  "오른팔"
 ],
 "ps_legL": [
  "左あし",
  "L leg",
  "左腳",
  "왼다리"
 ],
 "ps_legR": [
  "右あし",
  "R leg",
  "右腳",
  "오른다리"
 ],
 "smp_easy": [
  "ぼうくん",
  "Sticky",
  "火柴人",
  "막대군"
 ],
 "smp_normal": [
  "ロボ",
  "Robo",
  "機器人",
  "로보"
 ],
 "smp_hard": [
  "タコまる",
  "Octo",
  "章魚丸",
  "문어돌이"
 ],
 "char_name": [
  "キャラの名前",
  "Character name",
  "角色名字",
  "캐릭터 이름"
 ],
 "help": [
  "使いかた",
  "How to use",
  "使用方法",
  "사용법"
 ],
 "more": [
  "そのほか",
  "More",
  "其他",
  "더 보기"
 ],
 "done": [
  "完成！",
  "Done!",
  "完成！",
  "완성!"
 ],
 "dw_done": [
  "できた！",
  "Done!",
  "畫好了！",
  "다 됐다!"
 ],
 "prev_part": [
  "前のパーツ",
  "Previous part",
  "上一個部位",
  "이전 부위"
 ],
 "next_part": [
  "次のパーツ",
  "Next part",
  "下一個部位",
  "다음 부위"
 ],
 "fit": [
  "全体",
  "Fit",
  "全部",
  "전체"
 ],
 "sample": [
  "おてほんを出す",
  "Load a sample",
  "顯示範例",
  "견본 불러오기"
 ],
 "mirror": [
  "左右コピー",
  "Mirror copy",
  "左右複製",
  "좌우 복사"
 ],
 "mirror_to": [
  "{p}へコピー",
  "Copy to {p}",
  "複製到{p}",
  "{p}(으)로 복사"
 ],
 "mirror_done": [
  "{p}にコピーしました",
  "Copied to {p}",
  "已複製到{p}",
  "{p}(으)로 복사했어요"
 ],
 "mirror_out": [
  "反対がわがキャンバスからはみ出すのでコピーできません",
  "Can't copy: the other side would stick out of the canvas",
  "另一邊會超出畫布，無法複製",
  "반대쪽이 캔버스를 벗어나서 복사할 수 없어요"
 ],
 "clear_part": [
  "このパーツを全部消す",
  "Erase this part",
  "清除這個部位",
  "이 부위 모두 지우기"
 ],
 "t_pen": [
  "ペン",
  "Pen",
  "筆",
  "펜"
 ],
 "t_fill": [
  "ぬる",
  "Fill",
  "填色",
  "채우기"
 ],
 "t_erase": [
  "けす",
  "Erase",
  "擦掉",
  "지우개"
 ],
 "t_shape": [
  "図形",
  "Shape",
  "圖形",
  "도형"
 ],
 "t_stamp": [
  "スタンプ",
  "Stamp",
  "貼圖",
  "스탬프"
 ],
 "t_bone": [
  "骨",
  "Bones",
  "骨頭",
  "뼈"
 ],
 "t_undo": [
  "もどす",
  "Undo",
  "復原",
  "되돌리기"
 ],
 "size": [
  "ふとさ",
  "Size",
  "粗細",
  "굵기"
 ],
 "free_color": [
  "じゆうな色",
  "Any color",
  "自由顏色",
  "자유 색"
 ],
 "canvas_note": [
  "●＝うで・あし・かざりがつく場所（「骨」で動かせる）",
  "● = where arms, legs & extras attach (move them with \"Bones\")",
  "●＝手、腳、裝飾接上的位置（用「骨頭」可移動）",
  "● = 팔·다리·장식이 붙는 곳 (\"뼈\"로 움직일 수 있어요)"
 ],
 "bone_tip": [
  "<b>骨をタップ</b>：関節を足す／<b>関節</b>：ドラッグで曲げる・タップで消す（{n}/{m}）／<b>黄色の●</b>：つく場所を動かす",
  "<b>Tap a bone</b>: add a joint / <b>Joint</b>: drag to bend, tap to remove ({n}/{m}) / <b>Yellow ●</b>: move where it attaches",
  "<b>點骨頭</b>：增加關節／<b>關節</b>：拖曳彎曲、點擊刪除（{n}/{m}）／<b>黃色●</b>：移動接上的位置",
  "<b>뼈를 탭</b>: 관절 추가 / <b>관절</b>: 드래그로 굽히기, 탭으로 삭제 ({n}/{m}) / <b>노란 ●</b>: 붙는 곳 이동"
 ],
 "bone_tip_body": [
  "<b>黄色の●</b>をドラッグすると、うで・あし・かざりのつく場所を動かせます",
  "Drag a <b>yellow ●</b> to move where arms, legs & extras attach",
  "拖曳<b>黃色●</b>可以移動手、腳、裝飾接上的位置",
  "<b>노란 ●</b>를 드래그하면 팔·다리·장식이 붙는 곳을 옮길 수 있어요"
 ],
 "sh_line": [
  "／ 直線",
  "／ Line",
  "／ 直線",
  "／ 직선"
 ],
 "sh_circle": [
  "○ 丸",
  "○ Circle",
  "○ 圓形",
  "○ 원"
 ],
 "sh_rect": [
  "□ 四角",
  "□ Square",
  "□ 方形",
  "□ 사각형"
 ],
 "sh_fill": [
  "中もぬる",
  "Filled",
  "內部填色",
  "안도 칠하기"
 ],
 "st_eyes": [
  "👀 目",
  "👀 Eyes",
  "👀 眼睛",
  "👀 눈"
 ],
 "st_tsuri": [
  "😠 つり目",
  "😠 Angry eyes",
  "😠 吊眼",
  "😠 치켜뜬 눈"
 ],
 "st_kira": [
  "✨ キラ目",
  "✨ Sparkly eyes",
  "✨ 閃亮眼",
  "✨ 반짝 눈"
 ],
 "st_smile": [
  "🙂 口",
  "🙂 Mouth",
  "🙂 嘴巴",
  "🙂 입"
 ],
 "st_gao": [
  "😮 大口",
  "😮 Big mouth",
  "😮 大嘴",
  "😮 큰 입"
 ],
 "st_kiba": [
  "🦷 キバ",
  "🦷 Fangs",
  "🦷 獠牙",
  "🦷 송곳니"
 ],
 "st_blush": [
  "☺ ほっぺ",
  "☺ Cheeks",
  "☺ 腮紅",
  "☺ 볼터치"
 ],
 "st_star": [
  "⭐ 星",
  "⭐ Star",
  "⭐ 星星",
  "⭐ 별"
 ],
 "st_heart": [
  "❤ ハート",
  "❤ Heart",
  "❤ 愛心",
  "❤ 하트"
 ],
 "front_on": [
  "体の前に出ている（タップで切りかえ）",
  "In front of the body (tap to switch)",
  "在身體前面（點擊切換）",
  "몸 앞에 있음 (탭해서 전환)"
 ],
 "front_off": [
  "体の後ろにある（タップで切りかえ）",
  "Behind the body (tap to switch)",
  "在身體後面（點擊切換）",
  "몸 뒤에 있음 (탭해서 전환)"
 ],
 "stat_ex": [
  "かざり：当たり判定なし・ゆらゆらゆれる",
  "Extra: no hitbox, sways around",
  "裝飾：沒有碰撞判定、會搖搖晃晃",
  "장식: 판정 없음 · 흔들흔들"
 ],
 "stat_arm": [
  "とどく長さ <b>{len}</b>　当たるまで <b>{hit}秒</b>　関節 <b>{j}</b>",
  "Reach <b>{len}</b> · Hit time <b>{hit}s</b> · Joints <b>{j}</b>",
  "攻擊距離 <b>{len}</b>　命中所需 <b>{hit}秒</b>　關節 <b>{j}</b>",
  "닿는 길이 <b>{len}</b> · 맞기까지 <b>{hit}초</b> · 관절 <b>{j}</b>"
 ],
 "stat_leg": [
  "足の長さ <b>{len}</b>（長い＝速い・当たりやすい）　関節 <b>{j}</b>",
  "Leg length <b>{len}</b> (long = fast, easier to hit) · Joints <b>{j}</b>",
  "腳長 <b>{len}</b>（越長＝越快、越容易被打中）　關節 <b>{j}</b>",
  "다리 길이 <b>{len}</b> (길수록 빠르고 맞기 쉬움) · 관절 <b>{j}</b>"
 ],
 "stat_body": [
  "上のほうが<b>頭</b>（当たるとクリティカル）",
  "The top part is the <b>head</b> (hits there are critical)",
  "上面是<b>頭</b>（打中就是爆擊）",
  "위쪽이 <b>머리</b> (맞으면 크리티컬)"
 ],
 "fill_edge": [
  "線でかこまれた所をぬってね",
  "Fill an area enclosed by lines",
  "請填滿被線圍起來的地方",
  "선으로 둘러싸인 곳을 칠해 줘"
 ],
 "root_tip": [
  "黄色の●をドラッグすると、つく場所を動かせます",
  "Drag a yellow ● to move where it attaches",
  "拖曳黃色●可以移動接上的位置",
  "노란 ●를 드래그하면 붙는 곳을 옮길 수 있어요"
 ],
 "joint_max": [
  "関節は{n}こまで",
  "Up to {n} joints",
  "關節最多{n}個",
  "관절은 {n}개까지"
 ],
 "joint_overlap": [
  "その関節を消すと骨が重なります",
  "Removing that joint would make bones overlap",
  "刪掉那個關節骨頭會重疊",
  "그 관절을 지우면 뼈가 겹쳐요"
 ],
 "empty_warn": [
  "{p} がまだ空っぽ。もう一度押すとそのまま進む",
  "{p} is still empty. Tap again to continue anyway",
  "{p} 還是空的。再按一次就直接繼續",
  "{p}이(가) 아직 비어 있어요. 한 번 더 누르면 그대로 진행"
 ],
 "list_sep": [
  "・",
  ", ",
  "、",
  ", "
 ],
 "skip": [
  "とばす",
  "Skip",
  "跳過",
  "건너뛰기"
 ],
 "next": [
  "つぎへ",
  "Next",
  "下一步",
  "다음"
 ],
 "begin": [
  "はじめる",
  "Start",
  "開始",
  "시작"
 ],
 "c1": [
  "ここで描くパーツをえらびます。<b>頭と体・うで・あし・かざり</b>を、それぞれ描きます。",
  "Choose which part to draw here. Draw the <b>head & body, arms, legs and extras</b> one by one.",
  "在這裡選擇要畫的部位。<b>頭和身體、手、腳、裝飾</b>要分別畫。",
  "여기서 그릴 부위를 골라요. <b>머리와 몸·팔·다리·장식</b>을 각각 그려요."
 ],
 "c2": [
  "<b>ペン</b>で描く、<b>ぬる</b>でぬりつぶす、<b>図形</b>・<b>スタンプ</b>も使えます。",
  "Draw with <b>Pen</b>, paint areas with <b>Fill</b>, and use <b>Shape</b> and <b>Stamp</b> too.",
  "用<b>筆</b>畫、用<b>填色</b>塗滿，也能用<b>圖形</b>、<b>貼圖</b>。",
  "<b>펜</b>으로 그리고, <b>채우기</b>로 칠하고, <b>도형</b>·<b>스탬프</b>도 쓸 수 있어요."
 ],
 "c3": [
  "うで・あしには、はじめから<b>黒い骨の線</b>があります。上から好きな色でぬれます（ぬらなければ黒い線のまま）。",
  "Arms and legs start with a <b>black bone line</b>. Paint over it in any color (or leave it as a black line).",
  "手和腳一開始就有<b>黑色的骨頭線</b>。可以用喜歡的顏色塗上去（不塗就維持黑線）。",
  "팔·다리에는 처음부터 <b>검은 뼈 선</b>이 있어요. 위에 원하는 색으로 칠할 수 있어요 (안 칠하면 검은 선 그대로)."
 ],
 "c4": [
  "<b>骨</b>を押すと、骨を動かせます。",
  "Press <b>Bones</b> to move the bones.",
  "按<b>骨頭</b>就能移動骨頭。",
  "<b>뼈</b>를 누르면 뼈를 움직일 수 있어요."
 ],
 "c5": [
  "<b>骨をタップ</b>→関節がふえる<br><b>関節をドラッグ</b>→曲がる<br><b>黄色の●をドラッグ</b>→つく場所が動く",
  "<b>Tap a bone</b> → adds a joint<br><b>Drag a joint</b> → bends<br><b>Drag a yellow ●</b> → moves where it attaches",
  "<b>點骨頭</b>→增加關節<br><b>拖曳關節</b>→彎曲<br><b>拖曳黃色●</b>→移動接上的位置",
  "<b>뼈를 탭</b>→관절 추가<br><b>관절을 드래그</b>→굽혀짐<br><b>노란 ●를 드래그</b>→붙는 곳 이동"
 ],
 "c6": [
  "腕は<b>長いほど遠くまで届く</b>けれど、<b>当たるまで時間がかかる</b>。関節が多いと当たる範囲が広い。ここに目安が出ます。",
  "Longer arms <b>reach farther</b> but <b>take longer to hit</b>. More joints mean a wider hit area. Stats show here.",
  "手<b>越長打得越遠</b>，但<b>命中要花比較久</b>。關節越多攻擊範圍越廣。這裡會顯示參考數值。",
  "팔이 <b>길수록 멀리 닿지만</b> <b>맞기까지 시간이 걸려요</b>. 관절이 많으면 맞는 범위가 넓어요. 여기에 기준이 나와요."
 ],
 "c7": [
  "「…」には<b>おてほん</b>・<b>左右コピー</b>（反対の腕・足にうつす）・<b>全部消す</b>があります。",
  "\"…\" has <b>Sample</b>, <b>Mirror copy</b> (copy to the other arm/leg) and <b>Erase</b>.",
  "「…」裡有<b>範例</b>、<b>左右複製</b>（複製到另一邊的手腳）、<b>全部清除</b>。",
  "\"…\"에는 <b>견본</b>·<b>좌우 복사</b> (반대쪽 팔·다리로 복사)·<b>모두 지우기</b>가 있어요."
 ],
 "c8": [
  "2本指で拡大もできます。パーツは ‹ › か、タブを横にスライドして切りかえ。できたら<b>完成！</b>",
  "Pinch with two fingers to zoom. Switch parts with ‹ › or by swiping the tabs. When finished, tap <b>Done!</b>",
  "兩指可以放大。部位用 ‹ › 或左右滑動分頁切換。畫好就按<b>完成！</b>",
  "두 손가락으로 확대도 돼요. 부위는 ‹ › 또는 탭을 옆으로 밀어서 전환. 다 되면 <b>완성!</b>"
 ],
 "quit": [
  "やめる",
  "Quit",
  "結束",
  "그만두기"
 ],
 "watching": [
  "観戦中",
  "Watching",
  "觀戰中",
  "관전 중"
 ],
 "jump": [
  "ジャンプ",
  "Jump",
  "跳",
  "점프"
 ],
 "punch": [
  "パンチ",
  "Punch",
  "出拳",
  "펀치"
 ],
 "gone_l": [
  "もげた",
  "lost",
  "斷了",
  "떨어짐"
 ],
 "bang1": [
  "バシッ",
  "WHAM",
  "啪",
  "퍽"
 ],
 "bang2": [
  "ドカッ",
  "BAM",
  "咚",
  "쾅"
 ],
 "bang3": [
  "ボコッ",
  "POW",
  "砰",
  "뻑"
 ],
 "bangC": [
  "ガツン!",
  "CRASH!",
  "轟!",
  "콰광!"
 ],
 "hit_pop": [
  "ヒット！",
  "Hit!",
  "命中！",
  "히트!"
 ],
 "ouch": [
  "いたっ！",
  "Ouch!",
  "好痛！",
  "아야!"
 ],
 "crit": [
  "クリティカル ",
  "Critical ",
  "爆擊 ",
  "크리티컬 "
 ],
 "squeeze": [
  "なかなか当たらないので、かべがせまくなってきた！",
  "Nobody is landing hits, so the walls are closing in!",
  "一直打不到，牆壁開始變窄了！",
  "좀처럼 안 맞아서 벽이 좁혀지기 시작했다!"
 ],
 "spurt": [
  "ラストスパート！<small>ダメージがどんどん上がる・かべがせまくなる</small>",
  "FINAL RUSH!<small>Damage up, walls closing in</small>",
  "最後衝刺！<small>傷害不斷提升・牆壁變窄</small>",
  "라스트 스퍼트!<small>대미지가 점점 오르고 벽이 좁아져요</small>"
 ],
 "part_off": [
  "{p}がもげた！",
  "{p} came off!",
  "{p}斷掉了！",
  "{p}이(가) 떨어졌다!"
 ],
 "draw": [
  "ひきわけ",
  "Draw",
  "平手",
  "무승부"
 ],
 "win_of": [
  "{name}のかち！",
  "{name} wins!",
  "{name}獲勝！",
  "{name} 승리!"
 ],
 "win": [
  "かち！",
  "You win!",
  "贏了！",
  "승리!"
 ],
 "lose": [
  "まけ…",
  "You lose…",
  "輸了…",
  "패배…"
 ],
 "timeup": [
  "時間切れ",
  "Time up",
  "時間到",
  "시간 초과"
 ],
 "tie_note": [
  "（本数が同じなので、残りの耐久で判定）",
  " (same number of limbs, decided by remaining durability)",
  "（數量相同，用剩餘耐久判定）",
  " (개수가 같아서 남은 내구도로 판정)"
 ],
 "res_line": [
  "残ったうで・あし　{a} {x}本 － {y}本 {b}",
  "Arms & legs left: {a} {x} – {y} {b}",
  "剩下的手腳　{a} {x}根 － {y}根 {b}",
  "남은 팔·다리  {a} {x}개 – {y}개 {b}"
 ],
 "auto_watch": [
  "つぎの試合が始まると、自動で見られます",
  "The next match will show automatically",
  "下一場開始時會自動觀看",
  "다음 경기가 시작되면 자동으로 보여요"
 ],
 "keep_one": [
  "相手のキャラをライバル帳に入れる",
  "Add their character to your Rivals",
  "把對手的角色加入對手簿",
  "상대 캐릭터를 라이벌 수첩에 넣기"
 ],
 "keep_both": [
  "2体ともライバル帳に入れる",
  "Add both characters to your Rivals",
  "兩個都加入對手簿",
  "둘 다 라이벌 수첩에 넣기"
 ],
 "keep_done": [
  "ライバル帳に入れました（CPUの相手に出てきます）",
  "Added to Rivals (they will show up as CPU opponents)",
  "已加入對手簿（會成為CPU的對手）",
  "라이벌 수첩에 넣었어요 (CPU 상대로 나와요)"
 ],
 "keep_done2": [
  "ライバル帳に入れました",
  "Added to Rivals",
  "已加入對手簿",
  "라이벌 수첩에 넣었어요"
 ],
 "save_fail": [
  "保存できませんでした",
  "Couldn't save",
  "無法儲存",
  "저장하지 못했어요"
 ],
 "save_draw": [
  "描いたキャラを保存する（IDがつく）",
  "Save your drawn character (get an ID)",
  "儲存畫好的角色（會有ID）",
  "그린 캐릭터 저장하기 (ID가 붙어요)"
 ],
 "saved": [
  "保存しました",
  "Saved",
  "已儲存",
  "저장했어요"
 ],
 "mode_now": [
  "いまのキャラで",
  "My character",
  "用現在的角色",
  "지금 캐릭터로"
 ],
 "mode_raku": [
  "らくがきバトル<small>ふたりで60秒で描く</small>",
  "Doodle battle<small>Both draw in 60s</small>",
  "塗鴉對戰<small>兩人60秒內畫好</small>",
  "낙서 배틀<small>둘이서 60초 안에 그리기</small>"
 ],
 "raku": [
  "らくがきバトル",
  "Doodle battle",
  "塗鴉對戰",
  "낙서 배틀"
 ],
 "ex_code": [
  "例：えし123",
  "e.g. eshi123",
  "例如：繪我123",
  "예: 에시123"
 ],
 "online_note": [
  "同じあいことばを入れた人と対戦します。3人目からは<b>観戦</b>になります（応援スタンプを送れます）。<br>あそびかたは、さきに入った人のほうになります。",
  "Play whoever enters the same passcode. From the 3rd person on, you <b>watch</b> (and can send cheer stamps).<br>The first person in picks the mode.",
  "和輸入相同暗號的人對戰。第3個人開始為<b>觀戰</b>（可以送加油貼圖）。<br>玩法依先進入的人為準。",
  "같은 암호를 입력한 사람과 대전해요. 3번째 사람부터는 <b>관전</b>이 돼요 (응원 스탬프를 보낼 수 있어요).<br>방식은 먼저 들어온 사람 쪽을 따라요."
 ],
 "no_char_room": [
  "この部屋は「いまのキャラで」対戦です。先にキャラをつくるか、IDでよんでね",
  "This room uses \"My character\". Make a character first, or load one by ID.",
  "這個房間是「用現在的角色」對戰。請先做角色，或用ID叫出。",
  "이 방은 \"지금 캐릭터로\" 대전이에요. 먼저 캐릭터를 만들거나 ID로 불러 주세요."
 ],
 "nobody": [
  "対戦している人がいなくなりました",
  "The players have left",
  "對戰的人都離開了",
  "대전하던 사람이 없어졌어요"
 ],
 "watch_n": [
  "👀 {n}人",
  "👀 {n}",
  "👀 {n}人",
  "👀 {n}명"
 ],
 "dodged_by": [
  "よけられた！",
  "Dodged!",
  "被閃開了！",
  "피했다!"
 ],
 "dodged": [
  "よけた！",
  "Dodge!",
  "閃開了！",
  "회피!"
 ],
 "watch_in2": [
  "観戦で入りました。つぎの試合を待っています…",
  "You joined as a spectator. Waiting for the next match…",
  "已用觀戰身分進入。等待下一場…",
  "관전으로 들어왔어요. 다음 경기를 기다리는 중…"
 ],
 "code_mode": [
  "{c}（{m}）",
  "{c} ({m})",
  "{c}（{m}）",
  "{c} ({m})"
 ],
 "dw_title0": [
  "ふたりが描いています",
  "Both players are drawing",
  "兩人正在畫",
  "두 사람이 그리는 중"
 ],
 "dw_msg0": [
  "描きおわったら、「せーの」で発表！",
  "When both are done, they are revealed at once!",
  "畫完就「預備」一起公開！",
  "다 그리면 \"하나 둘\"로 공개!"
 ],
 "dw_watch_msg": [
  "描きおわったら「せーの」で発表！",
  "When both are done, they are revealed at once!",
  "畫完就「預備」一起公開！",
  "다 그리면 \"하나 둘\"로 공개!"
 ],
 "draw60": [
  "60秒で描こう！ 時間になったら自動で完成",
  "Draw in 60 seconds! It finishes automatically when time is up",
  "60秒內畫好！時間到就自動完成",
  "60초 안에 그리자! 시간이 되면 자동으로 완성"
 ],
 "dw_wait": [
  "あいてが描きおわるのを待っています…",
  "Waiting for your opponent to finish drawing…",
  "等待對手畫完…",
  "상대가 다 그리기를 기다리는 중…"
 ],
 "rv_ready": [
  "せーの…",
  "Ready…",
  "預備…",
  "하나, 둘…"
 ],
 "rv_go": [
  "ドン！",
  "Reveal!",
  "登登！",
  "짠!"
 ],
 "sv_title": [
  "キャラにIDをつける",
  "Get an ID for your character",
  "為角色取得ID",
  "캐릭터에 ID 붙이기"
 ],
 "sv_title_raku": [
  "描いたキャラを保存",
  "Save your drawn character",
  "儲存畫好的角色",
  "그린 캐릭터 저장"
 ],
 "author": [
  "作者名",
  "Author",
  "作者名",
  "작가 이름"
 ],
 "sv_pub": [
  "「みんなのキャラ」に公開する",
  "Show it in \"Everyone's characters\"",
  "公開到「大家的角色」",
  "\"모두의 캐릭터\"에 공개하기"
 ],
 "sv_mine": [
  "自分のキャラにする",
  "Use as my character",
  "設為自己的角色",
  "내 캐릭터로 하기"
 ],
 "sv_hint": [
  "IDを教えると、だれでもこのキャラを使えます。公開すると、IDを知らない人も一覧から使えます。",
  "Anyone with the ID can use this character. If public, people without the ID can use it from the list too.",
  "告訴別人ID，誰都能用這個角色。公開的話，不知道ID的人也能從列表使用。",
  "ID를 알려 주면 누구나 이 캐릭터를 쓸 수 있어요. 공개하면 ID를 모르는 사람도 목록에서 쓸 수 있어요."
 ],
 "sv_ok": [
  "保存してIDをもらう",
  "Save & get ID",
  "儲存並取得ID",
  "저장하고 ID 받기"
 ],
 "sv_skip": [
  "IDなしで使う",
  "Use without an ID",
  "不取得ID直接用",
  "ID 없이 쓰기"
 ],
 "sv_nosave": [
  "保存しない",
  "Don't save",
  "不儲存",
  "저장 안 함"
 ],
 "sv_saving": [
  "保存しています…",
  "Saving…",
  "儲存中…",
  "저장하는 중…"
 ],
 "sv_fail": [
  "保存できませんでした。通信を確認してね",
  "Couldn't save. Check your connection.",
  "無法儲存。請確認網路連線。",
  "저장하지 못했어요. 통신을 확인해 주세요."
 ],
 "sv_id_l": [
  "このキャラのID",
  "This character's ID",
  "這個角色的ID",
  "이 캐릭터의 ID"
 ],
 "copy_id": [
  "IDをコピー",
  "Copy ID",
  "複製ID",
  "ID 복사"
 ],
 "sv_warn": [
  "スクショかメモをしておくと、機種変更しても戻せます",
  "Take a screenshot or note it down so you can get it back on a new phone",
  "截圖或記下來，換手機也能找回來",
  "스크린샷이나 메모를 해 두면 기기를 바꿔도 되찾을 수 있어요"
 ],
 "find_title": [
  "IDでキャラをよぶ",
  "Load a character by ID",
  "用ID叫出角色",
  "ID로 캐릭터 부르기"
 ],
 "id_ph": [
  "英数字8文字",
  "8 letters/numbers",
  "8位英數字",
  "영문·숫자 8자"
 ],
 "call": [
  "よぶ",
  "Load",
  "叫出",
  "부르기"
 ],
 "my_ids": [
  "このスマホでつくったキャラ",
  "Characters made on this device",
  "用這支手機做的角色",
  "이 폰에서 만든 캐릭터"
 ],
 "pub_mark": [
  "（公開）",
  " (public)",
  "（公開）",
  " (공개)"
 ],
 "deleted": [
  "（削除ずみ）",
  " (deleted)",
  "（已刪除）",
  " (삭제됨)"
 ],
 "id_bad": [
  "IDは英数字8文字です",
  "An ID is 8 letters/numbers",
  "ID是8位英數字",
  "ID는 영문·숫자 8자예요"
 ],
 "id_bad2": [
  "IDは英数字8文字です（0・1・O・I・L は使われていません）",
  "An ID is 8 letters/numbers (0, 1, O, I, L are not used)",
  "ID是8位英數字（不使用0、1、O、I、L）",
  "ID는 영문·숫자 8자예요 (0·1·O·I·L은 쓰지 않아요)"
 ],
 "not_found": [
  "見つかりませんでした",
  "Not found",
  "找不到",
  "찾지 못했어요"
 ],
 "gal_title": [
  "みんなのキャラ",
  "Everyone's characters",
  "大家的角色",
  "모두의 캐릭터"
 ],
 "gal_new": [
  "新しい順",
  "Newest",
  "最新",
  "최신순"
 ],
 "gal_pop": [
  "人気順",
  "Popular",
  "人氣",
  "인기순"
 ],
 "gal_more": [
  "もっと見る",
  "Show more",
  "看更多",
  "더 보기"
 ],
 "loading": [
  "読みこんでいます…",
  "Loading…",
  "載入中…",
  "불러오는 중…"
 ],
 "by": [
  "作：{a}",
  "by {a}",
  "作者：{a}",
  "작가: {a}"
 ],
 "uses": [
  "使われた {n}回",
  "Used {n}×",
  "被用了 {n}次",
  "사용 {n}회"
 ],
 "gal_empty": [
  "まだ公開されたキャラがいません。キャラを完成させるときに「公開する」をえらぶと、ここにのります",
  "No public characters yet. Choose \"Show it\" when you finish a character and it will appear here.",
  "還沒有公開的角色。完成角色時選「公開」，就會出現在這裡。",
  "아직 공개된 캐릭터가 없어요. 캐릭터를 완성할 때 \"공개하기\"를 고르면 여기에 실려요."
 ],
 "load_fail": [
  "読みこめませんでした",
  "Couldn't load",
  "無法載入",
  "불러오지 못했어요"
 ],
 "cd_use": [
  "自分のキャラにする",
  "Use as my character",
  "設為自己的角色",
  "내 캐릭터로 하기"
 ],
 "cd_cpu": [
  "CPUの相手にして戦う",
  "Fight it as a CPU opponent",
  "當作CPU對手來對戰",
  "CPU 상대로 싸우기"
 ],
 "cd_keep": [
  "ライバル帳に入れる",
  "Add to Rivals",
  "加入對手簿",
  "라이벌 수첩에 넣기"
 ],
 "report": [
  "通報する",
  "Report",
  "檢舉",
  "신고하기"
 ],
 "reported": [
  "通報ずみ",
  "Reported",
  "已檢舉",
  "신고함"
 ],
 "report_sure": [
  "もう一度押すと通報",
  "Tap again to report",
  "再按一次就檢舉",
  "한 번 더 누르면 신고"
 ],
 "report_done": [
  "通報しました",
  "Reported",
  "已檢舉",
  "신고했어요"
 ],
 "report_fail": [
  "通報できませんでした",
  "Couldn't report",
  "無法檢舉",
  "신고하지 못했어요"
 ],
 "del_char": [
  "このキャラを消す",
  "Delete this character",
  "刪除這個角色",
  "이 캐릭터 지우기"
 ],
 "del_sure": [
  "もう一度押すと消えます",
  "Tap again to delete",
  "再按一次就刪除",
  "한 번 더 누르면 지워져요"
 ],
 "del_done": [
  "キャラを消しました",
  "Character deleted",
  "已刪除角色",
  "캐릭터를 지웠어요"
 ],
 "del_fail": [
  "消せませんでした",
  "Couldn't delete",
  "無法刪除",
  "지우지 못했어요"
 ],
 "cd_meta": [
  "ID {id}　作：{a}　使われた回数 {n}",
  "ID {id} · by {a} · used {n}×",
  "ID {id}　作者：{a}　被用次數 {n}",
  "ID {id} · 작가: {a} · 사용 {n}회"
 ],
 "use_done": [
  "「{name}」を自分のキャラにしました",
  "\"{name}\" is now your character",
  "已將「{name}」設為自己的角色",
  "\"{name}\"을(를) 내 캐릭터로 했어요"
 ],
 "cd_need": [
  "先に自分のキャラをつくるか、「自分のキャラにする」をえらんでね",
  "Make your own character first, or choose \"Use as my character\"",
  "請先做自己的角色，或選「設為自己的角色」",
  "먼저 내 캐릭터를 만들거나 \"내 캐릭터로 하기\"를 골라 주세요"
 ],
 "err_prep": [
  "通信の準備ができていません",
  "Online features are not ready",
  "連線功能尚未準備好",
  "통신 준비가 되지 않았어요"
 ],
 "err_big": [
  "絵が大きすぎて保存できません（色をぬる所を少し減らしてね）",
  "The drawing is too big to save (paint a little less area)",
  "圖太大無法儲存（請減少一點塗色的地方）",
  "그림이 너무 커서 저장할 수 없어요 (칠한 곳을 조금 줄여 주세요)"
 ],
 "err_noid": [
  "IDがつくれませんでした。もう一度ためしてね",
  "Couldn't create an ID. Please try again.",
  "無法建立ID，請再試一次。",
  "ID를 만들지 못했어요. 다시 시도해 주세요."
 ],
 "gone_full": [
  "このキャラは、保管庫がいっぱいになったため削除されました（長く使われていなかったキャラから順に消えます）",
  "This character was removed because storage was full (characters unused the longest are removed first)",
  "這個角色因為保管庫滿了而被刪除（從最久沒用的角色開始刪除）",
  "이 캐릭터는 보관함이 가득 차서 삭제되었어요 (오래 안 쓴 캐릭터부터 지워져요)"
 ],
 "gone_del": [
  "このキャラは、作った人が削除しました",
  "This character was deleted by its creator",
  "這個角色已被作者刪除",
  "이 캐릭터는 만든 사람이 삭제했어요"
 ],
 "gone_nf": [
  "そのIDのキャラは見つかりませんでした（IDをたしかめてね）",
  "No character found with that ID (please check the ID)",
  "找不到這個ID的角色（請確認ID）",
  "그 ID의 캐릭터를 찾지 못했어요 (ID를 확인해 주세요)"
 ],
 "del_own": [
  "このキャラは、作ったスマホからだけ消せます",
  "This character can only be deleted from the phone that made it",
  "這個角色只能從製作它的手機刪除",
  "이 캐릭터는 만든 폰에서만 지울 수 있어요"
 ],
 "del_net": [
  "消せませんでした。通信を確認して、もう一度ためしてね",
  "Couldn't delete. Check your connection and try again.",
  "無法刪除。請確認網路後再試一次。",
  "지우지 못했어요. 통신을 확인하고 다시 시도해 주세요."
 ],
 "room_full": [
  "この部屋は観戦の人でいっぱいです（10人まで）",
  "This room is full of spectators (max 10)",
  "這個房間的觀戰人數已滿（最多10人）",
  "이 방은 관전자가 가득 찼어요 (10명까지)"
 ],
 "h1": [
  "<b>キャラをつくる</b>：頭と体・左うで・右うで・左あし・右あし（＋かざり2つ）を描きます。色は10色＋🎨で好きな色、ふとさは自由。「ペン」で描く、「ぬる」で線にかこまれた所をぬりつぶす、「けす」で消す。",
  "<b>Make a character</b>: draw the head & body, left arm, right arm, left leg and right leg (+ extras). 10 colors + 🎨 for any color, any size. \"Pen\" draws, \"Fill\" paints an area enclosed by lines, \"Erase\" erases.",
  "<b>做角色</b>：畫出頭和身體、左手、右手、左腳、右腳（＋裝飾）。顏色有10色＋🎨可選任意色，粗細自由。「筆」畫線、「填色」塗滿被線圍起來的地方、「擦掉」清除。",
  "<b>캐릭터 만들기</b>: 머리와 몸·왼팔·오른팔·왼다리·오른다리 (+장식)를 그려요. 색은 10가지 + 🎨로 원하는 색, 굵기는 자유. \"펜\"으로 그리고, \"채우기\"로 선에 둘러싸인 곳을 칠하고, \"지우개\"로 지워요."
 ],
 "h2": [
  "<b>骨</b>：うで・あしには、まっすぐな骨が入っています。骨をタップすると関節が増え、関節をドラッグすると曲がります（関節をタップで消す）。描いた絵は、近い骨にくっついて動きます。",
  "<b>Bones</b>: arms and legs have a straight bone. Tap a bone to add a joint, drag a joint to bend it (tap a joint to remove it). Your drawing sticks to the nearest bone and moves with it.",
  "<b>骨頭</b>：手和腳裡有直直的骨頭。點骨頭會增加關節，拖曳關節就會彎曲（點關節可刪除）。畫的圖會黏在最近的骨頭上一起動。",
  "<b>뼈</b>: 팔·다리에는 곧은 뼈가 들어 있어요. 뼈를 탭하면 관절이 늘고, 관절을 드래그하면 굽혀져요 (관절을 탭하면 삭제). 그린 그림은 가까운 뼈에 붙어서 움직여요."
 ],
 "h3": [
  "<b>うで</b>：骨が長いほど遠くまで届くけれど、当たるまで時間がかかる。関節が多いほど、当たる範囲が広くダメージも少し大きいけれど、やっぱり時間がかかる。",
  "<b>Arms</b>: longer bones reach farther but take longer to hit. More joints give a wider hit area and slightly more damage, but also take longer.",
  "<b>手</b>：骨頭越長打得越遠，但命中要花比較久。關節越多攻擊範圍越廣、傷害也稍微大一點，但一樣比較慢。",
  "<b>팔</b>: 뼈가 길수록 멀리 닿지만 맞기까지 시간이 걸려요. 관절이 많을수록 맞는 범위가 넓고 대미지도 조금 크지만, 역시 시간이 걸려요."
 ],
 "h4": [
  "<b>あし</b>：長いほど速く歩けて高くとべるけれど、体が大きくなって当たりやすい。関節が多いと、ふらふらしてまっすぐ歩けない（そのぶん当たりにくい）。",
  "<b>Legs</b>: longer legs walk faster and jump higher, but make your body bigger and easier to hit. More joints make you wobble and walk crooked (but harder to hit).",
  "<b>腳</b>：越長走得越快、跳得越高，但身體會變大、容易被打中。關節越多走路會搖搖晃晃走不直（相對地不容易被打中）。",
  "<b>다리</b>: 길수록 빨리 걷고 높이 뛰지만, 몸이 커져서 맞기 쉬워요. 관절이 많으면 휘청거려서 똑바로 못 걸어요 (그만큼 잘 안 맞아요)."
 ],
 "h5": [
  "<b>当たり</b>：攻撃が当たった腕・足が削れて、色が濃くなっていきます。0になるともげて吹っ飛びます。<b>頭</b>に当たると<b>クリティカル</b>（どこかの腕・足に大ダメージ＋少しよろける）。",
  "<b>Hits</b>: the arm or leg that gets hit wears down and darkens. At 0 it comes off and flies away. Hitting the <b>head</b> is a <b>critical</b> (big damage to some limb + a little stagger).",
  "<b>命中</b>：被打中的手腳會被削掉，顏色越來越深。變成0就會斷掉飛出去。打中<b>頭</b>就是<b>爆擊</b>（某隻手腳受到大傷害＋稍微踉蹌）。",
  "<b>타격</b>: 공격에 맞은 팔·다리가 깎이고 색이 진해져요. 0이 되면 떨어져서 날아가요. <b>머리</b>에 맞으면 <b>크리티컬</b> (어느 팔·다리에 큰 대미지 + 살짝 비틀거림)."
 ],
 "h6": [
  "<b>もげると</b>：足1本→けんけんで遅い／足0本→動けない。うで1本→攻撃の間かくが長い／うで0本→体当たりだけ。<b>4本ぜんぶもげたら負け</b>。",
  "<b>Losing limbs</b>: 1 leg → hop slowly / 0 legs → can't move. 1 arm → slower attacks / 0 arms → body slam only. <b>Lose all 4 and you lose</b>.",
  "<b>斷掉之後</b>：剩1隻腳→單腳跳很慢／0隻腳→不能動。剩1隻手→攻擊間隔變長／0隻手→只能用身體撞。<b>4隻全斷就輸了</b>。",
  "<b>떨어지면</b>: 다리 1개 → 깨금발로 느림 / 다리 0개 → 못 움직임. 팔 1개 → 공격 간격이 길어짐 / 팔 0개 → 몸통 박치기만. <b>4개 모두 떨어지면 패배</b>."
 ],
 "h7": [
  "<b>90秒</b>たったら、残った腕・足の数が多いほうの勝ち（同じなら残りの合計）。",
  "After <b>90 seconds</b>, whoever has more arms & legs left wins (if tied, total remaining durability).",
  "<b>90秒</b>後，剩下手腳數量多的一方獲勝（相同就比剩餘總和）。",
  "<b>90초</b>가 지나면 남은 팔·다리가 많은 쪽이 승리 (같으면 남은 합계)."
 ],
 "h8": [
  "<b>見かた</b>：キャラはいつも相手の方を向きます。足もとの矢印は歩いている向き。自分のまわりの白い円が、パンチが届く範囲（相手が入るとオレンジ）。相手の赤い円が光ったら、パンチが来る合図。",
  "<b>Reading the screen</b>: characters always face each other. The arrow at your feet shows where you're walking. The white circle around you is your punch range (orange when the opponent is inside). When the opponent's red circle flashes, a punch is coming.",
  "<b>看法</b>：角色總是面向對手。腳下的箭頭是走路的方向。自己周圍的白色圓圈是拳頭打得到的範圍（對手進來會變橘色）。對手的紅色圓圈發光，就是要出拳的信號。",
  "<b>보는 법</b>: 캐릭터는 항상 상대 쪽을 봐요. 발밑 화살표는 걷는 방향. 내 주위의 흰 원이 펀치가 닿는 범위 (상대가 들어오면 주황색). 상대의 빨간 원이 빛나면 펀치가 온다는 신호."
 ],
 "h9": [
  "<b>体力</b>：左上・右上のふせんの人形で、うで・あしの残りが分かります（緑→黄→赤、灰色はもげた）。",
  "<b>Health</b>: the doll on the sticky notes at the top left/right shows your remaining arms & legs (green → yellow → red, gray = lost).",
  "<b>體力</b>：左上、右上便利貼上的小人可以看出手腳剩多少（綠→黃→紅，灰色是斷了）。",
  "<b>체력</b>: 왼쪽 위·오른쪽 위 포스트잇 인형으로 팔·다리가 얼마나 남았는지 알 수 있어요 (초록→노랑→빨강, 회색은 떨어짐)."
 ],
 "h10": [
  "<b>操作</b>：スマホは画面の左側をドラッグして移動、右下でパンチとジャンプ。ジャンプ中にパンチすると、ふりおろし攻撃。PCは 矢印/WASD で移動、J でパンチ、K かスペースでジャンプ。",
  "<b>Controls</b>: on a phone, drag the left side of the screen to move; punch and jump at the bottom right. Punch while jumping for a downward strike. On PC, arrows/WASD to move, J to punch, K or Space to jump.",
  "<b>操作</b>：手機拖曳畫面左側移動，右下角出拳和跳。跳起來時出拳是下劈攻擊。電腦用方向鍵/WASD移動，J出拳，K或空白鍵跳。",
  "<b>조작</b>: 폰은 화면 왼쪽을 드래그해서 이동, 오른쪽 아래에서 펀치와 점프. 점프 중에 펀치하면 내려찍기 공격. PC는 방향키/WASD로 이동, J로 펀치, K나 스페이스로 점프."
 ],
 "h11": [
  "<b>キャラID</b>：完成すると、英数字8文字のIDがもらえます。IDを入れると、だれでもそのキャラを再現して使えます（自分のキャラにする・CPUの相手にする）。直して完成すると新しいIDになり、元のキャラは残ります。IDはスクショかメモをしておくと、機種変更しても戻せます。",
  "<b>Character ID</b>: when finished you get an 8-character ID. Anyone who enters it can recreate and use the character (as their own or as a CPU opponent). Editing and finishing again gives a new ID; the original stays. Screenshot or note your ID to get it back on a new phone.",
  "<b>角色ID</b>：完成後會得到8位英數字ID。輸入ID，誰都能重現並使用那個角色（設為自己的角色、當作CPU對手）。修改後完成會變成新ID，原本的角色會保留。把ID截圖或記下來，換手機也能找回。",
  "<b>캐릭터 ID</b>: 완성하면 영문·숫자 8자 ID를 받아요. ID를 넣으면 누구나 그 캐릭터를 재현해서 쓸 수 있어요 (내 캐릭터로 하기·CPU 상대로 하기). 고쳐서 완성하면 새 ID가 되고, 원래 캐릭터는 남아요. ID를 스크린샷이나 메모해 두면 기기를 바꿔도 되찾을 수 있어요."
 ],
 "h12": [
  "<b>みんなのキャラ</b>：「公開する」をえらんだキャラの一覧です（新しい順・人気順）。変な絵は「通報」できます。自分のキャラは、作ったスマホから消せます。しばらく使われていないキャラは、いっぱいになると古い順に消えます。",
  "<b>Everyone's characters</b>: a list of characters marked public (newest / popular). You can \"Report\" inappropriate drawings. You can delete your own characters from the phone you made them on. When storage fills up, characters unused for a while are removed oldest first.",
  "<b>大家的角色</b>：選了「公開」的角色列表（最新、人氣）。奇怪的圖可以「檢舉」。自己的角色可以從製作的手機刪除。很久沒被使用的角色，滿了之後會從舊的開始刪除。",
  "<b>모두의 캐릭터</b>: \"공개하기\"를 고른 캐릭터 목록이에요 (최신순·인기순). 이상한 그림은 \"신고\"할 수 있어요. 내 캐릭터는 만든 폰에서 지울 수 있어요. 한동안 안 쓴 캐릭터는 가득 차면 오래된 순서로 지워져요."
 ],
 "h13": [
  "<b>らくがきバトル</b>：あいことば対戦でえらべます。ふたり同時に<b>60秒</b>で描いて（おたがいに見えない）、「せーの」で発表してから戦います。体を描けなかったら黒い棒人間で戦います。",
  "<b>Doodle battle</b>: choose it in a passcode battle. Both draw at the same time in <b>60 seconds</b> (you can't see each other's), reveal them together, then fight. If you didn't draw a body, you fight as a black stick figure.",
  "<b>塗鴉對戰</b>：在暗號對戰中可以選。兩人同時在<b>60秒</b>內畫（看不到對方的），「預備」一起公開後開打。沒畫身體的話就用黑色火柴人戰鬥。",
  "<b>낙서 배틀</b>: 암호 대전에서 고를 수 있어요. 둘이 동시에 <b>60초</b> 동안 그리고 (서로 안 보여요), \"하나 둘\"로 공개한 뒤 싸워요. 몸을 못 그렸으면 검은 막대 인간으로 싸워요."
 ],
 "h14": [
  "<b>観戦</b>：同じあいことばに3人目から入ると観戦になります（10人まで）。応援スタンプを送れます。",
  "<b>Spectating</b>: from the 3rd person on the same passcode, you watch (up to 10). You can send cheer stamps.",
  "<b>觀戰</b>：第3個人開始用相同暗號進入就是觀戰（最多10人）。可以送加油貼圖。",
  "<b>관전</b>: 같은 암호로 3번째 사람부터 들어오면 관전이 돼요 (10명까지). 응원 스탬프를 보낼 수 있어요."
 ],
 "h15": [
  "<b>かざり</b>：しっぽ・羽・角など、4つまで描けます。体の前に出すか後ろにするか選べます。当たり判定はなく、ゆらゆらゆれます。",
  "<b>Extras</b>: draw up to 4, like a tail, wings or horns. Choose whether each is in front of or behind the body. They have no hitbox and sway around.",
  "<b>裝飾</b>：尾巴、翅膀、角等，最多可以畫4個。可以選在身體前面還是後面。沒有碰撞判定，會搖搖晃晃。",
  "<b>장식</b>: 꼬리·날개·뿔 등 4개까지 그릴 수 있어요. 몸 앞에 둘지 뒤에 둘지 고를 수 있어요. 판정은 없고 흔들흔들 흔들려요."
 ],
 "h16": [
  "<b>描く道具</b>：「図形」で直線・丸・四角、「スタンプ」で目・口・星など。2本指（PCはホイール）で拡大・移動できます。",
  "<b>Drawing tools</b>: \"Shape\" for lines, circles and squares; \"Stamp\" for eyes, mouths, stars and more. Two fingers (mouse wheel on PC) to zoom and pan.",
  "<b>繪圖工具</b>：「圖形」有直線、圓形、方形，「貼圖」有眼睛、嘴巴、星星等。兩指（電腦用滾輪）可以放大、移動。",
  "<b>그리기 도구</b>: \"도형\"으로 직선·원·사각형, \"스탬프\"로 눈·입·별 등. 두 손가락 (PC는 휠)으로 확대·이동할 수 있어요."
 ],
 "h17": [
  "<b>描くとき</b>：骨モードで黄色の●をドラッグすると、うで・あし・かざりのつく場所を動かせます（絵もいっしょに動く）。右上の「…」の「左右コピー」で反対がわにうつせます。",
  "<b>While drawing</b>: in Bones mode, drag a yellow ● to move where an arm, leg or extra attaches (the drawing moves too). \"Mirror copy\" in the \"…\" menu at the top right copies it to the other side.",
  "<b>畫圖時</b>：在骨頭模式拖曳黃色●，可以移動手、腳、裝飾接上的位置（圖也會一起動）。右上「…」裡的「左右複製」可以複製到另一邊。",
  "<b>그릴 때</b>: 뼈 모드에서 노란 ●를 드래그하면 팔·다리·장식이 붙는 곳을 옮길 수 있어요 (그림도 같이 움직여요). 오른쪽 위 \"…\"의 \"좌우 복사\"로 반대쪽에 옮길 수 있어요."
 ]
};
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.indexOf(q) >= 0) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; } } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'ja').toLowerCase();
    if (n.indexOf('ja') === 0) return 'ja'; if (n.indexOf('ko') === 0) return 'ko'; if (n.indexOf('zh') === 0) return 'zh'; return 'en';
  }
  var L = pick();
  function t(k, v) {
    var row = D[k]; var i = LANGS.indexOf(L);
    var s = row ? (row[i] != null ? row[i] : row[0]) : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  // 題字・本文の字がないことばだけ、そのことば用のフォントを読みこむ（手書きノートの雰囲気に近い丸文字）
  var FONTS = { ko: 'Black+Han+Sans&family=Jua', zh: 'Chiron+GoRound+TC:wght@800;900' };
  function langFont() {
    var f = FONTS[L]; if (!f || document.getElementById('lf-' + L)) return;
    var l = document.createElement('link'); l.id = 'lf-' + L; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f + '&display=swap'; document.head.appendChild(l);
  }
  function apply() {
    langFont();
    var de = document.documentElement;
    de.lang = L === 'zh' ? 'zh-Hant' : L; de.setAttribute('data-lang', L);
    document.querySelectorAll('[data-i]').forEach(function (e) { e.textContent = t(e.dataset.i); });
    document.querySelectorAll('[data-ih]').forEach(function (e) { e.innerHTML = t(e.dataset.ih); });
    document.querySelectorAll('[data-ip]').forEach(function (e) { e.placeholder = t(e.dataset.ip); });
    document.querySelectorAll('[data-ia]').forEach(function (e) { e.setAttribute('aria-label', t(e.dataset.ia)); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === L ? 'true' : 'false'); });
    document.title = t('doc_title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('doc_desc'));
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: L })); } catch (e) {}
  }
  function set(l) { if (LANGS.indexOf(l) < 0) return; L = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }
  function bind() {
    document.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    apply();
  }
  window.I18N = { t: t, set: set, apply: apply, get lang() { return L; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
