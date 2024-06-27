import { Stack, Modal, Button } from 'react-bootstrap';
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from './BudgetsContext';
import { currencyFormatter } from "./../utils"

/**
 * Component to display and manage expenses within a modal.
 * 
 * @param {object} props - Component props.
 * @param {string} props.budgetId - ID of the budget to view expenses for.
 * @param {function} props.handleClose - Function to handle modal close event.
 * @returns {JSX.Element} Modal component displaying expenses for the specified budget.
 */
export default function ViewExpensesModal({ budgetId, handleClose }) {
    const { getBudgetExpenses, budgets, deleteBudget, deleteExpense } = useBudgets();

    // Retrieve expenses for the specified budget
    const expenses = getBudgetExpenses(budgetId)

    // Find the budget object based on budgetId
    const budget = UNCATEGORIZED_BUDGET_ID === budgetId
        ? {name: "Uncategorized ", id: UNCATEGORIZED_BUDGET_ID} 
        : budgets.find(b => b.id === budgetId)

    return (
        <Modal show={budgetId != null} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Stack direction="horizontal" gap="2">
                            <div> Expenses = {budget?.name} </div>
                            {budgetId !== UNCATEGORIZED_BUDGET_ID && (
                                <Button 
                                    onClick={() => {
                                    deleteBudget(budget)
                                    handleClose()
                                    }}
                                    variant="outline-danger">
                                        Delete
                                </Button>
                            )}
                        </Stack>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Stack direction="vertical" gap="3">
                        {expenses.map(expense => (
                            <Stack direction='horizontal' gap="2" key={expense._id}>
                                <div className='me-auto fs-4'>{expense.description}</div>
                                <div className='fs-5'>{currencyFormatter.format(expense.amount)}</div>
                                <Button onClick={() => deleteExpense(expense)}
                                        size = "sm" 
                                        variant="outline-danger">
                                    &times;
                                </Button>
                            </Stack>
                        
                        ))}
                    </Stack>
                </Modal.Body>
        </Modal>
    );
}
