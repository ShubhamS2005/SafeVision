import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import plantImage from "../assets/plant.jpg"; // Make sure this is imported correctly
import logoImage from "../assets/logo.png";
const Login = () => {
  const { isAuthenticated, setIsAuthenticated,setUser} = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        { email, password, confirmPassword, role },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(data.message);
      setUser(data.user);
      setIsAuthenticated(true);
      setRedirect(true);
      // navigateTo("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

   useEffect(() => {
    if (redirect && isAuthenticated) {
      navigateTo("/"); 
    }
  }, [redirect, isAuthenticated, navigateTo]);

 

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${plantImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-0" />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 text-white"
      >
        <div className="text-center mb-6">
          <img
            src={logoImage}
            alt="SafeVision Logo"
            className="h-20 mx-auto drop-shadow-md"
          />
          <h2 className="text-3xl font-bold mt-2 text-white">SafeVision Portal</h2>
          <p className="text-sm text-gray-300">Secure access for authorized personnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Corporate Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="" >Select Role</option>
            <option value="Admin" className="text-black">Admin</option>
            <option value="Supervisor" className="text-black">Supervisor</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-md shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="text-sm text-center text-gray-300 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-400 hover:underline">
            Register Here
          </Link>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          © {new Date().getFullYear()} Hindalco - SafeVision
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
