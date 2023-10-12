import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [labels, setLabels] = useState<string[]>();

  async function updateLabels() {
    const labels = (await window.gmail.getLabels()) ?? [];
    setLabels(labels);
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="underline">email client</h1>
      <button
        className="px-2 py-3 bg-gray-200 rounded-lg"
        onClick={() => setCount((count) => count + 1)}
      >
        count is {count}
      </button>
      <div>
        <button className="px-2 py-3 bg-gray-200 rounded-lg" onClick={updateLabels}>
          get labels
        </button>
        {labels?.map((label, i) => <div key={i}>{label}</div>)}
      </div>
    </div>
  );
}

export default App;
