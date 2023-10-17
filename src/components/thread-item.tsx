import { twMerge } from "tailwind-merge";

import { EmailThread } from "@/electron/gmail/types";
import { getNameAndEmail } from "@/utils/email";

type ThreadItemProps = {
  thread: EmailThread;
  isSelected: boolean;
  onThreadClick: () => void;
};

export function ThreadItem({ thread, isSelected, onThreadClick }: ThreadItemProps) {
  const lastMessage = thread.messages?.at(-1);
  const senders = thread.messages.map((message) => message.decodedPayload.headers["From"]);
  const subject = lastMessage?.decodedPayload.headers["Subject"];
  const snippet = lastMessage?.snippet;

  const uniqueSenders = [...new Set(senders)];
  const sendersText = uniqueSenders
    .map((from) => (from ? getNameAndEmail(from).name ?? from : null))
    .join(", ");

  return (
    <div
      className={twMerge(
        "relative break-words px-4 py-2 text-sm",
        isSelected ? "text-white" : null,
      )}
      onClick={onThreadClick}
    >
      <div
        className={twMerge("absolute inset-0 -z-10 rounded-md", isSelected ? "bg-blue-600" : null)}
      />
      <h2 className="truncate font-bold">{sendersText}</h2>
      <h3 className="truncate font-medium">{subject}</h3>
      <p className={twMerge("truncate", !isSelected ? "text-tx-2" : null)}>{snippet}</p>
    </div>
  );
}
