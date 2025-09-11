'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase'
import { User, LogIn, UserPlus } from 'lucide-react'

interface UserLoginProps {
  onUserCreated: (user: any) => void
}

export default function UserLogin({ onUserCreated }: UserLoginProps) {
  const { setUser } = useUser()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState<'FOH' | 'BOH' | 'BOTH'>('FOH')
  const [role, setRole] = useState('employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      if (data.success) {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  const handleLogin = async () => {
    if (!name.trim()) {
      setError('Please select your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Find employee by name
      const employee = employees.find(emp => emp.name === name.trim())
      
      if (!employee) {
        setError('Employee not found. Please register first.')
        setMode('register')
        setLoading(false)
        return
      }

      // Store user session
      const userData = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      }

      localStorage.setItem('thepass_user', JSON.stringify(userData))
      setUser(userData)
      onUserCreated(userData)

    } catch (error) {
      setError('Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

      // Create user object for the app context
      const user = {
        id: result.employee.id,
        name: result.employee.name,
        email: result.employee.email,
        department: result.employee.department,
        role: result.employee.role,
        language: 'en' as const
      }

      // Set user in context
      setUser(user)
      
      onUserCreated(user)
    } catch (err: any) {
      console.error('Error creating user:', err)
      setError(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      // Use the existing Maria Garcia employee
      const demoUser = {
        id: 'ac4b1f90-4fd0-4a21-8431-66229a7d6df3', // Maria's actual ID
        name: 'Maria Garcia',
        email: 'maria@jaynagyro.com',
        department: 'FOH' as const,
        role: 'employee',
        language: 'en' as const
      }
      setUser(demoUser)
      onUserCreated(demoUser)
    } catch (err: any) {
      console.error('Error with demo login:', err)
      setError('Demo login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to The Pass</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as 'FOH' | 'BOH' | 'BOTH')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FOH">Front of House</option>
              <option value="BOH">Back of House</option>
              <option value="BOTH">Both Departments</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="shift_lead">Shift Lead</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account & Enter The Pass'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Try Demo Mode
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>By creating an account, you agree to our terms of service.</p>
        </div>
      </div>
    </div>
  )
}
