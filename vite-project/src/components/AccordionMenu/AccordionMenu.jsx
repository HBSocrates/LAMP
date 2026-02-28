import React, { useState } from "react";
import AccordionItem from "./AccordionItem";
import "../../styles/Accordion.css";

const AccordionMenu = ({titles = [], contents = [], name}) => {
  const [currentlyActive, setCurrentlyActive] = useState(1);
  // Make sure we have the same number of titles and contents before we try to create the accordion items
  // Then we map through all the titles and create an accordion item for each title, using the corresponding content from the contents array
  let accordionItems = [];
  console.log(`hi! ${titles.length}`);
  if (titles.length === contents.length) {
    accordionItems = titles.map((item, index) => {
      return (
        <AccordionItem
          key={item}
          title={item}
          content={contents[index]}
          isActive={currentlyActive === index + 1}
          onClick={() => handleAccordionClick(index + 1)}
        />
      );
    });
  }

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
      <h1 className="title">{name}</h1>
      <div className="accordion-items">
        {accordionItems}
      </div>
    </div>
  );
};

export default AccordionMenu;