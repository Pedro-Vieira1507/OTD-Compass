# ================================
# OTD Dashboard - Build Script
# Autor: Pedro Leira
# Descrição: Gera o instalador do app Electron no Windows
# ================================

Write-Host ""
Write-Host "=== Iniciando build do OTD Dashboard ===" -ForegroundColor Cyan

# 1️⃣ Verifica se o PowerShell está como administrador
$adminCheck = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole] "Administrator"
)

if (-not $adminCheck) {
    Write-Host ""
    Write-Host "ERRO: Este script precisa ser executado como administrador!" -ForegroundColor Red
    Write-Host "Clique com o botão direito no PowerShell e escolha 'Executar como administrador'." -ForegroundColor Yellow
    exit
}

# 2️⃣ Configura cache seguro sem acentos
$cachePath = "C:\electron_cache"
if (-not (Test-Path $cachePath)) {
    Write-Host ""
    Write-Host "Criando pasta de cache em $cachePath ..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $cachePath | Out-Null
}

[System.Environment]::SetEnvironmentVariable("ELECTRON_BUILDER_CACHE", $cachePath, "Machine")
Write-Host "Cache configurado para: $cachePath" -ForegroundColor Green

# 3️⃣ Limpa caches antigos
Write-Host ""
Write-Host "Limpando caches antigos..." -ForegroundColor Yellow
Remove-Item "$env:LOCALAPPDATA\electron-builder" -Recurse -Force -ErrorAction SilentlyContinue
npm cache clean --force | Out-Null

# 4️⃣ Reinstala dependências
Write-Host ""
Write-Host "Reinstalando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}
npm install

# 5️⃣ Gera o build
Write-Host ""
Write-Host "Gerando instalador do app..." -ForegroundColor Cyan
npm run dist

# 6️⃣ Resultado
if (Test-Path "dist") {
    Write-Host ""
    Write-Host "Build finalizado com sucesso!" -ForegroundColor Green
    Write-Host "Arquivo gerado em:" (Resolve-Path .\dist) -ForegroundColor Cyan
    Start-Process explorer.exe (Resolve-Path .\dist)
}
else {
    Write-Host ""
    Write-Host "ERRO: Ocorreu um problema durante o build. Verifique os logs acima." -ForegroundColor Red
}
