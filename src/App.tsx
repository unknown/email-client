import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [labels, setLabels] = useState<string[]>([]);

  async function updateLabels() {
    const labels = (await window.gmail.getLabels()) ?? [];
    setLabels(labels);
  }

  return (
    <div>
      <h1>Electron + Vite + React</h1>
      <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      <div>
        <button onClick={updateLabels}>get labels</button>
        {labels.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
