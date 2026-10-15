import { escapeHtml } from "@/lib/server/escapeHtml";

interface WelcomeEmailData {
  name: string;
  loginLink: string;
}

export function welcomeEmail(data: WelcomeEmailData) {
  const { name, loginLink } = data;

  const subject = `Welcome to ${process.env.APP_NAME} Tender Management System`;

  const text = `
Dear ${name},

Welcome to ${process.env.APP_NAME} Tender Management System!

Your vendor registration has been received successfully. Our team will review your application and you will be notified once your account is approved.

Once approved, you can login at: ${loginLink}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
${process.env.APP_NAME} Team
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <title>Welcome to ${process.env.APP_NAME}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        table { border-collapse: collapse; }
        img { display: block; max-width: 100%; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .header { padding: 15px !important; }
          .header h1 { font-size: 22px !important; }
          .button-td { padding: 15px 0 !important; }
          .button-a { padding: 14px 24px !important; font-size: 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 10px;">
            <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td class="header" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">Welcome to ${process.env.APP_NAME}</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td class="content" style="padding: 35px 30px; background-color: #ffffff;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">Dear <strong style="color: #2d2d2d;">${escapeHtml(name)}</strong>,</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">Thank you for registering as a vendor with <strong>${process.env.APP_NAME}</strong> Tender Management System!</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">Your registration has been received successfully. Our team will carefully review your application, and you will receive a notification email once your account has been approved.</p>
                  
                  <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #555555;">Once your account is approved, you will be able to:</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Browse and view active tenders</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Submit bids for relevant tenders</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Track your bid status</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Manage your vendor profile</td></tr>
                  </table>
                  
                  <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.6; color: #555555;">After approval, you can login here:</p>
                  
                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td class="button-td" align="center" style="padding: 10px 0 25px;">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginLink}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="10%" strokecolor="#4CAF50" fillcolor="#4CAF50">
                          <w:anchorlock/>
                          <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Login to Your Account</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="${loginLink}" class="button-a" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #4CAF50; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; text-align: center; mso-padding-alt: 0; border: 2px solid #4CAF50;">
                          Login to Your Account
                        </a>
                        <!--<![endif]-->
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">If you have any questions or need assistance, please contact our support team.</p>
                  
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #555555;">Best regards,<br><strong style="color: #4CAF50;">${process.env.APP_NAME} Team</strong></p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 25px 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #888888;">This is an automated email. Please do not reply to this message.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, text, html };
}

interface AdminInviteEmailData {
  url: string;
  adminName: string;
  expirationTime: string;
}

export function adminInviteEmail(data: AdminInviteEmailData) {
  const { url, adminName, expirationTime } = data;

  const subject = `Admin Invitation - ${process.env.APP_NAME} Tender Management System`;

  const text = `
Admin Invitation

Hello ${adminName},

You are invited to join the ${process.env.APP_NAME} Tender Management System as an admin.

Accept Invitation: ${url}

This invitation expires in: ${expirationTime}

If you did not expect this invitation, please ignore this email.

Best regards,
${process.env.APP_NAME} Team
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <title>Admin Invitation - ${process.env.APP_NAME}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        table { border-collapse: collapse; }
        img { display: block; max-width: 100%; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .header { padding: 15px !important; }
          .header h1 { font-size: 22px !important; }
          .button-td { padding: 15px 0 !important; }
          .button-a { padding: 14px 24px !important; font-size: 16px !important; }
          .warning-td { padding: 15px !important; }
          .fallback-link { font-size: 12px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 10px;">
            <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td class="header" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">Admin Invitation</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td class="content" style="padding: 35px 30px; background-color: #ffffff;">
                  <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #333333;">Hello ${escapeHtml(adminName)}!</h2>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">You have been invited to join the <strong style="color: #007bff;">${process.env.APP_NAME}</strong> Tender Management System as an administrator.</p>
                  
                  <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #555555;">As an admin, you will have access to manage tenders, users, and system settings. Click the button below to accept your invitation and set up your account.</p>
                  
                  <!-- Warning Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr>
                      <td class="warning-td" style="background-color: #fff8e6; border: 1px solid #ffe0a3; border-radius: 6px; padding: 18px 20px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #856404;">
                          <strong>⏰ Important:</strong> This invitation expires in <strong>${expirationTime}</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td class="button-td" align="center" style="padding: 10px 0 30px;">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="10%" strokecolor="#007bff" fillcolor="#007bff">
                          <w:anchorlock/>
                          <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Accept Invitation</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="${url}" class="button-a" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #007bff; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; text-align: center; mso-padding-alt: 0; border: 2px solid #007bff;">
                          Accept Invitation
                        </a>
                        <!--<![endif]-->
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.5; color: #888888;">If the button above doesn't work, copy and paste this link into your browser:</p>
                  <p class="fallback-link" style="margin: 0; font-size: 13px; line-height: 1.4; color: #007bff; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 4px; border: 1px solid #e9ecef;">
                    ${url}
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 25px 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #888888;">This invitation was sent by <strong>${process.env.APP_NAME}</strong> Tender Management System.</p>
                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #888888;">If you did not expect this invitation, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, text, html };
}

interface VendorRegistrationEmailData {
  vendorName: string;
  vendorEmail: string;
  businessName: string;
}

export function vendorRegistrationEmail(data: VendorRegistrationEmailData) {
  const { vendorName, businessName } = data;

  const subject = `Registration Received - ${process.env.APP_NAME} Tender Management System`;

  const text = `
Dear ${vendorName},

Thank you for registering with ${process.env.APP_NAME} Tender Management System!

Your vendor registration for ${businessName} has been received successfully and is now under review by our team.

What happens next?
- Our team will review your application and documents
- You will receive an email notification once your account is approved
- The review process typically takes 1-3 business days

Once approved, you will be able to:
- Browse and view active tenders
- Submit bids for relevant tenders
- Track your bid status
- Manage your vendor profile

If you have any questions, please don't hesitate to contact our support team.

Best regards,
${process.env.APP_NAME} Team
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <title>Registration Received - ${process.env.APP_NAME}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        table { border-collapse: collapse; }
        img { display: block; max-width: 100%; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .header { padding: 15px !important; }
          .header h1 { font-size: 22px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 10px;">
            <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td class="header" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">Registration Received!</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td class="content" style="padding: 35px 30px; background-color: #ffffff;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">Dear <strong style="color: #2d2d2d;">${escapeHtml(vendorName)}</strong>,</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">Thank you for registering with <strong>${process.env.APP_NAME}</strong> Tender Management System!</p>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">Your vendor registration for <strong>${escapeHtml(businessName)}</strong> has been received successfully and is now under review by our team.</p>
                  
                  <!-- Status Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr>
                      <td style="background-color: #e8f5e9; border: 1px solid #81c784; border-radius: 6px; padding: 18px 20px; border-left: 4px solid #4CAF50;">
                        <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.5; color: #2e7d32; font-weight: 600;">
                          ✓ Application Submitted
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #558b2f;">
                          Your application is now under review. We'll notify you once the review is complete.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #555555; font-weight: 600;">What happens next?</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">📋 Our team will review your application and documents</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">📧 You'll receive an email once your account is approved</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">⏱️ Review typically takes 1-3 business days</td></tr>
                  </table>
                  
                  <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #555555; font-weight: 600;">Once approved, you will be able to:</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Browse and view active tenders</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Submit bids for relevant tenders</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Track your bid status</td></tr>
                    <tr><td style="padding: 6px 0 6px 20px; font-size: 15px; color: #555555;">✓ Manage your vendor profile</td></tr>
                  </table>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">If you have any questions or need assistance, please contact our support team.</p>
                  
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #555555;">Best regards,<br><strong style="color: #4CAF50;">${process.env.APP_NAME} Team</strong></p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 25px 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #888888;">This is an automated email. Please do not reply to this message.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, text, html };
}

interface AdminVendorRegistrationNotificationData {
  vendorName: string;
  vendorEmail: string;
  businessName: string;
  vendorContact: string;
  vendorSource: string;
}

export function adminVendorRegistrationNotification(
  data: AdminVendorRegistrationNotificationData,
) {
  const { vendorName, vendorEmail, businessName, vendorContact, vendorSource } =
    data;

  const subject = `New Vendor Registration - ${businessName}`;

  // Construct URLs and app name with fallbacks
  const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const adminDashboardUrl = `${appUrl}/admin`;
  const appName = process.env.APP_NAME || "Tender Management System";

  const text = `
New Vendor Registration Alert

A new vendor has registered on the ${appName} and requires review.

Vendor Details:
- Name: ${vendorName}
- Email: ${vendorEmail}
- Contact: ${vendorContact}
- Business Name: ${businessName}
- Registration Source: ${vendorSource}

Action Required:
Please review the vendor's application and documents in the admin dashboard.

Login to Admin Dashboard: ${adminDashboardUrl}

Best regards,
${appName}
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <title>New Vendor Registration - ${appName}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        table { border-collapse: collapse; }
        img { display: block; max-width: 100%; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .header { padding: 15px !important; }
          .header h1 { font-size: 22px !important; }
          .button-a { padding: 14px 24px !important; font-size: 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 10px;">
            <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td class="header" style="background-color: #ff6b6b; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">🔔 New Vendor Registration</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td class="content" style="padding: 35px 30px; background-color: #ffffff;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    A new vendor has registered on <strong>${appName}</strong> and requires review.
                  </p>
                  
                  <!-- Vendor Details Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr>
                      <td style="background-color: #fff8e6; border: 1px solid #ffe0a3; border-radius: 6px; padding: 20px; border-left: 4px solid #ff6b6b;">
                        <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.5; color: #333; font-weight: 600;">Vendor Details:</p>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #666; width: 140px;"><strong>Name:</strong></td>
                            <td style="padding: 4px 0; font-size: 14px; color: #333;">${escapeHtml(vendorName)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #666;"><strong>Email:</strong></td>
                            <td style="padding: 4px 0; font-size: 14px; color: #333;">${escapeHtml(vendorEmail)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #666;"><strong>Contact:</strong></td>
                            <td style="padding: 4px 0; font-size: 14px; color: #333;">${escapeHtml(vendorContact)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #666;"><strong>Business Name:</strong></td>
                            <td style="padding: 4px 0; font-size: 14px; color: #333;">${escapeHtml(businessName)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #666;"><strong>Source:</strong></td>
                            <td style="padding: 4px 0; font-size: 14px; color: #333;">${
                              vendorSource.charAt(0).toUpperCase() +
                              vendorSource.slice(1)
                            }</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Action Required Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 25px;">
                    <tr>
                      <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 18px 20px; border-left: 4px solid #ef4444;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #991b1b;">
                          <strong>⚠️ Action Required:</strong> Please review the vendor's application and documents in the admin dashboard.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 25px;">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${adminDashboardUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="10%" strokecolor="#ff6b6b" fillcolor="#ff6b6b">
                          <w:anchorlock/>
                          <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Go to Admin Dashboard</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="${adminDashboardUrl}" class="button-a" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #ff6b6b; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; text-align: center; mso-padding-alt: 0; border: 2px solid #ff6b6b;">
                          Go to Admin Dashboard
                        </a>
                        <!--<![endif]-->
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #555555;">Best regards,<br><strong style="color: #ff6b6b;">${appName}</strong></p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 25px 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #888888;">This is an automated notification from ${appName}.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, text, html };
}
