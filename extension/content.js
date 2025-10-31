// ============================================================
// content.js — MailWatch Inbox + Email Scanner with Tooltips
// ============================================================

const SERVER_URL = "http://localhost:8000/predict";

// Cache analyzed rows to avoid reprocessing
const analyzedRows = new WeakSet();

// ------------------------------------------------------------
// Utility: Create tooltip for explanation
// ------------------------------------------------------------
function createTooltip(text) {
  const tooltip = document.createElement("div");
  tooltip.className = "mailwatch-tooltip";
  tooltip.innerText = text;
  tooltip.style.position = "absolute";
  tooltip.style.background = "#333";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "6px 10px";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontSize = "12px";
  tooltip.style.zIndex = 999999;
  tooltip.style.maxWidth = "250px";
  tooltip.style.boxShadow = "0 2px 6px rgba(0,0,0,0.4)";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);
  return tooltip;
}

// ------------------------------------------------------------
// Add badge + tooltip beside sender
// ------------------------------------------------------------
function addBadge(row, label, prob, riskLevel, explanation) {
  if (row.querySelector(".mailwatch-badge")) return;

  const badge = document.createElement("span");
  badge.className = "mailwatch-badge";
  badge.style.marginLeft = "8px";
  badge.style.padding = "2px 6px";
  badge.style.borderRadius = "6px";
  badge.style.fontSize = "11px";
  badge.style.fontWeight = "bold";
  badge.style.color = "#fff";
  badge.style.cursor = "pointer";

  // Color logic
  if (riskLevel === "High") badge.style.background = "#d9534f"; // red
  else if (riskLevel === "Medium") badge.style.background = "#f0ad4e"; // orange
  else badge.style.background = "#5cb85c"; // green

  badge.textContent =
    riskLevel === "High"
      ? `Scam ${(prob * 100).toFixed(0)}%`
      : riskLevel === "Medium"
      ? `Review ${(prob * 100).toFixed(0)}%`
      : `Safe ${(prob * 100).toFixed(0)}%`;

  // Tooltip behavior
  const tooltip = createTooltip(explanation);
  badge.addEventListener("mouseenter", (e) => {
    tooltip.style.display = "block";
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
  });
  badge.addEventListener("mousemove", (e) => {
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
  });
  badge.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

  const senderCell = row.querySelector(".yX.xY");
  if (senderCell) senderCell.appendChild(badge);
}

// ------------------------------------------------------------
// Generate text-based explanation heuristics
// ------------------------------------------------------------
function generateExplanation(subject, snippet, prob, riskLevel) {
  const text = `${subject} ${snippet}`.toLowerCase();
  let reasons = [];

  if (text.match(/verify|account|password|login|reset|urgent|suspend|update/i))
    reasons.push("Contains urgent or sensitive security terms");
  if (text.match(/click here|http|link|url|visit|bit\.ly|tinyurl/i))
    reasons.push("Contains clickable or shortened links");
  if (text.match(/free|offer|winner|limited|deal|discount/i))
    reasons.push("Uses promotional bait keywords");
  if (prob >= 0.85) reasons.push("Language highly resembles known phishing patterns");

  if (riskLevel === "Low" && reasons.length === 0)
    reasons.push("No suspicious content detected");

  return reasons.join("; ");
}

// ------------------------------------------------------------
// Analyze inbox row
// ------------------------------------------------------------
async function analyzeRow(row) {
  if (analyzedRows.has(row)) return;
  analyzedRows.add(row);

  const sender = row.querySelector(".yX.xY")?.innerText || "";
  const subject = row.querySelector(".bog")?.innerText || "";
  const snippet = row.querySelector(".y2")?.innerText || "";

  const text = `${subject} ${snippet}`;
  if (!text || text.length < 30) return;

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, subject, body: text }),
    });

    if (!response.ok) return;
    const result = await response.json();

    const explanation = generateExplanation(subject, snippet, result.scam_probability, result.risk_level);
    addBadge(row, result.label, result.scam_probability, result.risk_level, explanation);
  } catch (err) {
    console.warn("MailWatch: API error while scanning inbox row", err);
  }
}

// ------------------------------------------------------------
// Scan all visible inbox rows
// ------------------------------------------------------------
function scanInbox() {
  const inbox = document.querySelector("div[role='main']");
  if (!inbox) return;

  const rows = inbox.querySelectorAll("tr.zA");
  rows.forEach((row) => analyzeRow(row));
}

// ------------------------------------------------------------
// Watch for Gmail updates
// ------------------------------------------------------------
function watchInbox() {
  const inbox = document.querySelector("div[role='main']");
  if (!inbox) return;

  const observer = new MutationObserver(() => {
    if (window._mw_inbox_timer) clearTimeout(window._mw_inbox_timer);
    window._mw_inbox_timer = setTimeout(scanInbox, 1500);
  });

  observer.observe(inbox, { childList: true, subtree: true });

  // Scan current visible rows immediately
  scanInbox();
}

// ------------------------------------------------------------
// Extract data for opened email
// ------------------------------------------------------------
function extractEmail() {
  const subject = document.querySelector("h2.hP")?.innerText || "";
  const body = document.querySelector(".a3s")?.innerText || "";
  const senderElement = document.querySelector(".gD");
  const sender = senderElement?.getAttribute("email") || senderElement?.innerText || "";
  return { sender, subject, body };
}

// ------------------------------------------------------------
// Show top banner with explanation for opened mail
// ------------------------------------------------------------
function showBanner(prob, label, riskLevel, explanation) {
  let old = document.getElementById("mailwatch-banner");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "mailwatch-banner";
  banner.style.position = "fixed";
  banner.style.top = "20px";
  banner.style.right = "20px";
  banner.style.zIndex = 999999;
  banner.style.padding = "14px 20px";
  banner.style.borderRadius = "10px";
  banner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  banner.style.fontFamily = "Arial, sans-serif";
  banner.style.fontSize = "14px";
  banner.style.color = "#111";

  if (riskLevel === "High") banner.style.background = "#ffdddd";
  else if (riskLevel === "Medium") banner.style.background = "#fff3cd";
  else banner.style.background = "#ddffdd";

  banner.innerHTML = `
    <strong>${riskLevel === "High" ? "⚠️ Scam Risk" : riskLevel === "Medium" ? "⚠️ Review Needed" : "✓ Safe Email"}</strong><br>
    Confidence: ${(prob * 100).toFixed(1)}%<br>
    <small style="color:#444;">${explanation}</small>
  `;

  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 15000);
}

// ------------------------------------------------------------
// Check opened email
// ------------------------------------------------------------
async function checkOpenedEmail() {
  const { sender, subject, body } = extractEmail();
  if (!body || body.length < 30) return;

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, subject, body }),
    });

    if (response.ok) {
      const result = await response.json();
      const explanation = generateExplanation(subject, body, result.scam_probability, result.risk_level);
      showBanner(result.scam_probability, result.label, result.risk_level, explanation);
    }
  } catch (err) {
    console.warn("MailWatch: API error in opened email", err);
  }
}

// ------------------------------------------------------------
// Watch for Gmail view changes
// ------------------------------------------------------------
function watchGmailView() {
  const observer = new MutationObserver(() => {
    if (window._mw_switch_timer) clearTimeout(window._mw_switch_timer);
    window._mw_switch_timer = setTimeout(() => {
      if (document.querySelector("tr.zA")) {
        watchInbox();
      } else if (document.querySelector("h2.hP")) {
        checkOpenedEmail();
      }
    }, 1500);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ------------------------------------------------------------
// Initialize MailWatch
// ------------------------------------------------------------
window.addEventListener("load", () => {
  console.log("📬 MailWatch active — scanning inbox & messages (Explainable Mode)");
  watchGmailView();
});
