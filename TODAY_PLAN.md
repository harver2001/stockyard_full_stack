# ShareTracker: One-Day Implementation Plan (January 18, 2026)

## 🎯 Focus: Database Migration + Basic Portfolio Management
**Goal**: Complete PostgreSQL migration and implement core portfolio tracking functionality. This builds directly on your existing auth/stock services and provides immediate value.

**Estimated Time**: 4-6 hours
**Prerequisites**: Docker, PostgreSQL knowledge, current codebase running

---

## 📋 Task Breakdown

### Task 1: PostgreSQL Migration (1-2 hours)
**Objective**: Replace SQLite with PostgreSQL in docker-compose and update auth service models.

#### Steps:
1. **Update docker-compose.yml**
   - Add PostgreSQL service
   - Update auth service environment variables
   - Add database volume for persistence

2. **Modify auth_service/models.py**
   - Change SQLAlchemy URI to PostgreSQL
   - Update any SQLite-specific code
   - Test database connection

3. **Update auth_service/app.py**
   - Ensure proper database initialization
   - Add PostgreSQL-specific configurations

4. **Test Migration**
   - Run `docker-compose up` to verify PostgreSQL starts
   - Test user registration/login to ensure data persists

**Files to Edit**:
- `docker-compose.yml`
- `backend/auth_service/models.py`
- `backend/auth_service/app.py`

---

### Task 2: Portfolio Database Schema (1 hour)
**Objective**: Create portfolio and holdings tables in PostgreSQL.

#### Steps:
1. **Create Migration Script**
   - Add portfolio tables to models.py
   - Define relationships with User model

2. **Update Models**
   - Add Portfolio and Holding models
   - Include proper foreign keys and constraints

3. **Initialize Database**
   - Run migration to create tables
   - Verify schema in PostgreSQL

**Database Schema**:
```sql
-- Add to models.py
class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Holding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    symbol = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Numeric(10,4), nullable=False)
    avg_cost = db.Column(db.Numeric(10,2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
```

---

### Task 3: Portfolio API Endpoints (1-2 hours)
**Objective**: Add CRUD endpoints for portfolio management in auth service.

#### Steps:
1. **Create Portfolio Routes**
   - GET /portfolios - List user portfolios
   - POST /portfolios - Create new portfolio
   - POST /portfolios/{id}/holdings - Add stock to portfolio
   - GET /portfolios/{id}/holdings - Get portfolio holdings

2. **Add Business Logic**
   - Calculate current value using stock service
   - Compute P&L for each holding
   - Validate stock symbols

3. **Update OpenAPI Documentation**
   - Add portfolio endpoints to openapi.yaml

**Example Endpoint**:
```python
@auth_bp.route('/portfolios', methods=['GET'])
@limiter.limit("10 per minute")
def get_portfolios():
    # Get user portfolios with holdings and current values
    # Integrate with stock service for real-time prices
```

---

### Task 4: Frontend Portfolio Integration (1 hour)
**Objective**: Add basic portfolio view to React dashboard.

#### Steps:
1. **Create Portfolio Component**
   - Add portfolio list/table to StockDashboard
   - Show holdings with current prices and P&L

2. **Update API Service**
   - Add portfolio API calls to services/api.js
   - Handle authentication for portfolio endpoints

3. **Basic UI Enhancements**
   - Add portfolio tab/section
   - Simple table showing holdings

**Files to Edit**:
- `frontend/reactjs/stock-auth-tester/src/components/StockDashboard.js`
- `frontend/reactjs/stock-auth-tester/src/services/api.js`

---

## ✅ Success Criteria
- [ ] PostgreSQL running in docker-compose
- [ ] User registration/login works with PostgreSQL
- [ ] Portfolio tables created and accessible
- [ ] Basic portfolio API endpoints functional
- [ ] Frontend can display user portfolios
- [ ] All services start without errors

## 🚨 Potential Issues & Solutions
- **PostgreSQL Connection**: Ensure correct connection string format
- **Migration Errors**: Backup SQLite data if needed (though starting fresh is fine)
- **API Integration**: Stock service calls may need adjustment for portfolio calculations
- **Frontend Auth**: Ensure portfolio endpoints use proper JWT tokens

## 📈 Next Steps (Tomorrow)
- Add transaction history
- Implement buy/sell functionality
- Add portfolio performance charts
- Integrate with stock recommendations

## 💡 Tips for Today
- Start with database migration first - it's foundational
- Test each step incrementally
- Use Postman/curl to test API endpoints
- Commit changes frequently to avoid losing work
- If stuck on PostgreSQL, consider using SQLite temporarily and migrate later

**Remember**: Focus on getting the core portfolio functionality working end-to-end rather than perfecting every detail. You can refine the UI and add features tomorrow!</content>
<parameter name="filePath">/home/harsh/ShareTracker/TODAY_PLAN.md