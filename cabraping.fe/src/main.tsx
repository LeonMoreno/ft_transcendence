import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeRoute from "./routes/home";
import DashboardRoute from "./routes/dashboard";
import RootRoute from "./routes/root";

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
        path: "/dashboard",
        element: <DashboardRoute />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
