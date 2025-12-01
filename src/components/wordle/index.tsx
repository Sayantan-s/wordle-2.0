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
      // if (!isNaN(Number(value))) return;
      setSolutions((prevState) => {
        const clonedSolution = structuredClone(prevState);
        clonedSolution[activeAttemptIndex][letterIndex] = value
          .slice(-1)
          .toUpperCase();
        return clonedSolution;
      });
    };

  const handleKeyDown =
    (letterIndex: number): React.KeyboardEventHandler<HTMLInputElement> =>
    (eve) => {
      if (eve.key === "Tab") {
        eve.preventDefault();
        inputRefs.current[activeAttemptIndex][letterIndex]?.focus();
        console.log("stop from moving to right");
      }
      const currentInputValue = solutions[activeAttemptIndex][letterIndex];
      if (eve.key === "Enter") {
        const currentWordArray = solutions[activeAttemptIndex].filter(Boolean);
        const output = currentWordArray.join("");
        const isCorrectAnswer = output === WORD;
        const shouldMoveToNextAttempt =
          output.length === wordSize && !isCorrectAnswer;

        if (isCorrectAnswer) {
          console.log("you did it");
        }

        if (shouldMoveToNextAttempt) {
          setActiveAttemptIndex((prevState) => {
            const newActiveIndex = prevState + 1;
            inputRefs.current[newActiveIndex][0]?.focus();
            return newActiveIndex;
          });
        }
      } else if (eve.key === "Backspace") {
        if (currentInputValue.trim() === "") {
          console.log("move to prev", currentInputValue);
          inputRefs.current[activeAttemptIndex][letterIndex - 1]?.focus();
        }
      } else {
        setTimeout(
          () => inputRefs.current[activeAttemptIndex][letterIndex + 1]?.focus(),
          0
        );
      }
    };

  // const handleBlur =
  //   (letterIndex: number): React.FocusEventHandler<HTMLInputElement> =>
  //   () => {
  //     const currentWordArray = solutions[activeAttemptIndex].filter(Boolean);
  //     const shouldFocusOnWordIndex = currentWordArray.length;
  //     console.log(shouldFocusOnWordIndex);
  //     inputRefs.current[activeAttemptIndex][shouldFocusOnWordIndex]?.focus();
  //   };

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
              // onFocus={handleBlur(letterIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const Wordle = Object.assign(Root, {});
