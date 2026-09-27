async function api(url, options={}) {
  const r = await fetch(url, options);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

function openLogin(){document.getElementById("loginModal").style.display="flex"}
function closeLogin(){document.getElementById("loginModal").style.display="none"}

async function login() {
  const name=document.getElementById("loginName").value.trim();
  const email=document.getElementById("loginEmail").value.trim();
  const msg=document.getElementById("loginMsg");
  try {
    const data=await api("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email})});
    localStorage.setItem("ky_user",JSON.stringify(data.user));
    msg.textContent=`Welcome, ${data.user.name}!`;
    setTimeout(closeLogin,700);
  } catch(e){msg.textContent=e.message}
}

function openChat(){document.getElementById("chatModal").style.display="flex"}
function closeChat(){document.getElementById("chatModal").style.display="none"}
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if(!msg) return;

  const history = document.getElementById("chatHistory");
  history.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  input.value = "";

  try {
    const data = await api("/api/chat", {
      method: "POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({message: msg})
    });
    history.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;
    history.scrollTop = history.scrollHeight;
  } catch(e) {
    history.innerHTML += `<p><b>Bot:</b> Error connecting to chat service.</p>`;
  }
}

function globalSearch() {
  const q = document.getElementById("searchInput").value;
  if(q) {
    window.location.href = `/destinations.html?q=${encodeURIComponent(q)}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keydown",e=>{if(e.key==="Enter")globalSearch()});
  }
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendMessage()});
  }
});
