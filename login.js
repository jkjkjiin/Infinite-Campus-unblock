import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "InfinitePasswords.html";
    }
});
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = "InfinitePasswords.html";
    });
};