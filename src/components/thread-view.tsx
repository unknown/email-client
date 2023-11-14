import OpenAI from "openai";
import { useState } from "react";
import Markdown from "react-markdown";

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
      <div className="flex h-full items-center">
        <p className="mx-auto">No email selected</p>
      </div>
    );
  }

  const firstMessage = thread.messages.at(0);
  if (!firstMessage) {
    return (
      <div className="flex h-full items-center">
        <p className="mx-auto">Empty email thread</p>
      </div>
    );
  }

  const subject = firstMessage.decodedPayload.headers["Subject"];

  return (
    <div className="flex h-full flex-col gap-2 overflow-scroll px-6 py-4">
      <h1 className="text-lg font-bold">{subject ?? "(No subject)"}</h1>
      <GenerationBanner
        summary={summary}
        isLoading={isLoading}
        onGenerate={async () => {
          setIsLoading(true);
          const stream = await summarizeThread(thread).catch((err) => {
            if (err instanceof OpenAI.APIError) {
              setSummary(`OpenAI error: ${err.message}`);
            } else {
              setSummary(`Unexpected error: ${err}`);
            }
            return null;
          });
          setIsLoading(false);

          if (stream !== null) {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content ?? "";
              setSummary((prev) => (prev ?? "") + content);
            }
          }
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
    <div className="break-words rounded-md bg-purple-50 px-6 py-3">
      {isLoading && summary === null && (
        <div className="space-y-1">
          <p>Generating...</p>
          <div className="flex max-w-lg flex-col gap-1.5">
            <div className="h-4 w-full animate-pulse rounded-md bg-purple-200" />
            <div className="h-4 w-full animate-pulse rounded-md bg-purple-200 animation-delay-150" />
            <div className="h-4 w-full animate-pulse rounded-md bg-purple-200 animation-delay-300" />
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
      {summary !== null && <Markdown className="prose prose-neutral">{summary}</Markdown>}
    </div>
  );
}
