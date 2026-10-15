const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes text for HTML email markup, so names and titles people type can't
 * add links or markup to emails sent from the app's address
 */
export const escapeHtml = (value: string | null | undefined) =>
  (value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
