import React, { useContext, useRef, useEffect } from "react";
import "./Help.css";
import { Context } from "../../context/Context";

const Help = () => {
  const { setShowHelp } = useContext(Context);
  const modalRef = useRef(null);

  const helpData = [
    { name: "Documentation", value: "Confluence Link", isLink: true },
    { name: "Access", value: "[CG Role]" },
    { name: "Contact", value: "[Support Mail]", isEmail: true },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowHelp(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowHelp]);

  return (
    <div className="help-modal" ref={modalRef}>
      <div className="help-content">
        {helpData.map((item, index) => (
          <div className="help-item" key={index}>
            <span className="help-label">{item.name}:</span>
            {item.isLink ? (
              <a href={item.value} target="_blank" rel="noopener noreferrer">{item.value}</a>
            ) : item.isEmail ? (
              <a href={`mailto:${item.value}`}>{item.value}</a>
            ) : (
              <span>{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Help;