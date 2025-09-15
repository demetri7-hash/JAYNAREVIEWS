'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Package, Plus, AlertTriangle, Truck, Clock, CheckCircle } from 'lucide-react';

export default function OrderingDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('inventory');

  const categories = [
    {
      key: 'proteins',
      title: language === 'es' ? 'Proteínas y Carnes' : language === 'tr' ? 'Protein ve Et' : 'Proteins & Meats',
      icon: '🥩',
      count: 8,
      urgent: 2
    },
    {
      key: 'vegetables',
      title: language === 'es' ? 'Verduras y Productos Frescos' : language === 'tr' ? 'Sebze ve Taze Ürünler' : 'Vegetables & Produce',
      icon: '🥬',
      count: 15,
      urgent: 5
    },
    {
      key: 'spices',
      title: language === 'es' ? 'Especias y Condimentos' : language === 'tr' ? 'Baharat ve Çeşni' : 'Spices & Seasonings',
      icon: '🌶️',
      count: 12,
      urgent: 1
    },
    {
      key: 'oils',
      title: language === 'es' ? 'Aceites y Líquidos' : language === 'tr' ? 'Yağ ve Sıvılar' : 'Oils & Liquids',
      icon: '🫒',
      count: 6,
      urgent: 0
    },
    {
      key: 'dairy',
      title: language === 'es' ? 'Lácteos y Especiales' : language === 'tr' ? 'Süt Ürünleri ve Özel' : 'Dairy & Specialty',
      icon: '🧀',
      count: 7,
      urgent: 1
    },
    {
      key: 'packaging',
      title: language === 'es' ? 'Embalaje y Suministros' : language === 'tr' ? 'Ambalaj ve Malzemeler' : 'Packaging & Supplies',
      icon: '📦',
      count: 18,
      urgent: 3
    }
  ];

  const urgentItems = [
    { name: 'Ground Lamb', category: 'Proteins', needed: '10 lbs', supplier: 'Metro Meat' },
    { name: 'Tomatoes', category: 'Produce', needed: '2 cases', supplier: 'Fresh Direct' },
    { name: 'Olive Oil', category: 'Oils', needed: '1 gal', supplier: 'Mediterranean Foods' },
    { name: 'Gyro Bowl Lids', category: 'Packaging', needed: '500 units', supplier: 'Restaurant Supply' },
    { name: 'Red Onions', category: 'Produce', needed: '20 lbs', supplier: 'Fresh Direct' }
  ];

  return (
    <Layout 
      title={t('nav.ordering', language)}
      showBackButton 
      onBack={() => router.push('/')}
    >
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 ${
            activeTab === 'inventory'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {language === 'es' ? 'Inventario' : language === 'tr' ? 'Envanter' : 'Inventory'}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {language === 'es' ? 'Pedidos' : language === 'tr' ? 'Siparişler' : 'Orders'}
        </button>
        <button
          onClick={() => setActiveTab('urgent')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 ${
            activeTab === 'urgent'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {language === 'es' ? 'Urgente' : language === 'tr' ? 'Acil' : 'Urgent'}
        </button>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'es' ? 'Categorías de Inventario' : language === 'tr' ? 'Envanter Kategorileri' : 'Inventory Categories'}
            </h2>
            <Button onClick={() => alert('Custom ordering list feature coming soon!')}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Lista Personalizada' : language === 'tr' ? 'Özel Liste' : 'Custom List'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card
                key={category.key}
                className="p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => alert('Category viewing feature coming soon!')}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  {category.urgent > 0 && (
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {category.urgent} {language === 'es' ? 'Urgente' : language === 'tr' ? 'Acil' : 'Urgent'}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">
                  {category.count} {language === 'es' ? 'artículos' : language === 'tr' ? 'öğe' : 'items'}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {language === 'es' ? 'Estados de Pedidos' : language === 'tr' ? 'Sipariş Durumları' : 'Order Status'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'Pendientes' : language === 'tr' ? 'Beklemede' : 'Pending'}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <Truck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'En Tránsito' : language === 'tr' ? 'Yolda' : 'In Transit'}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'Entregados' : language === 'tr' ? 'Teslim Edildi' : 'Delivered'}
              </div>
            </Card>
          </div>

          <Button onClick={() => alert('New order creation feature coming soon!')} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'es' ? 'Crear Nuevo Pedido' : language === 'tr' ? 'Yeni Sipariş Oluştur' : 'Create New Order'}
          </Button>
        </div>
      )}

      {/* Urgent Tab */}
      {activeTab === 'urgent' && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'es' ? 'Artículos Urgentes' : language === 'tr' ? 'Acil Öğeler' : 'Urgent Items'}
            </h2>
          </div>

          <div className="space-y-4">
            {urgentItems.map((item, index) => (
              <Card key={index} className="p-4 border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'es' ? 'Necesario:' : language === 'tr' ? 'Gerekli:' : 'Needed:'} {item.needed}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'es' ? 'Proveedor:' : language === 'tr' ? 'Tedarikçi:' : 'Supplier:'} {item.supplier}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => {}}>
                    {language === 'es' ? 'Ordenar Ahora' : language === 'tr' ? 'Şimdi Sipariş Ver' : 'Order Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {language === 'es' 
                ? '⚠️ Estos artículos están por debajo del nivel par. Contacta al gerente al 916-513-3192 si es crítico.'
                : language === 'tr'
                ? '⚠️ Bu öğeler par seviyesinin altında. Kritikse 916-513-3192 numaralı telefonu arayın.'
                : '⚠️ These items are below par level. Contact manager at 916-513-3192 if critical.'
              }
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
