import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Firebase setup
import { auth, provider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// UI & utils
import Header from "./Header";
import { toast } from "react-toastify";

const SignUpSignIn = ({ darkMode, setDarkMode }) => {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Firebase auth state
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Create user document in Firestore if it doesn't exist
  const createUserDocument = async (user) => {
    if (!user) return;
    setLoading(true);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;

      try {
        await setDoc(userRef, {
          name: displayName || name,
          email,
          photoURL: photoURL || "",
          createdAt: new Date(),
        });
        toast.success("Account Created!");
      } catch (error) {
        toast.error(error.message);
      }
    }

    setLoading(false);
  };

  // Sign up using email & password
  const signUpWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUserDocument(result.user);
      toast.success("Successfully Signed Up!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  // Sign in using email & password
  const signInWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged In Successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  // Google OAuth sign-in
  const signInWithGoogle = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      toast.success("User Authenticated Successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <>
      {/* App header with theme toggle */}
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="wrapper">
        <div className="signup-signin-container">
          {isLogin ? (
            <>
              <h2 style={{ textAlign: "center" }}>
                Log In on <span className="blue-text">EXT₹A</span>
              </h2>

              <form onSubmit={signInWithEmail}>
                <div className="input-wrapper">
                  <p>Email</p>
                  <input
                    type="email"
                    placeholder="JohnDoe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-wrapper">
                  <p>Password</p>
                  <input
                    type="password"
                    placeholder="Example123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Log In with Email"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ textAlign: "center" }}>
                Sign Up on <span className="blue-text">EXT₹A</span>
              </h2>

              <form onSubmit={signUpWithEmail}>
                <div className="input-wrapper">
                  <p>Full Name</p>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="input-wrapper">
                  <p>Email</p>
                  <input
                    type="email"
                    placeholder="JohnDoe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-wrapper">
                  <p>Password</p>
                  <input
                    type="password"
                    placeholder="Example123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="input-wrapper">
                  <p>Confirm Password</p>
                  <input
                    type="password"
                    placeholder="Example123"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Sign Up with Email"}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: "center", margin: "0.5rem 0" }}>or</p>

          <button
            className="btn-primary"
            disabled={loading}
            onClick={signInWithGoogle}
          >
            {loading
              ? "Loading..."
              : `Sign ${isLogin ? "In" : "Up"} with Google`}
          </button>

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-link"
          >
            {isLogin
              ? "Or Don't Have An Account? Click Here."
              : "Or Have An Account Already? Click Here."}
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUpSignIn;
