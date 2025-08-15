// src/components/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "./Header";
import { toast } from "react-toastify";

const SignUpSignIn = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const createUserDocument = async (user) => {
    setLoading(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName ? displayName : name,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
        });
        toast.success("Account Created!");
      } catch (error) {
        toast.error(error.message);
      }
    }
    setLoading(false);
  };

  const signUpWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
      toast.success("Successfully Signed Up!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

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
      <Header />
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
                  <input type="email" placeholder="JohnDoe@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-wrapper">
                  <p>Password</p>
                  <input type="password" placeholder="Example123" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
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
                  <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="input-wrapper">
                  <p>Email</p>
                  <input type="email" placeholder="JohnDoe@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-wrapper">
                  <p>Password</p>
                  <input type="password" placeholder="Example123" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="input-wrapper">
                  <p>Confirm Password</p>
                  <input type="password" placeholder="Example123" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Loading..." : "Sign Up with Email"}
                </button>
              </form>
            </>
          )}
          <p style={{ textAlign: "center", margin: "0.5rem 0" }}>or</p>
          <button className="btn-primary" disabled={loading} onClick={signInWithGoogle}>
            {loading ? "Loading..." : `Sign ${isLogin ? 'In' : 'Up'} with Google`}
          </button>
          <p onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? "Or Don't Have An Account? Click Here." : "Or Have An Account Already? Click Here."}
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUpSignIn;