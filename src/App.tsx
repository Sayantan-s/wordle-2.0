import "./App.css";
import { Wordle } from "./components/wordle";

function App() {
  return <Wordle attempts={6} wordSize={5} />;
}

export default App;
