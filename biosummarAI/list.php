<?php
// list.php
ini_set('display_errors', 0);
error_reporting(0);
require_once __DIR__ . '/parsedown-master/Parsedown.php';

$processed_results = $_POST['processed_results'] ?? [];
$genes_array_input = $_POST['genes_array_input'] ?? [];
$error_message = $_POST['error_message'] ?? '';
$executionTime = $_POST['execution_time'] ?? 0;
$search_type = $_POST['final_search_type'] ?? 'union';
$result_limit_reached = $_POST['result_limit_reached'] ?? false;

// Safely get raw genes display string
$genes_raw_val = $_POST['genes_raw'] ?? $genes_array_input;
$genes_display = is_array($genes_raw_val) ? implode(", ", $genes_raw_val) : strval($genes_raw_val);

$page_content = '';

if (!empty($error_message)) {
    $page_content .= $error_message;
}

if (!empty($genes_array_input)) {
    $page_content .= "<p>Search for gene(s): <strong>" . htmlspecialchars($genes_display) . "</strong></p>";
    
    if (count($genes_array_input) > 1) {
        if ($search_type === 'intersection') {
            $page_content .= "<p style='color:#0056b3'>ℹ️ Displaying <b>COMMON</b> results: Records containing <b>ALL</b> " . count($genes_array_input) . " searched genes.</p>";
        } else {
            $page_content .= "<p style='color:#28a745'>ℹ️ Displaying <b>RELATED</b> results: Records containing <b>ANY</b> of the searched genes.</p>";
        }
        $page_content .= "<p><i>Sorted by relevance (number of searched genes found in each record).</i></p>";
    }
}

$numOfRecordsFound = count($processed_results);
if (empty($error_message)) {
    $page_content .= "<p>Found " . htmlspecialchars($numOfRecordsFound) . " record(s) in " . round($executionTime, 2) . " seconds.</p>";
    
    // Display limit warning if applicable
    if ($result_limit_reached && $numOfRecordsFound > 0) {
        $page_content .= "<p style='color:#ff6600; font-weight:bold;'>⚠️ Note: Results limited to " . $numOfRecordsFound . " records for performance. There may be additional results available.</p>";
    }
}

if ($numOfRecordsFound > 0) {
    // --- Summary & Chat Interface Placeholders ---
    $page_content .= '<button type="button" id="showSummaryChatBtn" class="send-btn" style="margin-bottom: 15px;">✨ Show Summary & Chat</button>';
    $page_content .= '<div id="loadingIndicatorSummary" style="display: none; margin-bottom: 15px;"><span class="loader"></span> Generating AI Summary...</div>';

    $page_content .= '<div id="summaryContainer" style="display: none; border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9; max-height: 400px; overflow-y: auto; line-height: 1.6;">';
    $page_content .= '<h3>AI Generated Summary (Based on top results):</h3>';
    $page_content .= '<div id="summaryContent"></div>';
    $page_content .= '</div>';

    $page_content .= '<div id="chatInterface" style="display: none;">';
    $page_content .= '<h3>Chat about this Summary (10 message limit)</h3>';
    $page_content .= '<div id="chatbox" style="height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; background-color: #f9f9f9; border-radius: 4px; line-height: 1.6;"></div>';
    $page_content .= '<div class="chat-input-area" style="display: flex; align-items: stretch; margin-top: 15px;">';
    $page_content .= '<textarea id="text-input" rows="2" placeholder="Ask a follow-up question..." style="flex-grow: 1; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-right: none; resize: none; min-height: 40px;"></textarea>';
    $page_content .= '<button id="send-btn" class="send-btn" style="border-radius: 0 4px 4px 0;">Send</button>';
    $page_content .= '<div id="loadingIndicatorChat" style="display: none; margin-left: 10px; align-self: center;"><span class="loader"></span></div>';
    $page_content .= '</div></div>';

    // --- Results Table ---
    $page_content .= '<hr><h4>Detailed Results:</h4>';
    $page_content .= '<table border="1" cellpadding="5" cellspacing="0" id="resultsTable" style="border-collapse: collapse; width: 100%; font-size: 12px;">';
    $page_content .= '<thead><tr bgcolor="#A5C3D6">';
    $page_content .= '<th align="center">PubMed</th>';
    $page_content .= '<th align="center">Sentences</th>';
    $page_content .= '<th align="center">Matched Genes</th>';
    $page_content .= '<th align="center">All Gene Symbols</th>';
    $page_content .= '<th align="center">Drug Terms</th>';
    $page_content .= '<th align="center">HDO Terms</th>';
    $page_content .= '</tr></thead><tbody>';

    $sentences_js_array = [];
    $row_count = 0;
    foreach ($processed_results as $row) {
        if ($row_count < 300) { $sentences_js_array[] = $row['sentences'] ?? ''; }
        
        $page_content .= '<tr bgcolor="#F5FAF7">';
        $page_content .= '<td valign="top"><a href="http://www.ncbi.nlm.nih.gov/pubmed/' . htmlspecialchars($row['pmid'] ?? '') . '" target="_blank">' . htmlspecialchars($row['pmid'] ?? '') . '</a></td>';
        $page_content .= '<td>' . htmlspecialchars($row['sentences'] ?? '') . '</td>';
        // New column: Number of searched genes found in this record
        $match_count = isset($row['searched_gene_count']) ? $row['searched_gene_count'] : 0;
        $match_style = ($match_count == count($genes_array_input)) ? 'font-weight:bold; color:green;' : '';
        $page_content .= '<td valign="top" align="center" style="' . $match_style . '">' . $match_count . '/' . count($genes_array_input) . '</td>';
        $page_content .= '<td valign="top">' . htmlspecialchars($row['gene_symbols'] ?? '') . '</td>';
        $page_content .= '<td valign="top">' . htmlspecialchars($row['drug_term'] ?? '') . '</td>';
        $page_content .= '<td valign="top">' . htmlspecialchars($row['hdo_term'] ?? '') . '</td>';
        $page_content .= '</tr>';
        $row_count++;
    }
    $page_content .= '</tbody></table>';

    $sentences_json = json_encode($sentences_js_array, JSON_HEX_TAG|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_HEX_AMP) ?: '[]';
}

echo $page_content;

if ($numOfRecordsFound > 0): ?>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
// Pass PHP data to JS safely
const sentencesForSummary = <?php echo $sentences_json; ?>;
const searchInstructions = "Summarize findings for these genes: <?php echo addslashes(implode(', ', $genes_array_input)); ?>. Focus on their interactions and roles.";

// --- UI References ---
const ui = {
    summaryBtn: document.getElementById("showSummaryChatBtn"),
    summaryLoader: document.getElementById("loadingIndicatorSummary"),
    summaryBox: document.getElementById("summaryContainer"),
    summaryContent: document.getElementById("summaryContent"),
    chatBox: document.getElementById("chatInterface"),
    chatMessages: document.getElementById("chatbox"),
    chatInput: document.getElementById("text-input"),
    chatSend: document.getElementById("send-btn"),
    chatLoader: document.getElementById("loadingIndicatorChat")
};

let chatHistory = [];

// --- Functions ---
function scrollChat() { setTimeout(() => { if(ui.chatMessages) ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight; }, 50); }

function renderMarkdown(text) {
    text = String(text || "").replace(/^\*\*BioSummarAI:\*\*\s*/, "");
    return (typeof marked !== "undefined") ? marked.parse(text, {sanitize: false}) : text;
}

function addMessage(text, sender) {
    if (!ui.chatMessages) return;
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${sender === 'ai' ? 'ai-reply' : 'user-prompt'}`;
    
    if (sender === 'ai') bubble.innerHTML = renderMarkdown(text);
    else bubble.textContent = text;

    const container = document.createElement("div");
    container.className = sender === 'ai' ? 'ai-reply-container' : 'user-prompt-container';
    container.appendChild(bubble);
    ui.chatMessages.appendChild(container);
    scrollChat();
}

function callAPI(endpoint, payload, onSuccess, onError, onFinally) {
    fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(`${r.status}: ${t}`) }))
    .then(onSuccess)
    .catch(onError)
    .finally(onFinally);
}

// --- Actions ---
function getSummary() {
    ui.summaryLoader.style.display = "inline-block";
    ui.summaryBtn.style.display = "none";
    
    callAPI("apicall2biosummary.php", {
        raw_sentences: sentencesForSummary.join("\n\n"),
        prompt_instructions: searchInstructions,
        conversation_history: null
    }, data => { // Success
        if (data.status === "success" && data.data?.reply) {
            ui.summaryContent.innerHTML = renderMarkdown(data.data.reply);
            ui.summaryBox.style.display = "block";
            ui.chatBox.style.display = "block";
            chatHistory = data.data.conversation_history || [];
            ui.chatMessages.innerHTML = '';
            addMessage(data.data.reply, 'ai');
        } else {
            throw new Error(data.message || "Invalid response format");
        }
    }, err => { // Error
        console.error("Summary Failed:", err);
        ui.summaryContent.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        ui.summaryBox.style.display = "block";
        ui.summaryBtn.style.display = "inline-block";
    }, () => { // Finally
        ui.summaryLoader.style.display = "none";
    });
}

function sendChat() {
    // --- MODIFICATION: Check chat limit at the START ---
    // The initial history from getSummary() contains 1 simulated 'user' message.
    // We allow 10 more real 'user' messages, for a total of 11.
    const userMessagesCount = chatHistory.filter(m => m.role === 'user').length;
    
    if (userMessagesCount >= 11) {
        addMessage("You have reached the 10-message limit for this session.", 'ai');
        ui.chatInput.disabled = true;
        ui.chatSend.disabled = true;
        ui.chatInput.placeholder = "Chat limit reached.";
        return; // Stop the function
    }
    // --- END MODIFICATION ---
    
    const prompt = ui.chatInput.value.trim();
    if (!prompt) return;
    
    ui.chatInput.value = "";
    ui.chatInput.disabled = ui.chatSend.disabled = true; // <-- Disable during request
    ui.chatLoader.style.display = "inline-block";
    addMessage(prompt, 'user');
    
    if (!chatHistory.length) chatHistory.push({role: "system", content: "You are a helpful biomedical assistant."});
    
    callAPI("apicall2biosummary.php", {
        prompt: prompt,
        conversation_history: chatHistory
    }, data => { // Success
        if (data.status === "success" && data.data?.reply) {
            addMessage(data.data.reply, 'ai');
            if (Array.isArray(data.data.conversation_history)) chatHistory = data.data.conversation_history;
            // --- MODIFICATION: Removed the second limit check from here ---
        } else {
            throw new Error(data.message || "Invalid response");
        }
    }, err => { // Error
        console.error("Chat Failed:", err);
        addMessage(`Error: ${err.message}`, 'ai');
    }, () => { // Finally
        // --- MODIFICATION: This is the new, correct logic ---
        
        // Check the count *after* the API call has returned and history is updated
        const finalUserMessagesCount = chatHistory.filter(m => m.role === 'user').length;

        if (finalUserMessagesCount >= 11) {
             // Limit is reached, keep it disabled
             ui.chatInput.disabled = true;
             ui.chatSend.disabled = true;
             ui.chatInput.placeholder = "Chat limit reached.";
             // Add a final message
             setTimeout(() => addMessage("You have reached the 10-message limit for this session.", 'ai'), 500);
        } else {
             // Limit not reached, re-enable
             ui.chatInput.disabled = ui.chatSend.disabled = false;
             ui.chatInput.focus();
        }
        ui.chatLoader.style.display = "none";
        // --- END MODIFICATION ---
    });
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    if(ui.summaryBtn) ui.summaryBtn.addEventListener("click", getSummary);
    if(ui.chatSend) ui.chatSend.addEventListener("click", sendChat);
    if(ui.chatInput) {
        ui.chatInput.addEventListener("keypress", e => { if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } });
        ui.chatInput.addEventListener("input", function() { this.style.height = "auto"; this.style.height = this.scrollHeight + "px"; });
    }
});
</script>
<style>
/* Combined styles for simplicity */
.send-btn { background:#007bff; border:none; color:white; padding:10px 15px; border-radius:4px; cursor:pointer; }
.send-btn:hover { opacity:0.9; } .send-btn:disabled { background:#ccc; cursor:not-allowed; }
.loader { border:3px solid #f3f3f3; border-top:3px solid #3498db; border-radius:50%; width:18px; height:18px; animation:spin 1s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.message-bubble { padding:10px 15px; border-radius:15px; margin-bottom:10px; max-width:85%; word-wrap:break-word; }
.user-prompt-container { display:flex; justify-content:flex-end; } .user-prompt { background:#d1ecf1; color:#0c5460; }
.ai-reply-container { display:flex; justify-content:flex-start; } .ai-reply { background:#e9ecef; color:#212529; }
.ai-reply pre { background:#dee2e6; padding:10px; border-radius:4px; overflow-x:auto; }
</style>
<?php endif; ?>
