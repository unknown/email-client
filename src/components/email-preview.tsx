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

  const from = headers["From"];
  const to = headers["Delivered-To"] ?? headers["To"];
  const cc = headers["Cc"];
  const replyTo = headers["Reply-To"];

  return (
    <div className="flex flex-col gap-4 p-4 outline outline-gray-200">
      <div className="flex justify-between">
        <div>
          <div>
            From: <span className="text-gray-600">{from}</span>
          </div>
          <div>
            To: <span className="text-gray-600">{to}</span>
          </div>
          {cc && (
            <div>
              Cc: <span className="text-gray-600">{cc}</span>
            </div>
          )}
          {replyTo && (
            <div>
              Reply To: <span className="text-gray-600">{replyTo}</span>
            </div>
          )}
        </div>
        <div>{dateString}</div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: htmlToRender }} />
    </div>
  );
}
