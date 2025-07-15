import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Signup.tsx";
import EmailVerify from "./pages/EmailVerify.tsx";
import Dashboard from "./pages/Dashboard.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
