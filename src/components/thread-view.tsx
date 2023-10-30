import { Fragment, useState } from "react";

import { EmailThread } from "@/electron/gmail/types";
import { summarizeThread } from "@/utils/openai";
import { EmailMessage } from "./email-message";

type ThreadViewProps = {
  thread: EmailThread | null;
};

export function ThreadView({ thread }: ThreadViewProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!thread) {
    return (
      <div className="flex items-center">
        <p className="w-full text-center">No email selected</p>
      </div>
    );
  }

  const latestMessage = thread.messages.at(-1);
  if (!latestMessage) {
    return (
      <div className="flex items-center">
        <p className="w-full text-center">Empty email thread</p>
      </div>
    );
  }

  const subject = latestMessage.decodedPayload.headers["Subject"];

  return (
    <div className="flex flex-col gap-2 overflow-scroll px-6 py-4">
      {subject && <h1 className="text-lg font-bold">{subject}</h1>}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-md bg-purple-50 px-4 py-2 sm:flex-nowrap sm:justify-normal">
        {summary ? (
          <div>{summary}</div>
        ) : (
          <Fragment>
            <p>Get an AI-powered summary of this email thread?</p>
            <button
              onClick={async () => {
                setIsLoading(true);
                const response = await summarizeThread(thread);
                setSummary(response.choices.at(0)?.message.content ?? "Error");
                setIsLoading(false);
                console.log(response);
              }}
              disabled={isLoading || summary !== null}
              className="rounded-full bg-purple-200 px-4 py-2 text-sm"
            >
              Generate
            </button>
          </Fragment>
        )}
      </div>
      <div className="flex flex-col divide-y">
        {thread.messages?.map((message, i) => {
          const isLast = i === thread.messages.length - 1;
          return <EmailMessage key={message.id ?? i} message={message} isCollapsible={!isLast} />;
        })}
      </div>
    </div>
  );
}
