import { gmail_v1 } from "googleapis";

import { decodePayload } from "../utils/decoder";

type EmailPreviewProps = {
  message: gmail_v1.Schema$Message;
};

export function EmailPreview({ message }: EmailPreviewProps) {
  const { html, text, headers } = decodePayload(message.payload);
  const date = message.internalDate ? new Date(parseInt(message.internalDate)) : null;
  const dateString = date?.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  let htmlToRender: string | null = null;
  if (html !== null) {
    htmlToRender = html;
  } else if (text !== null) {
    const textWithBr = text.replaceAll("\n", "<br />");
    htmlToRender = textWithBr;
  } else {
    htmlToRender = "Email could not be decoded";
  }

  return (
    <div className="flex flex-col gap-4 outline p-2 outline-gray-200">
      <div className="flex justify-between items-center text-gray-600">
        <div>
          <div>From: {headers["From"]}</div>
          <div>To: {headers["Delivered-To"] ?? headers["To"]}</div>
        </div>
        <div>{dateString}</div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: htmlToRender }} />
    </div>
  );
}
