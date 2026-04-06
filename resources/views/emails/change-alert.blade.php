<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Alert</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #1e40af; padding: 24px 32px; color: white; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.8; }
        .body { padding: 32px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .badge-high { background: #fee2e2; color: #b91c1c; }
        .badge-medium { background: #fef3c7; color: #92400e; }
        .badge-low { background: #dcfce7; color: #166534; }
        .section { margin-top: 20px; }
        .section label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
        .section p { margin: 6px 0 0; font-size: 14px; color: #374151; line-height: 1.6; }
        .analysis-box { background: #f0f9ff; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-top: 8px; font-size: 14px; color: #1e40af; line-height: 1.6; }
        .cta { margin-top: 28px; text-align: center; }
        .cta a { background: #1e40af; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; }
        .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
        .footer a { color: #6b7280; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>RivalWatch — Change Alert</h1>
        <p>A monitored competitor page has changed</p>
    </div>
    <div class="body">
        <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:18px;font-weight:700;">{{ $change->monitoredPage->competitor->name ?? 'Competitor' }}</span>
            @php
                $sig = $change->significance ?? 'low';
            @endphp
            <span class="badge badge-{{ $sig }}">{{ ucfirst($sig) }} significance</span>
        </div>

        <div class="section">
            <label>Page</label>
            <p>
                {{ ucfirst($change->monitoredPage->page_type ?? 'generic') }} —
                <a href="{{ $change->monitoredPage->url ?? '#' }}" style="color:#1e40af;">{{ $change->monitoredPage->url ?? '' }}</a>
            </p>
        </div>

        <div class="section">
            <label>Detected at</label>
            <p>{{ $change->detected_at?->format('M j, Y \a\t g:i A') ?? now()->format('M j, Y \a\t g:i A') }}</p>
        </div>

        <div class="section">
            <label>Change summary</label>
            <p>{{ $change->diff_summary ? str($change->diff_summary)->explode("\n")->first() : 'Content changed.' }}</p>
        </div>

        @if($change->ai_analysis)
        <div class="section">
            <label>AI Analysis</label>
            <div class="analysis-box">
                {{ str($change->ai_analysis)->replaceFirst('ANALYSIS:', '')->before('SIGNIFICANCE:')->trim() }}
            </div>
        </div>
        @endif

        <div class="cta">
            <a href="{{ url('/changes/' . $change->id) }}">View full change</a>
        </div>
    </div>
    <div class="footer">
        You received this alert because your notification threshold is set to
        <strong>{{ $user->notification_threshold ?? 'medium' }}</strong> significance or higher.
        <a href="{{ url('/notifications') }}">Update your preferences</a>.
    </div>
</div>
</body>
</html>
