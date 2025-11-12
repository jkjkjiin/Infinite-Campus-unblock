import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
      import { 
        getAuth, 
        signInWithEmailAndPassword, 
        onAuthStateChanged 
      } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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
      const auth = getAuth(app);

      const loginBtn = document.getElementById("loginBtn");
      const loginStatus = document.getElementById("loginStatus");
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");

      async function loginUser() {
        const email = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
          loginStatus.textContent = "Please enter both email and password.";
          return;
        }

        try {
          await signInWithEmailAndPassword(auth, email, password);
          loginStatus.textContent = "Login successful!";
          // Delay slightly to avoid overlap with auth state change
          setTimeout(() => {
            window.location.href = "InfiniteSecretPages.html";
          }, 500);
        } catch (error) {
          loginStatus.textContent = "Error: " + error.message;
        }
      }

      loginBtn.addEventListener("click", loginUser);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          loginUser();
        }
      });

      // Only redirect if user is ALREADY logged in before reaching the login page
      onAuthStateChanged(auth, (user) => {
        if (user && !window.location.href.includes("InfiniteSecretPages.html")) {
          window.location.href = "InfiniteSecretPages.html";
        }
      });