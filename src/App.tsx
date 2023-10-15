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
      if (!canceled) {
        setThreads(inbox);
      }
    }
    loadInbox();
    return () => {
      canceled = true;
    };
  }, []);

  async function updateThread(thread: EmailThread) {
    setThread(thread);
  }

  return (
    <div className="flex h-screen flex-col gap-2">
      <div className="grid min-h-0 flex-1 flex-shrink grid-cols-[300px_1fr] divide-x">
        <ThreadList threads={threads} onThreadClick={updateThread} />
        <ThreadView thread={thread} />
      </div>
    </div>
  );
}

export default App;
