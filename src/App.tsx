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

  async function updateThread(thread: EmailThread) {
    const isUnread = thread?.messages.some((message) => message.labelIds?.includes("UNREAD"));
    if (!isUnread || !thread.id) {
      setThread(thread);
      return;
    }

    const optimisticThread = {
      ...thread,
      messages: thread.messages.map((message) => {
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

    const updatedThread = await window.gmail.modifyThread(thread.id, {
      removeLabelIds: ["UNREAD"],
    });

    const updatedOrFallbackThread = updatedThread ?? thread;
    setThreads(
      (threads) =>
        threads?.map((t) => (t.id === updatedOrFallbackThread.id ? updatedOrFallbackThread : t)) ??
        null,
    );
  }

  return (
    <div className="flex h-screen flex-col gap-2">
      <div className="grid min-h-0 flex-1 flex-shrink grid-cols-[300px_1fr] divide-x">
        <ThreadList threads={threads} onThreadClick={updateThread} />
        <ThreadView key={thread?.id} thread={thread} />
      </div>
    </div>
  );
}

export default App;
