<?php

namespace App\Services;

use App\Models\MonitoredPage;
use App\Models\Snapshot;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

class SnapshotService
{
    /**
     * Capture a snapshot of a monitored page.
     * Returns the created Snapshot model.
     */
    public function capture(MonitoredPage $page): Snapshot
    {
        $screenshotPath = null;
        $domContent = null;
        $textContent = null;

        try {
            $browsershot = Browsershot::url($page->url)
                ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
                ->waitUntilNetworkIdle()
                ->timeout(30);

            // Capture screenshot
            $filename = 'screenshots/' . $page->id . '/' . now()->format('Y-m-d_H-i-s') . '.png';
            $screenshotData = $browsershot->screenshot();
            Storage::disk('public')->put($filename, $screenshotData);
            $screenshotPath = $filename;

            // Extract DOM and text content
            $domContent = $browsershot->evaluate('document.documentElement.outerHTML');
            $textContent = $browsershot->evaluate(
                "document.body ? document.body.innerText.replace(/\\s+/g, ' ').trim() : ''"
            );
        } catch (\Exception $e) {
            // Fall back to plain HTTP if Browsershot fails (e.g., no Chrome installed)
            [$domContent, $textContent] = $this->captureViaHttp($page->url);
        }

        return Snapshot::create([
            'monitored_page_id' => $page->id,
            'screenshot_path'   => $screenshotPath,
            'dom_content'       => $domContent,
            'text_content'      => $textContent,
            'captured_at'       => now(),
        ]);
    }

    /**
     * Fallback: capture page content via plain HTTP request.
     */
    protected function captureViaHttp(string $url): array
    {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(15)
                ->withHeaders(['User-Agent' => 'RivalWatch/1.0 (+https://rivalwatch.app)'])
                ->get($url);

            if ($response->successful()) {
                $html = $response->body();
                $text = $this->extractText($html);
                return [$html, $text];
            }
        } catch (\Exception) {
        }

        return [null, null];
    }

    /**
     * Strip HTML tags and collapse whitespace to produce plain text.
     */
    protected function extractText(string $html): string
    {
        // Remove script and style blocks
        $html = preg_replace('/<(script|style)[^>]*>.*?<\/\1>/si', '', $html);
        // Strip tags
        $text = strip_tags($html);
        // Collapse whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text ?? '');
    }
}
