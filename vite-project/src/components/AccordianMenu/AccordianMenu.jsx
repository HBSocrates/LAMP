import React, { useState } from "react";
import AccordionItem from "./AccordionItem";
import "../styles/Accordion.css";

const AccordionMenu = () => {
  const [currentlyActive, setCurrentlyActive] = useState(1);

  const handleAccordionClick = (newActiveAccordion) => {
    setCurrentlyActive(
      newActiveAccordion === currentlyActive ? null : newActiveAccordion
    );
    console.log(`currently active item: ${currentlyActive}`);
    console.log(
      `newly active item: ${newActiveAccordion} previous active item ${currentlyActive}`
    );
  };

  return (
    <div className="accordion-menu">
      <h1 className="title">Settings</h1>
      <div className="accordion-items">
        <AccordionItem
          title=""
          content=""
          isActive={currentlyActive === 1}
          onClick={() => handleAccordionClick(1)}
        />
      </div>
    </div>
  );
};

export default AccordionMenu;