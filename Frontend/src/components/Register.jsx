import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import plantImage from "../assets/plant.jpg";
import logoImage from "../assets/logo.png";

const Register = () => {
 const navigateTo = useNavigate();
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [role, setRole] = useState("Supervisor");
  const [userAvatarPreview, setUserAvatarPreview] = useState("");

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setUserAvatarPreview(reader.result);
      setUserAvatar(file);
    };
  };

  const registerhandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstname", firstname);
      formData.append("lastname", lastname);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("userAvatar", userAvatar);
      formData.append("role", role);

      await axios
        .post("http://localhost:8000/api/v1/user/register", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          toast.success(res.data.message);
          navigateTo("/");
        });
    } catch (error) {
      toast.error(error.response?.data.message || "Registration failed");
    }
  };

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
        className="relative z-10 w-full max-w-4xl p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 text-white grid grid-cols-1 sm:grid-cols-2 gap-8"
      >
        {/* Left side – image or preview */}
        <div className="flex flex-col justify-center items-center text-center space-y-4">
          <img
            src={logoImage}
            alt="SafeVision Logo"
            className="h-20 drop-shadow-md"
          />
          <p className="text-sm text-gray-300">
            Join SafeVision – Supervise your zone responsibly.
          </p>
          <div className="w-full">
            {userAvatarPreview ? (
              <img
                src={userAvatarPreview ||  "https://via.placeholder.com/90"}
                alt="Preview"
                className="rounded-md w-full h-40 object-cover border border-white/30"
              />
            ) : (
              <div 
              className="w-full h-40 flex items-center justify-center bg-white/10 text-gray-400 rounded-md"
              >
                Image Preview
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="mt-2 w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
            />
          </div>
        </div>

        {/* Right side – registration form */}
        <form onSubmit={registerhandler} className="space-y-4">
          <input
            type="text"
            placeholder="Enter First Name"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="text"
            placeholder="Enter Last Name"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
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
            type="phone"
            placeholder="Contact Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-md shadow-sm"
          >
            Register
          </button>

          <p className="text-sm text-center text-gray-300 mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-400 hover:underline">
              Login Here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
