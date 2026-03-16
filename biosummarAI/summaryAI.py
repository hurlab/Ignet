import openai
import pandas as pd
#from rich.console import Console
#from rich.markdown import Markdown
#from yaspin import yaspin
#import pandas as pd
from transformers import GPT2Tokenizer
from dotenv import load_dotenv
import os


load_dotenv()  # Load variables from .env file
api_key = os.getenv('OPENAI_API_KEY')

if api_key is None:
    raise ValueError("API key not found. Please set the OPENAI_API_KEY environment variable.")

print(api_key)
