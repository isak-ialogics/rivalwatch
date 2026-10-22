<?php
// Standalone runtime regression; no Composer autoload, database, or network.
require __DIR__.'/../../bootstrap/php-version.php';

foreach ([80426 => false, 80427 => true, 80499 => true, 80500 => false, 80336 => false] as $version => $supported) {
    if (rivalwatch_php_version_supported($version) !== $supported) {
        fwrite(STDERR, "PHP security floor regression at version ID {$version}\n");
        exit(1);
    }
}

echo "PHP security floor: 5 boundaries passed\n";
