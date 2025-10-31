// popup.js — Manual test trigger (works in Gmail & Outlook)
const SERVER_URL = "http://localhost:8000/predict";

document.getElementById("test").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Run extraction code inside the tab
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        // Try Gmail
        const gmailSubject = document.querySelector("h2.hP")?.innerText || "";
        const gmailBody = document.querySelector(".a3s")?.innerText || "";

        // Try Outlook
        const outlookSubject =
          document.querySelector("[data-test-id='message-subject']")?.innerText || "";
        const outlookBody =
          document.querySelector("[data-test-id='message-view-body-content']")?.innerText || "";

        const subject = gmailSubject || outlookSubject || document.title;
        const body =
          gmailBody ||
          outlookBody ||
          document.body.innerText.slice(0, 4000);

        return { subject, body };
      },
    },
    async (results) => {
      const data = results?.[0]?.result;
      if (!data || !data.body) {
        alert("No readable email found on this page. Open a message first.");
        return;
      }

      try {
        const response = await fetch(SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        const msg = result.label
          ? `⚠️ Scam risk ${(result.scam_probability * 100).toFixed(1)}%`
          : `✓ Looks safe ${(result.scam_probability * 100).toFixed(1)}%`;

        alert(msg);
      } catch (err) {
        alert("❌ MailWatch could not connect to server.\nMake sure FastAPI is running on port 8000.");
        console.error(err);
      }
    }
  );
});
