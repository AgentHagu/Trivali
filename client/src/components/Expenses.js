import Container from "react-bootstrap/Container"
import { Button, Stack } from "react-bootstrap"
import React from 'react';
import BudgetCard from "./BudgetCard/BudgetCard";
import UncategorizedBudgetCard from "./BudgetCard/UncategorizedBudgetCard";
import TotalBudgetCard from "./BudgetCard/TotalBudgetCard"
import ViewExpensesModal from "../context/ViewExpensesModal"
import AddBudgetModal from "../context/AddBudget"
import AddExpenseModal from "../context/AddExpense"
import { useState } from 'react'
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from "../context/BudgetsContext";

/**
 * Expenses component to manage budgets and expenses display.
 * 
 * @returns {JSX.Element} Expenses component with budget cards and modals.
 */
export default function Expenses() {
    const [showAddBudgetModal, setShowAddBudgetModal] = useState(false)
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
    const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState()
    const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState()
    const { budgets, getBudgetExpenses } = useBudgets()

    /**
     * Opens the add expense modal for a specific budget.
     * 
     * @param {string} budgetId - ID of the budget to add an expense to.
     */
    function openAddExpenseModal(budgetId) {
        setShowAddExpenseModal(true)
        setAddExpenseModalBudgetId(budgetId)
    }

    return (
        <>
            <Container className="mt-2 mb-3">
                <Stack direction='horizontal' gap="2" className="mb-2">
                    <h1 className="me-auto">Budgets</h1>
                    <Button variant="primary fs-5" onClick={() => setShowAddBudgetModal(true)}>
                        Add Budget
                    </Button>

                    <Button variant="outline-primary fs-5" onClick={openAddExpenseModal}>
                        Add Expense
                    </Button>
                </Stack>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                        alignItems: "flex-start",
                    }}
                >
                    {budgets.map(budget => {
                        const amount = getBudgetExpenses(budget.id).reduce((total, expense) => total + expense.amount, 0)
                        if (budget.id === UNCATEGORIZED_BUDGET_ID) {
                            return null
                        }

                        return (
                            <BudgetCard
                                key={budget.id}
                                name={budget.name}
                                amount={amount}
                                max={budget.max}
                                onAddExpenseClick={() => openAddExpenseModal(budget.id)}
                                onViewExpensesClick={() => setViewExpensesModalBudgetId(budget.id)}
                            />
                        )
                    })}
                    <UncategorizedBudgetCard onAddExpenseClick={openAddExpenseModal}
                        onViewExpensesClick={() => setViewExpensesModalBudgetId(UNCATEGORIZED_BUDGET_ID)} />
                    <TotalBudgetCard />
                </div>
            </Container>

            <AddBudgetModal
                show={showAddBudgetModal}
                handleClose={() => setShowAddBudgetModal(false)}
            />

            <AddExpenseModal
                show={showAddExpenseModal}
                defaultBudgetId={addExpenseModalBudgetId}
                handleClose={() => setShowAddExpenseModal(false)}
            />

            <ViewExpensesModal
                budgetId={viewExpensesModalBudgetId}
                handleClose={() => setViewExpensesModalBudgetId()}
            />
        </>
    )
}