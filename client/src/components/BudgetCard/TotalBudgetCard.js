import { UNCATEGORIZED_BUDGET_ID, useBudgets } from '../../context/BudgetsContext'
import BudgetCard from "./BudgetCard"

/**
 * Component to display the total budget information.
 * Calculates the total amount spent across all budgets (excluding uncategorized),
 * and the maximum budget limit across all budgets.
 * 
 * @returns {JSX.Element|null} TotalBudgetCard component displaying total budget details,
 * or null if maximum budget limit is zero.
 */
export default function TotalBudgetCard() {
  const { budgets } = useBudgets()

  // Calculate total amount spent across all budgets (excluding uncategorized)
  const amount = budgets.reduce((total, budget) => total + budget.expenses.reduce((total, expense) => total + expense.amount, 0), 0)

  // Calculate total maximum budget limit across all budgets (excluding uncategorized)
  const max = budgets.reduce((total, budget) => {
    if (budget.id !== UNCATEGORIZED_BUDGET_ID) {
      return total + budget.max
    } else {
      return total
    }
  }, 0)

  // If maximum budget limit is zero, do not render the component
  if (max === 0) return null

  return (
    <BudgetCard amount={amount} name="Total" gray max={max} hideButtons />
  )
}
