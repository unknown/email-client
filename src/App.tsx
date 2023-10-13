import { gmail_v1 } from "googleapis";
import { useEffect, useState } from "react";

import { EmailPreview } from "./components/email-preview";
import { LabelList } from "./components/label-list";
import { ThreadList } from "./components/thread-list";
import { decodeMessage } from "./utils/decoder";

function App() {
  const [labels, setLabels] = useState<gmail_v1.Schema$Label[] | null>(null);
  const [threads, setThreads] = useState<gmail_v1.Schema$Thread[] | null>(null);
  const [thread, setThread] = useState<gmail_v1.Schema$Thread | null>(null);

  useEffect(() => {
    let canceled = false;
    async function loadLabels() {
      const labels = (await window.gmail.listLabels()) ?? [];
      if (!canceled) {
        setLabels(labels);
      }
    }
    loadLabels();
    return () => {
      canceled = true;
    };
  }, []);

  async function updateThreads(labelId: string) {
    const threads = (await window.gmail.listThreads([labelId])) ?? [];
    setThreads(threads);
    setThread(null);
  }

  async function updateThread(threadId: string) {
    const thread = (await window.gmail.getThread(threadId)) ?? null;
    setThread(thread);
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-lg underline">email client</h1>
      <div className="flex gap-2">
        <div className="flex-1">
          <LabelList labels={labels} onLabelClick={updateThreads} />
        </div>
        <div className="flex-1">
          <ThreadList threads={threads} onThreadClick={updateThread} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {thread?.messages?.map((message, i) => {
          const decodedMessage = decodeMessage(message);
          return <EmailPreview key={message.id ?? i} decodedMessage={decodedMessage} />;
        })}
      </div>
    </div>
  );
}

export default App;
