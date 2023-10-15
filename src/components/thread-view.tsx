import { EmailThread } from "@/electron/gmail/types";
import { EmailMessage } from "./email-message";

type ThreadViewProps = {
  thread: EmailThread | null;
};

export function ThreadView({ thread }: ThreadViewProps) {
  if (!thread) {
    return (
      <div className="flex items-center">
        <p className="w-full text-center">No email selected</p>
      </div>
    );
  }

  const latestMessage = thread.messages.at(-1);
  const subject = latestMessage ? latestMessage.decodedPayload.headers["Subject"] : null;

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
