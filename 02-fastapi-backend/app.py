# app.py

import os
import google.generativeai as genai
from dotenv import load_dotenv
from google.cloud import storage
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
storage_client = storage.Client(project=os.environ["PROJECT_ID"])
bucket = storage_client.bucket(os.environ["BUCKET_NAME"])
model = genai.GenerativeModel("gemini-1.5-flash-latest")

app = FastAPI()
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("prompts/chat_prompt.txt", "r") as f:
    CHAT_PROMPT_TEMPLATE = f.read()

with open("prompts/summarization.txt", "r") as f:
    SUMMARIZATION_PROMPT_TEMPLATE = f.read()

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat")
async def chat(messages: dict):
    user_message = messages["messages"][-1]["content"]
    context = ""  # fetch_relevant_docs(user_message)

    full_message_history = "\n".join(
        [f"{m['role']}: {m['content']}" for m in messages["messages"]]
    )
    if context:
        full_message_history += f"\ncontext: {context}"

    response = model.generate_content(full_message_history)

    return {"response": response.text}
