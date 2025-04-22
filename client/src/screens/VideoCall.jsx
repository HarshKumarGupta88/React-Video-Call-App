import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import IconButton from "../components/IconButton";
import AppIcons from "../utils/AppIcons";
import AppColors from "../utils/AppColors";

const VideoCall = ({ roomId }) => {
  const socket = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const [micDisable, setMicDisable] = useState(true);
  const [camDisable, setCamDisable] = useState(true);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [remoteMicOff, setRemoteMicOff] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const start = async () => {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      socket.emit("join-room", roomId);

      socket.on("all-users", async (users) => {
        if (users.length > 0) {
          createPeer(users[0], true);
        }
      });

      socket.on("user-joined", (userId) => {
        console.log("New user joined:", userId);
      });

      socket.on("offer", async ({ sdp, caller }) => {
        await createPeer(caller, false, sdp);
      });

      socket.on("answer", async ({ sdp }) => {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error("Error adding received ice candidate", err);
        }
      });

      socket.on("media-toggled", (data) => {
        console.log("Remote media toggled received", data);
        setRemoteMicOff(!data.mic); // mic === true means it's ON
      });
    };

    start();

    return () => {
      socket.off("user-joined");
      peerConnection.current?.close();
    };
  }, [roomId, socket]);

  const createPeer = async (targetId, isCaller, remoteSdp = null) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          target: targetId,
          candidate: e.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    if (isCaller) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { target: targetId, sdp: offer });
    } else if (remoteSdp) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(remoteSdp)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { target: targetId, sdp: answer });
    }
  };

  const toggleMic = () => {
    const enabled = !micDisable;
    localStream.current.getAudioTracks()[0].enabled = enabled;
    setMicDisable(enabled);
    socket.emit("media-toggled", {
      room: roomId,
      mic: enabled,
      cam: camDisable,
    });
  };

  const toggleCam = () => {
    const enabled = !camDisable;
    localStream.current.getVideoTracks()[0].enabled = enabled;
    setCamDisable(enabled);
    socket.emit("media-toggled", {
      room: roomId,
      mic: micDisable,
      cam: enabled,
    });
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      const newMuted = !remoteVideoRef.current.muted;
      remoteVideoRef.current.muted = newMuted;
      setSpeakerOff(newMuted);
    }
  };

  const toggleEndCall = () => {
    peerConnection.current?.close();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20 p-10">
      <div className="flex gap-10">
        {/* Local Video */}
        <div className="relative h-[250px] bg-black rounded-xl overflow-hidden border-4 border-[#3D415A]">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-[#181920] px-2 py-1 rounded-md text-sm flex items-center gap-2 text-white">
            <img
              src={micDisable ? AppIcons.enabledAudio : AppIcons.muteMic}
              className="w-4 h-4"
            />
            <span>Host</span>
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative h-[250px] bg-black rounded-xl overflow-hidden border-4 border-[#3D415A]">
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-[#181920] px-2 py-1 rounded-md text-sm flex items-center gap-2 text-white">
            <img
              src={remoteMicOff ? AppIcons.muteMic : AppIcons.enabledAudio}
              className="w-4 h-4"
            />
            <span>Guest</span>
          </div>
        </div>
      </div>

      {/* Icon Buttons options */}
      <div className="flex gap-5">
        <IconButton
          icon={AppIcons.micOff}
          buttonColor={micDisable ? AppColors.buttonColor : AppColors.container}
          onClick={toggleMic}
          label={micDisable ? "Mic OFF" : "Mic ON"}
        />
        <IconButton
          icon={AppIcons.speakerOff}
          buttonColor={speakerOff ? AppColors.container : AppColors.buttonColor}
          onClick={toggleSpeaker}
          label={speakerOff ? "Speaker ON" : "Speaker OFF"}
        />
        <IconButton
          icon={AppIcons.videoOff}
          buttonColor={camDisable ? AppColors.buttonColor : AppColors.container}
          onClick={toggleCam}
          label={camDisable ? "Camera OFF" : "Camera ON"}
        />
        {/* <IconButton 
        icon={AppIcons.moreHorizontal}
        buttonColor={AppColors.buttonColor}
        onClick={toggleCam}
        label="More"/> */}
        <IconButton
          icon={AppIcons.callEnd}
          buttonColor={AppColors.redColor}
          onClick={toggleEndCall}
          label="End Call"
        />
      </div>
    </div>
  );
};

export default VideoCall;