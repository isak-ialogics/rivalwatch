<?php

declare(strict_types=1);

function rivalwatch_php_version_supported(int $versionId): bool
{
    return $versionId >= 80427 && $versionId < 80500;
}

if (!rivalwatch_php_version_supported(PHP_VERSION_ID)) {
    $message = 'RivalWatch requires PHP 8.4.27+ on the 8.4 series; found '.PHP_VERSION;

    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, $message.PHP_EOL);
    } else {
        error_log($message);
        http_response_code(503);
    }

    exit(1);
}
