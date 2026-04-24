
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

/* 🧠 simple scanner */
function scanInput(text = "") {
  let risk = 0;
  let issues = [];

  const lower = text.toLowerCase();

  if (lower.includes("free")) {
    risk += 15;
    issues.push("Suspicious keyword: free");
  }

  if (lower.includes("nitro") || lower.includes("gift")) {
    risk += 25;
    issues.push("Fake reward scam pattern");
  }

  if (lower.includes("password") || lower.includes("login")) {
    risk += 20;
    issues.push("Credential phishing risk");
  }

  if (/[а-яА-Я]/.test(text)) {
    risk += 35;
    issues.push("Unicode spoofing detected");
  }

  return {
    risk,
    level: risk < 30 ? "LOW" : risk < 70 ? "MEDIUM" : "HIGH",
    issues
  };
}

/* 🤖 GEMINI CHAT */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const scan = scanInput(message);

    const prompt = `
You are SecureScan AI, a cybersecurity assistant.

Scan result:
- Risk: ${scan.risk}/100
- Level: ${scan.level}
- Issues: ${scan.issues.join(", ") || "None"}

User message:
${message}

Explain clearly if this is safe or a phishing/scam attempt.
`;

    const apiKey = process.env.GEMINI_API_KEY; AIzaSyCvZm4YfVJJDBZw7A6_hLTXjT5vbclTx_0

    if (!apiKey) {
      return res.json({
        reply: "⚠ Missing GEMINI_API_KEY in environment variables."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.json({
      reply,
      scan
    });

  } catch (err) {
    console.error(err);
    res.json({
      reply: "❌ Gemini API error."
    });
  }
});

app.listen(PORT, () => {
  console.log("SecureScan AI running on port", PORT);
});