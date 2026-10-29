// HAZEL Notebook — Firebase Auth + Firestore
// Uses the existing firebase-config.js exports: auth and db.

import { auth, db } from "./firebase-config.js";
import {
  collection, addDoc, doc, getDocs, getDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const $ = (selector) => document.querySelector(selector);
const els = {
  sidebar: $("#sidebar"), menuBtn: $("#menuBtn"), mobileOverlay: $("#mobileOverlay"),
  newNoteBtn: $("#newNoteBtn"), welcomeNewNoteBtn: $("#welcomeNewNoteBtn"),
  searchInput: $("#searchInput"), notesList: $("#notesList"), notesCount: $("#notesCount"),
  allNotesBtn: $("#allNotesBtn"), userAvatar: $("#userAvatar"), userLabel: $("#userLabel"),
  signOutBtn: $("#signOutBtn"), syncDot: $("#syncDot"), syncText: $("#syncText"),
  saveStatus: $("#saveStatus"), deleteNoteBtn: $("#deleteNoteBtn"), moreBtn: $("#moreBtn"),
  breadcrumbTitle: $("#breadcrumbTitle"), welcomePanel: $("#welcomePanel"),
  editorPanel: $("#editorPanel"), noteDate: $("#noteDate"), wordCount: $("#wordCount"),
  noteTitle: $("#noteTitle"), editedLabel: $("#editedLabel"), noteContent: $("#noteContent"),
  blockFormat: $("#blockFormat"), lastSavedLabel: $("#lastSavedLabel"),
  deleteDialog: $("#deleteDialog"), cancelDeleteBtn: $("#cancelDeleteBtn"),
  confirmDeleteBtn: $("#confirmDeleteBtn"), toastRegion: $("#toastRegion")
};

let currentUser = null;
let notes = [];
let activeNoteId = null;
let unsubscribeNotes = null;
let saveTimer = null;
let pendingSave = false;
let isCreating = false;
let suppressEditorEvents = false;
let lastSavedAt = null;
let toastTimer = null;

const notesRef = () => collection(db, "users", currentUser.uid, "notes");
const noteRef = (id) => doc(db, "users", currentUser.uid, "notes", id);

function toast(message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast${type === "error" ? " error" : ""}`;
  node.textContent = message;
  els.toastRegion.append(node);
  window.setTimeout(() => node.remove(), 3600);
}

function setSyncState(state, message) {
  els.syncDot.className = `sync-dot${state === "online" ? " online" : state === "error" ? " error" : ""}`;
  els.syncText.textContent = message;
}

function setSaveState(state, message) {
  const dot = els.saveStatus.querySelector(".status-dot");
  dot.className = `status-dot${state === "saved" ? " saved" : state === "error" ? " error" : ""}`;
  els.saveStatus.lastChild.textContent = ` ${message}`;
}

function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.mobileOverlay.classList.remove("visible");
}

function openSidebar() {
  els.sidebar.classList.add("open");
  els.mobileOverlay.classList.add("visible");
}

function formatDate(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date();
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatRelative(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : null;
  if (!date) return "Just now";
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return formatDate(date);
}

function plainText(html = "") {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || "").replace(/\s+/g, " ").trim();
}

function safeTitle(note) {
  return (note.title || "").trim() || plainText(note.content).slice(0, 42) || "Untitled note";
}

function filteredNotes() {
  const term = els.searchInput.value.trim().toLowerCase();
  if (!term) return notes;
  return notes.filter((note) =>
    (note.title || "").toLowerCase().includes(term) ||
    plainText(note.content).toLowerCase().includes(term)
  );
}

function renderNotes() {
  const visibleNotes = filteredNotes();
  els.notesCount.textContent = String(notes.length);
  els.notesList.replaceChildren();

  if (!visibleNotes.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = els.searchInput.value.trim() ? "No notes match your search." : "Your notes will appear here.";
    els.notesList.append(empty);
    return;
  }

  for (const note of visibleNotes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `note-list-item${note.id === activeNoteId ? " selected" : ""}`;
    button.setAttribute("aria-current", note.id === activeNoteId ? "page" : "false");

    const title = document.createElement("span");
    title.className = "note-list-title";
    title.textContent = safeTitle(note);

    const preview = document.createElement("span");
    preview.className = "note-list-preview";
    const text = plainText(note.content);
    preview.textContent = text || formatRelative(note.updatedAt || note.createdAt);

    button.append(title, preview);
    button.addEventListener("click", () => openNote(note.id));
    els.notesList.append(button);
  }
}

function setActiveNav(isAllNotes) {
  els.allNotesBtn.classList.toggle("active", isAllNotes);
  els.breadcrumbTitle.textContent = isAllNotes ? (activeNoteId ? safeTitle(notes.find(n => n.id === activeNoteId) || {}) : "All notes") : "All notes";
}

function showWelcome() {
  activeNoteId = null;
  isCreating = false;
  pendingSave = false;
  clearTimeout(saveTimer);
  els.editorPanel.classList.add("hidden");
  els.welcomePanel.classList.remove("hidden");
  els.deleteNoteBtn.disabled = true;
  els.breadcrumbTitle.textContent = "All notes";
  renderNotes();
}

function showEditor() {
  els.welcomePanel.classList.add("hidden");
  els.editorPanel.classList.remove("hidden");
  els.deleteNoteBtn.disabled = !activeNoteId || isCreating;
}

function updateWordCount() {
  const text = plainText(els.noteContent.innerHTML);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  els.wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function openNote(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return;
  if (pendingSave) {
    // Finish the previous note's pending save before switching.
    saveCurrentNote(true);
  }
  clearTimeout(saveTimer);
  activeNoteId = id;
  isCreating = false;
  suppressEditorEvents = true;
  els.noteTitle.value = note.title || "";
  // Firestore content is authored by this user's editor; still sanitize on render.
  els.noteContent.innerHTML = sanitizeEditorHTML(note.content || "");
  suppressEditorEvents = false;
  els.noteDate.textContent = `LAST UPDATED ${formatDate(note.updatedAt || note.createdAt).toUpperCase()}`;
  els.editedLabel.textContent = note.updatedAt ? `Last touched ${formatRelative(note.updatedAt).toLowerCase()}.` : "Your personal page.";
  els.lastSavedLabel.textContent = "All changes saved";
  lastSavedAt = Date.now();
  setSaveState("saved", "Saved");
  showEditor();
  setActiveNav(false);
  updateWordCount();
  renderNotes();
  closeSidebar();
}

function createDraft() {
  clearTimeout(saveTimer);
  activeNoteId = null;
  isCreating = true;
  pendingSave = false;
  suppressEditorEvents = true;
  els.noteTitle.value = "";
  els.noteContent.innerHTML = "";
  suppressEditorEvents = false;
  els.noteDate.textContent = "NEW NOTE";
  els.editedLabel.textContent = "A blank page, full of possibility.";
  els.lastSavedLabel.textContent = "Changes save automatically";
  els.wordCount.textContent = "0 words";
  els.breadcrumbTitle.textContent = "New note";
  els.deleteNoteBtn.disabled = true;
  showEditor();
  setSaveState("idle", "Not saved yet");
  els.noteTitle.focus();
  closeSidebar();
}

function scheduleSave() {
  if (suppressEditorEvents || !currentUser) return;
  pendingSave = true;
  setSaveState("saving", "Saving…");
  els.lastSavedLabel.textContent = "Saving your changes…";
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveCurrentNote(false), 700);
}

function sanitizeEditorHTML(input) {
  const template = document.createElement("template");
  template.innerHTML = input;
  const allowed = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "S", "STRIKE", "H1", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE", "DIV"]);
  const walk = (node) => {
    for (const child of [...node.children]) {
      if (!allowed.has(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ""));
        continue;
      }
      for (const attr of [...child.attributes]) child.removeAttribute(attr.name);
      walk(child);
    }
  };
  walk(template.content);
  return template.innerHTML;
}

async function saveCurrentNote(force) {
  if (!currentUser || !pendingSave || !isCreating && !activeNoteId) return;
  clearTimeout(saveTimer);
  const title = els.noteTitle.value.trim().slice(0, 180);
  const content = sanitizeEditorHTML(els.noteContent.innerHTML);
  const text = plainText(content);

  // Avoid creating an empty note if the user opens New Note and leaves.
  if (isCreating && !title && !text) {
    pendingSave = false;
    setSaveState("idle", "Not saved yet");
    els.lastSavedLabel.textContent = "Changes save automatically";
    return;
  }

  pendingSave = false;
  setSaveState("saving", "Saving…");
  try {
    if (isCreating) {
      const now = serverTimestamp();
      const created = await addDoc(notesRef(), {
        title,
        content,
        createdAt: now,
        updatedAt: now
      });
      activeNoteId = created.id;
      isCreating = false;
      els.deleteNoteBtn.disabled = false;
      els.breadcrumbTitle.textContent = safeTitle({ title, content });
    } else {
      await updateDoc(noteRef(activeNoteId), {
        title,
        content,
        updatedAt: serverTimestamp()
      });
    }
    lastSavedAt = Date.now();
    setSaveState("saved", "Saved");
    els.lastSavedLabel.textContent = "All changes saved";
    els.noteDate.textContent = `LAST UPDATED ${formatDate(new Date()).toUpperCase()}`;
    els.editedLabel.textContent = "Your words, safely saved.";
    setSyncState("online", "Connected to your space");
    if (!force) renderNotes();
  } catch (error) {
    console.error("HAZEL Notebook save failed:", error);
    pendingSave = true;
    setSaveState("error", "Save failed");
    els.lastSavedLabel.textContent = "Couldn't save. Check your connection and try again.";
    setSyncState("error", "Sync needs attention");
    toast("Note save nahi ho saki. Connection aur Firestore Rules check karo.", "error");
  }
}

function executeFormat(command) {
  els.noteContent.focus();
  if (command === "removeFormat") {
    document.execCommand("removeFormat", false, null);
  } else {
    document.execCommand(command, false, null);
  }
  scheduleSave();
  updateToolbarState();
}

function updateToolbarState() {
  for (const button of document.querySelectorAll("[data-command]")) {
    const command = button.dataset.command;
    if (["bold", "italic", "underline", "strikeThrough", "insertUnorderedList", "insertOrderedList"].includes(command)) {
      try { button.classList.toggle("is-active", document.queryCommandState(command)); } catch { /* unsupported command state */ }
    }
  }
}

function subscribeToNotes() {
  if (unsubscribeNotes) unsubscribeNotes();
  setSyncState("pending", "Connecting to your space…");
  const q = query(notesRef(), orderBy("updatedAt", "desc"));
  unsubscribeNotes = onSnapshot(q, (snapshot) => {
    notes = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    setSyncState("online", "Connected to your space");
    renderNotes();
    if (activeNoteId && !notes.some(note => note.id === activeNoteId) && !isCreating) showWelcome();
    if (activeNoteId && !pendingSave) {
      const current = notes.find(note => note.id === activeNoteId);
      if (current) {
        // Keep editor content stable while typing; update only if the editor isn't focused.
        if (document.activeElement !== els.noteContent && document.activeElement !== els.noteTitle) {
          els.noteDate.textContent = `LAST UPDATED ${formatDate(current.updatedAt || current.createdAt).toUpperCase()}`;
        }
      }
    }
  }, (error) => {
    console.error("HAZEL Notebook listener failed:", error);
    setSyncState("error", "Unable to sync notes");
    toast("Notes load nahi ho sakin. Firestore Security Rules aur network check karo.", "error");
  });
}

function openDeleteDialog() {
  if (!activeNoteId || isCreating) return;
  if (typeof els.deleteDialog.showModal === "function") els.deleteDialog.showModal();
  else if (confirm("Delete this note? This action can't be undone.")) deleteCurrentNote();
}

async function deleteCurrentNote() {
  if (!currentUser || !activeNoteId || isCreating) return;
  const id = activeNoteId;
  try {
    await deleteDoc(noteRef(id));
    if (els.deleteDialog.open) els.deleteDialog.close();
    showWelcome();
    toast("Note deleted.");
  } catch (error) {
    console.error("HAZEL Notebook delete failed:", error);
    toast("Note delete nahi ho saki. Firestore Rules check karo.", "error");
  }
}

els.newNoteBtn.addEventListener("click", createDraft);
els.welcomeNewNoteBtn.addEventListener("click", createDraft);
els.searchInput.addEventListener("input", renderNotes);
els.allNotesBtn.addEventListener("click", () => { els.searchInput.value = ""; showWelcome(); closeSidebar(); });
els.noteTitle.addEventListener("input", () => { scheduleSave(); els.breadcrumbTitle.textContent = els.noteTitle.value.trim() || "Untitled note"; });
els.noteContent.addEventListener("input", () => { updateWordCount(); scheduleSave(); });
els.noteContent.addEventListener("keyup", updateToolbarState);
els.noteContent.addEventListener("mouseup", updateToolbarState);
els.noteContent.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (pendingSave) saveCurrentNote(true);
  }
});
document.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("mousedown", event => event.preventDefault()));
document.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("click", () => executeFormat(button.dataset.command)));
els.blockFormat.addEventListener("change", () => {
  els.noteContent.focus();
  document.execCommand("formatBlock", false, els.blockFormat.value);
  scheduleSave();
});
els.deleteNoteBtn.addEventListener("click", openDeleteDialog);
els.cancelDeleteBtn.addEventListener("click", () => els.deleteDialog.close());
els.confirmDeleteBtn.addEventListener("click", deleteCurrentNote);
els.moreBtn.addEventListener("click", () => toast("Tip: Use Ctrl/Cmd + B, I or U to format text."));
els.menuBtn.addEventListener("click", openSidebar);
els.mobileOverlay.addEventListener("click", closeSidebar);
els.signOutBtn.addEventListener("click", async () => {
  if (pendingSave) await saveCurrentNote(true);
  try { await signOut(auth); } catch (error) { console.error(error); toast("Sign out nahi ho saka.", "error"); }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
    event.preventDefault();
    createDraft();
  } else if (!typing && event.key === "/") {
    event.preventDefault();
    els.searchInput.focus();
  } else if (event.key === "Escape") {
    closeSidebar();
  }
});
window.addEventListener("beforeunload", (event) => {
  if (pendingSave) {
    event.preventDefault();
    event.returnValue = "";
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (unsubscribeNotes) unsubscribeNotes();
    setSyncState("error", "Please sign in first");
    els.userLabel.textContent = "Not signed in";
    els.welcomePanel.innerHTML = `
      <div class="welcome-art" aria-hidden="true"><div class="art-paper"><span class="art-line line-one"></span><span class="art-line line-two"></span><span class="art-line line-three"></span><span class="art-heart">♡</span></div><span class="art-spark spark-one">✦</span><span class="art-spark spark-two">✧</span></div>
      <p class="eyebrow">YOUR PERSONAL SPACE</p><h1>One moment,<br><em>please sign in.</em></h1>
      <p class="welcome-copy">Sign in to your HAZEL account to open your personal notebook.</p>
      <p class="welcome-footnote">Your notes are private to your account.</p>`;
    els.editorPanel.classList.add("hidden");
    els.welcomePanel.classList.remove("hidden");
    els.newNoteBtn.disabled = true;
    els.welcomeNewNoteBtn.disabled = true;
    els.signOutBtn.disabled = true;
    return;
  }
  currentUser = user;
  els.newNoteBtn.disabled = false;
  els.welcomeNewNoteBtn.disabled = false;
  els.signOutBtn.disabled = false;
  const label = user.displayName || user.email || "Your account";
  els.userLabel.textContent = label;
  els.userAvatar.textContent = (label.trim()[0] || "H").toUpperCase();
  subscribeToNotes();
});

// Save before pagehide when possible, but do not rely on this as the only save mechanism.
window.addEventListener("pagehide", () => {
  if (pendingSave && currentUser) saveCurrentNote(true);
});
