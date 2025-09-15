-- Continue database population with inventory items
-- Insert comprehensive inventory items extracted from reference files

INSERT INTO inventory_items (name, name_es, name_tr, category, unit, par_level, current_stock) VALUES
    -- Proteins and Meats
    ('Chicken Gyro Meat', 'Carne de Pollo Gyro', 'Tavuk Döner Eti', 'Proteins', 'lbs', 50, 35),
    ('Beef Gyro Meat', 'Carne de Res Gyro', 'Dana Döner Eti', 'Proteins', 'lbs', 30, 22),
    ('Lamb Gyro Meat', 'Carne de Cordero Gyro', 'Kuzu Döner Eti', 'Proteins', 'lbs', 25, 18),
    ('Chicken Breast', 'Pechuga de Pollo', 'Tavuk Göğsü', 'Proteins', 'lbs', 40, 28),
    ('Chicken Thighs', 'Muslos de Pollo', 'Tavuk Budu', 'Proteins', 'lbs', 30, 20),
    ('Beef Tenderloin', 'Solomillo de Res', 'Dana Bonfile', 'Proteins', 'lbs', 20, 12),
    ('Lamb Shoulder', 'Paletilla de Cordero', 'Kuzu Kol Eti', 'Proteins', 'lbs', 15, 8),
    ('Falafel Mix', 'Mezcla de Falafel', 'Falafel Karışımı', 'Proteins', 'lbs', 25, 15),

    -- Vegetables
    ('Red Onions', 'Cebollas Rojas', 'Kırmızı Soğan', 'Vegetables', 'lbs', 30, 22),
    ('Yellow Onions', 'Cebollas Amarillas', 'Sarı Soğan', 'Vegetables', 'lbs', 40, 28),
    ('Tomatoes', 'Tomates', 'Domates', 'Vegetables', 'lbs', 50, 35),
    ('Cucumbers', 'Pepinos', 'Salatalık', 'Vegetables', 'lbs', 25, 18),
    ('Green Peppers', 'Pimientos Verdes', 'Yeşil Biber', 'Vegetables', 'lbs', 20, 12),
    ('Red Peppers', 'Pimientos Rojos', 'Kırmızı Biber', 'Vegetables', 'lbs', 15, 10),
    ('Lettuce', 'Lechuga', 'Marul', 'Vegetables', 'heads', 30, 20),
    ('Carrots', 'Zanahorias', 'Havuç', 'Vegetables', 'lbs', 15, 8),
    ('Celery', 'Apio', 'Kereviz', 'Vegetables', 'bunches', 10, 6),
    ('Parsley', 'Perejil', 'Maydanoz', 'Vegetables', 'bunches', 20, 15),
    ('Cilantro', 'Cilantro', 'Kişniş', 'Vegetables', 'bunches', 15, 10),
    ('Mint', 'Menta', 'Nane', 'Vegetables', 'bunches', 10, 6),
    ('Dill', 'Eneldo', 'Dereotu', 'Vegetables', 'bunches', 8, 4),
    ('Scallions', 'Cebolletas', 'Yeşil Soğan', 'Vegetables', 'bunches', 12, 8),
    ('Garlic', 'Ajo', 'Sarımsak', 'Vegetables', 'lbs', 5, 3),
    ('Lemons', 'Limones', 'Limon', 'Vegetables', 'lbs', 20, 14),
    ('Eggplant', 'Berenjena', 'Patlıcan', 'Vegetables', 'lbs', 25, 18),

    -- Dairy and Cheese
    ('Feta Cheese', 'Queso Feta', 'Beyaz Peynir', 'Dairy', 'lbs', 20, 15),
    ('Greek Yogurt', 'Yogur Griego', 'Yunan Yoğurdu', 'Dairy', 'lbs', 25, 18),
    ('Tzatziki', 'Tzatziki', 'Tzatziki', 'Dairy', 'containers', 15, 10),
    ('Kefir Cheese', 'Queso Kefir', 'Kefir Peyniri', 'Dairy', 'lbs', 10, 6),
    ('Butter', 'Mantequilla', 'Tereyağı', 'Dairy', 'lbs', 8, 5),
    ('Heavy Cream', 'Crema Espesa', 'Krema', 'Dairy', 'quarts', 10, 7),
    ('Milk', 'Leche', 'Süt', 'Dairy', 'gallons', 15, 10),

    -- Grains and Bread
    ('Pita Bread', 'Pan Pita', 'Pide Ekmeği', 'Bread', 'bags', 40, 28),
    ('Lavash Bread', 'Pan Lavash', 'Lavaş Ekmeği', 'Bread', 'packs', 20, 14),
    ('Rice', 'Arroz', 'Pirinç', 'Grains', 'lbs', 50, 35),
    ('Orzo Pasta', 'Pasta Orzo', 'Orzo Makarnası', 'Grains', 'lbs', 15, 10),
    ('Bulgur Wheat', 'Trigo Bulgur', 'Bulgur', 'Grains', 'lbs', 20, 14),
    ('Flour', 'Harina', 'Un', 'Grains', 'lbs', 25, 18),

    -- Legumes and Nuts
    ('Chickpeas', 'Garbanzos', 'Nohut', 'Legumes', 'cans', 30, 22),
    ('Lentils', 'Lentejas', 'Mercimek', 'Legumes', 'lbs', 15, 10),
    ('Pine Nuts', 'Piñones', 'Çam Fıstığı', 'Nuts', 'lbs', 5, 3),
    ('Almonds', 'Almendras', 'Badem', 'Nuts', 'lbs', 8, 5),
    ('Walnuts', 'Nueces', 'Ceviz', 'Nuts', 'lbs', 6, 4),

    -- Oils and Condiments
    ('Olive Oil', 'Aceite de Oliva', 'Zeytinyağı', 'Oils', 'bottles', 20, 14),
    ('Neutral Oil', 'Aceite Neutro', 'Nötr Yağ', 'Oils', 'bottles', 15, 10),
    ('Tahini', 'Tahini', 'Tahin', 'Condiments', 'jars', 12, 8),
    ('Tomato Paste', 'Pasta de Tomate', 'Salça', 'Condiments', 'cans', 20, 14),
    ('Harissa', 'Harissa', 'Harissa', 'Condiments', 'jars', 8, 5),
    ('Sambal Oelek', 'Sambal Oelek', 'Sambal Oelek', 'Condiments', 'jars', 6, 4),
    ('Hot Sauce', 'Salsa Picante', 'Acı Sos', 'Condiments', 'bottles', 10, 7),

    -- Spices and Seasonings
    ('Cumin', 'Comino', 'Kimyon', 'Spices', 'lbs', 3, 2),
    ('Paprika', 'Pimentón', 'Toz Biber', 'Spices', 'lbs', 2, 1),
    ('Black Pepper', 'Pimienta Negra', 'Karabiber', 'Spices', 'lbs', 2, 1),
    ('Red Pepper Flakes', 'Hojuelas de Pimiento Rojo', 'Pul Biber', 'Spices', 'lbs', 2, 1),
    ('Oregano', 'Orégano', 'Kekik', 'Spices', 'lbs', 1, 0.5),
    ('Thyme', 'Tomillo', 'Kekik', 'Spices', 'lbs', 1, 0.5),
    ('Bay Leaves', 'Hojas de Laurel', 'Defne Yaprağı', 'Spices', 'oz', 8, 5),
    ('Cinnamon', 'Canela', 'Tarçın', 'Spices', 'oz', 16, 10),
    ('Allspice', 'Pimienta de Jamaica', 'Yenibahar', 'Spices', 'oz', 12, 8),
    ('Kosher Salt', 'Sal Kosher', 'Tuz', 'Spices', 'boxes', 10, 7),
    ('Sugar', 'Azúcar', 'Şeker', 'Spices', 'lbs', 20, 14),

    -- Beverages
    ('Turkish Tea', 'Té Turco', 'Türk Çayı', 'Beverages', 'boxes', 15, 10),
    ('Turkish Coffee', 'Café Turco', 'Türk Kahvesi', 'Beverages', 'lbs', 5, 3),
    ('Ayran Yogurt Drink', 'Bebida de Yogur Ayran', 'Ayran', 'Beverages', 'bottles', 20, 14),
    ('Sparkling Water', 'Agua Con Gas', 'Maden Suyu', 'Beverages', 'bottles', 30, 22),
    ('Fresh Orange Juice', 'Jugo de Naranja Fresco', 'Taze Portakal Suyu', 'Beverages', 'bottles', 15, 10),

    -- Frozen Items
    ('Frozen Spinach', 'Espinaca Congelada', 'Dondurulmuş Ispanak', 'Frozen', 'bags', 20, 14),
    ('Frozen Phyllo Dough', 'Masa Filo Congelada', 'Dondurulmuş Yufka', 'Frozen', 'boxes', 10, 6),
    ('Ice Cream', 'Helado', 'Dondurma', 'Frozen', 'containers', 15, 10),

    -- Packaging and Supplies
    ('To-Go Containers', 'Envases Para Llevar', 'Paket Servisi Kapları', 'Supplies', 'cases', 20, 14),
    ('Napkins', 'Servilletas', 'Peçete', 'Supplies', 'packs', 30, 22),
    ('Plastic Utensils', 'Utensilios de Plástico', 'Plastik Çatal Kaşık', 'Supplies', 'boxes', 15, 10),
    ('Aluminum Foil', 'Papel de Aluminio', 'Alüminyum Folyo', 'Supplies', 'rolls', 10, 7),
    ('Plastic Wrap', 'Papel Film', 'Streç Film', 'Supplies', 'rolls', 8, 5),
    ('Gloves', 'Guantes', 'Eldiven', 'Supplies', 'boxes', 25, 18);

-- Insert FOH Opening Checklist Template
INSERT INTO worksheet_templates (name, department, shift_type, items) VALUES
('FOH AM Opening Checklist', 'FOH', 'AM', '{
  "checklist": [
    {"id": 1, "task": "Turn on lights and music", "task_es": "Encender luces y música", "task_tr": "Işıkları ve müziği açın", "category": "Setup", "required": true},
    {"id": 2, "task": "Turn on POS system", "task_es": "Encender sistema POS", "task_tr": "POS sistemini açın", "category": "Technology", "required": true},
    {"id": 3, "task": "Check and fill napkin dispensers", "task_es": "Revisar y llenar dispensadores de servilletas", "task_tr": "Peçete makinelerini kontrol edin ve doldurun", "category": "Cleaning", "required": true},
    {"id": 4, "task": "Wipe down all tables and chairs", "task_es": "Limpiar todas las mesas y sillas", "task_tr": "Tüm masa ve sandalyeleri silin", "category": "Cleaning", "required": true},
    {"id": 5, "task": "Clean and sanitize condiment station", "task_es": "Limpiar y sanitizar estación de condimentos", "task_tr": "Baharat istasyonunu temizleyin ve dezenfekte edin", "category": "Cleaning", "required": true},
    {"id": 6, "task": "Check restroom supplies (toilet paper, soap, towels)", "task_es": "Revisar suministros del baño (papel, jabón, toallas)", "task_tr": "Tuvalet malzemelerini kontrol edin (tuvalet kağıdı, sabun, havlu)", "category": "Restroom", "required": true},
    {"id": 7, "task": "Sweep and mop dining area", "task_es": "Barrer y trapear área de comedor", "task_tr": "Yemek alanını süpürün ve paspasla", "category": "Cleaning", "required": true},
    {"id": 8, "task": "Empty and clean trash cans", "task_es": "Vaciar y limpiar botes de basura", "task_tr": "Çöp kutularını boşaltın ve temizleyin", "category": "Cleaning", "required": true},
    {"id": 9, "task": "Check and refill soda machine", "task_es": "Revisar y rellenar máquina de refrescos", "task_tr": "Gazlı içecek makinasını kontrol edin ve doldurun", "category": "Beverages", "required": true},
    {"id": 10, "task": "Clean and stock cups and lids", "task_es": "Limpiar y reponer vasos y tapas", "task_tr": "Bardak ve kapakları temizleyin ve stokla", "category": "Supplies", "required": true},
    {"id": 11, "task": "Set up cash register with starting cash", "task_es": "Configurar caja registradora con efectivo inicial", "task_tr": "Nakit kaydını başlangıç parası ile kurun", "category": "Money", "required": true},
    {"id": 12, "task": "Turn on coffee machine and prepare first pot", "task_es": "Encender cafetera y preparar primera olla", "task_tr": "Kahve makinesini açın ve ilk demliği hazırlayın", "category": "Beverages", "required": false},
    {"id": 13, "task": "Check front windows are clean", "task_es": "Verificar que las ventanas delanteras estén limpias", "task_tr": "Ön camların temiz olduğunu kontrol edin", "category": "Cleaning", "required": true},
    {"id": 14, "task": "Test credit card machine", "task_es": "Probar máquina de tarjetas de crédito", "task_tr": "Kredi kartı makinesini test edin", "category": "Technology", "required": true},
    {"id": 15, "task": "Fill ice in drink station", "task_es": "Llenar hielo en estación de bebidas", "task_tr": "İçecek istasyonunu buzla doldurun", "category": "Beverages", "required": true},
    {"id": 16, "task": "Check temperature of refrigerated displays", "task_es": "Revisar temperatura de vitrinas refrigeradas", "task_tr": "Soğutmalı vitrinin sıcaklığını kontrol edin", "category": "Food Safety", "required": true},
    {"id": 17, "task": "Arrange menu boards and promotional materials", "task_es": "Organizar pizarras de menú y materiales promocionales", "task_tr": "Menü panolarını ve promosyon malzemelerini düzenleyin", "category": "Marketing", "required": false},
    {"id": 18, "task": "Unlock front door and flip open sign", "task_es": "Abrir puerta principal y voltear cartel de abierto", "task_tr": "Ön kapıyı açın ve açık tabelasını çevirin", "category": "Opening", "required": true},
    {"id": 19, "task": "Count and verify inventory at POS", "task_es": "Contar y verificar inventario en POS", "task_tr": "POS''ta envanterleri sayın ve doğrulayın", "category": "Inventory", "required": false},
    {"id": 20, "task": "Turn on heat/AC to comfortable temperature", "task_es": "Encender calefacción/AC a temperatura cómoda", "task_tr": "Isıtma/klima sistemini rahat sıcaklığa ayarlayın", "category": "Environment", "required": true},
    {"id": 21, "task": "Check and replace burnt out light bulbs", "task_es": "Revisar y reemplazar bombillas quemadas", "task_tr": "Yanmış ampulleri kontrol edin ve değiştirin", "category": "Maintenance", "required": false},
    {"id": 22, "task": "Sanitize door handles and high-touch surfaces", "task_es": "Sanitizar manijas de puertas y superficies de alto contacto", "task_tr": "Kapı kollarını ve sık dokunulan yüzeyleri dezenfekte edin", "category": "Cleaning", "required": true},
    {"id": 23, "task": "Fill sanitizer dispensers", "task_es": "Llenar dispensadores de desinfectante", "task_tr": "Dezenfektan makinelerini doldurun", "category": "Health", "required": true},
    {"id": 24, "task": "Check WiFi is working properly", "task_es": "Verificar que WiFi funcione correctamente", "task_tr": "WiFi''nin düzgün çalıştığını kontrol edin", "category": "Technology", "required": false},
    {"id": 25, "task": "Review daily specials with kitchen staff", "task_es": "Revisar especiales del día con personal de cocina", "task_tr": "Mutfak personeliyle günün özelliklerini gözden geçirin", "category": "Communication", "required": true},
    {"id": 26, "task": "Set up outdoor seating if applicable", "task_es": "Preparar asientos al aire libre si aplica", "task_tr": "Uygulanabilirse dış mekan oturma yerlerini kurun", "category": "Setup", "required": false},
    {"id": 27, "task": "Check and clean children high chairs", "task_es": "Revisar y limpiar sillas altas para niños", "task_tr": "Çocuk mama sandalyelerini kontrol edin ve temizleyin", "category": "Family", "required": false},
    {"id": 28, "task": "Verify emergency contact numbers are posted", "task_es": "Verificar que números de emergencia estén publicados", "task_tr": "Acil durum telefon numaralarının asılı olduğunu doğrulayın", "category": "Safety", "required": true},
    {"id": 29, "task": "Test phone system", "task_es": "Probar sistema telefónico", "task_tr": "Telefon sistemini test edin", "category": "Technology", "required": false},
    {"id": 30, "task": "Brief team on daily goals and priorities", "task_es": "Informar al equipo sobre objetivos y prioridades diarias", "task_tr": "Ekibi günlük hedefler ve öncelikler hakkında bilgilendirin", "category": "Team", "required": true},
    {"id": 31, "task": "Final walkthrough and readiness check", "task_es": "Recorrido final y verificación de preparación", "task_tr": "Son tur ve hazırlık kontrolü", "category": "Final", "required": true}
  ]
}');

-- Insert BOH Opening Line Template
INSERT INTO worksheet_templates (name, department, shift_type, items) VALUES
('BOH Opening Line Checklist', 'BOH', 'Opening Line', '{
  "checklist": [
    {"id": 1, "task": "Turn on all equipment and check temperatures", "task_es": "Encender todo el equipo y revisar temperaturas", "task_tr": "Tüm ekipmanları açın ve sıcaklıkları kontrol edin", "category": "Equipment", "required": true},
    {"id": 2, "task": "Check gyro meat temperature and quality", "task_es": "Revisar temperatura y calidad de carne gyro", "task_tr": "Döner etinin sıcaklığını ve kalitesini kontrol edin", "category": "Food Safety", "required": true},
    {"id": 3, "task": "Prep vegetables for the day", "task_es": "Preparar vegetales para el día", "task_tr": "Gün için sebzeleri hazırlayın", "category": "Prep", "required": true},
    {"id": 4, "task": "Check rice and maintain hot holding temp", "task_es": "Revisar arroz y mantener temperatura caliente", "task_tr": "Pirinc kontrol edin ve sıcak tutma sıcaklığını koruyun", "category": "Food Safety", "required": true},
    {"id": 5, "task": "Heat up sauces and check consistency", "task_es": "Calentar salsas y revisar consistencia", "task_tr": "Sosları ısıtın ve kıvamını kontrol edin", "category": "Prep", "required": true},
    {"id": 6, "task": "Stock line with fresh ingredients", "task_es": "Reabastecer línea con ingredientes frescos", "task_tr": "Hat sevkiyatını taze malzemelerle doldurun", "category": "Prep", "required": true},
    {"id": 7, "task": "Check and fill all condiment containers", "task_es": "Revisar y llenar todos los recipientes de condimentos", "task_tr": "Tüm baharat kaplarını kontrol edin ve doldurun", "category": "Prep", "required": true},
    {"id": 8, "task": "Clean and sanitize all surfaces", "task_es": "Limpiar y sanitizar todas las superficies", "task_tr": "Tüm yüzeyleri temizleyin ve dezenfekte edin", "category": "Cleaning", "required": true}
  ]
}');

-- Insert sample worksheet records
INSERT INTO worksheets (employee_name, shift_type, department, language_used, worksheet_data, completion_percentage) VALUES
    ('Maria Garcia', 'AM', 'FOH', 'es', 
     '{"checklist_completed": [1,2,3,4,5,6,7,8,9,10,11], "issues_noted": [], "start_time": "06:00", "estimated_completion": "07:30"}', 
     35),
    ('Ahmed Yilmaz', 'Opening Line', 'BOH', 'tr', 
     '{"checklist_completed": [1,2,3,4], "issues_noted": ["Low on red onions"], "start_time": "05:30", "estimated_completion": "07:00"}', 
     50);

-- Insert sample missing items reports
INSERT INTO missing_items_reports (item_name, quantity_needed, reason, urgency, reported_by_name) VALUES
    ('Red Onions', '20 lbs', 'Running low for lunch prep', 'High', 'Ahmed Yilmaz'),
    ('Pita Bread', '3 bags', 'Only 1 bag left', 'Medium', 'Maria Garcia'),
    ('Napkins', '2 packs', 'Dispenser almost empty', 'Low', 'John Smith');
