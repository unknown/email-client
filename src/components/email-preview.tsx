import { useRef, useState } from "react";

type EmailPreviewProps = {
  html: string | null;
  text: string | null;
};

export function EmailPreview({ html, text }: EmailPreviewProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState("0px");

  const onLoad = () => {
    const document = ref.current?.contentWindow?.document;
    if (!document) {
      return;
    }
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(body.scrollHeight, html.scrollHeight);
    setHeight(height + 1 + "px");
  };

  let htmlToRender: string | null = null;
  if (html !== null) {
    htmlToRender = html;
  } else if (text !== null) {
    const textWithBr = text.replaceAll("\n", "<br />");
    htmlToRender = textWithBr;
  } else {
    htmlToRender = "Email could not be decoded";
  }

  return <iframe ref={ref} onLoad={onLoad} srcDoc={htmlToRender} height={height} />;
}
