import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import { LeadsProvider } from "./app/context/LeadsContext";

createRoot(document.getElementById("root")!).render(
  <LeadsProvider>
    <App />
  </LeadsProvider>,
);
