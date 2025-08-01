import React, { useState } from 'react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import moment from 'moment';
import { toast } from "sonner";

function AddExpense({budgetId, user, refreshData}) {

    const [name, setName] = useState();
    const [amount, setAmount] = useState();

    const addNewExpense = async () => {
        const result=await db.insert(Expenses)
        .values({
            name: name,
            amount: amount,
            budgetId: budgetId,
            createdAt: moment().format('DD/MM/YYYY'),
        }).returning({ insertedId: Budgets.id });

        console.log(result);
        if (result) {
            refreshData();
            toast('New Expense Added!');
            // setName('');
            // setAmount('');
        }
    }

    return (
        <div className='border p-5 rounded-lg'>
            <h2 className='text-lg font-bold'>Add New Expense</h2>
            <div className='mt-2'>
                <h2 className='text-black font-medium my-1'>Expense Name</h2>
                <Input placeholder="e.g. Eggs"
                    onChange={(e) => setName(e.target.value)} />
            </div>
            <div className='mt-2'>
                <h2 className='text-black font-medium my-1'>Expense Amount</h2>
                <Input type="number" placeholder="e.g. 160Tk."
                    onChange={(e) => setAmount(e.target.value)} />
            </div>
            <Button disabled={!(name && amount)} 
            onClick={() =>addNewExpense()} 
            className='mt-3 w-full'>Add New Expense</Button>
        </div>
    )
}

export default AddExpense