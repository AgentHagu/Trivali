import { Card, ProgressBar, Button, Stack } from "react-bootstrap"
import { currencyFormatter } from "../../utils"

/**
 * Function to determine the variant of the progress bar based on the ratio of amount to max.
 * 
 * @param {number} amount - The current amount spent in the budget.
 * @param {number} max - The maximum budget limit.
 * @returns {string} Variant name for ProgressBar component ("primary", "warning", or "danger").
 */
function getProgressBarVariant(amount, max) {
    const ratio = amount / max
    if (ratio < .5) return "primary"
    if (ratio < .75) return "warning "
    return "danger"
}

/**
 * Component for displaying a budget card with progress bar and action buttons.
 * 
 * @param {string} name - The name or title of the budget.
 * @param {number} amount - The current amount spent in the budget.
 * @param {number} max - The maximum budget limit.
 * @param {boolean} gray - Whether to display the card in gray background.
 * @param {boolean} hideButtons - Whether to hide action buttons.
 * @param {function} onAddExpenseClick - Callback function to handle adding an expense.
 * @param {function} onViewExpensesClick - Callback function to handle viewing expenses.
 * @returns {JSX.Element} BudgetCard component displaying budget details, progress bar, and action buttons.
 */
export default function BudgetCard({ name, amount, max, gray, hideButtons, onAddExpenseClick, onViewExpensesClick }) {
    const classNames = []
    if (amount > max) {
        classNames.push("bg-danger", "bg-opacity-10")
    } else if (gray) {
        classNames.push("bg-light")
    }

    const isChrome = navigator.userAgent.toLowerCase().includes('chrome')

    return (
        <Card className={classNames.join(" ")}>
            <Card.Body>
                <Card.Title className="d-flex justify-content-between
                align-items-baseline fw-normal mb-5">
                    <div className="me-2">{name}</div>
                    <div className="d-flex align-itmes-baseline">
                        {isChrome
                            ? "$" + currencyFormatter.format(amount).match(/\d+/)[0]
                            : currencyFormatter.format(amount)}
                        {name === "Uncategorized" && "SGD"}

                        {max && (
                            <span className="text-muted fs-6 ms-1">
                                / {isChrome
                                    ? "$" + currencyFormatter.format(amount).match(/\d+/)[0]
                                    : currencyFormatter.format(amount)} SGD
                            </span>
                        )}
                    </div>
                </Card.Title>
                {max && (<ProgressBar
                    className="rounded-pill"
                    variant={getProgressBarVariant(amount, max)}
                    min={0}
                    max={max}
                    now={amount}
                />)}
                {!hideButtons && (<Stack direction="horizontal" gap="2" className="mt-4">
                    <Button
                        variant="outline-primary ms-auto"
                        className="ms-auto"
                        onClick={onAddExpenseClick}
                    >Add Expense
                    </Button>
                    <Button onClick={onViewExpensesClick} variant="outline-secondary">View Expense</Button>
                </Stack>
                )}
            </Card.Body>
        </Card>
    )
}
