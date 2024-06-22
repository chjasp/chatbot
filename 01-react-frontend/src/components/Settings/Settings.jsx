import React, { useContext, useState, useEffect } from "react";
import "./Settings.css";
import { Context } from "../../context/Context";
import { assets } from "../../assets/assets";

const Settings = () => {
  const { setShowSettings, defaultEndpoint, setDefaultEndpoint } =
    useContext(Context);
  const [isChecked, setIsChecked] = useState(
    defaultEndpoint === "/chat-context"
  );

  // Effect to update isChecked whenever defaultEndpoint changes
  useEffect(() => {
    setIsChecked(defaultEndpoint === "/chat-context");
  }, [defaultEndpoint]);

  const handleToggleChange = () => {
    const newEndpoint = isChecked ? "/chat-direct" : "/chat-context";
    setIsChecked(!isChecked); // Update the isChecked state first
    setDefaultEndpoint(newEndpoint); // Then update the context value
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        {/* Toggle Switch with Icon and Label */}
        <div className="setting-item">
          <img
            src={assets.cloud_icon}
            alt="Cloud Icon"
            className="setting-icon"
          />
          <div className="label-switch-container">
            <label htmlFor="checkContentToggle" className="setting-label">
              Always Check CES Content
            </label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="checkContentToggle"
                checked={isChecked} // Bind to isChecked state
                onChange={handleToggleChange}
              />
              <span className="slider round"></span>
            </div>
          </div>
        </div>

        <div className="apply-button-container">
          <button onClick={() => setShowSettings(false)}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
