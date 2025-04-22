import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import AppColors from "../utils/AppColors";
import AppIcons from "../utils/AppIcons";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const roomIdRef = useRef(null);

  const navigate = useNavigate();
  const navType = useNavigationType();

  const createRoom = () => {
    navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      alert("Please Enter Room ID To Join.");
      return;
    }
    navigate(`/room/${joinRoomId}`);
  };

  const generateRoomId = useCallback(() => {
    let room = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 1; i <= 8; i++) {
      let char = Math.floor(Math.random() * str.length);
      room += str.charAt(char);
    }
    setRoomId(room);
  }, []);

  const copyRoomToClipBoard = useCallback(() => {
    if (roomIdRef.current) {
      roomIdRef.current.select();
      navigator.clipboard.writeText(roomId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [roomId]);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasReloaded");

    if (navType === "POP" && !hasReloaded) {
      sessionStorage.setItem("hasReloaded", "true");
      window.location.reload();
    } else {
      sessionStorage.removeItem("hasReloaded");
    }
  }, [navType]);

  useEffect(() => {
    generateRoomId();
  }, [generateRoomId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-5">
      <h1 className="text-4xl font-bold mb-6 text-white tracking-wide">
        Connect Face-to-Face, Instantly
      </h1>
      <p className="text-gray-300 mb-12 text-lg max-w-xl text-center">
        Create or Join private video rooms in seconds. No hassle. No sign-up.
      </p>
      <div
        className={`w-full max-w-sm ${AppColors.container} p-6 rounded-xl flex flex-col`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center w-full">
            <input
              type="text"
              placeholder="Random Room ID"
              value={roomId}
              ref={roomIdRef}
              readOnly
              onChange={(e) => setRoomId(e.target.value)}
              className={`min-w-0 flex-1 px-4 py-2 ${AppColors.background} rounded-md border border-none focus:outline-none`}
            />
            <button
              onClick={copyRoomToClipBoard}
              className={`shrink-0 group relative ${AppColors.buttonColor} hover:${AppColors.background} rounded-md py-2 px-2`}
            >
              <img src={AppIcons.copy} alt="copy" className={`h-6 w-6`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                Copy
              </div>
              {/* Copied message */}
              {copied && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 group-focus-within:block bg-black text-white text-sm px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                  Copied!
                </div>
              )}
            </button>
          </div>
          <button
            onClick={createRoom}
            className={` ${AppColors.buttonColor} hover:${AppColors.background} px-6 py-2.5 rounded-md font-medium`}
          >
            Continue →
          </button>
        </div>
        <div className="w-full  border-t border-gray-400 my-6"></div>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className={`px-4 py-2 ${AppColors.background} rounded-md border border-none focus:outline-none`}
          />
          <button
            onClick={joinRoom}
            className={` ${AppColors.buttonColor} hover:${AppColors.background} px-6 py-2.5 rounded-md  font-medium`}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;