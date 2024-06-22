import React, { useContext, useRef, useEffect } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import Greeting from "../Greeting/Greeting";

const Main = () => {
  const { onSent, chats, activeChatId, loading, input, setInput } =
    useContext(Context);

  const chatContainerRef = useRef(null);
  const showGreeting = !activeChatId || chats[activeChatId].length === 0; // No active chat or empty chat

  // Scroll to the bottom of the chat container whenever the chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats[activeChatId]]); // Update scroll on active chat history change

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift + Enter: Insert a newline character
        console.log("lll");
        setInput(input + "\n");
      } else {
        // Enter only: Send the message
        if (input.trim() !== "") {
          onSent();
        }
      }
      e.preventDefault(); // Prevent default Enter behavior (form submission or newline in single-line input)
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>CES-GPT</p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main-container" ref={chatContainerRef}>
        {showGreeting ? (
          <Greeting />
        ) : (
          <div className="result">
            {chats[activeChatId].map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.role === "user" ? "result-title" : "result-data"
                }`}
              >
                <img
                  src={
                    message.role === "user"
                      ? assets.user_icon
                      : assets.gemini_icon
                  }
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
              {input ? (
                <img
                  onClick={() => onSent()}
                  src={assets.send_icon}
                  width={30}
                  alt=""
                />
              ) : null}
            </div>
          </div>
          <p className="bottom-info">
            CES-GPT-0624 is based on Gemini 1.5 Flash. The most recent CES
            Guides and Concepts can be added as context.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
