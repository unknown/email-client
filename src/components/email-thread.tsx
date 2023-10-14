import { gmail_v1 } from "googleapis";

import { EmailMessage } from "./email-message";

type EmailThreadProps = {
  thread: gmail_v1.Schema$Thread | null;
};

export function EmailThread({ thread }: EmailThreadProps) {
  if (!thread) {
    return (
      <div className="flex items-center">
        <p className="w-full text-center">No email selected</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col divide-y overflow-scroll px-4 py-2">
      {thread.messages?.map((message, i) => {
        return <EmailMessage key={message.id ?? i} message={message} />;
      })}
    </div>
  );
}
