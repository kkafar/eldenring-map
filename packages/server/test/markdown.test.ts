import { describe, expect, it } from "vitest";
import { LOREM_IPSUM, htmlToMarkdown } from "../src/lib/markdown.js";

describe("htmlToMarkdown", () => {
  it("absolutizes relative links against the base URL", () => {
    const md = htmlToMarkdown(
      'See <a href="/Volcano+Manor">Volcano Manor</a>.',
      {
        baseUrl: "https://wiki.example/",
      },
    );
    expect(md).toBe("See [Volcano Manor](https://wiki.example/Volcano+Manor).");
  });

  it("reduces relative links to text without a base URL", () => {
    expect(htmlToMarkdown('<a href="/Some+Page">Some Page</a>')).toBe(
      "Some Page",
    );
  });

  it("drops images and keeps emphasis", () => {
    const md = htmlToMarkdown(
      '<p><img src="x.png"><strong>Bold</strong> text</p>',
    );
    expect(md).toBe("**Bold** text");
  });

  it("uses lorem ipsum for empty input", () => {
    expect(htmlToMarkdown("   ")).toBe(LOREM_IPSUM);
  });

  it("survives malformed markup", () => {
    expect(htmlToMarkdown("Dropped by a Knight <b>in unclosed bold")).toContain(
      "Knight",
    );
  });
});
