// Sidebar.jsx

import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import Settings from "../Settings/Settings";
import Help from "../Help/Help";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const {
    chats,
    activeChatId,
    setActiveChatId,
    newChat,
    showSettings,
    setShowSettings,
    showHelp,
    setShowHelp,
    deleteChat,
  } = useContext(Context);

  const handleChatClick = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  return (
    <div className="sidebar">
      <div className="top">
        <img
          src={assets.menu_icon}
          alt=""
          className="menu"
          onClick={() => setExtended((prev) => !prev)}
        />
        <div onClick={newChat} className="new-chat">
          <img src={assets.plus_icon} alt="" />
          {extended && <p>New Chat</p>}
        </div>
        {extended && (
          <div className="recent">
            <p className="recent-title">Chats</p>
            {Object.keys(chats).map((chatId) => (
              <div
                key={chatId}
                className={`recent-entry ${
                  activeChatId === chatId ? "active" : ""
                }`}
              >
                <div
                  className="chat-info"
                  onClick={() => handleChatClick(chatId)}
                >
                  <img src={assets.message_icon} alt="" />
                  <p>
                    {chats[chatId][0]?.content?.slice(0, 18) || "New Chat"} ...
                  </p>
                </div>
                <img
                  src={assets.bin_icon}
                  alt="Delete"
                  className="delete-icon"
                  onClick={(e) => handleDeleteChat(e, chatId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bottom">
        <div
          className="bottom-item recent-entry"
          onClick={() => setShowHelp(true)}
        >
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div
          className="bottom-item recent-entry"
          onClick={() => setShowSettings(true)}
        >
          <img src={assets.context_icon} alt="" />
          {extended ? <p>Context</p> : null}
        </div>
      </div>
      {showHelp && <Help />}
      {showSettings && <Settings />}
    </div>
  );
};

export default Sidebar;
