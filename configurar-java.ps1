# Script PowerShell para configurar Java para o build do APK

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Configurador de Java para Build APK" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar versão atual do Java
Write-Host "[*] Verificando Java instalado..." -ForegroundColor Yellow
$javaVersion = java -version 2>&1 | Select-String -Pattern "version `"(\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }
$javaFull = java -version 2>&1 | Select-Object -First 1

if ($javaVersion) {
    Write-Host "[OK] Java encontrado: $javaFull" -ForegroundColor Green
    $versionColor = if ([int]$javaVersion -ge 11) { "Green" } else { "Red" }
    Write-Host "     Versao: $javaVersion" -ForegroundColor $versionColor
    
    if ([int]$javaVersion -lt 11) {
        Write-Host ""
        Write-Host "[ERRO] Java $javaVersion detectado. Precisa de Java 11 ou superior!" -ForegroundColor Red
        Write-Host ""
        Write-Host "[INFO] Voce precisa instalar Java 11+ primeiro:" -ForegroundColor Yellow
        Write-Host "    1. Baixe em: https://adoptium.net/" -ForegroundColor Cyan
        Write-Host "    2. Escolha: Version 17 LTS ou 21 LTS" -ForegroundColor Cyan
        Write-Host "    3. Package Type: JDK (nao JRE)" -ForegroundColor Cyan
        Write-Host "    4. Apos instalar, execute este script novamente" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "[ERRO] Java nao encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "[INFO] Instale Java 11+ de: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}

# Procurar Java 11+ instalado
Write-Host ""
Write-Host "[*] Procurando Java 11+ instalado..." -ForegroundColor Yellow

$javaPaths = @(
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Java",
    "C:\Program Files (x86)\Java",
    "$env:LOCALAPPDATA\Programs\Eclipse Adoptium"
)

$foundJava = $null
$javaHome = $null

foreach ($basePath in $javaPaths) {
    if (Test-Path $basePath) {
        $jdkFolders = Get-ChildItem -Path $basePath -Directory -ErrorAction SilentlyContinue | 
            Where-Object { 
                if ($_.Name -match "jdk-(\d+)") {
                    [int]($matches[1]) -ge 11
                } else {
                    $false
                }
            }
        
        if ($jdkFolders) {
            # Pegar a versão mais recente
            $foundJava = $jdkFolders | Sort-Object { 
                if ($_.Name -match "jdk-(\d+)") { 
                    [int]($matches[1]) 
                } else { 
                    0 
                }
            } -Descending | Select-Object -First 1
            
            if ($foundJava) {
                $javaHome = $foundJava.FullName
                Write-Host "[OK] Java encontrado em: $javaHome" -ForegroundColor Green
                break
            }
        }
    }
}

if (-not $foundJava) {
    # Tentar encontrar pelo comando where.exe
    Write-Host "[*] Tentando encontrar Java pelo comando where..." -ForegroundColor Yellow
    $javaPaths = where.exe java 2>$null | Where-Object { $_ -like "*Eclipse Adoptium*" -or $_ -like "*Java\jdk*" }
    
    if ($javaPaths) {
        foreach ($javaPath in $javaPaths) {
            $javaDir = Split-Path (Split-Path $javaPath -Parent) -Parent
            if (Test-Path (Join-Path $javaDir "bin\java.exe")) {
                # Verificar versão
                $versionCheck = & (Join-Path $javaDir "bin\java.exe") -version 2>&1 | Select-String -Pattern "version `"(\d+)" | ForEach-Object { [int]($_.Matches.Groups[1].Value) }
                if ($versionCheck -ge 11) {
                    $javaHome = $javaDir
                    Write-Host "[OK] Java encontrado via where.exe: $javaHome" -ForegroundColor Green
                    break
                }
            }
        }
    }
    
    if (-not $javaHome) {
        Write-Host "[AVISO] Java 11+ nao encontrado nos locais padrao" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[INFO] Opcoes:" -ForegroundColor Yellow
        Write-Host "    1. Instale Java 11+ de: https://adoptium.net/" -ForegroundColor Cyan
        Write-Host "    2. Ou informe o caminho manualmente abaixo" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "    Exemplo de caminho tipico:" -ForegroundColor Cyan
        Write-Host "    C:\Program Files\Eclipse Adoptium\jdk-17.0.x" -ForegroundColor Gray
        
        $manualPath = Read-Host "`n    Digite o caminho do JDK 11+ (ou Enter para pular)"
        if ($manualPath -and (Test-Path $manualPath)) {
            $javaHome = $manualPath
            Write-Host "[OK] Caminho valido: $javaHome" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "[ERRO] Nao foi possivel configurar Java automaticamente" -ForegroundColor Red
            Write-Host "    Instale Java 11+ e execute este script novamente" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Verificar se o caminho tem bin\java.exe
$javaExe = Join-Path $javaHome "bin\java.exe"
if (-not (Test-Path $javaExe)) {
    Write-Host ""
    Write-Host "[ERRO] java.exe nao encontrado em: $javaExe" -ForegroundColor Red
    Write-Host "    Verifique se o caminho esta correto" -ForegroundColor Yellow
    exit 1
}

# Verificar versão do Java encontrado
Write-Host ""
Write-Host "[*] Verificando versao do Java encontrado..." -ForegroundColor Yellow
$foundVersion = & $javaExe -version 2>&1 | Select-String -Pattern "version `"(\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }

if ($foundVersion -and [int]$foundVersion -ge 11) {
    Write-Host "[OK] Java $foundVersion confirmado!" -ForegroundColor Green
} else {
    Write-Host "[ERRO] O Java encontrado nao e versao 11+" -ForegroundColor Red
    exit 1
}

# Configurar JAVA_HOME
Write-Host ""
Write-Host "[*] Configurando JAVA_HOME..." -ForegroundColor Yellow

# Configurar para o usuário atual
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')
Write-Host "[OK] JAVA_HOME configurado: $javaHome" -ForegroundColor Green

# Adicionar ao PATH se não estiver
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$javaBin = Join-Path $javaHome "bin"

if ($currentPath -notlike "*$javaBin*") {
    $newPath = $currentPath + ";" + $javaBin
    [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    Write-Host "[OK] Adicionado ao PATH: $javaBin" -ForegroundColor Green
} else {
    Write-Host "[OK] Ja esta no PATH" -ForegroundColor Green
}

# Configurar no gradle.properties
Write-Host ""
Write-Host "[*] Configurando Gradle..." -ForegroundColor Yellow
$gradleProps = "android\gradle.properties"

if (Test-Path $gradleProps) {
    $content = Get-Content $gradleProps -Raw
    
    # Converter caminho para formato do Gradle (barras duplas)
    $gradleJavaHome = $javaHome -replace '\\', '\\'
    
    if ($content -match "org\.gradle\.java\.home") {
        # Atualizar existente
        $content = $content -replace "org\.gradle\.java\.home=.*", "org.gradle.java.home=$gradleJavaHome"
        Write-Host "[OK] Atualizado org.gradle.java.home no gradle.properties" -ForegroundColor Green
    } else {
        # Adicionar novo
        $content += "`n# Configuracao do Java para o build`n"
        $content += "org.gradle.java.home=$gradleJavaHome`n"
        Write-Host "[OK] Adicionado org.gradle.java.home no gradle.properties" -ForegroundColor Green
    }
    
    Set-Content -Path $gradleProps -Value $content -NoNewline
} else {
    Write-Host "[AVISO] gradle.properties nao encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Atualizar JAVA_HOME na sessão atual também
$env:JAVA_HOME = $javaHome
Write-Host "[OK] JAVA_HOME atualizado na sessao atual tambem" -ForegroundColor Green

Write-Host ""
Write-Host "[INFO] Proximos passos:" -ForegroundColor Cyan
Write-Host "    1. Feche e reabra o terminal (ou continue nesta sessao)" -ForegroundColor White
Write-Host "    2. Verifique: java -version (deve mostrar versao 11+)" -ForegroundColor White
Write-Host "    3. Execute: npm run mobile:apk" -ForegroundColor White
Write-Host ""
Write-Host "    Ou teste agora nesta sessao:" -ForegroundColor Cyan
Write-Host "    cd android" -ForegroundColor Gray
Write-Host "    .\gradlew.bat assembleDebug" -ForegroundColor Gray
Write-Host ""
