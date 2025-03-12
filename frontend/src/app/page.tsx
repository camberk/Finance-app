import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-6">
          Personal Finance Tracker
        </h1>
        <p className="text-xl mb-8">
          Take control of your finances. Track expenses, set budgets, and achieve your financial goals.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-primary-700">Track Expenses</h2>
            <p>Log and categorize your spending to understand where your money goes.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-primary-700">Set Budgets</h2>
            <p>Create monthly budgets and get alerts when you're approaching your limits.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-primary-700">Achieve Goals</h2>
            <p>Set savings goals and track your progress toward financial freedom.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
            Login
          </Link>
          <Link href="/auth/register" className="bg-white hover:bg-gray-100 text-primary-600 font-medium py-2 px-6 rounded-md border border-primary-600 transition-colors">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
} 