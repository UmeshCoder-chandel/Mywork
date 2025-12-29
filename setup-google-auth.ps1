# Google Authentication Setup Script
# This script helps you configure Google OAuth for iWorkSocial

Write-Host "`n=== Google Authentication Setup ===" -ForegroundColor Cyan
Write-Host "`nThis script will help you configure Google OAuth authentication.`n" -ForegroundColor Yellow

# Check if .env files exist
$backendEnv = "backend\.env"
$frontendEnv = "frontend\.env"

if (-not (Test-Path $backendEnv)) {
    Write-Host "Error: backend\.env not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendEnv)) {
    Write-Host "Error: frontend\.env not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Get your Google OAuth Client ID" -ForegroundColor Green
Write-Host "`n1. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host "2. Create a new project (or select existing)" -ForegroundColor White
Write-Host "3. Go to 'APIs & Services' > 'OAuth consent screen'" -ForegroundColor White
Write-Host "   - Choose 'External' user type" -ForegroundColor White
Write-Host "   - Fill in app name and email" -ForegroundColor White
Write-Host "   - Add scopes: email, profile" -ForegroundColor White
Write-Host "4. Go to 'APIs & Services' > 'Credentials'" -ForegroundColor White
Write-Host "5. Click '+ CREATE CREDENTIALS' > 'OAuth client ID'" -ForegroundColor White
Write-Host "6. Choose 'Web application'" -ForegroundColor White
Write-Host "7. Add Authorized JavaScript origins: http://localhost:5173" -ForegroundColor White
Write-Host "8. Copy the Client ID (looks like: 123456789-abc.apps.googleusercontent.com)`n" -ForegroundColor White

$clientId = Read-Host "Enter your Google OAuth Client ID"

if ([string]::IsNullOrWhiteSpace($clientId)) {
    Write-Host "Error: Client ID cannot be empty!" -ForegroundColor Red
    exit 1
}

if ($clientId -eq "your_google_client_id_here" -or $clientId -like "*your_*") {
    Write-Host "Error: Please enter a real Client ID, not the placeholder!" -ForegroundColor Red
    exit 1
}

Write-Host "`nUpdating backend\.env..." -ForegroundColor Yellow
$backendContent = Get-Content $backendEnv -Raw
$backendContent = $backendContent -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$clientId"
Set-Content -Path $backendEnv -Value $backendContent -NoNewline
Write-Host "✓ Backend .env updated" -ForegroundColor Green

Write-Host "`nUpdating frontend\.env..." -ForegroundColor Yellow
$frontendContent = Get-Content $frontendEnv -Raw
$frontendContent = $frontendContent -replace "VITE_GOOGLE_CLIENT_ID=.*", "VITE_GOOGLE_CLIENT_ID=$clientId"
Set-Content -Path $frontendEnv -Value $frontendContent -NoNewline
Write-Host "✓ Frontend .env updated" -ForegroundColor Green

Write-Host "`n=== Configuration Complete! ===" -ForegroundColor Cyan
Write-Host "`nIMPORTANT: You must restart both servers for changes to take effect:" -ForegroundColor Yellow
Write-Host "1. Stop your backend server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Stop your frontend server (Ctrl+C)" -ForegroundColor White
Write-Host "3. Restart backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "4. Restart frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "`nAfter restarting, the Google login button should work!`n" -ForegroundColor Green

