import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export const Chat = () => {
  const navigate = useNavigate();
  return (
    <section className="chat-container">
      <button onClick={() => navigate("/login")}>login</button>
    </section>
  );
};
