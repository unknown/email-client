import { useState } from "react";

import { EmailThread } from "../../electron/gmail/types";
import { ThreadItem } from "./thread-item";

type ThreadListProps = {
  threads: EmailThread[] | null;
  onThreadClick: (thread: EmailThread) => void;
};

export function ThreadList({ threads, onThreadClick: consumerOnThreadClick }: ThreadListProps) {
  const [selected, setSelected] = useState<number | null>(null);

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
            setSelected(i);
            consumerOnThreadClick(thread);
          }}
          isSelected={i === selected}
        />
      ))}
    </div>
  );
}
