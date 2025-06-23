#!/usr/bin/env python3
"""
Test Supabase connection and verify database setup
"""

import sys
import asyncio
from pathlib import Path

# Add scripts directory to path
sys.path.append(str(Path(__file__).parent))

from config import config

def test_config():
    """Test configuration"""
    print("🧪 Testing Configuration...")
    config.print_status()
    return config.validate()

def test_supabase_connection():
    """Test Supabase client connection"""
    print("\n🔌 Testing Supabase Client Connection...")
    
    try:
        from supabase import create_client
        
        if not config.supabase_url or not config.supabase_anon_key:
            print("❌ Cannot test connection - missing URL or API key")
            return False
        
        # Create Supabase client
        supabase = create_client(config.supabase_url, config.supabase_anon_key)
        
        # Test basic connection by getting table info
        result = supabase.table('responses').select('response_id').limit(1).execute()
        
        if result.data:
            print(f"✅ Supabase connection successful! Found {len(result.data)} test record(s)")
            return True
        else:
            print("⚠️  Connection successful but no data found - check if data was imported")
            return True
            
    except ImportError:
        print("❌ Supabase Python client not installed")
        print("   Install with: pip install supabase")
        return False
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_database_connection():
    """Test direct PostgreSQL connection"""
    print("\n🗄️  Testing Direct Database Connection...")
    
    try:
        import psycopg2
        
        if not config.database_url:
            print("❌ Cannot test database connection - missing database URL")
            return False
        
        # Test connection
        conn = psycopg2.connect(config.database_url)
        cursor = conn.cursor()
        
        # Test query
        cursor.execute("SELECT COUNT(*) FROM responses;")
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"✅ Database connection successful! Found {count} responses in database")
        return True
        
    except ImportError:
        print("❌ psycopg2 not installed (optional for direct database access)")
        print("   Install with: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_data_integrity():
    """Test that our data was imported correctly"""
    print("\n📊 Testing Data Integrity...")
    
    try:
        from supabase import create_client
        
        if not config.supabase_url or not config.supabase_anon_key:
            print("❌ Cannot test data - missing credentials")
            return False
        
        supabase = create_client(config.supabase_url, config.supabase_anon_key)
        
        # Test each table
        tables = [
            'responses',
            'q1_q2_preference_rating', 
            'q3_opt_out_reasons',
            'q4_landscaping_issues',
            'q5_q6_construction_group',
            'q7_interest_areas',
            'q8_equipment_ownership',
            'q9_dues_preference',
            'q10_biggest_concern',
            'q11_cost_reduction',
            'q12_involvement'
        ]
        
        results = {}
        for table in tables:
            try:
                result = supabase.table(table).select('response_id').execute()
                results[table] = len(result.data)
            except Exception as e:
                results[table] = f"Error: {e}"
        
        print("📋 Table row counts:")
        all_good = True
        for table, count in results.items():
            if isinstance(count, int):
                status = "✅" if count == 113 else "⚠️"
                if count != 113:
                    all_good = False
                print(f"   {table}: {status} {count} rows")
            else:
                print(f"   {table}: ❌ {count}")
                all_good = False
        
        if all_good:
            print("✅ All tables have expected 113 rows!")
        else:
            print("⚠️  Some tables have unexpected row counts")
        
        return all_good
        
    except Exception as e:
        print(f"❌ Data integrity test failed: {e}")
        return False

def run_sample_query():
    """Run a sample analysis query"""
    print("\n🔍 Running Sample Analysis Query...")
    
    try:
        from supabase import create_client
        
        if not config.supabase_url or not config.supabase_anon_key:
            print("❌ Cannot run query - missing credentials")
            return False
        
        supabase = create_client(config.supabase_url, config.supabase_anon_key)
        
        # Sample query: Get service rating distribution
        result = supabase.rpc('get_service_rating_stats').execute()
        
        if result.data:
            print("📈 Service Rating Distribution:")
            for row in result.data:
                print(f"   {row.get('rating', 'Unknown')}: {row.get('count', 0)} responses")
        else:
            # Fallback to basic query if RPC doesn't exist
            result = supabase.table('q1_q2_preference_rating').select('q2_service_rating').execute()
            ratings = {}
            for row in result.data:
                rating = row.get('q2_service_rating', 'Unknown')
                ratings[rating] = ratings.get(rating, 0) + 1
            
            print("📈 Service Rating Distribution (basic query):")
            for rating, count in sorted(ratings.items()):
                print(f"   {rating}: {count} responses")
        
        return True
        
    except Exception as e:
        print(f"❌ Sample query failed: {e}")
        print("   This is normal if the database views haven't been created yet")
        return False

def main():
    """Run all connection tests"""
    print("🚀 HOA Survey - Supabase Connection Test")
    print("=" * 50)
    
    tests = [
        ("Configuration", test_config),
        ("Supabase Connection", test_supabase_connection),
        ("Database Connection", test_database_connection),
        ("Data Integrity", test_data_integrity),
        ("Sample Query", run_sample_query)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except KeyboardInterrupt:
            print("\n🛑 Tests interrupted by user")
            break
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results[test_name] = False
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All tests passed! Your Supabase setup is working correctly.")
        print("   You can now use the web portal and analysis scripts.")
    else:
        print("\n🔧 Some tests failed. Please check your configuration and setup.")
        print("   See the detailed output above for specific issues.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)