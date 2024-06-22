import { createContext, useState, useEffect } from "react";
import { fetchChatResponse } from "../services/api";
import { v4 as uuidv4 } from "uuid"; // For generating unique chat IDs

export const Context = createContext();

const ContextProvider = (props) => {
  const [chats, setChats] = useState({ [uuidv4()]: [] });
  const [activeChatId, setActiveChatId] = useState(Object.keys(chats)[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [defaultEndpoint, setDefaultEndpoint] = useState("/chat-direct")

  function delayPara(index, nextWord) {
    setTimeout(function () {
      setResponse((prev) => prev + nextWord);
    }, 75 * index);
  }

  const onSent = async () => {
    setResponse("");
    setLoading(true);

    const updatedChatHistory = [
      ...chats[activeChatId],
      { role: "user", content: input },
    ];

    setChats((prevChats) => ({
      ...prevChats,
      [activeChatId]: updatedChatHistory,
    }));

    try {
      const lastXMessages = updatedChatHistory.slice(-5);
      console.log(defaultEndpoint)
      const response = await fetchChatResponse(defaultEndpoint, lastXMessages);
      setChats((prevChats) => ({
        ...prevChats,
        [activeChatId]: [
          ...prevChats[activeChatId],
          { role: "assistant", content: "" },
        ],
      }));

      let responseArray = response.split("**");
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

      setInput("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response && chats[activeChatId].length > 0) {
      setChats((prevChats) => {
        const newChats = { ...prevChats };
        const lastIndex = newChats[activeChatId].length - 1;
        newChats[activeChatId][lastIndex] = {
          ...newChats[activeChatId][lastIndex],
          content: response,
        };
        return newChats;
      });
    }
  }, [response]);

  const newChat = () => {
    const newChatId = uuidv4();
    setChats((prevChats) => ({
      ...prevChats,
      [newChatId]: [],
    }));
    setActiveChatId(newChatId);
  };

  const contextValue = {
    chats,
    activeChatId,
    setActiveChatId,
    onSent,
    loading,
    input,
    setInput,
    newChat,
    showSettings,
    setShowSettings,
    defaultEndpoint,
    setDefaultEndpoint
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
