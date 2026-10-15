import { VENDOR_STATUS } from "@/enum/vendorStatus.enum";
import { escapeHtml } from "@/lib/server/escapeHtml";

interface VendorStatusUpdatedParams {
  vendorName: string;
  status: VENDOR_STATUS;
}

export const vendorStatusUpdatedEmail = ({
  vendorName,
  status,
}: VendorStatusUpdatedParams) => {
  const statusMessages = {
    [VENDOR_STATUS.APPROVED]: {
      message: "Your vendor account has been approved!",
      details:
        "Congratulations! You can now participate in tenders and submit bids.",
      color: "#10b981",
    },
    [VENDOR_STATUS.PENDING]: {
      message: "Your vendor account is under review",
      details:
        "Your account status has been updated to pending. We will review your information and get back to you soon.",
      color: "#f59e0b",
    },
    [VENDOR_STATUS.REJECTED]: {
      message: "Your vendor account has been rejected",
      details:
        "Unfortunately, your vendor account application has been rejected. Please contact support for more information.",
      color: "#ef4444",
    },
  };

  const { message, details, color } = statusMessages[status];

  const subject = `Vendor Account Status Update - ${status}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${color}; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                Tender Management System
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px; font-weight: bold;">
                Hello ${escapeHtml(vendorName)},
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                ${message}
              </p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid ${color};">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                  <strong>Status:</strong> ${status.toUpperCase()}
                </p>
                <p style="margin: 10px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  ${details}
                </p>
              </div>
              
              ${
                status === VENDOR_STATUS.APPROVED
                  ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_URL}/vendor" 
                   style="display: inline-block; padding: 12px 30px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
              `
                  : ""
              }
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                If you have any questions, please contact our support team.
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
Hello ${vendorName},

${message}

Status: ${status.toUpperCase()}
${details}

${
  status === VENDOR_STATUS.APPROVED
    ? `You can now access your dashboard at: ${process.env.NEXT_PUBLIC_URL}/vendor`
    : ""
}

If you have any questions, please contact our support team.

This is an automated message from Tender Management System.
Please do not reply to this email.
  `;

  return { html, text, subject };
};
