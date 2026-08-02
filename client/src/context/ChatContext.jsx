import { createContext, useContext, useState, useEffect } from "react";
import {AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const {socket, axios} = useContext(AuthContext);




    // function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            console.log("Users API Response:", data);

            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
//function to send getmessage
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            console.log("GET MESSAGES RESPONSE:", data);

            if (data.success) {
                setMessages(data.messages);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
    // function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );

            console.log("SEND RESPONSE:", data); // <-- Keep this

            if (data.success && data.newMessage) {
                setMessages((prev) => [...prev, data.newMessage]);
            } else {
                console.log("newMessage is missing:", data);
                toast.error(data.message || "Message not returned");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // function to subscribe to messages for selected user
    const subscribeToMessages = () => {
        if (!socket) return;

        socket.off("newMessage"); // Prevent duplicate listeners

        socket.on("newMessage", async (newMessage) => {
            console.log("📩 Received Socket Message:", newMessage);

            const senderId =
                typeof newMessage.senderId === "object"
                    ? newMessage.senderId._id
                    : newMessage.senderId;

            if (selectedUser && senderId === selectedUser._id) {
                newMessage.seen = true;

                setMessages((prev) => [...prev, newMessage]);

                try {
                    await axios.put(`/api/messages/mark/${newMessage._id}`);
                } catch (err) {
                    console.log(err);
                }
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1,
                }));
            }
        });
    };
    // function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();

        return () => {
            unsubscribeFromMessages();
        };
    }, [socket, selectedUser]);







    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages

       
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};