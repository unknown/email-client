import { gmail_v1 } from "googleapis";

import { decodeHtmlEntities } from "../utils/decoder";

type ThreadListProps = {
  threads: gmail_v1.Schema$Thread[] | null;
  onThreadClick: (labelId: string) => void;
};

export function ThreadList({ threads, onThreadClick }: ThreadListProps) {
  if (threads === null) {
    return "Nothing selected";
  }

  if (threads.length === 0) {
    return "Empty";
  }

  return (
    <div className="flex flex-col gap-3">
      {threads?.map((thread, i) => (
        <div key={thread.id ?? i} onClick={() => onThreadClick(thread.id ?? "")}>
          <p>{decodeHtmlEntities(thread.snippet ?? "")}</p>
        </div>
      ))}
    </div>
  );
}
