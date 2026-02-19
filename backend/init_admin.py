#!/usr/bin/env python3
"""
Script to initialize the database with an admin user.
Run this once to create the first admin account.
"""

import sys
from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

def create_admin_user():
    db = SessionLocal()
    
    # Check if admin already exists
    admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
    if admin:
        print("✓ Admin user already exists: admin@example.com")
        db.close()
        return
    
    # Create admin user
    admin_user = models.User(
        full_name="Admin User",
        email="admin@example.com",
        hashed_password=get_password_hash("password"),  # Change this password!
        role=models.UserRole.Admin
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print("✓ Admin user created successfully!")
    print(f"  Email: admin@example.com")
    print(f"  Password: password")
    print("\n⚠️  IMPORTANT: Change this password in production!")
    
    db.close()

if __name__ == "__main__":
    try:
        create_admin_user()
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
