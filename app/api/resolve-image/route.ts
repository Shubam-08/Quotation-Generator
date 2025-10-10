import { NextResponse } from "next/server";

function extractMetaContent(html: string, selectors: { property?: string; name?: string }[]) {
  for (const sel of selectors) {
    const attr = sel.property ? `property=\"${sel.property}\"` : `name=\"${sel.name}\"`;
    const regex = new RegExp(`<meta[^>]+${attr}[^>]+content=\"([^\"]+)\"[^>]*>`, "i");
    const match = html.match(regex);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractGoogleDriveFileId(url: string): string | null {
  // Handle various Google Drive URL formats:
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/uc?id=FILE_ID
  
  const patterns = [
    /[?&]id=([^&]+)/i,                    // ?id=FILE_ID or &id=FILE_ID
    /\/file\/d\/([^\/]+)/i,               // /file/d/FILE_ID
    /\/d\/([^\/]+)/i,                     // /d/FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

    let target: URL;
    try {
      target = new URL(url);
      if (!(target.protocol === "http:" || target.protocol === "https:")) {
        return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Special handling for Google Drive URLs
    if (target.hostname === "drive.google.com") {
      const fileId = extractGoogleDriveFileId(url);
      if (fileId) {
        // Try multiple Google Drive direct link formats
        // Primary: Google's CDN (most reliable for public images)
        const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
        return NextResponse.json({ url: directUrl });
      }
      return NextResponse.json({ 
        error: "Could not extract Google Drive file ID. Please use a valid Google Drive sharing link." 
      }, { status: 422 });
    }

    // Fetch the page and try to parse out a direct image URL (og:image / twitter:image)
    const res = await fetch(target.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL (${res.status})` }, { status: 400 });
    }
    const html = await res.text();

    const img =
      extractMetaContent(html, [
        { property: "og:image" },
        { name: "twitter:image" },
        { property: "og:image:url" },
      ]) || null;

    if (!img) {
      return NextResponse.json({ error: "Could not resolve a direct image URL" }, { status: 422 });
    }

    // Basic sanity check
    try {
      const imgUrl = new URL(img, target);
      return NextResponse.json({ url: imgUrl.toString() });
    } catch {
      return NextResponse.json({ error: "Resolved image URL is invalid" }, { status: 422 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Resolver error" }, { status: 500 });
  }
}
