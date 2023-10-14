import { gmail_v1 } from "googleapis";
import { useEffect, useState } from "react";

import { EmailPreview } from "./components/email-preview";
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

  async function updateThread(threadId: string) {
    const thread = (await window.gmail.getThread(threadId)) ?? null;
    setThread(thread);
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-lg underline">email client</h1>
      <div className="grid grid-cols-2 gap-2">
        <ThreadList threads={threads} onThreadClick={updateThread} />
        <EmailPreview thread={thread} />
      </div>
    </div>
  );
}

export default App;
