import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LiveSearch = ({
  results = [],
  renderItem,
  value,
  onChange,
  onSelect,
}) => {
  const navigate = useNavigate();

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultContainer = useRef(null);
  const [showResults, setShowResults] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");

  const handleSelection = (selectedIndex) => {
    const selectedItem = results[selectedIndex];
    if (!selectedItem) return resetSearchComplete();
    onSelect && onSelect(selectedItem);
    resetSearchComplete();
  };

  const resetSearchComplete = useCallback(() => {
    setFocusedIndex(-1);
    setShowResults(false);
  }, []);

  const handleKeyDown = (e) => {
    const { key } = e;
    let nextIndexCount = 0;

    // move down
    if (key === "ArrowDown")
      nextIndexCount = (focusedIndex + 1) % results.length;

    // move up
    if (key === "ArrowUp")
      nextIndexCount = (focusedIndex + results.length - 1) % results.length;

    // hide search results
    if (key === "Escape") {
      resetSearchComplete();
    }

    // select the current item
    if (key === "Enter") {
      e.preventDefault();
      handleSelection(focusedIndex);
    }

    setFocusedIndex(nextIndexCount);
  };

  const handleChange = (e) => {
    setDefaultValue(e.target.value);
    onChange && onChange(e);
  };

  useEffect(() => {
    if (!resultContainer.current) return;

    resultContainer.current.scrollIntoView({
      block: "center",
    });
  }, [focusedIndex]);

  useEffect(() => {
    if (results.length > 0 && !showResults) setShowResults(true);

    if (results.length <= 0) setShowResults(false);
  }, [results]);

  useEffect(() => {
    if (value) setDefaultValue(value);
  }, [value]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div
        tabIndex={1}
        onBlur={resetSearchComplete}
        onKeyDown={handleKeyDown}
        className="relative"
      >
        <input
          value={defaultValue}
          onChange={handleChange}
          type="text"
          style={{ border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent' }}
          placeholder="Search your query..."
        />

        {/* Search Results Container */}
        {showResults && (
          <div style={{
            position: "absolute",
            zIndex: '9999',
          }}>
            {results.map((item, index) => (
                <div
                  key={index}
                  onMouseDown={() => {
                      navigate(`/profile/${item.id}`);
                      window.location.reload(true);
                  }}
                  ref={index === focusedIndex ? resultContainer : null}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '16px',
                    color: 'rgba(100,100,200,1)',
                    backgroundColor: index === focusedIndex ? "rgba(180,180,180,1)" : "rgba(225,225,225,1)",
                }}
                className="cursor-pointer hover:bg-gray-200"
                            >
                  {item.name}
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearch;
