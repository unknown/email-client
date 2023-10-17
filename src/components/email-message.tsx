import { EmailMessage as EmailMessageType } from "@/electron/gmail/types";
import { ContactItem } from "./contact-item";
import { EmailPreview } from "./email-preview";

type EmailMessageProps = {
  message: EmailMessageType;
};

export function EmailMessage({ message }: EmailMessageProps) {
  const { html, text, headers } = message.decodedPayload;
  const date = message.internalDate ? new Date(parseInt(message.internalDate)) : null;

  return (
    <div className="flex flex-col gap-2 py-2">
      <EmailHeaders headers={headers} date={date} />
      <EmailPreview html={html} text={text} />
    </div>
  );
}

type EmailHeadersProps = {
  headers: Record<string, string>;
  date: Date | null;
};

function EmailHeaders({ headers, date }: EmailHeadersProps) {
  const dateString = date?.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  const from = headers["From"];
  const to = headers["Delivered-To"] ?? headers["To"];
  const cc = headers["Cc"];
  const replyTo = headers["Reply-To"];

  return (
    <div className="flex flex-wrap justify-between gap-2 text-sm md:flex-nowrap">
      <div className="min-w-0 break-words">
        {from && <ContactItem contact={from} />}
        {to && <ContactItem label="To:" contact={to} />}
        {cc && <ContactItem label="Cc:" contact={cc} />}
        {replyTo && <ContactItem label="Reply To:" contact={replyTo} />}
      </div>
      <div className="flex-shrink-0 text-right text-tx-2">{dateString}</div>
    </div>
  );
}
