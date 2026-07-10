import prisma from "./prisma";

export async function sendEmailGraphAPI(to: string, subject: string, htmlContent: string) {
  // Fetch Azure AD credentials from DB
  const [tenantConfig, clientConfig, secretConfig, senderConfig] = await Promise.all([
    prisma.systemConfig.findUnique({ where: { key: "AZURE_AD_TENANT_ID" } }),
    prisma.systemConfig.findUnique({ where: { key: "AZURE_AD_CLIENT_ID" } }),
    prisma.systemConfig.findUnique({ where: { key: "AZURE_AD_CLIENT_SECRET" } }),
    prisma.systemConfig.findUnique({ where: { key: "MAIL_SENDER_ADDRESS" } }),
  ]);

  const tenantId = tenantConfig?.value || process.env.AZURE_AD_TENANT_ID;
  const clientId = clientConfig?.value || process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = secretConfig?.value || process.env.AZURE_AD_CLIENT_SECRET;
  const senderEmail = senderConfig?.value || process.env.MAIL_SENDER_ADDRESS;

  if (!tenantId || !clientId || !clientSecret || !senderEmail) {
    console.error("Missing Azure AD or Sender Email configuration for sending email.");
    return false;
  }

  try {
    // 1. Get Access Token from Microsoft Identity Platform
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Failed to get MS Graph access token:", error);
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Send Email via MS Graph API
    const sendEmailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: subject,
          body: {
            contentType: "HTML",
            content: htmlContent,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
        saveToSentItems: "false",
      }),
    });

    if (!sendEmailResponse.ok) {
      const error = await sendEmailResponse.text();
      console.error("Failed to send email via MS Graph:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error sending email via MS Graph:", err);
    return false;
  }
}
