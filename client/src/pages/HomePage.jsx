
import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../context/ChatContext";
const HomePage  = () => {

  const { selectedUser, setSelectedUser } = useContext(ChatContext);
  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%] '>
          <div 
              
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full w-full grid grid-cols-1 relative
  ${selectedUser
            ? 'md:grid-cols-[320px_1fr_280px]'
            : 'md:grid-cols-[320px_1fr]'
          }`}
      >
                
        <Sidebar
         
        />

        <ChatContainer />

        <RightSidebar
        
        />
        </div>
    </div>
  );
}

export default HomePage;
