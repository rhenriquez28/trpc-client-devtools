import { useState } from "react";
import trpcLogo from "../trpc-logo.svg";
import { NavTabType } from "../types";
import "./Nav.css";

type NavButtonProps = {
  isSelected: boolean;
  onClick: () => any;
};

export type NavProps = {
  queriesCount: number;
  mutationsCount: number;
  onTabChange: (selectedTab: NavTabType) => void;
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
  onTabChange,
}) => {
  const [selectedTab, setSelectedTab] = useState<NavTabType>("queries");
  const onNavButtonClick = (selection: NavTabType) => {
    setSelectedTab(selection);
    onTabChange(selection);
  };
  return (
    <nav className="flex items-center h-10">
      <img src={trpcLogo} alt="tRPC logo" className="h-8 w-8 mx-4" />
      <ul className="flex items-center mx-1 list-none">
        <li>
          <NavButton
            isSelected={selectedTab === "queries"}
            onClick={() => onNavButtonClick("queries")}
          >
            Queries ({queriesCount})
          </NavButton>
        </li>
        <li>
          <NavButton
            isSelected={selectedTab === "mutations"}
            onClick={() => onNavButtonClick("mutations")}
          >
            Mutations ({mutationsCount})
          </NavButton>
        </li>
      </ul>
    </nav>
  );
};
export default Nav;
