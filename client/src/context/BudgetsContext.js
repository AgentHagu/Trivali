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
    const [expenses, setExpenses] = useLocalStorage("expenses", []) // TODO: Remove

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
            setBudgets(newBudgets)
        }

        socket.on("update-budget", handler)

        return () => {
            socket.off("update-budget", handler)
        }
    }, [socket])

    function getBudgetExpenses(budgetId) {
        const budget = budgets.find(budget => budget.id === budgetId)

        if (budget) {
            return budget.expenses
        }

        return []
    }

    function addExpense({ description, amount, budgetId }) {
        const newExpense = {
            description: description,
            amount: amount
        }

        socket.emit("add-new-expense", { budgetId, newExpense })

        // const budget = budgets.find(budget => budget.id === budgetId)
        // budget.expenses.push(newExpense)

        // // setBudgets([...budgets])
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
            expenses: []
        }

        socket.emit("add-new-budget", newBudget)
        // setBudgets([...budgets, newBudget])
    }

    function deleteBudget({ id }) {
        // const budget = budgets.find(budget => budget.id === id)

        // budget.expenses.map(expense => {
        //     addExpense({
        //         description: expense.description,
        //         amount: expense.amount,
        //         budgetId: UNCATEGORIZED_BUDGET_ID
        //     })

        //     deleteExpense(expense)
        // })

        socket.emit("delete-budget", id)
        // setBudgets(prevBudgets => {
        //     return prevBudgets.filter(budget => budget.id !== id)
        // })
    }

    function deleteExpense({ _id }) {
        const budget = budgets.find(budget => budget.expenses.some(expense => expense._id === _id))

        socket.emit("delete-expense", { budgetId: budget.id, expenseId: _id })
        // budget.expenses = budget.expenses.filter(expense => expense._id !== _id)
        // setBudgets([...budgets])
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