from flask import Flask, request
import pandas as pd
from rich.console import Console
import json
import os
import openai
from transformers import GPT2Tokenizer # Only for token counting
from dotenv import load_dotenv
import mysql.connector
from rich.markdown import Markdown

load_dotenv()  # Load variables from .env file
api_key = os.getenv('OPENAI_API_KEY')
if api_key:
    openai.api_key = api_key
else:
    print("[ERROR] OPENAI_API_KEY not found in .env file.")

app = Flask(__name__)

# --- Database Connection ---
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_DATABASE'),
            connect_timeout=10
        )
        if connection.is_connected():
             print("Database connection successful.")
             return connection
        else:
             print("[ERROR] Failed to connect to database.")
             return None
    except mysql.connector.Error as err:
        print(f"[ERROR] Database Connection Error: {err}")
        return None
    except Exception as e:
        print(f"[ERROR] Unexpected error during DB connection: {e}")
        return None


console = Console()
# Initialize tokenizer safely
try:
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
except Exception as e:
    print(f"[ERROR] Could not load GPT2Tokenizer: {e}. Token counting might be inaccurate.")
    tokenizer = None

# --- Token Counting and Chunking ---
def estimate_token_count(text):
    if not tokenizer: return len(text.split())
    if not isinstance(text, str): text = str(text)
    try:
        token_ids = tokenizer.encode(text)
        return len(token_ids)
    except Exception as e:
        print(f"[WARN] Tokenizer encoding error: {e}. Falling back to word count.")
        return len(text.split())


def split_text(text, token_limit):
    if not tokenizer:
        words = text.split()
        chunks = []
        current_chunk_words = []
        current_word_count = 0
        for word in words:
             current_chunk_words.append(word)
             current_word_count += 1
             if current_word_count * 1.5 > token_limit:
                 chunks.append(" ".join(current_chunk_words))
                 current_chunk_words = []
                 current_word_count = 0
        if current_chunk_words:
             chunks.append(" ".join(current_chunk_words))
        return chunks

    tokens = tokenizer.encode(text)
    chunks = []
    current_chunk_tokens = []
    for token in tokens:
        current_chunk_tokens.append(token)
        if len(current_chunk_tokens) >= token_limit:
            chunks.append(tokenizer.decode(current_chunk_tokens, skip_special_tokens=True))
            current_chunk_tokens = []

    if current_chunk_tokens:
        chunks.append(tokenizer.decode(current_chunk_tokens, skip_special_tokens=True))

    print(f"Split text into {len(chunks)} chunks.")
    return chunks


# --- OpenAI Interaction Functions ---

def get_initial_summary_with_gpt4o(data_input, instructions=""):
    """
    Generates an initial summary using GPT-4o from either a DataFrame or raw text,
    applying specific instructions.
    """
    console.print("[bold green]Generating initial summary...[/bold green]")
    model_context_limit = 128000
    safety_margin = 5000
    token_limit = model_context_limit - safety_margin
    max_summary_tokens = 400

    combined_text = ""
    if isinstance(data_input, pd.DataFrame):
        combined_text = '\n'.join(data_input.apply(lambda row: 'PMID: {} | Sent: {} | Genes: {} | Drug: {} | HDO: {}'.format(
            row.get('pmid', 'NA'),
            row.get('sentences', 'NA'),
            row.get('gene_symbols', 'NA'),
            row.get('drug_term', 'NA'),
            row.get('hdo_term', 'NA')
        ), axis=1))
    elif isinstance(data_input, str):
        combined_text = data_input
    else:
        return {"reply": "Error: Invalid input type for summary.", "conversation_history": []}

    if not combined_text.strip():
         return {"reply": "Error: Input data for summary is empty.", "conversation_history": []}

    input_token_count = estimate_token_count(combined_text)
    console.print(f"Approximate input token count: {input_token_count}")

    summaries = []
    default_instructions = ("Summarize the key findings from these biomedical sentences. "
                            "Focus primarily on the gene symbols mentioned, their relationships, functions, "
                            "and context provided by the sentences. Mention relevant HDO terms or drug terms "
                            "if they provide significant context to the gene interactions. "
                            "Keep the summary concise and objective, within approximately 250 words.")
    final_instructions = instructions if instructions else default_instructions

    initial_prompt_template = (
        f"{final_instructions}\n\n"
        "Data:\n"
        "'{chunk_text}'"
        "\n\nSummary:"
    )

    text_to_process = combined_text
    if input_token_count > token_limit:
        console.print(f"Input exceeds token limit ({token_limit}), splitting text...")
        text_chunks = split_text(combined_text, token_limit)
        max_chunks_to_process = 5
        if len(text_chunks) > max_chunks_to_process:
             console.print(f"[WARN] Too many chunks ({len(text_chunks)}). Processing only the first {max_chunks_to_process}.")
             text_chunks = text_chunks[:max_chunks_to_process]

        for i, chunk in enumerate(text_chunks):
            console.print(f"Processing chunk {i+1} of {len(text_chunks)}...")
            prompt = initial_prompt_template.format(chunk_text=chunk)
            try:
                response = openai.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=max_summary_tokens // len(text_chunks) if len(text_chunks) > 0 else max_summary_tokens,
                    timeout=60
                )
                summaries.append(response.choices[0].message.content)
            except Exception as e:
                console.print(f"[bold red]Error processing chunk {i+1}:[/bold red] {e}")
                summaries.append(f"[Error summarizing chunk {i+1}: {str(e)}]")
        if len(summaries) > 1:
            console.print("Combining chunk summaries...")
            combine_prompt = (
                "Combine the following chunk summaries into one cohesive final summary, adhering to the original instructions "
                "(focus on gene symbols, relationships, context, ~250 words total). Do not just list the chunk summaries.\n\n"
                + "\n\n---\n\n".join(summaries)
                + "\n\nCombined Summary:"
            )
            try:
                 final_response = openai.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": combine_prompt}],
                    temperature=0.1,
                    max_tokens=max_summary_tokens + 100,
                    timeout=60
                 )
                 final_summary = final_response.choices[0].message.content
                 text_to_process = final_summary
            except Exception as e:
                 console.print(f"[bold red]Error combining summaries:[/bold red] {e}")
                 text_to_process = "\n".join(summaries)
        elif len(summaries) == 1:
             text_to_process = summaries[0]
        else:
             return {"reply": "Error: No summaries generated from chunks.", "conversation_history": []}

    else:
        prompt = initial_prompt_template.format(chunk_text=combined_text)
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=max_summary_tokens + 50,
                timeout=90
            )
            text_to_process = response.choices[0].message.content
        except Exception as e:
            console.print(f"[bold red]An error occurred during initial summary API call:[/bold red] {e}")
            return {"reply": f"Error during summary generation: {str(e)}", "conversation_history": []}

    initial_conversation = [
        {"role": "system", "content": "You are a helpful assistant discussing biomedical literature focusing on specific genes."},
        {"role": "user", "content": f"Summarize the provided data ({final_instructions})"},
        {"role": "assistant", "content": text_to_process}
    ]
    return {"reply": f"{text_to_process}", "conversation_history": initial_conversation}


def chat_with_openai_cont(conv, prompt):
    console.print(f"Received prompt for continuation: {prompt}")
    if not conv or not isinstance(conv, list):
        console.print("[WARN] Invalid or empty conversation history received. Starting fresh.")
        conv = [{"role": "system", "content": "You are a helpful assistant specializing in biomedical literature."}]

    modified_prompt = f"{prompt}\n\n(Please keep your response concise, around 50 words.)"
    conv.append({"role": "user", "content": modified_prompt})

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=conv,
            temperature=0.5,
            max_tokens=100,
            timeout=60
        )
        assistant_reply = response.choices[0].message.content
        conv.append({"role": "assistant", "content": assistant_reply})
        console.print(Markdown(f"**BioSummarAI:** {assistant_reply}"))
        return {"reply": f"{assistant_reply}", "conversation_history": conv}
    except Exception as e:
        console.print(f"[bold red]An error occurred during chat API call:[/bold red] {e}")
        if conv and conv[-1]["role"] == "user": conv.pop()
        return {"reply": f"Sorry, an error occurred: {str(e)}", "conversation_history": conv}


# --- Flask Route ---
@app.route('/biobert/', methods=['POST'])
def biobert():
    global api_key
    if not api_key:
         load_dotenv()
         api_key = os.getenv('OPENAI_API_KEY')
         if api_key:
             openai.api_key = api_key
         else:
              print("[ERROR] OpenAI API key is still not configured.")
              return json.dumps({"Summary": {"reply": "OpenAI API key is not configured.", "conversation_history": []}})

    response_text = {"reply": "Invalid request. Provide genes, raw_sentences, or prompt+history.", "conversation_history": []}
    try:
        input_data = request.get_data(as_text=True)
        json_data = json.loads(input_data)

        genes = json_data.get("genes")
        conversation_h = json_data.get("conversation_history")
        prompt = json_data.get("prompt")
        raw_sentences = json_data.get("raw_sentences")
        prompt_instructions = json_data.get("prompt_instructions")

        console.print("--- Request Received ---")
        console.print(f"Genes: {genes}")
        console.print(f"Prompt: {prompt is not None}")
        console.print(f"Raw Sentences Provided: {raw_sentences is not None}")

        # Mode 1: Chat Continuation
        if conversation_h is not None and prompt is not None:
            console.print("Mode: Chat Continuation")
            response_text = chat_with_openai_cont(conversation_h, prompt)

        # Mode 2: Initial Summary from Raw Sentences
        elif raw_sentences is not None:
            console.print("Mode: Summary from Raw Sentences")
            if isinstance(raw_sentences, str) and raw_sentences.strip():
                 response_text = get_initial_summary_with_gpt4o(raw_sentences, prompt_instructions)
            else:
                 response_text = {"reply": "No valid sentences provided to summarize.", "conversation_history": []}

        # Mode 3: Initial Summary from Gene Search (Legacy)
        elif genes:
            console.print("Mode: Summary from Gene Search (Database Query - Fallback)")
            conn = get_db_connection()
            df = pd.DataFrame()
            if conn and conn.is_connected():
                cursor = conn.cursor(dictionary=True)
                try:
                    sanitized_genes_tuple = tuple(g for g in genes if isinstance(g, str) and g.isalnum())
                    if sanitized_genes_tuple:
                        placeholders = ', '.join(['%s'] * len(sanitized_genes_tuple))
                        query_pmid = f"SELECT DISTINCT t.pmid FROM t_gene_pairs AS t WHERE t.gene_symbol1 IN ({placeholders}) OR t.gene_symbol2 IN ({placeholders}) LIMIT 1000"
                        cursor.execute(query_pmid, sanitized_genes_tuple * 2)
                        results_pmids = cursor.fetchall()
                        pmid_list = [row["pmid"] for row in results_pmids]

                        if pmid_list:
                            pmid_placeholders = ', '.join(['%s'] * len(pmid_list))
                            query_sentences = f"SELECT pmid, sentences, drug_term, hdo_term, gene_symbols FROM t_biosummary WHERE pmid IN ({pmid_placeholders}) LIMIT 500"
                            cursor.execute(query_sentences, tuple(pmid_list))
                            results_sentences = cursor.fetchall()
                            df = pd.DataFrame(results_sentences)
                        else: console.print("No PMIDs found for genes.")
                    else: console.print("No valid genes for DB query.")

                    if not df.empty:
                        response_text = get_initial_summary_with_gpt4o(df, prompt_instructions)
                    else:
                        response_text = {"reply": "No data found for the provided genes in the database.", "conversation_history": []}
                except mysql.connector.Error as db_err:
                    console.print(f"[bold red]Database query error:[/bold red] {db_err}")
                    response_text = {"reply": f"Database error: {str(db_err)}", "conversation_history": []}
                finally:
                     if cursor: cursor.close()
                     if conn and conn.is_connected(): conn.close()
                     print("Database connection closed.")
            else:
                 response_text = {"reply": "Failed to connect to the database.", "conversation_history": []}
        else:
             console.print("[WARN] Received request with no valid mode.")

    except json.JSONDecodeError as json_err:
        console.print(f"[bold red]Error: Invalid JSON input:[/bold red] {json_err}")
        response_text = {"reply": f"Error: Invalid JSON input - {str(json_err)}", "conversation_history": []}
    except openai.RateLimitError as rate_err:
         console.print(f"[bold red]OpenAI Rate Limit Error:[/bold red] {rate_err}")
         response_text = {"reply": f"OpenAI Error: You have exceeded your API quota. Please check your billing details. ({rate_err.code})", "conversation_history": []}
    except openai.APIConnectionError as conn_err:
         console.print(f"[bold red]OpenAI Connection Error:[/bold red] {conn_err}")
         response_text = {"reply": f"OpenAI Error: Could not connect to API. {str(conn_err)}", "conversation_history": []}
    except openai.AuthenticationError as auth_err:
         console.print(f"[bold red]OpenAI Authentication Error:[/bold red] {auth_err}")
         response_text = {"reply": f"OpenAI Error: Invalid API Key. Please check configuration. ({auth_err.code})", "conversation_history": []}
    except Exception as e:
        console.print(f"[bold red]An unexpected error occurred in POST:[/bold red] {e}")
        response_text = {"reply": f"Internal Server Error: {str(e)}", "conversation_history": []}

    console.print("--- Sending Response ---")
    json_response = json.dumps({"Summary": response_text})
    return app.response_class(response=json_response, status=200, mimetype='application/json')


if __name__ == "__main__":
    from waitress import serve
    print("Starting BioSummarAI service on http://0.0.0.0:9636/")
    serve(app, host="0.0.0.0", port=9636)
