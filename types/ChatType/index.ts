
export interface Message {
    timestamp: string; // ISO string date
    sender: "user" | "agent";
    message: string;
    visualizado: boolean;
  }

  
  
  export interface Chat {
    id: string;
    userId: string;
    user_Name: string | null;
    user_avatar: string | undefined;
    supportAgentName: string | null;
    supportAgentAvatar: string | null;
    messages: Message[];
    status: "open" | "in progress" | "closed" | "canceled";
    agentIsActive: boolean;
    createdAt: string; // ISO string date
    timestamp: string; // ISO string date
  }