<?php

namespace App\Services;

use App\Models\Change;
use App\Models\Snapshot;

class ChangeDetectionService
{
    /**
     * Compare two snapshots and return a Change model if meaningful differences exist.
     * Returns null if no significant change is detected.
     */
    public function compare(Snapshot $before, Snapshot $after): ?Change
    {
        if ($before->text_content === null && $after->text_content === null) {
            return null;
        }

        $textBefore = $before->text_content ?? '';
        $textAfter  = $after->text_content  ?? '';

        $diffSummary = $this->computeTextDiff($textBefore, $textAfter);

        if ($diffSummary === null) {
            return null;
        }

        return Change::create([
            'monitored_page_id'  => $before->monitored_page_id,
            'snapshot_before_id' => $before->id,
            'snapshot_after_id'  => $after->id,
            'change_type'        => 'text',
            'significance'       => $this->assessSignificance($diffSummary),
            'diff_summary'       => $diffSummary,
            'ai_analysis'        => null,
            'detected_at'        => now(),
        ]);
    }

    /**
     * Compute a human-readable diff summary between two text blobs.
     * Returns null if the change is below the noise threshold.
     */
    protected function computeTextDiff(string $before, string $after): ?string
    {
        if ($before === $after) {
            return null;
        }

        $wordsBefore = $this->tokenize($before);
        $wordsAfter  = $this->tokenize($after);

        $totalWords = max(count($wordsBefore), count($wordsAfter), 1);
        $addedWords   = array_diff($wordsAfter, $wordsBefore);
        $removedWords = array_diff($wordsBefore, $wordsAfter);

        $changeRatio = (count($addedWords) + count($removedWords)) / (2 * $totalWords);

        // Ignore tiny noise (< 1% change)
        if ($changeRatio < 0.01 && count($addedWords) + count($removedWords) < 5) {
            return null;
        }

        $summary = sprintf(
            '+%d words added, -%d words removed (%.1f%% change)',
            count($addedWords),
            count($removedWords),
            $changeRatio * 100
        );

        if (!empty($addedWords)) {
            $sample = implode(', ', array_slice($addedWords, 0, 10));
            $summary .= "\nNew content includes: " . $sample;
        }

        if (!empty($removedWords)) {
            $sample = implode(', ', array_slice($removedWords, 0, 10));
            $summary .= "\nRemoved content includes: " . $sample;
        }

        return $summary;
    }

    /**
     * Tokenise text into a unique word set (case-insensitive, alphanumeric).
     */
    protected function tokenize(string $text): array
    {
        $text = strtolower($text);
        preg_match_all('/\b[a-z0-9]{2,}\b/', $text, $matches);
        return array_unique($matches[0]);
    }

    /**
     * Heuristically assess change significance based on the diff summary.
     */
    protected function assessSignificance(string $diffSummary): string
    {
        // Extract change percentage from summary
        preg_match('/([\d.]+)%/', $diffSummary, $m);
        $pct = isset($m[1]) ? (float) $m[1] : 0;

        if ($pct >= 30) {
            return 'high';
        }
        if ($pct >= 5) {
            return 'medium';
        }
        return 'low';
    }
}
