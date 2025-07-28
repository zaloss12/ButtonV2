declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          chat?: {
            id: number;
            type: string;
          };
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        ready: () => void;
        close: () => void;
        expand: () => void;
        sendData: (data: string) => void;
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
      };
    };
  }
}

export function initializeTelegramWebApp() {
  // Check if we're running in Telegram
  if (!window.Telegram?.WebApp) {
    return null;
  }

  const tg = window.Telegram.WebApp;
  
  // Initialize the web app
  tg.ready();
  
  // Expand to full height
  tg.expand();
  
  // Set theme
  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
  
  // Return user data if available
  return {
    user: tg.initDataUnsafe.user,
    chat: tg.initDataUnsafe.chat,
    startParam: tg.initDataUnsafe.start_param,
    platform: tg.platform,
    version: tg.version
  };
}

export function sendTelegramData(data: any) {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  }
}

export function showTelegramAlert(message: string) {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    alert(message);
  }
}
