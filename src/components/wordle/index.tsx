import {
  type ChangeEventHandler,
  type FC,
  type MutableRefObject,
  useRef,
  useState,
  useMemo,
} from "react";
import "./index.css";

interface IProps {
  attempts: number;
  wordSize: number;
}

const WORD: string = "STAND";

const HINT_CLASS_NAME: Record<number, string> = {
  0: "grey",
  1: "yellow",
  2: "green",
};

const createWordBuckets = (wordSize: number) => () =>
  new Array(wordSize).fill("");

const createSolutionsGrid = (attempts: number, wordSize: number) => () =>
  new Array(attempts).fill(null).map(createWordBuckets(wordSize));

const Root: FC<IProps> = ({ attempts, wordSize }) => {
  const charOccurences = useMemo(
    () =>
      Array.from(WORD).reduce((acc, curr) => {
        if (!acc[curr]) acc[curr] = 0;
        acc[curr]++;
        return acc;
      }, {} as Record<string, number>),
    []
  );

  const [solutions, setSolutions] = useState(
    createSolutionsGrid(attempts, wordSize)
  );
  const [hint, setHint] = useState<number[][]>([]);
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

  const hintCurrentSolution = () => {
    const currentWordArray = solutions[activeAttemptIndex].filter(Boolean);
    const output = currentWordArray;
    const wordLetterOccurences = { ...charOccurences };

    const colorHintArray = output.map((ch, index) => {
      const wordCh = WORD[index];
      if (ch === wordCh) {
        // GREEN
        wordLetterOccurences[ch]--;
        if (!wordLetterOccurences[ch]) delete wordLetterOccurences[ch];
        return 2;
      } else if (ch in wordLetterOccurences) {
        // YELLOW
        wordLetterOccurences[ch]--;
        if (!wordLetterOccurences[ch]) delete wordLetterOccurences[ch];
        return 1;
      } else return 0; // GREY
    });

    setHint((prevState) => {
      const clonedArray = structuredClone(prevState);
      clonedArray[activeAttemptIndex] = colorHintArray;
      return clonedArray;
    });
  };

  const moveToNextRow = () => {
    hintCurrentSolution();
    setActiveAttemptIndex((prevState) => {
      const newActiveIndex = prevState + 1;
      inputRefs.current[newActiveIndex][0]?.focus();
      return newActiveIndex;
    });
  };

  const handleCorrectAnswer = () => {
    console.log("correct answer");
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

        if (isCorrectAnswer) handleCorrectAnswer();

        if (shouldMoveToNextAttempt) moveToNextRow();
      } else if (eve.key === "Backspace") {
        if (currentInputValue.trim() === "") {
          console.log("move to prev", currentInputValue);
          inputRefs.current[activeAttemptIndex][letterIndex - 1]?.focus();
        }
      } else {
        setTimeout(() => {
          inputRefs.current[activeAttemptIndex][letterIndex + 1]?.focus();
        }, 0);
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

  console.log(hint, "hint");

  return (
    <div className="wordle__solutions">
      {solutions.map((solution, solutionIndex) => (
        <div key={solutionIndex} className="wordle__solutions__rows">
          {solution.map((letterInput, letterIndex) => (
            <div key={`${solutionIndex}_${letterIndex}`}>
              <input
                ref={(ref) =>
                  (inputRefs.current[solutionIndex][letterIndex] = ref)
                }
                value={letterInput}
                onChange={handleChangeAttempt(letterIndex)}
                onKeyDown={handleKeyDown(letterIndex)}
                className={HINT_CLASS_NAME[hint[solutionIndex]?.[letterIndex]]}
                // onFocus={handleBlur(letterIndex)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Wordle = Object.assign(Root, {});
