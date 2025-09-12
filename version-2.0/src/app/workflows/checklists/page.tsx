'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play, 
  Copy,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface Checklist {
  id: string
  name: string
  description: string
  department: string
  category: string
  is_active: boolean
  created_by_user: { name: string }
  tasks: any[]
  created_at: string
  updated_at: string
}

export default function ChecklistsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  // Check permissions
  useEffect(() => {
    if (!session?.user?.employee) return
    
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      router.push('/')
    }
  }, [session, router])

  const fetchChecklists = async () => {
    try {
      const params = new URLSearchParams()
      if (departmentFilter !== 'ALL') params.append('department', departmentFilter)
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
      
      const response = await fetch(`/api/checklists?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setChecklists(data.checklists)
      }
    } catch (error) {
      console.error('Error fetching checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChecklists()
  }, [departmentFilter, categoryFilter])

  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteChecklist = async (id: string) => {
    try {
      const response = await fetch(`/api/checklists?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        setChecklists(prev => prev.filter(c => c.id !== id))
        setShowDeleteModal(null)
      } else {
        alert(data.error || 'Failed to delete checklist')
      }
    } catch (error) {
      alert('Network error occurred')
    }
  }

  const duplicateChecklist = async (checklist: Checklist) => {
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${checklist.name} (Copy)`,
          description: checklist.description,
          department: checklist.department,
          category: checklist.category,
          tasks: checklist.tasks.map(({ id, checklist_id, created_at, updated_at, ...task }) => task)
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchChecklists() // Refresh list
      } else {
        alert(data.error || 'Failed to duplicate checklist')
      }
    } catch (error) {
      alert('Network error occurred')
    }
  }

  const assignWorkflow = async (checklistId: string) => {
    // Navigate to workflow assignment page
    router.push(`/workflows/assign?checklist=${checklistId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checklists</h1>
            <p className="text-gray-600 mt-1">Manage workflow templates and procedures</p>
          </div>
          
          <Link
            href="/workflows/checklists/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Checklist</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search checklists..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">All Departments</option>
                  <option value="FOH">Front of House</option>
                  <option value="BOH">Back of House</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="opening">Opening</option>
                <option value="closing">Closing</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="cleaning">Cleaning</option>
                <option value="inventory">Inventory</option>
                <option value="prep">Prep</option>
              </select>
            </div>
          </div>
        </div>

        {/* Checklists Grid */}
        {filteredChecklists.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No checklists found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || departmentFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first checklist'
              }
            </p>
            {!searchTerm && departmentFilter === 'ALL' && categoryFilter === 'ALL' && (
              <Link
                href="/workflows/checklists/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Checklist</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist) => (
              <div key={checklist.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {checklist.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {checklist.department}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {checklist.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {/* Dropdown menu would go here */}
                    </div>
                  </div>

                  {/* Description */}
                  {checklist.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {checklist.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{checklist.tasks?.length || 0} tasks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {checklist.tasks?.reduce((acc, task) => acc + (task.estimated_minutes || 0), 0)} min
                      </span>
                    </div>
                  </div>

                  {/* Created by */}
                  <p className="text-xs text-gray-400 mb-4">
                    Created by {checklist.created_by_user?.name || 'Unknown'} •{' '}
                    {new Date(checklist.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => assignWorkflow(checklist.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Assign</span>
                      </button>
                      
                      <button
                        onClick={() => duplicateChecklist(checklist)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center space-x-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Link
                        href={`/workflows/checklists/${checklist.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      
                      <button
                        onClick={() => setShowDeleteModal(checklist.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {!checklist.is_active && (
                    <div className="mt-3 flex items-center space-x-1 text-orange-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Inactive</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Checklist</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this checklist? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChecklist(showDeleteModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
