import { BrowserRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";

// App.tsx가 src 폴더 바로 아래에 있으니까 이 경로가 맞음
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
     <App />
    </BrowserRouter>
    
  </React.StrictMode>
);
