import { ButtonLink } from "@/components/ui/button-link";
import { Link, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", text: "Home" },
  { to: "/users", text: "Users" },
  { to: "/chat", text: "Chat" },
  { to: "/game", text: "Game" },
];
export default function RootRoute() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-4 bg-secondary">
        <nav className="flex justify-between items-center">
          <ul className="flex justify-between gap-20">
            {navItems.map((item) => {
              return (
                <li key={item.to}>
                  <Link to={item.to}>{item.text}</Link>
                </li>
              );
            })}
          </ul>
          <Link to="/">
            <img src="/logo.svg" alt="logo" />
          </Link>
          <div className="w-72 flex justify-end">
            <ButtonLink to="/dashboard" size="xs">
              42 Login
            </ButtonLink>
          </div>
        </nav>
      </header>

      <main className="flex-[1]">
        <Outlet />
      </main>

      <footer className="bg-black p-6 text-white flex justify-center">
        <p>CabraPing. All rights reserved © 2023</p>
      </footer>
    </div>
  );
}
