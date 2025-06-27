# 🏠 HOA Community Management Platform

A comprehensive property-centric platform for managing HOA operations, resident relationships, and community engagement. **Live and operational** with 232 properties and complete community oversight.

## 🎯 **Current Status: COMPREHENSIVE PLATFORM**

✅ **Live Platform**: Full property management system  
✅ **232 Properties**: Complete property directory with residents  
✅ **Interactive Mapping**: Mapbox integration with zone visualization  
✅ **Multi-Survey Support**: Expandable beyond landscaping surveys  
✅ **Advanced Analytics**: Zone-based insights and filtering  
✅ **Resident Management**: Property relationships and contact tracking

## 🏘️ **Community Overview**

- **🏠 232 Total Properties** - Complete HOA coverage
- **📊 113 Landscaping Surveys** - Initial survey foundation
- **🗺️ 3 HOA Zones** - Organized management structure
- **📍 100% Geocoded** - All properties mapped with coordinates
- **👥 Resident Tracking** - Property ownership and rental relationships

## 🚀 **Platform Features**

### **🏘️ Property Management**
- **Property Directory**: Comprehensive filterable list of all 232 properties
- **Property Details**: Complete property information with residents and survey history
- **Resident Management**: Track property relationships (owners, renters, family members)
- **Advanced Filtering**: Zone, street, survey participation, and resident status filters
- **Bulk Operations**: Multi-property communication and survey assignment

### **🗺️ Interactive Mapping**
- **Zone Visualization**: Mapbox integration with zone-colored property markers
- **Property Locations**: All 232 properties geocoded with precise coordinates
- **Zone Management**: Interactive zone analytics and property distribution
- **Map Controls**: Toggle between map and list views with zone filtering

### **📊 Multi-Survey Analytics**
- **Survey Integration**: Landscaping survey responses linked to properties
- **Cross-Survey Insights**: Compare responses across different survey types
- **Zone Analytics**: Survey participation and satisfaction by HOA zone
- **Export Capabilities**: Filtered data exports for board presentations

### **👥 Resident Engagement**
- **Contact Management**: Resident contact information with preferred methods
- **Communication Tracking**: Log interactions and follow-up requirements
- **Survey Assignment**: Target surveys to specific properties or zones
- **Review Workflows**: Quality control for survey data and resident information

### **📈 Executive Dashboard**
- **Neighborhood Overview**: Community-wide health metrics and trends
- **Zone Comparison**: Performance analytics across all HOA zones
- **Activity Tracking**: Recent changes and administrative actions
- **Key Metrics**: Property occupancy, survey participation, and issue resolution

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL) with property-centric schema
- **Mapping**: Mapbox GL JS with geocoding API
- **Charts**: Recharts for interactive visualizations
- **Authentication**: Supabase Auth with admin-only access
- **Storage**: Supabase Storage for PDF documents
- **Hosting**: Vercel with automatic deployments
- **Domain**: Custom domain via Porkbun DNS

## 📁 **Project Structure**

```
├── web-portal/         # Next.js platform (production ready)
│   ├── app/           # Next.js 14 app router - 6-tab navigation
│   │   ├── neighborhood/    # Executive dashboard
│   │   ├── zones/          # Zone management with mapping
│   │   ├── properties/     # Property directory and details
│   │   ├── people/         # Resident management
│   │   ├── responses/      # Survey analysis (original feature)
│   │   └── page.tsx        # Main dashboard
│   ├── components/    # React components (PropertyMap, ZoneAnalytics, etc.)
│   ├── scripts/       # Utility scripts (geocoding, data import)
│   └── lib/           # Utilities and Supabase client
├── data-archive/       # Historical survey data
│   ├── pdf/           # Original survey PDFs
│   └── property-data/ # Master property lists and owner records
├── database/          # SQL schema for property-centric platform
└── README.md          # This file
```

## 🔧 **Development Setup**

**Main Commands** (run from `/web-portal/`):
```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run type-check             # Validate TypeScript
npm run lint                   # Check code quality
node scripts/geocode-properties.js  # Geocode property addresses
```

**Environment Setup**: 
```bash
cp .env.example .env
# Configure: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

**Key Documentation**: See `web-portal/CLAUDE.md` for complete technical architecture and development guide.

## 📋 **Documentation**

- **`web-portal/CLAUDE.md`** - Complete technical architecture and API documentation
- **`NEXT_STEPS.md`** - Development roadmap with current priorities
- **`web-portal/README.md`** - Deployment and development guide

## 🔄 **Platform Workflow**

1. **Property Management**: Comprehensive directory of all 232 HOA properties
2. **Resident Tracking**: Property ownership and rental relationship management
3. **Survey Integration**: Multi-survey platform with property-linked responses
4. **Zone Analytics**: Geographic insights and zone-based management
5. **Communication**: Resident engagement and follow-up workflows
6. **Executive Oversight**: Neighborhood dashboard for board decision-making

## 🎯 **System Status**

- **Operational**: Full property management platform with 232 properties
- **Performance**: Interactive mapping and advanced filtering optimized
- **Scalability**: Multi-survey architecture ready for expansion
- **Security**: Admin-only access with comprehensive property data protection
- **Cost**: ~$15/year (including Mapbox usage for geocoding/mapping)
- **Maintenance**: Automated deployments with state persistence

---

**Status**: ✅ **Comprehensive Platform**  
**Last Updated**: January 2025 - Property-centric transformation complete  
**Next Phase**: Multi-survey import wizard and resident portal foundation