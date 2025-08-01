"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import React, { useEffect, useState} from 'react'
import BudgetItem from '../../budgets/_components/BudgetItem';
import AddExpense from '../_components/AddExpense';
import ExpenseListTable from '../_components/ExpenseListTable';
import { get } from 'http';
import { ArrowLeft, Edit, Pen, PenBox, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import EditBudget from '../_components/EditBudget';

function ExpensesScreen({params}) {
  const resolvedParams = React.use(params);
  const itemId = resolvedParams.id;

  const { user } = useUser();
  const [budgetInfo, setbudgetInfo] = useState();
  const [expensesList, setExpensesList] = useState([]);
  const route = useRouter();

  useEffect(() => {

    user&&getBudgetInfo();
    getExpensesList();
  }, [user]);

    // Get Budget Information
    const getBudgetInfo = async () => {
      const result = await db.select({
          ...getTableColumns(Budgets),
          totalSpend: sql `sum(${Expenses.amount})`.mapWith(Number),
          totalItem:  sql `count(${Expenses.id})`.mapWith(Number)
        }).from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .where(eq(Budgets.id, itemId))
        .groupBy(Budgets.id)
        // .orderBy(desc(Budgets.id))

        setbudgetInfo(result[0]);
        getExpensesList();
        // console.log(result);

    }

    // get latest expense
    const getExpensesList = async () => {
      const result = await db.select().from(Expenses)
      .where(eq(Expenses.budgetId, itemId))
      // .where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(Expenses.id))

      setExpensesList(result);

      console.log(result);
      // return result;
    }

    // Delete Budget
    const deleteBudget = async () => {
      
      const deleteExpenseResult = await db.delete(Expenses)
      .where(eq(Expenses.budgetId, itemId))
      .returning();

      if(deleteExpenseResult){
        const result = await db.delete(Budgets)
        .where(eq(Budgets.id, itemId))
        .returning();
      }

      toast('Budget Deleted!');
      route.push('/dashboard/budgets');
      // console.log(result);
    }

  return (
    <div className='p-10'>
        <h2 className='text-2xl font-bold flex justify-between items-center'>
          <span className='flex items-center gap-2'>
          <ArrowLeft onClick={()=>route.back()} className='cursor-pointer' />
              My Expenses
          </span>
          <div className='flex gap-2 items-center'>
            <EditBudget budgetInfo={budgetInfo}
            refreshData={() => getBudgetInfo()} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className='flex gap-5' variant="destructive"> 
                <Trash /> Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your current budget along with your expenses
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={()=>deleteBudget()}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-2 mt-6 gap-5'>
          {budgetInfo? <BudgetItem
          budget={budgetInfo}
          />:
          <div className='h-[150px] w-full bg-slate-200 
          rounded-lg animate-pulse'>
          </div>}
          <AddExpense budgetId={itemId}
          user={user}
          refreshData={()=>getBudgetInfo()}
          />
          
        </div>
        <div>
          <h2 className='font-bold text-lg mt-3'>Latest Expenses</h2>
          <ExpenseListTable expensesList={expensesList}
          refreshData={()=> getBudgetInfo()}
          />
        </div>
    </div>
  )
}

export default ExpensesScreen

