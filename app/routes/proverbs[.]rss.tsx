import type { LoaderFunction } from "@remix-run/node";

import { db } from "~/utils/db.server";

function escapeCdata(s: string) {
	return s.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(s: string) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

export const loader: LoaderFunction = async ({ request }) => {
	const proverbs = await db.proverb.findMany({
		take: 100,
		orderBy: { createdAt: "desc" },
		include: { author: { select: { username: true } } },
	});

	const host =
		request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
	if (!host) {
		throw new Error("Could not determine domain URL.");
	}
	const protocol = host.includes("localhost") ? "http" : "https";
	const domain = `${protocol}://${host}`;
	const proverbsUrl = `${domain}/proverbs`;

	const rssString = `
    <rss xmlns:blogChannel="${proverbsUrl}" version="2.0">
      <channel>
        <title>Proverbial Remix</title>
        <link>${proverbsUrl}</link>
        <description>Some funny proverbs</description>
        <language>en-us</language>
        <generator>Kody the Koala</generator>
        <ttl>40</ttl>
        ${proverbs
					.map((proverb) =>
						`
            <item>
              <description><![CDATA[A funny proverb called ${escapeHtml(
								proverb.content,
							)}]]></description>
              <author><![CDATA[${escapeCdata(
								proverb.author.username,
							)}]]></author>
              <pubDate>${proverb.createdAt.toUTCString()}</pubDate>
              <link>${proverbsUrl}/${proverb.id}</link>
              <guid>${proverbsUrl}/${proverb.id}</guid>
            </item>
          `.trim(),
					)
					.join("\n")}
      </channel>
    </rss>
  `.trim();

	return new Response(rssString, {
		headers: {
			"Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
			"Content-Type": "application/xml",
			"Content-Length": String(Buffer.byteLength(rssString)),
		},
	});
};
