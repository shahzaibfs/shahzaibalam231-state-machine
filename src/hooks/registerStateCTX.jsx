import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AiFillCaretRight,
  AiOutlineClose,
  AiOutlineRight,
} from "react-icons/ai";
import { VscDebugConsole } from "react-icons/vsc";
import Select from "react-select";

let IS_DEV_ENV = process.env.NODE_ENV === "development";
let TYPES = {
  LOCALSTORAGE: "LOCALSTORAGE",
  STATE: "STATE",
};

function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}
const registerStateCTX = createContext();
export const useRegisterStateCTX = () => useContext(registerStateCTX);

const RegisterStateCTXProvider = ({ children }) => {
  const [cacheHolder, setCacheHolder] = useState([]);
  const [activeKey, setActiveKey] = useState("");

  const setStateInCache = (state, stateKey, setState) => {
    let cacheState_index = cacheHolder.findIndex(
      (ch) => ch.stateKey === stateKey
    );

    setCacheHolder((oldCache) => {
      let type = !state ? TYPES.LOCALSTORAGE : TYPES.STATE;
      if (!state) {
        state = localStorage.getItem(stateKey);
        if (isValidJSON(state)) {
          state = JSON.parse(state);
        }
        // because this one is localsotrage
        setState = (newData) => {
          localStorage.setItem(
            stateKey,
            typeof newData === "object" ? JSON.stringify(newData) : newData
          );
          setCacheHolder((oc) =>
            oc.map((och) => {
              if (och.stateKey === stateKey) {
                och["state"] = newData;
              }
              return och;
            })
          );
        };
      }
      if (cacheState_index >= 0) {
        let cacheCopy = Array.from(oldCache);
        cacheCopy[cacheState_index] = {
          state,
          stateKey,
          setState,
          type: !state ? TYPES.LOCALSTORAGE : TYPES.STATE,
        };
        return cacheCopy;
      }
      return [
        ...oldCache,
        {
          state,
          stateKey,
          setState,
          type,
        },
      ];
    });
  };
  const changeInExistingState = (key, stateKey, newValue, parentRef) => {
    // check and modify the stateObj and return back the obj)
    let obj_ = cacheHolder.find((ch) => ch.stateKey === stateKey);
    if (typeof obj_.state !== "object") {
      obj_?.setState(newValue);
      return;
    }
    let newObj_ = changeAndReturnObj(obj_.state, key, newValue, parentRef);
    if (!obj_?.setState || typeof obj_?.setState !== "function")
      throw Error(
        "Please provide the valid Setter ftn for this key",
        obj_?.stateKey
      );

    obj_?.setState(newObj_);
  };
  return (
    <registerStateCTX.Provider
      value={{
        setStateInCache,
        cacheHolder,
        changeInExistingState,
        setActiveKey,
        activeKey,
      }}
    >
      <>
        {children}
        {IS_DEV_ENV && (
          <>
            <hr className="my-4" />
            <RenderPlugin />
          </>
        )}
      </>
    </registerStateCTX.Provider>
  );
};

export default RegisterStateCTXProvider;

const changeAndReturnObj = (obj, key, newValue, parentRef) => {
  if (!obj || typeof obj !== "object") return undefined;

  const keys = parentRef?.split(":") ?? [];

  let deepObjCOpy = JSON.parse(JSON.stringify(obj));
  // Recursive helper function to traverse the object
  const updateNestedProperty = (currentObj, remainingKeys) => {
    if (remainingKeys.length === 0) {
      // Reached the final level, update the property
      currentObj[key] = newValue;
    } else {
      const currentKey = remainingKeys[0];
      if (
        !currentObj[currentKey] ||
        typeof currentObj[currentKey] !== "object"
      ) {
        // If a nested object doesn't exist, create it
        currentObj[currentKey] = {};
      }
      // Continue recursively for the next level
      updateNestedProperty(currentObj[currentKey], remainingKeys.slice(1));
    }
  };

  // Start the recursive traversal
  updateNestedProperty(deepObjCOpy, keys);

  return deepObjCOpy;
};

const RenderPlugin = () => {
  const { cacheHolder } = useRegisterStateCTX();
  const [popup, setpopup] = useState(true);

  const togglePopup = () => setpopup((old) => !old);
  return (
    <>
      <button
        onClick={togglePopup}
        className="fixed bottom-6 right-6 rounded-md bg-slate-500 px-2 py-1 text-white hover:bg-opacity-80 "
      >
        query
      </button>

      <div
        className={`transition-all bg-slate-700 text-white fixed left-0  w-full resize-y h-[80%] z-[1000] py-2 px-2 ${
          popup ? "bottom-0" : "bottom-[-100%]"
        }`}
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-1">
              <VscDebugConsole />
              State Machine
            </h1>
            <div>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                Test Mode
              </span>
              <span className="bg-pink-100 text-pink-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300">
                Relase: Not Stable
              </span>
            </div>
          </div>
          <button
            onClick={togglePopup}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-1 border border-gray-400 rounded shadow"
          >
            <AiOutlineClose />
          </button>
        </div>
        <section className="grid grid-cols-2 gap-2 mt-3">
          <Sidebar />
          <DataDisplay />
        </section>
      </div>
    </>
  );
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    marginBottom: "0.75rem",
    padding: "0",
    borderRadius: "0.375rem",
    backgroundColor: "#1E293B",
    border: "0",
    outline: "none",
    boxShadow: "none",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    backgroundColor: "#4B5563",
    borderRadius: 0,
    color: "white",
    fontSize: 10,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    backgroundColor: "#4B5563",
    ":hover": {
      backgroundColor: "#FFA5A5",
    },
    borderRadius: 0,
  }),
  option: (provided) => ({
    ...provided,
    color: "black",
    fontSize: 12,
    padding: "0.2rem 0.5rem",
  }),
};

const Sidebar = () => {
  const { cacheHolder, setActiveKey } = useRegisterStateCTX();
  const [filter, setFilter] = useState({
    keyword: "",
    tags: [TYPES.LOCALSTORAGE, TYPES.STATE],
  });

  const filteredData = cacheHolder.filter((item) => {
    // Check if the item's name includes the keyword
    const matchesKeyword = item.stateKey
      .toLowerCase()
      .includes(filter.keyword.toLowerCase());

    const matchesTags = filter.tags.includes(item.type);

    return matchesKeyword && matchesTags;
  });

  const handleFilterKeywordChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
    return;
  };
  const handleFilterTagChange = (data) => {
    setFilter({
      ...filter,
      tags: data?.map((d) => d?.value),
    });
    return;
  };

  return (
    <div className="bg-slate-800 rounded-md min-h-screen px-2 py-3">
      <div className="flex gap-1">
        <input
        placeholder="search stateKey ..."
          name="keyword"
          type="text"
          className="mb-3 px-2 rounded-md bg-slate-700 focus:border-0 focus:outline-none"
          onChange={handleFilterKeywordChange}
        />
        <Select
          options={Object.keys(TYPES).map((t) => ({
            label: TYPES?.[t],
            value: t,
          }))}
          isMulti
          defaultValue={filter.tags.map((t) => ({
            label: TYPES?.[t],
            value: t,
          }))}
          onChange={handleFilterTagChange}
          placeholder="Select Tags"
          styles={customStyles} // Apply custom styles
        />
      </div>
      {filteredData.map((ch) => {
        return (
          <button
            key={ch?.stateKey}
            onClick={() => setActiveKey(ch?.stateKey)}
            type="button"
            className="w-full items-center  py-3 px-2 mb-1 flex text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            {ch?.stateKey}
            <AiFillCaretRight />
            {ch?.type === TYPES.LOCALSTORAGE && (
              <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2 py-0.5  rounded dark:bg-green-900 dark:text-green-300">
                LocalStorage
              </span>
            )}
          </button>
        );
      })}

      {filteredData.length <= 0 && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 mr-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">No Data! </span>
              Please Add Data or if you already added it then please select tags and search keyword. Thanks!
            </div>
          </div>
      )}
    </div>
  );
};

const DataDisplay = () => {
  const { cacheHolder, activeKey } = useRegisterStateCTX();

  let cacheHolder_filtered = cacheHolder.find(
    (ch) => ch.stateKey === activeKey
  );

  if (!cacheHolder_filtered) {
    return (
      <div className="bg-slate-800 rounded-md min-h-screen">
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 mr-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">No Data! </span>
            Please choose some data from left side
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-slate-800 rounded-md min-h-screen py-3 px-2">
      <div
        key={cacheHolder_filtered?.stateKey}
        className="border  border-slate-700 p-2  rounded-md"
      >
        <p>
          Key:
          <span className="bg-yellow-100 ml-1 text-yellow-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
            {cacheHolder_filtered?.stateKey}
          </span>
        </p>
        <p>State:</p>
        <RenderObjectProperties
          state={cacheHolder_filtered.state}
          stateKey={cacheHolder_filtered.stateKey}
        />
      </div>
    </div>
  );
};

const cssClasses = {
  property: {
    marginLeft: "12px",
  },
  caret: {
    cursor: "pointer",
  },
  editable: {
    color: "black",
  },
  grayText: {
    color: "gray",
  },
};

const RenderObjectProperties = ({ state, level = 0, stateKey, parent }) => {
  const [editableKeys, setEditableKeys] = useState([]);
  const { changeInExistingState } = useRegisterStateCTX();
  const [focusKey, setFocusKey] = useState("");

  useEffect(() => {
    let elem = document.getElementsByName(parent + ":" + focusKey);
    if (!elem.length) return;
    elem?.[0].focus();
  }, [focusKey]);

  const handleEditToggle = (key, target) => {
    setEditableKeys((oldKeys) =>
      oldKeys.includes(key)
        ? oldKeys.filter((k) => k !== key)
        : [...oldKeys, key]
    );
    setFocusKey(key);
  };

  const handleChange = (key, value) => {
    setEditableKeys((oldKeys) => oldKeys.filter((k) => k !== key));
    changeInExistingState(key, stateKey, value, parent);
    setFocusKey("");
  };

  return (
    <>
      {typeof state === "object" ? (
        Object.keys(state).map((key) => (
          <React.Fragment key={key}>
            {typeof state[key] === "object" ? (
              <>
                <div
                  className={`flex items-center`}
                  style={{ ...cssClasses.property, marginLeft: level * 12 }}
                  onClick={() => handleEditToggle(key)}
                >
                  <AiFillCaretRight
                    className={`${editableKeys.includes(key) && "-rotate-90"}`}
                    style={cssClasses.caret}
                  />
                  <span style={cssClasses.grayText}>{key}</span>
                </div>
                {editableKeys.includes(key) && (
                  <RenderObjectProperties
                    state={state[key]}
                    level={level + 1}
                    stateKey={stateKey}
                    parent={level === 0 ? key : parent + ":" + key}
                  />
                )}
              </>
            ) : (
              <p style={{ ...cssClasses.property, marginLeft: level * 12 }}>
                <span style={cssClasses.grayText} className="me-2">
                  {key}:
                </span>
                {!editableKeys.includes(key) ? (
                  <span onDoubleClick={() => handleEditToggle(key)}>
                    {state[key]}
                  </span>
                ) : (
                  <input
                    name={parent + ":" + key}
                    type="text"
                    defaultValue={state[key]}
                    className="px-1 bg-slate-700 focus:border-0 focus:outline-none"
                    onBlur={(e) => handleChange(key, e.target.value)}
                  />
                )}
              </p>
            )}
          </React.Fragment>
        ))
      ) : (
        <p style={{ ...cssClasses.property, marginLeft: level * 12 }}>
          <span style={cssClasses.grayText} className="me-2">
            key:
          </span>
          {!editableKeys.includes(state) ? (
            <span onDoubleClick={() => handleEditToggle(state)}>{state}</span>
          ) : (
            <input
              name={parent + ":" + state}
              type="text"
              defaultValue={state}
              className="px-1  bg-slate-700 focus:border-0 focus:outline-none"
              onBlur={(e) => handleChange(state, e.target.value)}
            />
          )}
        </p>
      )}
    </>
  );
};
