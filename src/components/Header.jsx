import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useRef } from "react";

function Header() {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef(null);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (
      currentScrollY > lastScrollY &&
      currentScrollY > window.innerHeight * 0.2
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div
        className={`p-3 fixed z-10 right-6 left-6 rounded-xs transition-all ease-out duration-1000 flex flex-col items-center gap-5 bg-zzlink ${
          isVisible ? "-bottom-30" : "bottom-3"
        } 
        
        `}
        ref={headerRef}
      >
        <p
          className={`cursor-pointer font-zzname text-2xl text-zzcontrast ${
            i18n.language === "fr" ? "hidden" : ""
          }`}
          onClick={() => i18n.changeLanguage("fr")}
        >
          Francais
        </p>
        <p
          className={`cursor-pointer font-zzname text-2xl text-zzcontrast ${
            i18n.language === "en" ? "hidden" : ""
          }`}
          onClick={() => i18n.changeLanguage("en")}
        >
          English
        </p>
      </div>
    </>
  );
}

export default Header;
