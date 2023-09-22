import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeRoute from "./routes/home";
import DashboardRoute from "./routes/dashboard";
import Chat from "./routes/chat/chat";
import Game from "./routes/game/gaame.games";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/game",
    element: <Game />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/dashboard",
    element: <DashboardRoute />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
