import os
import google.generativeai as genai

from dotenv import load_dotenv
from google.cloud import storage
from google.cloud import firestore

from pydantic import BaseModel

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from prompts import get_prompt

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
storage_client = storage.Client(project=os.environ["PROJECT_ID"])
bucket = storage_client.bucket(os.environ["BUCKET_NAME"])
model = genai.GenerativeModel("gemini-1.5-flash-latest")
db = firestore.Client(project=os.environ["PROJECT_ID"], database=os.environ["FIRESTORE_DB"])

app = FastAPI()
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    file_name: str


@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat")
async def chat(messages: dict):
    user_message = messages["messages"][-1]["content"]
    
    # Retrieve document summaries from Firestore
    summaries_ref = db.collection("doc-metadata")
    summaries = [doc.to_dict() for doc in summaries_ref.stream()]

    # Format summaries for Gemini prompt
    formatted_summaries = "\n".join(
        [f"{doc['file_name']}: {doc['summary']}" for doc in summaries]
    )

    # Ask Gemini for relevant document names
    prompt = get_prompt(
        "scanner",
        formatted_summaries=formatted_summaries,
        user_message=user_message
    )
    response = model.generate_content(prompt)
    relevant_doc_names = response.text.strip().split(", ")
    print(relevant_doc_names)

    # Fetch content of relevant documents from GCS
    context = ""
    for doc_name in relevant_doc_names:
        blob = bucket.blob(doc_name)
        if blob.exists():
            context += blob.download_as_text() + "\n\n"
        else:
            print(f"Warning: Document '{doc_name}' not found in Cloud Storage.")


    # Get full message history
    full_message_history = "\n".join(
        [f"{m['role']}: {m['content']}" for m in messages["messages"]]
    )
    prompt = get_prompt("chat", chat_history=full_message_history, context=context)
    response = model.generate_content(prompt)

    # Add context prefix to the response if context was provided
    if context:
        response_with_context = f"Context provided by: {', '.join(relevant_doc_names)}\n\n{response.text}"
        return {"response": response_with_context}
    else:
        return {"response": response.text}

@app.post("/summarize")
async def summarize(request: SummarizeRequest):
    file_name = request.file_name

    try:
        blob = bucket.blob(file_name)
        if not blob.exists():
            return {"response": "error", "detail": "File not found"}
    except Exception as e:
        return {"response": "error", "detail": f"An error occurred: {e}"}

    return {"response": "success"}