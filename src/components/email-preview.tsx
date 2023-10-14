import { gmail_v1 } from "googleapis";

import { EmailMessagePreview } from "./email-message-preview";

type EmailPreviewProps = {
  thread: gmail_v1.Schema$Thread | null;
};

export function EmailPreview({ thread }: EmailPreviewProps) {
  if (!thread) {
    return "No email selected";
  }
  return (
    <div className="flex flex-col gap-4">
      {thread.messages?.map((message, i) => {
        return <EmailMessagePreview key={message.id ?? i} message={message} />;
      })}
    </div>
  );
}
