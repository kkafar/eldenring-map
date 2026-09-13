import TurndownService from "turndown";

export const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

interface LinkNode {
  getAttribute(name: string): string | null;
}

// Converts source HTML to Markdown. Relative links are absolutized against
// `baseUrl` when given, otherwise reduced to their text. Images are dropped.
// Malformed HTML falls back to stripped text; empty input becomes lorem ipsum.
export function htmlToMarkdown(
  html: string,
  options: { baseUrl?: string } = {},
): string {
  const trimmed = html.trim();
  if (!trimmed) return LOREM_IPSUM;

  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
  });
  // addRule (not remove): turndown's built-in image rule would otherwise win for <img>.
  service.addRule("drop", {
    filter: ["img", "script", "style"],
    replacement: () => "",
  });
  service.addRule("links", {
    filter: "a",
    replacement: (content, node) => {
      const text = content.trim();
      if (!text) return "";
      const href = (node as unknown as LinkNode).getAttribute("href")?.trim();
      const absolute = href ? resolveHref(href, options.baseUrl) : undefined;
      return absolute ? `[${text}](${absolute})` : text;
    },
  });

  try {
    const markdown = service.turndown(trimmed).trim();
    return markdown || LOREM_IPSUM;
  } catch {
    return stripTags(trimmed) || LOREM_IPSUM;
  }
}

export function resolveHref(
  href: string,
  baseUrl?: string,
): string | undefined {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return undefined;
  }
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
