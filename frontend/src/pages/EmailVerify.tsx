import { useEffect, useState } from "react";
import { auth } from "../firebase.ts";
import { signInWithEmailLink, isSignInWithEmailLink } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        const email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          setStatus("No email found. Please sign up again.");
          return;
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
          const result = await signInWithEmailLink(
            auth,
            email,
            window.location.href
          );
          console.log("✅ User signed in:", result.user);

          window.localStorage.removeItem("emailForSignIn");
          setStatus("Success! Redirecting...");
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          setStatus("Invalid or expired link.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Failed to verify. Try again.");
      }
    };

    verifyEmailLink();
  }, []);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>{status}</h2>
    </div>
  );
};

export default EmailVerify;
