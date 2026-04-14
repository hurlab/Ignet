<?php
$genes = json_decode($_POST['genes'], true);
?>
<!DOCTYPE html>
<html>
<head>
    <title>BioSummarAI Summary</title>
    <style>
        .chatbox { border: 1px solid #ccc; padding: 10px; width: 100%; min-height: 150px; background: #f9f9f9; margin-top: 15px; white-space: pre-wrap; }
        .btn { background-color: #007bff; color: white; padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; }
    </style>
</head>
<body>
    <h2>Generated Summary for: <?= implode(", ", $genes) ?></h2>

    <div class="chatbox" id="summaryBox">Generating summary...</div>
    <button class="btn" id="chatBtn" style="display:none;" onclick="chatNow()">Chat Now</button>

    <script>
    const genes = <?= json_encode($genes) ?>;
    const summaryBox = document.getElementById('summaryBox');

    fetch('http://127.0.0.1:9636/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genes: genes })
    })
    .then(r => r.json())
    .then(data => {
        summaryBox.innerText = data.summary || "No summary available.";
        document.getElementById('chatBtn').style.display = 'inline-block';
    })
    .catch(err => summaryBox.innerText = "Error fetching summary.");

    function chatNow() {
        const msg = prompt("Ask a question about this summary:");
        if (!msg) return;
        const ctx = summaryBox.innerText;

        fetch('http://127.0.0.1:9636/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genes: genes, context: msg + '\\nBased on: ' + ctx })
        })
        .then(r => r.json())
        .then(data => {
            summaryBox.innerText += '\\n\\nUser: ' + msg + '\\nAI: ' + (data.reply || data.error);
        });
    }
    </script>
</body>
</html>
