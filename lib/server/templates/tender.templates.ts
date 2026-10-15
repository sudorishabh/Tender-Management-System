import { format } from "date-fns";
import { escapeHtml } from "@/lib/server/escapeHtml";

interface TenderInvitationParams {
  tenderNumber: string;
  tenderTitle: string;
  tenderDescription: string;
  tenderId: number;
  tenderReleaseDate: Date | null;
  tenderBidSubmissionDeadline: Date | null;
}

export const tenderInvitationEmail = ({
  tenderNumber,
  tenderTitle,
  tenderDescription,
  tenderId,
  tenderReleaseDate,
  tenderBidSubmissionDeadline,
}: TenderInvitationParams) => {
  const subject = `Tender Invitation - ${tenderNumber}: ${tenderTitle}`;
  const tenderUrl = `${process.env.NEXT_PUBLIC_URL}/tender/${tenderId}`;
  const registerUrl = `${process.env.NEXT_PUBLIC_URL}/register`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tender Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #2563eb; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                Tender Management System
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px; font-weight: bold;">
                You're Invited to Participate in a Tender
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                You have been invited to participate in the following tender opportunity:
              </p>

              <!-- Tender Details Box -->
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                  <strong>Tender Number:</strong> ${escapeHtml(tenderNumber)}
                </p>
                <p style="margin: 10px 0 0; color: #374151; font-size: 14px; line-height: 1.5;">
                  <strong>Title:</strong> ${escapeHtml(tenderTitle)}
                </p>
                ${
                  tenderDescription
                    ? `
                <p style="margin: 10px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  <strong>Description:</strong> ${escapeHtml(tenderDescription.substring(0, 200))}${tenderDescription.length > 200 ? "..." : ""}
                </p>
                `
                    : ""
                }
              </div>

              <!-- Key Dates Box -->
              ${
                tenderReleaseDate || tenderBidSubmissionDeadline
                  ? `
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #78350f; font-size: 14px; font-weight: bold;">
                  Important Dates:
                </p>
                ${
                  tenderReleaseDate
                    ? `
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                  <strong>Release Date:</strong> ${format(tenderReleaseDate, "PPP")}
                </p>
                `
                    : ""
                }
                ${
                  tenderBidSubmissionDeadline
                    ? `
                <p style="margin: 10px 0 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                  <strong>Bid Submission Deadline:</strong> ${format(tenderBidSubmissionDeadline, "PPP")}
                </p>
                `
                    : ""
                }
              </div>
              `
                  : ""
              }

              <!-- CTA Buttons -->
              <div style="margin-top: 30px; text-align: center;">
                <a href="${tenderUrl}"
                   style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 0 5px 10px;">
                  View Tender Details
                </a>
              </div>

              <!-- Registration Notice -->
              <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5; text-align: center;">
                  <strong>Not Registered Yet?</strong><br>
                  <a href="${registerUrl}" style="color: #2563eb; text-decoration: underline;">Click here to register</a> as a vendor to participate in this tender.
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                If you have any questions or need assistance, please contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                This is an automated message from Tender Management System.<br>
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

You're Invited to Participate in a Tender

You have been invited to participate in the following tender opportunity:

TENDER DETAILS
--------------
Tender Number: ${tenderNumber}
Title: ${tenderTitle}
${tenderDescription ? `Description: ${tenderDescription.substring(0, 300)}${tenderDescription.length > 300 ? "..." : ""}` : ""}

${
  tenderReleaseDate || tenderBidSubmissionDeadline
    ? `
IMPORTANT DATES
---------------
${tenderReleaseDate ? `Release Date: ${format(tenderReleaseDate, "PPP")}` : ""}
${tenderBidSubmissionDeadline ? `Bid Submission Deadline: ${format(tenderBidSubmissionDeadline, "PPP")}` : ""}
`
    : ""
}

View full tender details at: ${tenderUrl}

NOT REGISTERED YET?
-------------------
Register as a vendor to participate in this tender: ${registerUrl}

If you have any questions or need assistance, please contact our support team.

This is an automated message from Tender Management System.
Please do not reply to this email.
  `;

  return { html, text, subject };
};
