#!/usr/bin/env python3
"""
Configuration management for HOA Survey Supabase connection
"""

import os
from pathlib import Path
from dotenv import load_dotenv

class Config:
    def __init__(self):
        # Load environment variables from .env file
        project_root = Path(__file__).parent.parent
        env_path = project_root / '.env'
        
        if env_path.exists():
            load_dotenv(env_path)
        else:
            print(f"⚠️  Warning: .env file not found at {env_path}")
            print("Please copy config.template.env to .env and fill in your Supabase credentials")
    
    @property
    def supabase_url(self):
        return os.getenv('SUPABASE_URL')
    
    @property
    def supabase_anon_key(self):
        return os.getenv('SUPABASE_ANON_KEY')
    
    @property
    def supabase_service_key(self):
        return os.getenv('SUPABASE_SERVICE_KEY')
    
    @property
    def database_password(self):
        return os.getenv('SUPABASE_DB_PASSWORD')
    
    @property
    def database_url(self):
        """Generate PostgreSQL connection URL"""
        url = self.supabase_url
        password = self.database_password
        
        if url and password:
            # Extract project reference from URL
            # URL format: https://abcdefghijklmnop.supabase.co
            project_ref = url.replace('https://', '').replace('.supabase.co', '')
            return f"postgresql://postgres:{password}@db.{project_ref}.supabase.co:5432/postgres"
        
        return os.getenv('SUPABASE_DB_URL')
    
    def validate(self):
        """Check if all required configuration is present"""
        missing = []
        
        if not self.supabase_url:
            missing.append('SUPABASE_URL')
        if not self.supabase_anon_key:
            missing.append('SUPABASE_ANON_KEY')
        if not self.database_password:
            missing.append('SUPABASE_DB_PASSWORD')
        
        if missing:
            print("❌ Missing required configuration:")
            for item in missing:
                print(f"   - {item}")
            print("\nPlease update your .env file with the missing values.")
            return False
        
        print("✅ Configuration validation passed")
        return True
    
    def print_status(self):
        """Print configuration status"""
        print("🔧 Supabase Configuration Status:")
        print(f"   URL: {'✅ Set' if self.supabase_url else '❌ Missing'}")
        print(f"   Anon Key: {'✅ Set' if self.supabase_anon_key else '❌ Missing'}")
        print(f"   Service Key: {'✅ Set' if self.supabase_service_key else '❌ Missing'}")
        print(f"   DB Password: {'✅ Set' if self.database_password else '❌ Missing'}")
        print(f"   DB URL: {'✅ Generated' if self.database_url else '❌ Cannot generate'}")

# Global config instance
config = Config()

if __name__ == "__main__":
    config.print_status()
    config.validate()