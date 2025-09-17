# 🛠️ TOAST & Homebase API Integration - Technical Implementation

## 🎯 High-Impact Integration Priorities

### 1. 🔥 **Smart Prep Lists** (Highest ROI)
**Problem**: Manual prep lists lead to over/under preparation
**Solution**: TOAST sales data + inventory levels = intelligent prep recommendations

```typescript
// /src/services/toast-integration.ts
interface ToastAPIResponse {
  menuItems: {
    id: string
    name: string
    soldToday: number
    inventoryLevel: number
    projectedSales: number
  }[]
  salesTrends: {
    hourlyData: number[]
    weeklyPattern: number[]
  }
}

async function generateSmartPrepList(date: Date) {
  const toastData = await fetchToastSalesData(date)
  const inventoryLevels = await fetchToastInventory()
  
  const prepTasks = toastData.menuItems
    .filter(item => item.projectedSales > item.inventoryLevel * 0.7)
    .map(item => ({
      title: `Prep ${item.name}`,
      quantity: calculatePrepAmount(item),
      priority: item.inventoryLevel < 0.3 ? 'urgent' : 'normal',
      department: ['PREP', 'BOH'],
      estimatedTime: getEstimatedPrepTime(item.name)
    }))
    
  return createBulkTasks(prepTasks)
}
```

### 2. ⏰ **Intelligent Task Assignment** (High Impact)
**Problem**: Tasks assigned without considering who's actually working
**Solution**: Homebase schedule + employee skills = perfect task matching

```typescript
// /src/services/homebase-integration.ts
interface HomebaseEmployee {
  id: string
  name: string
  position: string
  skills: string[]
  scheduledShift: {
    start: Date
    end: Date
    department: Department
  }
  currentWorkload: number
}

async function assignTasksIntelligently(tasks: Task[]) {
  const currentStaff = await fetchHomebaseSchedule(new Date())
  
  return tasks.map(task => {
    const bestMatch = findBestEmployee(task, currentStaff)
    return {
      ...task,
      assignedTo: bestMatch.id,
      estimatedCompletion: calculateCompletionTime(task, bestMatch),
      priority: adjustPriorityByWorkload(task, bestMatch.currentWorkload)
    }
  })
}

function findBestEmployee(task: Task, staff: HomebaseEmployee[]) {
  return staff
    .filter(emp => emp.scheduledShift.department === task.department)
    .filter(emp => emp.skills.some(skill => task.requiredSkills?.includes(skill)))
    .sort((a, b) => a.currentWorkload - b.currentWorkload)[0]
}
```

### 3. 📊 **Real-Time Operations Dashboard** (Management Value)
**Problem**: Managers can't see full restaurant picture in real-time
**Solution**: Combined live data from all three systems

```typescript
// /src/components/UnifiedDashboard.tsx
interface UnifiedDashboardData {
  liveMetrics: {
    currentSales: number
    ordersPerHour: number
    averageTicket: number
    staffOnDuty: number
    tasksCompleted: number
    tasksOverdue: number
  }
  alerts: {
    type: 'sales_surge' | 'staff_shortage' | 'task_overdue' | 'inventory_low'
    message: string
    suggestedAction: string
  }[]
  recommendations: {
    staffing: string[]
    tasks: string[]
    inventory: string[]
  }
}

const UnifiedDashboard = () => {
  const [dashboardData, setDashboardData] = useState<UnifiedDashboardData>()
  
  useEffect(() => {
    const updateDashboard = async () => {
      const [toastData, homebaseData, passData] = await Promise.all([
        fetchToastRealTimeData(),
        fetchHomebaseCurrentStaff(),
        fetchPassTaskStatus()
      ])
      
      setDashboardData(generateUnifiedInsights(toastData, homebaseData, passData))
    }
    
    // Update every 30 seconds
    const interval = setInterval(updateDashboard, 30000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="unified-dashboard">
      <LiveMetricsGrid metrics={dashboardData?.liveMetrics} />
      <AlertsPanel alerts={dashboardData?.alerts} />
      <RecommendationsWidget recommendations={dashboardData?.recommendations} />
    </div>
  )
}
```

---

## 🔌 API Integration Architecture

### TOAST API Integration

```typescript
// /src/lib/toast-api.ts
class ToastAPIClient {
  private baseURL = 'https://api.toasttab.com'
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  // Sales Data
  async getSalesData(date: Date) {
    return this.makeRequest(`/reporting/v1/sales`, {
      businessDate: date.toISOString().split('T')[0]
    })
  }
  
  // Menu Items & Inventory
  async getMenuItems() {
    return this.makeRequest('/menus/v2/menus')
  }
  
  // Order Data
  async getOrders(startTime: Date, endTime: Date) {
    return this.makeRequest('/orders/v2/orders', {
      startDate: startTime.toISOString(),
      endDate: endTime.toISOString()
    })
  }
  
  // Inventory Levels
  async getInventoryLevels() {
    return this.makeRequest('/stock/v1/inventory')
  }
  
  private async makeRequest(endpoint: string, params?: any) {
    const url = new URL(this.baseURL + endpoint)
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      )
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Toast-Restaurant-External-ID': process.env.TOAST_RESTAURANT_ID!
      }
    })
    
    return response.json()
  }
}
```

### Homebase API Integration

```typescript
// /src/lib/homebase-api.ts
class HomebaseAPIClient {
  private baseURL = 'https://api.joinhomebase.com'
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  // Employee Schedules
  async getSchedule(date: Date) {
    return this.makeRequest('/v1/schedules', {
      start_date: date.toISOString().split('T')[0],
      end_date: date.toISOString().split('T')[0]
    })
  }
  
  // Employee Details
  async getEmployees() {
    return this.makeRequest('/v1/employees')
  }
  
  // Time Clock Data
  async getTimeClockEntries(date: Date) {
    return this.makeRequest('/v1/time_clock_entries', {
      date: date.toISOString().split('T')[0]
    })
  }
  
  // Labor Costs
  async getLaborCosts(startDate: Date, endDate: Date) {
    return this.makeRequest('/v1/labor_costs', {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    })
  }
  
  private async makeRequest(endpoint: string, params?: any) {
    const url = new URL(this.baseURL + endpoint)
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      )
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.json()
  }
}
```

---

## 📊 Database Schema Extensions

```sql
-- Add integration tracking tables
CREATE TABLE toast_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'sales', 'inventory', 'menu'
  sync_timestamp TIMESTAMP DEFAULT NOW(),
  records_processed INTEGER,
  success BOOLEAN,
  error_message TEXT
);

CREATE TABLE homebase_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'schedule', 'employees', 'timeclock'
  sync_timestamp TIMESTAMP DEFAULT NOW(),
  records_processed INTEGER,
  success BOOLEAN,
  error_message TEXT
);

-- Enhanced tasks table for integration data
ALTER TABLE tasks ADD COLUMN toast_menu_item_id TEXT;
ALTER TABLE tasks ADD COLUMN homebase_employee_id TEXT;
ALTER TABLE tasks ADD COLUMN estimated_duration INTEGER; -- minutes
ALTER TABLE tasks ADD COLUMN labor_cost_estimate DECIMAL(10,2);
ALTER TABLE tasks ADD COLUMN auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN generation_source TEXT; -- 'toast_sales', 'homebase_schedule', 'manual'

-- Intelligent insights table
CREATE TABLE operation_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_date DATE NOT NULL,
  insight_type TEXT NOT NULL, -- 'prep_recommendation', 'staffing_alert', 'efficiency_tip'
  title TEXT NOT NULL,
  description TEXT,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  action_taken BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Automated Workflows

### Morning Prep Automation
```typescript
// /src/services/morning-automation.ts
export async function runMorningAutomation() {
  console.log('🌅 Starting morning automation...')
  
  // 1. Get yesterday's sales and today's projections
  const salesData = await toast.getSalesProjection(new Date())
  
  // 2. Get today's scheduled staff
  const staffSchedule = await homebase.getTodaysSchedule()
  
  // 3. Generate intelligent prep list
  const prepTasks = await generatePrepTasks(salesData, staffSchedule)
  
  // 4. Assign tasks to scheduled prep cooks
  const assignedTasks = await assignTasksToStaff(prepTasks, staffSchedule)
  
  // 5. Create tasks in THE PASS
  const createdTasks = await createTasksBulk(assignedTasks)
  
  console.log(`✅ Created ${createdTasks.length} morning prep tasks`)
  
  return createdTasks
}

// Schedule to run at 5 AM daily
export function scheduleMorningAutomation() {
  // Using node-cron or similar
  cron.schedule('0 5 * * *', runMorningAutomation)
}
```

### Rush Period Response
```typescript
// /src/services/rush-detection.ts
export class RushPeriodDetector {
  private static ORDERS_PER_HOUR_THRESHOLD = 50
  
  static async checkForRushPeriod() {
    const currentHourOrders = await toast.getOrdersLastHour()
    
    if (currentHourOrders.length > this.ORDERS_PER_HOUR_THRESHOLD) {
      await this.handleRushPeriod(currentHourOrders.length)
    }
  }
  
  private static async handleRushPeriod(orderCount: number) {
    console.log(`🔥 Rush period detected: ${orderCount} orders/hour`)
    
    // Get current staff
    const currentStaff = await homebase.getCurrentStaff()
    
    // Create rush-specific tasks
    const rushTasks = [
      {
        title: 'Extra Cleaning - Rush Period',
        department: ['CLEAN'],
        priority: 'high',
        autoAssign: true
      },
      {
        title: 'Restock Prep Items',
        department: ['PREP'],
        priority: 'urgent',
        autoAssign: true
      },
      {
        title: 'Check Inventory Levels',
        department: ['BOH'],
        priority: 'high',
        autoAssign: true
      }
    ]
    
    // Auto-assign to available staff
    const assignedTasks = await autoAssignTasks(rushTasks, currentStaff)
    
    // Send manager notification
    await sendManagerAlert('Rush period detected', `${orderCount} orders/hour. ${assignedTasks.length} tasks auto-created.`)
  }
}
```

---

## 🚀 Implementation Timeline

### Week 1-2: Foundation
- [ ] Set up TOAST API credentials and test connection
- [ ] Set up Homebase API credentials and test connection
- [ ] Create basic API client classes
- [ ] Implement data fetching for sales and schedule data

### Week 3-4: Core Features
- [ ] Build smart prep list generation
- [ ] Implement intelligent task assignment
- [ ] Create unified dashboard components
- [ ] Add database schema extensions

### Week 5-6: Automation
- [ ] Implement morning automation workflow
- [ ] Build rush period detection system
- [ ] Create automated task generation rules
- [ ] Add error handling and monitoring

### Week 7-8: Polish & Testing
- [ ] Comprehensive testing with real restaurant data
- [ ] Performance optimization
- [ ] User interface refinements
- [ ] Documentation and training materials

---

## 💰 Expected ROI

### Month 1
- **Time Savings**: 2-3 hours daily on prep planning
- **Accuracy**: 90%+ accurate prep quantities
- **Staff Efficiency**: 15% improvement in task completion

### Month 3
- **Food Waste**: 20% reduction through better prep planning
- **Labor Optimization**: 10% more efficient staff utilization
- **Manager Productivity**: 50% less time on manual scheduling

### Month 6
- **Overall Efficiency**: 25% improvement in operational efficiency
- **Cost Savings**: $2,000-3,000 monthly through reduced waste and optimized labor
- **Compliance**: Near 100% completion of safety and cleaning protocols

---

This integration will transform THE PASS from a task management system into a **complete restaurant intelligence platform**! 🎉

*Ready to revolutionize restaurant operations with data-driven automation!*