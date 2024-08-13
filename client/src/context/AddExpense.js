import { Form, Modal, Button } from 'react-bootstrap';
import { useRef, useState } from 'react';
import axios from 'axios';
import { useApiKeys } from '../context/ApiKeysContext';
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from './BudgetsContext';

export default function AddBudgetModal({ show, handleClose, defaultBudgetId }) {
    const descriptionRef = useRef();
    const amountRef = useRef();
    const budgetIdRef = useRef();
    const fromCurrencyRef = useRef(); // Updated to "fromCurrencyRef"
    const { addExpense, budgets } = useBudgets();
    const { currencyConverterApi } = useApiKeys();

    const [conversionRate, setConversionRate] = useState(1);

    const currencyApiUrl = `https://api.currencyapi.com/v3/latest?apikey=${currencyConverterApi}`;

    async function fetchConversionRates(fromCurrency) {
        try {
            const response = await axios.get(currencyApiUrl);
            const rates = response.data.data;

            // Fetch conversion rates for USD to SGD and USD to the selected currency
            const usdToSgdRate = rates['SGD'].value;
            const usdToFromRate = rates[fromCurrency].value;

            // Calculate the conversion rate from the selected currency to SGD
            const fromToSgdRate = usdToSgdRate / usdToFromRate;

            setConversionRate(fromToSgdRate);
        } catch (error) {
            console.error('Error fetching conversion rates:', error);
        }
    }

    function handleCurrencyChange() {
        const fromCurrency = fromCurrencyRef.current.value;
        fetchConversionRates(fromCurrency);
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Convert the entered amount in the selected currency to SGD
        const convertedAmount = parseFloat(amountRef.current.value) * conversionRate;

        addExpense({
            description: descriptionRef.current.value,
            amount: convertedAmount, // This is now in SGD
            budgetId: budgetIdRef.current.value
        });
        handleClose();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>New Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control ref={descriptionRef} type="text" required />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="amount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control 
                            ref={amountRef} 
                            type="number" 
                            required min={0} 
                            step={0.01} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="currency">
                        <Form.Label>Currency</Form.Label>
                        <Form.Select ref={fromCurrencyRef} onChange={handleCurrencyChange}>
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
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="budgetId">
                        <Form.Label>Budget</Form.Label>
                        <Form.Select defaultValue={defaultBudgetId} ref={budgetIdRef}>
                            {budgets.map(budget => (
                                <option key={budget.id} value={budget.id}>{budget.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit">
                            Add
                        </Button>
                    </div>
                </Modal.Body>
            </Form>
        </Modal>
    );
}
