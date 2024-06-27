import React, { useContext, useEffect, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'
import useLocalStorage from "../hooks/useLocalStorage"
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const BudgetsContext = React.createContext()

export const UNCATEGORIZED_BUDGET_ID = "uncategorized"

/**
 * Custom hook to consume the BudgetsContext.
 * 
 * @returns {object} Budgets context object with budgets and budget management functions.
 */
export function useBudgets() {
    return useContext(BudgetsContext)
}

// { // budget
//     id:
//     name: 
//     max
// }
// {
//     id:
//     budgetID:
//     amount:
//     description:
// }
const SERVER_URL = process.env.REACT_APP_API_URL;


/**
 * Provider component for managing budgets and expenses within a socket.io connection.
 * 
 * @param {object} props - Component props.
 * @param {ReactNode} props.children - Child components to be wrapped by the provider.
 * @returns {JSX.Element} Provider component for budgets and expenses management.
 */
export const BudgetsProvider = ({ children }) => {
    const { id } = useParams()
    const [socket, setSocket] = useState()
    const [budgets, setBudgets] = useState()
    const [expenses, setExpenses] = useLocalStorage("expenses", []) // TODO: Remove

    // Establish socket connection with server
    useEffect(() => {
        const s = io(`${SERVER_URL}`)
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    // Load budgets from server on component mount
    useEffect(() => {
        if (socket == null) return

        socket.once("load-budgets", budgets => {
            setBudgets(budgets)
        })

        socket.emit("get-budgets", id)
    }, [id, socket])

    // Handle updates to budgets received from server
    useEffect(() => {
        if (socket == null) return

        const handler = newBudgets => {
            setBudgets(newBudgets)
        }

        socket.on("update-budget", handler)

        return () => {
            socket.off("update-budget", handler)
        }
    }, [socket])

    /**
     * Retrieves expenses for a specific budget.
     * 
     * @param {string} budgetId - ID of the budget to retrieve expenses for.
     * @returns {Array} Array of expenses for the specified budget.
     */
    function getBudgetExpenses(budgetId) {
        const budget = budgets.find(budget => budget.id === budgetId)

        if (budget) {
            return budget.expenses
        }

        return []
    }

    /**
     * Adds a new expense to the specified budget via socket.io.
     * 
     * @param {object} expenseData - Data object containing description, amount, and budgetId of the new expense.
     */
    function addExpense({ description, amount, budgetId }) {
        const newExpense = {
            description: description,
            amount: amount
        }

        socket.emit("add-new-expense", { budgetId, newExpense })
    }

    /**
     * Adds a new budget to the application via socket.io.
     * 
     * @param {object} budgetData - Data object containing name and max spending of the new budget.
     */
    function addBudget({ name, max }) {
        //TODO: add toast to say "Budget with the same name already exists!"
        if (budgets.find(budget => budget.name === name)) {
            return budgets
        }

        const newBudget = {
            id: uuidV4(),
            name: name,
            max: max,
            currAmount: 0,
            expenses: []
        }

        socket.emit("add-new-budget", newBudget)
    }

    /**
     * Deletes a budget from the application via socket.io.
     * 
     * @param {object} budgetData - Data object containing the ID of the budget to delete.
     */
    function deleteBudget({ id }) {
        socket.emit("delete-budget", id)
    }

    /**
     * Deletes an expense from the specified budget via socket.io.
     * 
     * @param {string} expenseId - ID of the expense to delete.
     */
    function deleteExpense({ _id }) {
        const budget = budgets.find(budget => budget.expenses.some(expense => expense._id === _id))

        socket.emit("delete-expense", { budgetId: budget.id, expenseId: _id })
    }

    return (
        <BudgetsContext.Provider value={{
            budgets,
            expenses,
            getBudgetExpenses,
            addExpense,
            addBudget,
            deleteBudget,
            deleteExpense
        }}>
            {children}
        </BudgetsContext.Provider>
    )
}