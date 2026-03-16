import os
os.environ.setdefault('HF_HOME', os.path.join(os.path.dirname(os.path.abspath(__file__)), '.hf_cache'))

from flask import Flask, request
from functools import lru_cache
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from torch.utils.data import TensorDataset, DataLoader, SequentialSampler
import numpy as np
import re
import pandas as pd
from io import StringIO


app = Flask(__name__)

MAX_LEN = 128
BATCH_SIZE = 16


def pad_sequences(sequences, maxlen, dtype='int64', truncating='post', padding='post', value=0):
    """Pad sequences to uniform length (replaces keras_preprocessing.sequence.pad_sequences)."""
    result = np.full((len(sequences), maxlen), value, dtype=dtype)
    for i, seq in enumerate(sequences):
        if len(seq) == 0:
            continue
        if truncating == 'post':
            trunc = seq[:maxlen]
        else:
            trunc = seq[-maxlen:]
        if padding == 'post':
            result[i, :len(trunc)] = trunc
        else:
            result[i, -len(trunc):] = trunc
    return result


@lru_cache()
def get_model():
    model_path = "metalrt/ignet-biobert"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    INTERACTION_TERMS = 'https://raw.githubusercontent.com/metalrt/protein-interaction-terms/main/interaction_terms.txt'
    interaction_terms_df = pd.read_csv(INTERACTION_TERMS, sep='\t')
    interaction_terms_df.term = interaction_terms_df.term.str.replace('-','')
    interaction_term_and_type_dict = dict(zip(interaction_terms_df.term, interaction_terms_df.type))
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print('There are %d GPU(s) available.' % torch.cuda.device_count())
        print('We will use the GPU:', torch.cuda.get_device_name(0))
        model.cuda()
    else:
        print('No GPU available, using the CPU instead.')
        device = torch.device("cpu")
    model.eval()
    return model, tokenizer, interaction_term_and_type_dict, device

def prepare_input_ids_and_attention_masks(tokenizer, sentences, MAX_LEN, BATCH_SIZE):
    input_ids = []
    for sent in sentences:
        encoded_sent = tokenizer.encode(
                            sent,                      # Sentence to encode.
                            add_special_tokens = True, # Add '[CLS]' and '[SEP]'
                    )

        input_ids.append(encoded_sent)

    input_ids = pad_sequences(input_ids, maxlen=MAX_LEN,
                            dtype="int64", truncating="post", padding="post")

    attention_masks = []

    for seq in input_ids:
        seq_mask = [float(i>0) for i in seq]
        attention_masks.append(seq_mask)

    return input_ids, attention_masks

def prepare_data_loaders(input_ids, attention_masks, labels):
    # Convert to tensors.
    data_inputs = torch.tensor(input_ids)
    data_masks = torch.tensor(attention_masks)
    data_labels = torch.tensor(labels)

    # Create the DataLoader.
    tensor_data = TensorDataset(data_inputs, data_masks, data_labels)
    data_sampler = SequentialSampler(tensor_data)
    data_loader = DataLoader(tensor_data, sampler=data_sampler, batch_size=BATCH_SIZE)
    return data_loader


@app.route('/biobert/', methods=['POST'])
def biobert():
    model, tokenizer, interaction_term_and_type_dict, device = get_model()

    input_data = request.get_data(as_text=True)
    print("new_message", input_data)
    print("------------------------------------------")
    print("web.data:", input_data, type(input_data))

    df = pd.read_json(StringIO(input_data))
    df = df.groupby(['Sentence', 'ID'])['MatchTerm'].apply(list).reset_index(name='MatchTerms')
    merged_df = pd.merge(df, df, how='inner', on=['Sentence']).rename(columns={'MatchTerms_x': 'Entity_1', 'MatchTerms_y': 'Entity_2', 'ID_x': 'ID_1', 'ID_y': 'ID_2'})
    merged_df = merged_df[(merged_df.ID_1 < merged_df.ID_2)]

    groups = merged_df.groupby('Sentence')

    final_data = pd.DataFrame(columns=['AllEntities', 'Entity_1', 'Entity_2', 'Other_Entities', 'Interaction_words', 'OrigSent', 'PreProcessedSent'])
    counter = 0
    for name, group in groups:
        sentence_of_group = group.Sentence.iloc[0]
        annotated_ino_sentence = sentence_of_group
        sentence_words = sentence_of_group.split()
        interaction_words = list()
        for key in interaction_term_and_type_dict.keys():
            if ' ' + key + ' ' in annotated_ino_sentence or key + ' ' in annotated_ino_sentence or ' ' + key in annotated_ino_sentence:
                interaction_words.append(key)
        interaction_words.sort(key=len, reverse=True)
        for ino_term in interaction_words:
            annotated_ino_sentence = re.sub(r'\b' + re.escape(ino_term) + r'\b', '[INT]'+ ino_term + '[/INT]', annotated_ino_sentence, flags=re.IGNORECASE)

        entity_dict1 = dict(zip(group.ID_1, group.Entity_1))
        entity_dict2 = dict(zip(group.ID_2, group.Entity_2))
        entity_dict = {}
        entity_dict.update(entity_dict1)
        entity_dict.update(entity_dict2)
        entity_set1 = {val for value_list in group.Entity_1.values for val in value_list}
        entity_set2 = {val for value_list in group.Entity_2.values for val in value_list}
        all_protein_ids_in_group = set(group.ID_1) | set(group.ID_2)
        all_proteins_in_group = entity_set1 | entity_set2
        for row_index, row in group.iterrows():
            processed_sentence = annotated_ino_sentence
            entity_id1, entity_id2 = row.ID_1, row.ID_2
            protein_id_pair = {entity_id1, entity_id2}
            protein1_names = [protein_name for protein_name in row.Entity_1]
            protein2_names = [protein_name for protein_name in row.Entity_2]
            for protein1 in protein1_names:
                insensitive_protein1 = re.compile(re.escape(protein1), re.IGNORECASE)
                processed_sentence = insensitive_protein1.sub('PROTEIN1', processed_sentence)
            for protein2 in protein2_names:
                insensitive_protein2 = re.compile(re.escape(protein2), re.IGNORECASE)
                processed_sentence = insensitive_protein2.sub('PROTEIN2', processed_sentence)

            other_protein_ids = list(all_protein_ids_in_group - protein_id_pair)
            other_protein_names = list(all_proteins_in_group - (set(protein1_names) | set(protein2_names)) )
            for other_protein in other_protein_names:
                insensitive_other_protein = re.compile(re.escape(other_protein), re.IGNORECASE)
                processed_sentence = insensitive_other_protein.sub('PROTEIN', processed_sentence)
            final_data.loc[counter] = [entity_dict, entity_id1, entity_id2, other_protein_ids, interaction_words, sentence_of_group, processed_sentence]
            counter += 1


    sentences = final_data.PreProcessedSent
    labels = [1]*len(sentences)

    input_ids, attention_masks = prepare_input_ids_and_attention_masks(tokenizer, sentences, MAX_LEN, BATCH_SIZE)
    prediction_dataloader = prepare_data_loaders(input_ids, attention_masks, labels)

    # Tracking variables
    predictions , true_labels = [], []
    for batch in prediction_dataloader:
      # Add batch to GPU
        batch = tuple(t.to(device) for t in batch)

      # Unpack the inputs from our dataloader
        b_input_ids, b_input_mask, b_labels = batch

      # Telling the model not to compute or store gradients, saving memory and
      # speeding up prediction
        with torch.no_grad():
          # Forward pass, calculate logit predictions
            outputs = model(b_input_ids, token_type_ids=None,
                          attention_mask=b_input_mask)
            logits = outputs[0]

          # Move logits and labels to CPU
            logits = logits.detach().cpu().numpy()
            label_ids = b_labels.to('cpu').numpy()

          # Store predictions and true labels
            predictions.append(logits)
            true_labels.append(label_ids)

    print("predictions:", predictions)

    flat_predictions = [item for sublist in predictions for item in sublist]
    print("flat_predictions:", flat_predictions)
    flat_labels = np.argmax(flat_predictions, axis=1).flatten()
    flat_conf_scores = np.max(flat_predictions, axis=1).flatten()

    print("flat_labels:", flat_labels)
    print("flat_conf_scores:", flat_conf_scores)
    final_data["Labels"] = flat_labels
    final_data["ConfidenceScore"] = flat_conf_scores
    return final_data.to_json(orient='records')


if __name__ == "__main__":
    from waitress import serve
    print("Starting BioBERT prediction service on http://0.0.0.0:9635/")
    serve(app, host="0.0.0.0", port=9635)
