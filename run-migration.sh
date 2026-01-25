#!/bin/bash

# Run Supabase migration via SQL Editor API
# This script reads the migration file and executes it in Supabase

SUPABASE_URL="https://mmzilrfnwdjxekwyzmsr.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1temlscmZud2RqeGVrd3l6bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzI5MDIsImV4cCI6MjA3NjIwODkwMn0.mcSxGwWqi7XUX6SYu1YeTw-y8CqhgmfHMVihl6ONib0"

# Read the SQL migration file
SQL_CONTENT=$(cat supabase/migrations/008_streaks_and_badges.sql)

# Note: The anon key typically doesn't have permission to run DDL statements
# You need to run this via Supabase Dashboard's SQL Editor instead
# Or use the service role key (which should never be committed to git)

echo "⚠️  The anon key doesn't have permission to run DDL statements."
echo ""
echo "Please run the migration manually via Supabase Dashboard:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/mmzilrfnwdjxekwyzmsr/sql/new"
echo "2. Copy the contents of: supabase/migrations/008_streaks_and_badges.sql"
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "Or use the Supabase CLI with service role key:"
echo "  supabase db push"
