import React, { useState } from "react";
import { motion } from "framer-motion";
import LoginForm from "./Login.jsx";
import RegisterForm from "./Register.jsx";
import plantImage from "../assets/plant.jpg";

const AuthContainer = () => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${plantImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-0" />

      <div className="relative z-10 w-[360px] sm:w-[430px] h-[560px] perspective-[1200px]">
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full relative transform-style-preserve-3d"
        >
          {/* Front - Login */}
          <div className="absolute w-full h-full backface-hidden">
            <LoginForm onFlip={() => setFlipped(true)} />
          </div>

          {/* Back - Register */}
          <div className="absolute w-full h-full rotate-y-180 backface-hidden">
            <RegisterForm onFlip={() => setFlipped(false)} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthContainer;
