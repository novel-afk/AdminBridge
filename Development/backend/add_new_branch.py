#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_bridge.settings')
django.setup()

from api.models import Branch

def add_new_branch():
    # Check if the branch already exists
    if Branch.objects.filter(name="Downtown Branch").exists():
        print("Downtown Branch already exists!")
        return
    
    try:
        # Create a new branch with all fields
        branch = Branch.objects.create(
            name="Downtown Branch",
            country="Canada",
            city="Toronto",
            address="123 Downtown Street, Toronto, ON M5V 2K1"
        )
        
        print(f"Added new branch: {branch.name}")
        print(f"Location: {branch.city}, {branch.country}")
        print(f"Address: {branch.address}")
        
    except Exception as e:
        print(f"Error creating branch: {e}")

if __name__ == "__main__":
    add_new_branch()
    
    # List all branches after adding
    print("\n===== ALL BRANCHES =====\n")
    branches = Branch.objects.all()
    print(f"Total branches: {len(branches)}")
    
    for i, branch in enumerate(branches, 1):
        print(f"{i}. {branch.name} - {branch.city}, {branch.country}")
        print(f"   Address: {branch.address}")
        print() 