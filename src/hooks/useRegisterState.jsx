import React, { useEffect } from "react";
import { useRegisterStateCTX } from "./registerStateCTX";

const useRegisterState = ({ state, stateKey, setterFTN }) => {
  const { setStateInCache } = useRegisterStateCTX();

  useEffect(() => {
    setStateInCache(state, stateKey, setterFTN);
  }, [stateKey, state, setterFTN]);

  return {};
};

export default useRegisterState;
