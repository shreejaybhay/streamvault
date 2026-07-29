import { NextResponse } from "next/server";
import https from "https";
import http from "http";

export const dynamic = "force-dynamic";

// Helper function to fetch URL handling SSL issues, redirects, and timeouts
function fetchUrl(targetUrl, redirectCount = 0) {
  if (redirectCount > 5) {
    return Promise.reject(new Error("Too many redirects"));
  }

  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === "https:";
      const client = isHttps ? https : http;

      const req = client.request(
        targetUrl,
        {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "*/*",
            Connection: "keep-alive",
          },
          rejectUnauthorized: false, // Bypass legacy/invalid TLS certificate errors
          timeout: 12000,
        },
        (res) => {
          // Handle HTTP redirects (301, 302, 303, 307, 308)
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            const redirectUrl = new URL(res.headers.location, targetUrl).toString();
            return resolve(fetchUrl(redirectUrl, redirectCount + 1));
          }
          resolve(res);
        }
      );

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const targetResponse = await fetchUrl(targetUrl);

    if (targetResponse.statusCode >= 400) {
      return new NextResponse(
        `Target returned status ${targetResponse.statusCode}`,
        { status: targetResponse.statusCode }
      );
    }

    const contentType =
      targetResponse.headers["content-type"] || "application/vnd.apple.mpegurl";

    const isPlaylist =
      targetUrl.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegurl") ||
      contentType.includes("application/vnd.apple.mpegurl");

    if (isPlaylist) {
      const chunks = [];
      for await (const chunk of targetResponse) {
        chunks.push(chunk);
      }
      const text = Buffer.concat(chunks).toString("utf-8");

      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
      const origin = new URL(targetUrl).origin;

      const rewrittenLines = text.split("\n").map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          if (trimmed.startsWith("#") && trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
              let absUri = uri;
              if (uri.startsWith("//")) {
                absUri = "https:" + uri;
              } else if (uri.startsWith("/")) {
                absUri = origin + uri;
              } else if (!uri.startsWith("http")) {
                absUri = baseUrl + uri;
              }
              return `URI="/api/proxy?url=${encodeURIComponent(absUri)}"`;
            });
          }
          return line;
        }

        let absSegmentUrl = trimmed;
        if (trimmed.startsWith("//")) {
          absSegmentUrl = "https:" + trimmed;
        } else if (trimmed.startsWith("/")) {
          absSegmentUrl = origin + trimmed;
        } else if (!trimmed.startsWith("http")) {
          absSegmentUrl = baseUrl + trimmed;
        }

        return `/api/proxy?url=${encodeURIComponent(absSegmentUrl)}`;
      });

      const body = rewrittenLines.join("\n");
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-cache",
        },
      });
    }

    const chunks = [];
    for await (const chunk of targetResponse) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy fetch error:", error.message);
    return new NextResponse(`Proxy error: ${error.message}`, { status: 502 });
  }
}
