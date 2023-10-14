import { gmail_v1 } from "googleapis";
import { twMerge } from "tailwind-merge";

import { decodeHtmlEntities } from "../utils/decoder";

type ThreadItemProps = {
  thread: gmail_v1.Schema$Thread;
  isSelected: boolean;
  onThreadClick: () => void;
};

export function ThreadItem({ thread, isSelected, onThreadClick }: ThreadItemProps) {
  return (
    <div className="relative break-words px-4 py-2" onClick={onThreadClick}>
      <div
        className={twMerge("absolute inset-0 -z-10 rounded-md", isSelected ? "bg-blue-500" : null)}
      />
      <p className={twMerge(isSelected ? "text-white" : null)}>
        {decodeHtmlEntities(thread.snippet ?? "")}
      </p>
    </div>
  );
}
