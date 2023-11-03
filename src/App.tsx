import { useEffect, useState } from "react";

import { EmailThread } from "@/electron/gmail/types";
import { ThreadList } from "./components/thread-list";
import { ThreadView } from "./components/thread-view";

function App() {
  const [threads, setThreads] = useState<EmailThread[] | null>(null);
  const [thread, setThread] = useState<EmailThread | null>(null);

  useEffect(() => {
    let canceled = false;
    async function loadInbox() {
      const inbox = await window.gmail.listInbox();
      if (!canceled && inbox !== null) {
        setThreads(inbox);
      }
    }
    loadInbox();
    return () => {
      canceled = true;
    };
  }, []);

  async function onThreadClick(threadId: string | null) {
    if (!threadId || thread?.id === threadId) {
      return;
    }

    // TODO: cache these retrieved threads?
    const fullThread = await window.gmail.getThread(threadId);

    const isUnread = fullThread?.messages.some((message) => message.labelIds?.includes("UNREAD"));
    if (!fullThread?.id || !isUnread) {
      setThread(fullThread);
      return;
    }

    const optimisticThread = {
      ...fullThread,
      messages: fullThread.messages.map((message) => {
        return {
          ...message,
          labelIds: message.labelIds?.filter((label) => label !== "UNREAD") ?? null,
        };
      }),
    };

    // TODO: make these sync automatically???
    setThread(optimisticThread);
    setThreads(
      (threads) =>
        threads?.map((t) => (t.id === optimisticThread.id ? optimisticThread : t)) ?? null,
    );

    const updatedThread = await window.gmail.modifyThread(fullThread.id, {
      removeLabelIds: ["UNREAD"],
    });
    const updatedOrFallbackThread = updatedThread ?? fullThread;

    setThread(updatedOrFallbackThread);
    setThreads(
      (threads) =>
        threads?.map((t) => (t.id === updatedOrFallbackThread.id ? updatedOrFallbackThread : t)) ??
        null,
    );
  }

  return (
    <div className="flex h-screen flex-col gap-2">
      <div className="grid min-h-0 flex-1 flex-shrink grid-cols-[300px_1fr] divide-x">
        <ThreadList threads={threads} onThreadClick={onThreadClick} />
        <ThreadView key={thread?.id} thread={thread} />
      </div>
    </div>
  );
}

export default App;
