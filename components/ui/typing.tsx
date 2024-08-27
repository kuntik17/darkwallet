"use client";
import { useEffect, useState } from "react";

const TypingAnimation = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["data", "photo", "sound", "text", "secret"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="flex flex-col items-center justify-start w-[350px]">
      <h1 className="text-4xl font-bold">
        Keep your <span className="inline-block border-r-4 border-black text-amber-300">{words[currentWord]}</span> <br></br>
        <div>in your wallet</div>
      </h1>
    </div>
  );
};

export default TypingAnimation;
