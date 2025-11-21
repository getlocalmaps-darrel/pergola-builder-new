// api/contact.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, email, message } = req.body || {};

  // Basic validation
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
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
