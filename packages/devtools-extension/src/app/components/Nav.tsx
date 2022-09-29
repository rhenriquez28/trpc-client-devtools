import { useState } from "react";
import trpcLogo from "../assets/trpc-logo.svg";
import { OperationType } from "../types";
import "./Nav.css";

type NavButtonProps = {
  isSelected: boolean;
  onClick: () => any;
};

export type NavProps = {
  queriesCount: number;
  mutationsCount: number;
  subscriptionsCount: number;
  onTabChange: (selectedTab: OperationType) => void;
};

const NavButton: React.FC<NavButtonProps> = ({
  isSelected,
  onClick,
  children,
}) => (
  <button
    className={`mx-2 py-4 text-sm uppercase text-white hover:cursor-pointer focus:outline-none ${
      isSelected ? "selected" : ""
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Nav: React.FC<NavProps> = ({
  queriesCount,
  mutationsCount,
  subscriptionsCount,
  onTabChange,
}) => {
  const [selectedTab, setSelectedTab] = useState<OperationType>("query");
  const onNavButtonClick = (selection: OperationType) => {
    setSelectedTab(selection);
    onTabChange(selection);
  };
  return (
    <nav className="flex items-center h-10">
      <img src={trpcLogo} alt="tRPC logo" className="h-8 w-8 mx-4" />
      <ul className="flex items-center mx-1 list-none">
        <li>
          <NavButton
            isSelected={selectedTab === "query"}
            onClick={() => onNavButtonClick("query")}
          >
            Queries ({queriesCount})
          </NavButton>
        </li>
        <li>
          <NavButton
            isSelected={selectedTab === "mutation"}
            onClick={() => onNavButtonClick("mutation")}
          >
            Mutations ({mutationsCount})
          </NavButton>
        </li>
        <li>
          <NavButton
            isSelected={selectedTab === "subscription"}
            onClick={() => onNavButtonClick("subscription")}
          >
            Subscriptions ({subscriptionsCount})
          </NavButton>
        </li>
      </ul>
    </nav>
  );
};
export default Nav;
