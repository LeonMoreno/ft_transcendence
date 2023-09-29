import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeRoute from "./routes/home";
import DashboardRoute from "./routes/dashboard";
import RootRoute from "./routes/root";
import ChatRoute from "./routes/chat/chat";
import GameRoute from "./routes/game/games";
import LoginRoute, { action as loginAction } from "./routes/auth/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRoute />,
    children: [
      {
        path: "/",
        element: <HomeRoute />,
      },
      {
        path: "/login",
        element: <LoginRoute />,
        action: loginAction,
      },
      {
        path: "/dashboard",
        element: <DashboardRoute />,
      },
      {
        path: "/game",
        element: <GameRoute />,
      },
      {
        path: "/chat",
        element: <ChatRoute />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
