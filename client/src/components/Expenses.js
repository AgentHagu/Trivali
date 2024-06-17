import React from 'react';
import { Header }  from './expensescomponents/Header'
import { Balance }  from './expensescomponents/Balance'

import './Expenses.css'

export default function ProjectAbout() {
    return <>
        <div class="container">
            <Header />
            <div className='container'>
                <Balance />
            </div>
        </div>
    </>
}