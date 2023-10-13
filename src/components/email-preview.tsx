import { DecodedMessage } from "../utils/decoder";

type EmailPreviewProps = {
  decodedMessage: DecodedMessage;
};

export function EmailPreview({ decodedMessage: { text, html } }: EmailPreviewProps) {
  let htmlToRender: string | null = null;
  if (html !== null) {
    htmlToRender = html;
  } else if (text !== null) {
    const textWithBr = text.replaceAll("\n", "<br />");
    htmlToRender = textWithBr;
  }

  if (htmlToRender === null) {
    return "Email could not be decoded";
  }

  return (
    <div className="outline p-4 outline-gray-200">
      <div dangerouslySetInnerHTML={{ __html: htmlToRender }} />
    </div>
  );
}
