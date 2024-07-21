import React from 'react';

export default function useCounter(initialValue: number = 0): [number, React.Dispatch<React.SetStateAction<void>>] {
  const [counterValue, setCounterValue] = React.useState(initialValue);

  const incrementer = React.useCallback(() => {
    setCounterValue(old => old + 1);
  }, [setCounterValue]);

  return [counterValue, incrementer];
}

