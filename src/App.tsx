import { gmail_v1 } from "googleapis";
import { useEffect, useState } from "react";

import { EmailThread } from "./components/email-thread";
import { ThreadList } from "./components/thread-list";

function App() {
  const [threads, setThreads] = useState<gmail_v1.Schema$Thread[] | null>(null);
  const [thread, setThread] = useState<gmail_v1.Schema$Thread | null>(null);

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

  async function updateThread({ id }: gmail_v1.Schema$Thread) {
    const thread = id ? await window.gmail.getThread(id) : null;
    setThread(thread ?? null);
  }

  return (
    <div className="flex h-screen flex-col gap-2">
      <div className="grid min-h-0 flex-1 flex-shrink grid-cols-[300px_1fr] divide-x">
        <ThreadList threads={threads} onThreadClick={updateThread} />
        <EmailThread thread={thread} />
      </div>
    </div>
  );
}

export default App;
