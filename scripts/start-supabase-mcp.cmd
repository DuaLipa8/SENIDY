@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "WORKSPACE_DIR=%~dp0.."
set "ENV_FILE=%WORKSPACE_DIR%\.env"

if exist "%ENV_FILE%" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    set "LINE=%%A"
    if /I "!LINE:~0,20!"=="SUPABASE_ACCESS_TOKEN" set "SUPABASE_ACCESS_TOKEN=%%B"
    if /I "!LINE:~0,19!"=="SUPABASE_PROJECT_REF" set "SUPABASE_PROJECT_REF=%%B"
  )
)

pushd "%WORKSPACE_DIR%" >nul 2>&1

if defined SUPABASE_ACCESS_TOKEN (
  if defined SUPABASE_PROJECT_REF (
    echo Starting Supabase MCP server with access token and project reference...
    call npx.cmd -y @supabase/mcp-server-supabase@latest --access-token "%SUPABASE_ACCESS_TOKEN%" --project-ref "%SUPABASE_PROJECT_REF%"
  ) else (
    echo Starting Supabase MCP server with access token...
    call npx.cmd -y @supabase/mcp-server-supabase@latest --access-token "%SUPABASE_ACCESS_TOKEN%"
  )
) else (
  if defined SUPABASE_PROJECT_REF (
    echo Starting Supabase MCP server with project reference...
    call npx.cmd -y @supabase/mcp-server-supabase@latest --project-ref "%SUPABASE_PROJECT_REF%"
  ) else (
    echo Starting Supabase MCP server without explicit credentials...
    call npx.cmd -y @supabase/mcp-server-supabase@latest
  )
)

popd >nul 2>&1
