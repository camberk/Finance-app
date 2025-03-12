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

interface FilterOptions {
  transaction_type: string
  expense_category: string
  date_from: string
  date_to: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  // Filtering
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    transaction_type: '',
    expense_category: '',
    date_from: '',
    date_to: ''
  })
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  
  // Available transaction types and expense categories for filtering
  const transactionTypes = ['', 'income', 'expense', 'transfer', 'investment', 'refund', 'withdrawal', 'deposit']
  const expenseCategories = [
    '', 'housing', 'utilities', 'food', 'transportation', 'healthcare', 
    'entertainment', 'shopping', 'education', 'personal_care', 
    'debt_payments', 'savings', 'investments', 'insurance', 
    'gifts_donations', 'travel', 'children', 'pets', 'business', 
    'taxes', 'miscellaneous'
  ]
  
  // Sort options
  const [sortBy, setSortBy] = useState('transaction_date')
  const [sortDirection, setSortDirection] = useState('desc')
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    fetchTransactions(token)
  }, [currentPage, pageSize, filterOptions, sortBy, sortDirection])
  
  const fetchTransactions = async (token: string) => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort_by: sortBy,
        sort_direction: sortDirection
      })
      
      // Add filter parameters if they exist
      if (filterOptions.transaction_type) {
        queryParams.append('transaction_type', filterOptions.transaction_type)
      }
      if (filterOptions.expense_category) {
        queryParams.append('expense_category', filterOptions.expense_category)
      }
      if (filterOptions.date_from) {
        queryParams.append('date_from', filterOptions.date_from)
      }
      if (filterOptions.date_to) {
        queryParams.append('date_to', filterOptions.date_to)
      }
      
      const response = await fetch(`http://localhost:8000/api/v1/transactions/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      
      // Assuming the API returns both the transactions and total count
      // If API doesn't provide total, we'll need to modify this
      setTransactions(data.items || data)
      setTotalTransactions(data.total || data.length)
      
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Failed to load transactions. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }
  
  const clearFilters = () => {
    setFilterOptions({
      transaction_type: '',
      expense_category: '',
      date_from: '',
      date_to: ''
    })
    setCurrentPage(1)
  }
  
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if already sorting by this column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Default to descending for a new column
      setSortBy(column)
      setSortDirection('desc')
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
  
  // Calculate total pages
  const totalPages = Math.ceil(totalTransactions / pageSize)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">All Transactions</h1>
          <Link 
            href="/dashboard"
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-800">Your Transaction History</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <Link
              href="/dashboard"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Filters Section */}
        {isFilterVisible && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Transactions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  id="transaction_type"
                  name="transaction_type"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={filterOptions.transaction_type}
                  onChange={handleFilterChange}
                >
                  {transactionTypes.map(type => (
                    <option key={type} value={type}>
                      {type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'All Types'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="expense_category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="expense_category"
                  name="expense_category"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={filterOptions.expense_category}
                  onChange={handleFilterChange}
                >
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>
                      {category 
                        ? category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
                        : 'All Categories'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={filterOptions.date_from}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="date_to"
                  name="date_to"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={filterOptions.date_to}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Transactions Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No transactions found.</p>
              <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or add new transactions.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('transaction_date')}
                      >
                        <div className="flex items-center">
                          Date
                          {sortBy === 'transaction_date' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('description')}
                      >
                        <div className="flex items-center">
                          Description
                          {sortBy === 'description' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('transaction_type')}
                      >
                        <div className="flex items-center">
                          Type
                          {sortBy === 'transaction_type' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('expense_category')}
                      >
                        <div className="flex items-center">
                          Category
                          {sortBy === 'expense_category' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortBy === 'amount' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description || `${transaction.transaction_type} - ${transaction.expense_category}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.expense_category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.transaction_type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatAmount(transaction.amount, transaction.transaction_type)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{Math.min(1 + (currentPage - 1) * pageSize, totalTransactions)}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * pageSize, totalTransactions)}</span> of{' '}
                      <span className="font-medium">{totalTransactions}</span> transactions
                    </p>
                  </div>
                  <div>
                    <div className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">First</span>
                        ⟪
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        ⟨
                      </button>
                      {/* Page number buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === pageNum
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        ⟩
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Last</span>
                        ⟫
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 