@echo off
setlocal
cd /d "%~dp0.."
echo Stopping local Supabase project...
supabase stop
