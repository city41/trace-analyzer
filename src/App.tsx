import { useState } from "react";
import { Header } from "./Header";
import { Trace } from "./Trace";
import { parseTrace } from "./parser/parseTrace";

function App() {
  const [trace, setTrace] = useState<Trace | null>(null);

  function handleTraceFileLoaded(rawTrace: string[]) {
    setTrace(parseTrace(rawTrace));
  }

  return (
    <div>
      <Header onTraceFileLoaded={handleTraceFileLoaded} />
      {trace && <Trace trace={trace} />}
    </div>
  );
}

export { App };
