async function fetchChatResponse(endpoint, messages) {
    console.log("PP")
    console.log(endpoint)
    try {
        const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: messages,
            }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error fetching chat response:", error);
        throw error;  // Re-throw for handling in components
    }
}

export { fetchChatResponse };