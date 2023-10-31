import { useState } from "react";

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
      <GenerationBanner
        summary={summary}
        isLoading={isLoading}
        onGenerate={async () => {
          setIsLoading(true);
          const stream = await summarizeThread(thread);
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content ?? " ";
            setSummary((prev) => {
              if (prev === null) {
                return content;
              }
              return prev + content;
            });
          }
          setIsLoading(false);
        }}
      />
      <div className="flex flex-col divide-y">
        {thread.messages?.map((message, i) => {
          const isLast = i === thread.messages.length - 1;
          return <EmailMessage key={message.id ?? i} message={message} isCollapsible={!isLast} />;
        })}
      </div>
    </div>
  );
}

type GenerationBannerProps = {
  summary: string | null;
  isLoading: boolean;
  onGenerate: () => void;
};

function GenerationBanner({ summary, isLoading, onGenerate }: GenerationBannerProps) {
  return (
    <div className="rounded-md bg-purple-50 px-6 py-3">
      {isLoading && summary === null && (
        <div className="space-y-1">
          <p>Generating...</p>
          <div className="flex max-w-lg flex-col gap-1.5">
            <div className="h-4 w-full animate-pulse rounded-md bg-purple-200" />
            <div className="animation-delay-150 h-4 w-full animate-pulse rounded-md bg-purple-200" />
            <div className="animation-delay-300 h-4 w-full animate-pulse rounded-md bg-purple-200" />
          </div>
        </div>
      )}
      {!isLoading && summary === null && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:flex-nowrap sm:justify-normal sm:gap-4">
          <p>Get an AI-powered summary of this email thread?</p>
          <button
            className="rounded-full bg-purple-200 px-4 py-2 text-sm"
            onClick={onGenerate}
            disabled={isLoading}
          >
            Generate
          </button>
        </div>
      )}
      {summary !== null && <p>{summary}</p>}
    </div>
  );
}
