import React, { useContext, useEffect, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'
import useLocalStorage from "../hooks/useLocalStorage"
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const BudgetsContext = React.createContext()

export const UNCATEGORIZED_BUDGET_ID = "uncategorized"

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

export const BudgetsProvider = ({ children }) => {
    const { id } = useParams()
    const [socket, setSocket] = useState()
    const [budgets, setBudgets] = useState()

    // Establish socket connection with server
    useEffect(() => {
        const s = io(`${SERVER_URL}`)
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null) return

        socket.once("load-budgets", budgets => {
            setBudgets(budgets)
        })

        socket.emit("get-budgets", id)
    }, [id, socket])

    useEffect(() => {
        if (socket == null) return

        const handler = newBudgets => {
            console.log("NEW BUDGET")
            setBudgets(newBudgets)
        }
        
        socket.on("update-budget", handler)

        return () => {
            socket.off("update-budget", handler)
        }
    }, [socket])

    const [expenses, setExpenses] = useLocalStorage("expenses", [])

    function getBudgetExpenses(budgetId) {
        return expenses.filter(expense => expense.budgetId === budgetId)
    }

    function addExpense({ description, amount, budgetId }) {
        const newExpense = {
            description: description,
            amount: amount
        }

        socket.emit("add-new-expense", {budgetId, newExpense})
        setBudgets([...budgets])
        // budgets.find(budget => budget.id === budgetId)
    }

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
            history: []
        }

        socket.emit("add-new-budget", newBudget)
        setBudgets([...budgets, newBudget])
    }

    function deleteBudget({ id }) {
        setExpenses(prevExpenses => {
            return prevExpenses.map(expense => {
                if (expense.budgetId !== id) return expense
                return { ...expense, budgetId: UNCATEGORIZED_BUDGET_ID }
            })
        })

        setBudgets(prevBudgets => {
            return prevBudgets.filter(budget => budget.id !== id)
        })
    }

    function deleteExpense({ id }) {
        setExpenses(prevExpenses => {
            return prevExpenses.filter(expense => expense.id !== id)
        })
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