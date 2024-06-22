import React, { useContext } from "react";
import { Context } from "../../context/Context";
import "./Greeting.css";

const Greeting = () => {
  const { setInput } = useContext(Context); 

  const cardData = [
    {
      text: "Suggest beautiful places to see on an upcoming road trip",
    },
    {
      text: "Briefly summarize this concept: urban planning",
    },
    {
      text: "Brainstorm team bonding activities for our work retreat",
    },
    {
      text: "Improve the readability of the following code",
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
