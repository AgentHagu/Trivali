import { UNCATEGORIZED_BUDGET_ID, useBudgets } from '../../context/BudgetsContext'
import BudgetCard from "./BudgetCard"

export default function TotalBudgetCard() {
  const { budgets } = useBudgets()
  const amount = budgets.reduce((total, budget) => total + budget.expenses.reduce((total, expense) => total + expense.amount, 0), 0)
  const max = budgets.reduce((total, budget) => {
    if (budget.id !== UNCATEGORIZED_BUDGET_ID) {
      return total + budget.max
    } else {
      return total
    }
  }, 0)

  if (max === 0) return null

  return (
    <BudgetCard amount={amount} name="Total" gray max={max} hideButtons />
  )
}
