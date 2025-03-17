
import { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface BotpressChatProps {
  botId: string;
  theme?: 'light' | 'dark';
}

export const BotpressChat = ({ botId, theme = 'light' }: BotpressChatProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Don't try to load if botId is empty or placeholder
    if (!botId || botId === 'YOUR_BOTPRESS_BOT_ID') {
      console.warn('Invalid Botpress Bot ID provided.');
      setHasError(true);
      return;
    }

    // Create script element for Botpress
    const script = document.createElement('script');
    script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
    script.async = true;
    
    // Handle loading errors
    script.onerror = () => {
      console.error("Failed to load Botpress script");
      setHasError(true);
      toast({
        title: "Chat Assistant Unavailable",
        description: "Could not load the chat assistant. Please try again later.",
        variant: "destructive",
      });
    };
    
    document.body.appendChild(script);
    
    // Initialize Botpress webchat when script loads
    script.onload = () => {
      try {
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
          theme: theme,
          showConversationsButton: false,
          enableTranscriptDownload: false,
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("Error initializing Botpress:", error);
        setHasError(true);
        toast({
          title: "Chat Assistant Error",
          description: "There was a problem initializing the chat assistant.",
          variant: "destructive",
        });
      }
    };
    
    return () => {
      // Cleanup: remove the script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      
      // @ts-ignore - Remove Botpress webchat if it exists
      if (window.botpressWebChat && window.botpressWebChat.close) {
        try {
          // @ts-ignore
          window.botpressWebChat.close();
        } catch (error) {
          console.error("Error closing Botpress:", error);
        }
      }
    };
  }, [botId, theme]);
  
  return null; // This component doesn't render anything itself
};
