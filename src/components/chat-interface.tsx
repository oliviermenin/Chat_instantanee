"use client";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Users, MessageCircle, Sparkles, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "./chat-message";
import UserNameModal from "./user-name-modal";

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
};

export default function ChatInterface() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const generateUniqueId = (prefix = '') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    if (!username) return;

    if (socketRef.current) return;

    console.log("Tentative de connexion au serveur WebSocket...");
    setIsLoading(true);
    setConnectionError(null);

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://socket:3001", {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connecté au serveur WebSocket avec ID:", socketInstance.id);
      setIsConnected(true);
      setIsLoading(false);
      setConnectionError(null);

      socketInstance.emit('register_user', username);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Erreur de connexion:", err.message);
      setIsConnected(false);
      setIsLoading(false);
      setConnectionError(`Erreur de connexion: ${err.message}`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Déconnecté du serveur WebSocket. Raison:", reason);
      setIsConnected(false);
      setConnectedUsers([]);
    });

    socketInstance.on("message", (message: Message) => {
      console.log("Message reçu:", message);
      if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }

      setMessages((prevMessages) => {
        if (prevMessages.some(msg => msg.id === message.id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    });

    socketInstance.on("user_list", (users: string[]) => {
      console.log("Liste des utilisateurs mise à jour:", users);
      setConnectedUsers(users);
    });

    return () => {
      console.log("Nettoyage: déconnexion du socket");
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && socket && isConnected) {
      const newMessage: Message = {
        id: generateUniqueId('msg'),
        text: messageInput,
        sender: username,
        timestamp: new Date(),
      };

      console.log("Envoi du message:", newMessage);
      socket.emit("message", newMessage);

      setMessageInput("");
    }
  };

  const handleSetUsername = (name: string) => {
    console.log("Nom d'utilisateur défini:", name);
    setUsername(name);
    setShowModal(false);
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setIsConnected(false);
    setUsername("");
    setMessages([]);
    setConnectedUsers([]);
    setShowModal(true);
  };

  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  return (
    <>
      {showModal && <UserNameModal onSubmit={handleSetUsername} />}

      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen p-4 md:p-8">
        <Card className="w-full max-w-6xl mx-auto shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                <span className="text-xl font-bold">Chat Élégant</span>
                {username && (
                  <Badge className="ml-2 bg-white/20 hover:bg-white/30 text-white">
                    {username}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isConnected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="flex items-center gap-1 text-white hover:bg-white/20 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleUserList}
                  className="flex items-center gap-1 text-white hover:bg-white/20 hover:text-white"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Utilisateurs</span>
                  <Badge className="bg-white/30 text-white hover:bg-white/40">{connectedUsers.length}</Badge>
                </Button>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isLoading
                    ? "bg-amber-200 text-amber-800"
                    : isConnected
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-rose-200 text-rose-800"
                  }`}>
                  {isLoading
                    ? "Connexion..."
                    : isConnected
                      ? "Connecté"
                      : "Déconnecté"}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col h-[70vh]">
              {connectionError && (
                <div className="bg-rose-100 text-rose-800 p-3 text-sm border-l-4 border-rose-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Erreur de connexion:</span>
                    {connectionError}
                  </div>
                </div>
              )}

              <div className="flex gap-0 h-full">
                {showUserList && (
                  <div className="w-1/4 min-w-[200px] border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 bg-gradient-to-b from-violet-50 to-fuchsia-50 h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-violet-500" />
                        <h3 className="font-medium text-violet-800">Utilisateurs en ligne ({connectedUsers.length})</h3>
                      </div>
                      {connectedUsers.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Aucun utilisateur connecté</p>
                      ) : (
                        <ul className="space-y-1">
                          {connectedUsers.map((user, index) => (
                            <li
                              key={`user-${user}-${index}`}
                              className={`text-sm p-2 rounded-lg flex items-center gap-2 ${user === username
                                  ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-800 font-medium'
                                  : 'hover:bg-white/60'
                                }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${user === username ? 'bg-violet-500' : 'bg-emerald-500'
                                }`}></div>
                              {user} {user === username && '(vous)'}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className={`flex-1 flex flex-col`}>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                        <Sparkles className="h-12 w-12 text-violet-300" />
                        <p className="text-lg">
                          {isConnected
                            ? "Aucun message. Soyez le premier à écrire !"
                            : "En attente de connexion au serveur..."}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <ChatMessage
                          key={`${msg.id}-${index}`}
                          message={msg}
                          isOwnMessage={msg.sender === username}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={
                          isConnected
                            ? "Écrivez votre message..."
                            : "En attente de connexion..."
                        }
                        disabled={!isConnected || isLoading}
                        className="flex-1 bg-gray-50 border-gray-200 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <Button
                        type="submit"
                        disabled={!isConnected || !messageInput.trim() || isLoading}
                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}