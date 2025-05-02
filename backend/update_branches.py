#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import Branch

def update_branches():
    print("\n===== UPDATING BRANCHES =====\n")
    
    branches = Branch.objects.all()
    
    if not branches:
        print("No branches found in the system.")
        return
    
    print(f"Found {len(branches)} branches to update\n")
    
    # Update each branch
    for branch in branches:
        # Extract city from address if possible, or set default values
        if "Headquarters" in branch.name:
            branch.city = "New York"
            branch.country = "USA"
        else:
            branch.city = "Default City"
            branch.country = "Default Country"
        
        branch.save()
        print(f"Updated branch: {branch.name} ({branch.city}, {branch.country})")
    
    print("\nAll branches updated successfully!")

def list_branches():
    print("\n===== BRANCH LIST =====\n")
    
    branches = Branch.objects.all()
    
    if not branches:
        print("No branches found in the system.")
        return
    
    print(f"Total branches: {len(branches)}\n")
    
    for i, branch in enumerate(branches, 1):
        print(f"Branch #{i}")
        print(f"{'Name:':<15} {branch.name}")
        print(f"{'Country:':<15} {branch.country}")
        print(f"{'City:':<15} {branch.city}")
        print(f"{'Address:':<15} {branch.address}")
        print(f"{'Created At:':<15} {branch.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 40)

if __name__ == "__main__":
    update_branches()
    print("\n")
    list_branches() 