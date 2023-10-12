import { gmail_v1 } from "googleapis";
import { useEffect, useState } from "react";

import { LabelList } from "./components/label-list";
import { ThreadList } from "./components/thread-list";

function App() {
  const [labels, setLabels] = useState<gmail_v1.Schema$Label[] | null>(null);
  const [threads, setThreads] = useState<gmail_v1.Schema$Thread[] | null>(null);

  useEffect(() => {
    let canceled = false;
    async function loadLabels() {
      const labels = (await window.gmail.getLabels()) ?? [];
      if (!canceled) {
        setLabels(labels);
      }
    }
    loadLabels();
    return () => {
      canceled = true;
    };
  }, []);

  async function onLabelClick(label: string) {
    const threads = (await window.gmail.getThreads([label])) ?? [];
    setThreads(threads);
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-lg underline">email client</h1>
      <div className="flex gap-2">
        <LabelList labels={labels} onLabelClick={onLabelClick} />
        <ThreadList threads={threads} />
      </div>
    </div>
  );
}

export default App;
