import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { ref, get, set, remove, onValue } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
const privateChatsDiv = document.getElementById("privateChats");
const chatView = document.getElementById("chatView");
const chatTitle = document.getElementById("chatTitle");
const chatMessages = document.getElementById("chatMessages");
const deleteChatBtn = document.getElementById("deleteChat");
const backButton = document.getElementById("backButton");
const userListDiv = document.getElementById("userList");
const userEditDiv = document.getElementById("userEdit");
const editTitle = document.getElementById("editTitle");
const userDataTextarea = document.getElementById("userData");
const saveUserBtn = document.getElementById("saveUser");
const backToListBtn = document.getElementById("backToList");
const sendAsSelect = document.getElementById("sendAsSelect");
const adminMsgInput = document.getElementById("adminMessageInput");
const sendAdminMessageBtn = document.getElementById("sendAdminMessage");
let currentChatPath = null;
let currentUserEditUID = null;
let userProfiles = {};
let activeChatListener = null;
const profilePics = [
    "/pfps/1.jpeg",
    "/pfps/2.jpeg",
    "/pfps/3.jpeg",
    "/pfps/4.jpeg",
    "/pfps/5.jpeg",
    "/pfps/6.jpeg",
    "/pfps/7.jpeg",
    "/pfps/8.jpeg",
    "/pfps/9.jpeg",
    "/pfps/f3.jpeg",
    "/pfps/kaiden.png"
];
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("You Must Be Logged In To View This Page.");
        window.location.href = "index.html";
        return;
      }
      const uid = user.uid;
      const ownerRef = ref(db, `users/${uid}/profile/isOwner`);
      const snapshot = await get(ownerRef);
      if (!snapshot.exists() || snapshot.val() !== true) {
        alert("Access Denied. You Are Not The Owner.");
        window.location.href = "index.html";
        return;
      }
      await loadUserList();
      await loadPrivateChats();
    });
    async function loadPrivateChats() {
      privateChatsDiv.innerHTML = "Loading Messages";
      const privateRef = ref(db, "private");
      const snapshot = await get(privateRef);
      if (!snapshot.exists()) {
        privateChatsDiv.innerHTML = "No Messages Found.";
        return;
      }
      const data = snapshot.val();
      privateChatsDiv.innerHTML = "";
      Object.entries(data).forEach(([uid, chatPartners]) => {
        const userDisplay = userProfiles[uid]?.displayName || uid;
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `<strong>${userDisplay}</strong>`;
        privateChatsDiv.appendChild(userDiv);
        Object.keys(chatPartners).forEach(secondUid => {
          const partnerName = userProfiles[secondUid]?.displayName || secondUid;
          const div = document.createElement("div");
          div.className = "user-item";
          div.textContent = `Chat Between ${userDisplay} & ${partnerName}`;
          div.onclick = () => viewPrivateChat(uid, secondUid, userDisplay, partnerName);
          privateChatsDiv.appendChild(div);
        });
      });
    }
    async function viewPrivateChat(uid, secondUid, userDisplay, partnerDisplay) {
      currentChatPath = `private/${uid}/${secondUid}`;
      privateChatsDiv.style.display = "none";
      chatView.style.display = "block";
      chatTitle.textContent = `Private Chat: ${userDisplay} & ${partnerDisplay}`;
      chatMessages.innerHTML = "Loading...";
      populateSendAsOptions();
      const chatRef = ref(db, currentChatPath);
      onValue(chatRef, async snapshot => {
        if (!snapshot.exists()) {
          chatMessages.innerHTML = "<p>No Messages Found.</p>";
          return;
        }
        const messages = snapshot.val();
        chatMessages.innerHTML = "";
        const entries = Object.entries(messages).sort((a, b) => {
          const aKey = a[0];
          const bKey = b[0];
          const aNum = Number(aKey);
          const bNum = Number(bKey);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return aKey.localeCompare(bKey);
        });
        for (const [msgId, msgData] of entries) {
          const senderUid = msgData.sender || uid;
          if (!userProfiles[senderUid] && senderUid !== "admin") {
            const userSnap = await get(ref(db, `users/${senderUid}/profile`));
            const profile = userSnap.exists() ? userSnap.val() : {};
            userProfiles[senderUid] = {
              displayName: profile.displayName || "Unknown",
              pic: profile.pic || ""
            };
            populateSendAsOptions();
          }
          const senderProfile = userProfiles[senderUid] || { displayName: (senderUid === "admin" ? "⛨ Admin" : senderUid), pic: "" };
          let picNum = parseInt(senderProfile.pic);
          if (isNaN(picNum) || picNum <= 0 || picNum > profilePics.length) {
            picNum = 1;
          }
          const senderPic = profilePics[Math.max(0, picNum - 0)];
          const senderName = (senderUid === "admin") ? "⛨ Admin" : (senderProfile.displayName || "Unknown");
          let timestamp = "";
          if (msgData.timestamp) {
            const d = new Date(msgData.timestamp);
            const month = (d.getMonth() + 1).toString().padStart(2, "0");
            const day = d.getDate().toString().padStart(2, "0");
            const year = d.getFullYear();
            let hours = d.getHours();
            const minutes = d.getMinutes().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            timestamp = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
          }
          const isPartner = senderUid === secondUid;
          const isAdmin = senderUid === "admin";
          const msgDiv = document.createElement("div");
          msgDiv.className = "message";
          msgDiv.style.flexDirection = isPartner ? "row" : "row-reverse";
          if (isAdmin) {
            msgDiv.style.background = "#40224a";
            msgDiv.style.border = "1px solid #7a3fb8";
          } else {
            msgDiv.style.background = isPartner ? "#1e1e1e" : "#2b2b2b";
          }
          const img = document.createElement("img");
          img.src = senderPic;
          img.alt = "User Pic";
          const content = document.createElement("div");
          content.className = "msg-content";
          content.style.textAlign = isPartner ? "left" : "right";
          const header = document.createElement("div");
          header.className = "msg-header";
          header.innerHTML = `<span>${senderName}</span><span>${timestamp}</span>`;
          const text = document.createElement("div");
          text.className = "msg-text";
          text.textContent = msgData.text || "(no text)";
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.style.marginTop = "6px";
          deleteBtn.onclick = async () => {
            if (!confirm("Delete This Message?")) return;
            try {
              await remove(ref(db, `${currentChatPath}/${msgId}`));
            } catch (err) {
              alert("Delete Failed: " + err.message);
            }
          };
          content.appendChild(header);
          content.appendChild(text);
          if (msgData.edited) {
            const edited = document.createElement("div");
            edited.className = "msg-edited";
            edited.textContent = "(edited)";
            content.appendChild(edited);
          }
          content.appendChild(deleteBtn);
          msgDiv.appendChild(img);
          msgDiv.appendChild(content);
          chatMessages.appendChild(msgDiv);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, (err) => {
        console.error("Realtime Listener Error:", err);
        chatMessages.innerHTML = "<p>Error Loading Messages.</p>";
      });
    }
    deleteChatBtn.onclick = async () => {
      if (!currentChatPath) return;
      if (!confirm("Delete this entire private chat and metadata?")) return;
      const parts = currentChatPath.split("/");
      const uid = parts[1];
      const secondUid = parts[2];
      try {
        await remove(ref(db, `private/${uid}/${secondUid}`));
        await remove(ref(db, `metadata/${uid}/privateChats/${secondUid}`));
        await remove(ref(db, `metadata/${secondUid}/privateChats/${uid}`));
        alert("Chat And Metadata Deleted.");
        chatView.style.display = "none";
        privateChatsDiv.style.display = "block";
        loadPrivateChats();
      } catch (err) {
        alert("Error deleting chat: " + err.message);
      }
    };
    backButton.onclick = () => {
      chatView.style.display = "none";
      privateChatsDiv.style.display = "block";
    };
    async function loadUserList() {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      if (!snapshot.exists()) {
        userListDiv.innerHTML = "No Users Found.";
        return;
      }
      const data = snapshot.val();
      userProfiles = {};
      const sorted = Object.entries(data).sort((a, b) => {
        const nameA = a[1]?.profile?.displayName?.toLowerCase() || "";
        const nameB = b[1]?.profile?.displayName?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
      userListDiv.innerHTML = "";
      sorted.forEach(([uid, info]) => {
        const name = info.profile?.displayName || uid;
        let picNum = parseInt(info.profile?.pic);
        if (isNaN(picNum) || picNum <= 0 || picNum > profilePics.length) {
          picNum = 0;
        }
        const pic = profilePics[Math.max(0, picNum)];
        userProfiles[uid] = { displayName: name, pic: picNum.toString() };
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerHTML = `<img src="${pic}" width="30" height="30" style="border-radius:50%;vertical-align:middle;margin-right:8px;"> ${name}`;
        div.onclick = () => editUser(uid, info);
        userListDiv.appendChild(div);
      });
      populateSendAsOptions();
    }
    function populateSendAsOptions() {
      const selected = sendAsSelect.value;
      sendAsSelect.innerHTML = '';
      const adminOpt = document.createElement('option');
      adminOpt.value = 'admin';
      adminOpt.textContent = '⛨ Admin';
      sendAsSelect.appendChild(adminOpt);
      const uEntries = Object.entries(userProfiles).sort((a, b) => {
        const aName = a[1].displayName.toLowerCase();
        const bName = b[1].displayName.toLowerCase();
        return aName.localeCompare(bName);
      });
      uEntries.forEach(([uid, info]) => {
        const opt = document.createElement('option');
        opt.value = uid;
        opt.textContent = info.displayName || uid;
        sendAsSelect.appendChild(opt);
      });
      if ([...sendAsSelect.options].some(o => o.value === selected)) {
        sendAsSelect.value = selected;
      }
    }
    function editUser(uid, data) {
      currentUserEditUID = uid;
      userListDiv.style.display = "none";
      userEditDiv.style.display = "block";
      editTitle.textContent = `Editing User: ${uid}`;
      userDataTextarea.value = JSON.stringify(data, null, 2);
    }
    saveUserBtn.onclick = async () => {
      if (!currentUserEditUID) return;
      try {
        const newData = JSON.parse(userDataTextarea.value);
        await set(ref(db, `users/${currentUserEditUID}`), newData);
        alert("User data saved!");
        userEditDiv.style.display = "none";
        userListDiv.style.display = "block";
        loadUserList();
      } catch (err) {
        alert("Invalid JSON Or Save Failed: " + err.message);
      }
    };
    backToListBtn.onclick = () => {
      userEditDiv.style.display = "none";
      userListDiv.style.display = "block";
    };
    sendAdminMessageBtn.onclick = async () => {
      if (!currentChatPath) {
        alert("Open A Private Chat First.");
        return;
      }
      const text = adminMsgInput.value.trim();
      if (!text) return;
      const sendAs = sendAsSelect.value || "admin";
      const msgSender = (sendAs === "admin") ? "admin" : sendAs;
      const timestamp = Date.now();
      const key = `${timestamp}_${Math.floor(Math.random() * 100000)}`;
      const newMsg = {
        text,
        sender: msgSender,
        timestamp,
        edited: false
      };
      try {
        await set(ref(db, `${currentChatPath}/${key}`), newMsg);
        adminMsgInput.value = "";
      } catch (err) {
        alert("Send failed: " + err.message);
      }
    };