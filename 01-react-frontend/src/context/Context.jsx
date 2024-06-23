// Context.jsx

import { createContext, useState, useEffect } from "react";
import { fetchChatResponse, saveChat, getChat, deleteChatAPI } from "../services/api";
import { v4 as uuidv4 } from "uuid";

export const Context = createContext();

const ContextProvider = (props) => {
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(Object.keys(chats)[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [defaultEndpoint, setDefaultEndpoint] = useState("/chat-direct");
  const [showHelp, setShowHelp] = useState(false);
  const [contextSettings, setContextSettings] = useState({
    Concepts: false,
    Guides: false,
    Products: false,
  });

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const data = await getChat();
        if (data.chats && Object.keys(data.chats).length > 0) {
          setChats(data.chats);
          setActiveChatId(Object.keys(data.chats)[0]);
        } else {
          // If no chats exist, create a new one
          const newChatId = uuidv4();
          setChats({ [newChatId]: [] });
          setActiveChatId(newChatId);
        }
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      }
    };

    fetchChatData();
  }, []);

  useEffect(() => {
    const saveChatData = async () => {
      try {
        await saveChat({ [activeChatId]: chats[activeChatId] });
      } catch (error) {
        console.error("Failed to save chat data:", error);
      }
    };
    saveChatData();
  }, [chats]);

  const onSent = async () => {
    setLoading(true);
    const updatedChatHistory = [
      ...chats[activeChatId],
      { role: "user", content: input },
    ];

    setInput("");
    setChats((prevChats) => ({
      ...prevChats,
      [activeChatId]: updatedChatHistory,
    }));

    try {
      const lastXMessages = updatedChatHistory.slice(-5);
      const response = await fetchChatResponse(defaultEndpoint, lastXMessages);
      const formattedResponse = response
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*/g, "<br>");

      setChats((prevChats) => ({
        ...prevChats,
        [activeChatId]: [
          ...prevChats[activeChatId],
          { role: "assistant", content: formattedResponse },
        ],
      }));
    } catch (error) {
      console.error("Error fetching chat response:", error);
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
      [newChatId]: [],
      ...prevChats,
    }));
    setActiveChatId(newChatId);
  };

  const deleteChat = async (chatId) => {
    try {
      await deleteChatAPI(chatId);
      setChats((prevChats) => {
        const newChats = { ...prevChats };
        delete newChats[chatId];
        return newChats;
      });
      if (activeChatId === chatId) {
        const remainingChatIds = Object.keys(chats);
        if (remainingChatIds.length > 0) {
          setActiveChatId(remainingChatIds[0]);
        } else {
          newChat(); // Create a new chat if all chats are deleted
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
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
    setDefaultEndpoint,
    contextSettings,
    setContextSettings,
    showHelp,
    setShowHelp,
    deleteChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
