import { twMerge } from "tailwind-merge";

import { EmailThread } from "@/electron/gmail/types";

type ThreadItemProps = {
  thread: EmailThread;
  isSelected: boolean;
  onThreadClick: () => void;
};

export function ThreadItem({ thread, isSelected, onThreadClick }: ThreadItemProps) {
  const lastMessage = thread.messages?.at(-1);
  const from = lastMessage?.decodedPayload.headers["From"];
  const subject = lastMessage?.decodedPayload.headers["Subject"];
  const snippet = lastMessage?.snippet;

  return (
    <div
      className={twMerge(
        "relative space-y-1 break-words px-4 py-2",
        isSelected ? "text-white" : null,
      )}
      onClick={onThreadClick}
    >
      <div
        className={twMerge("absolute inset-0 -z-10 rounded-md", isSelected ? "bg-blue-500" : null)}
      />
      <h2 className="truncate font-bold">{from}</h2>
      <h3 className="truncate font-medium">{subject}</h3>
      <p className={twMerge("truncate", !isSelected ? "text-tx-2" : null)}>{snippet}</p>
    </div>
  );
}
