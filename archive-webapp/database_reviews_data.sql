-- Real review data from reference files
-- Insert FOH PM Closing Review Template (from LINE RATINGS AM AND PM.md)

INSERT INTO review_templates (template_name, department, review_categories) VALUES
('FOH_PM_Close_Review', 'FOH', '{
  "categories": [
    {
      "name": "Dining Room & Floor Cleaning",
      "description": "Tables, chairs, booths, floors cleaned and organized",
      "weight": 15,
      "criteria": [
        "All dining tables, bar counters, stools wiped clean",
        "Booths inspected and cleaned (fabric/wood)",
        "Chairs tucked in and aligned neatly", 
        "Floors swept under tables and corners",
        "Trash collected and bags replaced"
      ]
    },
    {
      "name": "Expo & Water Station",
      "description": "Water station breakdown, ticket organization, supply stocking",
      "weight": 20,
      "criteria": [
        "Water station broken down and air drying",
        "Stabbed tickets purged, area wiped clean",
        "Printer paper stocked (1-2 rolls backup)",
        "Cabinet doors wiped clean",
        "Metal racks organized and straightened",
        "To-go ramekins refilled with sauces",
        "Spice shakers refilled and wiped",
        "Perishable sauces labeled/dated and refrigerated",
        "To-go supplies stocked to 100%"
      ]
    },
    {
      "name": "To-Go Station / Host Stand", 
      "description": "Host stand cleaning, kiosk maintenance, supply restocking",
      "weight": 15,
      "criteria": [
        "Host stand surfaces wiped down",
        "Kiosk screen and printer cleaned (Windex)",
        "Drawers and cabinets organized neatly",
        "To-go boxes, bags, silverware restocked to 100%",
        "Manager notified if supplies low in container"
      ]
    },
    {
      "name": "Cashier & Retail Station",
      "description": "Counter cleaning, baklava stocking, final guest check",
      "weight": 10,
      "criteria": [
        "All counters and surfaces wiped down",
        "Cabinet fronts cleaned",
        "Baklava restocked generously in retail area", 
        "Final guest-eye walkthrough completed"
      ]
    },
    {
      "name": "Coffee & Tea / Frozen Yogurt",
      "description": "Machine cleaning and proper shutdown procedures",
      "weight": 15,
      "criteria": [
        "All surfaces wiped, machines moved for underneath cleaning",
        "Turkish coffee pitcher rinsed and cleaned thoroughly",
        "Frozen yogurt machine switched off (physical switch)",
        "Keep Fresh switch remains ON (right side)"
      ]
    },
    {
      "name": "Bathrooms",
      "description": "Complete bathroom cleaning and supply restocking",
      "weight": 15,
      "criteria": [
        "Mirrors cleaned with Windex",
        "Sink basins and fixtures spotless",
        "Paper towels checked and refilled (1 full pack minimum)",
        "Toilet paper replaced if low",
        "Foaming soap refilled if below halfway",
        "Blue ledge/shelf dusted with damp cloth"
      ]
    },
    {
      "name": "Office & Final Notes",
      "description": "Office cleaning and communication setup",
      "weight": 10,
      "criteria": [
        "Office floors swept thoroughly",
        "Food/drink containers removed", 
        "Aprons hung neatly to avoid odors",
        "Trash bin under desk emptied",
        "Helpful notes left for morning crew",
        "Closing signatures completed"
      ]
    }
  ]
}'),

('BAR_Close_Review', 'FOH', '{
  "categories": [
    {
      "name": "Equipment Cleaning & Sanitizing",
      "description": "All bar equipment properly cleaned and sanitized",
      "weight": 30,
      "criteria": [
        "Floor mat sent to dishwasher",
        "All bar mats and burn well sanitized",
        "Soft serve machine wiped, tray sent to dish",
        "Rimmer emptied weekly and sent to dish",
        "Glass washer drain plug pulled, power switched off",
        "Glass washer catch tray cleaned and replaced",
        "Bar tools, jiggers, strainers sanitized",
        "Dump sink strainer emptied and sent to dish",
        "Dump sink and drains rinsed with hot water"
      ]
    },
    {
      "name": "Deep Cleaning Tasks",
      "description": "Walls, floors, and equipment deep cleaning",
      "weight": 25,
      "criteria": [
        "Bar top mats run through dishwasher, underneath sanitized",
        "Walls and under counters scrubbed with degreaser",
        "Floor drain cleaned with HD degreaser (gloves required)",
        "Grate sent to dishwasher if needed",
        "Beer tap tower, spouts, handles wiped",
        "Each tap plugged for the night",
        "Lemonade and ayran machine drip trays washed"
      ]
    },
    {
      "name": "Inventory & Organization",
      "description": "Bar inventory secured and organized",
      "weight": 20,
      "criteria": [
        "All opened bottles sealed and stored properly",
        "Beer kegs and CO2 levels checked",
        "Garnishes covered and refrigerated",
        "Bar tools organized in designated spots",
        "Cash drawer balanced and secured"
      ]
    },
    {
      "name": "Final Safety Check",
      "description": "Safety and security procedures completed",
      "weight": 25,
      "criteria": [
        "All electrical equipment turned off safely",
        "Water lines shut off properly",
        "Bar area locked and secured",
        "Emergency contacts accessible",
        "Closing checklist signed and dated"
      ]
    }
  ]
}');

-- Insert BOH Line Close Review Template (from LINE RATINGS AM AND PM.md)
INSERT INTO review_templates (template_name, department, review_categories) VALUES
('BOH_Line_Close_Review', 'BOH', '{
  "categories": [
    {
      "name": "Stations Stocked",
      "description": "All pars met, backups wrapped, no empty pans, tools staged",
      "weight": 15,
      "scoring_criteria": "All station pars met; backup items properly wrapped; no empty pans visible; tools clean and staged in home positions"
    },
    {
      "name": "Containers Changed & Clean", 
      "description": "Fresh, correct-size pans; no crusted edges; lids clean; inserts seated",
      "weight": 12,
      "scoring_criteria": "Fresh, correct-size pans in use; no crusted or dirty edges; lids clean and properly fitted; inserts seated properly"
    },
    {
      "name": "FIFO, Dating & Labeling",
      "description": "All items labeled/dated; oldest on top/front; no undated product",
      "weight": 15,
      "scoring_criteria": "All items properly labeled with dates; oldest items rotated to front/top; zero undated products present"
    },
    {
      "name": "Gyro Cooker",
      "description": "Trays emptied/washed; shields clean; machine powered off safely",
      "weight": 10,
      "scoring_criteria": "All trays emptied and sent to dishwasher; heat shields cleaned; machine powered off following safety protocol"
    },
    {
      "name": "Blanched Potatoes for AM",
      "description": "Required containers par present, labeled, and chilled",
      "weight": 8,
      "scoring_criteria": "Required container(s) of blanched potatoes present, properly labeled with date/time, and chilled to proper temperature"
    },
    {
      "name": "Fryer Oil Condition", 
      "description": "Oil skimmed/filtered; change schedule followed; proper levels",
      "weight": 10,
      "scoring_criteria": "Oil properly skimmed and filtered; oil change schedule adhered to; proper oil levels maintained"
    },
    {
      "name": "Surfaces & Tools",
      "description": "Stations wiped/sanitized; knives/tools clean and in home positions",
      "weight": 12,
      "scoring_criteria": "All surfaces wiped down and sanitized; knives and tools cleaned and stored in designated positions"
    },
    {
      "name": "Floors & Mats",
      "description": "Swept & mopped; mats washed/placed; no debris under equipment",
      "weight": 8,
      "scoring_criteria": "Floors thoroughly swept and mopped; floor mats cleaned and properly placed; no debris under equipment"
    },
    {
      "name": "Stainless, Hood & Walls",
      "description": "Fronts smudge-free; hood/walls cleaned per schedule & marked complete",
      "weight": 5,
      "scoring_criteria": "Stainless steel fronts smudge-free; hood and walls cleaned according to weekly schedule and marked as complete"
    },
    {
      "name": "To-Go, Bowls & Trays Stocked",
      "description": "Ample supply at open; no scrambling to restock during first hour",
      "weight": 3,
      "scoring_criteria": "Abundant supply of to-go containers, bowls, and trays ready; no need to restock during opening hour"
    },
    {
      "name": "Trash & Drains",
      "description": "Handwash trash emptied; drains bleached per schedule; no odors",
      "weight": 2,
      "scoring_criteria": "Hand wash station trash emptied; drains bleached according to schedule; no unpleasant odors present"
    }
  ],
  "scoring_instructions": "1 = Unacceptable • 2 = Needs Work • 3 = Meets Standard • 4 = Strong • 5 = Outstanding",
  "passing_criteria": "≥ 85% of possible points AND no scores of 1. Any score of 1 requires manager follow-up.",
  "photo_requirement": "SEND PHOTO OF COMPLETED DOCUMENT TO DEMETRI @ 916-513-3192"
}');

-- Insert BOH Morning Prep Review Template (from LEAD PREP WORKSHEET.md)
INSERT INTO review_templates (template_name, department, review_categories) VALUES
('BOH_Prep_Close_Review', 'BOH', '{
  "categories": [
    {
      "name": "Walk-In Refrigerator",
      "description": "Organization, temperature, cleanliness of walk-in cooler",
      "weight": 25,
      "scoring_criteria": "Walk-in properly organized with clear aisles; temperature logs current; no spills or debris; shelving clean"
    },
    {
      "name": "Labels and Dates | Organization", 
      "description": "All items properly labeled, dated, and organized using FIFO",
      "weight": 20,
      "scoring_criteria": "All prepared items labeled with contents and date; FIFO rotation followed; no undated items; organization logical"
    },
    {
      "name": "Outside Container Storage",
      "description": "External storage containers organized and accessible",
      "weight": 15,
      "scoring_criteria": "Storage containers properly organized; lids secured; easy access to needed items; inventory visible"
    },
    {
      "name": "Cleanliness and Organization of Prep Areas",
      "description": "All prep stations clean, sanitized, and ready for next shift",
      "weight": 20,
      "scoring_criteria": "Prep surfaces sanitized; cutting boards clean; utensils washed and stored; no cross-contamination risks"
    },
    {
      "name": "Prep List Made from Night Before",
      "description": "Clear prep list left for morning crew with priorities marked",
      "weight": 10,
      "scoring_criteria": "Detailed prep list created; urgent items marked with stars; quantities specified; assignments suggested"
    },
    {
      "name": "Notes from the Night Before",
      "description": "Important communication left for morning crew",
      "weight": 10,
      "scoring_criteria": "Clear notes about equipment issues, inventory concerns, or special instructions; contact info provided if needed"
    }
  ],
  "inventory_requirements": [
    {
      "category": "Produce",
      "items": ["Red onions", "Yellow onions", "Tomatoes", "Cucumbers", "Green peppers", "Lettuce", "Parsley", "Cilantro"],
      "requires_count": true
    },
    {
      "category": "Prepared Items",
      "items": ["Hummus", "Baba Ghanoush", "Tzatziki", "Iskender Sauce", "Rice with Chickpeas", "Falafel mix"],
      "requires_count": true,
      "requires_temp_check": true
    },
    {
      "category": "Storage Container State",
      "items": ["Cambro containers", "Hotel pans", "Sauce containers", "Prep containers"],
      "requires_condition_check": true
    }
  ]
}');

-- Insert sample close review data
INSERT INTO close_reviews (reviewer_name, department, shift_reviewed, review_date, review_data, overall_score, pass_fail_status, issues_flagged) VALUES
('Ahmed Yilmaz', 'BOH', 'PM Line Close', '2025-09-06', '{
  "scores": {
    "stations_stocked": 4,
    "containers_clean": 5, 
    "fifo_dating": 3,
    "gyro_cooker": 4,
    "blanched_potatoes": 5,
    "fryer_oil": 4,
    "surfaces_tools": 4,
    "floors_mats": 3,
    "stainless_hood": 4,
    "togo_supplies": 5,
    "trash_drains": 4
  },
  "notes": {
    "fifo_dating": "Found 2 containers without date labels in walk-in",
    "floors_mats": "Floor mats need better scrubbing - some grease buildup"
  },
  "total_possible": 55,
  "total_scored": 45
}', 4, 'Pass', ARRAY['FIFO labeling needs attention', 'Floor mats require deep clean']),

('Maria Garcia', 'FOH', 'PM Close', '2025-09-06', '{
  "scores": {
    "dining_floor": 5,
    "expo_water": 4,
    "togo_host": 5,
    "cashier_retail": 4,
    "coffee_yogurt": 4,
    "bathrooms": 5,
    "office_notes": 4
  },
  "notes": {
    "expo_water": "Water station dispensers needed extra scrubbing",
    "coffee_yogurt": "Frozen yogurt machine Keep Fresh switch was found OFF - turned back ON"
  },
  "issues_found": ["Keep Fresh switch was off", "Water dispensers had mineral buildup"]
}', 4, 'Pass', ARRAY['Keep Fresh switch was incorrectly turned off']),

('Carlos Martinez', 'BOH', 'Morning Prep Close', '2025-09-05', '{
  "scores": {
    "walkin_refrigerator": 3,
    "labels_organization": 2,
    "container_storage": 4,
    "prep_cleanliness": 4,
    "prep_list_made": 5,
    "notes_left": 5
  },
  "inventory_counts": {
    "red_onions": "8 lbs - need 20 lbs for weekend",
    "tomatoes": "15 lbs - adequate",
    "hummus": "1.5 containers - make 2 more batches",
    "iskender_sauce": "0.5 container - urgent need"
  },
  "container_conditions": {
    "cambros": "3 cracked lids need replacement",
    "hotel_pans": "good condition",
    "sauce_containers": "2 need deep cleaning"
  },
  "prep_list_created": "Red onion prep (urgent), Hummus x2 batches, Iskender sauce x1 batch, Falafel mix prep",
  "notes": "Low on red onions - order placed. Iskender sauce very low, need to make first thing AM."
}', 3, 'Needs Follow-up', ARRAY['Very low Iskender sauce', 'Red onions critically low', 'Multiple unlabeled containers']),

('John Smith', 'FOH', 'Bar Close', '2025-09-05', '{
  "scores": {
    "equipment_cleaning": 4,
    "deep_cleaning": 5,
    "inventory_organization": 4,
    "safety_check": 5
  },
  "notes": {
    "equipment_cleaning": "Glass washer catch tray was particularly dirty - gave extra attention",
    "deep_cleaning": "Used HD degreaser on floor drain as scheduled",
    "inventory_organization": "Found 2 bottles not properly sealed from day shift",
    "safety_check": "All equipment properly shut down, area secured"
  }
}', 4, 'Pass', ARRAY['Day shift left bottles unsealed']);
