import os
import uvicorn
import vertexai
from vertexai.generative_models import GenerativeModel

from dotenv import load_dotenv
from google.cloud import storage
from google.cloud import firestore

from pydantic import BaseModel

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from prompts import get_prompt

load_dotenv()
vertexai.init(project=os.environ["GEMINI_PROJECT_ID"], location="europe-west3")
storage_client = storage.Client(project=os.environ["PROJECT_ID"])
bucket = storage_client.bucket(os.environ["BUCKET_NAME"])
model = GenerativeModel(model_name=os.environ["GEMINI_MODEL"])
db = firestore.Client(
    project=os.environ["PROJECT_ID"], database=os.environ["FIRESTORE_DB"])

app = FastAPI()
app.mount('/static', StaticFiles(directory="./build/static"), 'static')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Explicitly allow your frontend
    allow_headers=["*"],
    expose_headers=["*"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class SummarizeRequest(BaseModel):
    file_name: str

def get_user_id(token: str = "chjasp"):
    # In a real application, you would validate the token and extract the user ID
    # For now, we'll just return a hardcoded user ID
    return "chjasp"

@app.post("/api/save-chat")
async def save_chat(chat_data: dict, user_id: str = Depends(get_user_id)):
    chat_ref = db.collection("chats").document(user_id)
    # Add a timestamp to the chat
    chat_data_with_timestamp = {
        chat_id: {
            "content": chat_content,
            "timestamp": firestore.SERVER_TIMESTAMP
        } for chat_id, chat_content in chat_data.items()
    }
    chat_ref.set(chat_data_with_timestamp, merge=True)
    return {"status": "success"}

@app.get("/api/get-chat")
async def get_chat(user_id: str = Depends(get_user_id)):
    chat_ref = db.collection("chats").document(user_id)
    chat_doc = chat_ref.get()
    if chat_doc.exists:
        user_chats = chat_doc.to_dict()
        # Sort chats by timestamp in descending order
        sorted_chats = dict(sorted(user_chats.items(), key=lambda x: x[1]['timestamp'], reverse=True))
        # Return only the content, not the timestamp
        return {"chats": {chat_id: chat_data['content'] for chat_id, chat_data in sorted_chats.items()}}
    else:
        return {"chats": {}}

@app.delete("/api/delete-chat/{chat_id}")
async def delete_chat(chat_id: str, user_id: str = Depends(get_user_id)):
    chat_ref = db.collection("chats").document(user_id)
    chat_doc = chat_ref.get()
    if chat_doc.exists:
        user_chats = chat_doc.to_dict()
        if chat_id in user_chats:
            user_chats.pop(chat_id)
            chat_ref.set(user_chats)
            return {"status": "success", "message": "Chat deleted successfully"}
    return {"status": "error", "message": "Chat not found"}

@app.post("/api/chat-direct")
async def chat_direct(messages: dict):
    chat_messages = messages["messages"]
    prompt = get_prompt(
        "chat_direct", user_message=chat_messages[-1]["content"], chat_history=chat_messages[:-1])
    response = model.generate_content(prompt)
    return {"response": response.text}


@app.post("/api/chat-context")
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
            print(
                f"Warning: Document '{doc_name}' not found in Cloud Storage.")

    # Get full message history
    full_message_history = "\n".join(
        [f"{m['role']}: {m['content']}" for m in messages["messages"]]
    )
    prompt = get_prompt(
        "chat_context", chat_history=full_message_history, context=context)
    response = model.generate_content(prompt)

    # Add context prefix to the response if context was provided
    if context:
        response_with_context = f"Context provided by: {', '.join(relevant_doc_names)}\n\n{response.text}"
        return {"response": response_with_context}
    else:
        return {"response": response.text}


@app.post("/api/summarize")
async def summarize(request: SummarizeRequest):
    file_name = request.file_name

    try:
        blob = bucket.blob(file_name)
        if not blob.exists():
            return {"response": "error", "detail": "File not found"}

        document_content = blob.download_as_text()
        prompt = get_prompt("summarization", document_content=document_content)

        response = model.generate_content(prompt)

        doc_ref = db.collection("doc-metadata").document(file_name)
        doc_ref.set({"summary": response.text, "file_name": file_name})
    except Exception as e:
        return {"response": "error", "detail": f"An error occurred: {e}"}

    return {"response": "success"}

@app.get("/", response_class=FileResponse)
async def serve_frontend():
    return FileResponse("build/index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)