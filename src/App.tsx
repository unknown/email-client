import { gmail_v1 } from "googleapis";
import { useEffect, useState } from "react";

function App() {
  const [labels, setLabels] = useState<gmail_v1.Schema$Label[]>();
  const [threads, setThreads] = useState<gmail_v1.Schema$Thread[]>();

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

  async function onThreadClick(label: string) {
    const threads = (await window.gmail.getThreads([label])) ?? [];
    setThreads(threads);
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-lg underline">email client</h1>
      <div className="flex gap-2">
        <div>
          {labels?.map((label, i) => (
            <div key={i} onClick={() => onThreadClick(label.id ?? "")}>
              {label.id}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {threads === undefined
            ? "Nothing selected"
            : threads?.length == 0
            ? "Empty"
            : threads?.map((thread, i) => (
                <div key={i}>
                  <p className="text-sm text-gray-600">{thread.id}</p>
                  <p>{thread.snippet}</p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default App;
