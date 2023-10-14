import { gmail_v1 } from "googleapis";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { decodeHtmlEntities } from "../utils/decoder";

type ThreadListProps = {
  threads: gmail_v1.Schema$Thread[] | null;
  onThreadClick: (labelId: string) => void;
};

export function ThreadList({ threads, onThreadClick }: ThreadListProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (threads === null) {
    return "Nothing selected";
  }

  return (
    <div className="flex flex-col divide-y overflow-scroll p-2">
      {threads.map((thread, i) => (
        <div
          key={thread.id ?? i}
          className={twMerge(
            "break-words px-4 py-2",
            selected === i ? "bg-blue-500 text-white" : null,
          )}
          onClick={() => {
            setSelected(i);
            onThreadClick(thread.id ?? "");
          }}
        >
          <p>{decodeHtmlEntities(thread.snippet ?? "")}</p>
        </div>
      ))}
    </div>
  );
}
