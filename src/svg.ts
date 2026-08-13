const NS = "http://www.w3.org/2000/svg";

const INK =
  "M16 2.5C23.5 2.5 29.5 8 29.2 15C29 20 26.5 23.5 23.5 25.5C25.8 29.5 25.2 34 23.2 38.5L21.4 35.2C20.8 31 20.2 28.2 19.6 26.5C19.2 29.8 18.4 34.5 17.2 39.5H15.5C14.8 34.8 14.2 30 13.6 26.8C12.2 30.5 10.5 34.2 8.8 37.2L7.5 35C9.2 31.2 10.8 27.8 12.2 25.2C8.2 23.2 4.8 19 5.2 13.5C5.6 7 10 2.5 16 2.5Z";

const SPLAT = "M6.5 17C3.2 18.2 2.2 21.5 4.4 23C6.8 22.2 7.6 19.5 6.5 17Z";

export function svgEl(
  name: string,
  attrs: Record<string, string> = {},
): SVGElement {
  const el = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

export function createBlot(): SVGSVGElement {
  const svg = svgEl("svg", {
    viewBox: "0 0 32 40",
    width: "32",
    height: "40",
    class: "cursorling-svg",
    "aria-hidden": "true",
  }) as SVGSVGElement;
  const carrier = svgEl("g", { class: "carrier" });
  const body = svgEl("g", { class: "body" });
  body.append(
    svgEl("path", { d: INK, class: "ink" }),
    svgEl("path", { d: SPLAT, class: "ink splat" }),
    face(),
  );
  carrier.append(body);
  svg.append(carrier);
  return svg;
}

function face(): SVGElement {
  const group = svgEl("g", { class: "face" });
  group.append(
    eye(12.4, 14.6, "l"),
    eye(20.2, 14.6, "r"),
    svgEl("ellipse", {
      class: "mouth",
      cx: "16.2",
      cy: "20.5",
      rx: "2.2",
      ry: "1.4",
    }),
  );
  return group;
}

function eye(cx: number, cy: number, side: string): SVGElement {
  const group = svgEl("g", { class: `eye-wrap eye-${side}` });
  group.append(
    svgEl("ellipse", {
      class: "eye",
      cx: String(cx),
      cy: String(cy),
      rx: "3.1",
      ry: "3.5",
    }),
    svgEl("rect", {
      class: "lid",
      x: String(cx - 3.2),
      y: String(cy - 3.6),
      width: "6.4",
      height: "4.2",
      rx: "1.2",
    }),
    svgEl("circle", {
      class: "pupil",
      cx: String(cx),
      cy: String(cy + 0.35),
      r: "1.35",
    }),
  );
  return group;
}
