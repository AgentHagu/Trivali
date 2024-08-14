import { useState, useEffect } from "react"

/**
 * Custom hook to manage state in localStorage.
 * 
 * @param {string} key - The key under which to store the value in localStorage.
 * @param {any} defaultValue - The initial value or function to compute the initial value if key is not present.
 * @returns {[any, Function]} A tuple with the current value and a function to update it.
 */
export default function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        const jsonValue = localStorage.getItem(key)
        if (jsonValue != null) {
            return JSON.parse(jsonValue)
        }

        if (typeof defaultValue === "function") {
            return defaultValue()
        } else {
            return defaultValue
        }
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}