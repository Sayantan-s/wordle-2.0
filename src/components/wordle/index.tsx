import {
  type ChangeEventHandler,
  type FC,
  type MutableRefObject,
  useRef,
  useState,
} from "react";
import "./index.css";

interface IProps {
  attempts: number;
  wordSize: number;
}

const WORD: string = "STAND";

const createWordBuckets = (wordSize: number) => () =>
  new Array(wordSize).fill("");

const createSolutionsGrid = (attempts: number, wordSize: number) => () =>
  new Array(attempts).fill(null).map(createWordBuckets(wordSize));

const Root: FC<IProps> = ({ attempts, wordSize }) => {
  const [solutions, setSolutions] = useState(
    createSolutionsGrid(attempts, wordSize)
  );
  const [activeAttemptIndex, setActiveAttemptIndex] = useState(0);
  const inputRefs = useRef(
    createSolutionsGrid(attempts, wordSize)()
  ) as MutableRefObject<(HTMLInputElement | null)[][]>;

  const handleChangeAttempt =
    (letterIndex: number): ChangeEventHandler<HTMLInputElement> =>
    (eve) => {
      const { value } = eve.target;
      if (!isNaN(Number(value))) return;
      setSolutions((prevState) => {
        const clonedSolution = structuredClone(prevState);
        clonedSolution[activeAttemptIndex][letterIndex] = value;
        return clonedSolution;
      });
    };

  const handleKeyDown =
    (letterIndex: number): React.KeyboardEventHandler<HTMLInputElement> =>
    (eve) => {
      const currentInputValue = solutions[activeAttemptIndex][letterIndex];
      console.log(currentInputValue, "currentInputValue");
      if (currentInputValue.trim() !== "") {
        if (eve.key === "Enter") {
          console.log("move to next");
        }
      }
    };

  return (
    <div className="wordle__solutions">
      {solutions.map((solution, solutionIndex) => (
        <div key={solutionIndex} className="wordle__solutions__rows">
          {solution.map((letterInput, letterIndex) => (
            <input
              ref={(ref) =>
                (inputRefs.current[solutionIndex][letterIndex] = ref)
              }
              value={letterInput}
              key={`${solutionIndex}_${letterIndex}`}
              onChange={handleChangeAttempt(letterIndex)}
              onKeyDown={handleKeyDown(letterIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const Wordle = Object.assign(Root, {});
