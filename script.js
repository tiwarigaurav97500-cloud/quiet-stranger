const AI_BACKEND_URL = "https://quiet-stranger-backend.vercel.app/api/stranger";
const USE_REAL_AI_STRANGER = true;

/* =========================================================
   FULL FINAL UPDATED SCRIPT.JS — PART 1/4
   Core setup + lock + overlays + audio/video + notes start
========================================================= */

/* =========================================================
   LOCK SCREEN
========================================================= */
function unlock(){
  const p = document.getElementById("pass")?.value || "";

  if(p === "1234"){
    const lockscreen = document.getElementById("lockscreen");
    const main = document.getElementById("main");

    if(lockscreen) lockscreen.style.display = "none";
    if(main) main.style.display = "block";

    showHeadphoneOverlay();
  } else {
    alert("Wrong Password");
  }
}

/* =========================================================
   HEADPHONE OVERLAY
========================================================= */
let headphoneTimer = null;

function showHeadphoneOverlay(){
  const overlay = document.getElementById("headphoneOverlay");
  if(!overlay) return;

  overlay.style.display = "flex";

  clearTimeout(headphoneTimer);
  headphoneTimer = setTimeout(() => {
    closeHeadphoneOverlay();
  }, 4200);
}

function closeHeadphoneOverlay(){
  const overlay = document.getElementById("headphoneOverlay");
  if(overlay) overlay.style.display = "none";

  clearTimeout(headphoneTimer);

  const bg = getBGMusic();
  const video = getVideoPlayer();
  const song = getMusicPlayer();
  const scene = getScenePlayer();

  if(bg && (!video || video.paused) && (!song || song.paused) && (!scene || scene.paused)){
    bg.volume = 0.25;
    bg.play().catch(() => {});
  }
}

/* =========================================================
   HUG OVERLAY
========================================================= */
let hugTimer = null;
let hugSeconds = 8;

function openHugOverlay(){
  const overlay = document.getElementById("hugOverlay");
  const count = document.getElementById("hugCountText");
  const line = document.getElementById("hugLine");

  hugSeconds = 8;

  if(count) count.innerText = `${hugSeconds} seconds of quiet warmth`;
  if(line) line.innerText = "I’m holding on gently. Breathe with me.";
  if(overlay) overlay.style.display = "flex";

  if(navigator.vibrate){
    navigator.vibrate([120, 80, 120]);
  }

  clearInterval(hugTimer);

  hugTimer = setInterval(() => {
    hugSeconds--;

    if(count && hugSeconds > 0){
      count.innerText = `${hugSeconds} seconds of quiet warmth`;
    }

    if(line){
      if(hugSeconds >= 6){
        line.innerText = "I’m holding on gently. Breathe with me.";
      } else if(hugSeconds >= 3){
        line.innerText = "You do not have to fix anything in this moment.";
      } else {
        line.innerText = "Stay here. Let your body soften a little.";
      }
    }

    if(hugSeconds <= 0){
      clearInterval(hugTimer);
      if(count) count.innerText = "You can stay longer if you want.";
    }
  }, 1000);
}

function closeHugOverlay(){
  const overlay = document.getElementById("hugOverlay");
  if(overlay) overlay.style.display = "none";
  clearInterval(hugTimer);
}

/* =========================================================
   BREATHING TEXT
========================================================= */
const breathSteps = ["Inhale...", "Hold...", "Exhale..."];
let breathIndex = 0;

setInterval(() => {
  const el = document.getElementById("breathText");
  if(el){
    el.innerText = breathSteps[breathIndex];
    breathIndex = (breathIndex + 1) % breathSteps.length;
  }
}, 1400);

/* =========================================================
   AUDIO / VIDEO HELPERS
========================================================= */
function getBGMusic(){
  return document.getElementById("bgmusic");
}

function getScenePlayer(){
  return document.getElementById("scenePlayer");
}

function getMusicPlayer(){
  return document.getElementById("musicPlayer");
}

function getVideoPlayer(){
  return document.getElementById("memoryVideo");
}

function stopAmbient(){
  const bg = getBGMusic();
  if(bg) bg.pause();
}

function resumeAmbient(){
  const bg = getBGMusic();
  const song = getMusicPlayer();
  const scene = getScenePlayer();
  const video = getVideoPlayer();

  if(!bg) return;

  if((song && !song.paused) || (scene && !scene.paused) || (video && !video.paused)){
    return;
  }

  bg.volume = 0.25;
  bg.play().catch(() => {});
}

function pauseAllActiveMedia(except = ""){
  const bg = getBGMusic();
  const song = getMusicPlayer();
  const scene = getScenePlayer();
  const video = getVideoPlayer();

  if(except !== "song" && song && !song.paused) song.pause();
  if(except !== "scene" && scene && !scene.paused) scene.pause();
  if(except !== "video" && video && !video.paused) video.pause();
  if(except !== "ambient" && bg && !bg.paused) bg.pause();
}

/* =========================================================
   MOBILE-SAFE VIDEO + AUDIO SYNC
========================================================= */
function setupAudioSync(){
  const bg = getBGMusic();
  const song = getMusicPlayer();
  const scene = getScenePlayer();
  const video = getVideoPlayer();

  if(song){
    song.addEventListener("play", () => stopAmbient());
    song.addEventListener("pause", () => resumeAmbient());
    song.addEventListener("ended", () => resumeAmbient());
  }

  if(scene){
    scene.addEventListener("play", () => stopAmbient());
    scene.addEventListener("pause", () => resumeAmbient());
    scene.addEventListener("ended", () => resumeAmbient());
  }

  if(video){
    video.removeAttribute("autoplay");
    video.autoplay = false;
    video.controls = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "metadata";

    video.addEventListener("touchstart", () => {
      video.controls = true;
    }, { passive:true });

    video.addEventListener("play", () => {
      if(song && !song.paused) song.pause();
      if(scene && !scene.paused) scene.pause();
      if(bg && !bg.paused) bg.pause();
    });

    video.addEventListener("pause", () => {
      setTimeout(() => resumeAmbient(), 300);
    });

    video.addEventListener("ended", () => {
      setTimeout(() => resumeAmbient(), 300);
    });

    video.addEventListener("error", () => {
      console.log("Video error. Check GitHub path: ./videos/soft-memory.mp4");
    });
  }

  document.addEventListener("click", () => {
    if(bg && (!song || song.paused) && (!scene || scene.paused) && (!video || video.paused)){
      bg.volume = 0.25;
      bg.play().catch(() => {});
    }
  }, { once:true });
}

function changeSong(){
  const player = getMusicPlayer();
  const select = document.getElementById("songSelect");

  if(!player || !select) return;

  pauseAllActiveMedia("song");

  player.src = select.value;
  player.play().catch(() => {});
}

/* =========================================================
   MOOD COMFORT SPACE
========================================================= */
let currentComfortMood = null;
let moodComfortSeconds = 30;
let moodComfortInterval = null;
let moodComfortProgress = null;

const comfortMap = {
  sad: {
    title: "Even in dark days, light can still find you",
    line: "Stay with the little lights. Some miracles return quietly, not loudly.",
    sceneClass: "mood-scene-sad",
    audio: "mood_sad.mp3",
    duration: 32
  },

  lonely: {
    title: "Distance does not mean you are alone",
    line: "Watch the two lights slowly come closer. Some company arrives softly.",
    sceneClass: "mood-scene-lonely",
    audio: "mood_lonely.mp3",
    duration: 32
  },

  proud: {
    title: "Let your light rise fully",
    line: "This glow is yours. You are allowed to feel proud of how far you came.",
    sceneClass: "mood-scene-proud",
    audio: "mood_proud.mp3",
    duration: 30
  },

  stressed: {
    title: "You are inside a safe breathing space",
    line: "Let the dome breathe for you. The moment can become smaller and softer.",
    sceneClass: "mood-scene-stressed",
    audio: "mood_stressed.mp3",
    duration: 30
  }
};

function startMoodComfort(type){
  const data = comfortMap[type];
  if(!data) return;

  currentComfortMood = type;

  const overlay = document.getElementById("moodOverlay");
  const stage = document.getElementById("moodSceneStage");
  const title = document.getElementById("moodSceneTitle");
  const line = document.getElementById("moodSceneLine");
  const timer = document.getElementById("moodSceneTimer");
  const progress = document.getElementById("sceneProgressBar");
  const scenePlayer = getScenePlayer();

  pauseAllActiveMedia("scene");

  if(stage){
    stage.className = "mood-scene-stage mood-scene-neutral";
    void stage.offsetWidth;
    stage.className = "mood-scene-stage " + data.sceneClass;
  }

  if(title) title.innerText = data.title;
  if(line) line.innerText = data.line;
  if(timer) timer.innerText = `${data.duration} seconds of softness`;
  if(progress) progress.style.width = "0%";

  moodComfortSeconds = data.duration;

  if(overlay) overlay.style.display = "flex";

  if(scenePlayer){
    scenePlayer.pause();
    scenePlayer.src = data.audio;
    scenePlayer.currentTime = 0;
    scenePlayer.volume = 0.6;
    scenePlayer.play().catch(() => {});
    scenePlayer.onended = () => stopMoodComfort();
  }

  clearInterval(moodComfortInterval);
  clearInterval(moodComfortProgress);

  moodComfortInterval = setInterval(() => {
    moodComfortSeconds--;

    if(timer && moodComfortSeconds >= 0){
      timer.innerText = `${moodComfortSeconds} seconds of softness`;
    }

    if(moodComfortSeconds <= 0){
      stopMoodComfort();
    }
  }, 1000);

  let progressValue = 0;

  moodComfortProgress = setInterval(() => {
    progressValue += (100 / (data.duration * 10));
    if(progress){
      progress.style.width = Math.min(progressValue, 100) + "%";
    }
  }, 100);
}

function replayMoodComfort(){
  if(currentComfortMood){
    startMoodComfort(currentComfortMood);
  }
}

function stopMoodComfort(){
  const overlay = document.getElementById("moodOverlay");
  const scenePlayer = getScenePlayer();
  const progress = document.getElementById("sceneProgressBar");
  const timer = document.getElementById("moodSceneTimer");

  if(overlay) overlay.style.display = "none";

  if(scenePlayer){
    scenePlayer.pause();
    scenePlayer.currentTime = 0;
  }

  clearInterval(moodComfortInterval);
  clearInterval(moodComfortProgress);

  if(progress) progress.style.width = "0%";
  if(timer) timer.innerText = "30 seconds of softness";

  currentComfortMood = null;
  resumeAmbient();
}

/* =========================================================
   NOTES WITH FOLDERS
========================================================= */
let currentNotesFolder = null;

function getNotesFolders(){
  return JSON.parse(localStorage.getItem("notesFolders")) || [];
}

function saveNotesFolders(folders){
  localStorage.setItem("notesFolders", JSON.stringify(folders));
}

function createNotesFolder(){
  const input = document.getElementById("newNotesFolderName");
  if(!input) return;

  const name = input.value.trim();

  if(!name){
    alert("Please enter a notes folder name");
    return;
  }

  const folders = getNotesFolders();

  if(folders.includes(name)){
    alert("Notes folder already exists");
    return;
  }

  folders.push(name);
  saveNotesFolders(folders);
  localStorage.setItem("note_" + name, "");

  input.value = "";
  loadNotesFolders();
  openNotesFolder(name);
}

function loadNotesFolders(){
  const list = document.getElementById("notesFolderList");
  if(!list) return;

  list.innerHTML = "";

  const folders = getNotesFolders();

  if(folders.length === 0){
    list.innerHTML = `<div class="mood-entry">No notes folders yet.</div>`;
    return;
  }

  folders.forEach(folder => {
    const row = document.createElement("div");
    row.className = "folder-row";

    const openBtn = document.createElement("button");
    openBtn.className = "folder-name-btn" + (folder === currentNotesFolder ? " active" : "");
    openBtn.innerText = folder;
    openBtn.onclick = () => openNotesFolder(folder);

    const actions = document.createElement("div");
    actions.className = "folder-actions";

    const renameBtn = document.createElement("button");
    renameBtn.className = "mini-btn";
    renameBtn.innerText = "Rename";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      renameNotesFolder(folder);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "mini-btn mini-danger";
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteNotesFolder(folder);
    };

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(openBtn);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function openNotesFolder(name){
  currentNotesFolder = name;

  const title = document.getElementById("currentNotesFolderTitle");
  const notes = document.getElementById("notes");

  if(title) title.innerText = name;
  if(notes) notes.value = localStorage.getItem("note_" + name) || "";

  localStorage.setItem("currentNotesFolder", name);
  loadNotesFolders();
}

function renameNotesFolder(oldName){
  const newName = prompt("Rename notes folder:", oldName);
  if(!newName) return;

  const trimmed = newName.trim();

  if(!trimmed || trimmed === oldName) return;

  const folders = getNotesFolders();

  if(folders.includes(trimmed)){
    alert("A notes folder with that name already exists.");
    return;
  }

  const updated = folders.map(f => f === oldName ? trimmed : f);
  saveNotesFolders(updated);

  const oldData = localStorage.getItem("note_" + oldName) || "";
  localStorage.setItem("note_" + trimmed, oldData);
  localStorage.removeItem("note_" + oldName);

  if(currentNotesFolder === oldName){
    currentNotesFolder = trimmed;
    localStorage.setItem("currentNotesFolder", trimmed);
  }

  loadNotesFolders();
  openNotesFolder(trimmed);
}

function deleteNotesFolder(folderName){
  const ok = confirm(`Delete notes folder "${folderName}"?`);
  if(!ok) return;

  const folders = getNotesFolders().filter(f => f !== folderName);
  saveNotesFolders(folders);
  localStorage.removeItem("note_" + folderName);

  if(currentNotesFolder === folderName){
    currentNotesFolder = null;
    localStorage.removeItem("currentNotesFolder");

    const title = document.getElementById("currentNotesFolderTitle");
    const notes = document.getElementById("notes");

    if(title) title.innerText = "No notes folder selected";
    if(notes) notes.value = "";
  }

  loadNotesFolders();
}

function renameCurrentNotesFolder(){
  if(!currentNotesFolder){
    alert("Open a notes folder first");
    return;
  }

  renameNotesFolder(currentNotesFolder);
}

function deleteCurrentNotesFolder(){
  if(!currentNotesFolder){
    alert("Open a notes folder first");
    return;
  }

  deleteNotesFolder(currentNotesFolder);
}

function saveCurrentNoteFolder(){
  if(!currentNotesFolder){
    alert("Please create or open a notes folder first");
    return;
  }

  const notes = document.getElementById("notes");
  localStorage.setItem("note_" + currentNotesFolder, notes.value);
  alert("Note saved 💛");
}

function loadSavedNotes(){
  loadNotesFolders();

  const lastFolder = localStorage.getItem("currentNotesFolder");
  const folders = getNotesFolders();

  if(lastFolder && folders.includes(lastFolder)){
    openNotesFolder(lastFolder);
  } else if(folders.length > 0){
    openNotesFolder(folders[0]);
  }
}

function autoSaveNotes(){
  if(!currentNotesFolder) return;

  const notes = document.getElementById("notes");

  if(notes){
    localStorage.setItem("note_" + currentNotesFolder, notes.value);
  }
}
/* =========================================================
   FULL FINAL UPDATED SCRIPT.JS — PART 2/4
   Mood tracker + diary + theme + stranger base/storage
========================================================= */

/* =========================================================
   MOOD TRACKER
========================================================= */
function getTodayDate(){
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMoodAdvice(mood){
  const adviceMap = {
    "😊 Good": `Aaj aapka mood achha lag raha hai 💛
Is feeling ko hold kijiye.
• aaj ki ek achhi baat note kijiye
• kisi pasand ki song suniye
• thoda sa fresh air lijiye
• aaj khud ko appreciate kijiye`,

    "😐 Okay": `Aaj ka mood bas okay hai, aur wo bhi bilkul valid hai.
Har din amazing feel karna zaroori nahi hota.
• aap thoda paani pee lijiye
• 5 deep breaths lijiye
• ek chhota easy task kijiye
• khud par pressure mat daliye`,

    "😔 Low": `Agar aap low feel kar rahi hain, to aaj softness zaroori hai.
Aaj aapko khud se pyaar se baat karni hai.
• aap thoda rest lijiye
• jo feel ho raha hai usko dabaaiye mat
• ek soft song suniye
• bas next 10 minutes ko easy banaiye`,

    "😣 Stressed": `Agar aap stressed feel kar rahi hain, to pehle body ko calm karte hain.
Sab kuch ek saath solve karna zaroori nahi hai.
• jaw aur shoulders relax kijiye
• 4 sec inhale, 6 sec exhale kijiye
• top 3 tensions likhiye
• sirf next small step par focus kijiye`
  };

  return adviceMap[mood] || `Aaj aap jo bhi feel kar rahi hain, wo important hai.`;
}

function getMoodActions(mood){
  const actions = {
    "😊 Good": `Try this:
• aaj ki ek achhi memory save kijiye
• kisi ko silently thanks feel kijiye
• apne aap ko boliye: “aaj maine achha handle kiya”`,

    "😐 Okay": `Gentle reset:
• aap seedha baith jaiye
• shoulders halka sa relax kijiye
• 3 slow breaths lijiye
• khud se boliye: “okay bhi enough hai”`,

    "😔 Low": `Soft care:
• blanket ya pillow ke saath 2 min rest kijiye
• ek line likhiye: “abhi sabse heavy kya lag raha hai?”
• aapko aaj strong dikhna zaroori nahi hai`,

    "😣 Stressed": `Stress release:
• screen se 1 min ke liye nazar hataiye
• hands aur shoulders shake out kijiye
• ek paper par likhiye: abhi sabse zaroori ek kaam kya hai?
• baaki sab baad me`
  };

  return actions[mood] || `Aap thoda slow ho jaiye.`;
}

function getMoodBuddy(mood){
  const map = {
    "😊 Good": { emoji: "🌞", line: "This warmth deserves to stay a little longer." },
    "😐 Okay": { emoji: "☁️", line: "A quiet day still matters." },
    "😔 Low": { emoji: "🫂", line: "Softness first. Pressure later." },
    "😣 Stressed": { emoji: "🌧️", line: "Let us make this moment smaller." }
  };

  return map[mood] || { emoji: "🌈", line: "Your mood matters here." };
}

function getMoodHistoryData(){
  return JSON.parse(localStorage.getItem("moodHistory")) || {};
}

function saveMoodHistoryData(data){
  localStorage.setItem("moodHistory", JSON.stringify(data));
}

function saveMood(m){
  const today = getTodayDate();
  const moodHistory = getMoodHistoryData();

  moodHistory[today] = m;

  saveMoodHistoryData(moodHistory);
  updateMoodUI(m);
  renderMoodHistory();
  renderMoodStats();
}

function updateMoodUI(mood){
  const todayMood = document.getElementById("todayMood");
  const moodAdviceBox = document.getElementById("moodAdviceBox");
  const moodActionBox = document.getElementById("moodActionBox");
  const moodBuddy = document.getElementById("moodBuddy");
  const moodBuddyLine = document.getElementById("moodBuddyLine");

  if(todayMood) todayMood.innerText = mood;
  if(moodAdviceBox) moodAdviceBox.innerText = getMoodAdvice(mood);
  if(moodActionBox) moodActionBox.innerText = getMoodActions(mood);

  const buddy = getMoodBuddy(mood);

  if(moodBuddy) moodBuddy.innerText = buddy.emoji;
  if(moodBuddyLine) moodBuddyLine.innerText = buddy.line;
}

function loadMood(){
  const today = getTodayDate();
  const moodHistory = getMoodHistoryData();

  if(moodHistory[today]){
    updateMoodUI(moodHistory[today]);
  }

  renderMoodHistory();
  renderMoodStats();
  loadTinyWin();
}

function renderMoodHistory(){
  const moodHistoryBox = document.getElementById("moodHistory");
  if(!moodHistoryBox) return;

  const moodHistory = getMoodHistoryData();
  const entries = Object.entries(moodHistory).sort((a, b) => b[0].localeCompare(a[0]));

  moodHistoryBox.innerHTML = "";

  if(entries.length === 0){
    moodHistoryBox.innerHTML = `<div class="mood-entry">No mood history yet.</div>`;
    return;
  }

  entries.slice(0, 14).forEach(([date, mood], index) => {
    const div = document.createElement("div");
    div.className = "mood-entry";
    div.innerHTML = `<strong>Check-in ${entries.length - index}</strong> — ${date} — ${mood}`;
    moodHistoryBox.appendChild(div);
  });
}

function renderMoodStats(){
  const moodHistory = getMoodHistoryData();
  const entries = Object.entries(moodHistory).sort((a, b) => a[0].localeCompare(b[0]));

  const streakEl = document.getElementById("moodStreak");
  const last7El = document.getElementById("last7MoodMini");
  const todayEl = document.getElementById("todayMood");

  const today = getTodayDate();

  if(todayEl && moodHistory[today]){
    todayEl.innerText = moodHistory[today];
  }

  if(streakEl){
    streakEl.innerText = calculateMoodStreak(entries) + " days";
  }

  if(last7El){
    const last7 = entries.slice(-7).map(item => item[1].split(" ")[0]).join(" ");
    last7El.innerText = last7 || "—";
  }
}

function calculateMoodStreak(entries){
  if(entries.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for(let i = entries.length - 1; i >= 0; i--){
    const entryDate = new Date(entries[i][0] + "T00:00:00");

    if(entryDate.getTime() === currentDate.getTime()){
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if(entryDate.getTime() < currentDate.getTime()){
      break;
    }
  }

  return streak;
}

function doMoodAction(action){
  const box = document.getElementById("moodToolOutput");
  if(!box) return;

  const actions = {
    breathe: `1 Min Reset 🌬️

• aap 4 sec inhale kijiye
• 4 sec hold kijiye
• 6 sec exhale kijiye
• isko 4 baar repeat kijiye

Bas abhi sirf breathing par focus kijiye.`,

    water: `Water Check 💧

• aap abhi thoda paani pee lijiye
• ek sip bhi enough hai start ke liye
• body ko thoda support milta hai to mood bhi halka lag sakta hai`,

    stretch: `Shoulder Relax 🫶

• shoulders ko upar uthaiye
• 3 sec hold kijiye
• dheere se chhod dijiye
• neck ko halka sa left-right move kijiye

Aapka body bhi care deserve karta hai.`,

    music: `Calm Reminder 🎵

• ek soft song choose kijiye
• volume halka rakhiye
• bas 2 min tak kuch solve mat kijiye
• sirf feel ko thoda settle hone dijiye`,

    kind: `Kind Words 💛

Please yeh line aaram se padhiyega:
“Aaj aap jo feel kar rahi hain, uske bawajood aap important hain.”
“Aapko aaj perfect hone ki zaroorat nahi hai.”
“Aap softness deserve karti hain.”`
  };

  box.innerText = actions[action] || "";
}

function saveTinyWin(){
  const input = document.getElementById("tinyWinInput");
  const display = document.getElementById("tinyWinDisplay");

  if(!input || !display) return;

  const text = input.value.trim();

  if(!text){
    alert("Write one tiny win first");
    return;
  }

  localStorage.setItem("tinyWinToday", text);
  display.innerText = "Today’s tiny win: " + text;
  input.value = "";
}

function loadTinyWin(){
  const display = document.getElementById("tinyWinDisplay");
  if(!display) return;

  const saved = localStorage.getItem("tinyWinToday");
  display.innerText = saved ? "Today’s tiny win: " + saved : "No tiny win saved yet.";
}

/* =========================================================
   SECRET DIARY + PHOTO MEMORIES
========================================================= */
let currentDiaryFolder = null;

function openDiary(){
  const p = document.getElementById("diaryPass")?.value || "";

  if(p === "2222"){
    const box = document.getElementById("diaryBox");
    if(box) box.style.display = "block";
    loadDiaryFolders();
  } else {
    alert("Wrong Diary Password");
  }
}

function getDiaryFolders(){
  return JSON.parse(localStorage.getItem("diaryFolders")) || [];
}

function saveDiaryFolders(folders){
  localStorage.setItem("diaryFolders", JSON.stringify(folders));
}

function createDiaryFolder(){
  const input = document.getElementById("newFolderName");
  if(!input) return;

  const name = input.value.trim();

  if(!name){
    alert("Please enter a folder name");
    return;
  }

  const folders = getDiaryFolders();

  if(folders.includes(name)){
    alert("Folder already exists");
    return;
  }

  folders.push(name);
  saveDiaryFolders(folders);

  localStorage.setItem("diary_" + name, "");
  localStorage.setItem("diaryPhotos_" + name, JSON.stringify([]));

  input.value = "";
  loadDiaryFolders();
  openDiaryFolder(name);
}

function renameDiaryFolder(oldName){
  const newName = prompt("Rename folder:", oldName);
  if(!newName) return;

  const trimmed = newName.trim();

  if(!trimmed || trimmed === oldName) return;

  const folders = getDiaryFolders();

  if(folders.includes(trimmed)){
    alert("A folder with that name already exists.");
    return;
  }

  const updated = folders.map(f => f === oldName ? trimmed : f);
  saveDiaryFolders(updated);

  const oldData = localStorage.getItem("diary_" + oldName) || "";
  localStorage.setItem("diary_" + trimmed, oldData);
  localStorage.removeItem("diary_" + oldName);

  const oldPhotos = localStorage.getItem("diaryPhotos_" + oldName) || JSON.stringify([]);
  localStorage.setItem("diaryPhotos_" + trimmed, oldPhotos);
  localStorage.removeItem("diaryPhotos_" + oldName);

  if(currentDiaryFolder === oldName){
    currentDiaryFolder = trimmed;
  }

  loadDiaryFolders();
  openDiaryFolder(trimmed);
}

function deleteDiaryFolder(name){
  const ok = confirm(`Delete folder "${name}"?`);
  if(!ok) return;

  const folders = getDiaryFolders().filter(f => f !== name);

  saveDiaryFolders(folders);
  localStorage.removeItem("diary_" + name);
  localStorage.removeItem("diaryPhotos_" + name);

  if(currentDiaryFolder === name){
    currentDiaryFolder = null;

    const title = document.getElementById("currentFolderTitle");
    const text = document.getElementById("diaryText");
    const gallery = document.getElementById("diaryPhotoGallery");

    if(title) title.innerText = "No folder selected";
    if(text) text.value = "";
    if(gallery) gallery.innerHTML = "";
  }

  loadDiaryFolders();
}

function loadDiaryFolders(){
  const list = document.getElementById("folderList");
  if(!list) return;

  list.innerHTML = "";

  const folders = getDiaryFolders();

  if(folders.length === 0){
    list.innerHTML = `<div class="mood-entry">No diary folders yet.</div>`;
    return;
  }

  folders.forEach(folder => {
    const row = document.createElement("div");
    row.className = "folder-row";

    const openBtn = document.createElement("button");
    openBtn.className = "folder-name-btn" + (folder === currentDiaryFolder ? " active" : "");
    openBtn.innerText = folder;
    openBtn.onclick = () => openDiaryFolder(folder);

    const actions = document.createElement("div");
    actions.className = "folder-actions";

    const renameBtn = document.createElement("button");
    renameBtn.className = "mini-btn";
    renameBtn.innerText = "Rename";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      renameDiaryFolder(folder);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "mini-btn mini-danger";
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteDiaryFolder(folder);
    };

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(openBtn);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function openDiaryFolder(name){
  currentDiaryFolder = name;

  const title = document.getElementById("currentFolderTitle");
  const text = document.getElementById("diaryText");

  if(title) title.innerText = name;
  if(text) text.value = localStorage.getItem("diary_" + name) || "";

  loadDiaryFolders();
  renderDiaryPhotos();
}

function saveDiary(){
  if(!currentDiaryFolder){
    alert("Please create or open a diary folder first");
    return;
  }

  const text = document.getElementById("diaryText");

  if(text){
    localStorage.setItem("diary_" + currentDiaryFolder, text.value);
    alert("Diary saved 💛");
  }
}

function renameCurrentDiaryFolder(){
  if(!currentDiaryFolder){
    alert("Open a diary folder first");
    return;
  }

  renameDiaryFolder(currentDiaryFolder);
}

function deleteCurrentDiaryFolder(){
  if(!currentDiaryFolder){
    alert("Open a diary folder first");
    return;
  }

  deleteDiaryFolder(currentDiaryFolder);
}

function getDiaryPhotos(folderName){
  if(!folderName) return [];
  return JSON.parse(localStorage.getItem("diaryPhotos_" + folderName)) || [];
}

function saveDiaryPhotos(folderName, photos){
  if(!folderName) return;
  localStorage.setItem("diaryPhotos_" + folderName, JSON.stringify(photos));
}

function saveDiaryPhoto(){
  if(!currentDiaryFolder){
    alert("Please create or open a diary folder first");
    return;
  }

  const fileInput = document.getElementById("diaryPhotoInput");
  const descInput = document.getElementById("diaryPhotoDesc");

  if(!fileInput || !fileInput.files || !fileInput.files[0]){
    alert("Please choose a photo first");
    return;
  }

  const file = fileInput.files[0];

  if(!file.type.startsWith("image/")){
    alert("Please choose an image file");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){
    const photos = getDiaryPhotos(currentDiaryFolder);

    photos.unshift({
      id: "photo_" + Date.now(),
      src: e.target.result,
      desc: descInput ? descInput.value.trim() : "",
      createdAt: new Date().toLocaleString()
    });

    saveDiaryPhotos(currentDiaryFolder, photos);

    if(descInput) descInput.value = "";
    fileInput.value = "";

    renderDiaryPhotos();
    alert("Photo saved in this folder 💛");
  };

  reader.readAsDataURL(file);
}

function deleteDiaryPhoto(photoId){
  if(!currentDiaryFolder) return;

  const ok = confirm("Delete this photo?");
  if(!ok) return;

  const photos = getDiaryPhotos(currentDiaryFolder).filter(p => p.id !== photoId);

  saveDiaryPhotos(currentDiaryFolder, photos);
  renderDiaryPhotos();
}

function renderDiaryPhotos(){
  const gallery = document.getElementById("diaryPhotoGallery");
  if(!gallery) return;

  if(!currentDiaryFolder){
    gallery.innerHTML = `<div class="diary-empty-box">Open a folder to see saved photos.</div>`;
    return;
  }

  const photos = getDiaryPhotos(currentDiaryFolder);

  gallery.innerHTML = "";

  if(photos.length === 0){
    gallery.innerHTML = `<div class="diary-empty-box">No photo memories in this folder yet.</div>`;
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "diary-photo-list";

  photos.forEach(photo => {
    const card = document.createElement("div");
    card.className = "diary-photo-item";

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = "Diary memory photo";

    const desc = document.createElement("p");
    desc.className = "diary-photo-desc";
    desc.innerText = photo.desc || "No description";

    const time = document.createElement("div");
    time.className = "diary-photo-time";
    time.innerText = photo.createdAt || "";

    const del = document.createElement("button");
    del.className = "mini-btn mini-danger";
    del.innerText = "Delete Photo";
    del.onclick = () => deleteDiaryPhoto(photo.id);

    card.appendChild(img);
    card.appendChild(desc);
    card.appendChild(time);
    card.appendChild(del);

    wrap.appendChild(card);
  });

  gallery.appendChild(wrap);
}

/* =========================================================
   THEME / RAIN / STARS
========================================================= */
function createRain(){
  const rain = document.getElementById("rain");
  if(!rain) return;

  rain.innerHTML = "";

  const isMobile = window.innerWidth < 769;
  const count = isMobile ? 70 : 120;

  for(let i = 0; i < count; i++){
    const d = document.createElement("div");
    d.className = "drop";
    d.style.left = Math.random() * 100 + "%";
    d.style.animationDuration = (0.7 + Math.random()) + "s";
    rain.appendChild(d);
  }
}

function applyTheme(theme){
  const stars = document.getElementById("stars");
  const rain = document.getElementById("rain");

  if(theme === "rain"){
    if(stars) stars.style.display = "none";
    if(rain) rain.style.opacity = "1";
    document.body.style.background = "linear-gradient(-45deg,#102038,#18304f,#214065,#162944)";
    localStorage.setItem("themeMode", "rain");
  } else {
    if(stars) stars.style.display = "block";
    if(rain) rain.style.opacity = "0.55";
    document.body.style.background = "linear-gradient(-45deg,#16122b,#24183d,#31204f,#1f1635)";
    localStorage.setItem("themeMode", "star");
  }
}

function rainMode(){
  applyTheme("rain");
}

function starMode(){
  applyTheme("star");
}

function loadTheme(){
  const saved = localStorage.getItem("themeMode") || "star";
  applyTheme(saved);
}

/* =========================================================
   STRANGER SYSTEM — STATE + STORAGE
========================================================= */
let currentChatId = null;
let currentMode = "listen";
let recentReplies = [];
let recentAdvice = [];
let strangerTypingTimeout = null;

let chatContext = {
  turns: 0,
  lastEmotion: "neutral",
  lastSubEmotion: "neutral",
  lastTopic: "general",
  lastIntent: "none",
  lastNeed: "unknown",
  lastConfidence: "soft",
  recentUserMessages: [],
  recentUserLanguages: [],
  recentEmotions: [],
  lastBotReply: "",
  pendingFollowup: null,
  preferredReplyStyle: "english",
  lastSuggestedStep: "",
  lastQuestionAsked: "",
  lastComfortTheme: "",
  repeatTopics: {},
  memoryFacts: [],
  correctionMemory: [],
  lastExactTrigger: "",
  conversationArc: "opening",
  lastRepair: ""
};

function updateHiddenLogic(topic, emotion, memoryText, hintText, confidence = "soft"){
  const topicEl = document.getElementById("activeTopicLabel");
  const feelingEl = document.getElementById("activeFeelingLabel");
  const modeEl = document.getElementById("activeModeLabel");
  const memoryEl = document.getElementById("chatMemoryText");
  const hintEl = document.getElementById("chatContextHint");
  const confidenceEl = document.getElementById("activeConfidenceLabel");
  const trailEl = document.getElementById("chatMoodTrailText");

  const modeNameMap = {
    listen: "Just listen",
    comfort: "Comfort me",
    calm: "Calm my thoughts",
    advice: "Gentle advice",
    name: "Help me name this"
  };

  if(topicEl) topicEl.innerText = topic || "general";
  if(feelingEl) feelingEl.innerText = emotion || "neutral";
  if(modeEl) modeEl.innerText = modeNameMap[currentMode] || "Just listen";
  if(memoryEl && memoryText) memoryEl.innerText = memoryText;
  if(hintEl && hintText) hintEl.innerText = hintText;
  if(confidenceEl) confidenceEl.innerText = confidence || "soft";
  if(trailEl){
    trailEl.innerText = chatContext.recentEmotions.length
      ? chatContext.recentEmotions.slice(-5).join(" → ")
      : "No mood trail yet.";
  }
}

/* -------------------------
   Saved chats
------------------------- */
function getSavedChats(){
  return JSON.parse(localStorage.getItem("savedChats")) || [];
}

function saveSavedChats(chats){
  localStorage.setItem("savedChats", JSON.stringify(chats));
}

function generateChatId(){
  return "chat_" + Date.now();
}

function getCurrentChatHTML(){
  const c = document.getElementById("chatBox");
  return c ? c.innerHTML : "";
}

function setCurrentChatHTML(html){
  const c = document.getElementById("chatBox");
  if(c) c.innerHTML = html;
}

function saveCurrentWorkingChat(){
  localStorage.setItem("currentWorkingChat", getCurrentChatHTML());
}

function loadCurrentWorkingChat(){
  const saved = localStorage.getItem("currentWorkingChat");
  if(saved){
    setCurrentChatHTML(saved);
  }
}

function renderSavedChatsList(){
  const list = document.getElementById("savedChatsList");
  if(!list) return;

  const chats = getSavedChats();
  list.innerHTML = "";

  if(chats.length === 0){
    list.innerHTML = `<div class="mood-entry">No saved chats yet.</div>`;
    return;
  }

  chats.forEach(chat => {
    const row = document.createElement("div");
    row.className = "saved-chat-row";

    const openBtn = document.createElement("button");
    openBtn.className = "saved-chat-open";
    openBtn.innerText = chat.name;
    openBtn.onclick = () => openSavedChat(chat.id);

    const actions = document.createElement("div");
    actions.className = "saved-chat-actions";

    const renameBtn = document.createElement("button");
    renameBtn.className = "saved-chat-mini";
    renameBtn.innerText = "Rename";
    renameBtn.onclick = () => renameSavedChat(chat.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "saved-chat-mini saved-chat-danger";
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteSavedChat(chat.id);

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(openBtn);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function openSavedChat(id){
  const chats = getSavedChats();
  const chat = chats.find(c => c.id === id);
  if(!chat) return;

  currentChatId = id;
  setCurrentChatHTML(chat.html);
  saveCurrentWorkingChat();
}

function renameSavedChat(id){
  const chats = getSavedChats();
  const chat = chats.find(c => c.id === id);
  if(!chat) return;

  const newName = prompt("Rename chat:", chat.name);
  if(!newName) return;

  const trimmed = newName.trim();
  if(!trimmed) return;

  chat.name = trimmed;
  saveSavedChats(chats);
  renderSavedChatsList();
}

function deleteSavedChat(id){
  const ok = confirm("Delete this saved chat?");
  if(!ok) return;

  const chats = getSavedChats().filter(c => c.id !== id);
  saveSavedChats(chats);
  renderSavedChatsList();

  if(currentChatId === id){
    currentChatId = null;
    startNewConversation();
  }
}

function saveCurrentChatAs(){
  const name = prompt("Enter a name for this chat:");
  if(!name) return;

  const trimmed = name.trim();
  if(!trimmed) return;

  const chats = getSavedChats();

  chats.unshift({
    id: generateChatId(),
    name: trimmed,
    html: getCurrentChatHTML(),
    createdAt: new Date().toISOString()
  });

  saveSavedChats(chats);
  renderSavedChatsList();
  alert("Chat saved 💛");
}

function startNewConversation(){
  currentChatId = null;

  setCurrentChatHTML(`
    <div class="bot-message">
      <div class="msg-text">Hi. I’m here. You can start anywhere, even with one word.</div>
      <div class="msg-time">now</div>
    </div>
  `);

  saveCurrentWorkingChat();

  chatContext = {
    turns: 0,
    lastEmotion: "neutral",
    lastSubEmotion: "neutral",
    lastTopic: "general",
    lastIntent: "none",
    lastNeed: "unknown",
    lastConfidence: "soft",
    recentUserMessages: [],
    recentUserLanguages: [],
    recentEmotions: [],
    lastBotReply: "",
    pendingFollowup: null,
    preferredReplyStyle: "english",
    lastSuggestedStep: "",
    lastQuestionAsked: "",
    lastComfortTheme: "",
    repeatTopics: {},
    memoryFacts: [],
    correctionMemory: [],
    lastExactTrigger: "",
    conversationArc: "opening",
    lastRepair: ""
  };

  recentReplies = [];
  recentAdvice = [];
  currentMode = "listen";

  document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active-mode"));
  const firstMode = document.querySelector(".mode-btn");
  if(firstMode) firstMode.classList.add("active-mode");

  updateHiddenLogic(
    "general",
    "neutral",
    "The stranger will remember the recent thread softly.",
    "New conversation started. Stranger is gently listening again.",
    "soft"
  );
}

function deleteCurrentChatOnly(){
  const ok = confirm("Clear current chat?");
  if(!ok) return;

  startNewConversation();
}

/* -------------------------
   Chat UI
------------------------- */
function getTimeString(){
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return `${h}:${m} ${ampm}`;
}

function appendMessage(type, text, timeText = null){
  const c = document.getElementById("chatBox");
  if(!c) return;

  const wrap = document.createElement("div");
  wrap.className = type === "user" ? "user-message" : "bot-message";

  const textDiv = document.createElement("div");
  textDiv.className = "msg-text";
  textDiv.innerText = text;

  const timeDiv = document.createElement("div");
  timeDiv.className = "msg-time";
  timeDiv.innerText = timeText || getTimeString();

  wrap.appendChild(textDiv);
  wrap.appendChild(timeDiv);

  c.appendChild(wrap);
  c.scrollTop = c.scrollHeight;

  saveCurrentWorkingChat();
}

function appendUserMessage(text){
  appendMessage("user", text);
}

function appendBotMessage(text){
  appendMessage("bot", text);
}

function showTypingIndicator(show = true){
  const typing = document.getElementById("typingIndicator");
  if(!typing) return;

  typing.style.display = show ? "flex" : "none";

  if(show){
    const chatBox = document.getElementById("chatBox");
    if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function getTypingDelay(text, reply = ""){
  const userLen = text.trim().length;
  const replyLen = reply.trim().length;

  let base = 850;

  base += Math.min(userLen * 10, 900);
  base += Math.min(replyLen * 3.2, 900);

  if(userLen < 12) base -= 120;
  if(userLen > 80) base += 250;
  if(replyLen > 180) base += 300;

  const emotion = chatContext.lastEmotion;

  if(["sad","fear","guilt","lonely","stressed","confused"].includes(emotion)){
    base += 180;
  }

  if(["happy","proud","grateful","excited","peaceful"].includes(emotion)){
    base += 80;
  }

  const randomPart = Math.floor(Math.random() * 450);

  return Math.max(900, Math.min(base + randomPart, 3800));
}

function setMode(mode, btn){
  currentMode = mode;

  document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active-mode"));
  if(btn) btn.classList.add("active-mode");

  const style = getReplyStyle();

  const modeReplies = {
    listen: styleText(style, "Okay. I’ll just listen.", "Theek hai. Main bas sununga.", "Theek hai. I’ll just listen."),
    comfort: styleText(style, "Okay. I’ll be softer with you.", "Theek hai. Main tumhare saath thoda aur softly rahunga.", "Theek hai. I’ll be softer with you."),
    calm: styleText(style, "Okay. Let’s slow this down gently.", "Theek hai. Isse gently slow karte hain.", "Theek hai. Let’s slow this down gently."),
    advice: styleText(style, "Okay. I’ll give small useful steps.", "Theek hai. Main small useful steps dunga.", "Theek hai. I’ll give small useful steps."),
    name: styleText(style, "Okay. I’ll help name the feeling.", "Theek hai. Main feeling ko name karne me help karunga.", "Theek hai. I’ll help name the feeling.")
  };

  updateHiddenLogic(
    chatContext.lastTopic,
    chatContext.lastEmotion,
    buildMemoryStripText(),
    buildContextHint(style),
    chatContext.lastConfidence
  );

  appendBotMessage(modeReplies[mode] || modeReplies.listen);
}

function quickSend(word){
  const input = document.getElementById("chatInput");
  if(input){
    input.value = word;
    sendMessage();
  }
}

function stayWithMe(){
  const style = getReplyStyle();

  const replies = {
    english: [
      "I’m here. No pressure to say more.",
      "Okay. We can stay quiet for a moment.",
      "You do not need to perform here. I’ll stay.",
      "I’m still here with you.",
      "No rush. I’ll stay here quietly."
    ],
    hinglish: [
      "Main yahin hoon. Aur bolna zaroori nahi hai.",
      "Theek hai. Hum kuch der bas yahin reh sakte hain.",
      "Tumhe perform karne ki zaroorat nahi hai. Main stay kar raha hoon.",
      "Main abhi bhi tumhare saath hoon.",
      "Koi rush nahi. Main quietly yahin hoon."
    ],
    mix: [
      "Main yahin hoon. No pressure to say more.",
      "Theek hai. We can stay quiet for a moment.",
      "Tumhe perform karne ki zaroorat nahi hai. I’ll stay.",
      "Main abhi bhi with you hoon.",
      "Koi rush nahi. I’ll stay quietly."
    ]
  };

  const reply = pick(replies[style]);

  showTypingIndicator(true);

  clearTimeout(strangerTypingTimeout);

  strangerTypingTimeout = setTimeout(() => {
    showTypingIndicator(false);
    appendBotMessage(reply);
  }, 900 + Math.random() * 800);
}

function buildAIContextForStranger(){
  const recent = chatContext.recentUserMessages.slice(-8);

  return recent.map((msg, index) => {
    return {
      role: "user",
      content: msg
    };
  });
}

async function getRealAIReply(text, detectedStyle){
  const response = await fetch(AI_BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text,
      mode: currentMode,
      language: detectedStyle,
      context: buildAIContextForStranger()
    })
  });

  if(!response.ok){
    throw new Error("AI backend failed");
  }

  const data = await response.json();
  return data.reply || "I’m here. Tell me a little more.";
}

async function sendMessage(){
  const input = document.getElementById("chatInput");
  if(!input) return;

  const text = input.value.trim();
  if(!text) return;

  appendUserMessage(text);
  input.value = "";

  const detectedStyle = detectResponseLanguage(normalizeText(text));
  chatContext.preferredReplyStyle = detectedStyle;
  chatContext.recentUserMessages.push(text);
  chatContext.recentUserLanguages.push(detectedStyle);

  if(chatContext.recentUserMessages.length > 12) chatContext.recentUserMessages.shift();
  if(chatContext.recentUserLanguages.length > 12) chatContext.recentUserLanguages.shift();

  const preview = analyzeInputOnly(text);

  chatContext.lastEmotion = preview.emotion !== "neutral" ? preview.emotion : chatContext.lastEmotion;
  chatContext.lastSubEmotion = preview.subEmotion !== "neutral" ? preview.subEmotion : chatContext.lastSubEmotion;
  chatContext.lastTopic = preview.topic !== "general" ? preview.topic : chatContext.lastTopic;
  chatContext.lastConfidence = preview.confidence || "soft";

  if(preview.emotion && preview.emotion !== "neutral"){
    chatContext.recentEmotions.push(preview.emotion);
    if(chatContext.recentEmotions.length > 8) chatContext.recentEmotions.shift();
  }

  updateHiddenLogic(
    chatContext.lastTopic,
    chatContext.lastEmotion,
    buildMemoryStripText(),
    buildContextHint(detectedStyle),
    chatContext.lastConfidence
  );

  showTypingIndicator(true);
  clearTimeout(strangerTypingTimeout);

  try{
    let response;

    if(USE_REAL_AI_STRANGER){
      response = await getRealAIReply(text, detectedStyle);
    } else {
      response = generateReply(text);
    }

    const delay = getTypingDelay(text, response);

    strangerTypingTimeout = setTimeout(() => {
      showTypingIndicator(false);
      appendBotMessage(response);

      chatContext.turns++;
      chatContext.lastBotReply = response;
      updateConversationArc();

      updateHiddenLogic(
        chatContext.lastTopic,
        chatContext.lastEmotion,
        buildMemoryStripText(),
        buildContextHint(getReplyStyle()),
        chatContext.lastConfidence
      );

      saveCurrentWorkingChat();
    }, delay);

  } catch(error){
    const fallback = generateReply(text);
    const delay = getTypingDelay(text, fallback);

    strangerTypingTimeout = setTimeout(() => {
      showTypingIndicator(false);
      appendBotMessage(fallback);

      chatContext.turns++;
      chatContext.lastBotReply = fallback;
      updateConversationArc();
      saveCurrentWorkingChat();
    }, delay);
  }
}
/* =========================================================
   FULL FINAL UPDATED SCRIPT.JS — PART 3A/4
   Stranger intelligence: language + sentence analysis + emotion detection
========================================================= */

/* =========================================================
   LANGUAGE HELPERS
========================================================= */
function normalizeText(text){
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function splitSentences(text){
  return String(text || "")
    .split(/[.!?।\n]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function detectResponseLanguage(text){
  const t = normalizeText(text);

  const hinglishHints = [
    "hai","nahi","nhi","kyu","kyun","kya","mujhe","main","mai","mera","meri",
    "kar","kr","rah","rha","rhi","hoon","hu","haan","acha","achha","accha",
    "theek","thik","samajh","samjh","dil","ghar","yaar","bas","abhi",
    "bohot","bhot","bahut","lag","kru","karu","tum","tumhe","kaise",
    "aisa","fir","phir","jo","vo","wo","isme","usme","yrr","bhai",
    "sun","suno","meri baat","karo","mat","hoga","hona","mujhse","bolo",
    "khush","mast","dukhi","pareshan","gussa","dar","darr","akela",
    "nhi ho rha","nahi ho raha","kharab","bura","sahi"
  ];

  const englishHints = [
    "what","why","how","feel","feeling","help","please","problem","mind",
    "thoughts","exam","family","relationship","sleep","stress","alone",
    "lonely","sad","hurt","advice","step","better","hard","start","small",
    "listen","comfort","calm","happy","good","great","proud","excited",
    "grateful","peaceful","not","don't","cant","can't"
  ];

  let hindiScore = 0;
  let englishScore = 0;

  hinglishHints.forEach(word => {
    if(t.includes(word)) hindiScore++;
  });

  englishHints.forEach(word => {
    if(t.includes(word)) englishScore++;
  });

  if(/[ऀ-ॿ]/.test(t)){
    if(englishScore >= 1 || hindiScore >= 1) return "mix";
    return "hinglish";
  }

  if(hindiScore >= 3 && englishScore >= 2) return "mix";
  if(hindiScore >= 2) return "hinglish";

  return "english";
}

function getReplyStyle(){
  if(!chatContext.recentUserLanguages || chatContext.recentUserLanguages.length === 0){
    return chatContext.preferredReplyStyle || "english";
  }

  const recent = chatContext.recentUserLanguages.slice(-4);
  const counts = { english:0, hinglish:0, mix:0 };

  recent.forEach(style => {
    counts[style] = (counts[style] || 0) + 1;
  });

  if(counts.hinglish >= 2) return "hinglish";
  if(counts.mix >= 2) return "mix";
  if(counts.mix >= 1 && counts.hinglish >= 1) return "mix";

  return counts.english >= 2 ? "english" : (chatContext.preferredReplyStyle || "english");
}

function styleText(style, english, hinglish, mix){
  if(style === "hinglish") return hinglish;
  if(style === "mix") return mix;
  return english;
}

/* =========================================================
   EMOJI DETECTION
========================================================= */
function detectEmojiEmotion(text){
  const t = String(text || "");

  const emojiMap = [
    { emotion:"sad", emojis:["😔","😢","😭","😞","☹️","🙁","💔","🥺"] },
    { emotion:"happy", emojis:["😊","😄","😁","🙂","😌","☺️","❤️","💛"] },
    { emotion:"proud", emojis:["✨","🥳","🎉","🏆","💪","🔥"] },
    { emotion:"anger", emojis:["😡","😠","🤬","😤"] },
    { emotion:"fear", emojis:["😰","😨","😧","😟","😱"] },
    { emotion:"confused", emojis:["😕","🤔","🙃","😵‍💫"] },
    { emotion:"tired", emojis:["😴","🥱","😪"] },
    { emotion:"peaceful", emojis:["🌿","🌙","🕊️"] }
  ];

  for(const item of emojiMap){
    if(item.emojis.some(e => t.includes(e))){
      return item.emotion;
    }
  }

  return "neutral";
}

/* =========================================================
   NEGATION + SENTENCE MEANING ENGINE
========================================================= */
function hasNegationNear(text, positiveWord){
  const t = normalizeText(text);
  const words = t.split(/\s+/);
  const positives = Array.isArray(positiveWord) ? positiveWord : [positiveWord];

  const negations = [
    "nahi","nhi","na","not","no","never","dont","don't","doesnt","doesn't",
    "cant","can't","cannot","isnt","isn't","wasnt","wasn't","mat"
  ];

  for(let i = 0; i < words.length; i++){
    const w = words[i];

    if(positives.some(p => w.includes(p))){
      const start = Math.max(0, i - 5);
      const end = Math.min(words.length, i + 5);
      const windowWords = words.slice(start, end);

      if(windowWords.some(x => negations.includes(x))){
        return true;
      }
    }
  }

  return false;
}

function hasNegativeMeaningPhrase(t){
  const phrases = [
    "acha feel nahi",
    "acha feel nhi",
    "achha feel nahi",
    "achha feel nhi",
    "accha feel nahi",
    "accha feel nhi",
    "good feel nahi",
    "good feel nhi",
    "not feeling good",
    "not feel good",
    "dont feel good",
    "don't feel good",
    "feeling bad",
    "bura feel",
    "kharab feel",
    "theek nahi",
    "theek nhi",
    "thik nahi",
    "thik nhi",
    "okay nahi",
    "okay nhi",
    "sahi nahi",
    "sahi nhi",
    "nahi ho raha",
    "nhi ho rha",
    "nhi ho raha",
    "nahi ho rha",
    "mann nahi",
    "mann nhi"
  ];

  return phrases.some(p => t.includes(p));
}

function hasPositiveMeaningPhrase(t){
  const phrases = [
    "acha feel kar raha",
    "acha feel kr raha",
    "acha feel ho raha",
    "achha feel ho raha",
    "accha feel ho raha",
    "good feel",
    "feeling good",
    "feel good",
    "khush hu",
    "khush hoon",
    "better feel",
    "halka feel",
    "mast lag raha",
    "aaj acha hua",
    "aaj achha hua",
    "aaj accha hua",
    "finally ho gaya",
    "kaam ho gaya",
    "i did it",
    "i am happy",
    "im happy",
    "i'm happy"
  ];

  return phrases.some(p => t.includes(p));
}

function scoreSentenceMood(sentence){
  const s = normalizeText(sentence);

  let score = {
    happy:0,
    proud:0,
    excited:0,
    grateful:0,
    peaceful:0,
    sad:0,
    lonely:0,
    fear:0,
    confused:0,
    tired:0,
    guilt:0,
    anger:0,
    stressed:0,
    neutral:0
  };

  const emojiEmotion = detectEmojiEmotion(sentence);
  if(emojiEmotion !== "neutral"){
    score[emojiEmotion] += 4;
  }

  if(hasNegativeMeaningPhrase(s)){
    score.sad += 6;
    score.stressed += 2;
  }

  if(hasPositiveMeaningPhrase(s)){
    score.happy += 5;
  }

  const positiveWords = ["acha","achha","accha","good","better","happy","khush","mast","nice","great","amazing","sahi"];
  if(positiveWords.some(w => s.includes(w))){
    if(hasNegationNear(s, positiveWords)){
      score.sad += 5;
      score.stressed += 2;
    } else {
      score.happy += 3;
    }
  }

  if(/\b(proud|achievement|achieved|success|win|jeet|finally|kar liya|ho gaya|done)\b/.test(s)){
    if(!hasNegationNear(s, ["proud","success","win","achieved"])){
      score.proud += 4;
    }
  }

  if(/\b(excited|wow|intezar|can't wait|cant wait|excite)\b/.test(s)){
    score.excited += 4;
  }

  if(/\b(thanks|thank you|thanku|grateful|thankful|shukriya)\b/.test(s)){
    score.grateful += 4;
  }

  if(/\b(calm|peace|peaceful|relaxed|light|halka|sukoon)\b/.test(s)){
    if(hasNegationNear(s, ["calm","peace","relaxed","light","halka"])){
      score.stressed += 4;
    } else {
      score.peaceful += 4;
    }
  }

  if(/\b(sad|cry|crying|hurt|pain|low|udaas|udass|rona|ro raha|ro rahi|dard|dukhi|bura|kharab|broken)\b/.test(s)){
    score.sad += 4;
  }

  if(/\b(alone|lonely|akela|akelapan|unseen|koi nahi|koi nhi)\b/.test(s)){
    score.lonely += 4;
  }

  if(/\b(scared|fear|dar|darr|panic|anxious|ghabra|ghabrahat|worried|tension)\b/.test(s)){
    score.fear += 4;
    score.stressed += 2;
  }

  if(/\b(confused|overthink|blank|dont know|don't know|samajh nahi|samjh nahi|kuch samajh|unclear)\b/.test(s)){
    score.confused += 4;
  }

  if(/\b(tired|drained|exhausted|thak|thaki|thak gaya|thak gayi|sleepy|burnout)\b/.test(s)){
    score.tired += 4;
  }

  if(/\b(guilty|shame|regret|my fault|meri galti|galti|sharam)\b/.test(s)){
    score.guilt += 4;
  }

  if(/\b(angry|gussa|frustrated|mad|irritated|chidh|annoyed)\b/.test(s)){
    score.anger += 4;
  }

  if(/\b(stress|stressed|pressure|pareshan|load|too much|bahut zyada|bohot zyada|bhot zyada)\b/.test(s)){
    score.stressed += 4;
  }

  if(/\b(nahi|nhi|not|don't|dont|can't|cant|no)\b/.test(s)){
    if(score.happy > 0 && score.sad === 0){
      score.sad += 3;
      score.happy = Math.max(0, score.happy - 3);
    }
  }

  return score;
}

function mergeMoodScores(scores){
  const finalScore = {
    happy:0,
    proud:0,
    excited:0,
    grateful:0,
    peaceful:0,
    sad:0,
    lonely:0,
    fear:0,
    confused:0,
    tired:0,
    guilt:0,
    anger:0,
    stressed:0,
    neutral:0
  };

  scores.forEach(score => {
    Object.keys(finalScore).forEach(k => {
      finalScore[k] += score[k] || 0;
    });
  });

  return finalScore;
}

function chooseEmotionFromScore(score, originalText){
  const t = normalizeText(originalText);

  if(hasNegativeMeaningPhrase(t)){
    return { emotion:"sad", confidence:"high" };
  }

  const entries = Object.entries(score)
    .filter(([k]) => k !== "neutral")
    .sort((a,b) => b[1] - a[1]);

  const top = entries[0];
  const second = entries[1];

  if(!top || top[1] <= 0){
    return { emotion:"neutral", confidence:"soft" };
  }

  if(second && top[1] - second[1] <= 1 && top[1] >= 3){
    if(["sad","stressed","fear","lonely"].includes(top[0]) || ["sad","stressed","fear","lonely"].includes(second[0])){
      return { emotion: ["sad","stressed","fear","lonely"].includes(top[0]) ? top[0] : second[0], confidence:"mixed" };
    }
    return { emotion:top[0], confidence:"mixed" };
  }

  return { emotion:top[0], confidence:top[1] >= 5 ? "high" : "soft" };
}

/* =========================================================
   MAIN DETECTION LAYERS
========================================================= */
function detectEmotion(text){
  const t = normalizeText(text);
  const sentences = splitSentences(t);
  const sentenceScores = sentences.length ? sentences.map(scoreSentenceMood) : [scoreSentenceMood(t)];
  const merged = mergeMoodScores(sentenceScores);
  const result = chooseEmotionFromScore(merged, t);
  return result.emotion;
}

function detectEmotionDetailed(text){
  const t = normalizeText(text);
  const sentences = splitSentences(t);
  const sentenceScores = sentences.length ? sentences.map(scoreSentenceMood) : [scoreSentenceMood(t)];
  const merged = mergeMoodScores(sentenceScores);
  const result = chooseEmotionFromScore(merged, t);

  return {
    emotion: result.emotion,
    confidence: result.confidence,
    score: merged
  };
}

function detectSubEmotion(t){
  t = normalizeText(t);

  if(t.includes("ignored") || t.includes("ignore") || t.includes("reply nahi") || t.includes("reply nhi")) return "ignored";
  if(t.includes("reject") || t.includes("rejected")) return "rejected";
  if(t.includes("betray") || t.includes("dhoka")) return "betrayed";
  if(t.includes("numb") || t.includes("sunn") || t.includes("empty")) return "numb";
  if(t.includes("future") || t.includes("aage") || t.includes("kal ka")) return "future-fear";
  if(t.includes("past") || t.includes("pichla") || t.includes("pichle") || t.includes("regret")) return "past-regret";
  if(t.includes("burnout") || t.includes("burnt") || t.includes("drained completely")) return "burnout";
  if(t.includes("pressure") || t.includes("press")) return "pressure";
  if(t.includes("ashamed") || t.includes("sharam")) return "shame";
  if(t.includes("khush but") || t.includes("happy but") || t.includes("acha but") || t.includes("good but")) return "mixed-positive-fear";
  if(hasNegativeMeaningPhrase(t)) return "not-good";

  return "neutral";
}

function detectTopic(t){
  t = normalizeText(t);

  if(
    t.includes("exam") || t.includes("study") || t.includes("padh") ||
    t.includes("syllabus") || t.includes("college") || t.includes("test") ||
    t.includes("marks") || t.includes("paper") || t.includes("assignment")
  ) return "exam";

  if(
    t.includes("family") || t.includes("home") || t.includes("mother") ||
    t.includes("father") || t.includes("ghar") || t.includes("mummy") ||
    t.includes("papa") || t.includes("parents")
  ) return "family";

  if(
    t.includes("relationship") || t.includes("love") || t.includes("boyfriend") ||
    t.includes("girlfriend") || t.includes("breakup") || t.includes("partner")
  ) return "relationship";

  if(
    t.includes("sleep") || t.includes("so nahi") || t.includes("insomnia") ||
    t.includes("neend") || t.includes("sleeping") || t.includes("sona")
  ) return "sleep";

  if(
    t.includes("worthless") || t.includes("not enough") || t.includes("ugly") ||
    t.includes("self worth") || t.includes("confidence") || t.includes("bekaar") ||
    t.includes("kuch nahi") || t.includes("not good enough")
  ) return "selfworth";

  if(t.includes("friend") || t.includes("dost") || t.includes("friends")) return "friendship";

  if(
    t.includes("future") || t.includes("career") || t.includes("job") ||
    t.includes("placement") || t.includes("life") || t.includes("aage")
  ) return "future";

  if(
    t.includes("health") || t.includes("body") || t.includes("face") ||
    t.includes("hair") || t.includes("skin") || t.includes("height")
  ) return "selfcare";

  return "general";
}

function detectNeedIntent(t){
  t = normalizeText(t);

  if(
    t.includes("just listen") || t.includes("listen only") || t.includes("bas suno") ||
    t.includes("sirf suno") || t.includes("meri baat suno") || t.includes("just meri baat suno") ||
    t.includes("meri baat sun lo")
  ) return "listen_request";

  if(
    t.includes("comfort me") || t.includes("mujhe comfort chahiye") ||
    t.includes("bas comfort chahiye")
  ) return "comfort_request";

  if(
    t.includes("calm me") || t.includes("help me calm down") ||
    t.includes("mujhe calm karo") || t.includes("shant kar do")
  ) return "calm_request";

  if(
    t.includes("advice do") || t.includes("i need advice") || t.includes("suggest karo") ||
    t.includes("solution do") || t.includes("batao kya karu")
  ) return "advice_request";

  if(
    t.includes("help me name") || t.includes("yeh kya feeling hai") ||
    t.includes("what am i feeling")
  ) return "name_request";

  return "none";
}

function detectIntent(t){
  t = normalizeText(t);

  if(
    t.includes("what should i do") || t.includes("what do i do") ||
    t.includes("kya karu") || t.includes("kya karun") || t.includes("ab kya karu") ||
    t.includes("mai kya kru") || t.includes("main kya kru") || t.includes("mai kya karu") ||
    t.includes("ab kya kru") || t.includes("kya kru ab")
  ) return "what_to_do";

  if(
    t.includes("what am i feeling") || t.includes("what is this feeling") ||
    t.includes("samajh nahi aa raha kya feel") || t.includes("main kya feel kar rahi hoon") ||
    t.includes("yeh kya feeling hai") || t.includes("mai kya feel kar rha hu")
  ) return "what_am_i_feeling";

  if(t.includes("what do you think i need") || t.includes("tum batao mujhe kya chahiye")) return "need_check";

  if(
    t.includes("galat samjha") || t.includes("galat samjhe") || t.includes("wrong samjha") ||
    t.includes("wrong reply") || t.includes("ye reply sahi nahi") || t.includes("sahi nahi samjha")
  ) return "repair_request";

  return "none";
}

function detectIntensity(t){
  t = normalizeText(t);

  let score = 0;

  if(t.length > 80) score++;
  if(t.length > 180) score++;

  [
    "very","too much","really","extremely","can't","cannot","never","always",
    "bahut","bohot","bhot","zaada","zyada","panic","crying","hurt","unbearable",
    "kaafi","bahot","tut","toot","break","collapse"
  ].forEach(w => {
    if(t.includes(w)) score++;
  });

  if(score >= 3) return "high";
  if(score >= 1) return "medium";
  return "low";
}

function detectFollowupType(t){
  t = normalizeText(t);

  if(
    t.includes("what is that step") || t.includes("which step") || t.includes("what step") ||
    t.includes("kya hai vo step") || t.includes("kya hai wo step") ||
    t.includes("small step kya hai") || t.includes("vo small step kya hai")
  ) return "ask_step";

  if(
    t.includes("how") || t.includes("kaise") || t.includes("how do i do that") ||
    t.includes("kaise karu") || t.includes("kaise kru")
  ) return "ask_how";

  if(t.includes("why") || t.includes("kyu") || t.includes("kyun")) return "ask_why";

  if(t.includes("which one") || t.includes("kon sa") || t.includes("kaunsa") || t.includes("kaun sa")) return "ask_which";

  if(t.includes("then what") || t.includes("uske baad") || t.includes("phir kya")) return "ask_then";

  if(
    t.includes("not helping") || t.includes("nahi ho raha") || t.includes("still hard") ||
    t.includes("still same") || t.includes("thoda bhi better nahi")
  ) return "still_hard";

  return "none";
}

function isOneWordStyle(text){
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  return words.length <= 2;
}

function isHighRisk(t){
  t = normalizeText(t);

  return [
    "want to die",
    "kill myself",
    "hurt myself",
    "self harm",
    "end my life",
    "don't want to live",
    "do not want to live",
    "marna hai",
    "jeena nahi",
    "khud ko hurt",
    "khud ko maar",
    "sab khatam",
    "end it"
  ].some(w => t.includes(w));
}

function analyzeInputOnly(text){
  const lower = normalizeText(text);
  const emotionInfo = detectEmotionDetailed(lower);

  return {
    emotion: emotionInfo.emotion,
    confidence: emotionInfo.confidence,
    score: emotionInfo.score,
    subEmotion: detectSubEmotion(lower),
    topic: detectTopic(lower),
    needIntent: detectNeedIntent(lower),
    intent: detectIntent(lower),
    intensity: detectIntensity(lower)
  };
}

/* =========================================================
   MEMORY + ANTI-REPEAT HELPERS
========================================================= */
function updateRepeatTopic(topic){
  chatContext.repeatTopics[topic] = (chatContext.repeatTopics[topic] || 0) + 1;
}

function isRepeatTopic(topic){
  return (chatContext.repeatTopics[topic] || 0) >= 3;
}

function addMemoryFact(text){
  if(!text) return;

  chatContext.memoryFacts.push(text);

  if(chatContext.memoryFacts.length > 6){
    chatContext.memoryFacts.shift();
  }
}

function addCorrectionMemory(text){
  if(!text) return;

  chatContext.correctionMemory.push(text);

  if(chatContext.correctionMemory.length > 4){
    chatContext.correctionMemory.shift();
  }
}

function updateConversationArc(){
  if(chatContext.turns < 2){
    chatContext.conversationArc = "opening";
  } else if(chatContext.turns < 5){
    chatContext.conversationArc = "deepening";
  } else {
    chatContext.conversationArc = "supporting";
  }
}

function buildMemoryStripText(){
  const recent = chatContext.recentUserMessages.slice(-2).join(" / ");
  const topic = chatContext.lastTopic || "general";
  const emotion = chatContext.lastEmotion || "neutral";

  if(!recent){
    return "The stranger will remember the recent thread softly.";
  }

  return `Recent thread: ${topic} • tone: ${emotion} • last user flow: ${recent}`;
}

function buildContextHint(style){
  return styleText(
    style,
    `Stranger is in ${currentMode} mode • topic: ${chatContext.lastTopic} • feeling: ${chatContext.lastEmotion}`,
    `Stranger ab ${currentMode} mode me hai • topic: ${chatContext.lastTopic} • feeling: ${chatContext.lastEmotion}`,
    `Stranger ab ${currentMode} mode me hai • topic: ${chatContext.lastTopic} • feeling: ${chatContext.lastEmotion}`
  );
}

function pick(arr){
  if(!Array.isArray(arr) || arr.length === 0) return "";

  const filtered = arr.filter(item => !recentReplies.includes(item));
  const pool = filtered.length ? filtered : arr;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  recentReplies.push(chosen);

  if(recentReplies.length > 28){
    recentReplies.shift();
  }

  return chosen;
}

function pickAdvice(arr){
  if(!Array.isArray(arr) || arr.length === 0) return "";

  const filtered = arr.filter(item => !recentAdvice.includes(item));
  const pool = filtered.length ? filtered : arr;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  recentAdvice.push(chosen);

  if(recentAdvice.length > 18){
    recentAdvice.shift();
  }

  return chosen;
}

function maybeEmoji(emotion){
  if(Math.random() > 0.32) return "";

  const map = {
    happy:[" ✨"," 🙂"," 💛"],
    proud:[" ✨"," 🏆"," 💛"],
    excited:[" ✨"," 🌟"],
    grateful:[" 💛"," 🌿"],
    peaceful:[" 🌙"," 🌿"],
    sad:[" 🫂"," 💛"],
    lonely:[" 🫂"," 🌙"],
    fear:[" 🌿"," 🫂"],
    confused:[" 🌿"],
    tired:[" 🌙"," 🫂"],
    guilt:[" 💛"],
    anger:[" 🌿"],
    stressed:[" 🌿"," 🫂"],
    neutral:[" 💛"]
  };

  const arr = map[emotion] || map.neutral;
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybeHesitation(style){
  if(Math.random() > 0.22) return "";

  return styleText(
    style,
    pick(["Hmm... ", "Okay... ", "I hear you... "]),
    pick(["Hmm... ", "Theek... ", "Samajh raha hoon... "]),
    pick(["Hmm... ", "Theek... ", "I hear you... "])
  );
}

/* =========================================================
   FOLLOW-UP BRIDGE
========================================================= */
function setPendingBridge(type, data){
  chatContext.pendingFollowup = {
    type,
    step:0,
    data:data || {}
  };
}

function clearPendingBridge(){
  chatContext.pendingFollowup = null;
}

function isDirectFollowup(lower, followupType){
  if(!chatContext.pendingFollowup) return false;
  if(followupType !== "none") return true;

  return [
    "haan","hmm","okay","ok","phir","then","and then",
    "aur","aur fir","aur phir","uske baad","what next","next",
    "yes","yeah","yep"
  ].some(word => lower === word || lower.includes(word));
}

/* =========================================================
   SAFETY + REPAIR
========================================================= */
function getCrisisReply(style){
  return styleText(
    style,
    `I’m really glad you said this.
You matter a lot right now.

Please contact emergency help or a suicide/crisis helpline in your area right now, or reach out to someone physically near you immediately.
If you can, message or call one trusted person and say:
“I am not safe being alone right now. Please stay with me.”`,
    `Main bahut glad hoon ki tumne yeh bola.
Tum abhi bahut important ho.

Please abhi kisi trusted person ko call ya message karo aur bolo:
“Main abhi akela safe nahi hoon. Please mere saath raho.”
Agar immediate danger ho to emergency help lo.`,
    `Main glad hoon ki tumne yeh bola.
Tum abhi bahut important ho.

Please kisi trusted person ko abhi call ya message karo:
“Main abhi safe nahi feel kar raha. Please mere saath raho.”
Agar immediate danger ho to emergency help lo.`
  );
}

function getRepairReply(style){
  addCorrectionMemory("User corrected the stranger’s understanding.");

  return styleText(
    style,
    "You’re right — I caught that wrong. Let me slow down and follow what you actually meant. Tell me the exact part I misunderstood.",
    "Haan, tum sahi ho — maine galat pakda. Main slow karta hoon aur tumhara actual matlab follow karta hoon. Batao maine exact kya galat samjha?",
    "Haan, tum sahi ho — I caught that wrong. Main slow karta hoon. Batao maine exact kya galat samjha?"
  );
}
/* =========================================================
   FULL FINAL UPDATED SCRIPT.JS — PART 3B/4
   Stranger reply packs + advice + step logic
========================================================= */

/* =========================================================
   DIRECT NEED REPLIES
========================================================= */
function shortDirectReply(needIntent, style){
  const replies = {
    listen_request: styleText(
      style,
      "Okay. I’m here. Go on.",
      "Theek hai. Main yahin hoon. Tum bolte raho.",
      "Theek hai. I’m here. Tum bolte raho."
    ),

    comfort_request: styleText(
      style,
      "Okay. I’m here gently. You do not need to rush.",
      "Theek hai. Main softly yahin hoon. Tumhe rush nahi karna hai.",
      "Theek hai. Main softly yahin hoon. You don’t need to rush."
    ),

    calm_request: styleText(
      style,
      "Okay. One slow breath first.",
      "Theek hai. Pehle ek slow breath lo.",
      "Theek hai. One slow breath first."
    ),

    advice_request: styleText(
      style,
      "Okay. I’ll listen first, then give one small useful step.",
      "Theek hai. Main pehle poori baat sununga, phir ek small useful step dunga.",
      "Theek hai. Pehle main sununga, phir one small useful step dunga."
    ),

    name_request: styleText(
      style,
      "Okay. We’ll try to get closer to the feeling.",
      "Theek hai. Hum feeling ke thoda aur paas jayenge.",
      "Theek hai. We’ll feeling ke thoda aur paas jayenge."
    )
  };

  return replies[needIntent] || null;
}

/* =========================================================
   ONE WORD / QUICK CHIP REPLIES
========================================================= */
function oneWordReply(word, style){
  const w = normalizeText(word);
  const emotion = detectEmojiEmotion(word) !== "neutral" ? detectEmojiEmotion(word) : w;

  const map = {
    english: {
      happy: "That’s good to hear. Let this feeling stay for a little while.",
      proud: "You should let yourself feel proud. Don’t shrink this moment.",
      heavy: "That sounds heavy. You do not need to unpack all of it right now.",
      blank: "Blank still counts as a feeling.",
      lonely: "I’m here with you.",
      scared: "That sounds scary. Let’s keep this moment small.",
      crying: "It’s okay if words are hard right now.",
      "too much": "If it feels like too much, we can reduce it to one small piece.",
      sad: "That sounds low. You don’t have to fix the whole feeling right now.",
      stressed: "Okay. Let’s reduce this to one small next step.",
      confused: "Confusion is okay. We can separate one thread first.",
      anger: "That anger may be protecting something hurt underneath.",
      tired: "This sounds like your system needs softness, not more pressure."
    },

    hinglish: {
      happy: "Achha laga yeh sunke. Is feeling ko thoda stay karne do.",
      proud: "Tumhe proud feel karna chahiye. Is moment ko chhota mat karo.",
      heavy: "Yeh kaafi heavy lag raha hai. Tumhe sab kuch abhi unpack karne ki zaroorat nahi hai.",
      blank: "Blank feel karna bhi ek feeling hai.",
      lonely: "Main iss waqt yahin hoon tumhare saath.",
      scared: "Yeh scary lag raha hai. Chalo iss moment ko thoda chhota rakhte hain.",
      crying: "Agar words mushkil lag rahe hain to wo bhi theek hai.",
      "too much": "Agar sab kuch zyada lag raha hai, to hum isse ek chhote piece tak le aa sakte hain.",
      sad: "Yeh low lag raha hai. Tumhe poori feeling abhi fix karne ki zaroorat nahi.",
      stressed: "Theek hai. Isse ek small next step tak reduce karte hain.",
      confused: "Confusion okay hai. Pehle ek thread separate karte hain.",
      anger: "Yeh gussa shayad neeche wale hurt ko protect kar raha hai.",
      tired: "Lag raha hai tumhare system ko softness chahiye, aur pressure nahi."
    },

    mix: {
      happy: "Achha laga yeh sunke. Let this feeling stay thoda sa.",
      proud: "Tumhe proud feel karna chahiye. Don’t shrink this moment.",
      heavy: "Yeh kaafi heavy lag raha hai. Tumhe sab kuch abhi unpack karne ki zaroorat nahi hai.",
      blank: "Blank feel karna bhi ek feeling hai.",
      lonely: "Main iss waqt yahin hoon, with you.",
      scared: "Yeh scary lag raha hai. Let’s keep this moment thoda small.",
      crying: "Agar words mushkil lag rahe hain to that’s okay too.",
      "too much": "Agar sab kuch zyada lag raha hai, to hum isse one small piece tak le aa sakte hain.",
      sad: "Yeh low lag raha hai. You don’t need to fix whole feeling abhi.",
      stressed: "Theek hai. Isse one small next step tak reduce karte hain.",
      confused: "Confusion okay hai. Let’s separate one thread first.",
      anger: "Yeh anger shayad neeche wale hurt ko protect kar raha hai.",
      tired: "System ko softness chahiye, aur pressure nahi."
    }
  };

  return map[style][emotion] || map[style][w] || styleText(style, "I’m here.", "Main yahin hoon.", "Main yahin hoon. I’m here.");
}

/* =========================================================
   POSITIVE REPLY PACKS
========================================================= */
const positiveReplyPack = {
  happy: {
    english: [
      "That’s genuinely nice. Let yourself enjoy it without immediately worrying about when it will end.",
      "I’m glad you’re feeling good. Stay with this for a bit — not every good moment needs to be analysed.",
      "This sounds like a lighter moment. I’d say: protect it, don’t rush away from it.",
      "Good. Keep this small happiness close. Sometimes these tiny good moments matter more than we realise.",
      "I like that. Let your body also know that something feels okay right now.",
      "That sounds like a moment worth saving. Even small good feelings count.",
      "Let this good feeling be simple. You don’t have to explain or justify it."
    ],
    hinglish: [
      "Yeh genuinely achha laga sunke. Is feeling ko thoda enjoy karo, turant overthink mat karo.",
      "Achha hai tum good feel kar rahe ho. Thoda is moment me raho.",
      "Yeh halka sa good moment lag raha hai. Isko protect karo, jaldi se dismiss mat karo.",
      "Good. Is chhoti happiness ko hold karo. Kabhi kabhi yahi moments kaafi matter karte hain.",
      "Mujhe achha laga yeh sunke. Body ko bhi feel karne do ki abhi kuch okay hai.",
      "Yeh moment save karne layak lag raha hai. Small good feelings bhi count karti hain.",
      "Is good feeling ko simple rehne do. Isko explain ya justify karna zaroori nahi."
    ],
    mix: [
      "Yeh genuinely nice hai. Is feeling ko thoda enjoy karo, turant overthink mat karo.",
      "I’m glad tum good feel kar rahe ho. Stay with this for a bit.",
      "Yeh lighter moment lag raha hai. Protect it, jaldi dismiss mat karo.",
      "Good. Is small happiness ko hold karo.",
      "Mujhe achha laga yeh sunke. Let your body also feel ki abhi kuch okay hai.",
      "Yeh moment save karne layak hai. Small good feelings count karti hain.",
      "Let this good feeling be simple. Explain karna zaroori nahi."
    ]
  },

  proud: {
    english: [
      "You’re allowed to feel proud of that. Don’t make it smaller just to seem humble.",
      "That matters. Maybe pause for one second and actually tell yourself: I did this.",
      "I’m proud of you for noticing it. Some wins deserve to be felt properly.",
      "This is not a small thing if it took effort from you.",
      "Hold this moment. You earned the right to feel good about it.",
      "Don’t rush to the next target yet. Let this win register.",
      "Your effort deserves a little respect from you too."
    ],
    hinglish: [
      "Tumhe ispe proud feel karna allowed hai. Humble dikhne ke liye isko chhota mat karo.",
      "Yeh matter karta hai. Ek second ruk ke khud ko bolo: maine yeh kiya.",
      "Mujhe achha lag raha hai ki tum is win ko notice kar rahe ho. Kuch wins properly feel karni chahiye.",
      "Agar tumne effort lagaya hai, to yeh small thing nahi hai.",
      "Is moment ko hold karo. Tumne is good feeling ko earn kiya hai.",
      "Abhi next target pe mat koodo. Is win ko register hone do.",
      "Tumhara effort tumhari respect deserve karta hai."
    ],
    mix: [
      "Tumhe proud feel karna allowed hai. Don’t shrink it.",
      "Yeh matter karta hai. Ek second ruk ke bolo: I did this.",
      "I’m proud ki tum is win ko notice kar rahe ho.",
      "Agar effort laga hai, then this is not small.",
      "Hold this moment. Tumne yeh earn kiya hai.",
      "Next target pe mat jump karo. Let this win register.",
      "Tumhara effort respect deserve karta hai."
    ]
  },

  excited: {
    english: [
      "That excitement sounds real. Let it give you energy, but don’t force it to become pressure.",
      "Nice. Excitement can be a good sign that something matters to you.",
      "Stay with that spark. You don’t need to plan everything right now.",
      "That sounds alive. Let it be simple for a moment.",
      "Good. Just keep one small next step attached to this excitement."
    ],
    hinglish: [
      "Yeh excitement real lag rahi hai. Isko energy banne do, pressure nahi.",
      "Nice. Excitement ka matlab ho sakta hai ki yeh cheez tumhare liye matter karti hai.",
      "Is spark ke saath raho. Abhi sab plan karna zaroori nahi hai.",
      "Yeh alive feel ho raha hai. Isse ek moment ke liye simple rehne do.",
      "Good. Is excitement ke saath bas ek small next step attach karo."
    ],
    mix: [
      "Yeh excitement real lag rahi hai. Let it become energy, pressure nahi.",
      "Nice. Excitement means yeh cheez matter karti hai.",
      "Stay with that spark. Abhi sab plan karna zaroori nahi.",
      "Yeh alive feel ho raha hai. Let it be simple.",
      "Good. Bas ek small next step attach karo."
    ]
  },

  grateful: {
    english: [
      "That’s a soft feeling. Let it sit quietly instead of rushing past it.",
      "Gratitude can make the heart feel less alone for a moment.",
      "That sounds warm. Maybe save this in your notes so it doesn’t disappear quickly.",
      "I’m glad something felt worth appreciating today.",
      "That’s a good thing to notice. Small gratitude can become a small anchor."
    ],
    hinglish: [
      "Yeh soft feeling hai. Isko quietly baithne do, jaldi se skip mat karo.",
      "Gratitude se kabhi kabhi heart thoda less alone feel karta hai.",
      "Yeh warm lag raha hai. Isko notes me save kar sakte ho.",
      "Achha hai ki aaj kuch appreciate karne layak laga.",
      "Yeh notice karna achhi baat hai. Small gratitude ek anchor ban sakti hai."
    ],
    mix: [
      "Yeh soft feeling hai. Let it sit quietly.",
      "Gratitude se heart thoda less alone feel kar sakta hai.",
      "Yeh warm lag raha hai. Maybe notes me save kar lo.",
      "I’m glad aaj kuch appreciate karne layak laga.",
      "Small gratitude can become ek small anchor."
    ]
  },

  peaceful: {
    english: [
      "That sounds calm. Don’t disturb it by checking whether it will last.",
      "Good. Stay slow with it. Peace often comes quietly.",
      "This is a nice moment to breathe and not chase anything.",
      "Let this peaceful feeling be enough for now.",
      "I’m glad it feels lighter. Keep the next few minutes gentle."
    ],
    hinglish: [
      "Yeh calm lag raha hai. Isko disturb mat karo yeh check karke ki kitni der rahega.",
      "Good. Iske saath slow raho. Peace aksar quietly aati hai.",
      "Yeh moment bas breathe karne ke liye achha hai, kuch chase karne ke liye nahi.",
      "Abhi ke liye yeh peaceful feeling enough hai.",
      "Achha hai halka feel ho raha hai. Next few minutes gentle rakho."
    ],
    mix: [
      "Yeh calm lag raha hai. Don’t disturb it by checking kitni der rahega.",
      "Good. Iske saath slow raho. Peace quietly aati hai.",
      "This is a good moment to breathe, kuch chase nahi.",
      "Abhi ke liye this peaceful feeling is enough.",
      "Achha hai halka feel ho raha hai. Keep next few minutes gentle."
    ]
  }
};

/* =========================================================
   NEGATIVE REPLY PACKS
========================================================= */
const negativeReplyPack = {
  sad: {
    english: [
      "That sounds painful. You do not need to turn it into a perfect explanation right now.",
      "I’m here. Sadness doesn’t need to be solved immediately.",
      "This feels like something that has been sitting inside for a while.",
      "You can be soft with yourself here. No need to act okay.",
      "I hear the heaviness in that. Let’s not rush it.",
      "That sentence sounds like your mood is not okay right now, and that matters.",
      "You don’t have to pretend this is fine. We can stay with it gently."
    ],
    hinglish: [
      "Yeh painful lag raha hai. Tumhe abhi isko perfect explain karne ki zaroorat nahi hai.",
      "Main yahin hoon. Sadness ko turant solve karna zaroori nahi hota.",
      "Lag raha hai yeh cheez kaafi time se andar baithi hui hai.",
      "Tum yahan khud ke saath soft reh sakte ho. Okay act karne ki zaroorat nahi.",
      "Isme heaviness feel ho rahi hai. Chalo isko rush nahi karte.",
      "Tumhari line se lag raha hai mood abhi theek nahi hai, aur yeh important hai.",
      "Tumhe pretend karne ki zaroorat nahi ki sab fine hai. Hum gently stay kar sakte hain."
    ],
    mix: [
      "Yeh painful lag raha hai. You don’t need to explain it perfectly.",
      "Main yahin hoon. Sadness ko turant solve karna zaroori nahi.",
      "Lag raha hai yeh kaafi time se andar baitha hua hai.",
      "Tum yahan soft reh sakte ho. No need to act okay.",
      "Isme heaviness hai. Let’s not rush it.",
      "Tumhari line se lag raha hai mood abhi okay nahi hai, and that matters.",
      "Pretend karne ki zaroorat nahi. We can stay with it gently."
    ]
  },

  lonely: {
    english: [
      "Loneliness can make even normal things feel heavier.",
      "I’m here with you. You don’t have to fill the silence perfectly.",
      "It sounds less like being alone and more like not feeling seen.",
      "That kind of loneliness can feel very quiet and very loud at the same time.",
      "You can stay here. I’ll keep replying gently."
    ],
    hinglish: [
      "Loneliness normal cheezon ko bhi zyada heavy bana deti hai.",
      "Main tumhare saath hoon. Silence ko perfectly fill karna zaroori nahi.",
      "Yeh akela hone se zyada unseen feel hone jaisa lag raha hai.",
      "Aisa akelapan ek saath quiet bhi hota hai aur loud bhi.",
      "Tum yahin raho. Main gently reply karta rahunga."
    ],
    mix: [
      "Loneliness normal cheezon ko bhi heavy bana deti hai.",
      "Main tumhare saath hoon. No need to fill the silence perfectly.",
      "Yeh alone se zyada unseen feel hone jaisa lag raha hai.",
      "Aisa loneliness quiet bhi hota hai aur loud bhi.",
      "Tum yahin raho. I’ll keep replying gently."
    ]
  },

  fear: {
    english: [
      "That sounds scary. Let’s make the moment smaller first.",
      "Fear makes the future look closer than it really is.",
      "You don’t have to make a big decision while scared.",
      "First, let your body know you are here, not inside the fear.",
      "I’m here. We can slow this down one breath at a time."
    ],
    hinglish: [
      "Yeh scary lag raha hai. Pehle moment ko chhota karte hain.",
      "Fear future ko actual se zyada close dikha deta hai.",
      "Dar ke time big decision lena zaroori nahi hai.",
      "Pehle body ko signal do ki tum yahan ho, fear ke andar nahi.",
      "Main yahin hoon. Hum isko ek breath at a time slow karenge."
    ],
    mix: [
      "Yeh scary lag raha hai. Let’s make the moment smaller first.",
      "Fear future ko zyada close dikha deta hai.",
      "Dar ke time big decision mat lo.",
      "Pehle body ko signal do ki tum yahan ho.",
      "Main yahin hoon. One breath at a time."
    ]
  },

  confused: {
    english: [
      "Confusion usually means your mind is holding too many tabs open at once.",
      "You don’t need clarity all at once. We can separate one thread.",
      "This sounds like overwhelm, not failure.",
      "Let’s not force an answer. Let’s first name what feels messy.",
      "You can start with: the most confusing part is..."
    ],
    hinglish: [
      "Confusion ka matlab aksar hota hai mind me ek saath bahut tabs open hain.",
      "Tumhe clarity ek saath nahi chahiye. Hum ek thread separate kar sakte hain.",
      "Yeh failure nahi, overwhelm jaisa lag raha hai.",
      "Answer force nahi karte. Pehle name karte hain kya messy lag raha hai.",
      "Tum start kar sakte ho: sabse confusing part yeh hai..."
    ],
    mix: [
      "Confusion ka matlab mind me bahut tabs open hain.",
      "Clarity ek saath nahi chahiye. Let’s separate one thread.",
      "Yeh failure nahi, overwhelm lag raha hai.",
      "Answer force nahi karte. Pehle messy part name karte hain.",
      "Start karo: sabse confusing part yeh hai..."
    ]
  },

  anger: {
    english: [
      "Anger often shows up when something felt unfair or hurtful.",
      "You don’t have to act on the anger immediately. First let it speak safely.",
      "This sounds like anger with hurt underneath it.",
      "Your anger may be trying to protect a softer part of you.",
      "Let’s slow it down before deciding what to do."
    ],
    hinglish: [
      "Gussa aksar tab aata hai jab kuch unfair ya hurtful feel hota hai.",
      "Gusse par turant act karna zaroori nahi. Pehle usse safely bolne do.",
      "Yeh gussa lag raha hai, lekin neeche hurt bhi ho sakta hai.",
      "Tumhara gussa shayad tumhare softer part ko protect kar raha hai.",
      "Kya karna hai decide karne se pehle isko slow karte hain."
    ],
    mix: [
      "Gussa aksar unfair ya hurtful feel hone par aata hai.",
      "Gusse par turant act mat karo. Pehle safely bolne do.",
      "Yeh anger hai, but neeche hurt bhi ho sakta hai.",
      "Tumhara anger softer part ko protect kar raha ho sakta hai.",
      "Before deciding, let’s slow it down."
    ]
  },

  stressed: {
    english: [
      "This sounds like your mind is carrying too many things at once.",
      "Stress makes everything feel urgent. Not everything is urgent.",
      "Let’s separate what is actually next from what is just loud.",
      "You don’t need to solve the whole pile. Only the top piece.",
      "Your body may need calm before your brain can plan."
    ],
    hinglish: [
      "Lag raha hai tumhara mind ek saath bahut cheezein carry kar raha hai.",
      "Stress sab kuch urgent feel karata hai. Sab kuch urgent nahi hota.",
      "Chalo separate karte hain actual next kya hai aur sirf loud kya hai.",
      "Tumhe poora pile solve nahi karna. Sirf top piece.",
      "Brain plan kare usse pehle body ko calm chahiye ho sakta hai."
    ],
    mix: [
      "Lag raha hai mind bahut cheezein ek saath carry kar raha hai.",
      "Stress sab kuch urgent feel karata hai. Not everything is urgent.",
      "Let’s separate actual next from just loud.",
      "Poora pile solve nahi karna. Only top piece.",
      "Body ko calm chahiye before brain can plan."
    ]
  },

  tired: {
    english: [
      "This sounds like more than normal tiredness.",
      "Maybe you don’t need motivation right now. Maybe you need recovery.",
      "Being tired doesn’t mean you’re weak.",
      "Let’s lower the demand for a bit.",
      "Your system may be asking for rest, not another push."
    ],
    hinglish: [
      "Yeh normal tiredness se zyada lag raha hai.",
      "Shayad abhi motivation nahi, recovery chahiye.",
      "Tired hona weakness nahi hota.",
      "Thodi der ke liye demand kam karte hain.",
      "Tumhara system shayad rest maang raha hai, another push nahi."
    ],
    mix: [
      "Yeh normal tiredness se zyada lag raha hai.",
      "Maybe motivation nahi, recovery chahiye.",
      "Tired hona weakness nahi.",
      "Thodi der ke liye demand lower karte hain.",
      "System shayad rest maang raha hai, another push nahi."
    ]
  },

  guilt: {
    english: [
      "Guilt can feel heavy, but it doesn’t mean you are a bad person.",
      "Let’s separate responsibility from self-punishment.",
      "Maybe one part of you regrets it, and another part needs kindness.",
      "You can learn from something without destroying yourself over it.",
      "This needs honesty, not cruelty toward yourself."
    ],
    hinglish: [
      "Guilt heavy hoti hai, par iska matlab yeh nahi ki tum bad person ho.",
      "Responsibility aur self-punishment ko separate karte hain.",
      "Tumhara ek part regret kar raha hai, aur ek part kindness deserve karta hai.",
      "Tum kisi cheez se learn kar sakte ho bina khud ko todhe.",
      "Isme honesty chahiye, khud ke saath cruelty nahi."
    ],
    mix: [
      "Guilt heavy hoti hai, but tum bad person nahi ho.",
      "Responsibility aur self-punishment separate karte hain.",
      "Ek part regret kar raha hai, ek part kindness deserve karta hai.",
      "You can learn without destroying yourself.",
      "Honesty chahiye, cruelty nahi."
    ]
  }
};

/* =========================================================
   MOOD + TOPIC BASED ADVICE
========================================================= */
function getMoodBasedAdvice(style, emotion, topic){
  const packs = {
    happy: [
      {
        english: "Small step: save this good moment somewhere. Write one line: what made today feel better?",
        hinglish: "Small step: is good moment ko save karo. Ek line likho: aaj kya better laga?",
        mix: "Small step: is good moment ko save karo. Write one line: aaj kya better laga?"
      },
      {
        english: "Do one tiny thing that protects this mood: water, music, or a small walk.",
        hinglish: "Ek tiny cheez karo jo is mood ko protect kare: paani, music, ya small walk.",
        mix: "Ek tiny thing karo jo mood protect kare: water, music, ya small walk."
      },
      {
        english: "Don’t immediately search for what can go wrong. Let the good part exist first.",
        hinglish: "Turant yeh mat dhoondo ki kya galat ho sakta hai. Pehle good part ko exist karne do.",
        mix: "Turant mat dhoondo kya wrong ho sakta hai. Let the good part exist."
      }
    ],

    proud: [
      {
        english: "Small step: write what you did and what it took from you. Don’t skip the effort.",
        hinglish: "Small step: likho tumne kya kiya aur usme kitna effort laga. Effort ko skip mat karo.",
        mix: "Small step: likho tumne kya kiya aur effort kitna laga. Don’t skip effort."
      },
      {
        english: "Celebrate in a small way: a song, a walk, or saving it in your diary.",
        hinglish: "Chhote tareeke se celebrate karo: song, walk, ya diary me save.",
        mix: "Small celebrate karo: song, walk, ya diary me save."
      },
      {
        english: "Don’t immediately jump to the next target. Take 2 minutes to feel this one.",
        hinglish: "Turant next target par jump mat karo. 2 minute is win ko feel karo.",
        mix: "Next target par turant jump mat karo. 2 min is win ko feel karo."
      }
    ],

    sad: [
      {
        english: "Small step: name only the heaviest part in one line.",
        hinglish: "Small step: sirf sabse heavy part ko ek line me bolo.",
        mix: "Small step: sabse heavy part ko one line me bolo."
      },
      {
        english: "Do one body-care action first: water, wash face, or lie down for 5 minutes.",
        hinglish: "Pehle ek body-care action karo: paani, face wash, ya 5 min letna.",
        mix: "Pehle body-care action: water, face wash, ya 5 min rest."
      },
      {
        english: "Don’t solve the whole sadness. Just reduce the pressure around it.",
        hinglish: "Puri sadness solve mat karo. Bas uske around pressure kam karo.",
        mix: "Puri sadness solve nahi. Just pressure thoda kam karo."
      }
    ],

    lonely: [
      {
        english: "Small step: send one safe person a simple message: hey, are you free for a bit?",
        hinglish: "Small step: ek safe person ko simple message bhejo: hey, thoda free ho?",
        mix: "Small step: safe person ko message bhejo: hey, thoda free ho?"
      },
      {
        english: "If texting feels too much, stay here and describe the loneliness in one word.",
        hinglish: "Agar text karna too much lag raha hai, yahin raho aur loneliness ko ek word me bolo.",
        mix: "Text too much lag raha hai to yahin raho, loneliness ko one word me bolo."
      },
      {
        english: "Play a familiar song. Sometimes familiar sound helps the room feel less empty.",
        hinglish: "Ek familiar song chalao. Kabhi familiar sound room ko less empty feel karata hai.",
        mix: "Familiar song chalao. Room less empty feel ho sakta hai."
      }
    ],

    fear: [
      {
        english: "Small step: write the exact thing you are afraid will happen.",
        hinglish: "Small step: exact likho ki tumhe kis cheez ke hone ka dar hai.",
        mix: "Small step: exact likho what you fear will happen."
      },
      {
        english: "Look around and name 3 things you can see. Bring your mind back to this room.",
        hinglish: "Around dekho aur 3 cheezein name karo. Mind ko room me wapas lao.",
        mix: "Around dekho, 3 things name karo. Mind ko room me wapas lao."
      },
      {
        english: "Don’t decide anything big while scared. First calm the body.",
        hinglish: "Dar ke time big decision mat lo. Pehle body calm karo.",
        mix: "Dar ke time big decision mat lo. First calm body."
      }
    ],

    stressed: [
      {
        english: "Small step: write top 3 things. Then circle only the one that needs action first.",
        hinglish: "Small step: top 3 cheezein likho. Fir sirf ek circle karo jisme pehle action chahiye.",
        mix: "Small step: top 3 likho. Fir one circle karo jisme first action chahiye."
      },
      {
        english: "Separate urgent from loud. Not every loud thought is urgent.",
        hinglish: "Urgent aur loud ko separate karo. Har loud thought urgent nahi hota.",
        mix: "Urgent aur loud separate karo. Every loud thought urgent nahi hota."
      },
      {
        english: "Set a 10-minute timer and do only the first tiny part.",
        hinglish: "10-minute timer lagao aur sirf pehla tiny part karo.",
        mix: "10-minute timer lagao, only first tiny part karo."
      }
    ],

    confused: [
      {
        english: "Small step: write what you know and what you don’t know in two separate lines.",
        hinglish: "Small step: jo pata hai aur jo nahi pata, dono alag lines me likho.",
        mix: "Small step: what you know aur what you don’t know alag lines me likho."
      },
      {
        english: "Don’t force clarity. First remove one unnecessary option.",
        hinglish: "Clarity force mat karo. Pehle ek unnecessary option hatao.",
        mix: "Clarity force mat karo. First one unnecessary option hatao."
      },
      {
        english: "Tell me the confusing part in one messy sentence. It does not need to be clean.",
        hinglish: "Confusing part ek messy sentence me bolo. Clean hona zaroori nahi.",
        mix: "Confusing part one messy sentence me bolo. Clean zaroori nahi."
      }
    ],

    anger: [
      {
        english: "Small step: do not send any angry message for 10 minutes. Write it in notes first.",
        hinglish: "Small step: 10 min tak angry message send mat karo. Pehle notes me likho.",
        mix: "Small step: 10 min angry message send mat karo. Notes me likho first."
      },
      {
        english: "Ask: what boundary was crossed?",
        hinglish: "Poocho: kaunsi boundary cross hui?",
        mix: "Ask: kaunsi boundary cross hui?"
      },
      {
        english: "Move your body for one minute. Anger has energy that needs exit.",
        hinglish: "1 minute body move karo. Anger me energy hoti hai jise exit chahiye.",
        mix: "1 minute body move karo. Anger needs exit."
      }
    ],

    tired: [
      {
        english: "Small step: lower the demand. Rest for 5 minutes before deciding anything.",
        hinglish: "Small step: demand kam karo. Kuch decide karne se pehle 5 min rest lo.",
        mix: "Small step: demand low karo. 5 min rest before deciding."
      },
      {
        english: "Choose recovery first: water, food, or lying down for a few minutes.",
        hinglish: "Pehle recovery choose karo: paani, food, ya kuch minutes letna.",
        mix: "Recovery first: water, food, ya few minutes rest."
      }
    ],

    neutral: [
      {
        english: "Small step: check what you need right now — rest, clarity, comfort, or action.",
        hinglish: "Small step: check karo abhi kya chahiye — rest, clarity, comfort, ya action.",
        mix: "Small step: check karo abhi kya chahiye — rest, clarity, comfort, ya action."
      },
      {
        english: "Start with one line: right now I feel...",
        hinglish: "Ek line se start karo: abhi mujhe feel ho raha hai...",
        mix: "Start with one line: abhi mujhe feel ho raha hai..."
      }
    ]
  };

  let selected = packs[emotion] || packs.neutral;

  if(topic === "exam" && ["stressed","fear","confused"].includes(emotion)){
    selected = selected.concat([
      {
        english: "For study stress: open the easiest topic and read only 2 headings. That’s enough to start.",
        hinglish: "Study stress ke liye: easiest topic kholo aur sirf 2 headings padho. Start ke liye itna enough hai.",
        mix: "Study stress ke liye: easiest topic kholo aur only 2 headings padho."
      }
    ]);
  }

  if(topic === "relationship" && ["sad","anger","lonely","confused"].includes(emotion)){
    selected = selected.concat([
      {
        english: "For this relationship feeling: decide what hurt most — words, distance, or uncertainty.",
        hinglish: "Relationship wali feeling me: decide karo sabse zyada kya hurt kar raha hai — words, distance, ya uncertainty.",
        mix: "Relationship feeling me decide karo: words, distance, ya uncertainty?"
      }
    ]);
  }

  const item = pickAdvice(selected);
  return item[style] || item.english;
}

/* =========================================================
   REPEAT + SUB-EMOTION LINES
========================================================= */
function getRepeatAwareLine(style, topic){
  if(!isRepeatTopic(topic)) return null;

  const map = {
    english: {
      exam: "It feels like this exam pressure keeps coming back.",
      family: "It feels like this family stress has been sitting with you for a while.",
      relationship: "It feels like this relationship pain keeps returning in your mind.",
      sleep: "It feels like this sleep struggle keeps circling back.",
      selfworth: "It feels like this self-doubt has been sitting with you for a while.",
      friendship: "It feels like this friendship thing has been staying in your mind.",
      future: "It feels like the future is feeling louder than the present right now.",
      selfcare: "It feels like this self-care concern keeps coming back.",
      general: "It feels like this same thing keeps coming back."
    },
    hinglish: {
      exam: "Lag raha hai yeh exam pressure baar baar wapas aa raha hai.",
      family: "Lag raha hai yeh family stress kaafi der se tumhare saath baitha hua hai.",
      relationship: "Lag raha hai yeh relationship wali baat baar baar mind me aa rahi hai.",
      sleep: "Lag raha hai yeh sleep wali struggle baar baar wapas aa rahi hai.",
      selfworth: "Lag raha hai yeh self-doubt kaafi time se tumhare saath hai.",
      friendship: "Lag raha hai yeh friendship wali cheez tumhare mind me atki hui hai.",
      future: "Lag raha hai future abhi present se zyada loud feel ho raha hai.",
      selfcare: "Lag raha hai yeh self-care wali concern baar baar wapas aa rahi hai.",
      general: "Lag raha hai yeh same cheez baar baar wapas aa rahi hai."
    },
    mix: {
      exam: "Lag raha hai yeh exam pressure baar baar wapas aa raha hai.",
      family: "Lag raha hai yeh family stress kaafi time se saath baitha hua hai.",
      relationship: "Lag raha hai yeh relationship wali baat mind me repeat ho rahi hai.",
      sleep: "Lag raha hai yeh sleep struggle baar baar aa rahi hai.",
      selfworth: "Lag raha hai yeh self-doubt kaafi time se saath hai.",
      friendship: "Lag raha hai yeh friendship wali thing mind me atki hui hai.",
      future: "Lag raha hai future abhi present se zyada loud hai.",
      selfcare: "Lag raha hai yeh self-care concern baar baar aa rahi hai.",
      general: "Lag raha hai yeh same thing baar baar wapas aa rahi hai."
    }
  };

  return map[style][topic] || map[style].general;
}

function getSubEmotionLine(style, subEmotion){
  const map = {
    ignored: styleText(
      style,
      "This may be feeling ignored more than simply sad.",
      "Yeh sirf sad feel nahi ho raha, shayad ignored bhi feel ho raha hai.",
      "Yeh sirf sad nahi, maybe ignored bhi feel ho raha hai."
    ),

    rejected: styleText(
      style,
      "This feels closer to rejection than just hurt.",
      "Yeh sirf hurt nahi, rejection ke closer lag raha hai.",
      "Yeh sirf hurt nahi, rejection ke closer lag raha hai."
    ),

    betrayed: styleText(
      style,
      "This sounds more like betrayal than confusion.",
      "Yeh confusion se zyada dhoke jaisa lag raha hai.",
      "Yeh confusion se zyada betrayal jaisa lag raha hai."
    ),

    numb: styleText(
      style,
      "This may be numbness, not absence of feeling.",
      "Yeh shayad numbness hai, feeling ka absence nahi.",
      "Yeh shayad numbness hai, feeling ka absence nahi."
    ),

    "future-fear": styleText(
      style,
      "You may be looking for certainty more than answers.",
      "Shayad tum answers se zyada certainty dhoond rahe ho.",
      "Shayad tum answers se zyada certainty dhoond rahe ho."
    ),

    "past-regret": styleText(
      style,
      "This sounds like your mind is stuck in the past, not just sadness.",
      "Lag raha hai mind past me atka hua hai, sirf sadness nahi hai.",
      "Lag raha hai mind past me atka hua hai, sirf sadness nahi hai."
    ),

    burnout: styleText(
      style,
      "This sounds more like burnout than ordinary tiredness.",
      "Yeh normal tiredness se zyada burnout jaisa lag raha hai.",
      "Yeh normal tiredness se zyada burnout jaisa lag raha hai."
    ),

    pressure: styleText(
      style,
      "This may be pressure sitting on top of everything else.",
      "Yeh pressure baaki sab cheezon ke upar baitha hua lag raha hai.",
      "Yeh pressure baaki sab cheezon ke upar baitha hua lag raha hai."
    ),

    shame: styleText(
      style,
      "This may have shame mixed into it, not just pain.",
      "Yeh sirf pain nahi, shayad sharam bhi mixed hai.",
      "Yeh sirf pain nahi, maybe shame bhi mixed hai."
    ),

    "mixed-positive-fear": styleText(
      style,
      "This may be happiness mixed with fear of losing the good moment.",
      "Yeh khushi ke saath us good moment ko lose karne ka dar bhi ho sakta hai.",
      "Yeh happiness ke saath good moment lose hone ka fear bhi ho sakta hai."
    ),

    "not-good": styleText(
      style,
      "I’m reading this as not feeling okay, not as a positive thing.",
      "Main isko positive nahi, balki mood theek nahi hai aise read kar raha hoon.",
      "Main isko positive nahi, mood okay nahi hai aise read kar raha hoon."
    ),

    neutral: null
  };

  return map[subEmotion] || null;
}
/* =========================================================
   FULL FINAL UPDATED SCRIPT.JS — PART 4/4
   Final stranger engine + followups + init
========================================================= */

/* =========================================================
   SHORT / HUMAN REPLY BUILDER
========================================================= */
function maybeAddNeedQuestion(style){
  if(chatContext.turns > 2) return null;
  if(Math.random() > 0.25) return null;

  return styleText(
    style,
    "What do you need from me right now: listening, comfort, calm, or a small step?",
    "Tumhe abhi mujhse kya chahiye: bas sunna, comfort, calm, ya small step?",
    "Tumhe abhi mujhse kya chahiye: listening, comfort, calm, ya small step?"
  );
}

function shouldGiveLongReplyForShortMessage(emotion, intensity, text){
  const t = normalizeText(text);

  if(intensity === "high") return true;

  const heavyShortTriggers = [
    "too much",
    "heavy",
    "crying",
    "scared",
    "akela",
    "lonely",
    "sad",
    "blank",
    "nhi ho rha",
    "nahi ho raha",
    "acha feel nahi",
    "acha feel nhi",
    "not feeling good",
    "i am not okay",
    "not okay",
    "kharab",
    "bura"
  ];

  if(heavyShortTriggers.some(x => t.includes(x))) return true;
  if(["sad","lonely","fear","stressed","guilt","anger"].includes(emotion)) return Math.random() < 0.55;

  return false;
}

function buildShortHumanReply(style, originalText = ""){
  const emotion = chatContext.lastEmotion || "neutral";
  const intensity = detectIntensity(originalText);

  if(["happy","proud","excited","grateful","peaceful"].includes(emotion)){
    const pack = positiveReplyPack[emotion] || positiveReplyPack.happy;
    let reply = pick(pack[style] || pack.english);

    if(currentMode === "advice" || normalizeText(originalText).includes("kya karu") || normalizeText(originalText).includes("what to do")){
      reply += "\n\n" + getMoodBasedAdvice(style, emotion, chatContext.lastTopic || "general");
    }

    return reply + maybeEmoji(emotion);
  }

  if(["sad","lonely","fear","confused","anger","stressed","tired","guilt"].includes(emotion)){
    const pack = negativeReplyPack[emotion] || negativeReplyPack.sad;
    let reply = pick(pack[style] || pack.english);

    if(shouldGiveLongReplyForShortMessage(emotion, intensity, originalText)){
      reply += "\n\n" + getMoodBasedAdvice(style, emotion, chatContext.lastTopic || "general");
    }

    return reply + maybeEmoji(emotion);
  }

  const pool = {
    listen: styleText(
      style,
      pick([
        "I’m here. Go on.",
        "Okay. I’m listening.",
        "You can say it slowly.",
        "I’m not rushing you.",
        "Start anywhere."
      ]),
      pick([
        "Main yahin hoon. Tum bolte raho.",
        "Theek hai. Main sun raha hoon.",
        "Tum dheere dheere bol sakte ho.",
        "Main tumhe rush nahi karunga.",
        "Kahin se bhi start kar do."
      ]),
      pick([
        "Main yahin hoon. Go on.",
        "Theek hai. I’m listening.",
        "Tum slowly bol sakte ho.",
        "I won’t rush you.",
        "Kahin se bhi start kar do."
      ])
    ),

    comfort: styleText(
      style,
      pick([
        "I’m here gently.",
        "Okay. You do not need to hold this alone.",
        "I’m with you.",
        "You can be soft here.",
        "No need to pretend."
      ]),
      pick([
        "Main softly yahin hoon.",
        "Theek hai. Tumhe yeh akela hold nahi karna.",
        "Main tumhare saath hoon.",
        "Tum yahan soft reh sakte ho.",
        "Pretend karne ki zaroorat nahi."
      ]),
      pick([
        "Main softly yahin hoon.",
        "Theek hai. You do not need to hold this alone.",
        "Main tumhare saath hoon.",
        "Tum yahan soft reh sakte ho.",
        "No need to pretend."
      ])
    ),

    calm: styleText(
      style,
      pick([
        "Okay. One slow breath first.",
        "Let’s slow this down.",
        "Relax your shoulders once.",
        "We can make this moment smaller.",
        "Stay with one breath."
      ]),
      pick([
        "Theek hai. Pehle ek slow breath lo.",
        "Isse thoda slow karte hain.",
        "Ek baar shoulders relax karo.",
        "Is moment ko chhota karte hain.",
        "Bas ek breath ke saath raho."
      ]),
      pick([
        "Theek hai. One slow breath first.",
        "Let’s isse thoda slow karte hain.",
        "Shoulders ek baar relax karo.",
        "Is moment ko smaller karte hain.",
        "Bas one breath ke saath raho."
      ])
    ),

    advice: styleText(
      style,
      pick([
        "Okay. Let’s make this smaller.",
        "We only need one next step.",
        "Let’s start with the easiest part.",
        "First, choose one small action.",
        "Don’t solve everything. Pick the next piece."
      ]),
      pick([
        "Theek hai. Isse chhota karte hain.",
        "Hume bas ek next step chahiye.",
        "Sabse easy part se start karte hain.",
        "Pehle ek small action choose karo.",
        "Sab solve nahi. Bas next piece pick karo."
      ]),
      pick([
        "Theek hai. Isse smaller karte hain.",
        "Hume bas one next step chahiye.",
        "Sabse easy part se start karte hain.",
        "Pehle one small action choose karo.",
        "Sab solve nahi. Bas next piece pick karo."
      ])
    ),

    name: styleText(
      style,
      pick([
        "This may be more than one feeling.",
        "Let’s get closer to the feeling.",
        "What feels closest: hurt, fear, pressure, or heaviness?",
        "It may not have one clean name yet.",
        "We can name it slowly."
      ]),
      pick([
        "Yeh ek se zyada feeling bhi ho sakti hai.",
        "Chalo feeling ke thoda aur paas jaate hain.",
        "Sabse close kya lag raha hai: hurt, fear, pressure, ya heaviness?",
        "Shayad iska ek clean name abhi nahi hai.",
        "Hum isko slowly name kar sakte hain."
      ]),
      pick([
        "Yeh more than one feeling bhi ho sakti hai.",
        "Chalo feeling ke thoda aur paas jaate hain.",
        "Sabse close kya lag raha hai: hurt, fear, pressure, ya heaviness?",
        "Maybe iska one clean name abhi nahi hai.",
        "Hum isko slowly name kar sakte hain."
      ])
    )
  };

  return pool[currentMode] || pool.listen;
}

/* =========================================================
   CALM / NEED / NAME REPLIES
========================================================= */
function getCalmStartReply(style){
  return styleText(
    style,
    `Okay. Let’s slow this down together.

Inhale for 4.
Hold for 4.
Exhale for 6.

Do that 4 times.
Then tell me only this: “a little better” or “still hard.”`,
    `Theek hai. Abhi bas mere saath slow ho jao.

4 sec inhale.
4 sec hold.
6 sec exhale.

Yeh 4 baar karo.
Phir mujhe sirf itna likho: “thoda better” ya “still hard”.`,
    `Theek hai. Let’s slow this down together.

4 sec inhale.
4 sec hold.
6 sec exhale.

Yeh 4 baar karo.
Phir mujhe sirf itna likho: “thoda better” ya “still hard”.`
  );
}

function buildNeedReply(style){
  return styleText(
    style,
    "Right now you may need one of four things: someone to listen, comfort, calm, or one small next step.",
    "Abhi tumhe shayad chaar cheezon me se ek chahiye: koi sunne wala, comfort, calm, ya ek small next step.",
    "Abhi tumhe shayad chaar cheezon me se ek chahiye: listening, comfort, calm, ya one small next step."
  );
}

function buildNameReply(style, emotion, subEmotion){
  const mainMap = {
    english: {
      happy: "This sounds like happiness or relief.",
      proud: "This sounds like pride, achievement, or self-recognition.",
      excited: "This sounds like excitement or hopeful energy.",
      grateful: "This sounds like gratitude or soft appreciation.",
      peaceful: "This sounds like calmness or emotional lightness.",
      sad: "This may be sadness, hurt, or emotional heaviness.",
      lonely: "This may be loneliness or disconnection.",
      fear: "This may be fear, anxiety, or inner alarm.",
      confused: "This may be a mix of confusion and overwhelm.",
      tired: "This may be tiredness mixed with emotional overload.",
      guilt: "This may be guilt or self-blame.",
      anger: "This may be hurt mixed with anger or frustration.",
      stressed: "This may be stress, pressure, or mental overload.",
      neutral: "This may not be one clean feeling yet."
    },

    hinglish: {
      happy: "Yeh happiness ya relief jaisa lag raha hai.",
      proud: "Yeh pride, achievement, ya self-recognition jaisa lag raha hai.",
      excited: "Yeh excitement ya hopeful energy jaisa lag raha hai.",
      grateful: "Yeh gratitude ya soft appreciation jaisa lag raha hai.",
      peaceful: "Yeh calmness ya emotional lightness jaisa lag raha hai.",
      sad: "Yeh sadness, hurt, ya emotional heaviness ho sakti hai.",
      lonely: "Yeh loneliness ya disconnect ho sakta hai.",
      fear: "Yeh fear, anxiety, ya inner alarm ho sakta hai.",
      confused: "Yeh confusion aur overwhelm ka mix ho sakta hai.",
      tired: "Yeh tiredness ke saath emotional overload bhi ho sakta hai.",
      guilt: "Yeh guilt ya self-blame ho sakta hai.",
      anger: "Yeh hurt ke saath gussa ya frustration ho sakta hai.",
      stressed: "Yeh stress, pressure, ya mental overload ho sakta hai.",
      neutral: "Ho sakta hai yeh abhi ek clean single feeling na ho."
    },

    mix: {
      happy: "Yeh happiness ya relief jaisa lag raha hai.",
      proud: "Yeh pride, achievement, ya self-recognition jaisa lag raha hai.",
      excited: "Yeh excitement ya hopeful energy jaisa lag raha hai.",
      grateful: "Yeh gratitude ya soft appreciation jaisa lag raha hai.",
      peaceful: "Yeh calmness ya emotional lightness jaisa lag raha hai.",
      sad: "Yeh sadness, hurt, ya emotional heaviness ho sakti hai.",
      lonely: "Yeh loneliness ya disconnection ho sakta hai.",
      fear: "Yeh fear, anxiety, ya inner alarm ho sakta hai.",
      confused: "Yeh confusion aur overwhelm ka mix ho sakta hai.",
      tired: "Yeh tiredness ke saath emotional overload bhi ho sakta hai.",
      guilt: "Yeh guilt ya self-blame ho sakta hai.",
      anger: "Yeh hurt ke saath anger ya frustration ho sakta hai.",
      stressed: "Yeh stress, pressure, ya mental overload ho sakta hai.",
      neutral: "Ho sakta hai yeh abhi one clean feeling na ho."
    }
  };

  const subLine = getSubEmotionLine(style, subEmotion);

  const close = styleText(
    style,
    "If you want, I can help narrow it down further.",
    "Agar chaho to main isse aur narrow down karne me help kar sakta hoon.",
    "Agar chaho to main isse aur narrow down karne me help kar sakta hoon."
  );

  return [mainMap[style][emotion] || mainMap[style].neutral, subLine, close].filter(Boolean).join("\n\n");
}

/* =========================================================
   STEP DETAILS / FOLLOW-UP LOGIC
========================================================= */
function getStepDetail(topic, stage, style){
  const details = {
    exam: {
      1: styleText(style, "Small step: open just the easiest topic, not the whole syllabus.", "Small step: sirf easiest topic kholo, poora syllabus nahi.", "Small step: sirf easiest topic kholo, poora syllabus nahi."),
      2: styleText(style, "How?\n1. Open the book\n2. choose the easiest topic\n3. read only 2 headings\n4. sit with it for 10 minutes", "Kaise?\n1. Book kholo\n2. easiest topic choose karo\n3. sirf 2 headings dekho\n4. bas 10 minutes baitho", "Kaise?\n1. Book kholo\n2. easiest topic choose karo\n3. sirf 2 headings dekho\n4. just 10 minutes baitho"),
      3: styleText(style, "Because the whole syllabus feels threatening when your mind is already stressed.", "Kyunki stressed mind ko poora syllabus threat jaisa lagta hai.", "Kyunki stressed mind ko poora syllabus threat jaisa lagta hai."),
      4: styleText(style, "After that, do another 10 minutes only if it feels manageable.", "Uske baad sirf tab next 10 minutes karo agar manageable lage.", "Uske baad sirf tab next 10 minutes karo agar manageable lage.")
    },

    family: {
      1: styleText(style, "Small step: choose one exact moment that affected you most.", "Small step: ek exact moment choose karo jisne tumhe sabse zyada affect kiya.", "Small step: ek exact moment choose karo jisne tumhe sabse zyada affect kiya."),
      2: styleText(style, "How?\nWrite: What affected me most was when...", "Kaise?\nLikho: Sabse zyada mujhe tab affect hua jab...", "Kaise?\nLikho: Sabse zyada mujhe tab affect hua jab..."),
      3: styleText(style, "Because one exact moment brings more clarity than the whole story.", "Kyunki ek exact moment poori story se zyada clarity deta hai.", "Kyunki ek exact moment poori story se zyada clarity deta hai."),
      4: styleText(style, "After that, we can see whether it felt more like hurt, pressure, or misunderstanding.", "Uske baad hum dekh sakte hain woh zyada hurt tha, pressure tha, ya misunderstanding.", "Uske baad hum dekh sakte hain woh zyada hurt tha, pressure tha, ya misunderstanding.")
    },

    relationship: {
      1: styleText(style, "Small step: decide what affected you most — the words, the distance, or the uncertainty.", "Small step: decide karo sabse zyada kis cheez ne affect kiya — words, distance, ya uncertainty.", "Small step: decide karo sabse zyada kis cheez ne affect kiya — words, distance, ya uncertainty."),
      2: styleText(style, "How?\nChoose one:\n1. what was said\n2. what changed\n3. what is still unclear", "Kaise?\nEk choose karo:\n1. jo kaha gaya\n2. jo badal gaya\n3. jo clear nahi hai", "Kaise?\nEk choose karo:\n1. jo kaha gaya\n2. jo change hua\n3. jo clear nahi hai"),
      3: styleText(style, "Because your mind keeps replaying the whole story. One part is easier to hold.", "Kyunki mind poori story replay karta rehta hai. Ek part pakadna easier hota hai.", "Kyunki mind poori story replay karta rehta hai. Ek part easier hota hai hold karna."),
      4: styleText(style, "After that, we can name that one part more clearly.", "Uske baad hum us ek part ko aur clearly name kar sakte hain.", "Uske baad hum us ek part ko more clearly name kar sakte hain.")
    },

    sleep: {
      1: styleText(style, "Small step: keep the phone aside and lower the light for 2 minutes.", "Small step: phone side me rakho aur 2 minute ke liye light kam karo.", "Small step: phone side me rakho aur 2 minute ke liye light kam karo."),
      2: styleText(style, "How?\nScreen face down.\nLight lower.\n6 slow exhales.", "Kaise?\nScreen ulta rakho.\nLight kam karo.\n6 slow exhales karo.", "Kaise?\nScreen ulta rakho.\nLight kam karo.\n6 slow exhales karo."),
      3: styleText(style, "Because your body first needs a signal that danger has reduced.", "Kyunki body ko pehle signal chahiye hota hai ki danger kam hua hai.", "Kyunki body ko pehle signal chahiye hota hai ki danger kam hua hai."),
      4: styleText(style, "After that, send me one word: anxious, restless, tired, or blank.", "Uske baad mujhe ek word bhejo: anxious, restless, tired, ya blank.", "Uske baad mujhe ek word bhejo: anxious, restless, tired, ya blank.")
    },

    selfworth: {
      1: styleText(style, "Small step: separate what happened from what it made you believe about yourself.", "Small step: jo hua usse alag karo, aur uska apne baare me matlab jo nikla usse alag karo.", "Small step: jo hua usse alag karo, aur uska apne baare me jo meaning nikla usse alag karo."),
      2: styleText(style, "How?\nLine 1: what happened\nLine 2: what I made it mean about me", "Kaise?\nLine 1: kya hua\nLine 2: maine iska apne baare me kya matlab nikala", "Kaise?\nLine 1: kya hua\nLine 2: maine iska apne baare me kya meaning nikala"),
      3: styleText(style, "Because pain and self-judgment often get mixed together.", "Kyunki pain aur self-judgement aksar mix ho jate hain.", "Kyunki pain aur self-judgement aksar mix ho jate hain."),
      4: styleText(style, "After that, we can see whether the bigger part is pain or self-criticism.", "Uske baad hum dekh sakte hain bigger part pain hai ya self-criticism.", "Uske baad hum dekh sakte hain bigger part pain hai ya self-criticism.")
    },

    friendship: {
      1: styleText(style, "Small step: name what you needed from that friend — reply, effort, honesty, or presence.", "Small step: name karo tumhe us dost se kya chahiye tha — reply, effort, honesty, ya presence.", "Small step: name karo tumhe us friend se kya chahiye tha — reply, effort, honesty, ya presence."),
      2: styleText(style, "How?\nWrite: I needed ___, but I felt ___.", "Kaise?\nLikho: mujhe ___ chahiye tha, par mujhe ___ feel hua.", "Kaise?\nLikho: I needed ___, but mujhe ___ feel hua."),
      3: styleText(style, "Because friendship pain often becomes clearer when the need is named.", "Kyunki friendship pain tab clear hoti hai jab need name hoti hai.", "Kyunki friendship pain clearer hoti hai jab need name hoti hai."),
      4: styleText(style, "After that, decide whether you need a conversation, distance, or closure.", "Uske baad decide karo tumhe conversation chahiye, distance, ya closure.", "Uske baad decide karo conversation chahiye, distance, ya closure.")
    },

    future: {
      1: styleText(style, "Small step: separate what is in your control this week from what is future noise.", "Small step: is week tumhare control me kya hai aur future noise kya hai, separate karo.", "Small step: this week control me kya hai aur future noise kya hai, separate karo."),
      2: styleText(style, "How?\nMake two lines:\nControl this week:\nNot in control yet:", "Kaise?\nDo lines banao:\nIs week control me:\nAbhi control me nahi:", "Kaise?\nTwo lines banao:\nControl this week:\nAbhi control me nahi:"),
      3: styleText(style, "Because future fear becomes smaller when it is sorted into now vs later.", "Kyunki future fear chhota hota hai jab wo now vs later me sort hota hai.", "Kyunki future fear smaller hota hai jab now vs later me sort hota hai."),
      4: styleText(style, "After that, pick one thing from the control list only.", "Uske baad sirf control list se ek cheez pick karo.", "Uske baad control list se only one thing pick karo.")
    },

    selfcare: {
      1: styleText(style, "Small step: choose care, not criticism. What is one gentle thing your body needs?", "Small step: criticism nahi, care choose karo. Body ko abhi ek gentle cheez kya chahiye?", "Small step: criticism nahi, care choose karo. Body ko one gentle thing kya chahiye?"),
      2: styleText(style, "How?\nPick one: water, shower, sleep, walk, or writing what you feel.", "Kaise?\nEk pick karo: water, shower, sleep, walk, ya jo feel ho raha hai likhna.", "Kaise?\nOne pick karo: water, shower, sleep, walk, ya feeling write karna."),
      3: styleText(style, "Because self-care works better when it starts gently, not from self-hate.", "Kyunki self-care better kaam karti hai jab wo gently start hoti hai, self-hate se nahi.", "Kyunki self-care better work karti hai jab gently start hoti hai, self-hate se nahi."),
      4: styleText(style, "After that, keep the next step small enough that you can actually do it.", "Uske baad next step itna small rakho ki tum actually kar sako.", "Uske baad next step itna small rakho ki tum actually kar sako.")
    },

    general: {
      1: styleText(style, "Small step: say the main thing in one line.", "Small step: main cheez ko ek line me bolo.", "Small step: main thing ko one line me bolo."),
      2: styleText(style, "How?\nStart with: Right now the main thing is...", "Kaise?\nStart karo: abhi main cheez yeh hai ki...", "Kaise?\nStart karo: right now main cheez yeh hai ki..."),
      3: styleText(style, "Because one clear line can anchor a spinning mind.", "Kyunki ek clear line spinning mind ko anchor kar sakti hai.", "Kyunki ek clear line spinning mind ko anchor kar sakti hai."),
      4: styleText(style, "After that, we can see whether you need comfort, calm, or a next step.", "Uske baad hum dekh sakte hain tumhe comfort chahiye, calm chahiye, ya next step.", "Uske baad hum dekh sakte hain tumhe comfort chahiye, calm chahiye, ya next step.")
    }
  };

  const data = details[topic] || details.general;
  return data[stage] || data[1];
}

function buildWhatToDoReply(style, topic, emotion){
  setPendingBridge("small_step", { topic, emotion });

  const open = styleText(
    style,
    pick([
      "You do not need the full solution right now.",
      "Let’s reduce this to one manageable step.",
      "First we’ll make the problem smaller.",
      "You don’t need a perfect plan. Just one next move.",
      "Okay. Let’s find the lightest next step."
    ]),
    pick([
      "Abhi full solution ki zaroorat nahi hai.",
      "Chalo isse ek manageable step tak le aate hain.",
      "Pehle problem ko thoda chhota karte hain.",
      "Tumhe perfect plan nahi chahiye. Bas ek next move.",
      "Theek hai. Sabse halka next step dhoondte hain."
    ]),
    pick([
      "Abhi full solution ki zaroorat nahi hai.",
      "Let’s isse one manageable step tak le aate hain.",
      "Pehle problem ko thoda smaller karte hain.",
      "Perfect plan nahi chahiye. Just one next move.",
      "Theek hai. Lightest next step dhoondte hain."
    ])
  );

  const moodAdvice = getMoodBasedAdvice(style, emotion, topic);
  chatContext.lastSuggestedStep = moodAdvice;

  const close = styleText(
    style,
    "If you want, ask me: how do I do it? or what after that?",
    "Agar chaho to pooch sakte ho: kaise karu? ya uske baad kya?",
    "Agar chaho to pooch sakte ho: how do I do it? ya uske baad kya?"
  );

  return [open, moodAdvice, close].filter(Boolean).join("\n\n");
}

function maybeAddFollowUp(mode, style){
  if(Math.random() > 0.42) return null;

  if(mode === "listen"){
    chatContext.lastQuestionAsked = "smallest_part";

    return styleText(
      style,
      pick([
        "What feels most present right now?",
        "Do you want to start with the smallest part?",
        "What is the part you keep returning to?",
        "What part of this do you want me to hear first?",
        "What word fits this moment best?"
      ]),
      pick([
        "Abhi sabse present kya feel ho raha hai?",
        "Kya tum sabse chhote part se start karna chahoge?",
        "Kaunsi cheez baar baar mind me aa rahi hai?",
        "Isme se pehle tum chahte ho main kya sunu?",
        "Is moment ke liye kaunsa word fit hota hai?"
      ]),
      pick([
        "Abhi sabse present kya feel ho raha hai?",
        "Kya tum smallest part se start karna chahoge?",
        "Kaunsi cheez baar baar mind me aa rahi hai?",
        "Isme se pehle tum chahte ho main kya hear karu?",
        "Is moment ke liye kaunsa word fit hota hai?"
      ])
    );
  }

  if(mode === "comfort"){
    chatContext.lastQuestionAsked = "comfort_or_company";

    return styleText(
      style,
      pick([
        "Do you want comfort, or just quiet company?",
        "Should I stay soft and quiet with you, or say a little more?",
        "Do you want reassurance or just presence?",
        "Would it help if I stayed with you for a bit?",
        "Do you want a soft line or a small next step?"
      ]),
      pick([
        "Tumhe comfort chahiye ya bas quiet company?",
        "Main softly yahin rahun ya thoda aur bolun?",
        "Tumhe reassurance chahiye ya bas presence?",
        "Kya help karega agar main kuch der yahin rahun?",
        "Tumhe soft line chahiye ya small next step?"
      ]),
      pick([
        "Tumhe comfort chahiye ya just quiet company?",
        "Main softly yahin rahun ya thoda aur bolun?",
        "Tumhe reassurance chahiye ya just presence?",
        "Kya help karega if I stay yahin for a bit?",
        "Tumhe soft line chahiye ya small next step?"
      ])
    );
  }

  if(mode === "calm"){
    chatContext.lastQuestionAsked = "body_or_mind";

    return styleText(
      style,
      pick([
        "Does it feel heavier in the body or the mind?",
        "Is your chest heavy, or are the thoughts fast?",
        "Should we calm the body first or sort the thought first?",
        "Where do you feel this most?",
        "Do you want a breathing reset?"
      ]),
      pick([
        "Yeh body me zyada heavy lag raha hai ya mind me?",
        "Chest heavy lag rahi hai ya thoughts fast hain?",
        "Pehle body calm karein ya thought sort karein?",
        "Yeh sabse zyada kahan feel ho raha hai?",
        "Kya breathing reset chahiye?"
      ]),
      pick([
        "Yeh body me zyada heavy lag raha hai ya mind me?",
        "Chest heavy hai ya thoughts fast hain?",
        "Pehle body calm karein ya thought sort?",
        "Yeh sabse zyada kahan feel ho raha hai?",
        "Breathing reset chahiye?"
      ])
    );
  }

  if(mode === "advice"){
    chatContext.lastQuestionAsked = "break_down_more";

    return styleText(
      style,
      pick([
        "Should I break this step down more?",
        "Do you want the how, or just the next step?",
        "Should I make this even smaller?",
        "Do you want a 2-minute version of this?",
        "Do you want me to choose the easiest option?"
      ]),
      pick([
        "Main is step ko aur tod du?",
        "Tumhe kaise chahiye ya bas next step?",
        "Isko aur chhota kar du?",
        "Tumhe iska 2-minute version chahiye?",
        "Kya main easiest option choose kar du?"
      ]),
      pick([
        "Main is step ko aur break kar du?",
        "Tumhe how chahiye ya bas next step?",
        "Isko aur smaller kar du?",
        "2-minute version chahiye?",
        "Kya main easiest option choose kar du?"
      ])
    );
  }

  if(mode === "name"){
    chatContext.lastQuestionAsked = "close_word";

    return styleText(
      style,
      pick([
        "What feels closest: hurt, fear, heaviness, pressure, or relief?",
        "Does this feel more like pressure or sadness?",
        "Is this more in your chest, head, or stomach?",
        "Would you call it sadness, stress, or tiredness?",
        "Does it feel soft, sharp, heavy, or empty?"
      ]),
      pick([
        "Sabse close kya lag raha hai: hurt, fear, heaviness, pressure, ya relief?",
        "Yeh pressure jaisa lag raha hai ya sadness jaisa?",
        "Yeh chest, head, ya stomach me zyada feel ho raha hai?",
        "Isko sadness, stress, ya tiredness bolna zyada fit hai?",
        "Yeh soft, sharp, heavy, ya empty lag raha hai?"
      ]),
      pick([
        "Sabse close kya lag raha hai: hurt, fear, heaviness, pressure, ya relief?",
        "Yeh pressure jaisa lag raha hai ya sadness jaisa?",
        "Yeh chest, head, ya stomach me zyada feel ho raha hai?",
        "Sadness, stress, ya tiredness zyada fit hai?",
        "Yeh soft, sharp, heavy, ya empty lag raha hai?"
      ])
    );
  }

  return null;
}

function handleFollowup(lower, followupType, style){
  if(!chatContext.pendingFollowup) return null;

  const p = chatContext.pendingFollowup;

  if(p.type === "small_step"){
    const topic = p.data.topic || "general";

    if(followupType === "ask_step"){
      p.step = 1;
      return getStepDetail(topic, 1, style);
    }

    if(followupType === "ask_how"){
      p.step = 2;
      return getStepDetail(topic, 2, style);
    }

    if(followupType === "ask_why"){
      p.step = 3;
      return getStepDetail(topic, 3, style);
    }

    if(followupType === "ask_then"){
      p.step = 4;
      return getStepDetail(topic, 4, style);
    }

    if(followupType === "still_hard"){
      return styleText(
        style,
        "Okay. Then we make it even smaller. What is the easiest possible version of that step?",
        "Theek hai. To aur chhota karte hain. Sabse easiest version kya ho sakta hai?",
        "Theek hai. To aur smaller karte hain. Sabse easiest version kya ho sakta hai?"
      );
    }

    if(isDirectFollowup(lower, followupType)){
      const next = Math.min((p.step || 0) + 1, 4);
      p.step = next;
      return getStepDetail(topic, next, style);
    }
  }

  return null;
}

/* =========================================================
   FINAL REPLY ENGINE
========================================================= */
function generateReply(text){
  const lower = normalizeText(text);
  const style = getReplyStyle();
  const analysis = analyzeInputOnly(text);

  const emotion = analysis.emotion;
  const subEmotion = analysis.subEmotion;
  const topic = analysis.topic;
  const needIntent = analysis.needIntent;
  const intent = analysis.intent;
  const intensity = analysis.intensity;
  const confidence = analysis.confidence || "soft";

  chatContext.lastEmotion = emotion !== "neutral" ? emotion : (chatContext.lastEmotion || "neutral");
  chatContext.lastSubEmotion = subEmotion !== "neutral" ? subEmotion : (chatContext.lastSubEmotion || "neutral");
  chatContext.lastTopic = topic !== "general" ? topic : (chatContext.lastTopic || "general");
  chatContext.lastIntent = intent;
  chatContext.lastNeed = needIntent;
  chatContext.lastConfidence = confidence;

  updateRepeatTopic(chatContext.lastTopic);

  if(emotion !== "neutral"){
    addMemoryFact(`${chatContext.lastTopic} • ${emotion}`);
  }

  updateHiddenLogic(
    chatContext.lastTopic,
    chatContext.lastEmotion,
    buildMemoryStripText(),
    buildContextHint(style),
    confidence
  );

  if(isHighRisk(lower)){
    clearPendingBridge();
    return getCrisisReply(style);
  }

  if(intent === "repair_request"){
    clearPendingBridge();
    return getRepairReply(style);
  }

  const followupType = detectFollowupType(lower);

  if(isDirectFollowup(lower, followupType)){
    const followReply = handleFollowup(lower, followupType, style);
    if(followReply) return followReply;
  }

  const directNeed = shortDirectReply(needIntent, style);
  if(directNeed){
    if(needIntent === "listen_request") currentMode = "listen";
    if(needIntent === "comfort_request") currentMode = "comfort";
    if(needIntent === "calm_request") currentMode = "calm";
    if(needIntent === "advice_request") currentMode = "advice";
    if(needIntent === "name_request") currentMode = "name";

    clearPendingBridge();
    return directNeed + maybeEmoji(chatContext.lastEmotion);
  }

  if(intent === "what_to_do"){
    currentMode = "advice";
    return buildWhatToDoReply(style, chatContext.lastTopic, chatContext.lastEmotion);
  }

  if(intent === "what_am_i_feeling"){
    currentMode = "name";
    clearPendingBridge();
    return buildNameReply(style, chatContext.lastEmotion, chatContext.lastSubEmotion);
  }

  if(intent === "need_check"){
    clearPendingBridge();
    return buildNeedReply(style);
  }

  if(currentMode === "calm" && (lower.includes("panic") || lower.includes("ghabra") || lower.includes("overthink") || lower.includes("fast thoughts"))){
    setPendingBridge("calm_sequence", { topic:chatContext.lastTopic, emotion:chatContext.lastEmotion });
    return getCalmStartReply(style);
  }

  if(isOneWordStyle(lower)){
    const one = oneWordReply(lower, style);
    if(one && one !== "I’m here." && one !== "Main yahin hoon." && one !== "Main yahin hoon. I’m here."){
      if(shouldGiveLongReplyForShortMessage(chatContext.lastEmotion, intensity, lower)){
        return one + "\n\n" + getMoodBasedAdvice(style, chatContext.lastEmotion, chatContext.lastTopic) + maybeEmoji(chatContext.lastEmotion);
      }
      return one + maybeEmoji(chatContext.lastEmotion);
    }
  }

  let parts = [];

  const hesitation = maybeHesitation(style);
  if(hesitation && Math.random() < 0.45){
    parts.push(hesitation.trim());
  }

  const mainReply = buildShortHumanReply(style, text);
  if(mainReply) parts.push(mainReply);

  const subLine = getSubEmotionLine(style, chatContext.lastSubEmotion);
  if(subLine && Math.random() < 0.55){
    parts.push(subLine);
  }

  const repeatLine = getRepeatAwareLine(style, chatContext.lastTopic);
  if(repeatLine && Math.random() < 0.35){
    parts.push(repeatLine);
  }

  if(currentMode === "advice" && Math.random() < 0.75){
    parts.push(getMoodBasedAdvice(style, chatContext.lastEmotion, chatContext.lastTopic));
  }

  const needQ = maybeAddNeedQuestion(style);
  if(needQ) parts.push(needQ);

  const followQ = maybeAddFollowUp(currentMode, style);
  if(followQ) parts.push(followQ);

  let finalReply = parts.filter(Boolean).join("\n\n");

  if(!finalReply.trim()){
    finalReply = styleText(
      style,
      "I’m here. Tell me a little more, even if it comes out messy.",
      "Main yahin hoon. Thoda aur batao, chahe messy hi nikle.",
      "Main yahin hoon. Tell me thoda aur, messy bhi chalega."
    );
  }

  return finalReply;
}

/* =========================================================
   AUTOSAVE + INIT
========================================================= */
document.addEventListener("input", e => {
  if(e.target.id === "notes") autoSaveNotes();

  if(e.target.id === "diaryText" && currentDiaryFolder){
    localStorage.setItem("diary_" + currentDiaryFolder, e.target.value);
  }
});

window.addEventListener("load", () => {
  createRain();
  loadSavedNotes();
  loadMood();
  loadCurrentWorkingChat();
  renderSavedChatsList();
  loadTheme();
  setupAudioSync();

  updateHiddenLogic(
    "general",
    "neutral",
    "The stranger will remember the recent thread softly.",
    "Stranger is softly following your current feeling and recent messages.",
    "soft"
  );

  const input = document.getElementById("chatInput");
  if(input){
    input.addEventListener("keydown", function(e){
      if(e.key === "Enter" && !e.shiftKey){
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

window.addEventListener("resize", () => {
  createRain();
});