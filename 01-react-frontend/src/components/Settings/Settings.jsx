import React, { useContext, useRef, useEffect } from "react";
import "./Settings.css";
import { Context } from "../../context/Context";
import Switch from "../Switch/Switch";

const Settings = () => {
  const { setShowSettings, contextSettings, setContextSettings, setDefaultEndpoint } = useContext(Context);
  const modalRef = useRef(null);

  const contextData = [
    { name: "Concepts" },
    { name: "Guides" },
    { name: "Products" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSettings]);

  useEffect(() => {
    const anyChecked = Object.values(contextSettings).some(value => value);
    setDefaultEndpoint(anyChecked ? "/chat-context" : "/chat-direct");
  }, [contextSettings, setDefaultEndpoint]);

  const handleToggleChange = (name) => {
    setContextSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="settings-modal" ref={modalRef}>
      <div className="settings-content">
        {contextData.map((item, index) => (
          <div className="setting-item" key={index}>
            <label className="setting-label">{item.name}</label>
            <Switch
              checked={contextSettings[item.name]}
              onChange={() => handleToggleChange(item.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;