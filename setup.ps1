[CmdletBinding()]
param(
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$CheckOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = $PSScriptRoot
$Backend = Join-Path $Root 'backend'
$Frontend = Join-Path $Root 'frontend'

function Require-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found on PATH. Install it and run setup.ps1 again."
    }
}

function Test-PathWithMessage {
    param(
        [string]$Path,
        [string]$Description
    )

    if (Test-Path $Path) {
        Write-Host "[ok] $Description" -ForegroundColor Green
        return $true
    }

    Write-Warning "[missing] ${Description}: $Path"
    return $false
}

Write-Host 'Emergency Veterinary AI Dispatch setup' -ForegroundColor Cyan
Write-Host "Project root: $Root"

Require-Command 'uv'
if (-not $SkipFrontend) {
    Require-Command 'npm'
}

if (-not (Test-Path (Join-Path $Backend 'pyproject.toml'))) {
    throw "Backend project not found at $Backend"
}
if (-not (Test-Path (Join-Path $Frontend 'package.json'))) {
    throw "Frontend project not found at $Frontend"
}

if (-not $CheckOnly -and -not $SkipBackend) {
    Write-Host '[backend] Syncing Python dependencies...' -ForegroundColor Yellow
    Push-Location $Backend
    try {
        uv sync
    }
    finally {
        Pop-Location
    }
}

if (-not $CheckOnly -and -not $SkipFrontend) {
    Write-Host '[frontend] Installing npm dependencies...' -ForegroundColor Yellow
    Push-Location $Frontend
    try {
        npm install
    }
    finally {
        Pop-Location
    }
}

Write-Host '[check] Local AI configuration' -ForegroundColor Yellow
$llamaScript = Join-Path $Backend 'llm.ps1'
[void](Test-PathWithMessage $llamaScript 'llama.cpp launcher')

if ($env:LLAMA_SERVER_PATH) {
    [void](Test-PathWithMessage $env:LLAMA_SERVER_PATH 'llama-server executable from LLAMA_SERVER_PATH')
}
else {
    Write-Host '[info] LLAMA_SERVER_PATH is not set; backend\llm.ps1 contains the local default path.' -ForegroundColor DarkYellow
}

if ($env:LLM_MODEL_PATH) {
    [void](Test-PathWithMessage $env:LLM_MODEL_PATH 'GGUF model from LLM_MODEL_PATH')
}
else {
    Write-Host '[info] LLM_MODEL_PATH is not set; backend\llm.ps1 contains the local default model path.' -ForegroundColor DarkYellow
}

Write-Host ''
Write-Host 'Setup finished.' -ForegroundColor Green
Write-Host 'Start the system with:'
Write-Host '  Terminal 1: .\backend\llm.ps1'
Write-Host '  Terminal 2: Set-Location .\backend; uv run uvicorn app.main:app --reload'
Write-Host '  Terminal 3: Set-Location .\frontend; npm run dev -- --host 127.0.0.1'
Write-Host 'Then open http://127.0.0.1:5173' -ForegroundColor Cyan
