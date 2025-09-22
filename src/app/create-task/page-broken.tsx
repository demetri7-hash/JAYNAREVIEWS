'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Plus, Shield, AlertTriangle, CheckCircle, Clock, Calendar, Users, Sparkles, Check, Tags, Settings, FileText, Camera } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'one-time',
    requires_notes: false,
    requires_photo: false,
    due_date: '',
    due_time: '',
    departments: [] as string[]
  })

  const departments = ['kitchen', 'front-of-house', 'management', 'cleaning', 'prep', 'dishpit']

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
      return
    }

    fetchUserProfile()
    fetchUsers()
  }, [session, status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/me')
      const data = await response.json()
      if (data.success) {
        setUserProfile(data.user)
        if (data.user.role !== 'manager') {
          router.push('/')
          return
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError(staticTranslations.taskTitleRequired[language])
      setIsSubmitting(false)
      return
    }

    if (!formData.due_date) {
      setError(staticTranslations.dueDateRequired[language])
      setIsSubmitting(false)
      return
    }

    if (!formData.due_time) {
      setError(staticTranslations.dueTimeRequired[language])
      setIsSubmitting(false)
      return
    }

    if (selectedUsers.length === 0) {
      setError(staticTranslations.pleaseAssignTask[language])
      setIsSubmitting(false)
      return
    }

    if (formData.departments.length === 0) {
      setError(staticTranslations.selectAtLeastOneDepartment[language])
      setIsSubmitting(false)
      return
    }

    try {
      console.log('Submitting form data:', {
        ...formData,
        assignees: selectedUsers,
      })

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          assignees: selectedUsers,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('API Error:', data)
        throw new Error(data.error || staticTranslations.failedToCreateTask[language])
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
      })
      setSelectedUsers([])
      router.push('/')
    } catch (error) {
      console.error('Error creating task:', error)
      setError(error instanceof Error ? error.message : staticTranslations.unexpectedError[language])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">{staticTranslations.loadingUsers[language]}</p>
        </div>
      </div>
    )
  }

  if (userProfile.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{staticTranslations.accessDenied[language]}</h1>
          <p className="text-slate-600 mb-6">{staticTranslations.managerOnlyAccess[language]}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium"
          >
            {staticTranslations.backToDashboard[language]}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200 bg-white/70 hover:bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {staticTranslations.backToDashboard[language]}
          </button>
          <LanguageToggleCompact />
        </div>

        {/* Main Content */}
        <div className="glass rounded-3xl p-8 animate-fade-in-scale">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 left-1/2 ml-6">
                <Sparkles className="w-6 h-6 text-gold-500 animate-pulse-subtle" />
              </div>
            </div>
            <h1 className="text-3xl font-black mb-3 brand-header">
              <span className="gradient-text">{staticTranslations.createNewTaskPage[language]}</span>
            </h1>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto brand-subtitle">
              {staticTranslations.createTaskTemplate[language]}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 animate-fade-in-up">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Task Details Section */}
            <div className="bg-white/50 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center brand-header">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                {staticTranslations.taskDetails[language]}
              </h3>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                    {staticTranslations.taskTitle[language]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white"
                    placeholder={staticTranslations.taskTitlePlaceholder[language]}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    {staticTranslations.taskDescription[language]}
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white resize-none"
                    placeholder={staticTranslations.descriptionPlaceholder[language]}
                  />
                </div>

                {/* Frequency and Date/Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 mb-2">
                      {staticTranslations.frequency[language]}
                    </label>
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'one-time' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white"
                    >
                      <option value="daily">{staticTranslations.daily[language]}</option>
                      <option value="weekly">{staticTranslations.weekly[language]}</option>
                      <option value="monthly">{staticTranslations.monthly[language]}</option>
                      <option value="one-time">{staticTranslations.oneTime[language]}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-2">
                      {staticTranslations.dueDate[language]} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="due_date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="due_time" className="block text-sm font-medium text-slate-700 mb-2">
                      {staticTranslations.dueTime[language]} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="due_time"
                      required
                      step="60"
                      value={formData.due_time}
                      onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Assignment Section */}
            <div className="bg-white/50 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center brand-header">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                {staticTranslations.assignToUsers[language]}
              </h3>
              
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-600">{staticTranslations.loadingUsers[language]}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-200 cursor-pointer border border-white/30"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-lg border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                        selectedUsers.includes(user.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-300 hover:border-blue-400'
                      }`}>
                        {selectedUsers.includes(user.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        user.role === 'manager' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Department Tags Section */}
            <div className="bg-white/50 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center brand-header">
                <Tags className="w-5 h-5 mr-2 text-purple-500" />
                {staticTranslations.departmentTags[language]}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {departments.map((dept) => (
                  <label
                    key={dept}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={formData.departments.includes(dept)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, departments: [...formData.departments, dept] });
                        } else {
                          setFormData({ ...formData, departments: formData.departments.filter(d => d !== dept) });
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      formData.departments.includes(dept)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 text-slate-700'
                    }`}>
                      <div className="font-medium text-sm capitalize">{dept}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="bg-white/50 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center brand-header">
                <Settings className="w-5 h-5 mr-2 text-orange-500" />
                {staticTranslations.taskRequirements[language]}
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-200 cursor-pointer border border-white/30">
                  <input
                    type="checkbox"
                    checked={formData.requires_notes}
                    onChange={(e) => setFormData({ ...formData, requires_notes: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                    formData.requires_notes
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-slate-300 hover:border-orange-400'
                  }`}>
                    {formData.requires_notes && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{staticTranslations.requiresNotes[language]}</p>
                    <p className="text-sm text-slate-600">{staticTranslations.notesDescription[language]}</p>
                  </div>
                  <FileText className="w-5 h-5 text-orange-500 ml-3" />
                </label>

                <label className="flex items-center p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-200 cursor-pointer border border-white/30">
                  <input
                    type="checkbox"
                    checked={formData.requires_photo}
                    onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                    formData.requires_photo
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-slate-300 hover:border-orange-400'
                  }`}>
                    {formData.requires_photo && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{staticTranslations.requiresPhoto[language]}</p>
                    <p className="text-sm text-slate-600">{staticTranslations.photoDescription[language]}</p>
                  </div>
                  <Camera className="w-5 h-5 text-orange-500 ml-3" />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                {staticTranslations.cancel[language]}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {staticTranslations.creating[language]}
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    {staticTranslations.createTaskButton[language]}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}