import { NextRequest, NextResponse } from 'next/server'

// Comprehensive workflow templates based on actual Jayna Gyro paper forms
const WORKFLOW_TEMPLATES = {
  'foh-opening-checklist': {
    id: 'foh-opening-checklist',
    name: 'FOH Opening Checklist',
    department: 'FOH',
    shift_type: 'Opening',
    estimated_duration: 90, // minutes
    priority: 'high',
    languages: {
      en: 'FOH Opening Checklist',
      es: 'Lista de Apertura FOH', 
      tr: 'FOH Açılış Kontrol Listesi'
    },
    sections: [
      {
        id: 'dining-room-setup',
        name: 'Dining Room & Patio Setup',
        name_es: 'Configuración del Comedor y Patio',
        name_tr: 'Yemek Salonu ve Patio Kurulumu',
        order: 1,
        tasks: [
          {
            id: 1,
            name: 'Remove chairs and re-wipe all tables',
            name_es: 'Quitar sillas y limpiar todas las mesas',
            name_tr: 'Sandalyeleri kaldır ve tüm masaları tekrar sil',
            required: true,
            critical: true,
            photo_required: false,
            min_rating: 3
          },
          {
            id: 2, 
            name: 'Wipe table sides, legs, chairs, and banquette sofas',
            name_es: 'Limpiar lados de mesa, patas, sillas y sofás',
            name_tr: 'Masa yanları, bacakları, sandalyeler ve kanepe temizliği',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 3,
            name: 'Don\'t forget the top wood ledge of sofas (especially outside)',
            name_es: 'No olvides el borde superior de madera de los sofás (especialmente afuera)',
            name_tr: 'Kanepe üst ahşap kenarlarını unutma (özellikle dışarda)',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 4,
            name: 'Ensure chairs are tucked in and tables are aligned and evenly spaced',
            name_es: 'Asegúrate de que las sillas estén metidas y las mesas alineadas y espaciadas uniformemente',
            name_tr: 'Sandalyelerin içeri çekildiğinden ve masaların hizalı ve eşit aralıklarla olduğundan emin ol',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 5,
            name: 'Place lamps on tables, hide charging cables',
            name_es: 'Coloca lámparas en las mesas, oculta cables de carga',
            name_tr: 'Masalara lambalar yerleştir, şarj kablolarını gizle',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 6,
            name: '"Salt to the Street" -- salt shakers toward parking lot, pepper toward kitchen',
            name_es: '"Sal hacia la Calle" -- saleros hacia el estacionamiento, pimienta hacia la cocina',
            name_tr: '"Tuz Sokağa" -- tuzluklar otoparka, biber mutfağa doğru',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 7,
            name: 'Wipe and dry menus --- remove stickiness',
            name_es: 'Limpiar y secar menús --- eliminar pegajosidad',
            name_tr: 'Menüleri sil ve kurula --- yapışkanlığı gider',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 8,
            name: 'Turn on all dining room lights',
            name_es: 'Encender todas las luces del comedor',
            name_tr: 'Tüm yemek salonu ışıklarını aç',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 9,
            name: 'Unlock doors and flip both signs to "OPEN"',
            name_es: 'Desbloquear puertas y voltear ambos letreros a "ABIERTO"',
            name_tr: 'Kapıları aç ve her iki tabelayı "AÇIK"a çevir',
            required: true,
            critical: true,
            photo_required: true
          },
          {
            id: 10,
            name: 'Check and refill all rollups (napkin + silverware)',
            name_es: 'Revisar y rellenar todos los rollups (servilleta + cubiertos)',
            name_tr: 'Tüm rollup\'ları kontrol et ve doldur (peçete + çatal bıçak)',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 11,
            name: 'Wipe patio tables and barstools with fresh towel',
            name_es: 'Limpiar mesas del patio y taburetes con toalla fresca',
            name_tr: 'Patio masalarını ve bar taburelerini temiz havlu ile sil',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 12,
            name: 'Raise blinds',
            name_es: 'Subir persianas',
            name_tr: 'Panjurları kaldır',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 13,
            name: 'Windex front doors',
            name_es: 'Limpiar puertas frontales con Windex',
            name_tr: 'Ön kapıları Windex ile temizle',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 14,
            name: 'Wipe down front of registers',
            name_es: 'Limpiar frente de las cajas registradoras',
            name_tr: 'Kasa önlerini temizle',
            required: true,
            critical: true,
            photo_required: false
          }
        ]
      },
      {
        id: 'cleanliness-walkthrough',
        name: 'Cleanliness & Walkthrough',
        name_es: 'Limpieza y Recorrido',
        name_tr: 'Temizlik ve Genel Kontrol',
        order: 2,
        tasks: [
          {
            id: 15,
            name: 'Sweep perimeter and remove cobwebs from pergola area, back wall, between sofas, under all tables and planter boxes',
            name_es: 'Barrer perímetro y quitar telarañas del área de pérgola, pared trasera, entre sofás, bajo todas las mesas y jardineras',
            name_tr: 'Çevreyi süpür ve pergola alanı, arka duvar, kanepe araları, tüm masa ve saksı altlarından örümcek ağlarını temizle',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 16,
            name: 'Review previous night\'s closing checklist for any notes',
            name_es: 'Revisar la lista de cierre de la noche anterior para cualquier nota',
            name_tr: 'Önceki gecenin kapanış listesini notlar için gözden geçir',
            required: true,
            critical: true,
            photo_required: false
          }
        ]
      },
      {
        id: 'bathroom-checks',
        name: 'Bathroom Checks Every Morning [DAILY!]',
        name_es: 'Controles de Baños Cada Mañana [¡DIARIO!]',
        name_tr: 'Her Sabah Banyo Kontrolleri [GÜNLÜK!]',
        order: 3,
        critical_section: true,
        tasks: [
          {
            id: 17,
            name: 'Clean toilets thoroughly: bowl, lid, seat, under seat, and floor around and behind',
            name_es: 'Limpiar inodoros completamente: taza, tapa, asiento, bajo el asiento, y piso alrededor y detrás',
            name_tr: 'Tuvaletleri iyice temizle: kase, kapak, oturak, oturak altı ve etrafındaki zemin',
            required: true,
            critical: true,
            photo_required: true
          },
          {
            id: 18,
            name: 'Windex mirrors',
            name_es: 'Limpiar espejos con Windex',
            name_tr: 'Aynaları Windex ile temizle',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 19,
            name: 'Dust top of hand dryer, soap dispenser, lip around perimeter of bathroom wall',
            name_es: 'Desempolvar parte superior del secador de manos, dispensador de jabón, borde alrededor del perímetro de la pared del baño',
            name_tr: 'El kurutma makinesi üstü, sabun dispenseri, banyo duvarı çevresi kenarlarını tozla',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 20,
            name: 'Scrub and clean sink + remove mold from drain',
            name_es: 'Fregar y limpiar lavabo + quitar moho del desagüe',
            name_tr: 'Lavaboya ovala ve temizle + giderdeki küfü temizle',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 21,
            name: 'Dry and polish all surfaces',
            name_es: 'Secar y pulir todas las superficies',
            name_tr: 'Tüm yüzeyleri kurula ve cilala',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 22,
            name: 'Restock toilet paper',
            name_es: 'Reabastecer papel higiénico',
            name_tr: 'Tuvalet kağıdını yenile',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 23,
            name: 'Restock paper towels',
            name_es: 'Reabastecer toallas de papel',
            name_tr: 'Kağıt havluları yenile',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 24,
            name: 'Restock toilet seat covers',
            name_es: 'Reabastecer cubiertas de asiento de inodoro',
            name_tr: 'Klozet kapak örtülerini yenile',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 25,
            name: 'VERIFY BOH cleaner completed their work - if not OK, clean yourself and notify Demetri immediately',
            name_es: 'VERIFICAR que el limpiador BOH completó su trabajo - si no está bien, limpia tú mismo y notifica a Demetri inmediatamente',
            name_tr: 'BOH temizlikçisinin işini tamamladığını DOĞRULA - iyi değilse kendin temizle ve Demetri\'yi hemen bilgilendir',
            required: true,
            critical: true,
            photo_required: true,
            escalation_required: true
          }
        ]
      },
      {
        id: 'expo-sauce-prep',
        name: 'Expo Station & Sauce Prep',
        name_es: 'Estación Expo y Preparación de Salsas',
        name_tr: 'Expo İstasyonu ve Sos Hazırlığı',
        order: 4,
        tasks: [
          {
            id: 26,
            name: 'Fill 1 sanitation tub at expo: Fill ¾ with sanitizer, Add 2 new microfiber towels, One must be hanging half in/half out (health code requirement)',
            name_es: 'Llenar 1 tina de sanitización en expo: Llenar ¾ con desinfectante, Agregar 2 toallas de microfibra nuevas, Una debe colgar mitad adentro/mitad afuera (requisito del código de salud)',
            name_tr: 'Expo\'da 1 sanitasyon küvetini doldur: ¾ dezenfektan ile doldur, 2 yeni mikrofiber havlu ekle, Birisi yarı içeri/yarı dışarı asılı olmalı (sağlık kodu gereksinimi)',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 27,
            name: 'Expo towels: 1 damp towel for wiping plate edges, 1 dry towel for expo counter and surfaces',
            name_es: 'Toallas de expo: 1 toalla húmeda para limpiar bordes de platos, 1 toalla seca para mostrador expo y superficies',
            name_tr: 'Expo havluları: Tabak kenarlarını silmek için 1 nemli havlu, expo tezgahı ve yüzeyleri için 1 kuru havlu',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 28,
            name: 'Sauce backups (filled ramekins): Tzatziki 1-2 full (2oz), Spicy Aioli 1-2 full (2oz), Lemon Dressing 1-2 full (3oz)',
            name_es: 'Reservas de salsa (ramekins llenos): Tzatziki 1-2 llenos (2oz), Aioli Picante 1-2 llenos (2oz), Aderezo de Limón 1-2 llenos (3oz)',
            name_tr: 'Sos yedekleri (dolu ramekinler): Tzatziki 1-2 dolu (2oz), Baharatlı Aioli 1-2 dolu (2oz), Limon Sosu 1-2 dolu (3oz)',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 29,
            name: 'Squeeze bottles for ramekin plating: 1 full each of Tzatziki, Spicy Aioli, Lemon Dressing',
            name_es: 'Botellas exprimibles para platos de ramekin: 1 lleno de cada uno: Tzatziki, Aioli Picante, Aderezo de Limón',
            name_tr: 'Ramekin sunum için sıkma şişeleri: Tzatziki, Baharatlı Aioli, Limon Sosu\'ndan birer tane dolu',
            required: true,
            critical: true,
            photo_required: false
          },
          {
            id: 30,
            name: 'Bring out sauces and mark any finished',
            name_es: 'Sacar salsas y marcar las que estén terminadas',
            name_tr: 'Sosları çıkar ve bitenleri işaretle',
            required: true,
            critical: false,
            photo_required: false
          },
          {
            id: 31,
            name: 'Stock kitchen with plates and bowls from drying rack - keep replenishing throughout shift',
            name_es: 'Abastecer cocina con platos y tazones del escurridor - seguir reponiendo durante el turno',
            name_tr: 'Mutfağı kurutma rafından tabak ve kaselerle doldur - vardiya boyunca yenilemeye devam et',
            required: true,
            critical: true,
            photo_required: false
          }
        ]
      }
      // Additional sections will be added in subsequent iterations
    ],
    rating_categories: [
      {
        id: 'dining_rooms',
        name: 'Dining Rooms (chairs clean, mirrors, windows, décor, lights)',
        name_es: 'Comedores (sillas limpias, espejos, ventanas, decoración, luces)',
        name_tr: 'Yemek Salonları (temiz sandalyeler, aynalar, pencereler, dekor, ışıklar)',
        min_rating: 3,
        max_rating: 5
      },
      {
        id: 'expo_water_station',
        name: 'Expo & Water Station (stocked, clean, organized)',
        name_es: 'Expo y Estación de Agua (abastecido, limpio, organizado)',
        name_tr: 'Expo ve Su İstasyonu (dolu, temiz, düzenli)',
        min_rating: 3,
        max_rating: 5
      },
      {
        id: 'sauces_baklava_prep',
        name: 'Sauces + Baklava Prep + Beverage Fridge',
        name_es: 'Salsas + Preparación de Baklava + Nevera de Bebidas',
        name_tr: 'Soslar + Baklava Hazırlığı + İçecek Buzdolabı',
        min_rating: 3,
        max_rating: 5
      }
      // Additional rating categories...
    ]
  },

  'missing-ingredients-report': {
    id: 'missing-ingredients-report',
    name: 'Missing Ingredients / Supplies Report',
    department: 'BOTH',
    shift_type: 'Any',
    estimated_duration: 5,
    priority: 'urgent',
    real_time: true,
    languages: {
      en: 'Missing Ingredients Report',
      es: 'Reporte de Ingredientes Faltantes',
      tr: 'Eksik Malzeme Raporu'
    },
    fields: [
      {
        id: 'item_name',
        name: 'Item Name',
        name_es: 'Nombre del Artículo',
        name_tr: 'Ürün Adı',
        type: 'text',
        required: true
      },
      {
        id: 'qty_needed',
        name: 'Quantity Needed',
        name_es: 'Cantidad Necesaria',
        name_tr: 'Gereken Miktar',
        type: 'text',
        required: true
      },
      {
        id: 'reason',
        name: 'Reason for Shortage',
        name_es: 'Razón de la Escasez',
        name_tr: 'Eksiklik Sebebi',
        type: 'text',
        required: false
      },
      {
        id: 'urgency',
        name: 'Urgency Level',
        name_es: 'Nivel de Urgencia',
        name_tr: 'Aciliyet Seviyesi',
        type: 'select',
        options: [
          { value: 'low', label: 'Low', label_es: 'Bajo', label_tr: 'Düşük' },
          { value: 'medium', label: 'Medium', label_es: 'Medio', label_tr: 'Orta' },
          { value: 'high', label: 'High', label_es: 'Alto', label_tr: 'Yüksek' },
          { value: 'urgent', label: 'URGENT', label_es: 'URGENTE', label_tr: 'ACİL' }
        ],
        required: true
      }
    ],
    escalation: {
      phone: '916-513-3192',
      auto_notify: true,
      photo_required: true
    }
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      templates: WORKFLOW_TEMPLATES,
      count: Object.keys(WORKFLOW_TEMPLATES).length
    })
  } catch (error: any) {
    console.error('Error fetching workflow templates:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workflow templates',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { template_id, employee_id, language = 'en' } = await request.json()
    
    if (!template_id || !employee_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: template_id and employee_id'
      }, { status: 400 })
    }

    const template = WORKFLOW_TEMPLATES[template_id as keyof typeof WORKFLOW_TEMPLATES]
    
    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 })
    }

    // Create workflow instance with localized content
    const workflowInstance = {
      template_id,
      employee_id,
      language,
      template,
      created_at: new Date().toISOString(),
      status: 'ready_to_start'
    }

    return NextResponse.json({
      success: true,
      workflow: workflowInstance,
      message: 'Workflow instance created successfully'
    })

  } catch (error: any) {
    console.error('Error creating workflow instance:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create workflow instance',
      details: error.message
    }, { status: 500 })
  }
}
