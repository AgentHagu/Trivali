import Container from "react-bootstrap/Container";
import { Button, Form, FormSelect, OverlayTrigger, Stack, Tooltip } from "react-bootstrap";
import React, { useState } from 'react';
import BudgetCard from "./BudgetCard/BudgetCard";
import UncategorizedBudgetCard from "./BudgetCard/UncategorizedBudgetCard";
import TotalBudgetCard from "./BudgetCard/TotalBudgetCard";
import ViewExpensesModal from "../context/ViewExpensesModal";
import AddBudgetModal from "../context/AddBudget";
import AddExpenseModal from "../context/AddExpense";
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from "../context/BudgetsContext";
import { useApiKeys } from '../context/ApiKeysContext';
import axios from 'axios';

/**
 * Expenses component to manage budgets and expenses display.
 * 
 * @returns {JSX.Element} Expenses component with budget cards and modals.
 */

export default function Expenses() {
    const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState();
    const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();
    const { budgets, getBudgetExpenses } = useBudgets();
    
    const [sourceCurrency, setSourceCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('SGD');
    const [amount, setAmount] = useState(0);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [conversionRate, setConversionRate] = useState(null);
    const { currencyConverterApi } = useApiKeys();

    const currencyApiUrl = `https://api.currencyapi.com/v3/latest?apikey=${currencyConverterApi}`;

    /**
     * Opens the add expense modal for a specific budget.
     * 
     * @param {string} budgetId - ID of the budget to add an expense to.
     */
    function openAddExpenseModal(budgetId) {
        setShowAddExpenseModal(true);
        setAddExpenseModalBudgetId(budgetId);
    }

    const tooltip = (
        <Tooltip id="tooltip" className="text-info">
            <strong>Currency Converter</strong>
        </Tooltip>
    );

    /**
     * Fetches the conversion rate between the selected currencies using the API.
     */
    async function convertCurrency() {
        try {
            const response = await axios.get(currencyApiUrl);
            const rates = response.data.data;

            const usdToSourceRate = rates[sourceCurrency].value;
            const usdToTargetRate = rates[targetCurrency].value;

            // Calculate the conversion rate from the source currency to the target currency
            const rate = usdToTargetRate / usdToSourceRate;

            // Calculate the converted amount
            const converted = amount * rate;

            setConversionRate(rate);
            setConvertedAmount(converted);
        } catch (error) {
            console.error('Error fetching conversion rates:', error);
        }
    }

    return (
        <>
            <OverlayTrigger placement="top" overlay={tooltip}>
                <button
                    className="btn btn-primary position-fixed bottom-0 end-0 mb-5 me-5 d-flex align-items-center justify-content-center"
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "15px",
                        zIndex: 1000
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#currencyConverterModal"
                    title="Currency Converter"
                >
                    <i className="bi bi-currency-exchange"
                        style={{ fontSize: "2.3rem", lineHeight: "1" }}
                    />
                </button>
            </OverlayTrigger>

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
                        const amount = getBudgetExpenses(budget.id).reduce((total, expense) => total + expense.amount, 0);
                        if (budget.id === UNCATEGORIZED_BUDGET_ID) {
                            return null;
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

            {/* Currency Converter Modal */}
            <div className="modal fade" id="currencyConverterModal" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Currency Converter</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">
                            <Form.Group className="mb-3">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>From Currency</Form.Label>
                                <FormSelect
                                    value={sourceCurrency}
                                    onChange={(e) => setSourceCurrency(e.target.value)}
                                >
 <option value="USD">USD - United States Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound Sterling</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="CHF">CHF - Swiss Franc</option>
                            <option value="CNY">CNY - Chinese Yuan</option>
                            <option value="HKD">HKD - Hong Kong Dollar</option>
                            <option value="NZD">NZD - New Zealand Dollar</option>
                            <option value="SEK">SEK - Swedish Krona</option>
                            <option value="KRW">KRW - South Korean Won</option>
                            <option value="SGD">SGD - Singapore Dollar</option>
                            <option value="NOK">NOK - Norwegian Krone</option>
                            <option value="MXN">MXN - Mexican Peso</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="RUB">RUB - Russian Ruble</option>
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="TRY">TRY - Turkish Lira</option>
                            <option value="BRL">BRL - Brazilian Real</option>
                            <option value="TWD">TWD - New Taiwan Dollar</option>
                            <option value="DKK">DKK - Danish Krone</option>
                            <option value="PLN">PLN - Polish Zloty</option>
                            <option value="THB">THB - Thai Baht</option>
                            <option value="IDR">IDR - Indonesian Rupiah</option>
                            <option value="HUF">HUF - Hungarian Forint</option>
                            <option value="CZK">CZK - Czech Koruna</option>
                            <option value="ILS">ILS - Israeli New Shekel</option>
                            <option value="CLP">CLP - Chilean Peso</option>
                            <option value="PHP">PHP - Philippine Peso</option>
                            <option value="AED">AED - United Arab Emirates Dirham</option>
                            <option value="COP">COP - Colombian Peso</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                            <option value="MYR">MYR - Malaysian Ringgit</option>
                            <option value="RON">RON - Romanian Leu</option>
                                </FormSelect>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>To Currency</Form.Label>
                                <FormSelect
                                    value={targetCurrency}
                                    onChange={(e) => setTargetCurrency(e.target.value)}
                                >
                                    <option value="USD">USD - United States Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound Sterling</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="CHF">CHF - Swiss Franc</option>
                            <option value="CNY">CNY - Chinese Yuan</option>
                            <option value="HKD">HKD - Hong Kong Dollar</option>
                            <option value="NZD">NZD - New Zealand Dollar</option>
                            <option value="SEK">SEK - Swedish Krona</option>
                            <option value="KRW">KRW - South Korean Won</option>
                            <option value="SGD">SGD - Singapore Dollar</option>
                            <option value="NOK">NOK - Norwegian Krone</option>
                            <option value="MXN">MXN - Mexican Peso</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="RUB">RUB - Russian Ruble</option>
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="TRY">TRY - Turkish Lira</option>
                            <option value="BRL">BRL - Brazilian Real</option>
                            <option value="TWD">TWD - New Taiwan Dollar</option>
                            <option value="DKK">DKK - Danish Krone</option>
                            <option value="PLN">PLN - Polish Zloty</option>
                            <option value="THB">THB - Thai Baht</option>
                            <option value="IDR">IDR - Indonesian Rupiah</option>
                            <option value="HUF">HUF - Hungarian Forint</option>
                            <option value="CZK">CZK - Czech Koruna</option>
                            <option value="ILS">ILS - Israeli New Shekel</option>
                            <option value="CLP">CLP - Chilean Peso</option>
                            <option value="PHP">PHP - Philippine Peso</option>
                            <option value="AED">AED - United Arab Emirates Dirham</option>
                            <option value="COP">COP - Colombian Peso</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                            <option value="MYR">MYR - Malaysian Ringgit</option>
                            <option value="RON">RON - Romanian Leu</option>
                                </FormSelect>
                            </Form.Group>

                            <Button variant="primary" onClick={convertCurrency}>
                                Convert
                            </Button>

                            {convertedAmount !== null && (
                                    <div className="mt-2">
                                        <p>
                                            Conversion Rate: {conversionRate.toFixed(4)}
                                        </p>
                                        <p>
                                            {amount} {sourceCurrency} <i class="bi bi-arrow-left-right mx-2"></i> {convertedAmount.toFixed(4)} {targetCurrency}
                                        </p>
                                    </div>
                                )}
                            </div>

                        <div className="modal-footer">
                            <Button variant="secondary" data-bs-dismiss="modal">Close</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
