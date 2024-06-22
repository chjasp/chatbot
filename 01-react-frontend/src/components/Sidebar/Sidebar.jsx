import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import Settings from "../Settings/Settings";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const { chats, activeChatId, setActiveChatId, newChat, showSettings, setShowSettings } =
    useContext(Context);

  const handleChatClick = (chatId) => {
    setActiveChatId(chatId);
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
                onClick={() => handleChatClick(chatId)}
                className={`recent-entry ${
                  activeChatId === chatId ? "active" : ""
                }`}
              >
                <img src={assets.message_icon} alt="" />
                <p>
                  {chats[chatId][0]?.content?.slice(0, 18) || "New Chat"}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div
          className="bottom-item recent-entry"
          onClick={() => setShowSettings(true)}
        >
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>

        {showSettings && <Settings />}
      </div>
    </div>
  );
};

export default Sidebar;
