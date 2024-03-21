/** @jsx Didact.createElement */
import Didact from "../ownReact";
import Hello from "./hello";

function Counter() {
  const [state, setState] = Didact.useState(0);

  console.log("---> in counter:", state);

  return (
    <div>
      <h1 onClick={() => setState(c => c + 1)}>
        Count: {state}
      </h1>
      <a href="#/home">Go to Home</a>
      <br />
      <br />
      <br />

      {state > 4 ? <Hello/> : "bye"}
    </div>
  );
}

export default Counter;