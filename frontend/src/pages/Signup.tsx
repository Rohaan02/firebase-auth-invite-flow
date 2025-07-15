import { useState } from "react";
import axios from "axios";
import { auth, googleProvider } from "../firebase.ts";
import { signInWithPopup, sendSignInLinkToEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3333/api";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cleanupUninvited = async (email: string) => {
    try {
      await axios.post(`${API_BASE}/cleanup-uninvited`, { email });
      console.log(`✅ Cleanup triggered for ${email}`);
    } catch (err) {
      console.warn("⚠️ Cleanup failed:", err);
    }
  };

  const handleEmailSignup = async () => {
    setLoading(true);
    try {
      // Step 1: Verify invite
      await axios.post(`${API_BASE}/verify-invite`, { input: email });

      // Step 2: Mark invite used
      const markRes = await axios.post(`${API_BASE}/mark-invite-used`, {
        email,
      });
      if (
        markRes.data?.success === false &&
        markRes.data?.message === "Invite already used"
      ) {
        alert("Invite already used");
        return;
      }

      // Step 3: Store in valid_users
      await axios.post(`${API_BASE}/store-valid-user`, { email });

      // Step 4: Send Firebase magic link
      const actionCodeSettings = {
        url: "http://localhost:3000/email-verify",
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      alert("Magic link sent to your email!");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message;

      if (msg?.includes("not invited") || msg?.includes("Invite not found")) {
        alert("Email is not invited.");
        await cleanupUninvited(email);
      } else {
        alert("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;

      // Step 1: Verify invite
      await axios.post(`${API_BASE}/verify-invite`, { input: userEmail });

      // Step 2: Mark invite used
      const markRes = await axios.post(`${API_BASE}/mark-invite-used`, {
        email: userEmail,
      });
      if (
        markRes.data?.success === false &&
        markRes.data?.message === "Invite already used"
      ) {
        alert("Invite already used");
        return;
      }

      // Step 3: Store in valid_users
      await axios.post(`${API_BASE}/store-valid-user`, {
        email: userEmail,
      });

      alert("Successfully signed in with Google!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message;

      if (msg?.includes("not invited") || msg?.includes("Invite not found")) {
        alert("Email is not invited.");
        if (err?.config?.data) {
          const data = JSON.parse(err.config.data);
          if (data?.email || data?.input) {
            await cleanupUninvited(data.email || data.input);
          }
        }
      } else {
        alert("Google Sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Signup</h2>

      <input
        type="email"
        placeholder="Enter invited email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={handleEmailSignup}
        disabled={loading}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      >
        {loading ? "Sending Magic Link..." : "Sign up with Email"}
      </button>

      <hr />

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        style={{ width: "100%", padding: 10 }}
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
};

export default SignupPage;
