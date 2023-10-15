import DOMPurify from "dompurify";

type EmailPreviewProps = {
  html: string | null;
  text: string | null;
};

export function EmailPreview({ html, text }: EmailPreviewProps) {
  let htmlToRender: string | null = null;
  if (html !== null) {
    htmlToRender = html;
  } else if (text !== null) {
    htmlToRender = text;
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
