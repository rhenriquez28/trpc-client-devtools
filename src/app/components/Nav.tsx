import trpcLogo from "../trpc-logo.svg";
import "./Nav.css";

type NavButtonProps = {
  isSelected: boolean;
  onClick: () => any;
};

export type NavProps = {
  queriesCount: number;
  mutationsCount: number;
};

const NavButton: React.FC<NavButtonProps> = ({
  isSelected,
  onClick,
  children,
}) => (
  <button
    className={`mx-3 py-4 text-sm uppercase text-white hover:cursor-pointer focus:outline-none ${
      isSelected ? "selected" : ""
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Nav: React.FC<NavProps> = ({ queriesCount, mutationsCount }) => {
  return (
    <nav className="flex items-center h-10">
      <img src={trpcLogo} alt="tRPC logo" className="h-8 w-8 mx-4" />
      <ul className="flex items-center mx-1 list-none">
        <li>
          <NavButton isSelected={true} onClick={() => {}}>
            Queries ({queriesCount})
          </NavButton>
        </li>
        <li>
          <NavButton isSelected={false} onClick={() => {}}>
            Mutations ({mutationsCount})
          </NavButton>
        </li>
      </ul>
    </nav>
  );
};
export default Nav;
