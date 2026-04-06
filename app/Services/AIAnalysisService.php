<?php

namespace App\Services;

use App\Models\Change;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIAnalysisService
{
    protected string $model = 'claude-sonnet-4-6';
    protected string $apiUrl = 'https://api.anthropic.com/v1/messages';

    /**
     * Analyse a change with Claude and persist the analysis back to the Change model.
     */
    public function analyse(Change $change): void
    {
        $apiKey = config('services.anthropic.api_key');
        if (empty($apiKey)) {
            return;
        }

        $change->loadMissing(['monitoredPage.competitor', 'snapshotBefore', 'snapshotAfter']);

        $prompt = $this->buildPrompt($change);

        try {
            $response = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->post($this->apiUrl, [
                'model'      => $this->model,
                'max_tokens' => 512,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->successful()) {
                $content = $response->json('content.0.text');
                if ($content) {
                    $significance = $this->extractSignificance($content);
                    $change->update([
                        'ai_analysis' => $content,
                        'significance' => $significance ?? $change->significance,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::warning('AI analysis failed for change ' . $change->id . ': ' . $e->getMessage());
        }
    }

    protected function buildPrompt(Change $change): string
    {
        $competitor = $change->monitoredPage->competitor->name ?? 'Unknown';
        $pageType   = $change->monitoredPage->page_type ?? 'generic';
        $pageUrl    = $change->monitoredPage->url ?? '';
        $diffSummary = $change->diff_summary ?? 'No diff available.';

        $textBefore = mb_substr($change->snapshotBefore->text_content ?? '', 0, 1500);
        $textAfter  = mb_substr($change->snapshotAfter->text_content ?? '', 0, 1500);

        return <<<PROMPT
You are a competitive intelligence analyst. A change was detected on a competitor's website.

Competitor: {$competitor}
Page type: {$pageType}
Page URL: {$pageUrl}

Diff summary:
{$diffSummary}

Before (excerpt):
{$textBefore}

After (excerpt):
{$textAfter}

Provide a concise analysis in 2-3 sentences covering:
1. What changed and why it matters strategically
2. The significance level: low, medium, or high

Format your response as:
ANALYSIS: <your analysis here>
SIGNIFICANCE: <low|medium|high>
PROMPT;
    }

    protected function extractSignificance(string $analysisText): ?string
    {
        if (preg_match('/SIGNIFICANCE:\s*(low|medium|high)/i', $analysisText, $m)) {
            return strtolower($m[1]);
        }
        return null;
    }
}
