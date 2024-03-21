/** @jsx Didact.createElement */
import Didact from "./ownReact.js";
import Counter from "./components/cout.js";

// function Counter() {
//   const [state, setState] = Didact.useState(1);
//   return (
//     <h1 onClick={() => setState(c => c + 1)} style="user-select: none">
//       Count: {state}
//     </h1>
//   );
// }

const element = <Counter />;
const container = document.getElementById("root");
Didact.render(element, container);