let lastReport = "";

/* 🔍 SCAN FUNCTION (local detector) */
function scan() {
  const text = document.getElementById("input").value;

  let risk = 0;
  let issues = [];

  if (!text) return;

  if (text.toLowerCase().includes("free")) {
    risk += 20;
    issues.push("Scam keyword detected");
  }

  if (text.toLowerCase().includes("nitro")) {
    risk += 30;
    issues.push("Fake reward scam pattern");
  }

  if (/[а-яА-Я]/.test(text)) {
    risk += 40;
    issues.push("Unicode spoofing detected");
  }

  const level =
    risk < 30 ? "LOW" :
    risk < 70 ? "MEDIUM" :
    "HIGH";

  lastReport = `Risk: ${risk}/100 | Level: ${level} | Issues: ${issues.join(", ") || "None"}`;

  document.getElementById("out").innerHTML = `
    <div class="card">
      <b>Scan Result</b><br><br>
      ${lastReport}
    </div>
  `;
}

/* 🤖 GEMINI CHAT (via backend /api/chat) */
async function send() {
  const msgInput = document.getElementById("msg");
  const msg = msgInput.value.trim();
  const chat = document.getElementById("chat");

  if (!msg) return;

  // show user message
  chat.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  msgInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: msg,
        context: lastReport
      })
    });

    const data = await res.json();

    chat.innerHTML += `<div><b>AI:</b> ${data.reply}</div>`;
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    chat.innerHTML += `<div><b>AI:</b> ⚠ Error connecting to server</div>`;
  }
}