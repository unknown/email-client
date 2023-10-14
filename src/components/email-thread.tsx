import { gmail_v1 } from "googleapis";

import { decodePayload } from "../utils/decoder";
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

  const latestMessagePayload = thread.messages?.at(-1)?.payload;
  const subject = latestMessagePayload
    ? decodePayload(latestMessagePayload).headers["Subject"]
    : null;

  return (
    <div className="overflow-scroll px-6 py-4">
      {subject && <h1 className="text-lg font-bold">{subject}</h1>}
      <div className="flex flex-col divide-y">
        {thread.messages?.map((message, i) => {
          return <EmailMessage key={message.id ?? i} message={message} />;
        })}
      </div>
    </div>
  );
}
