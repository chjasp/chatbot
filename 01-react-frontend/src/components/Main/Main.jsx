// Main.jsx

import React, { useContext, useRef, useEffect } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import Greeting from "../Greeting/Greeting";

const Main = () => {
  const { onSent, chats, activeChatId, loading, input, setInput } = useContext(Context);
  const chatContainerRef = useRef(null);
  const showGreeting = !activeChatId || chats[activeChatId].length === 0;

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer && chats[activeChatId].length > 0) {
      const lastMessage = chats[activeChatId][chats[activeChatId].length - 1];
      if (lastMessage.role === "user") {
        // Scroll to the new user message
        const newMessageElement = chatContainer.lastElementChild;
        if (newMessageElement) {
          chatContainer.scrollTo({
            top: newMessageElement.offsetTop - chatContainer.offsetTop,
            behavior: 'smooth'
          });
        }
      } else {
        // Scroll to the bottom for assistant messages
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [chats, activeChatId]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() !== "") {
        onSent();
      }
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>CES-GPT</p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main-container">
        {showGreeting ? (
          <Greeting />
        ) : (
          <div className="result" ref={chatContainerRef}>
            {chats[activeChatId].map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === "user" ? "result-title" : "result-data"}`}
              >
                <img
                  src={message.role === "user" ? assets.user_icon : assets.gemini_icon}
                  alt=""
                />
                <p
                  dangerouslySetInnerHTML={{
                    __html: message.content.replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            ))}
            {loading && (
              <div className="result-data">
                <img src={assets.gemini_icon} alt="" />
                <div className="loader">
                  <hr className="animated-bg" />
                  <hr className="animated-bg" />
                  <hr className="animated-bg" />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="main-bottom">
          <div className="search-box">
            <textarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Enter a prompt here"
              onKeyDown={handleKeyPress}
            />
            <div>
              {input && <img onClick={onSent} src={assets.send_icon} width={30} alt="" />}
            </div>
          </div>
          <p className="bottom-info">
            CES-GPT-0624 is based on Gemini 1.5 Flash. CES Guides, Concepts, and
            Product documentations can be added as context.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;