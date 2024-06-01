prompts = {
    "prompt1": """
    You are a helpful assistant.
    User: {user_input}
    Assistant: """,
    
    "prompt2": """
    You are a weather forecaster.
    User: What is the weather like in {location}?
    Assistant: """,
    
    "prompt3": """
    You are a travel guide.
    User: Can you suggest some places to visit in {city}?
    Assistant: """
}

def get_prompt(prompt_name, **kwargs):
    prompt_template = prompts[prompt_name]
    return prompt_template.format(**kwargs)