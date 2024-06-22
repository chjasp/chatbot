import { createContext, useState } from "react";
import { fetchChatResponse } from "../services/api";

export const Context = createContext();

const ContextProvider = (props) => {
    const [chatHistory, setChatHistory] = useState([]); // Store messages
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState(""); // Keep resultData state

    function delayPara(index, nextWord) {
        setTimeout(function () {
            setResultData((prev) => prev + nextWord);
        }, 75 * index);
    }

    const onSent = async () => {
        setResultData("");  // Reset resultData for the new response
        setLoading(true);

        // Add the user's message to the chat history
        setChatHistory((prevHistory) => [
            ...prevHistory,
            { role: "user", content: input },
        ]);

        try {
            // Get the last few messages as context (adjust the number as needed)
            const contextMessages = chatHistory.slice(-3); // Get the last 3 messages

            // Send the entire chat history, including the new message
            const response = await fetchChatResponse({ messages: [...chatHistory, { role: "user", content: input }] }); 

            // Add the AI's response to the chat history
            setChatHistory((prevHistory) => [...prevHistory, { role: "assistant", content: response }]);

            let responseArray = response.split('**');
            let newArray = "";
            for (let i = 0; i < responseArray.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    newArray += responseArray[i];
                } else {
                    newArray += "<b>" + responseArray[i] + "</b>";
                }
            }
            responseArray = newArray.split("*").join("</br>").split(" ");
            for (let i = 0; i < responseArray.length; i++) {
                const nextWord = responseArray[i];
                delayPara(i, nextWord + " ");
            }

            setInput(""); // Clear the input field
        } catch (error) {
            console.error("Error fetching chat response:", error);
            // Handle the error in the UI (e.g., display an error message)
        } finally {
            setLoading(false);
        }
    };

    // ... other context values
    const contextValue = {
        chatHistory,
        onSent,
        loading,
        resultData, // Add back to contextValue
        input,
        setInput,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;