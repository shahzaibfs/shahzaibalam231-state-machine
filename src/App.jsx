import { useEffect, useState } from "react";
import "./App.css";
import { useRegisterState } from "@shahzaibalam231/state-machine";

function App() {
  const [simpleState, setSimpleState] = useState("Shahzaib Alam");
  const [hardState, setHardState] = useState({
    name:"akram",
    company: {
      name: "shahzaib company's",
      projects: ["hello", "hi"],
      testing: [{ name: "akram" }],
      project1: {
        createdAt: {
          date: "08/12/1222",
        },
      },
    },
  });

  useEffect(() => {
    localStorage.setItem(
      "test-local",
      "testing the Local storage work will be fine "
    );
    localStorage.setItem(
      "obj-test-local",
      JSON.stringify({
        name: "shahzaib",
        projects: ["sup"],
        nested: {
          nest: {
            check: 1,
          },
        },
      })
    );
  }, []);

  useRegisterState({
    state: simpleState,
    stateKey: "simple",
    setterFTN: setSimpleState,
  });
  useRegisterState({
    state: hardState,
    stateKey: "hard",
    setterFTN: setHardState,
  });
  useRegisterState({
    stateKey: "test-local",
  });
  useRegisterState({
    stateKey: "obj-test-local",
  });

  return (
    <>
      Test Plugin
      <br />
      <pre>{JSON.stringify(simpleState, undefined, 4)}</pre>
      <br />
      <pre>{JSON.stringify(hardState, undefined, 4)}</pre>
    </>
  );
}

export default App;
