<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Digest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px; color: #111827; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 28px 32px; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
        .body { padding: 32px; }
        .competitor-section { margin-bottom: 32px; }
        .competitor-name { font-size: 16px; font-weight: 700; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
        .change-row { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .change-row:last-child { border-bottom: none; }
        .change-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
        .badge-high { background: #fee2e2; color: #b91c1c; }
        .badge-medium { background: #fef3c7; color: #92400e; }
        .badge-low { background: #dcfce7; color: #166534; }
        .change-summary { font-size: 13px; color: #4b5563; line-height: 1.5; }
        .change-analysis { font-size: 12px; color: #6b7280; font-style: italic; margin-top: 4px; }
        .change-link { font-size: 12px; color: #1e40af; text-decoration: none; }
        .no-changes { text-align: center; padding: 40px; color: #9ca3af; font-size: 14px; }
        .cta { margin-top: 28px; text-align: center; }
        .cta a { background: #1e40af; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; }
        .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
        .footer a { color: #6b7280; }
        .stats { display: flex; gap: 24px; margin-bottom: 28px; }
        .stat { text-align: center; flex: 1; background: #f9fafb; border-radius: 8px; padding: 14px; }
        .stat-number { font-size: 28px; font-weight: 800; color: #1e40af; }
        .stat-label { font-size: 11px; color: #6b7280; margin-top: 2px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>RivalWatch Weekly Digest</h1>
        <p>{{ $weekLabel }} &mdash; Hi {{ $user->name }}, here's what changed this week</p>
    </div>
    <div class="body">

        @php
            $totalChanges = $changesByCompetitor->flatten()->count();
            $highCount = $changesByCompetitor->flatten()->where('significance', 'high')->count();
            $competitorCount = $changesByCompetitor->keys()->count();
        @endphp

        <div class="stats">
            <div class="stat">
                <div class="stat-number">{{ $totalChanges }}</div>
                <div class="stat-label">Total changes</div>
            </div>
            <div class="stat">
                <div class="stat-number">{{ $highCount }}</div>
                <div class="stat-label">High significance</div>
            </div>
            <div class="stat">
                <div class="stat-number">{{ $competitorCount }}</div>
                <div class="stat-label">Competitors tracked</div>
            </div>
        </div>

        @if($changesByCompetitor->isEmpty())
            <div class="no-changes">
                No changes detected this week. Your competitors are keeping quiet!
            </div>
        @else
            @foreach($changesByCompetitor as $competitorName => $changes)
            <div class="competitor-section">
                <div class="competitor-name">{{ $competitorName }}</div>
                @foreach($changes as $change)
                <div class="change-row">
                    <div class="change-meta">
                        <span class="badge badge-{{ $change->significance ?? 'low' }}">{{ ucfirst($change->significance ?? 'low') }}</span>
                        <span style="font-size:12px;color:#6b7280;">{{ ucfirst($change->monitoredPage->page_type ?? 'generic') }}</span>
                        <span style="font-size:12px;color:#9ca3af;">{{ $change->detected_at?->format('M j') }}</span>
                    </div>
                    @if($change->diff_summary)
                    <div class="change-summary">{{ str($change->diff_summary)->explode("\n")->first() }}</div>
                    @endif
                    @if($change->ai_analysis)
                    <div class="change-analysis">{{ str($change->ai_analysis)->replaceFirst('ANALYSIS:', '')->before('SIGNIFICANCE:')->trim()->limit(200) }}</div>
                    @endif
                    <a href="{{ url('/changes/' . $change->id) }}" class="change-link">View details &rarr;</a>
                </div>
                @endforeach
            </div>
            @endforeach
        @endif

        <div class="cta">
            <a href="{{ url('/changes') }}">View all changes in RivalWatch</a>
        </div>
    </div>
    <div class="footer">
        This weekly digest is sent every Monday morning.
        <a href="{{ url('/notifications') }}">Update your preferences</a> or disable emails.
    </div>
</div>
</body>
</html>
