import React, { useEffect } from "react";

const TelegramLogin = () => {
  useEffect(() => {
    // Define the onTelegramAuth function
    (window as any).onTelegramAuth = async (user: any) => {
      console.log(user.id, user.username, "tg_id");
    };

    // Create and append the script element
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "darkvaultwallet_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "5");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.appendChild(script);
    }
  }, []);

  return <div id="telegram-login-container"></div>;
};

export default TelegramLogin;
