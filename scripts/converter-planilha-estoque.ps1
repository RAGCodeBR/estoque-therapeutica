param(
    [string]$Entrada = "C:\Users\gabme\Downloads\PLANILHA_ESTOQUE_CATEGORIZADA.xlsx",
    [string]$Saida = "C:\Users\gabme\Downloads\PLANILHA_ESTOQUE_CATEGORIZADA.csv"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not (Test-Path -LiteralPath $Entrada)) {
    throw "Planilha não encontrada: $Entrada"
}

$arquivo = [System.IO.Compression.ZipFile]::OpenRead($Entrada)
try {
    function Ler-XmlDoZip([string]$Caminho) {
        $entrada = $arquivo.GetEntry($Caminho)
        if ($null -eq $entrada) { throw "Arquivo XLSX inválido: $Caminho ausente." }
        $leitor = [System.IO.StreamReader]::new($entrada.Open())
        try { return [xml]$leitor.ReadToEnd() } finally { $leitor.Dispose() }
    }

    $sharedStringsXml = Ler-XmlDoZip 'xl/sharedStrings.xml'
    $sharedStrings = @()
    foreach ($item in $sharedStringsXml.sst.si) {
        $sharedStrings += (($item.SelectNodes('.//*[local-name()="t"]') | ForEach-Object InnerText) -join '')
    }

    # A aba "Estoque categorizado" é a primeira aba da planilha enviada.
    $planilhaXml = Ler-XmlDoZip 'xl/worksheets/sheet1.xml'
    function Obter-ValorDaCelula($Celula) {
        if ($Celula.t -eq 's') { return $sharedStrings[[int]$Celula.v] }
        return [string]$Celula.v
    }

    $linhas = @()
    foreach ($linha in $planilhaXml.worksheet.sheetData.row | Select-Object -Skip 1) {
        $valores = @{}
        foreach ($celula in $linha.c) {
            $coluna = $celula.r -replace '\d', ''
            $valores[$coluna] = Obter-ValorDaCelula $celula
        }
        $linhas += [PSCustomObject]@{
            produto    = [string]$valores['A']
            categoria  = [string]$valores['B']
            quantidade = [string]$valores['C']
        }
    }

    if ($linhas.Count -ne 221) {
        throw "A aba 'Estoque categorizado' deveria ter 221 itens; encontrados $($linhas.Count)."
    }

    $linhas | Export-Csv -LiteralPath $Saida -NoTypeInformation -Encoding utf8
    Write-Host "CSV criado com $($linhas.Count) itens: $Saida"
} finally {
    $arquivo.Dispose()
}
