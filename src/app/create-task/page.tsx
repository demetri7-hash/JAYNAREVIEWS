'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Plus, Shield, AlertTriangle } from 'lucide-react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'

interface User {
  id: string
  email: string
  name: string | null
  role: string | null
}

interface UserProfile {
  email: string;
  name: string;
  role: 'staff' | 'manager';
}

export default function CreateTask() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { language, getText } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    requires_notes: false,
    requires_photo: false,
    due_date: '',
    due_time: '',
    departments: [] as string[],
  })

  // Check user role on mount
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserProfile(data.user)
            if (data.user.role !== 'manager') {
              // Redirect non-managers to homepage
              router.push('/')
            }
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error)
          router.push('/')
        })
        .finally(() => {
          setProfileLoading(false)
        })
    }
  }, [session, router])

  useEffect(() => {
    if (userProfile?.role === 'manager') {
      fetchUsers()
    }
  }, [userProfile])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Additional validation
    if (!formData.title.trim()) {
      setError(staticTranslations.taskTitleRequired[language]);
      setIsSubmitting(false);
      return;
    }

    if (!formData.due_date) {
      setError(staticTranslations.dueDateRequired[language]);
      setIsSubmitting(false);
      return;
    }

    if (!formData.due_time) {
      setError(staticTranslations.dueTimeRequired[language]);
      setIsSubmitting(false);
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please assign this task to at least one person');
      setIsSubmitting(false);
      return;
    }

    if (formData.departments.length === 0) {
      setError(staticTranslations.selectAtLeastOneDepartment[language]);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting form data:', {
        ...formData,
        assignees: selectedUsers,
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignees: selectedUsers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to create task');
      }

      // Reset form and redirect to dashboard
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        requires_notes: false,
        requires_photo: false,
        due_date: '',
        due_time: '',
        departments: [],
      });
      setSelectedUsers([]);
      router.push('/');
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : staticTranslations.unexpectedError[language]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication and role
  if (status === 'loading' || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{staticTranslations.loading[language]}</p>
        </div>
      </div>
    )
  }

  // Show unauthorized access for non-managers
  if (!session || userProfile?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{staticTranslations.accessRestricted[language]}</h2>
          <p className="text-gray-600 mb-6">
            {staticTranslations.managersOnlyAccess[language]}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {staticTranslations.returnToDashboard[language]}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {staticTranslations.backToDashboard[language]}
          </button>
          <LanguageToggleCompact />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{staticTranslations.createNewTaskPage[language]}</h1>
              <p className="text-gray-600">{staticTranslations.createTaskTemplate[language]}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {staticTranslations.taskTitle[language]} *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={staticTranslations.taskTitlePlaceholder[language]}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {staticTranslations.description[language]}
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={staticTranslations.descriptionPlaceholder[language]}
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                {staticTranslations.frequency[language]} *
              </label>
              <select
                id="frequency"
                required
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="once">{staticTranslations.once[language]}</option>
                <option value="daily">{staticTranslations.daily[language]}</option>
                <option value="weekly">{staticTranslations.weekly[language]}</option>
                <option value="monthly">{staticTranslations.monthly[language]}</option>
                <option value="yearly">{staticTranslations.yearly[language]}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                  {staticTranslations.dueDate[language]} *
                </label>
                <input
                  type="date"
                  id="due_date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="due_time" className="block text-sm font-medium text-gray-700 mb-2">
                  {staticTranslations.dueTimePacific[language]} *
                </label>
                <input
                  type="time"
                  id="due_time"
                  required
                  step="60"
                  value={formData.due_time}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="assigned_users" className="block text-sm font-medium text-gray-700 mb-2">
                {staticTranslations.assignTo[language]}
              </label>
              {loadingUsers ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {staticTranslations.loadingUsers[language]}
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`user_${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`user_${user.id}`} className="ml-2 text-sm text-gray-700">
                        {user.name || user.email} {user.role && `(${user.role})`}
                      </label>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-sm text-gray-500">{staticTranslations.noUsersFound[language]}</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">{staticTranslations.requirements[language]}</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_notes"
                  checked={formData.requires_notes}
                  onChange={(e) => setFormData({ ...formData, requires_notes: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="requires_notes" className="ml-2 text-sm text-gray-700">
                  {staticTranslations.requireNotes[language]}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_photo"
                  checked={formData.requires_photo}
                  onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="requires_photo" className="ml-2 text-sm text-gray-700">
                  {staticTranslations.requirePhotos[language]}
                </label>
              </div>
            </div>

            {/* Department Tags Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {staticTranslations.departmentTags[language]}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-gray-600">
                {staticTranslations.departmentTagsDescription[language]}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'BOH', labelKey: 'backOfHouse', color: 'bg-red-100 text-red-800 border-red-200' },
                  { value: 'FOH', labelKey: 'frontOfHouse', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { value: 'AM', labelKey: 'morningShift', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { value: 'PM', labelKey: 'eveningShift', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                  { value: 'PREP', labelKey: 'prepKitchen', color: 'bg-green-100 text-green-800 border-green-200' },
                  { value: 'CLEAN', labelKey: 'cleaning', color: 'bg-gray-100 text-gray-800 border-gray-200' },
                  { value: 'CATERING', labelKey: 'catering', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                  { value: 'SPECIAL', labelKey: 'specialTasks', color: 'bg-pink-100 text-pink-800 border-pink-200' },
                  { value: 'TRANSITION', labelKey: 'shiftTransitions', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                ].map((dept) => (
                  <label
                    key={dept.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.departments.includes(dept.value)
                        ? dept.color + ' border-current'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.departments.includes(dept.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            departments: [...formData.departments, dept.value]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            departments: formData.departments.filter(d => d !== dept.value)
                          })
                        }
                      }}
                      className="sr-only"
                    />
                    <div className="text-center w-full">
                      <div className="text-xs font-medium">{dept.value}</div>
                      <div className="text-xs opacity-75">{staticTranslations[dept.labelKey as keyof typeof staticTranslations][language]}</div>
                    </div>
                  </label>
                ))}
              </div>
              {formData.departments.length === 0 && (
                <p className="text-sm text-red-600">{staticTranslations.selectAtLeastOneDepartment[language]}</p>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                {staticTranslations.cancel[language]}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? staticTranslations.creating[language] : staticTranslations.createTaskButton[language]}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}