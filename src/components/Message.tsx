
import { useState, useEffect } from "react";
import { SiOpenai } from "react-icons/si";
import { HiUser } from "react-icons/hi";
import { TbCursorText } from "react-icons/tb";
import { FiEdit, FiSave, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { supabase } from "../lib/client";
interface MessageProps {
  message: {
    role: string;
    content: string | null;
    versions?: Array<{ content: string; timestamp: Date }>;
    followUps?: Array<{ role: string; content: string | null }>;
  };
}

const Message = (props: MessageProps) => {
  const { message } = props;
  const { role, content: initialText, versions = [], followUps = [] } = message;
  const isUser = role === "user";

  const [isEditing, setIsEditing] = useState(false); // State for editing
  const [currentContent, setCurrentContent] = useState(initialText || ""); // Current message content
  const [history, setHistory] = useState(versions); // Version history
  const [showHistory, setShowHistory] = useState(false); // Show/Hide version history
  const [showFollowUps, setShowFollowUps] = useState(false); // Show/Hide follow-up messages

  // Populate the initial message into history if it's not already there
  useEffect(() => {
    if (initialText && history.length === 0) {
      setHistory([{ content: initialText, timestamp: new Date() }]);
    }
  }, [initialText, history]);
  const saveMessageToSupabase = async (content: string, role: string) => {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ content, role }]);
  
    if (error) {
      console.error("Error saving message:", error.message);
    } else {
      console.log("Message saved:", data);
    }
  };
  // Handle saving edited message
  const handleSaveEdit = async () => {
    if (currentContent.trim() === "") return; // Prevent saving empty messages

    // Add the current version to history before saving the new edit
    const updatedHistory = [
      ...history,
      { content: currentContent, timestamp: new Date() }, // Save the current message to history
    ];

    setHistory(updatedHistory); // Update history with the edited content
    setIsEditing(false); // Exit editing mode
    await saveMessageToSupabase(currentContent, role);
  };

  return (
    <div
      className={`group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 ${
        isUser ? "dark:bg-gray-800" : "bg-gray-50 dark:bg-[#444654]"
      }`}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl flex lg:px-0 m-auto w-full">
        <div className="flex flex-row gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 lg:px-0 m-auto w-full">
          <div className="w-8 flex flex-col relative items-end">
            <div className="relative h-7 w-7 p-1 rounded-sm text-white flex items-center justify-center bg-black/75 text-opacity-100r">
              {isUser ? (
                <HiUser className="h-4 w-4 text-white" />
              ) : (
                <SiOpenai className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            <div className="flex flex-grow flex-col gap-3">
              <div className="min-h-20 flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
                <div className="markdown prose w-full break-words dark:prose-invert dark">
                  {!isUser && initialText === null ? (
                    <TbCursorText className="h-6 w-6 animate-pulse" />
                  ) : isEditing ? (
                    <textarea
                      className="w-full p-2 bg-gray-100 dark:bg-gray-800 border rounded"
                      value={currentContent}
                      onChange={(e) => setCurrentContent(e.target.value)}
                    />
                  ) : (
                    <p>{currentContent}</p>
                  )}
                </div>
                <div className="flex space-x-2 items-center">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-blue-500 text-white py-1 px-2 rounded flex items-center"
                      >
                        <FiSave className="mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 text-white py-1 px-2 rounded flex items-center"
                      >
                        <FiX className="mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-500 text-white py-1 px-2 rounded flex items-center"
                    >
                      <FiEdit className="mr-1" />
                      Edit
                    </button>
                  )}
                  {history.length > 0 && (
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="bg-gray-500 text-white py-1 px-2 rounded flex items-center"
                    >
                      {showHistory ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
                      {showHistory ? "Hide History" : "Show History"}
                    </button>
                  )}
                  {followUps.length > 0 && (
                    <button
                      onClick={() => setShowFollowUps(!showFollowUps)}
                      className="bg-gray-500 text-white py-1 px-2 rounded flex items-center"
                    >
                      {showFollowUps ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
                      {showFollowUps ? "Hide Follow-ups" : "Show Follow-ups"}
                    </button>
                  )}
                </div>
                {/* Display Message History */}
                {showHistory && (
                  <div className="mt-4 space-y-2">
                    {history.length > 0 ? (
                      history.map((version, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          <strong>Version {index + 1}</strong>: {version.content} (
                          {new Date(version.timestamp).toLocaleString()})
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No previous versions.</div>
                    )}
                  </div>
                )}
                {/* Display Follow-ups */}
                {showFollowUps && (
                  <div className="mt-4 space-y-2">
                    {followUps.length > 0 ? (
                      followUps.map((followUp, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          <strong>{followUp.role === "user" ? "User" : "AI"}</strong>: {followUp.content}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No follow-up messages.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
