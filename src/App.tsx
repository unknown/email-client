import { useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { EmailThread } from "@/electron/gmail/types";
import { ThreadList } from "./components/thread-list";
import { ThreadView } from "./components/thread-view";

function App() {
  const [threads, setThreads] = useState<EmailThread[] | null>(null);
  const [thread, setThread] = useState<EmailThread | null>(null);

  const loadInbox = useCallback(async (abortSignal?: AbortSignal) => {
    const inbox = await window.gmail.listInbox();
    if (!abortSignal?.aborted && inbox !== null) {
      setThreads(inbox);
    }
  }, []);

  // TODO: no abortsignal here
  const sync = useCallback(async () => {
    const didSync = await window.gmail.sync();
    if (didSync) {
      loadInbox();
    }
  }, [loadInbox]);

  useEffect(() => {
    const abortController = new AbortController();

    loadInbox(abortController.signal);
    sync();
    const syncInterval = setInterval(sync, 10 * 1000);

    return () => {
      abortController.abort();
      clearInterval(syncInterval);
    };
  }, [loadInbox, sync]);

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
      messages: fullThread.messages.map((message) => ({
        ...message,
        labelIds: message.labelIds?.filter((label) => label !== "UNREAD") ?? null,
      })),
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
    <div className="flex h-screen flex-col">
      <PanelGroup autoSaveId="thread-list" direction="horizontal">
        <Panel minSizePixels={240} maxSizePercentage={50} defaultSizePixels={300}>
          <ThreadList
            threads={threads}
            selectedThreadId={thread?.id ?? null}
            onThreadClick={onThreadClick}
          />
        </Panel>
        <PanelResizeHandle className="w-1">
          <div className="mx-auto h-full w-px bg-ui" />
        </PanelResizeHandle>
        <Panel>
          <ThreadView key={thread?.id} thread={thread} />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
