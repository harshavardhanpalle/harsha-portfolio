// ============================================
//  HARSHAVARDHAN PALLE — Portfolio Script
//  Real Claude AI powering chatbot & project explainer
// ============================================

// ---------- CHATBOT ----------
const chatBtn    = document.getElementById("chatbot-btn");
const chatBox    = document.getElementById("chatbox");
const chatClose  = document.getElementById("chat-close");
const chatInput  = document.getElementById("chat-input");
const chatContent= document.getElementById("chat-content");
const chatSend   = document.getElementById("chat-send");

chatBtn.addEventListener("click", () => chatBox.classList.toggle("hidden"));
chatClose.addEventListener("click", () => chatBox.classList.add("hidden"));

const SYSTEM_PROMPT = `You are HarshaAI, the personal AI assistant on Harshavardhan Palle's portfolio website. 
Your role is to answer questions about Harsha concisely and professionally.

About Harsha:
- Full name: Harshavardhan Palle, based in Bangalore, India
- Currently placed as a DevOps engineer, actively transitioning into MLOps and AI infrastructure roles
- Background: Python developer and data analyst, strong in Python, SQL, Pandas, NumPy, Scikit-learn
- DevOps skills: Docker (containerisation), GitHub Actions (CI/CD pipelines), Linux & Bash scripting, AWS basics (EC2, S3, IAM)
- MLOps interest: containerising ML models, building ML pipelines, FastAPI model serving
- Key projects: Crop Recommendation System (ML with Scikit-learn), Python automation scripts, CI/CD pipelines, dockerised APIs
- GitHub: github.com/harshavardhanpalle
- LinkedIn: linkedin.com/in/harshavardhanpalle
- Email: harshavardhanpalle.data@gmail.com
- Open to DevOps roles, MLOps opportunities, and AI infrastructure engineering positions

Answer questions about his skills, projects, background, and goals. Keep responses under 3 sentences. Be friendly and direct. If asked something unrelated, politely redirect to Harsha's portfolio topics.`;

let chatHistory = [];

async function sendChatMessage(userMsg) {
  addChatBubble("You", userMsg, "user-msg");
  chatHistory.push({ role: "user", content: userMsg });

  const thinkingDiv = addChatBubble("HarshaAI", "...", "ai-msg");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: chatHistory
      })
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text || "I'm having trouble right now — try again!";

    chatHistory.push({ role: "assistant", content: reply });
    thinkingDiv.innerHTML = `<strong>HarshaAI:</strong> ${reply}`;

  } catch (err) {
    thinkingDiv.innerHTML = `<strong>HarshaAI:</strong> Connection error — please try again.`;
  }
}

function addChatBubble(sender, message, cls) {
  const div = document.createElement("div");
  div.className = `chat-msg ${cls}`;
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatContent.appendChild(div);
  chatContent.scrollTop = chatContent.scrollHeight;
  return div;
}

chatSend.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  if (msg) { chatInput.value = ""; sendChatMessage(msg); }
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const msg = chatInput.value.trim();
    if (msg) { chatInput.value = ""; sendChatMessage(msg); }
  }
});

// ---------- PROJECT AI EXPLAINER ----------
const modal       = document.getElementById("explain-modal");
const modalTitle  = document.getElementById("modal-title");
const modalContent= document.getElementById("modal-content");
const modalClose  = document.querySelector(".modal-close");

modalClose.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

document.querySelectorAll(".explain-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const projectDesc = btn.dataset.project;
    const projectName = btn.closest(".project-card").querySelector("h3").textContent;

    modalTitle.textContent = `AI Breakdown: ${projectName}`;
    modalContent.innerHTML = `<div class="loader"></div>`;
    modal.classList.remove("hidden");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are explaining a portfolio project for Harshavardhan Palle, a DevOps/MLOps engineer. 
            
Project: ${projectDesc}

Write a clear, technical breakdown in 3 short sections:
1. **What it is** (1-2 sentences)
2. **The DevOps/MLOps angle** (1-2 sentences on tools/techniques used)
3. **What it demonstrates** (1-2 sentences on skills shown)

Use plain text, no markdown formatting. Keep it professional and concise. Write it as if explaining to a technical recruiter.`
          }]
        })
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "Unable to load explanation.";

      // Format the 3 sections nicely
      const sections = text.split(/\d\.\s+/).filter(Boolean);
      const labels = ["What It Is", "DevOps / MLOps Angle", "What It Demonstrates"];

      if (sections.length >= 3) {
        modalContent.innerHTML = sections.slice(0, 3).map((s, i) => `
          <div style="margin-bottom:18px;">
            <div style="font-family:var(--mono);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">${labels[i]}</div>
            <p style="color:var(--muted);font-size:0.88rem;line-height:1.7;">${s.trim()}</p>
          </div>
        `).join("");
      } else {
        modalContent.innerHTML = `<p style="color:var(--muted);font-size:0.88rem;line-height:1.7;">${text}</p>`;
      }

    } catch (err) {
      modalContent.innerHTML = `<p style="color:var(--muted);">Could not load AI explanation. Check your connection.</p>`;
    }
  });
});

// ---------- SCROLL ANIMATIONS ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".project-card, .skill-block, .path-step, .contact-link").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  observer.observe(el);
});
