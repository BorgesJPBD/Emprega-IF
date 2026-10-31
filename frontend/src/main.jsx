import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErroTela from "./componentes/ErroTela";
import "./estilos.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErroTela>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErroTela>
  </React.StrictMode>
);