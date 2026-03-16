<?php
// chat_page.php
ini_set('display_startup_errors', 0);
ini_set('display_errors', 0);
error_reporting(0);

// Include Parsedown library - adjust path if necessary
require_once __DIR__ . '/parsedown-master/Parsedown.php';

// Get initial context (conversation history including summary) from POST
$initial_chat_context_json = isset($_POST['chat_context']) ? $_POST['chat_context'] : '[]';
$genes_searched = isset($_POST['genes_searched']) ? htmlspecialchars($_POST['genes_searched']) : 'Unknown';

// Decode to potentially display the initial summary, then re-encode safely for JS
$initial_chat_context_array = json_decode($initial_chat_context_json, true);
$initial_display_html = '<p>Starting chat session...</p>'; // Default

if (is_array($initial_chat_context_array) && !empty($initial_chat_context_array)) {
    $initial_display_html = ''; // Clear default message
    $parsedown = new Parsedown();
    // Display the entire initial history (usually user prompt + AI summary)
    foreach($initial_chat_context_array as $message) {
        if (isset($message['role']) && isset($message['content'])) {
            if ($message['role'] === 'user') {
                // You might not want to display the initial system/user prompt that generated the summary
                // $initial_display_html .= '<div class="user-prompt">' . htmlspecialchars($message['content']) . '</div>';
            } elseif ($message['role'] === 'assistant') {
                $summary_markdown = $message['content'];
                // Remove the initial "**BioSummarAI:** " if present, as we add it via CSS/structure
                $summary_markdown = preg_replace('/^\*\*BioSummarAI:\*\*\s*/', '', $summary_markdown);
                $initial_display_html .= '<div class="ai-reply"><p><strong>BioSummarAI (Summary Context):</strong></p>' . $parsedown->text($summary_markdown) . '</div>';
            }
        }
    }
     if(empty($initial_display_html)) { // Fallback if history structure wasn't as expected
         $initial_display_html = '<p>Chat context loaded. Ask a question below.</p>';
     }
} else {
    // If context is empty or invalid, ensure JS gets an empty array
    $initial_chat_context_json = '[]';
}

// Safely encode the context string for embedding into JavaScript
$initial_chat_context_for_js = htmlspecialchars($initial_chat_context_json, ENT_QUOTES, 'UTF-8');

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BioSummarAI - Chat</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link href="../css/bmain.css" rel="stylesheet" type="text/css" />
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
        .chat-container { max-width: 800px; margin: auto; background-color: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px; }
        #chatbox {
            height: 500px; overflow-y: auto; border: 1px solid #ccc; padding: 15px;
            margin-bottom: 15px; background-color: #f9f9f9; border-radius: 4px; line-height: 1.6;
        }
        /* Common styles for chat messages */
        .message-bubble { padding: 10px 15px; border-radius: 15px; margin-bottom: 10px; max-width: 85%; word-wrap: break-word; }
        .message-bubble p:first-child { margin-top: 0; }
        .message-bubble p:last-child { margin-bottom: 0; }
        .user-prompt-container { display: flex; justify-content: flex-end; }
        .user-prompt { background-color: #d1ecf1; border: 1px solid #bee5eb; text-align: right; }
        .ai-reply-container { display: flex; justify-content: flex-start; }
        .ai-reply { background-color: #e9ecef; border: 1px solid #ced4da; text-align: left; }
        .chat-input-area { display: flex; align-items: stretch; margin-top: 15px; } /* Align items stretch */
        #text-input {
            flex-grow: 1; padding: 10px; font-size: 16px; border-radius: 4px 0 0 4px; /* Adjust radius */
            border: 1px solid #ccc; border-right: none; resize: none; /* Prevent manual resize */
            height: auto; /* Allow height to adjust */
            min-height: 40px; /* Set a minimum height */
        }
        #send-btn { /* Style from list.php */
            background: #007bff; border: 1px solid #007bff; color: white;
            font-size: 16px; padding: 10px 15px; border-radius: 0 4px 4px 0; /* Adjust radius */
            cursor: pointer; transition: background-color 0.2s; white-space: nowrap;
        }
        #send-btn:hover { background-color: #0056b3; border-color: #0056b3; }
        #send-btn:disabled { background-color: #6c757d; border-color: #6c757d; cursor: not-allowed; }
        #loadingIndicator { display: none; margin-left: 10px; align-self: center; } /* Align center vertically */
        /* Simple spinner */
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        /* Markdown generated elements styling */
        .ai-reply ul, .ai-reply ol { padding-left: 20px; margin-top: 0.5em; margin-bottom: 0.5em; }
        .ai-reply li { margin-bottom: 0.25em; }
        .ai-reply h1, .ai-reply h2, .ai-reply h3, .ai-reply h4 { margin-bottom: 0.5em; margin-top: 1em; }
        .ai-reply strong, .ai-reply b { font-weight: bold; }
        .ai-reply code { background-color: #eee; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        .ai-reply pre { background-color: #eee; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .ai-reply pre code { background-color: transparent; padding: 0; }
    </style>
</head>
<body>

<div class="chat-container">
    <h2>BioSummarAI Chat</h2>
    <p>Chatting about gene(s): <?php echo $genes_searched; ?></p>

    <div id="chatbox">
        <?php echo $initial_display_html; // Display initial context/summary ?>
    </div>

    <div class="chat-input-area">
        <textarea id="text-input" rows="2" placeholder="Ask a follow-up question..."></textarea>
        <button id="send-btn">Send</button>
        <div id="loadingIndicator"><div class="loader"></div></div>
    </div>
</div>

<script>
    // --- Configuration & Initialization ---
    const chatbox = document.getElementById('chatbox');
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('send-btn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    let conversation_history = [];

    // Safely parse the initial context passed from PHP
    try {
        const initialContextString = '<?php echo $initial_chat_context_for_js; ?>';
        // Basic check if it looks like a JSON array/object before parsing
        if (initialContextString && initialContextString.trim().startsWith('[')) {
             conversation_history = JSON.parse(initialContextString);
             console.log("Initial conversation history loaded:", conversation_history);
        } else {
             console.warn("Initial chat context from PHP was not a valid JSON array string:", initialContextString);
             // Add a default system message if history is empty
             conversation_history.push({ role: "system", content: "You are a helpful assistant specializing in biomedical literature. Discuss the summary provided earlier." });
        }
    } catch (e) {
        console.error("Error parsing initial conversation history:", e);
         // Add a default system message if parsing failed
        conversation_history = [{ role: "system", content: "You are a helpful assistant specializing in biomedical literature." }];
    }


    // --- Helper Functions ---
    function scrollChatToBottom() {
        // Use setTimeout to allow the DOM to update before scrolling
        setTimeout(() => {
            chatbox.scrollTop = chatbox.scrollHeight;
        }, 0);
    }

    // Function to add a message bubble to the chatbox
    function addMessage(content, type) {
        const messageContainer = document.createElement('div');
        const messageDiv = document.createElement('div');

        messageContainer.classList.add(type === 'user' ? 'user-prompt-container' : 'ai-reply-container');
        messageDiv.classList.add('message-bubble', type === 'user' ? 'user-prompt' : 'ai-reply');

        // Render Markdown for AI replies
        if (type === 'ai') {
             // Remove potential initial "**BioSummarAI:** " prefix before rendering
            let markdownContent = content.replace(/^\*\*BioSummarAI:\*\*\s*/, '');
            // Use marked.parse, ensure it's loaded
            if (typeof marked !== 'undefined') {
                messageDiv.innerHTML = marked.parse(markdownContent || " "); // Ensure empty string if content is null/undefined
            } else {
                console.error("marked.js library not loaded!");
                messageDiv.textContent = markdownContent || ""; // Fallback to text
            }
        } else {
            messageDiv.textContent = content || ""; // User text as plain text
        }

        messageContainer.appendChild(messageDiv);
        chatbox.appendChild(messageContainer);
        scrollChatToBottom();
    }

    // --- Send Message Logic ---
    function sendMessage() {
        const userPrompt = textInput.value.trim();
        if (userPrompt === "") {
            // Optionally provide visual feedback instead of alert
            // textInput.style.borderColor = 'red';
            return;
        }
        // textInput.style.borderColor = ''; // Reset border color

        console.log("Sending message:", userPrompt);

        // Add user message to chatbox immediately
        addMessage(userPrompt, 'user');
        textInput.value = ""; // Clear input
        loadingIndicator.style.display = 'inline-block'; // Show spinner
        sendBtn.disabled = true; // Disable send button
        textInput.disabled = true; // Disable input field

        // Make sure conversation_history is an array
        if (!Array.isArray(conversation_history)) {
             console.error("Conversation history is not an array:", conversation_history);
             conversation_history = []; // Reset if corrupted
        }

        console.log("Sending history:", JSON.stringify(conversation_history)); // Log history being sent

        // Send prompt and current history to backend
        fetch("apicall2biosummary.php", { // Use the main API endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json" // Explicitly accept JSON
             },
            body: JSON.stringify({ prompt: userPrompt, genes: null, conversation_history: conversation_history })
        })
        .then(response => {
             if (!response.ok) {
                 // Try to get error text from response body if possible
                 return response.text().then(text => {
                     throw new Error(`HTTP error ${response.status}: ${response.statusText}. Response: ${text}`);
                 });
             }
             return response.json(); // Only call json() if response is ok
        })
        .then(data => {
            console.log("Received data:", data); // Log the full response

            if (data.status === "success" && data.data && data.data.reply && data.data.conversation_history) {
                console.log("API responded successfully");
                addMessage(data.data.reply, 'ai'); // Add AI response
                // CRITICAL: Update history with the response from the backend
                conversation_history = data.data.conversation_history;
                console.log("Updated conversation_history length:", conversation_history.length);
            } else {
                // Handle cases where status might be success but data is missing/wrong
                console.error("Chat API call failed or returned unexpected data structure:", data);
                let errorMessage = "Sorry, I couldn't get a valid response. Please try again.";
                if(data.message) {
                    errorMessage = `Error: ${data.message}`;
                } else if (data.backend_response) {
                    errorMessage = `Backend Error: ${data.backend_response.substring(0, 100)}...`; // Show partial backend error
                }
                addMessage(errorMessage, 'ai');
                // Do NOT update conversation_history on failure
            }
        })
        .catch(error => {
            console.error("Fetch Error in sendMessage:", error);
            // Provide more specific feedback if possible
            addMessage(`Sorry, an error occurred while contacting the server: ${error.message}. Please check logs or try again later.`, 'ai');
            // Do NOT update conversation_history on fetch failure
        })
        .finally(() => {
             // This block executes whether the fetch succeeded or failed
             loadingIndicator.style.display = 'none'; // Hide spinner
             sendBtn.disabled = false; // Re-enable send button
             textInput.disabled = false; // Re-enable input field
             textInput.focus(); // Set focus back to input
             scrollChatToBottom(); // Ensure scrolled down after potential error message
        });
    }

    // --- Event Listeners ---
    $(document).ready(function() {
        scrollChatToBottom(); // Initial scroll after loading context

        // Send message on button click
        sendBtn.addEventListener('click', sendMessage);

        // Send message on Enter key press in textarea (Shift+Enter for newline)
        textInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default newline behavior
                sendMessage();
            }
        });

        // Auto-adjust textarea height (optional but nice)
        textInput.addEventListener('input', function () {
            this.style.height = 'auto'; // Reset height
            this.style.height = (this.scrollHeight) + 'px'; // Set to scroll height
        });

    });

</script>

<?php // include(__DIR__ . '/../inc/template_footer.php'); // Optional: Include footer template ?>

</body>
</html>
