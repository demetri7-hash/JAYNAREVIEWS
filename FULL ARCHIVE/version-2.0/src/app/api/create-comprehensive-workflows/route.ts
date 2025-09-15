import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('🔍 Creating COMPREHENSIVE Jayna Gyro workflows with every single reference file item...')

    // Get first manager for workflow assignment, create one if none exists
    let { data: manager } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'manager')
      .limit(1)
      .single()

    if (!manager) {
      console.log('No manager found, creating default manager...')
      const { data: newManager, error: managerError } = await supabase
        .from('employees')
        .insert({
          name: 'System Manager',
          email: 'manager@jayna.local',
          role: 'manager',
          department: 'management',
          phone: '555-0000',
          hire_date: new Date().toISOString().split('T')[0],
          is_active: true
        })
        .select()
        .single()
      
      if (managerError) {
        throw new Error(`Failed to create manager: ${managerError.message}`)
      }
      manager = newManager
    }    // 1. FOH OPENING CHECKLIST - Complete detailed version
    const fohOpeningChecklist = {
      name: 'FOH Opening Checklist - Complete',
      description: 'Complete front of house opening procedures with every item from reference file',
      department: 'FOH',
      category: 'Opening'
    }

    const fohOpeningTasks = [
      // DINING ROOM & PATIO SETUP
      'Remove chairs and re-wipe all tables',
      'Wipe table sides, legs, chairs, and banquette sofas', 
      'Don\'t forget the top wood ledge of sofas (especially outside)',
      'Ensure chairs are tucked in and tables are aligned and evenly spaced',
      'Place lamps on tables, hide charging cables',
      '"Salt to the Street" -- salt shakers toward parking lot, pepper toward kitchen',
      'Wipe and dry menus --- remove stickiness',
      'Turn on all dining room lights',
      'Unlock doors and flip both signs to "OPEN"',
      'Check and refill all rollups (napkin + silverware)',
      'Wipe patio tables and barstools with fresh towel',
      'Raise blinds',
      'Windex front doors',
      'Wipe down front of registers',

      // CLEANLINESS & WALKTHROUGH
      'Sweep perimeter and remove cobwebs from: Pergola area',
      'Sweep perimeter and remove cobwebs from: Back wall',
      'Sweep perimeter and remove cobwebs from: Between sofas',
      'Sweep perimeter and remove cobwebs from: Under all tables and planter boxes (inside & facing parking lot)',
      'Review previous night\'s closing checklist for any notes',

      // BATHROOM CHECKS EVERY MORNING [DAILY!]
      'Clean toilets thoroughly: bowl, lid, seat, under seat, and floor around and behind',
      'Windex mirrors',
      'Dust top of hand dryer',
      'Dust soap dispenser',
      'Dust lip around perimeter of bathroom wall',
      'Scrub and clean sink + remove mold from drain',
      'Dry and polish all surfaces',
      'Restock toilet paper',
      'Restock paper towels',
      'Restock toilet seat covers',

      // EXPO STATION & SAUCE PREP
      'Fill 1 sanitation tub at expo: Fill ¾ with sanitizer',
      'Add 2 new microfiber towels to sanitation tub',
      'One towel must be hanging half in/half out (health code requirement)',
      'Expo towels: 1 damp towel for wiping plate edges',
      'Expo towels: 1 dry towel for expo counter and surfaces',
      'Sauce backups: Tzatziki -- 1-2 full (2oz)',
      'Sauce backups: Spicy Aioli -- 1-2 full (2oz)',
      'Sauce backups: Lemon Dressing -- 1-2 full (3oz)',
      'Squeeze bottles for ramekin plating: 1 full Tzatziki',
      'Squeeze bottles for ramekin plating: 1 full Spicy Aioli',
      'Squeeze bottles for ramekin plating: 1 full Lemon Dressing',

      // KITCHEN SUPPORT & RESTOCK
      'Bring out sauces and mark any finished',
      'Stock kitchen with plates and bowls from drying rack',
      'Keep replenishing throughout shift',
      'Restock to-go bowls & pita boxes above handwashing sink --- must appear full and complete',
      'Restock baklava at retail shelves',
      'Restock baklava at POS',

      // WATER STATION --- "ABUNDANT" SPA VIBE
      'Cut 2 English cucumbers into thick ribbons using mandolin slicer',
      'Place cucumbers in Water Station 1 --- fresh, bountiful look',
      'Cut 4 lemons into thick wheels',
      'Place lemons in Water Station 2 --- fancy, abundant, spa-like vibe',
      'Fill both dispensers with ice, fruit, and water --- should look luxurious and inviting',

      // BAR FRUIT PREP
      '4 lemons -- perfect wheels only (continuous rind)',
      '2 lemons -- thick wedges (easy to squeeze)',
      '1 lime -- perfect wheels (for cocktails & cherry soda)',
      '1 lime -- thick wedges',
      '1 orange -- thick slices (sangria, orange soda, cocktails)',

      // BAR SETUP & STOCK
      'Fill ice well to overflowing',
      'Fill garnish container with ice + water for fruit',
      'Bring out and check: Juices & simple syrups --- full, clean, labeled',
      'Signature cocktail containers: Day-use = full, clean, labeled',
      'Signature cocktail containers: Backup gallons = prep more if low, clean before refilling',
      'Stock all 3 bar caddies with straws',
      'Stock all 3 bar caddies with beverage napkins',
      'Stock all 3 bar caddies with black plastic spoons for froyo',

      // FROYO MACHINE
      'SWITCH BUTTON TO ON',
      'VERIFY KEEP FRESH HAS REMAINED ON OVERNIGHT',
      'PRESS THE AUTO BUTTON FOR THE LEFT SIDE ONLY',
      '1 batch ready to serve inside machine',
      '1 labeled backup in wine fridge (prep if missing)',

      // WINES BY THE GLASS
      'Check all wines: Whites & bubbles in fridge',
      'Check all wines: Reds on bar',
      'Confirm open dates',
      'Taste if questionable',
      'Dump old wine into camber for kitchen',
      'Keep selection fresh and labeled'
    ]

    // 2. FOH CLOSING LIST - Complete detailed version
    const fohClosingChecklist = {
      name: 'FOH Closing List - Complete',
      description: 'Complete front of house closing procedures with every item from reference file',
      department: 'FOH',
      category: 'Closing'
    }

    const fohClosingTasks = [
      // DINING ROOM & FLOOR CLEANING
      'WIPE ALL DINING TABLES, BAR COUNTERS, BAR STOOLS, AND BANQUETTE SOFAS (CHECK FOR FOOD, DUST, AND DEBRIS)',
      'INSPECT BOOTHS (FABRIC AND WOOD); VACUUM OR WIPE IF CRUMBS OR SMUDGES ARE VISIBLE',
      'ENSURE ALL CHAIRS ARE TUCKED IN AND ALIGNED NEATLY',
      'SWEEP UNDER ALL TABLES, BAR AREA, AND EXPO COUNTER',
      'DOUBLE CHECK CORNERS AND UNDERNEATH BANQUETTES FOR TRASH OR BUILDUP',
      'COLLECT TRASH FROM BAR, EXPO/WATER STATION, BOTH BATHROOMS, AND OFFICE',
      'REPLACE ALL TRASH BAGS WITH CLEAN LINERS',
      'ROLL AS MANY NAPKIN SETS AS POSSIBLE USING ALL AVAILABLE FORKS & KNIVES',

      // EXPO & WATER STATION
      'BREAK DOWN WATER STATION, CLEAN DISPENSERS THOROUGHLY, AND LEAVE OPEN TO AIR DRY',
      'PURGE STABBED TICKETS, WIPE PRINTER, SCREEN, AND SURROUNDING AREA',
      'ENSURE 1-2 ROLLS OF BACKUP PRINTER PAPER ARE STOCKED',
      'WIPE CABINET DOORS FROM SOLARIUM TO COKE FRIDGE POS',
      'ORGANIZE AND STRAIGHTEN METAL RACKS ABOVE EXPO (VISIBLE TO GUESTS)',
      'REMOVE ANY VISIBLE DEBRIS UNDER EXPO OR BACKUP CABINETS',
      'REFILL TO-GO RAMEKINS WITH SAUCES (TZATZIKI, SPICY AIOLI, LEMON)',
      'REFILL DRY SPICE SHAKERS AND WIPE DOWN',
      'LABEL/DATE ALL PERISHABLE SAUCES AND MOVE TO WALK-IN FRIDGE',
      'STOCK TO-GO CONTAINERS, LIDS, RAMEKINS, BAGS, CUPS TO 100% CAPACITY',
      'CHECK ABOVE HAND SINK AND AT EXPO COUNTER FOR SUPPLY LEVELS',
      'RESTOCK ALL BEVERAGES IN THE COKE FRIDGE',

      // TO-GO STATION / HOST STAND
      'WIPE DOWN TOP AND FRONT-FACING SURFACES OF HOST STAND',
      'DUST AND WINDEX THE KIOSK SCREEN AND PRINTER (MOVE TO GET UNDER AND BEHIND)',
      'ORGANIZE DRAWERS AND CABINETS NEATLY',
      'RESTOCK TO-GO BOXES, BAGS, AND SILVERWARE PACKETS TO 100%',
      'NOTIFY MANAGER IF TO-GO ITEMS (INCLUDING BAGS) ARE LOW IN THE SHIPPING CONTAINER',

      // CASHIER & RETAIL STATION
      'WIPE DOWN ALL COUNTERS, SURFACES, AND CABINET FRONTS',
      'RESTOCK BAKLAVA IN RETAIL AREA GENEROUSLY',
      'DO A FINAL GUEST-EYE CHECK: WALK AROUND AND WIPE ANYTHING UNCLEAN OR CLUTTERED',

      // COFFEE & TEA / FROZEN YOGURT
      'WIPE ALL SURFACES, ESPECIALLY TOPS AND UNDERNEATH OF COFFEE AND HOT WATER MACHINES (MOVE THEM)',
      'RINSE AND CLEAN TURKISH COFFEE MACHINE PITCHER THOROUGHLY',
      'SWITCH FROZEN YOGURT MACHINE OFF USING THE PHYSICAL SWITCH UNDERNEATH THE LEFT SIDE LIP',

      // BATHROOMS
      'CLEAN MIRRORS WITH WINDEX',
      'WIPE SINK BASINS AND SILVER FIXTURES UNTIL SPOTLESS',
      'CHECK AND REFILL PAPER TOWELS -- STOCK 1 FULL PACK MINIMUM',
      'REPLACE TOILET PAPER IF LOW',
      'REFILL FOAMING SOAP IF BELOW HALFWAY',
      'DUST THE BLUE LEDGE/SHELF AROUND BATHROOM WALLS WITH A DAMP CLOTH',

      // OFFICE
      'SWEEP FLOORS THOROUGHLY',
      'REMOVE ANY FOOD OR DRINK CONTAINERS',
      'HANG ALL APRONS NEATLY TO AVOID ODORS',
      'EMPTY TRASH BIN UNDER DEMETRI\'S DESK'
    ]

    // 3. FOH TRANSITION CHECKLIST - Complete detailed version
    const fohTransitionChecklist = {
      name: 'FOH Transition Checklist - Complete',
      description: 'Complete front of house transition procedures with every item from reference file',
      department: 'FOH',
      category: 'Transition'
    }

    const fohTransitionTasks = [
      // RETAIL & DISPLAY
      'PREPARE AND PACKAGE 3-PIECE BAKLAVA RETAIL BOXES (MORE PISTACHIO & WALNUT, FEWER CHOCOLATE)',
      'CLEAN TURKISH DELIGHT CASE & TRAYS; REPLACE NEATLY WITH FRESH PIECES',
      'CUT TURKISH DELIGHTS TO SIZE AND ARRANGE NEATLY, PUSHED FORWARD FOR DISPLAY',

      // STOCKING & UTENSILS
      'REFILL TO-GO SAUCES & BRING OUT FULL BOTTLES',
      'STOCK TO-GO BOXES, LIDS, BAGS & SILVERWARE',
      'BRING OUT PLATES, BOWLS, SILVERWARE, BUFF SPOONS/KNIVES & RAMEKINS',
      'PREPARE ROLL-UPS (USE ALL CLEAN SILVERWARE)',
      'ENSURE PLENTY OF CLEAN GLASSES ARE AVAILABLE',
      'GET FRESH RAG FOR PM EXPO; DISCARD USED RAGS',

      // DINING ROOM & STATIONS
      'WIPE TABLES, TUCK IN CHAIRS, WIPE POS & HOST STAND FROM GUEST SIDE',
      'REFRESH ALL SANITATION TUBS AND NEW RAGS',
      'STOCK NAPKINS, TOOTHPICKS, SWEETENERS, STRAWS AT WATER STATION. EMPTY TRASH IF NEEDED',
      'REFILL WATER JUGS, ICE FIRST, REFRESH GLASSES. WIPE WATER AS NEEDED',
      'CHECK FRO-YO TOPPINGS & RESTOCK. CLEAN BOTTLES, WIPE TRAY AS NEEDED',
      'CLEAR STAFF DRINK/FOOD AREA. THROW ANYTHING AWAY THAT ISNT CLAIMED',

      // BATHROOMS
      'WIPE SINKS, MIRRORS; RESET BATHROOMS. TOILET CLEANLINESS FROM TOP DOWN, AND GROUND AROUND',
      'REFILL PAPER TOWELS, TOILET PAPER, SOAP',
      'EMPTY BATHROOM TRASH',

      // BEVERAGES & PREP
      'RESTOCK DRINKS FRIDGE (SODAS, WATERS, WINE, BEER)',
      'PREP FRUIT FOR NIGHT, LOTS OF LEMON WHEELS. REFRESH THE ICE WATER IN THE ORGANIZER',
      'TOP OFF SANGRIA, LEMONADE & AYRAN AS NEEDED, OR LEAVE NOTE FOR NEXT SHIFT CREW',
      'WIPE & DRY MENUS AND TABLE NUMBER CARDS, INCLUDING THE METAL POLE AND BASE'
    ]

    // 4. BAR CLOSING - Complete detailed version
    const barClosingChecklist = {
      name: 'Bar Closing Duties - Complete',
      description: 'Complete bar closing procedures with every item from reference file',
      department: 'FOH',
      category: 'Bar Closing'
    }

    const barClosingTasks = [
      // CLEAN & SANITIZE EQUIPMENT
      'SEND FLOOR MAT TO DISHWASHER',
      'SANITIZE AND CLEAN ALL BAR MATS AND THE BURN WELL',
      'WIPE DOWN SOFT SERVE MACHINE; SEND TRAY TO DISH AND WIPE ENTIRE MACHINE EXTERIOR',
      'EMPTY RIMMER ONCE A WEEK AND SEND TO DISH',
      'PULL DRAIN PLUG IN GLASS WASHER AND SWITCH OFF POWER',
      'PULL OUT CATCH TRAY IN GLASS WASHER, CLEAN IT, AND REPLACE',
      'WIPE DOWN AND SANITIZE BAR TOOLS, JIGGERS, STRAINERS, AND MUDDLERS',
      'EMPTY DUMP SINK STRAINER AND SEND TO DISH',
      'RINSE DUMP SINK AND DRAINS WITH HOT WATER',
      'RUN ALL BAR TOP MATS THROUGH DISHWASHER AND CLEAN UNDERNEATH WITH SANITIZER',
      'SCRUB THE WALLS AND UNDER COUNTERS AROUND THE DUMP SINK WITH SOAPY WATER OR DEGREASER',
      'USE HD DEGREASER (WITH GLOVES) TO CLEAN FLOOR DRAIN; SEND GRATE TO DISHWASHER IF NEEDED',
      'WIPE DOWN BEER TAP TOWER, SPOUTS, AND HANDLES. PLUG EACH TAP FOR THE NIGHT',
      'REMOVE AND WASH 3 DRIP TRAYS FROM LEMONADE AND AYRAN MACHINES; LEAVE UPSIDE DOWN TO DRY',
      'CLEAN CITRUS HOLDER THOROUGHLY AND DISCARD ANY UNUSED CITRUS (DO NOT REUSE)',

      // WIPE & ORGANIZE SURFACES
      'WIPE DOWN ALL FRONT-FACING FRIDGE DOORS, STAINLESS STEEL SURFACES, AND COUNTERS',
      'FROYO TOPPING BAR- RESTOCK/REFILL TOPPINGS, NEW LIDS FOR SAUCE, RINSE OUTSIDE OF BOTTLES, WASH MAT, WIPE DOWN ENTIRE CABINET INCLUDING INSIDE AND BEHIND! SHOULD NOT BE STICKY ANYWHERE',
      'SHINE STAINLESS STEEL INSIDE AND OUT, INCLUDING CABINET UNDER POS COMPUTERS',
      'WIPE DOWN LIQUOR BOTTLES USED THAT DAY (OR ALL BOTTLES) TO PREVENT STICKINESS AND FRUIT FLIES',
      'FACE ALL LIQUOR BOTTLES FORWARD AND ALIGN NEATLY IN ROWS WITH POUR SPOUTS COVERED',
      'WIPE AND SANITIZE ALL COUNTER SPACE, ESPECIALLY AROUND DROP TRAYS AND WALLS ON EITHER SIDE',
      'ORGANIZE CABINET UNDER POS COMPUTERS. NO CHEMICALS MAY BE STORED HERE -- SANITIZE AND SHINE',

      // STOCK & LABEL
      'LABEL, DATE, AND REFRIGERATE ALL JUICES, PUREES, AND OPEN INGREDIENTS',
      'DATE, CAP, AND PUMP ALL OPENED WINES',
      'RESTOCK ALL WINES, SPIRITS, BEERS, AND NON-ALCOHOLIC BEVERAGES',
      'ENSURE BACKUPS ARE READY FOR SODAS, JUICES, AND WINES',
      'PLASTIC WRAP OR PLUG ALL DRAFT TAPS OVERNIGHT',
      'RETURN ALL BAR CHEMICALS TO PROPER HOMES (HOST STAND, EXPO CABINET, DISH PIT RACK, OR MOP SINK ONLY)',
      'POUR SALTS OR DRINK RIM POWDERS BACK INTO STORAGE CONTAINERS UNLESS CONTAMINATED OR MOIST',

      // GLASSWARE & DISH STATION
      'SEND ALL METAL INSERTS TO DISH',
      'ENSURE ALL GLASSWARE HAS BEEN RUN AND NO DIRTY GLASSES REMAIN',
      'STORE CLEAN BAR TOOLS AND GLASSWARE PROPERLY',

      // FLOOR & TRASH
      'SWEEP AND MOP THE BAR FLOOR THOROUGHLY, INCLUDING UNDER MATS AND CORNERS',
      'EMPTY BAR TRASH AND REPLACE LINER',
      'TAKE OUT GLASS RECYCLING IN ORANGE SHARPS BUCKET, RINSE BUCKET IN DISH PIT. NOTHING STICKY LEFT',

      // POS & GUEST-FACING AREAS
      'REFILL REPLIES IN BASKET AT POS COUNTER',
      'STRAIGHTEN AND WIPE ALL MENUS, INCLUDING COCKTAIL AND WINE GUIDES',
      'REFILL BLACK COCKTAIL NAPKINS AND 7.75" STRAWS. DO NOT OVERFILL 5.5" STRAWS'
    ]

    // 5. AM PREP DAILY INVENTORY - Complete detailed version
    const amPrepInventoryChecklist = {
      name: 'AM Prep Daily Inventory - Complete',
      description: 'Complete morning prep and inventory tracking with every item from reference file',
      department: 'BOH',
      category: 'Inventory'
    }

    const amPrepInventoryTasks = [
      'Record quantity of Beef & Lamb Gyro in freezer',
      'Record quantity of Chicken Gyro in freezer', 
      'Record quantity of Roasted chickpeas cans',
      'Record quantity of FALAFEL',
      'Record quantity of Tzatziki',
      'Record quantity of Spicy aioli',
      'Record quantity of Hummus',
      'Record quantity of Lemon vinaigrette',
      'Record quantity of Baba ghanoush',
      'Record quantity of Chopped Romaine',
      'Record quantity of Tomatoes DICED',
      'Record quantity of TOMATOES WHOLE',
      'Record quantity of Cucumbers CUT',
      'Record quantity of CUCUMBERS WHOLE',
      'Record quantity of Red onions CUT',
      'Record quantity of RED ONIONS WHOLE',
      'Record quantity of Bell peppers CUT',
      'Record quantity of BELL PEPPERS WHOLE',
      'Record quantity of Arugula & lettuce mix',
      'Record quantity of Rice bags',
      'Record quantity of Potatoes (prepped)',
      'Record quantity of Potatoes (whole)',
      'Record quantity of Pita bread cases',
      'Record quantity of Lavash wraps cases',
      'Record quantity of Gluten-free tortillas packs',
      'Record quantity of Pepperoncini',
      'Record quantity of Bread crumbs',
      'Record quantity of Balsamic glaze bottles',
      'Record quantity of Feta cheese',
      'Record quantity of Pine nuts / currants / raisins',
      'Record quantity of Baklava Regular',
      'Record quantity of BAKLAVA CHOCOLATE',
      'Record quantity of DUBAI CHOCOLATE',
      'Record quantity of Rice pudding portions',
      'Update quantity remaining for all items at end of shift',
      'Mark any URGENT 911 items that need immediate attention'
    ]

    // 6. CLEANING OPENING LIST - Complete detailed version
    const cleaningOpeningChecklist = {
      name: 'Cleaning Opening List - Complete',
      description: 'Complete cleaning and opening procedures with every item from reference file',
      department: 'BOH',
      category: 'Cleaning'
    }

    const cleaningOpeningTasks = [
      // FLOORS
      'SWEEP ALL FLOORS: BEHIND THE BAR COUNTER/EXPO',
      'SWEEP ALL FLOORS: MAIN DINING ROOM',
      'SWEEP ALL FLOORS: SMALL DINING ROOM',
      'SWEEP ALL FLOORS: OFFICE',
      'SWEEP ALL FLOORS: BATHROOMS',
      'MOP ALL FLOORS WITH A FRESH MOP, HOT WATER AND FLOOR CLEANER OR BLEACH: ALWAYS START 1ST THE MAIN DINING ROOM',
      'MOP ALL FLOORS: 2ND SMALL DINING ROOM',
      'MOP ALL FLOORS: 3RD BEHIND THE LONG BAR COUNTER/EXPO',
      'MOP ALL FLOORS: 4TH OFFICE',
      'MOP ALL FLOORS: LAST IS ALWAYS BATHROOMS',
      'DUMP DIRTY WATER IN PLANTER AREA OUTSIDE',
      'STORE YELLOW MOP BUCKET WITH MOP BEHIND THE BACKDOOR, HIDDEN AS MUCH AS POSSIBLE',
      'TAKE DOWN ALL CHAIRS',
      'USE THE BLOWER TO CLEAN ENTIRE PARKING LOT',
      'CHECK ALL PLANTERS AROUND THE PROPERTY FOR TRASH AND REMOVE AS NEEDED',
      'CHECK FOR COBWEBS IN THE FRONT OF THE BUILDING AS WELL AS AROUND THE OUTSIDE THE PLANTER BOXES IN THE SIDE PATIO SEATING AREA, USE A BROOM TO REMOVE THEM',

      // BATHROOMS
      'AFTER SWEEPING AND MOPPING, USE TOILET CLEANER AND TOILET BRUSH TO SCRUB THE TOILET',
      'WITH GLOVES, USE PURPLE HD DEGREASER TO CLEAN THE ENTIRE TOILET FROM TOP TO BOTTOM, WIPING ALL THE PORCELAIN',
      'SPRAY AND WIPE THE FLOOR AROUND THE WHOLE TOILET, INCLUDING THE BACK AS WELL',
      'MAKE SURE TO WIPE THE TOILET BRUSH HOLDER AS WELL AS THE HANDLE, THE DETAILS MATTER',
      'USE WINDEX TO WIPE DOWN THE MIRRORS WITH WHITE/GREEN STRIPE MICROFIBER TOWEL TO AVOID LINT',
      'WIPE DOWN HAND DRYER MACHINE',
      'WIPE DOWN SOAP DISPENSER',
      'WIPE SINK AND RINSE OUT'
    ]

    // 7. LEAD PREP WORKSHEET - Complete detailed version  
    const leadPrepWorksheetChecklist = {
      name: 'Lead Prep Worksheet - Complete',
      description: 'Complete lead prep daily tasks and inventory management with every item from reference file',
      department: 'BOH',
      category: 'Prep Management'
    }

    const leadPrepWorksheetTasks = [
      'Complete initial walk-through of kitchen and storage areas',
      'Rate previous shift performance: WALK-IN REFRIGERATOR',
      'Rate previous shift performance: LABELS AND DATES | ORGANIZATION',
      'Rate previous shift performance: OUTSIDE CONTAINER STORAGE',
      'Rate previous shift performance: CLEANLINESS AND ORGANIZATION OF PREP AREAS',
      'Check if night crew created a prep list',
      'Compare prep list to current inventory',
      'List out prep tasks for the day and assign to Lead Prep Cook or Prep Cook/Dishwasher',
      'Mark urgent items with a star ★',
      'Record all items prepped today and quantities',
      'Note any items not finished',
      'Check quantities of essential items after prep: Arugula & lettuce mix',
      'Check quantities: Tomatoes',
      'Check quantities: Cucumbers (regular/English)',
      'Check quantities: Red onions',
      'Check quantities: Bell peppers',
      'Check quantities: Chickpeas',
      'Check quantities: Beef Gyro',
      'Check quantities: Chicken Gyro',
      'Check quantities: Tzatziki',
      'Check quantities: Feta cheese',
      'Check quantities: Pita bread & lavash wraps',
      'Check quantities: Gluten-free tortillas',
      'Check quantities: Pepperoncini',
      'Check quantities: Hummus',
      'Check quantities: Lemon Vinaigrette',
      'Check quantities: Baba Ghanoush',
      'Mark status as OK, Low, or Urgent for each item'
    ]

    // 8. DRY GOODS INVENTORY PACKAGING - Complete detailed version
    const dryGoodsInventoryChecklist = {
      name: 'Dry Goods Inventory Packaging - Complete',
      description: 'Complete dry goods and packaging inventory with every item from reference file',
      department: 'BOH',
      category: 'Dry Goods'
    }

    const dryGoodsInventoryTasks = [
      'Count BOWLS - record quantity and determine if order needed',
      'Count GYRO BOWL LIDS - record quantity and determine if order needed',
      'Count PITA BOXES - record quantity and determine if order needed',
      'Count FRY BOXES - record quantity and determine if order needed',
      'Count CHICKEN BOXES - record quantity and determine if order needed',
      'Count WHITE SOUP CUPS (12 OZ) - record quantity and determine if order needed',
      'Count SOUP CUP LIDS - record quantity and determine if order needed',
      'Count RAMEKINS 1.5 OZ - record quantity and determine if order needed',
      'Count RAMEKIN LIDS 1.5 OZ - record quantity and determine if order needed',
      'Count RAMEKINS 2 OZ - record quantity and determine if order needed',
      'Count RAMEKIN LIDS 2 OZ - record quantity and determine if order needed',
      'Count RAMEKINS 3 OZ - record quantity and determine if order needed',
      'Count RAMEKIN LIDS 3 OZ - record quantity and determine if order needed',
      'Count INTERFOLD NAPKINS - record quantity and determine if order needed',
      'Count TO GO UTENSIL KITS - record quantity and determine if order needed',
      'Count CARRY BAGS -- SMALL - record quantity and determine if order needed',
      'Count CARRY BAGS -- LARGE - record quantity and determine if order needed',
      'Count DRINK HOLDERS - record quantity and determine if order needed',
      'Count BAMBOO PICKS - record quantity and determine if order needed',
      'Count PATTY PAPER - record quantity and determine if order needed',
      'Count SNACK BAGS (ZIP) - record quantity and determine if order needed',
      'Count DELI PAPER - record quantity and determine if order needed',
      'Count JAYNA BLUE TRAY LINERS - record quantity and determine if order needed',
      'Count TO-GO CUPS 16 OZ - record quantity and determine if order needed',
      'Count TO-GO CUP LIDS 16 OZ - record quantity and determine if order needed',
      'Count FRO-YO CUPS SM/LG - record quantity and determine if order needed',
      'Count BAKLAVA CONTAINERS - record quantity and determine if order needed',
      'Count GREEK SALAD CONTAINERS - record quantity and determine if order needed',
      'Count ISKENDER CONTAINERS - record quantity and determine if order needed',
      'Count ISKENDER LIDS - record quantity and determine if order needed',
      'Count CATERING TRAYS -- HALF PANS - record quantity and determine if order needed',
      'Count CATERING TRAYS -- FULL PANS - record quantity and determine if order needed',
      'Count CATERING PAN LIDS -- HALF - record quantity and determine if order needed',
      'Count CATERING PAN LIDS -- FULL - record quantity and determine if order needed',
      'Count CATERING DOME TRAYS - record quantity and determine if order needed',
      'Count CATERING DOME LIDS - record quantity and determine if order needed',
      'Count GLOVES (ALL SIZES) - record quantity and determine if order needed',
      'Count PEPPERONCINI - record quantity and determine if order needed',
      'Count BREAD CRUMBS - record quantity and determine if order needed',
      'Count BALSAMIC GLAZE - record quantity and determine if order needed',
      'Count GLUTEN-FREE TORTILLAS - record quantity and determine if order needed'
    ]

    // 9. MISSING INGREDIENTS REPORT - Complete detailed version
    const missingIngredientsChecklist = {
      name: 'Missing Ingredients Report - Complete',
      description: 'Complete missing ingredients and supplies reporting system',
      department: 'BOH',
      category: 'Emergency Protocol'
    }

    const missingIngredientsTasks = [
      'Document item name that is missing or low',
      'Record quantity needed',
      'Note reason for shortage',
      'Determine urgency level: LOW/MED/HIGH',
      'Report to Kitchen Manager/Order Manager immediately',
      'TEXT TO 916-513-3192 with photo of report',
      'Follow up to confirm item has been fixed',
      'Update report status when resolved'
    ]

    // 10. LINE RATINGS AM AND PM - Complete detailed version
    const lineRatingsChecklist = {
      name: 'Line Ratings AM and PM - Complete',
      description: 'Complete line performance rating system for opening and closing crews',
      department: 'BOH',
      category: 'Performance Review'
    }

    const lineRatingsTasks = [
      // AM Rating of Closers
      'Rate Stations Stocked (Appetizer/Salad/Meat/Fry/Grill): All pars met; backups wrapped; no empty pans; tools clean and staged',
      'Rate Containers Changed & Clean: Fresh, correct-size pans; no crusted edges; lids clean; inserts seated properly',
      'Rate FIFO, Dating & Labeling: All items labeled/dated; oldest on top/front; no undated product',
      'Rate Gyro Cooker: Trays emptied/washed; shields clean; machine powered off safely',
      'Rate Blanched Potatoes for AM: Required container(s) par present, labeled, and chilled',
      'Rate Fryer Oil Condition: Oil skimmed/filtered; change schedule followed; proper levels',
      'Rate Surfaces & Tools: Stations wiped/sanitized; knives/tools clean and in home positions',
      'Rate Floors & Mats: Swept & mopped; mats washed/placed; no debris under equipment',
      'Rate Stainless, Hood & Walls: Fronts smudge-free; hood/walls cleaned per weekly cadence & marked complete',
      'Rate To-Go, Bowls & Trays Stocked: Ample supply at open; no scrambling to restock during first hour',
      'Rate Trash & Drains: Handwash trash emptied; drains bleached per schedule; no odors',
      'SEND PHOTO OF THIS DOCUMENT TO DEMETRI @ 916-513-3192',

      // PM Rating of Openers/Transition
      'Rate Appetizer/Salad Station Refilled: PM pars met; clean containers; backups wrapped; utensils clean',
      'Rate Main Fridge Refilled: Greens and veggies rotated; sauces topped & dated; tools staged',
      'Rate Meat/Gyro Station Clean & Stocked: Cutting area clean; meat/garbanzo pans topped; knives sharp & clean',
      'Rate Rice & Potatoes: Fresh rice timed for PM; blanched potatoes at par and properly chilled',
      'Rate Surfaces & Organization: Stations wiped/sanitized; clutter-free; partials consolidated',
      'Rate Pita & To-Go: Pita counts set; to-go boxes/bowls/ramekins stocked; blue bowls/trays topped',
      'Rate Gyro Readiness: New gyros loaded if needed; drip trays not overfull; exterior wiped',
      'Rate Floors & Spot-Mopping: No debris; safe, dry work zones; mats placed correctly',
      'Rate Handoff Notes Quality: Clear 86 risks, low stock, pending prep; equipment issues flagged',
      'SEND PHOTO OF THIS DOCUMENT TO DEMETRI @ 916-513-3192'
    ]

    const allChecklists = [
      { checklist: fohOpeningChecklist, tasks: fohOpeningTasks },
      { checklist: fohClosingChecklist, tasks: fohClosingTasks },
      { checklist: fohTransitionChecklist, tasks: fohTransitionTasks },
      { checklist: barClosingChecklist, tasks: barClosingTasks },
      { checklist: amPrepInventoryChecklist, tasks: amPrepInventoryTasks },
      { checklist: cleaningOpeningChecklist, tasks: cleaningOpeningTasks },
      { checklist: leadPrepWorksheetChecklist, tasks: leadPrepWorksheetTasks },
      { checklist: dryGoodsInventoryChecklist, tasks: dryGoodsInventoryTasks },
      { checklist: missingIngredientsChecklist, tasks: missingIngredientsTasks },
      { checklist: lineRatingsChecklist, tasks: lineRatingsTasks }
    ]

    let totalWorkflows = 0
    let totalTasks = 0

    for (const { checklist, tasks } of allChecklists) {
      // Create checklist
      const { data: newChecklist, error: checklistError } = await supabase
        .from('checklists')
        .insert(checklist)
        .select()
        .single()

      if (checklistError) {
        console.error('Error creating checklist:', checklistError)
        continue
      }

      // Create workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert({
          checklist_id: newChecklist.id,
          assigned_to: manager.id,
          status: 'pending',
          name: `${checklist.name} - ${new Date().toLocaleDateString()}`
        })
        .select()
        .single()

      if (workflowError) {
        console.error('Error creating workflow:', workflowError)
        continue
      }

      // Create task instances
      const taskInstances = tasks.map((task, index) => ({
        workflow_id: workflow.id,
        title: task,
        description: `Complete: ${task}`,
        status: 'pending',
        order_index: index + 1
      }))

      const { error: tasksError } = await supabase
        .from('task_instances')
        .insert(taskInstances)

      if (tasksError) {
        console.error('Error creating tasks:', tasksError)
        continue
      }

      totalWorkflows++
      totalTasks += tasks.length
      
      console.log(`✅ Created workflow: ${checklist.name} with ${tasks.length} tasks`)
    }

    console.log(`🎉 COMPREHENSIVE WORKFLOW CREATION COMPLETE!`)
    console.log(`📊 Total: ${totalWorkflows} workflows with ${totalTasks} detailed tasks`)
    console.log(`🍴 Every single item from reference files has been captured exactly as written`)

    return Response.json({
      success: true,
      message: 'COMPREHENSIVE Jayna Gyro workflows created with every reference file item',
      workflows_created: totalWorkflows,
      total_tasks: totalTasks,
      details: allChecklists.map(({checklist, tasks}) => ({
        name: checklist.name,
        department: checklist.department,
        task_count: tasks.length
      }))
    })

  } catch (error) {
    console.error('❌ Error creating comprehensive workflows:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}