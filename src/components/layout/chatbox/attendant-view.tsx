/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { collection, query, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { InfoIcon, LayoutGrid, LayoutList, MoveLeft, X, ThumbsUp, MessageCircle, SendHorizontalIcon } from "lucide-react";
import { MdQuestionMark } from "react-icons/md";
import imageStatusReview from '../../../../public/status-atendimento.png'
import db from "@/lib/firebase";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import ResponsiveModal from '../../ui/responsive-modal';

import { Chat, Message } from "../../../../types/ChatType";

/**
 * AttendantView Component
 * 
 * Este componente representa a visão do atendente no sistema de chat.
 * Ele gerencia a lista de chats, mensagens, e interações do atendente.
 */
const AttendantView: React.FC = () => {
  // Estados relacionados aos chats
  const [chats, setChats] = useState<Chat[]>([]);
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [canceledChat, setCanceledChat] = useState<Chat | null>(null);

  // Estados relacionados às mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [newMessagesCount, setNewMessagesCount] = useState<Record<string, number>>({});

  // Estados de UI
  const [layout1, setLayout1] = useState<boolean>(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showExitChatModal, setShowExitChatModal] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);

  // Estados de filtro e busca
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");

  // Outros estados
  const { user } = useUser();
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [chatToExit, setChatToExit] = useState<string | null>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<((value: boolean) => void) | null>(null);

  const statusTranslations: Record<string, string> = {
    open: "Aberto",
    "in progress": "Ocorrendo",
    closed: "Fechado",
    canceled: "Cancelado",
  };

  const defaultMessages = [
    { icon: <InfoIcon size={24} />, message: "Olá {user_Name}, como posso ajudar você hoje?" },
    { icon: <MdQuestionMark size={24} />, message: "Você tem alguma dúvida sobre nossos serviços?" },
    { icon: <ThumbsUp size={24} />, message: "Fico feliz em ajudar! O que mais você precisa?" },
    { icon: <MessageCircle size={24} />, message: "Sinta-se à vontade para me enviar uma mensagem!" },
  ];

  // Funções auxiliares
  const getStatusStyles = (status: "open" | "in progress" | "closed" | "canceled") => {
    switch (status) {
      case "open":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "closed":
        return "bg-red-200 text-gray-800";
      case "canceled":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  
  const handleSendDefaultMessage = async (message: string) => {
    const chat = await chats.find((c) => c.id === currentChat);
    const userName = chat?.user_Name || "Usuário";  
    const formattedMessage = message.replace("{user_Name}", userName || "Cliente");
    if (!formattedMessage || !currentChat || !user) return;
  
    try {
      const chatRef = doc(db, "chats", currentChat);
  
      await updateDoc(chatRef, {
        messages: arrayUnion({
          message: formattedMessage,
          timestamp: new Date().toISOString(),
          sender: user.fullName,
          senderAvatar: user.imageUrl,
          visualizado: false, // Define como false ao enviar uma nova mensagem
        }),
      });
  
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Efeitos
  useEffect(() => {
    const fetchChats = async () => {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef);
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsList: Chat[] = querySnapshot.docs.map((doc) => ({
          ...doc.data() as Omit<Chat, 'id'>,
          id: doc.id,
        }));
  
        setChats(chatsList);
  
        if (!currentChat) {
          chatsList.forEach((chat) => {
            const newMessages = chat.messages || [];
            const newMessagesNotViewed = newMessages.filter(
              (msg) =>
                !msg.visualizado &&
                new Date(msg.timestamp).getTime() > (lastCheckedTimestamp || 0) &&
                msg.sender !== user?.fullName
            );
  
            if (newMessagesNotViewed.length > 0) {
              setNewMessagesCount((prev) => ({
                ...prev,
                [chat.id]: (prev[chat.id] || 0) + newMessagesNotViewed.length,
              }));
            }
          });
        }
      });
  
      return () => unsubscribe();
    };
  
    fetchChats();
  }, [currentChat, lastCheckedTimestamp, user, newMessage]);
  
  useEffect(() => {
    if (currentChat) {
      const chatRef = doc(db, "chats", currentChat);
  
      const unsubscribe = onSnapshot(chatRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatData = docSnapshot.data() as Chat;
          const newMessages = chatData.messages || [];
  
          // Atualiza mensagens como visualizadas
          const updatedMessages = newMessages.map((msg) => ({
            ...msg,
            visualizado: true, // Marca todas as mensagens como visualizadas
          }));
  
          // Atualiza o Firestore com as mensagens modificadas
          await updateDoc(chatRef, { messages: updatedMessages });
  
          setMessages(updatedMessages);
          setLastCheckedTimestamp(new Date().getTime());
  
          // Reseta a contagem de novas mensagens para este chat
          setNewMessagesCount((prev) => ({
            ...prev,
            [currentChat]: 0,
          }));
        }
      });
  
      return () => unsubscribe();
    }
  }, [currentChat, user]);

  // Handlers
  const handleAttendChat = async (chatId: string) => {
    if (!user) return;

    if (!openChats.includes(chatId)) {
      setOpenChats((prev) => [...prev, chatId]); // Adiciona o chat à lista de chats abertos
    }
    setCurrentChat(chatId);

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      supportAgentName: user.fullName,
      status: "in progress",
      supportAgentAvatar: user.imageUrl,
    });

    const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data() as Chat;
        setMessages(chatData.messages || []);
      }
    });

    return unsubscribe;
  };

  const handleSendMessage = async () => {
     if (!newMessage || !currentChat || !user) return;
  
    try {
      const chatRef = doc(db, "chats", currentChat);
  
      await updateDoc(chatRef, {
        messages: arrayUnion({
          message: newMessage,
          timestamp: new Date().toISOString(),
          sender: user.fullName,
          senderAvatar: user.imageUrl,
          visualizado: false, // Define como false ao enviar uma nova mensagem
        }),
      });
  
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleCloseChat = async (chatId: string) => {
    setChatToExit(chatId);
    setShowExitChatModal(true);
  };

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };

  const handleChatClick = (chat: Chat) => {
    if (chat.status === "canceled") {
      setErrorMessage("Não é possível reabrir um chat cancelado.");
      setCanceledChat(chat);
      setShowErrorDialog(true);
    } else {
      handleAttendChat(chat.id);
    }
  };

  const toggleLayout = () => {
    setLayout1(!layout1);
  };

  const handleViewHistory = () => {
    if (canceledChat) {
      setCurrentChat(canceledChat.id);
      setMessages(canceledChat.messages || []);
      setIsViewingHistory(true);
      setShowErrorDialog(false);
    }
  };

  const confirmExitChat = async () => {
    if (!user || !chatToExit) return;

    const chatRef = doc(db, "chats", chatToExit);
    await updateDoc(chatRef, {
      status: "closed", // Atualiza o status para fechado
    });
    setOpenChats((prev) => prev.filter((id) => id !== chatToExit)); // Remove o chat da lista de chats abertos
    if (currentChat === chatToExit) {
      setCurrentChat(null); // Reseta o chat atual se for fechado
    }
    setShowExitChatModal(false);
    setChatToExit(null);
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDate(event.target.value);
  };

  const filteredChats = chats.filter((chat) => {
    const matchesStatus = filter === "all" || chat.status === filter;
    const matchesSearchTerm = chat?.user_Name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearchDate = searchDate === "" || new Date(chat.timestamp).toLocaleDateString() === new Date(searchDate).toLocaleDateString();
    return matchesStatus && matchesSearchTerm && matchesSearchDate;
  });

  // Renderização
  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex space-x-2 overflow-x-auto p-2 bg-white">
        {openChats.map((chatId) => {
          const chat = chats.find((c) => c.id === chatId);
          const userName = chat?.user_Name || "Usuário";  

          return (
            <div key={chatId} className={`relative px-3 py-2 rounded-lg flex-shrink-0 ${currentChat === chatId ? 'bg-yellow-500 text-white' : 'bg-gray-200'} ${newMessagesCount[chatId] ? 'border-2 border-red-500' : ''}`}>
              <button
                onClick={() => setCurrentChat(chatId)}
                className="text-sm"
              >
                {userName.split(' ')[0]} {newMessagesCount[chatId] > 0 && <span className="text-red-500">({newMessagesCount[chatId]})</span>}
              </button>
              <button onClick={() => handleCloseChat(chatId)} className="absolute bg-primary hover:bg-red-500 hover:text-white hover:border-2 hover:border-white hover:scale-105 transition-all rounded-full right-[-8px] top-[-8px] text-red-500 p-1">
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {currentChat ? (
        <div className="flex-grow flex flex-col">
          {/* Informações do cliente */}
          <div className="bg-white p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <img
                src={chats.find((c) => c.id === currentChat)?.user_avatar || "./default-avatar.png"}
                alt="Cliente"
                className="w-12 h-12 rounded-full border-2 border-yellow-500"
              />
              <div>
                <p className="font-semibold">{chats.find((c) => c.id === currentChat)?.user_Name || "Cliente"}</p>
                <p className="text-sm text-gray-600">Chat iniciado em: {new Date(chats.find((c) => c.id === currentChat)?.createdAt || "").toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Status do atendimento */}
          <div className="bg-green-100 text-green-700 p-3 text-center text-sm">
            Você está atendendo este cliente agora.
          </div>

          {/* Área de mensagens */}
          <div className="flex-grow overflow-y-auto min-h-[200px] md:min-h-[400px] max-h-[200px] md:max-h-[500px] p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end space-x-2 ${
                  msg.sender === user?.fullName ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender !== user?.fullName && (
                  <img
                    alt="User Avatar"
                    src={chats.find((chat) => chat.id === currentChat)?.user_avatar || "./default-avatar.png"}
                    className="w-8 h-8 rounded-full mb-2"
                  />
                )}
                <div className={`flex flex-col ${msg.sender === user?.fullName ? "items-end" : "items-start"}`}>
                  <p className={`p-3 rounded-lg max-w-xs text-xs md:text-sm   break-words ${
                    msg.sender === user?.fullName 
                      ? "bg-yellow-500 text-white" 
                      : "bg-white text-gray-800"
                  }`}>
                    {msg.message } 
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {msg.sender === user?.fullName && (
                  <img
                    alt="Support Avatar"
                    src={user?.imageUrl || "./default-avatar.png"}
                    className="w-8 h-8 rounded-full mb-2"
                  />
                )}
              </div>
            ))}
          </div>

        
          <div className="bg-white p-4 border-t">
            <div className="flex space-x-2 mb-4 justify-center">
              {defaultMessages.map((msg, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        onClick={() => handleSendDefaultMessage(msg.message)}
                        className="hover:scale-110 bg-primary text-white p-2 rounded-full transition-all"
                      >
                        {React.cloneElement(msg.icon, { size: 20 })}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{msg.message.replace("{user_Name}", chats.find((chat) => chat.id === currentChat)?.user_Name || "Cliente")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Escreva sua mensagem..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
              >
                <SendHorizontalIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button size={'icon'} onClick={toggleInfoModal} className="bg-primary text-white hover:bg-yellow-800"><InfoIcon size={20} /></Button>  
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button size={'icon'} onClick={toggleLayout} className="bg-gray-300 text-gray-700 hover:bg-gray-400">
                        {layout1 ? <LayoutGrid size={20} /> : <LayoutList size={20} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mudar Layout de exibição dos chats</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <select value={filter} onChange={handleFilterChange} className="border border-gray-300 rounded-lg p-2">
                <option value="all">Todos</option>
                <option value="open">Abertos</option>
                <option value="in progress">Em andamento</option>
                <option value="closed">Fechados</option>
                <option value="canceled">Cancelados</option>
              </select>
            </div>
            <div className="flex gap-2 flex-col md:flex-row md:gap-4 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchTermChange}
                className="  flex-1 border border-gray-300 rounded-lg p-2"
                placeholder="Buscar por usuário"
              />
              <input
                type="date"
                value={searchDate}
                onChange={handleSearchDateChange}
                className=" flex-2 md:flex-1 border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className={`grid ${layout1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 min-h-[500px] max-h-[500px] content-start overflow-y-scroll` }>
      {filteredChats.map((chat) => {
        const lastMessage = chat.messages?.[chat.messages.length - 1]; // Obtém a última mensagem
        return layout1 ? ( // Verifica se está no layout 1
          <TooltipProvider>
  <Tooltip>
    <TooltipTrigger className="w-full">
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleChatClick(chat);
        }}
        className="flex cursor-pointer items-center p-4 justify-between rounded-lg shadow-lg transition-transform hover:scale-105 bg-white border border-gray-300 hover:shadow-xl w-full"
      >
        <div className="flex items-center gap-2 md:gap-4 w-full">
          <img
            alt="User Avatar"
            src={chat.user_avatar}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-gray-300 flex-shrink-0"
          />
          <div className="flex flex-col gap-1 flex-grow min-w-0">
            <p className="text-base md:text-lg font-semibold truncate">
              {chat.user_Name?.split(' ')[0]}
            </p>
            <p className={`text-xs font-bold p-1 rounded-md inline-block ${getStatusStyles(chat.status)}`}>
              {statusTranslations[chat.status]}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {new Date(chat.createdAt).toLocaleDateString()}
            </p>
          </div>
          {newMessagesCount[chat.id] > 0 && (
            <div className="flex-shrink-0">
              <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                {newMessagesCount[chat.id]}
              </span>
            </div>
          )}
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      Última mensagem: {lastMessage ? lastMessage.message : 'Nenhuma mensagem'}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

        ) : (  
          <div
            key={chat.id}
            onClick={(e) => {
              e.stopPropagation();
              handleChatClick(chat);
            }}
            className={`flex cursor-pointer items-center p-4 max-h-[150px] justify-between rounded-lg shadow-lg transition-transform hover:scale-105 bg-white border border-gray-300 hover:shadow-xl relative`}
          >
            <div className="flex items-center gap-2 ">
              <img
                alt="User Avatar"
                src={chat.user_avatar}
                className="w-14 h-14 rounded-full border-2 border-gray-300"
              />
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">{chat.user_Name}</p>
                <p className={`text-sm font-bold p-1 rounded-md  absolute right-2  ${getStatusStyles(chat.status)}`}>
                  {statusTranslations[chat.status]}
                </p>
                
                 <p className="text-sm text-gray-600">
                  Última mensagem: {lastMessage ? lastMessage.message : 'Nenhuma mensagem'}
                </p>
                <p className="text-sm text-gray-600"> {new Date(chat.createdAt).toLocaleDateString()}</p>

               </div>
              {newMessagesCount[chat.id] > 0 && (
                <div className="">
                  <span className="absolute -top-0 w-5 h-5 -left-0 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">

                   </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
     </div>
          </div>
          
        </div>
      )}
     
      {/* Modal para sair do chat */}
      <ResponsiveModal
        isOpen={showExitChatModal}
        onClose={() => setShowExitChatModal(false)}
        title="Confirmar saída do chat"
        description="Tem certeza que deseja sair deste chat? Isso encerrará o atendimento atual."
        warningText="Lembre-se: Sair do chat pode afetar a experiência do cliente. Certifique-se de que todas as questões foram resolvidas."
        confirmText="Sair do chat"
        cancelText="Continuar atendimento"
        onConfirm={confirmExitChat}
      />

      {/* Modal de informações */}
      <ResponsiveModal
        isOpen={showInfoModal}
        onClose={toggleInfoModal}
        title="Guia de Atendimento ao Cliente"
        description="Informações essenciais e tutoriais para um atendimento eficiente."
        confirmText="Entendi"
        cancelText=""
        onConfirm={toggleInfoModal}
      >
        <div className="space-y-6 text-gray-700">
          <section>
            <h5 className="text-lg font-semibold mb-2">Status dos Chats</h5>
            <ul className="list-disc list-inside text-sm mb-2">
              <li><strong>Aberto:</strong> Chat disponível para atendimento. Priorize estes.</li>
              <li><strong>Em andamento:</strong> Atendimento ativo. Mantenha o foco nestes chats.</li>
              <li><strong>Fechado:</strong> Chat encerrado. Não requer mais ações.</li>
              <li><strong>Cancelado:</strong> Atendimento cancelado pelo cliente ou sistema.</li>
            </ul>
            <p className="text-sm italic">Dica: Mantenha-se atento aos chats abertos para garantir um tempo de resposta rápido.</p>
          </section>

          <section>
            <h5 className="text-lg font-semibold mb-2">Fluxo de Atendimento</h5>
            <ol className="list-decimal list-inside text-sm mb-2">
              <li>Inicie atendendo os chats &quot;Abertos&quot; por ordem de chegada.</li>
              <li>Cumprimente o cliente e identifique-se.</li>
              <li>Escute/leia atentamente a questão do cliente.</li>
              <li>Forneça informações claras e precisas.</li>
              <li>Confirme se o cliente ficou satisfeito com a resposta.</li>
              <li>Encerre o atendimento de forma cordial.</li>
            </ol>
            <p className="text-sm italic">Lembre-se: Um atendimento eficiente resolve a questão do cliente e gera satisfação.</p>
          </section>

          <section>
            <h5 className="text-lg font-semibold mb-2">Dicas para um Atendimento Excelente</h5>
            <ul className="list-disc list-inside text-sm mb-2">
              <li>Use uma linguagem clara e profissional.</li>
              <li>Seja empático com as necessidades do cliente.</li>
              <li>Ofereça soluções proativas quando possível.</li>
              <li>Em caso de dúvidas, não hesite em consultar um supervisor.</li>
              <li>Mantenha a calma em situações difíceis.</li>
            </ul>
          </section>

          <section>
            <h5 className="text-lg font-semibold mb-2">Recursos Úteis</h5>
            <ul className="list-disc list-inside text-sm mb-2">
              <li>Catálogo de produtos: [Link interno]</li>
              <li>FAQ para clientes: [Link interno]</li>
              <li>Política de trocas e devoluções: [Link interno]</li>
              <li>Sistema de tickets para problemas técnicos: [Link interno]</li>
            </ul>
            <p className="text-sm italic">Utilize estes recursos para fornecer informações precisas e atualizadas.</p>
          </section>

          <section>
            <h5 className="text-lg font-semibold mb-2">Procedimentos Especiais</h5>
            <ul className="list-disc list-inside text-sm mb-2">
              <li><strong>Reclamações:</strong> Escute com atenção, peça desculpas sinceras e encaminhe para o supervisor se necessário.</li>
              <li><strong>Problemas técnicos:</strong> Colete informações detalhadas e abra um ticket no sistema de suporte.</li>
              <li><strong>Elogios:</strong> Agradeça e registre no sistema para reconhecimento interno.</li>
            </ul>
          </section>

          <p className="text-sm font-semibold mt-4">Para mais informações ou treinamentos adicionais, entre em contato com seu supervisor.</p>
        </div>
      </ResponsiveModal>

      {/* Modal de erro */}
      <ResponsiveModal
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Erro ao abrir chat"
        description={errorMessage}
        warningText="Não é possível reabrir um chat cancelado."
        confirmText="Ver histórico"
        cancelText="Fechar"
        onConfirm={handleViewHistory}
      />
    </div>
  );
};

export default AttendantView;
