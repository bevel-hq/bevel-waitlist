  // Bevel waitlist → Google Sheet
  // Paste this into Extensions → Apps Script in your Google Sheet, then deploy as a web app.

  const SHEET_NAME = "Waitlist";

  function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const email = String((e.parameter && e.parameter.email) || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ result: "error", error: "Invalid email" });
      }

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Email", "Source"]);
        sheet.setFrozenRows(1);
      }

      // Skip duplicates so repeat signups don't add extra rows.
      const existing = sheet.getLastRow() > 1
        ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().flat()
        : [];
      if (!existing.includes(email)) {
        sheet.appendRow([new Date(), email, e.parameter.source || ""]);
      }

      return json({ result: "success" });
    } catch (err) {
      return json({ result: "error", error: String(err) });
    } finally {
      lock.releaseLock();
    }
  }

  function json(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  }
