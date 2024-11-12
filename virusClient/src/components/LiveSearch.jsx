import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserImage from './UserImage'

const LiveSearch = ({
    results = [],
    renderItem,
    value,
    onChange,
    onSelect,
}) => {
    const navigate = useNavigate()

    const [focusedIndex, setFocusedIndex] = useState(-1)
    const resultContainer = useRef(null)
    const [showResults, setShowResults] = useState(false)
    const [defaultValue, setDefaultValue] = useState('')

    const handleSelection = (selectedIndex) => {
        /*
        const selectedItem = results[selectedIndex]
        if (!selectedItem) return resetSearchComplete()
        onSelect && onSelect(selectedItem)
        resetSearchComplete()
        */
        const selectedItem = results[selectedIndex];  // Get the selected item based on index
        if (selectedItem) {
            navigate(`/profile/${selectedItem.id}`);
            window.location.reload(true);
        }
    }

    const resetSearchComplete = useCallback(() => {
        setFocusedIndex(-1)
        setShowResults(false)
    }, [])

    const handleKeyDown = (e) => {
        const { key } = e
        let nextIndexCount = 0

        // move down
        if (key === 'ArrowDown')
            nextIndexCount = (focusedIndex + 1) % results.length

        // move up
        if (key === 'ArrowUp')
            nextIndexCount =
                (focusedIndex + results.length - 1) % results.length

        // hide search results
        if (key === 'Escape') {
            resetSearchComplete()
        }

        // select the current item
        if (key === 'Enter') {
            e.preventDefault()
            handleSelection(focusedIndex)
        }

        setFocusedIndex(nextIndexCount)
    }

    const handleChange = (e) => {
        setDefaultValue(e.target.value)
        onChange && onChange(e)
    }

    useEffect(() => {
        if (!resultContainer.current) return

        resultContainer.current.scrollIntoView({
            block: 'center',
        })
    }, [focusedIndex])

    useEffect(() => {
        if (results.length > 0 && !showResults) setShowResults(true)

        if (results.length <= 0) setShowResults(false)
    }, [results])

    useEffect(() => {
        if (value) setDefaultValue(value)
    }, [value])

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
                    style={{
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        backgroundColor: 'transparent',
                        color: 'grey',
                        width: '100px',
                    }}
                    placeholder="Search ..."
                />

                {/* Search Results Container */}
                {showResults && (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: '9999',
                        }}
                    >
                        {results.map((item, index) => (
                            <div
                                key={index}
                                onMouseDown={() => {
                                    navigate(`/profile/${item.id}`);
                                    window.location.reload(true);
                                }}
                                ref={index === focusedIndex ? resultContainer : null}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '12px',
                                    padding: '15px 20px',
                                    fontSize: '17px',
                                    color: 'rgba(50,50,150,1)',
                                    backgroundColor: index === focusedIndex
                                        ? 'rgba(240,240,240,1)'
                                        : 'rgba(255,255,255,1)',
                                    boxShadow: index === focusedIndex
                                        ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    transition: 'background-color 0.3s, box-shadow 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                }}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <UserImage
                                    image={item.image_path}
                                    size={'40px'}
                                />
                                <span style={{ fontWeight: index === focusedIndex ? 'bold' : 'normal' }}>
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LiveSearch
