// Greeting.jsx

import React, { useContext } from "react";
import { Context } from "../../context/Context";
import "./Greeting.css";

const Greeting = () => {
  const { setInput } = useContext(Context); 

  const cardData = [
    {
      text: "Our Cloud Run service is experiencing cold start latency issues. What strategies can I employ to mitigate this?",
    },
    {
      text: "My Dataflow job is failing with out of memory errors. What steps can I take to optimize the job's resource usage?",
    },
    {
      text: "My Terraform apply is failing with a 'resource already exists' error, but I can't see the resource in the console. What could be causing this?",
    },
    {
      text: "My Cloud Function is timing out when making requests to an on-premises server. What steps should I take to diagnose and fix this issue?",
    },
  ];

  const handleCardClick = (text) => {
    setInput(text);
  };

  return (
    <>
      <div className="greet">
        <p>
          <span>Hi, Colleague!</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      <div className="cards">
        {cardData.map((card, index) => (
          <div
            className="card"
            key={index}
            onClick={() => handleCardClick(card.text)}
          >
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Greeting;
