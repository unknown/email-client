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
  const isUnread = lastMessage?.labelIds?.includes("UNREAD");

  const uniqueSenders = [...new Set(senders)];
  const sendersText = uniqueSenders
    .map((from) => (from ? getNameAndEmail(from).name ?? from : null))
    .join(", ");

  return (
    <div
      className={twMerge(
        "relative flex w-full break-words px-4 py-2 text-sm",
        isSelected ? "text-white" : null,
      )}
      onClick={onThreadClick}
    >
      {isSelected && <div className={twMerge("absolute inset-0 -z-10 rounded-md bg-blue-600")} />}
      <div className="relative w-4 flex-shrink-0">
        {isUnread && (
          <div
            className={twMerge(
              "absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
              isSelected ? "bg-white" : "bg-blue-600",
            )}
          />
        )}
      </div>
      <div className="min-w-0">
        <h2 className="truncate font-bold">{sendersText}</h2>
        <h3 className="truncate font-medium">{subject}</h3>
        <p className={twMerge("truncate", !isSelected ? "text-tx-2" : null)}>{snippet}</p>
      </div>
    </div>
  );
}
