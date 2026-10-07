// Paste your Google Apps Script web app URL here (see google-sheet-script.gs).
// While empty, the form validates and shows the success state without sending anything.
const WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbyESnobbHWqV2SRdBpgRIbwYNvK3sgpPQKyEdQ0y4AJ9oVX3id3TF-onbSrRlIsuRZlQA/exec";

const form = document.getElementById("waitlist");
const email = document.getElementById("email");
const msg = document.getElementById("form-msg");
const defaultMsg = msg.textContent;

// "Join the waitlist" in the nav jumps to the email field.
document.querySelectorAll("[data-focus-email]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    email.focus({ preventScroll: true });
  });
});

function setMessage(text, state) {
  msg.textContent = text;
  msg.classList.toggle("is-error", state === "error");
  msg.classList.toggle("is-success", state === "success");
  form.classList.toggle("is-error", state === "error");
}

email.addEventListener("input", () => {
  if (msg.textContent !== defaultMsg) setMessage(defaultMsg);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setMessage("Please enter a valid email address.", "error");
    email.focus();
    return;
  }

  const button = form.querySelector("button");
  const label = button.querySelector(".btn-label");
  button.disabled = true;
  label.textContent = "Sending…";

  try {
    if (WAITLIST_ENDPOINT) {
      // Form-encoded with no custom headers, so the browser skips the CORS
      // preflight that Apps Script can't answer.
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        body: new URLSearchParams({ email: value, source: location.href }),
      });
      const data = await res.json();
      if (!res.ok || data.result !== "success") throw new Error(data.error || res.statusText);
    }
    form.reset();
    form.classList.add("is-done");
    label.textContent = "You're in";
    setMessage("Thanks! Watch your inbox for an invite to the call.", "success");
    // Unlock the form after a moment so another email can be entered.
    setTimeout(() => {
      form.classList.remove("is-done");
      button.disabled = false;
      label.textContent = "I'm interested";
    }, 2500);
  } catch {
    button.disabled = false;
    label.textContent = "I'm interested";
    setMessage("Something went wrong. Please try again.", "error");
  }
});

// Phone mockup: day and tab selection.
function selectable(selector) {
  const items = document.querySelectorAll(selector);
  items.forEach((item) =>
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("is-active"));
      item.classList.add("is-active");
    })
  );
}
selectable(".day");
selectable(".tab");

// Review card: Approve marks the LinkedIn post as scheduled.
const card = document.getElementById("review-card");
const cardLabel = card.querySelector(".review-label");
const approve = document.getElementById("approve");
const reviewStatus = document.querySelector("#review-post .status");

approve.addEventListener("click", () => {
  const approved = card.classList.toggle("is-approved");
  cardLabel.textContent = approved ? "APPROVED ✓" : "READY FOR REVIEW";
  approve.textContent = approved ? "Undo" : "Approve";
  reviewStatus.textContent = approved ? "Scheduled" : "Review";
  reviewStatus.classList.toggle("status-review", !approved);
});
