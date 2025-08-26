import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Login } from "./components/Login.jsx";
import { ForgotPw } from "./components/ForgotPw.jsx";
import { NewPassword } from "./components/NewPassword.jsx";

import { Register } from "./components/Register.jsx";
import { RegisterVerify } from "./components/RegisterVerify.jsx";

import { Settings } from "./components/Settings.jsx";
import { Profile } from "./components/Profile.jsx";
import { AboutUs } from "./components/AboutUs.jsx";

import { ChatArea } from "./components/ChatArea.jsx";
import { ExistChatroom } from "./components/ExistChatroom.jsx";
import { Chatroom } from "./components/Chatroom.jsx";
import { NewChatroom } from "./components/NewChatroom.jsx";
import { PageNotFound } from "./components/PageNotFound.jsx";

import { PreventZoom } from "./utils/PreventZoom.js";
import { Privacy } from "./components/Privacy.jsx";
import { devToolText } from "./utils/devToolText.js";

function App() {
  return (
    <>
      <PreventZoom />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-pw" element={<ForgotPw />} />
          <Route path="/new-pw" element={<NewPassword />} />

          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/register/verify" element={<RegisterVerify />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about-us" element={<AboutUs />} />

          <Route path="/chatarea" element={<ChatArea />} />
          <Route path="/chatarea/exist" element={<ExistChatroom />} />
          <Route path="/chatarea/chats/:id" element={<Chatroom />} />
          <Route
            path="/chatarea/chats/new-chatroom/:username"
            element={<NewChatroom />}
          />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

console.log("%c %s", devToolText, "Hello, Word!");
