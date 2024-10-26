/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { collection, doc, setDoc, updateDoc, query, where, onSnapshot, or, arrayUnion } from "firebase/firestore";
import db from "@/lib/firebase";
import { Chat } from "../../../../types/ChatType";
import { MdOutlineClose, MdWhatsapp } from "react-icons/md";
import { TbH1, TbUserQuestion } from "react-icons/tb";
import getAllDefaultMessages, { DefaultMessageProps } from "@/_actions/Messages";
import { FiSend } from "react-icons/fi";
import { SendHorizontalIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import ResponsiveModal from '../../ui/responsive-modal';
import Image from "next/image";

const ClientView = ({ requeredLogin }: { requeredLogin: boolean }) => {
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [showResponseMessage, setShowResponseMessage] = useState(false);
  const { user } = useUser();
  const [activeChat, setActiveChat] = useState<null | string | undefined>(null);
  const [agentActive, setAgentActive] = useState(false);
  const [defaultClientMessages  , setDefaultClientMessages] = useState<DefaultMessageProps | null>(null);
  const [hasNewChat, setHasNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [anonymousId, setAnonymousId] = useState('');
  const [anonymousChat, setAnonymousChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [chatToCancel, setChatToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !requeredLogin) {
      // Verifica se já existe um anonymousId no localStorage
      const storedAnonymousId = localStorage.getItem('anonymousId');
      if (storedAnonymousId) {
        setAnonymousId(storedAnonymousId);
      } else {
        const newAnonymousId = uuidv4();
        localStorage.setItem('anonymousId', newAnonymousId);
        setAnonymousId(newAnonymousId);
      }
    }
  }, [user, requeredLogin]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChats = async () => {
      if (!user && !requeredLogin && !anonymousId) return;
  
      const chatsRef = collection(db, "chats");
  
      const q = query(
        chatsRef,
        where("status", "in", ["open", "in progress", "closed"]),
        where("userId", "==", requeredLogin ? (user ? user.id : anonymousId) : user ? user.id : anonymousId)
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];
        
        setChats(chatsList);
  
        if (chatsList.length > 0) {
          const latestChat = chatsList[0];
          setActiveChat(latestChat.id);
          setAgentActive(latestChat.status === "in progress");
          setMessages(latestChat.messages || []);
        }
  
        // Atualiza o chat ativo se ele existir na lista
        const currentActiveChat = chatsList.find((chat) => chat.id === activeChat);
        if (currentActiveChat) {
          setAgentActive(currentActiveChat.status === "in progress");
        }
      });
  
      return () => {
        unsubscribe();
      };
    };
  
    fetchChats();
  }, [user, activeChat, anonymousId, requeredLogin]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    if (!user && anonymousChat) {
      setChats([anonymousChat]);
      setActiveChat(anonymousChat.id);
    }
  }, [user, anonymousChat]);

  const startNewChat = async () => {
    if (!user && requeredLogin) return;
    const newChatRef = doc(collection(db, "chats"));
    const newChatData: Omit<Chat, 'id'> = {
      userId: user ? user.id : anonymousId,
      user_Name: user ? user.fullName : `Anônimo_${anonymousId.slice(0, 8)}` ,
      supportAgentName: null,
      supportAgentAvatar: null,
      messages: [],
      status: "open",
      agentIsActive: false,
      user_avatar: user ? user.imageUrl : "./anonymous.png",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    await setDoc(newChatRef, newChatData);

    if (!user) {
      setAnonymousChat({ id: newChatRef.id, ...newChatData });
    }

    const defaultMessages = await getAllDefaultMessages()
    setDefaultClientMessages(defaultMessages);
    setHasNewChat(true);
    setActiveChat(newChatRef.id);
  };

  const handleDefaultMessage = async (message:string) => {
     if (message && activeChat) {
      addMessage(activeChat, message, "user");
      setNewMessage("");  
    }  }

  const addMessage = async (chatId:string, message:string, sender:string) => {
    const chatRef = doc(db, "chats", chatId);
    const newMessage = {
      timestamp: new Date().toISOString(),
      sender,
      message,
    };

    await updateDoc(chatRef, {
      messages: arrayUnion(newMessage),
    });

    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const closeChat = async (chatId: string) => {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      status: "canceled",
    });
    
    if (activeChat === chatId) {
      setActiveChat(null);
    }
    
    // Remover o chat da lista local
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    
    // Se for um chat anônimo, limpar o estado do chat anônimo
    if (!user) {
      setAnonymousChat(null);
    }
  };

  const handleSendMessage = () => {
    
    if (newMessage.trim() && activeChat) {
      addMessage(activeChat, newMessage, "user");
      setNewMessage("");  
    }

   
  };


  const handleChatClick = (chatId:string | undefined) => {
    if (activeChat === chatId) {
      setActiveChat(null);
    } else {
      setActiveChat(chatId);
      const currentChat = chats.find((chat) => chat.id === chatId);
      setAgentActive(currentChat?.agentIsActive || false);
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
    setShowResponseMessage(true);
    setTimeout(() => {
      setShowResponseMessage(false);
    }, 3000);
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent("Olá, tudo bem? Estou interessado em saber mais sobre os produtos da Ourofino. Você pode me ajudar?");
    window.open(`https://wa.me/+558694912878?text=${message}`, "_blank");
  };

  const isBusinessHours = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  };

  const shouldShowBusinessHoursMessage = () => {
    return !isBusinessHours() && (!activeChat || (activeChat && chats.find(chat => chat.id === activeChat)?.status === 'open'));
  };

  const handleRequestResponse = () => {
    setShowResponseMessage(true);
    setTimeout(() => {
      setShowResponseMessage(false);
    }, 3000);
  };

  const handleCancelClick = (chatId: string) => {
    setChatToCancel(chatId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (chatToCancel) {
      await closeChat(chatToCancel);
      setShowCancelModal(false);
      setChatToCancel(null);
    }
  };

  const WelcomeScreen = () => (
    <div className="bg-white rounded-lg overflow-hidden flex flex-col max-h-[90vh] shadow-lg">
      <div className="px-4 py-6 bg-yellow-100 text-center">
        <img src="./logotipoourofino.svg" alt="Ourofino Logo" className="h-10 w-auto mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Bem-vindo ao Suporte Ourofino</h3>
        <p className="text-xs text-gray-600">Como podemos tornar seu dia mais brilhante?</p>
      </div>
      
      <div className="p-4 space-y-3 bg-white flex-grow overflow-y-auto">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center p-3 bg-yellow-500 rounded-lg shadow-md hover:bg-yellow-600 transition-all duration-300"
        >
          <div className="bg-white p-2 rounded-full mr-3">
            <TbUserQuestion className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-white">Iniciar Chat</h4>
            <p className="text-xs text-yellow-100">Estamos prontos para ajudar!</p>
          </div>
        </button>
        
        <button 
          onClick={handleWhatsAppRedirect}
          className="w-full flex items-center p-3 bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-all duration-300"
        >
          <div className="bg-white p-2 rounded-full mr-3">
            <MdWhatsapp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-white">WhatsApp</h4>
            <p className="text-xs text-green-100">Atendimento rápido e prático.</p>
          </div>
        </button>
      </div>
      
      {!isBusinessHours() && (
        <div className="p-3 bg-red-50 border-t border-red-200 text-center">
          <p className="font-semibold text-red-800 text-xs mb-1">Fora do Horário de Atendimento</p>
          <p className="text-xs text-red-700">Nosso time estará disponível: Seg-Sex, 9h-17h.</p>
          <p className="text-xs text-red-700 mt-1">Deixe sua mensagem e retornaremos em breve!</p>
        </div>
      )}
    </div>
  );

  const LoginRequiredScreen = () => (
    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 min-h-[600px] rounded-lg shadow-lg overflow-hidden p-8">
      <div className="flex justify-center mb-8">
        <img src="./logotipoourofino.svg" alt="Ourofino Logo" className="h-20 w-auto" />
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-4">
        Bem-vindo ao Suporte da Ourofino!
      </h3>
      <p className="text-md text-gray-600 text-center mb-8">
        Para obter assistência, faça login ou crie uma conta.
      </p>
      <div className="space-y-4">
        <SignInButton mode="modal" fallbackRedirectUrl={"/"}>
          <button className="w-full bg-yellow-400 text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-yellow-500 transition duration-300 ease-in-out">
            Criar Conta / Login
          </button>
        </SignInButton>
        <button 
          onClick={handleWhatsAppRedirect}
          className="w-full bg-green-500 text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300 ease-in-out flex items-center justify-center space-x-2"
        >
          <MdWhatsapp className="w-5 h-5" />
          <span>Fale Conosco pelo WhatsApp</span>
        </button>
      </div>
      <p className="mt-8 text-center text-gray-600 text-sm">
        Estamos aqui para ajudar você!<br />
        Horário de atendimento: 9h às 17h, de segunda a sexta.
      </p>
    </div>
  );

  return (
    <>
      {requeredLogin ? (
        <SignedOut>
          <LoginRequiredScreen />
        </SignedOut>
      ) : null}

      {!requeredLogin || (requeredLogin && user) ? (
        <div className="   flex flex-col   rounded-lg transition-all duration-500">
          {chats.length === 0 && !anonymousChat ? (
            <WelcomeScreen />
          ) : (
            <div   >
              
              <div className="flex-1 mb-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {chats.length > 0 || anonymousChat ? (
                  <div className="space-y-4">
                    {(chats.length > 0 ? chats : [anonymousChat]).map((chat) => (
                      <motion.div
                        key={chat?.id}
                        className={`flex items-center p-3 sm:p-4 rounded-lg shadow-md transition-all transform ${
                          activeChat === chat?.id
                            ? "border-2 border-primary bg-white"
                            : "border border-gray-200 bg-gray-50"
                        } hover:shadow-lg hover:scale-102`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleChatClick(chat?.id)}
                      >
                        <div className="flex items-center flex-grow">
                          {chat?.supportAgentName && (
                            <Image
                              alt="Support Avatar"
                              src={chat.supportAgentAvatar || "/default-avatar.png"}
                              width={40}
                              height={40}
                              className="rounded-full mr-3 sm:mr-4"
                            />
                          )}
                          <div className="flex flex-col">
                            <p className="font-medium text-sm sm:text-base text-gray-800 truncate">
                              {chat?.supportAgentName 
                                ? chat.supportAgentName.split(" ").slice(0, 2).join(" ") 
                                : "Aguardando atendente..."}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {chat?.supportAgentName ? "Sou seu atendente!" : "Responderemos em breve."}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="ml-2 sm:ml-4 bg-red-500 text-white hover:bg-red-600 transition-all p-2 sm:p-3 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelClick(chat?.id || "");
                          }}
                        >
                          <MdOutlineClose className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                   
                  <div className="space-y-4 p-6 rounded-lg bg-gray-50 shadow-lg">
                  <h4 className="text-xl font-bold text-gray-800">Como podemos ajudar você hoje?</h4>
                  <p className="text-sm text-gray-600">
                    Nossa equipe está pronta para atender suas necessidades. Escolha uma das opções abaixo para iniciar.
                  </p>
                  {isBusinessHours() ? (
                    <div
                      className="flex items-center p-4 bg-yellow-200 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                      onClick={handleNewChat}
                    >
                      <TbUserQuestion className="w-12 h-12 mr-4 text-yellow-600" />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800 text-lg">
                          Atendente Online
                        </p>
                        <p className="text-sm text-gray-600">
                          Clique para falar agora
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center p-4 bg-gray-200 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                      onClick={handleNewChat}
                    >
                      <TbUserQuestion className="w-12 h-12 mr-4 text-gray-600" />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800 text-lg">
                          Solicitar Atendimento Prévio
                        </p>
                        <p className="text-sm text-gray-500">
                          Responderemos assim que possível
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={handleWhatsAppRedirect}
                  >
                    <MdWhatsapp className="w-12 h-12 mr-4 text-green-600" />
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800 text-lg">WhatsApp</p>
                      <p className="text-sm text-gray-500">
                        Inicie a conversa no WhatsApp
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-blue-100 rounded-lg shadow-md">
                    <p className="text-gray-800">
                      Dicas: Você pode perguntar sobre nossos produtos, serviços ou suporte técnico.
                    </p>
                  </div>
                  <div className="flex items-center p-4 bg-green-100 rounded-lg shadow-md">
                    <p className="text-gray-800">
                      Estamos aqui para ajudar! Não hesite em nos contatar.
                    </p>
                  </div>
                </div>
                )}
              </div>
              {activeChat !== null && (
                <div className="flex flex-col border-t mt-2 pt-2 bg-gray-50 rounded-lg shadow-md">
                  {agentActive ? (
                    <div className="bg-green-100 text-green-700 p-2 rounded-t-lg text-center mb-2 font-semibold text-xs">
                      <span className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        Atendente online e pronto para ajudar!
                      </span>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-700 p-2 rounded-t-lg text-center mb-2 font-semibold text-xs md:text-sm">
                      <span className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                        Aguardando disponibilidade do atendente...
                      </span>
                    </div>
                  )}
                  {shouldShowBusinessHoursMessage() && (
                    <div className="bg-blue-100 text-blue-800 p-2 rounded-lg shadow-inner mb-2 text-xs md:text-sm">
                      <h4 className="font-bold my-1">Fora do Horário de Atendimento</h4>
                      <p className="mb-1">
                        Atendimento: Seg-Sex, 9h-17h.
                      </p>
                      <p className="font-semibold">
                        Deixe sua mensagem e retornaremos!
                      </p>
                    </div>
                  )}
                  <div className="flex-1   px-2 py-1" style={{ maxHeight: "50vh" }}>
                    {hasNewChat && (
                      <div className="space-y-1 mb-2">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Sugestões de perguntas:</h3>
                        {defaultClientMessages?.data.map((msg) => (
                          <motion.div
                            key={msg.id}
                            className="flex items-center p-2 bg-white rounded-lg shadow-sm hover:bg-yellow-50 cursor-pointer transition-all border border-yellow-200"
                            onClick={() => {
                              handleDefaultMessage(msg.attributes.mensagem);
                            }}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-gray-700 flex-grow text-xs md:text-base">{msg.attributes.mensagem}</p>
                            <FiSend
                              className="text-yellow-600 ml-1 hover:scale-110 transition-transform"
                              size={14}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Área de mensagens */}
                    <div className="flex-grow min-h-[100px] md:min-h-[400px] max-h-[300px] overflow-y-auto p-2 space-y-2">
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] p-2 rounded-lg ${
                            msg.sender === "user" ? "bg-yellow-500 text-white font-bold text-xs md:text-sm" : "bg-slate-200 font-bold text-xs md:text-sm"
                          }`}>
                            <p>{msg.message}</p>
                            <p className="text-gray-500 mt-1 text-[10px]">
                              {new Date(msg.timestamp).toLocaleTimeString().slice(0,5)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Área de input */}
                  <div className="bg-white p-2 border-t">
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs md:text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                      >
                        <SendHorizontalIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
      <ResponsiveModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirmar cancelamento"
        description="Ao cancelar, você encerrará esta conversa e não poderá retomá-la."
        warningText="Lembre-se: Nossos atendentes estão aqui para ajudar. Se tiver dúvidas, é melhor continuar a conversa."
        confirmText="Confirmar cancelamento"
        cancelText="Voltar ao chat"
        onConfirm={confirmCancel}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Tem certeza de que deseja cancelar este atendimento?
          </p>
          <p className="text-gray-600">
            Se você tiver mais perguntas no futuro, terá que iniciar um novo chat.
          </p>
        </div>
      </ResponsiveModal>
    </>
  );
};

export default ClientView;
