function Create-FormattedJson {
    param (
        [Parameter(Mandatory=$true)]
        [Array]$Files
    )

    $jsonString = "{`n  `"content`": [`n"

    foreach ($file in $Files) {
        $jsonString += "    {`n"
        $jsonString += "      `"path`": `"$($file.path)`",`n"
        $jsonString += "      `"size`": $($file.size),`n"
        $jsonString += "      `"date`": $($file.date)`n"
        $jsonString += "    },`n"
    }

    # Remove the trailing comma and new line from the last entry
    $jsonString = $jsonString.TrimEnd(",`n") + "`n"

    $jsonString += "  ]`n}"
    return $jsonString
}

# Define the target directory
$targetDirectory = 'release/chrisaut-toolbar-printouts'

# Navigate to the target directory
Set-Location $targetDirectory

# Gather all files, excluding layout.json and manifest.json
$files = Get-ChildItem "." -Recurse -File -Exclude "layout.json", "manifest.json"
$fileDetails = @()

foreach ($file in $files) {
    # Collect file details into a custom object for JSON generation
    $fileDetails += @{
        "path" = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        "size" = $file.Length
        "date" = $file.LastWriteTimeUtc.ToFileTimeUtc()
    }
}

# Use the custom function to create the JSON string
$formattedJson = Create-FormattedJson -Files $fileDetails

# Define the output path for layout.json
$outputPath = Join-Path -Path (Get-Location) -ChildPath "layout.json"

# Write the formatted JSON string directly to layout.json in the specified directory
[System.IO.File]::WriteAllText($outputPath, $formattedJson)

# Return to the initial directory
Pop-Location
