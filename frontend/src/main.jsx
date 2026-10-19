import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErroTela from "./componentes/ErroTela";
// fontes embutidas no site (não dependem do Google Fonts)
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/inter";
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