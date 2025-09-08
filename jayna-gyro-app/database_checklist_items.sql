-- Real checklist items from reference files that managers can edit
-- FOH AM Opening Checklist Items (from FOH OPENING CHECKLIST.md)

INSERT INTO checklist_items (template_name, department, item_order, task_description, task_description_es, task_description_tr, category, is_required, requires_photo, requires_note, time_estimate_minutes, food_safety_critical) VALUES
-- Setup & Opening (15 items)
('FOH_AM_Opening', 'FOH', 1, 'Turn on lights and music', 'Encender luces y música', 'Işıkları ve müziği açın', 'Setup', true, false, false, 2, false),
('FOH_AM_Opening', 'FOH', 2, 'Turn on POS system and test functionality', 'Encender sistema POS y probar funcionalidad', 'POS sistemini açın ve işlevselliği test edin', 'Technology', true, false, true, 3, false),
('FOH_AM_Opening', 'FOH', 3, 'Set up cash register with starting cash ($200)', 'Configurar caja con efectivo inicial ($200)', 'Kasa makinesini başlangıç parası ile kurun ($200)', 'Money', true, true, true, 5, false),
('FOH_AM_Opening', 'FOH', 4, 'Test credit card machine and receipt printer', 'Probar máquina de tarjetas y impresora', 'Kredi kartı makinesini ve yazıcıyı test edin', 'Technology', true, false, true, 3, false),
('FOH_AM_Opening', 'FOH', 5, 'Check WiFi connectivity for customers', 'Verificar conectividad WiFi para clientes', 'Müşteriler için WiFi bağlantısını kontrol edin', 'Technology', false, false, false, 2, false),

-- Cleaning & Sanitation (25 items)
('FOH_AM_Opening', 'FOH', 6, 'Wipe down all dining tables and chairs', 'Limpiar todas las mesas y sillas del comedor', 'Tüm yemek masalarını ve sandalyeleri silin', 'Cleaning', true, false, false, 8, true),
('FOH_AM_Opening', 'FOH', 7, 'Clean and sanitize condiment station thoroughly', 'Limpiar y desinfectar estación de condimentos', 'Baharat istasyonunu tamamen temizleyin ve dezenfekte edin', 'Cleaning', true, true, false, 5, true),
('FOH_AM_Opening', 'FOH', 8, 'Sanitize door handles and high-touch surfaces', 'Desinfectar manijas y superficies de alto contacto', 'Kapı kollarını ve sık dokunulan yüzeyleri dezenfekte edin', 'Cleaning', true, false, false, 3, true),
('FOH_AM_Opening', 'FOH', 9, 'Check and clean front windows (inside and outside)', 'Verificar y limpiar ventanas delanteras (adentro y afuera)', 'Ön camları kontrol edin ve temizleyin (iç ve dış)', 'Cleaning', true, false, false, 10, false),
('FOH_AM_Opening', 'FOH', 10, 'Sweep and mop dining area floor', 'Barrer y trapear piso del área de comedor', 'Yemek alanının zeminini süpürün ve paspasla', 'Cleaning', true, false, false, 15, true),

-- Restroom Maintenance (12 critical items)
('FOH_AM_Opening', 'FOH', 11, 'Check restroom toilet paper supply (minimum 4 rolls each)', 'Verificar papel higiénico (mínimo 4 rollos cada uno)', 'Tuvalet kağıdı stoğunu kontrol edin (her birinde minimum 4 rulo)', 'Restroom', true, false, true, 3, false),
('FOH_AM_Opening', 'FOH', 12, 'Check and refill hand soap dispensers', 'Verificar y rellenar dispensadores de jabón', 'El sabunu makinelerini kontrol edin ve doldurun', 'Restroom', true, false, false, 2, true),
('FOH_AM_Opening', 'FOH', 13, 'Check paper towel dispensers (stock minimum 2 packs)', 'Verificar dispensadores de toallas (mínimo 2 paquetes)', 'Kağıt havlu makinelerini kontrol edin (minimum 2 paket)', 'Restroom', true, false, true, 2, false),
('FOH_AM_Opening', 'FOH', 14, 'Clean and sanitize restroom sinks and fixtures', 'Limpiar y desinfectar lavabos y accesorios', 'Tuvalet lavabolarını ve armatürlerini temizleyin', 'Restroom', true, false, false, 5, true),
('FOH_AM_Opening', 'FOH', 15, 'Empty restroom trash and replace liners', 'Vaciar basura de baños y reemplazar bolsas', 'Tuvalet çöplerini boşaltın ve torbaları değiştirin', 'Restroom', true, false, false, 3, true),

-- Beverage Station (15 items)
('FOH_AM_Opening', 'FOH', 16, 'Check and refill soda machine (all flavors)', 'Verificar y rellenar máquina de refrescos (todos los sabores)', 'Gazlı içecek makinesini kontrol edin (tüm aromalar)', 'Beverages', true, false, true, 8, false),
('FOH_AM_Opening', 'FOH', 17, 'Fill ice in drink station to capacity', 'Llenar hielo en estación de bebidas hasta capacidad', 'İçecek istasyonunu buzla tamamen doldurun', 'Beverages', true, false, false, 5, true),
('FOH_AM_Opening', 'FOH', 18, 'Clean and stock cups and lids (all sizes)', 'Limpiar y reponer vasos y tapas (todos los tamaños)', 'Bardakları ve kapakları temizleyin (tüm boyutlar)', 'Supplies', true, false, false, 5, false),
('FOH_AM_Opening', 'FOH', 19, 'Turn on coffee machine and prepare first pot', 'Encender cafetera y preparar primera olla', 'Kahve makinesini açın ve ilk demliği hazırlayın', 'Beverages', false, false, false, 8, false),
('FOH_AM_Opening', 'FOH', 20, 'Check Turkish tea setup and water levels', 'Verificar configuración de té turco y niveles de agua', 'Türk çayı düzeneğini ve su seviyelerini kontrol edin', 'Beverages', false, false, false, 3, false),

-- Food Safety & Temperature (12 items)
('FOH_AM_Opening', 'FOH', 21, 'Check temperature of refrigerated displays (35-38°F)', 'Revisar temperatura de vitrinas (35-38°F)', 'Soğutmalı vitrinin sıcaklığını kontrol edin (2-3°C)', 'Food Safety', true, true, true, 3, true),
('FOH_AM_Opening', 'FOH', 22, 'Verify all refrigerated items are properly dated', 'Verificar que artículos refrigerados tengan fecha', 'Tüm soğutulmuş ürünlerin tarihli olduğunu doğrulayın', 'Food Safety', true, false, true, 5, true),
('FOH_AM_Opening', 'FOH', 23, 'Check expiration dates on condiments and sauces', 'Verificar fechas de vencimiento de condimentos', 'Baharat ve sosların son kullanma tarihlerini kontrol edin', 'Food Safety', true, false, true, 8, true),

-- Supply Management (18 items)  
('FOH_AM_Opening', 'FOH', 24, 'Check and fill napkin dispensers at all tables', 'Verificar y llenar dispensadores en todas las mesas', 'Tüm masalardaki peçete makinelerini kontrol edin', 'Supplies', true, false, false, 10, false),
('FOH_AM_Opening', 'FOH', 25, 'Fill sanitizer dispensers throughout restaurant', 'Llenar dispensadores de desinfectante', 'Restoran boyunca dezenfektan makinelerini doldurun', 'Health', true, false, false, 5, true),
('FOH_AM_Opening', 'FOH', 26, 'Stock to-go containers, lids, and bags to 100%', 'Reponer envases para llevar al 100%', 'Paket servis kapları ve torbaları %100 doldurun', 'Supplies', true, false, false, 8, false),

-- Environment & Atmosphere (10 items)
('FOH_AM_Opening', 'FOH', 27, 'Turn on heat/AC to comfortable temperature (72°F)', 'Encender calefacción/AC a temperatura cómoda (22°C)', 'Isıtma/klima sistemini rahat sıcaklığa ayarlayın (22°C)', 'Environment', true, false, false, 2, false),
('FOH_AM_Opening', 'FOH', 28, 'Check and replace any burnt out light bulbs', 'Verificar y reemplazar bombillas quemadas', 'Yanmış ampulleri kontrol edin ve değiştirin', 'Maintenance', false, false, true, 5, false),
('FOH_AM_Opening', 'FOH', 29, 'Set up outdoor seating if weather permits', 'Preparar asientos al aire libre si el clima lo permite', 'Hava müsaitse dış mekan oturma yerlerini hazırlayın', 'Setup', false, false, false, 10, false),

-- Final Checks (12 items)
('FOH_AM_Opening', 'FOH', 30, 'Review daily specials with kitchen staff', 'Revisar especiales del día con personal de cocina', 'Mutfak personeliyle günün özelliklerini gözden geçirin', 'Communication', true, false, true, 5, false),
('FOH_AM_Opening', 'FOH', 31, 'Verify emergency contact numbers are posted (916-513-3192)', 'Verificar números de emergencia estén visibles', 'Acil durum numaralarının görünür olduğunu doğrulayın', 'Safety', true, true, false, 2, false),
('FOH_AM_Opening', 'FOH', 32, 'Test phone system for incoming calls', 'Probar sistema telefónico para llamadas entrantes', 'Gelen aramalar için telefon sistemini test edin', 'Technology', false, false, false, 3, false),
('FOH_AM_Opening', 'FOH', 33, 'Brief team on daily goals and priorities', 'Informar al equipo sobre objetivos diarios', 'Ekibi günlük hedefler hakkında bilgilendirin', 'Team', true, false, true, 8, false),
('FOH_AM_Opening', 'FOH', 34, 'Count and verify POS inventory levels', 'Contar y verificar niveles de inventario en POS', 'POS envanter seviyelerini sayın ve doğrulayın', 'Inventory', false, false, false, 5, false),
('FOH_AM_Opening', 'FOH', 35, 'Unlock front door and flip open sign', 'Abrir puerta principal y voltear cartel de abierto', 'Ön kapıyı açın ve açık tabelasını çevirin', 'Opening', true, true, false, 1, false),
('FOH_AM_Opening', 'FOH', 36, 'Final walkthrough and readiness check', 'Recorrido final y verificación de preparación', 'Son tur ve hazırlık kontrolü yapın', 'Final', true, true, true, 5, false);

-- BOH Opening Line Checklist Items (from BOH reference files)
INSERT INTO checklist_items (template_name, department, item_order, task_description, task_description_es, task_description_tr, category, is_required, requires_photo, requires_note, time_estimate_minutes, food_safety_critical) VALUES
-- Equipment Startup (15 items)
('BOH_Opening_Line', 'BOH', 1, 'Turn on all cooking equipment and check functionality', 'Encender todo el equipo de cocina y verificar funcionamiento', 'Tüm pişirme ekipmanlarını açın ve işlevselliğini kontrol edin', 'Equipment', true, false, true, 10, true),
('BOH_Opening_Line', 'BOH', 2, 'Check gas connections and flame adjustments', 'Verificar conexiones de gas y ajustes de llama', 'Gaz bağlantılarını ve alev ayarlarını kontrol edin', 'Equipment', true, true, true, 5, true),
('BOH_Opening_Line', 'BOH', 3, 'Turn on and calibrate gyro cooker', 'Encender y calibrar cocedor de gyro', 'Döner pişirme makinesini açın ve kalibre edin', 'Equipment', true, false, true, 8, true),
('BOH_Opening_Line', 'BOH', 4, 'Start up fryer and check oil temperature (350°F)', 'Encender freidora y verificar temperatura (175°C)', 'Fritöz açın ve yağ sıcaklığını kontrol edin (175°C)', 'Equipment', true, true, true, 10, true),
('BOH_Opening_Line', 'BOH', 5, 'Turn on grill and preheat to proper temperature', 'Encender parrilla y precalentar a temperatura correcta', 'Izgarayı açın ve doğru sıcaklığa ısıtın', 'Equipment', true, false, true, 12, true),

-- Temperature Checks (12 items)  
('BOH_Opening_Line', 'BOH', 6, 'Check walk-in refrigerator temperature (35-38°F)', 'Verificar temperatura de cámara fría (2-3°C)', 'Soğuk hava deposu sıcaklığını kontrol edin (2-3°C)', 'Food Safety', true, true, true, 3, true),
('BOH_Opening_Line', 'BOH', 7, 'Check reach-in cooler temperatures', 'Verificar temperaturas de refrigeradores pequeños', 'Küçük soğutucuların sıcaklığını kontrol edin', 'Food Safety', true, true, true, 5, true),
('BOH_Opening_Line', 'BOH', 8, 'Verify freezer temperature (0-5°F)', 'Verificar temperatura del congelador (-18 a -15°C)', 'Dondurucu sıcaklığını doğrulayın (-18 ila -15°C)', 'Food Safety', true, true, true, 2, true),
('BOH_Opening_Line', 'BOH', 9, 'Check gyro meat internal temperature (minimum 165°F)', 'Verificar temperatura interna de carne gyro (mínimo 74°C)', 'Döner eti iç sıcaklığını kontrol edin (minimum 74°C)', 'Food Safety', true, true, true, 3, true),

-- Food Safety Prep (20 items)
('BOH_Opening_Line', 'BOH', 10, 'Check all food items for proper dating and labeling', 'Verificar que todos los alimentos tengan fecha y etiqueta', 'Tüm gıda maddelerinin tarih ve etiketlerini kontrol edin', 'Food Safety', true, false, true, 15, true),
('BOH_Opening_Line', 'BOH', 11, 'Verify FIFO rotation is being followed', 'Verificar que se siga rotación FIFO', 'FIFO rotasyonunun takip edildiğini doğrulayın', 'Food Safety', true, false, true, 8, true),
('BOH_Opening_Line', 'BOH', 12, 'Check rice temperature and maintain hot holding (140°F+)', 'Verificar temperatura del arroz (60°C+)', 'Pirinç sıcaklığını kontrol edin (60°C+)', 'Food Safety', true, true, true, 3, true),
('BOH_Opening_Line', 'BOH', 13, 'Heat up and check consistency of all sauces', 'Calentar y verificar consistencia de todas las salsas', 'Tüm sosları ısıtın ve kıvamını kontrol edin', 'Prep', true, false, false, 12, true),

-- Line Organization (18 items)
('BOH_Opening_Line', 'BOH', 14, 'Stock line with fresh vegetables and garnishes', 'Reabastecer línea con vegetales frescos', 'Hattı taze sebze ve garnitürlerle doldurun', 'Prep', true, false, false, 20, true),
('BOH_Opening_Line', 'BOH', 15, 'Check and fill all condiment containers', 'Verificar y llenar todos los recipientes de condimentos', 'Tüm baharat kaplarını kontrol edin ve doldurun', 'Prep', true, false, false, 10, false),
('BOH_Opening_Line', 'BOH', 16, 'Clean and sanitize all work surfaces', 'Limpiar y desinfectar todas las superficies de trabajo', 'Tüm çalışma yüzeylerini temizleyin ve dezenfekte edin', 'Cleaning', true, false, false, 15, true),
('BOH_Opening_Line', 'BOH', 17, 'Organize prep tools and utensils in designated spots', 'Organizar herramientas en lugares designados', 'Hazırlık araçlarını belirlenmiş yerlerde organize edin', 'Organization', true, false, false, 8, false),
('BOH_Opening_Line', 'BOH', 18, 'Check knife sharpness and cutting board condition', 'Verificar filo de cuchillos y estado de tablas', 'Bıçak keskinliğini ve kesme tahtası durumunu kontrol edin', 'Equipment', true, false, true, 5, true);
