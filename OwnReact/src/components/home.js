/** @jsx Didact.createElement */
import Didact from "../ownReact";

function Counter() {
  const [state, setState] = Didact.useState(1);
  console.log("--> in home:", state);

  return (
    <div>
      <h1 onClick={() => setState(c => c + 1)} style="user-select: none">
        Home: {state}
      </h1>
      <a href="/#">Go to Home</a>
    </div>
  );
}

export default Counter;