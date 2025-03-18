
import { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface BotpressChatProps {
  configUrl?: string;
  botId?: string;
  theme?: 'light' | 'dark';
}

export const BotpressChat = ({ 
  configUrl = "https://files.bpcontent.cloud/2025/03/17/14/20250317141028-0N0SLFTL.json", 
  botId, 
  theme = 'light' 
}: BotpressChatProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Create script element for Botpress
    const script = document.createElement('script');
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
        // @ts-ignore - Botpress adds window.botpressWebChat
        window.botpressWebChat.init({
          configUrl: configUrl,
          theme: theme,
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
  }, [configUrl, theme]);
  
  // Create a div to render the chat button (instead of returning null)
  return <div id="bp-web-widget" style={{ zIndex: 9999 }}></div>;
};
