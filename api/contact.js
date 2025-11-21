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

  // Make sure we have an API key configured
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY environment variable");
    return res.status(500).json({
      error:
        "Email service not configured. Please try again later."
    });
  }

  try {
    // Send email via Resend API
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Pergola Builder Houston <onboarding@resend.dev>", // or forms@yourdomain.com once verified
        to: [
          "chavezdarrel@yahoo.com",
          "ed@frontlineconstructionhtx.com"
        ],
        subject: "Pergola Builder Houston Lead",
        reply_to: email, // so hitting Reply goes to the customer
        text: `
New Pergola Builder Houston Lead

Name: ${name}
Phone: ${phone}
Email: ${email}

Project details:
${message}
        `.trim()
      })
    });

    let details = "";
    let data = null;

    try {
      data = await resp.json();
      if (data) {
        details = data.message || data.error || JSON.stringify(data);
      }
    } catch (e) {
      try {
        details = await resp.text();
      } catch {
        // ignore
      }
    }

    if (!resp.ok) {
      console.error("Resend error:", resp.status, details);
      return res.status(500).json({
        error:
          details ||
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
