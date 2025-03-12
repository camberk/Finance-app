'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Define transaction interface
interface Transaction {
  transaction_id: number
  user_id: number
  amount: number
  transaction_type: string
  expense_category: string
  transaction_date: string
  description: string | null
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; username: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    transaction_type: 'expense',
    expense_category: 'miscellaneous',
    transaction_date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  
  // Available transaction types and expense categories
  const transactionTypes = ['income', 'expense', 'transfer', 'investment', 'refund', 'withdrawal', 'deposit']
  const expenseCategories = [
    'housing', 'utilities', 'food', 'transportation', 'healthcare', 
    'entertainment', 'shopping', 'education', 'personal_care', 
    'debt_payments', 'savings', 'investments', 'insurance', 
    'gifts_donations', 'travel', 'children', 'pets', 'business', 
    'taxes', 'miscellaneous'
  ]
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
        localStorage.removeItem('token')
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        return
      }
      
      try {
        setTransactionsLoading(true)
        const response = await fetch('http://localhost:8000/api/v1/transactions/?limit=5', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }
        
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setTransactionsLoading(false)
      }
    }
    
    if (!isLoading && user) {
      fetchTransactions()
    }
  }, [isLoading, user])
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/auth/login')
  }
  
  const openTransactionModal = () => {
    setIsTransactionModalOpen(true)
  }
  
  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false)
    setTransactionForm({
      amount: '',
      transaction_type: 'expense',
      expense_category: 'miscellaneous',
      transaction_date: new Date().toISOString().split('T')[0],
      description: ''
    })
    setError('')
    setSuccess('')
  }
  
  const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTransactionForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in')
      }
      
      // Convert amount to number
      const formData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount)
      }
      
      const response = await fetch('http://localhost:8000/api/v1/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create transaction')
      }
      
      setSuccess('Transaction created successfully!')
      setTransactionForm({
        amount: '',
        transaction_type: 'expense',
        expense_category: 'miscellaneous',
        transaction_date: new Date().toISOString().split('T')[0],
        description: ''
      })
      
      // Refresh transactions
      const refreshResponse = await fetch('http://localhost:8000/api/v1/transactions/?limit=5', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setTransactions(data)
      }
      
      // Close modal after short delay
      setTimeout(() => {
        closeTransactionModal()
      }, 2000)
      
    } catch (error) {
      console.error('Error creating transaction:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Format amount with currency symbol
  const formatAmount = (amount: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })
    
    return type === 'expense' ? `-${formatter.format(amount)}` : formatter.format(amount)
  }
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">Finance Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Finance Overview</h2>
          <button
            onClick={openTransactionModal}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Add Transaction
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Account Summary</h2>
            <p className="text-gray-600">This is a placeholder for your account summary.</p>
            <p className="mt-4 text-sm text-gray-500">More features coming soon!</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Transactions</h2>
            
            {transactionsLoading ? (
              <p className="text-gray-600">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div key={transaction.transaction_id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description || `${transaction.transaction_type} - ${transaction.expense_category}`}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.transaction_date)}</p>
                      </div>
                      <span 
                        className={`font-medium ${
                          transaction.transaction_type === 'expense' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}
                      >
                        {formatAmount(transaction.amount, transaction.transaction_type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No transactions found. Add your first transaction!</p>
            )}
            
            {transactions.length > 0 && (
              <div className="mt-4 text-right">
                <Link href="/dashboard/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View all transactions
                </Link>
              </div>
            )}
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Budget Overview</h2>
            <p className="text-gray-600">This is a placeholder for your budget overview.</p>
            <p className="mt-4 text-sm text-gray-500">More features coming soon!</p>
          </div>
        </div>
      </main>
      
      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeTransactionModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                  onClick={closeTransactionModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Transaction</h3>
                  
                  {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-4 rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="text-sm text-green-700">{success}</div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleTransactionSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          step="0.01"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="0.00"
                          value={transactionForm.amount}
                          onChange={handleTransactionFormChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700">
                        Transaction Type
                      </label>
                      <div className="mt-1">
                        <select
                          id="transaction_type"
                          name="transaction_type"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          value={transactionForm.transaction_type}
                          onChange={handleTransactionFormChange}
                        >
                          {transactionTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="expense_category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <div className="mt-1">
                        <select
                          id="expense_category"
                          name="expense_category"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          value={transactionForm.expense_category}
                          onChange={handleTransactionFormChange}
                        >
                          {expenseCategories.map(category => (
                            <option key={category} value={category}>
                              {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="transaction_date"
                          id="transaction_date"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          value={transactionForm.transaction_date}
                          onChange={handleTransactionFormChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Enter a description..."
                          value={transactionForm.description}
                          onChange={handleTransactionFormChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Transaction'}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={closeTransactionModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 