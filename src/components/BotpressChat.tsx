
import { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface BotpressChatProps {
  configUrl?: string;
  botId?: string;
  theme?: 'light' | 'dark';
}

// Add proper type declaration for the Botpress webchat global object
declare global {
  interface Window {
    botpressWebChat: {
      init: (config: { configUrl?: string; botId?: string; theme?: string }) => void;
      close: () => void;
    };
  }
}

export const BotpressChat = ({ 
  configUrl = "https://files.bpcontent.cloud/2025/03/17/14/20250317141028-0N0SLFTL.json", 
  botId, 
  theme = 'light' 
}: BotpressChatProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if script already exists to prevent duplicates
    const existingScript = document.getElementById('botpress-webchat-script');
    if (existingScript) {
      return;
    }
    
    // Create script element for Botpress
    const script = document.createElement('script');
    script.id = 'botpress-webchat-script';
    script.src = "https://cdn.botpress.cloud/webchat/v2.2/inject.js";
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
        if (window.botpressWebChat) {
          window.botpressWebChat.init({
            configUrl: configUrl,
            botId: botId,
            theme: theme,
          });
          setIsLoaded(true);
        } else {
          throw new Error("Botpress webchat not available");
        }
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
      
      // Close Botpress webchat if it exists
      try {
        if (window.botpressWebChat && window.botpressWebChat.close) {
          window.botpressWebChat.close();
        }
      } catch (error) {
        console.error("Error closing Botpress:", error);
      }
    };
  }, [configUrl, botId, theme]);
  
  // Create a div to render the chat button
  return <div id="bp-web-widget" className="bp-widget-web" style={{ zIndex: 9999 }}></div>;
};
