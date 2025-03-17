
import { useEffect } from 'react';

interface BotpressChatProps {
  botId: string;
}

export const BotpressChat = ({ botId }: BotpressChatProps) => {
  useEffect(() => {
    // Create script element for Botpress
    const script = document.createElement('script');
    script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
    script.async = true;
    document.body.appendChild(script);
    
    // Initialize Botpress webchat when script loads
    script.onload = () => {
      // @ts-ignore - Botpress adds window.botpressWebChat
      window.botpressWebChat.init({
        botId: botId,
        hostUrl: "https://cdn.botpress.cloud/webchat/v1",
        messagingUrl: "https://messaging.botpress.cloud",
        clientId: botId,
        stylesheet: 'https://cdn.botpress.cloud/webchat/v1/standard.css',
        botName: 'AquaGuardian Assistant',
        avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4233/4233830.png',
        botConversationDescription: 'Water quality assistance & information',
        useSessionStorage: true,
        theme: 'light',
        showConversationsButton: false,
        enableTranscriptDownload: false,
      });
    };
    
    return () => {
      // Cleanup: remove the script when component unmounts
      document.body.removeChild(script);
      // @ts-ignore - Remove Botpress webchat if it exists
      if (window.botpressWebChat && window.botpressWebChat.close) {
        // @ts-ignore
        window.botpressWebChat.close();
      }
    };
  }, [botId]);
  
  return null; // This component doesn't render anything itself
};
