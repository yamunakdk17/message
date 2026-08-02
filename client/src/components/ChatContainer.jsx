import React, { useRef, useEffect, useContext, useState } from "react";
import assets from "../assets/assets";
import {
    Phone,
    Video,
    MoreVertical,
    ArrowLeft,
} from "lucide-react";
import { formatMessageTime } from "../lib/util";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
    const {
        messages,
        selectedUser,
        setSelectedUser,
        sendMessage,
        getMessages,
    } = useContext(ChatContext);

    const { authUser, onlineUsers } = useContext(AuthContext);

    const scrollEnd = useRef(null);
    const [input, setInput] = useState("");

    // Send text message
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();

        if (!input.trim()) return;

        await sendMessage({
            text: input.trim(),
        });

        setInput("");
    };

    // Send image
    const handleSendImage = async (e) => {
        const file = e.target.files[0];

        if (!file || !file.type.startsWith("image/")) {
            toast.error("Select an image file");
            return;
        }

        const reader = new FileReader();

        reader.onloadend = async () => {
            await sendMessage({
                image: reader.result,
            });

            e.target.value = "";
        };

        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollEnd.current) {
            scrollEnd.current.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [messages]);

    return selectedUser ? (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setSelectedUser(null)}
                        className="md:hidden"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    <img
                        src={
                            selectedUser.fullName === "smriti gurung"
                                ? assets.profile_smriti
                                : selectedUser.fullName === "anjuly upadhyay"
                                    ? assets.profile_anjuly
                                    : selectedUser.fullName === "Alison"
                                        ? assets.profile_alison
                                        : assets.avatar_icon
                        }
                        alt="profile"
                        className="w-11 h-11 rounded-full object-cover"
                    />

                    <div>
                        <h2 className="text-white font-semibold">
                            {selectedUser.fullName}
                        </h2>

                        <p className="text-sm text-gray-400">
                            {onlineUsers.includes(selectedUser._id)
                                ? "🟢 Online"
                                : "⚪ Offline"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-5 text-white">
                    <Phone size={20} className="cursor-pointer" />
                    <Video size={20} className="cursor-pointer" />
                    <MoreVertical size={20} className="cursor-pointer" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">

                {messages?.filter(Boolean).map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-end gap-2 mb-4 ${msg.senderId === authUser?._id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                    >
                        {msg.image ? (
                            <img
                                src={msg.image}
                                alt="message"
                                className="max-w-[230px] rounded-lg"
                            />
                        ) : (
                            <p
                                className={`p-2 max-w-[220px] break-words rounded-lg bg-violet-500/30 text-white ${msg.senderId === authUser?._id
                                        ? "rounded-br-none"
                                        : "rounded-bl-none"
                                    }`}
                            >
                                {msg.text}
                            </p>
                        )}

                        <div className="text-center text-xs">
                            <img
                                src={
                                    msg.senderId === authUser?._id
                                        ? authUser?.profilePic || assets.avatar_icon
                                        : selectedUser?.profilePic || assets.avatar_icon
                                }
                                alt="avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />

                            <p className="text-gray-400">
                                {formatMessageTime(msg.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}

                <div ref={scrollEnd} />
            </div>

            {/* Bottom Input */}
            <div className="border-t border-gray-700 p-4">

                <div className="flex items-center gap-3">

                    <div className="flex-1 flex items-center bg-[#282142] rounded-full px-4">

                        <input
                            type="text"
                            placeholder="Send a message"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSendMessage(e)
                            }
                            className="flex-1 bg-transparent p-3 outline-none text-white placeholder-gray-400"
                        />

                        <input
                            type="file"
                            id="image"
                            hidden
                            accept="image/png,image/jpeg"
                            onChange={handleSendImage}
                        />

                        <label htmlFor="image">
                            <img
                                src={assets.gallery_icon}
                                alt="gallery"
                                className="w-5 cursor-pointer"
                            />
                        </label>

                    </div>

                    <img
                        src={assets.send_button}
                        alt="send"
                        onClick={handleSendMessage}
                        className="w-8 cursor-pointer"
                    />

                </div>
            </div>

        </div>
    ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
            <img
                src={assets.logo_icon}
                alt="logo"
                className="max-w-16"
            />

            <p className="text-lg font-medium text-white">
                Chat anytime, anywhere
            </p>
        </div>
    );
};

export default ChatContainer;