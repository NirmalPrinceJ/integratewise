#!/usr/bin/env python3
"""
Content Migration Tool - Notion/Box to Obsidian Vault

Migrates content from Notion exports and Box directories to an Obsidian vault
with stable IDs, normalized schemas, and front-matter metadata.

Usage:
    python migrate_content.py \
        --notion-export /path/to/notion/export \
        --box-dir /path/to/box/files \
        --vault /path/to/obsidian/vault \
        --mapping-json /path/to/mapping.json

Features:
    - Stable ID generation using SHA-256 hash
    - Front-matter metadata for tracking
    - Normalized file structure
    - Mapping JSON for source tracking
    - Support for markdown and other file types
"""

import os
import re
import json
import shutil
import argparse
import hashlib
import datetime
from pathlib import Path
from typing import Dict, List, Optional


def slugify(name: str) -> str:
    """
    Convert a name to a URL-friendly slug.
    
    Args:
        name: Original filename or title
        
    Returns:
        Slugified name safe for filesystem
    """
    # Remove special characters except spaces, hyphens, underscores
    s = re.sub(r"[^a-zA-Z0-9\-_\s]", "", name)
    s = s.strip().lower()
    # Replace spaces with hyphens
    s = re.sub(r"\s+", "-", s)
    return s or "untitled"


def stable_id(value: str) -> str:
    """
    Generate a stable 16-character ID from input string.
    
    Args:
        value: Input string (usually file path)
        
    Returns:
        16-character hexadecimal hash
    """
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def write_markdown(dst: Path, title: str, body: str, meta: Dict[str, str]) -> None:
    """
    Write a markdown file with YAML front-matter.
    
    Args:
        dst: Destination file path
        title: Document title
        body: Document body content
        meta: Metadata dictionary for front-matter
    """
    dst.parent.mkdir(parents=True, exist_ok=True)
    
    # Build YAML front-matter
    frontmatter_lines = ["---"]
    for key, value in meta.items():
        # Escape quotes in values
        escaped_value = str(value).replace('"', '\\"')
        frontmatter_lines.append(f'{key}: "{escaped_value}"')
    frontmatter_lines.append("---")
    frontmatter = "\n".join(frontmatter_lines)
    
    # Write file
    with open(dst, "w", encoding="utf-8") as f:
        f.write(f"{frontmatter}\n\n# {title}\n\n{body}\n")


def categorize_content(title: str, content: str) -> str:
    """
    Attempt to categorize content based on title and content keywords.
    
    Args:
        title: Document title
        content: Document content
        
    Returns:
        Category name (folder)
    """
    title_lower = title.lower()
    content_lower = content.lower()
    
    # Define category keywords
    categories = {
        "Credentials": ["password", "credential", "api key", "token", "secret"],
        "Compliance": ["compliance", "gdpr", "privacy", "legal", "policy"],
        "Finance": ["invoice", "payment", "revenue", "expense", "budget", "financial"],
        "Branding": ["brand", "logo", "style guide", "color", "typography"],
        "SaaS": ["saas", "subscription", "mrr", "churn", "retention"],
        "Services": ["service", "offering", "deliverable", "scope"],
        "Digital": ["digital", "website", "seo", "analytics", "marketing"],
        "Sales": ["sales", "deal", "proposal", "pipeline", "crm"],
        "Support": ["support", "ticket", "help", "customer service"],
        "Metrics": ["metric", "kpi", "dashboard", "report", "analytics"],
        "Marketing": ["marketing", "campaign", "content", "social media"],
        "Innovation": ["innovation", "research", "experiment", "prototype"],
        "Investor": ["investor", "funding", "pitch", "term sheet"],
        "Team": ["team", "org chart", "onboarding", "hr", "hiring"],
        "Automations": ["automation", "workflow", "zapier", "integration"],
        "Business": ["business", "strategy", "plan", "roadmap"],
    }
    
    # Check for category matches
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in title_lower or keyword in content_lower:
                return category
    
    return "Misc"


def migrate_notion(notion_dir: Path, vault_dir: Path, mapping: Dict[str, Dict]) -> int:
    """
    Migrate Notion export to Obsidian vault.
    
    Args:
        notion_dir: Path to Notion export directory
        vault_dir: Path to Obsidian vault
        mapping: Mapping dictionary to update
        
    Returns:
        Number of files migrated
    """
    count = 0
    
    for root, _, files in os.walk(notion_dir):
        for filename in files:
            if not filename.endswith(".md"):
                continue
                
            src = Path(root) / filename
            
            # Read source content
            try:
                with open(src, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                print(f"Error reading {src}: {e}")
                continue
            
            # Extract title
            title = src.stem
            # Remove Notion's UUID suffix if present
            title = re.sub(r'\s+[a-f0-9]{32}$', '', title)
            
            # Generate stable ID
            sid = stable_id(str(src))
            
            # Categorize content
            category = categorize_content(title, content)
            
            # Determine destination
            rel_path = Path("Knowledge/IntegrateWise") / category / f"{slugify(title)}.md"
            dst = vault_dir / rel_path
            
            # Check if already migrated
            if sid in mapping and mapping[sid].get("dest") == str(rel_path):
                print(f"Skipping (already migrated): {title}")
                continue
            
            # Update mapping
            mapping[sid] = {
                "source": str(src),
                "dest": str(rel_path),
                "type": "notion",
                "title": title,
                "category": category,
                "migrated_at": datetime.datetime.utcnow().isoformat()
            }
            
            # Write to vault
            metadata = {
                "source": "notion",
                "sid": sid,
                "category": category,
                "original_path": str(src.relative_to(notion_dir)),
                "migrated_at": datetime.datetime.utcnow().isoformat()
            }
            
            write_markdown(dst, title, content, metadata)
            print(f"Migrated: {title} → {category}/{slugify(title)}.md")
            count += 1
    
    return count


def migrate_box(box_dir: Path, vault_dir: Path, mapping: Dict[str, Dict]) -> int:
    """
    Migrate Box directory to Obsidian vault.
    
    Args:
        box_dir: Path to Box root directory
        vault_dir: Path to Obsidian vault
        mapping: Mapping dictionary to update
        
    Returns:
        Number of files migrated
    """
    count = 0
    
    for root, _, files in os.walk(box_dir):
        for filename in files:
            src = Path(root) / filename
            
            # Extract info
            title = src.stem
            ext = src.suffix.lower()
            
            # Generate stable ID
            sid = stable_id(str(src))
            
            # Read content if markdown, otherwise create placeholder
            content = ""
            if ext == ".md":
                try:
                    with open(src, "r", encoding="utf-8") as f:
                        content = f.read()
                except Exception as e:
                    print(f"Error reading {src}: {e}")
                    content = f"(Error reading file: {e})\n"
            else:
                content = f"(Imported file: {filename})\n\n"
                content += f"**Type:** {ext}\n\n"
                content += f"**Source Path:** {src}\n\n"
                content += "This file was imported from Box. "
                content += "The original file is available at the source location.\n"
            
            # Categorize
            category = categorize_content(title, content)
            
            # Determine destination (always .md)
            rel_path = Path("Knowledge/IntegrateWise") / category / f"{slugify(title)}.md"
            dst = vault_dir / rel_path
            
            # Check if already migrated
            if sid in mapping and mapping[sid].get("dest") == str(rel_path):
                print(f"Skipping (already migrated): {title}")
                continue
            
            # Update mapping
            mapping[sid] = {
                "source": str(src),
                "dest": str(rel_path),
                "type": "box",
                "title": title,
                "category": category,
                "original_ext": ext,
                "migrated_at": datetime.datetime.utcnow().isoformat()
            }
            
            # Write to vault
            metadata = {
                "source": "box",
                "sid": sid,
                "category": category,
                "original_ext": ext,
                "original_path": str(src.relative_to(box_dir)),
                "migrated_at": datetime.datetime.utcnow().isoformat()
            }
            
            write_markdown(dst, title, content, metadata)
            print(f"Migrated: {title} ({ext}) → {category}/{slugify(title)}.md")
            count += 1
    
    return count


def main():
    """Main entry point for content migration."""
    parser = argparse.ArgumentParser(
        description="Migrate content from Notion/Box to Obsidian vault"
    )
    parser.add_argument(
        "--notion-export",
        required=True,
        help="Path to Notion export directory"
    )
    parser.add_argument(
        "--box-dir",
        required=True,
        help="Path to Box root directory"
    )
    parser.add_argument(
        "--vault",
        required=True,
        help="Path to Obsidian vault root"
    )
    parser.add_argument(
        "--mapping-json",
        required=True,
        help="Path to mapping JSON file (will be created/updated)"
    )
    
    args = parser.parse_args()
    
    # Convert paths
    notion_dir = Path(args.notion_export)
    box_dir = Path(args.box_dir)
    vault_dir = Path(args.vault)
    mapping_file = Path(args.mapping_json)
    
    # Validate source directories
    if not notion_dir.exists():
        print(f"Error: Notion export directory not found: {notion_dir}")
        return 1
    
    if not box_dir.exists():
        print(f"Error: Box directory not found: {box_dir}")
        return 1
    
    # Create vault directory if needed
    vault_dir.mkdir(parents=True, exist_ok=True)
    
    # Load existing mapping
    mapping = {}
    if mapping_file.exists():
        try:
            with open(mapping_file, "r", encoding="utf-8") as f:
                mapping = json.load(f)
            print(f"Loaded {len(mapping)} existing mappings")
        except Exception as e:
            print(f"Warning: Could not load mapping file: {e}")
    
    # Migrate content
    print("\n=== Migrating Notion Export ===")
    notion_count = migrate_notion(notion_dir, vault_dir, mapping)
    
    print("\n=== Migrating Box Files ===")
    box_count = migrate_box(box_dir, vault_dir, mapping)
    
    # Save mapping
    try:
        with open(mapping_file, "w", encoding="utf-8") as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
        print(f"\n✓ Saved mapping to {mapping_file}")
    except Exception as e:
        print(f"\nError: Could not save mapping file: {e}")
        return 1
    
    # Summary
    print("\n=== Migration Complete ===")
    print(f"Notion files: {notion_count}")
    print(f"Box files: {box_count}")
    print(f"Total mappings: {len(mapping)}")
    print(f"Vault location: {vault_dir}")
    
    return 0


if __name__ == "__main__":
    exit(main())
