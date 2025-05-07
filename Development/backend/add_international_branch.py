#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import Branch

def add_international_branch():
    # Check if the branch already exists
    if Branch.objects.filter(name="London Office").exists():
        print("London Office already exists!")
        return
    
    try:
        # Create a new international branch
        branch = Branch.objects.create(
            name="London Office",
            country="United Kingdom",
            city="London",
            address="45 Oxford Street, London W1D 1BW"
        )
        
        print(f"Added new international branch: {branch.name}")
        print(f"Location: {branch.city}, {branch.country}")
        print(f"Address: {branch.address}")
        
    except Exception as e:
        print(f"Error creating branch: {e}")

if __name__ == "__main__":
    add_international_branch()
    
    # List all branches after adding
    print("\n===== ALL BRANCHES =====\n")
    branches = Branch.objects.all().order_by('country', 'city')
    print(f"Total branches: {len(branches)}")
    
    for i, branch in enumerate(branches, 1):
        print(f"{i}. {branch.name}")
        print(f"   Location: {branch.city}, {branch.country}")
        print(f"   Address: {branch.address}")
        print() 