import DOMPurify from "dompurify";

import { convertTextToHtml } from "@/utils/email";

type EmailPreviewProps = {
  html: string | null;
  text: string | null;
};

export function EmailPreview({ html, text }: EmailPreviewProps) {
  let htmlToRender: string | null = null;
  if (html !== null) {
    htmlToRender = html;
  } else if (text !== null) {
    htmlToRender = convertTextToHtml(text);
  } else {
    htmlToRender = "Email could not be decoded";
  }

  return (
    <div
      className="unpreflight"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlToRender) }}
    />
  );
}
