import DOMPurify from "dompurify";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { EmailMessage as EmailMessageType } from "@/electron/gmail/types";
import { formatDate } from "@/utils/date";
import { convertTextToHtml } from "@/utils/email";
import { ContactItem } from "./contact-item";

type EmailMessageProps = {
  message: EmailMessageType;
  isCollapsible: boolean;
};

export function EmailMessage({ message, isCollapsible }: EmailMessageProps) {
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible);

  return (
    <div
      className={twMerge("flex flex-col gap-2 py-2", isCollapsed && "hover:cursor-pointer")}
      onClick={isCollapsible && isCollapsed ? () => setIsCollapsed(false) : undefined}
    >
      <EmailHeaders
        message={message}
        isCollapsed={isCollapsible ? isCollapsed : null}
        onClick={isCollapsible && !isCollapsed ? () => setIsCollapsed(true) : undefined}
      />
      <EmailPreview message={message} isCollapsed={isCollapsed} />
    </div>
  );
}

type EmailHeadersProps = {
  message: EmailMessageType;
  isCollapsed: boolean | null;
  onClick: (() => void) | undefined;
};

function EmailHeaders({ message, isCollapsed, onClick }: EmailHeadersProps) {
  const headers = message.decodedPayload.headers;
  const from = headers["From"];
  const to = headers["Delivered-To"] ?? headers["To"];
  const cc = headers["Cc"];
  const replyTo = headers["Reply-To"];

  const date = message.internalDate ? new Date(parseInt(message.internalDate)) : null;
  const dateString = formatDate(date, {
    dateStyle: "relative",
    timeStyle: "short",
    relativeDateFallback: "short",
  });

  return (
    <div
      className={twMerge(
        "flex flex-wrap justify-between gap-2 text-sm md:flex-nowrap",
        isCollapsed === false && "hover:cursor-pointer",
      )}
      onClick={onClick}
    >
      <div className="min-w-0 break-words">
        {from && <ContactItem contact={from} />}
        {!isCollapsed && (
          <>
            {to && <ContactItem label="To:" contact={to} />}
            {cc && <ContactItem label="Cc:" contact={cc} />}
            {replyTo && <ContactItem label="Reply To:" contact={replyTo} />}
          </>
        )}
      </div>
      <div className="flex-shrink-0 text-right text-tx-2">{dateString}</div>
    </div>
  );
}

type EmailPreviewProps = {
  message: EmailMessageType;
  isCollapsed: boolean;
};

export function EmailPreview({ message, isCollapsed }: EmailPreviewProps) {
  const { html, text } = message.decodedPayload;
  const snippet = message.snippet;

  if (isCollapsed) {
    return <p className="truncate text-sm text-tx-2">{snippet}</p>;
  }

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
