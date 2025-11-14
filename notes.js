import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, get } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyCd3Yi81oZbRFgcdc98e8hTatdM4pftYRs",
    authDomain: "infinitecampus-6e93c.firebaseapp.com",
    databaseURL: "https://infinitecampus-6e93c-default-rtdb.firebaseio.com",
    projectId: "infinitecampus-6e93c",
    storageBucket: "infinitecampus-6e93c.firebasestorage.app",
    messagingSenderId: "349851426947",
    appId: "1:349851426947:web:14cc56fab543ca91373bb6"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const notesContainer = document.getElementById('notesContainer');
function saveNote() {
    if (!noteInput) return;
    const text = noteInput.value.trim();
    if (text) {
        push(ref(db, 'notes'), { text });
        noteInput.value = '';
    }
}
if (saveBtn) {
    saveBtn.addEventListener('click', saveNote);
}
if (noteInput) {
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveNote();
        }
    });
}
let isOwner = false;
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        applyOwnerPermissions(false);
        return;
    }
    const ownerRef = ref(db, `users/${user.uid}/profile/isOwner`);
    const snap = await get(ownerRef);
    isOwner = snap.exists() && snap.val() === true;
    applyOwnerPermissions(isOwner);
});
function applyOwnerPermissions(owner) {
    if (noteInput) noteInput.style.display = owner ? "block" : "none";
    if (saveBtn) saveBtn.style.display = owner ? "inline-block" : "none";
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.style.display = owner ? "inline-block" : "none";
    });
}
onValue(ref(db, 'notes'), (snapshot) => {
    if (!notesContainer) return;
    notesContainer.innerHTML = '';
    snapshot.forEach((child) => {
        const note = child.val();
        const key = child.key;
        const div = document.createElement('div');
        div.className = 'note';
        div.innerHTML = `
            <div class="txt">${note.text}</div>
            <button class="delete-btn" data-key="${key}" style="display:none">Delete</button>
        `;
        notesContainer.appendChild(div);
    });
    applyOwnerPermissions(isOwner);
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (!isOwner) return;
            const key = button.getAttribute('data-key');
            remove(ref(db, 'notes/' + key));
        });
    });
});