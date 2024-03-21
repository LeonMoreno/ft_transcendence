/** @jsx Didact.createElement */
import Didact from "../ownReact";

function Counter() {
  const [state, setState] = Didact.useState(0);

  console.log("---> in counter:", state);

  return (
    <div>
      <h1 onClick={() => setState(c => c + 1)}>
        Count: {state}
      </h1>
      <a href="#/home">Go to Home</a>
    </div>
  );
}

export default Counter;