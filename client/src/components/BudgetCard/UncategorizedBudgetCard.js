import { UNCATEGORIZED_BUDGET_ID, useBudgets } from '../../context/BudgetsContext'
import BudgetCard from "./BudgetCard"

/**
 * Component to display the budget information for uncategorized expenses.
 * Calculates the total amount spent under the uncategorized budget.
 * 
 * @param {Object} props - Additional props to pass to the BudgetCard component.
 * @returns {JSX.Element|null} UncategorizedBudgetCard component displaying uncategorized budget details,
 * or null if there are no expenses under the uncategorized budget.
 */
export default function UncategorizedBudgetCard(props) {
  const { getBudgetExpenses } = useBudgets()

  // Calculate total amount spent under the uncategorized budget
  const amount = getBudgetExpenses(UNCATEGORIZED_BUDGET_ID).reduce((total, expense) => total + expense.amount, 0)

  // If no expenses under uncategorized, do not render the component
  if (amount === 0) return null

  return (
    <BudgetCard amount={amount} name="Uncategorized" gray {...props} />
  )
}
