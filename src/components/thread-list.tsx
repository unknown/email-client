import { EmailThread } from "@/electron/gmail/types";
import { ThreadItem } from "./thread-item";

type ThreadListProps = {
  threads: EmailThread[] | null;
  selectedThreadId: string | null;
  onThreadClick: (threadId: string | null) => void;
};

export function ThreadList({
  threads,
  selectedThreadId,
  onThreadClick: consumerOnThreadClick,
}: ThreadListProps) {
  if (threads === null) {
    return (
      <div className="flex items-center">
        <p className="w-full text-center">Failed to fetch emails</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y overflow-scroll p-2">
      {threads.map((thread, i) => (
        <ThreadItem
          key={thread.id ?? i}
          thread={thread}
          onThreadClick={() => {
            consumerOnThreadClick(thread.id);
          }}
          isSelected={thread.id === selectedThreadId}
        />
      ))}
    </div>
  );
}
