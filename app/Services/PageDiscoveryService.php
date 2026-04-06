<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PageDiscoveryService
{
    /**
     * Common page types and their URL patterns to check.
     */
    protected array $commonPaths = [
        'pricing'  => ['/pricing', '/plans', '/pricing-plans', '/price'],
        'features' => ['/features', '/product', '/solutions', '/capabilities'],
        'about'    => ['/about', '/about-us', '/company', '/team'],
        'blog'     => ['/blog', '/news', '/updates', '/articles', '/resources'],
        'careers'  => ['/careers', '/jobs', '/work-with-us', '/join-us'],
    ];

    /**
     * Discover monitored pages for a given domain.
     * Tries sitemap first, then falls back to common URL patterns.
     *
     * @return array<array{url: string, page_type: string}>
     */
    public function discover(string $domain): array
    {
        $domain = $this->normalizeDomain($domain);
        $discovered = [];

        // Always include the homepage
        $discovered[] = ['url' => $domain, 'page_type' => 'homepage'];

        // Try sitemap
        $sitemapPages = $this->discoverFromSitemap($domain);
        if (!empty($sitemapPages)) {
            $discovered = array_merge($discovered, $sitemapPages);
        }

        // Check common paths not found in sitemap
        $existingUrls = array_column($discovered, 'url');
        $commonPages = $this->discoverCommonPaths($domain, $existingUrls);
        $discovered = array_merge($discovered, $commonPages);

        return $this->deduplicatePages($discovered);
    }

    protected function normalizeDomain(string $domain): string
    {
        $domain = trim($domain);
        if (!Str::startsWith($domain, ['http://', 'https://'])) {
            $domain = 'https://' . $domain;
        }
        return rtrim($domain, '/');
    }

    protected function discoverFromSitemap(string $baseUrl): array
    {
        $pages = [];
        $sitemapUrls = [
            $baseUrl . '/sitemap.xml',
            $baseUrl . '/sitemap_index.xml',
            $baseUrl . '/sitemap-index.xml',
        ];

        foreach ($sitemapUrls as $sitemapUrl) {
            try {
                $response = Http::timeout(10)->get($sitemapUrl);
                if ($response->successful()) {
                    $pages = $this->parseSitemap($response->body(), $baseUrl);
                    if (!empty($pages)) {
                        break;
                    }
                }
            } catch (\Exception) {
                continue;
            }
        }

        return $pages;
    }

    protected function parseSitemap(string $xml, string $baseUrl): array
    {
        $pages = [];
        try {
            $doc = new \SimpleXMLElement($xml);
            $doc->registerXPathNamespace('sm', 'http://www.sitemaps.org/schemas/sitemap/0.9');

            // Handle sitemap index
            $sitemapRefs = $doc->xpath('//sm:sitemap/sm:loc') ?? [];
            if (!empty($sitemapRefs)) {
                foreach (array_slice($sitemapRefs, 0, 3) as $loc) {
                    try {
                        $response = Http::timeout(10)->get((string) $loc);
                        if ($response->successful()) {
                            $pages = array_merge($pages, $this->parseSitemap($response->body(), $baseUrl));
                        }
                    } catch (\Exception) {
                        continue;
                    }
                }
                return $pages;
            }

            // Handle regular sitemap
            $urls = $doc->xpath('//sm:url/sm:loc') ?? [];
            foreach ($urls as $loc) {
                $url = (string) $loc;
                $pageType = $this->detectPageType($url);
                if ($pageType !== null) {
                    $pages[] = ['url' => $url, 'page_type' => $pageType];
                }
            }
        } catch (\Exception) {
            return [];
        }

        return $pages;
    }

    protected function discoverCommonPaths(string $baseUrl, array $existingUrls): array
    {
        $pages = [];

        foreach ($this->commonPaths as $pageType => $paths) {
            $found = false;
            foreach ($paths as $path) {
                $url = $baseUrl . $path;
                if (in_array($url, $existingUrls)) {
                    $found = true;
                    break;
                }
            }

            if ($found) {
                continue;
            }

            // Check each path with a HEAD request
            foreach ($paths as $path) {
                $url = $baseUrl . $path;
                try {
                    $response = Http::timeout(8)->head($url);
                    if ($response->successful()) {
                        $pages[] = ['url' => $url, 'page_type' => $pageType];
                        break;
                    }
                } catch (\Exception) {
                    continue;
                }
            }
        }

        return $pages;
    }

    protected function detectPageType(string $url): ?string
    {
        $path = strtolower(parse_url($url, PHP_URL_PATH) ?? '');

        foreach ($this->commonPaths as $pageType => $patterns) {
            foreach ($patterns as $pattern) {
                if (Str::contains($path, trim($pattern, '/'))) {
                    return $pageType;
                }
            }
        }

        // Homepage
        if ($path === '' || $path === '/') {
            return 'homepage';
        }

        return null;
    }

    protected function deduplicatePages(array $pages): array
    {
        $seen = [];
        $unique = [];

        foreach ($pages as $page) {
            $key = rtrim(strtolower($page['url']), '/');
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $unique[] = $page;
            }
        }

        return $unique;
    }
}
