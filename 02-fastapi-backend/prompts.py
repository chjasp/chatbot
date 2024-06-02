prompts = {
    "chat": """You are a helpful AI assistant for a company. You will be given a chat history and (potentially) some additional context. Based on that, answer the user's last message.
    Chat history: {chat_history}
    Context: {context}""",
    "summarization": "Please summarize the following document in 2 concise sentences: {document_content}",
    "scanner": """User: Which of the following documents are relevant to this query?
    {formatted_summaries}
    User: {user_message}
    Assistant: Only return the names of relevant files in this format: 'filename1, filename2,...'"""
}


def get_prompt(prompt_name, **kwargs):
    prompt_template = prompts.get(prompt_name)
    if prompt_template:
        return prompt_template.format(**kwargs)
    else:
        return "Invalid prompt name"
