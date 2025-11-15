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
    return res
      .status(500)
      .json({ error: "Email service not configured. Please try again later." });
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
        from: "Pergola Builder Houston <onboarding@resend.dev>",
        to: ["chavezdarrel@yahoo.com"],
        subject: "Pergola Builder Houston Lead",
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

    if (!resp.ok) {
      let details = "";
      try {
        const data = await resp.json();
        details = data?.message || JSON.stringify(data);
      } catch {
        // ignore parse error
      }
      console.error("Resend error:", resp.status, details);
      return res
        .status(500)
        .json({ error: "Error sending email. Please try again later." });
    }

    // Success
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error sending lead email:", error);
    return res
      .status(500)
      .json({ error: "Error sending email. Please try again later." });
  }
}
