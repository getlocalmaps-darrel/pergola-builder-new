// api/contact.js

// --- Spam filter config ---
const BLOCKED_DOMAINS = [
  "smartremoteva.com",
];
const MIN_SUBMIT_SECONDS = 3; // Bots submit instantly; humans need at least 3s

function isSpam({ name, phone, email, message, website, _loaded }) {
  // Layer 1: Honeypot — if the hidden field has any value, it's a bot
  if (website) return "honeypot";

  // Layer 2: Timing — if form was submitted faster than a human can type
  if (_loaded) {
    const elapsed = (Date.now() - parseInt(_loaded, 10)) / 1000;
    if (elapsed < MIN_SUBMIT_SECONDS) return "timing";
  }

  // Layer 3: Blocked email domains
  const emailDomain = (email || "").split("@")[1]?.toLowerCase();
  if (emailDomain && BLOCKED_DOMAINS.includes(emailDomain)) return "blocked_domain";

  // Layer 4: Message is just a phone number (pattern from smartremoteva spam)
  const digitsOnly = (message || "").replace(/\D/g, "");
  const phoneDigits = (phone || "").replace(/\D/g, "");
  if (digitsOnly.length >= 7 && digitsOnly === phoneDigits) return "phone_as_message";

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, email, message, website, _loaded } = req.body || {};

  // Basic validation
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Spam check — return fake success so bots don't adapt
  const spamReason = isSpam({ name, phone, email, message, website, _loaded });
  if (spamReason) {
    console.log(`[SPAM BLOCKED] reason=${spamReason} email=${email} name=${name}`);
    return res.status(200).json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY environment variable");
    return res.status(500).json({
      error: "Email service not configured. Please try again later."
    });
  }

  try {
    const emailData = {
      // IMPORTANT: if your verified Resend domain is different, change ONLY the part after @
      from: "Pergola Builder Houston <forms@pergolabuilderhouston.com>",
      to: [
        "chavezdarrel@yahoo.com",
        "ed@frontlineconstructionhtx.com"
      ],
      reply_to: email,
      subject: "New Pergola Builder Houston Lead",
      text: `
New Pergola Builder Houston Lead

Name: ${name}
Phone: ${phone}
Email: ${email}

Project details:
${message}
      `.trim()
    };

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    if (!resp.ok) {
      let bodyText = "";
      try {
        bodyText = await resp.text();
      } catch (e) {
        // ignore
      }
      console.error("Resend error:", resp.status, bodyText);
      return res.status(500).json({
        error:
          bodyText ||
          `Resend returned status ${resp.status} while sending the email.`
      });
    }

    // Success
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error sending lead email:", error);
    return res.status(500).json({
      error:
        "Error sending email: " + (error?.message || "Unknown server error.")
    });
  }
}
