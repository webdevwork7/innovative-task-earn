# Development vs Production Mode

## Overview
Innovative Task Earn supports two operational modes with seamless switching capabilities.

## Current Mode: DEVELOPMENT
- **Sessions**: Memory-based (temporary, resets on server restart)
- **Database**: Optional (uses sample data when unavailable)
- **Tasks**: 5 pre-loaded sample tasks available
- **Fallbacks**: Enabled for all database operations
- **KYC Payments**: Still uses production Cashfree API for real testing

## Development Mode Benefits
✅ **No Database Required** - Works without Neon endpoint enabled  
✅ **Sample Data** - 5 realistic tasks across all categories  
✅ **Memory Sessions** - Instant startup, no database dependencies  
✅ **Error Handling** - Graceful fallbacks when database is unavailable  
✅ **Testing Friendly** - Perfect for development and demonstrations  

## Switching to Production Mode

### Method 1: Environment Variable
```bash
export APP_MODE=production
npm run dev
```

### Method 2: Production Script
```bash
./switch-to-production.sh
```

### Method 3: Manual Commands
```bash
# Set production mode
APP_MODE=production NODE_ENV=production tsx server/index.ts
```

## Production Mode Requirements
⚠️ **Required for Production Mode:**
- `DATABASE_URL` - Active Neon database endpoint
- `SESSION_SECRET` - Secure session secret key
- Database tables must exist (run `npm run db:push`)

## Production Mode Features
✅ **PostgreSQL Sessions** - Persistent, secure session storage  
✅ **Real Database** - All operations require working database  
✅ **No Fallbacks** - Errors when database unavailable (by design)  
✅ **Production Security** - Enhanced session management  
✅ **Real Data Only** - No sample/demo data available  

## Mode Detection
The system automatically detects and displays the current mode:
- Admin panel shows mode indicator
- Console logs indicate which session store is active
- Different error handling based on mode

## When to Use Each Mode

### Development Mode (Current)
- Initial setup and testing
- Demonstrating features without database
- Development when database is temporarily unavailable
- Quick prototyping and feature testing

### Production Mode
- Live deployment with real users
- When database is properly configured
- Production environment with real traffic
- After completing development testing

## Sample Data in Development Mode
When database is unavailable, development mode provides:
- 5 sample tasks across all categories
- Task creation/deletion simulation
- Empty user lists and analytics
- Memory-based sessions

This allows full platform testing without database dependencies.