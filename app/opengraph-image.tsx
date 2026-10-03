import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BASE_URL } from "@/lib/seo.config";

// Share card shown when a portal link is pasted into WhatsApp, LinkedIn,
// email and so on. Next serves it as og:image for every page.
export const alt =
  "TERI eTender Portal - tenders from The Energy and Resources Institute";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori cannot read Tailwind, so these mirror the brand tokens: --navy,
// --navy-soft, primary, --navy-foreground and --navy-accent
const NAVY = "#092539";
const NAVY_SOFT = "#19496b";
const PRIMARY = "#00619a";
const ON_NAVY = "#b9c9d5";
const ACCENT = "#51c1f5";

// DM Sans, the site font, as TTF - Satori cannot read the woff2 that
// next/font downloads. Without a user agent Google Fonts serves TTF. If the
// fetch fails the card falls back to the built-in font instead of erroring.
async function loadDmSans(weight: 400 | 700) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}`
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
    if (!url) return null;
    const data = await fetch(url).then((res) => res.arrayBuffer());
    return { name: "DM Sans", data, weight, style: "normal" as const };
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/TERI_LOGO.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const fonts = (await Promise.all([loadDmSans(400), loadDmSans(700)])).filter(
    (font) => font !== null
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "DM Sans",
          color: "#ffffff",
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 55%, ${PRIMARY} 100%)`,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* The logo is red and yellow, so it sits on a white tile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 136,
              height: 136,
              borderRadius: 28,
              background: "#ffffff",
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=''
              width={106}
              height={100}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 60, fontWeight: 700 }}>eTender Portal</div>
            <div style={{ fontSize: 30, color: ON_NAVY }}>
              The Energy and Resources Institute
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 940,
            fontSize: 50,
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
          Browse TERI tenders, buy tender documents and bid online
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 28,
            color: ON_NAVY,
          }}>
          <div>{new URL(BASE_URL).host}</div>
          <div style={{ color: ACCENT }}>Official TERI procurement portal</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
