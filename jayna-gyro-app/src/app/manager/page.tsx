'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { db, supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Camera, 
  FileText,
  Clock,
  AlertTriangle,
  Shield,
  Eye
} from 'lucide-react'

interface ChecklistItem {
  id: string
  template_name: string
  department: 'FOH' | 'BOH'
  item_order: number
  task_description: string
  task_description_es?: string
  task_description_tr?: string
  category: string
  is_required: boolean
  requires_photo: boolean
  requires_note: boolean
  time_estimate_minutes?: number
  food_safety_critical: boolean
  active: boolean
}

interface ReviewTemplate {
  id: string
  template_name: string
  department: 'FOH' | 'BOH'
  review_categories: any
  pass_threshold: number
  requires_manager_photo: boolean
  active: boolean
}

export default function ManagerEditor() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'checklists' | 'reviews'>('checklists')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [reviewTemplates, setReviewTemplates] = useState<ReviewTemplate[]>([])
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Translation helper
  const t = (key: string) => {
    const translations: any = {
      en: {
        managerEditor: 'Manager Editor',
        checklists: 'Checklists',
        reviews: 'Reviews', 
        selectTemplate: 'Select Template',
        addNewItem: 'Add New Item',
        editItem: 'Edit Item',
        taskDescription: 'Task Description',
        category: 'Category',
        required: 'Required',
        requiresPhoto: 'Requires Photo',
        requiresNote: 'Requires Note',
        timeEstimate: 'Time Estimate (minutes)',
        foodSafetyCritical: 'Food Safety Critical',
        active: 'Active',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        preview: 'Preview',
        order: 'Order',
        description: 'Description'
      },
      es: {
        managerEditor: 'Editor de Gerente',
        checklists: 'Listas de Verificación',
        reviews: 'Revisiones',
        selectTemplate: 'Seleccionar Plantilla',
        addNewItem: 'Agregar Nuevo Elemento',
        editItem: 'Editar Elemento',
        taskDescription: 'Descripción de la Tarea',
        category: 'Categoría',
        required: 'Obligatorio',
        requiresPhoto: 'Requiere Foto',
        requiresNote: 'Requiere Nota',
        timeEstimate: 'Estimación de Tiempo (minutos)',
        foodSafetyCritical: 'Crítico para Seguridad Alimentaria',
        active: 'Activo',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        preview: 'Vista Previa',
        order: 'Orden',
        description: 'Descripción'
      },
      tr: {
        managerEditor: 'Yönetici Editörü',
        checklists: 'Kontrol Listeleri',
        reviews: 'İncelemeler',
        selectTemplate: 'Şablon Seç',
        addNewItem: 'Yeni Öğe Ekle',
        editItem: 'Öğeyi Düzenle',
        taskDescription: 'Görev Açıklaması',
        category: 'Kategori',
        required: 'Gerekli',
        requiresPhoto: 'Fotoğraf Gerektirir',
        requiresNote: 'Not Gerektirir',
        timeEstimate: 'Süre Tahmini (dakika)',
        foodSafetyCritical: 'Gıda Güvenliği Kritik',
        active: 'Aktif',
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        edit: 'Düzenle',
        preview: 'Önizleme',
        order: 'Sıra',
        description: 'Açıklama'
      }
    }
    return translations[language]?.[key] || key
  }

  const templates = [
    { value: 'FOH_AM_Opening', label: 'FOH AM Opening', department: 'FOH' },
    { value: 'FOH_Transition', label: 'FOH Transition', department: 'FOH' },
    { value: 'FOH_PM_Closing', label: 'FOH PM Closing', department: 'FOH' },
    { value: 'BOH_Opening_Line', label: 'BOH Opening Line', department: 'BOH' },
    { value: 'BOH_Morning_Prep', label: 'BOH Morning Prep', department: 'BOH' },
    { value: 'BOH_Morning_Clean', label: 'BOH Morning Clean', department: 'BOH' },
    { value: 'BOH_Closing_Line', label: 'BOH Closing Line', department: 'BOH' }
  ]

  const categories = [
    'Setup', 'Cleaning', 'Food Safety', 'Technology', 'Equipment', 
    'Beverages', 'Supplies', 'Environment', 'Communication', 'Final'
  ]

  useEffect(() => {
    if (selectedTemplate && activeTab === 'checklists') {
      loadChecklistItems()
    }
  }, [selectedTemplate, activeTab])

  const loadChecklistItems = async () => {
    if (!selectedTemplate) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('template_name', selectedTemplate)
        .eq('active', true)
        .order('item_order')

      if (error) throw error
      setChecklistItems(data || [])
    } catch (error) {
      console.error('Error loading checklist items:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveChecklistItem = async (item: Partial<ChecklistItem>) => {
    setLoading(true)
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('checklist_items')
          .update({
            ...item,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)
        
        if (error) throw error
      } else {
        // Insert new item
        const maxOrder = Math.max(...checklistItems.map(i => i.item_order), 0)
        const { error } = await supabase
          .from('checklist_items')
          .insert({
            ...item,
            template_name: selectedTemplate,
            department: templates.find(t => t.value === selectedTemplate)?.department,
            item_order: maxOrder + 1
          })
        
        if (error) throw error
      }
      
      setEditingItem(null)
      setShowAddForm(false)
      await loadChecklistItems()
    } catch (error) {
      console.error('Error saving checklist item:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteChecklistItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({ active: false })
        .eq('id', id)
      
      if (error) throw error
      await loadChecklistItems()
    } catch (error) {
      console.error('Error deleting checklist item:', error)
    } finally {
      setLoading(false)
    }
  }

  const EditItemForm = ({ item, onSave, onCancel }: {
    item?: ChecklistItem | null
    onSave: (item: Partial<ChecklistItem>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      task_description: item?.task_description || '',
      task_description_es: item?.task_description_es || '',
      task_description_tr: item?.task_description_tr || '',
      category: item?.category || categories[0],
      is_required: item?.is_required ?? true,
      requires_photo: item?.requires_photo ?? false,
      requires_note: item?.requires_note ?? false,
      time_estimate_minutes: item?.time_estimate_minutes || 5,
      food_safety_critical: item?.food_safety_critical ?? false
    })

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {item ? t('editItem') : t('addNewItem')}
          </h3>
          
          <div className="space-y-4">
            {/* English Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('taskDescription')} (English)
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={formData.task_description}
                onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                required
              />
            </div>

            {/* Spanish Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('taskDescription')} (Español)
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={formData.task_description_es}
                onChange={(e) => setFormData({...formData, task_description_es: e.target.value})}
              />
            </div>

            {/* Turkish Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('taskDescription')} (Türkçe)
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={formData.task_description_tr}
                onChange={(e) => setFormData({...formData, task_description_tr: e.target.value})}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('category')}
              </label>
              <select
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Time Estimate */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                {t('timeEstimate')}
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                min="1"
                max="60"
                value={formData.time_estimate_minutes}
                onChange={(e) => setFormData({...formData, time_estimate_minutes: parseInt(e.target.value)})}
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                  className="mr-2"
                />
                <Shield className="h-4 w-4 mr-1 text-red-500" />
                {t('required')}
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requires_photo}
                  onChange={(e) => setFormData({...formData, requires_photo: e.target.checked})}
                  className="mr-2"
                />
                <Camera className="h-4 w-4 mr-1 text-blue-500" />
                {t('requiresPhoto')}
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requires_note}
                  onChange={(e) => setFormData({...formData, requires_note: e.target.checked})}
                  className="mr-2"
                />
                <FileText className="h-4 w-4 mr-1 text-green-500" />
                {t('requiresNote')}
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.food_safety_critical}
                  onChange={(e) => setFormData({...formData, food_safety_critical: e.target.checked})}
                  className="mr-2"
                />
                <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                {t('foodSafetyCritical')}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-1" />
              {t('cancel')}
            </Button>
            <Button
              onClick={() => onSave(formData)}
              disabled={!formData.task_description.trim()}
            >
              <Save className="h-4 w-4 mr-1" />
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                {t('managerEditor')}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('checklists')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checklists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('checklists')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('reviews')}
            </button>
          </nav>
        </div>

        {/* Checklist Editor */}
        {activeTab === 'checklists' && (
          <div>
            {/* Template Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectTemplate')}
              </label>
              <select
                className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">{t('selectTemplate')}</option>
                {templates.map(template => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Add New Item Button */}
            {selectedTemplate && (
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addNewItem')}
                </Button>
              </div>
            )}

            {/* Checklist Items Table */}
            {selectedTemplate && !loading && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('order')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Options
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checklistItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.item_order}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-md">
                            {item.task_description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col gap-1">
                            {item.is_required && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                <Shield className="h-3 w-3 mr-1" />
                                {t('required')}
                              </span>
                            )}
                            {item.requires_photo && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                <Camera className="h-3 w-3 mr-1" />
                                Photo
                              </span>
                            )}
                            {item.requires_note && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <FileText className="h-3 w-3 mr-1" />
                                Note
                              </span>
                            )}
                            {item.food_safety_critical && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Food Safety
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteChecklistItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Edit/Add Form Modal */}
      {(editingItem || showAddForm) && (
        <EditItemForm
          item={editingItem}
          onSave={saveChecklistItem}
          onCancel={() => {
            setEditingItem(null)
            setShowAddForm(false)
          }}
        />
      )}
    </div>
  )
}
