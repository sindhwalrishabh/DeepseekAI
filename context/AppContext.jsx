'use client';
import { useUser } from "@clerk/nextjs";
import { children, createContext, useContext } from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from '@clerk/nextjs';
import { useEffect } from "react";


export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}
 
export const AppContextProvider = ({children}) => {
    const {user} = useUser()
    const {getToken} = useAuth()
    const [chats, setChats] = useState([]);    
    const [selectedChat,setSelectedChat] = useState(null);

    const createNewChat = async () => {
        try {
            if(!user){
                throw new Error("User not authenticated");
            }
            const token = await getToken();

            await axios.post("/api/chat/create",{},{headers: {Authorization: `Bearer ${token}`,},});

            // fetch user chats after creating new chat
            await fetchUsersChats();
        }catch (error) {
            toast.error("Error creating new chat:", error.message);
        }
    };

   
const fetchUsersChats = async () => {
    try {
        if (!user) return;

        const token = await getToken();

        console.log("GET API token available:", Boolean(token));

        const { data } = await axios.get("/api/chat/get", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (data.success) {
            const chatList = Array.isArray(data.data) ? data.data : [];

            chatList.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );

            setChats(chatList);

            if (chatList.length > 0) {
                setSelectedChat(chatList[0]);
            }
        }
    } catch (error) {
        console.log("GET API error:", error.response?.data || error.message);
    }
};
    useEffect(() => {
         if(user){
            fetchUsersChats();
         }
    },[user]);

    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUsersChats,
        createNewChat
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}