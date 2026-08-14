/**
 * Vite's HTML build plugin adds `crossorigin` to generated `<script type="module">`
 * and `<link rel="stylesheet">` tags for bundled assets. That makes the browser send
 * an `Origin` header on same-origin requests too, which trips a strict CORS
 * allow-list on the server and results in a blank page with no console error
 * (see issue #36). Strip `crossorigin` only from tags pointing at built `/assets/`
 * output; tags pointing elsewhere (e.g. the Google Fonts preconnect links) are
 * left untouched.
 */
export function stripAssetCrossorigin(html: string): string {
  return html.replace(/<(script|link)\b[^>]*>/g, (tag) => {
    if (!/\s(?:src|href)="[^"]*\/assets\/[^"]*"/.test(tag)) return tag;
    return tag.replace(/\s+crossorigin(="[^"]*")?/g, "");
  });
}
