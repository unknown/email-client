import { useEffect, useRef, useState } from "react";

type EmailPreviewProps = {
  html: string | null;
  text: string | null;
};

const iFrameBaseStyles = `\
body {
  margin: 0px;
  font-family: 'Helvetica', 'Arial', sans-serif;
}`;

export function EmailPreview({ html, text }: EmailPreviewProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState("0px");

  function resize() {
    const document = ref.current?.contentWindow?.document;
    if (!document) {
      return;
    }
    const rect = document.documentElement.getBoundingClientRect();
    setHeight(rect.height + "px");
  }

  function onLoad() {
    const document = ref.current?.contentWindow?.document;
    if (!document) {
      return;
    }

    resize();

    const body = document.body;
    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = iFrameBaseStyles;
    body.appendChild(stylesheet);

    const links = document.getElementsByTagName("a");
    for (const link of links) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        window.browser.openUrl(link.href);
      });
    }
  }

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  });

  let htmlToRender: string | null = null;
  if (html !== null) {
    htmlToRender = html;
  } else if (text !== null) {
    htmlToRender = text;
  } else {
    htmlToRender = "Email could not be decoded";
  }

  return <iframe ref={ref} onLoad={onLoad} srcDoc={htmlToRender} height={height} />;
}
