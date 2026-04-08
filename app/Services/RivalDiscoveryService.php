<?php

namespace App\Services;

use App\Models\UserSite;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RivalDiscoveryService
{
    protected string $model = 'claude-sonnet-4-6';
    protected string $apiUrl = 'https://api.anthropic.com/v1/messages';

    /**
     * Crawl the user's site to extract keywords and industry, then use AI to discover rivals.
     *
     * @return array<array{name: string, domain: string, description: string, similarity: string}>
     */
    public function discover(UserSite $userSite): array
    {
        // Step 1: Crawl the user's site to extract content
        $siteContent = $this->crawlSite($userSite->url);

        if (empty($siteContent)) {
            Log::warning("RivalDiscoveryService: could not crawl site {$userSite->url}");
            return [];
        }

        // Step 2: Extract keywords and industry from the site content
        $siteAnalysis = $this->analyzeSiteContent($siteContent);

        // Step 3: Update the UserSite with extracted info
        $userSite->update([
            'industry' => $siteAnalysis['industry'] ?? null,
            'keywords' => $siteAnalysis['keywords'] ?? [],
        ]);

        // Step 4: Use AI to discover competitors
        return $this->findRivals($userSite, $siteContent, $siteAnalysis);
    }

    protected function crawlSite(string $url): string
    {
        $url = $this->normalizeUrl($url);

        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'RivalWatch/1.0'])
                ->get($url);

            if ($response->successful()) {
                $html = $response->body();
                return $this->extractTextContent($html);
            }
        } catch (\Exception $e) {
            Log::warning("RivalDiscoveryService: failed to crawl {$url}: {$e->getMessage()}");
        }

        return '';
    }

    protected function normalizeUrl(string $url): string
    {
        $url = trim($url);
        if (!Str::startsWith($url, ['http://', 'https://'])) {
            $url = 'https://' . $url;
        }
        return rtrim($url, '/');
    }

    protected function extractTextContent(string $html): string
    {
        // Remove script and style tags and their content
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/si', '', $html);
        $html = preg_replace('/<style\b[^>]*>.*?<\/style>/si', '', $html);

        // Extract title
        $title = '';
        if (preg_match('/<title>(.*?)<\/title>/si', $html, $m)) {
            $title = trim(strip_tags($m[1]));
        }

        // Extract meta description
        $metaDesc = '';
        if (preg_match('/<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']/si', $html, $m)) {
            $metaDesc = trim($m[1]);
        }

        // Extract body text
        $bodyText = strip_tags($html);
        $bodyText = preg_replace('/\s+/', ' ', $bodyText);
        $bodyText = trim($bodyText);

        $content = "Title: {$title}\nDescription: {$metaDesc}\n\n" . mb_substr($bodyText, 0, 3000);

        return $content;
    }

    protected function analyzeSiteContent(string $content): array
    {
        $apiKey = config('services.anthropic.api_key');

        // Fallback: extract keywords from content without AI
        if (empty($apiKey)) {
            return $this->extractKeywordsManually($content);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model'      => $this->model,
                'max_tokens' => 256,
                'messages'   => [
                    ['role' => 'user', 'content' => $this->buildAnalysisPrompt($content)],
                ],
            ]);

            if ($response->successful()) {
                $text = $response->json('content.0.text');
                return $this->parseAnalysisResponse($text);
            }
        } catch (\Exception $e) {
            Log::warning("RivalDiscoveryService: AI analysis failed: {$e->getMessage()}");
        }

        return $this->extractKeywordsManually($content);
    }

    protected function buildAnalysisPrompt(string $content): string
    {
        return <<<PROMPT
Analyze this website content and extract the industry and key business keywords.

Website content:
{$content}

Respond in EXACTLY this format (no other text):
INDUSTRY: <industry name>
KEYWORDS: <comma-separated list of 5-10 business keywords>
PROMPT;
    }

    protected function parseAnalysisResponse(string $text): array
    {
        $industry = null;
        $keywords = [];

        if (preg_match('/INDUSTRY:\s*(.+)/i', $text, $m)) {
            $industry = trim($m[1]);
        }

        if (preg_match('/KEYWORDS:\s*(.+)/i', $text, $m)) {
            $keywords = array_map('trim', explode(',', $m[1]));
        }

        return ['industry' => $industry, 'keywords' => $keywords];
    }

    protected function extractKeywordsManually(string $content): array
    {
        // Simple keyword extraction without AI
        $words = str_word_count(strtolower($content), 1);
        $stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
            'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
            'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
            'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
            'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
            'only', 'own', 'same', 'so', 'than', 'too', 'very', 'and', 'but', 'or', 'if',
            'while', 'that', 'this', 'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their',
        ];

        $filtered = array_filter($words, fn ($w) => strlen($w) > 3 && !in_array($w, $stopWords));
        $freq = array_count_values($filtered);
        arsort($freq);

        return [
            'industry' => null,
            'keywords' => array_slice(array_keys($freq), 0, 10),
        ];
    }

    /**
     * @return array<array{name: string, domain: string, description: string, similarity: string}>
     */
    protected function findRivals(UserSite $userSite, string $siteContent, array $siteAnalysis): array
    {
        $apiKey = config('services.anthropic.api_key');

        if (empty($apiKey)) {
            Log::info("RivalDiscoveryService: no API key, returning empty rivals for site {$userSite->id}");
            return [];
        }

        $domain = parse_url($this->normalizeUrl($userSite->url), PHP_URL_HOST) ?? $userSite->url;
        $industry = $siteAnalysis['industry'] ?? 'unknown';
        $keywords = implode(', ', $siteAnalysis['keywords'] ?? []);

        $prompt = <<<PROMPT
You are a competitive intelligence analyst. Based on this website analysis, identify 5-8 competing or similar companies.

Website: {$domain}
Industry: {$industry}
Keywords: {$keywords}

Website content excerpt:
{$siteContent}

For each competitor, provide the company name, domain, a brief description of what they do, and how similar they are to the analyzed website (high, medium, or low).

Respond in EXACTLY this format (one competitor per line, no other text):
RIVAL: <company name> | <domain.com> | <brief description> | <high|medium|low>
PROMPT;

        try {
            $response = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->timeout(45)->post($this->apiUrl, [
                'model'      => $this->model,
                'max_tokens' => 1024,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->successful()) {
                $text = $response->json('content.0.text');
                return $this->parseRivalsResponse($text);
            }
        } catch (\Exception $e) {
            Log::warning("RivalDiscoveryService: rival discovery failed: {$e->getMessage()}");
        }

        return [];
    }

    /**
     * @return array<array{name: string, domain: string, description: string, similarity: string}>
     */
    protected function parseRivalsResponse(string $text): array
    {
        $rivals = [];

        foreach (explode("\n", $text) as $line) {
            if (preg_match('/RIVAL:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(high|medium|low)/i', $line, $m)) {
                $rivals[] = [
                    'name'        => trim($m[1]),
                    'domain'      => trim($m[2]),
                    'description' => trim($m[3]),
                    'similarity'  => strtolower(trim($m[4])),
                ];
            }
        }

        return $rivals;
    }
}
