import { gmail_v1 } from "googleapis";
import { useEffect, useState } from "react";

import { LabelList } from "./components/label-list";
import { ThreadList } from "./components/thread-list";

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
  }

  async function updateThread(threadId: string) {
    const thread = (await window.gmail.getThread(threadId)) ?? null;
    setThread(thread);
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-lg underline">email client</h1>
      <div className="flex gap-2">
        <LabelList labels={labels} onLabelClick={updateThreads} />
        <ThreadList threads={threads} onThreadClick={updateThread} />
        <div>{thread?.messages?.length}</div>
      </div>
    </div>
  );
}

export default App;
