import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle } from 'lucide-react';

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
};

type ChatMessageProps = {
  message: Message;
  isOwnMessage: boolean;
};

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const timestamp = message.timestamp instanceof Date && !isNaN(message.timestamp.getTime())
    ? message.timestamp
    : new Date();

  const formattedTime = formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: fr,
  });

  const sender = message.sender || "Anonyme";
  
  const initials = sender
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const isSystemMessage = sender === "Système";

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-pink-500 to-rose-500",
      "bg-gradient-to-br from-violet-500 to-purple-500",
      "bg-gradient-to-br from-blue-500 to-indigo-500",
      "bg-gradient-to-br from-emerald-500 to-teal-500",
      "bg-gradient-to-br from-amber-500 to-orange-500",
    ];
    
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  if (isSystemMessage) {
    return (
      <div className="flex items-center justify-center my-3 space-x-2">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
          <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
          {message.text}
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`flex ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        } max-w-[80%] group`}
      >
        <Avatar className={`${isOwnMessage ? "ml-2" : "mr-2"} h-9 w-9 shadow-sm`}>
          <AvatarFallback className={`${isOwnMessage ? "bg-gradient-to-br from-violet-500 to-fuchsia-500" : getAvatarColor(sender)} text-white text-xs`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwnMessage
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                : "bg-white border border-gray-100 text-gray-800"
            }`}
          >
            <p className="leading-relaxed">{message.text}</p>
          </div>
          <div
            className={`text-xs text-gray-500 mt-1 px-1 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            {isOwnMessage ? "Vous" : sender} • {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}