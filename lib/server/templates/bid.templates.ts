import { escapeHtml } from "@/lib/server/escapeHtml";

interface BidSubmissionNotificationParams {
  tenderTitle: string;
  tenderNumber: string;
  tenderId: number;
}

/**
 * Email template for admin notification when a bid is submitted
 * Does not contain any bid or vendor information for privacy
 */
export const bidSubmissionNotificationEmail = ({
  tenderTitle,
  tenderNumber,
  tenderId,
}: BidSubmissionNotificationParams) => {
  const subject = `New Bid Received - ${tenderNumber}`;
  const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const tenderBidsUrl = `${appUrl}/admin/live/${tenderId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Bid Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #16a34a; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                Tender Management System
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px; font-weight: bold;">
                New Bid Received
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                A new bid has been submitted for the following tender:
              </p>

              <!-- Tender Details Box -->
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #16a34a; margin-bottom: 20px;">
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                  <strong>Tender Number:</strong> ${escapeHtml(tenderNumber)}
                </p>
                <p style="margin: 10px 0 0; color: #166534; font-size: 14px; line-height: 1.5;">
                  <strong>Title:</strong> ${escapeHtml(tenderTitle)}
                </p>
              </div>

              <!-- Notice Box -->
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                  <strong>Action Required:</strong> Please review the bid in your admin dashboard.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="margin-top: 30px; text-align: center;">
                <a href="${tenderBidsUrl}"
                   style="display: inline-block; padding: 12px 30px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  View Tender Bids
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                This is an automated notification from Tender Management System.<br>
                Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Tender Management System
========================

New Bid Received

A new bid has been submitted for the following tender:

TENDER DETAILS
--------------
Tender Number: ${tenderNumber}
Title: ${tenderTitle}

ACTION REQUIRED
---------------
Please review the bid in your admin dashboard.

View Tender Bids: ${tenderBidsUrl}

This is an automated notification from Tender Management System.
Please do not reply to this email.
  `;

  return { html, text, subject };
};
