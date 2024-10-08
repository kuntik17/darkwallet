"use client";

import { WavyBackground } from "@/components/ui/wavy-background";
import { BsEye } from "react-icons/bs";
import Popup from "@/components/ui/popup";
import { useState } from "react";
import { useWeb3 } from "@/context/Web3Provider";
import { blobToBase64, encodeb64 } from "@/lib/lit";
import ViewPopup from "@/components/ui/viewPopup";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [openView, setOpenView] = useState(false);

  const { hideMessage, messages, viewMessage, mint, image } = useWeb3();

  const handleForm = (formData: any) => {
    if (formData.type === "text") {
      hideMessage(formData.title, formData.message, formData.type);
    } else if (formData.type === "file") {
      const file = formData.file;
      blobToBase64(file).then((base64) => {
        const encoded = encodeb64(base64);
        hideMessage(formData.title, encoded as string, formData.type);
      });
    }
    setOpen(false);
  };

  const handleView = async (id: string) => {
    const message = messages.find((message) => message.id === id);
    const data = await viewMessage(message.ciphertext, message.dataToEncryptHash, message.type);
    setData({
      title: message.title,
      message: message.type === "text" ? data : image,
      type: message.type,
    });
    setOpenView(true);
  };

  return (
    <main className="h-[100vh] flex justify-center items-center bg-black">
      <Popup open={open} setOpen={setOpen} handleForm={handleForm} />
      <ViewPopup open={openView} setOpen={setOpenView} data={data} />
      <WavyBackground className="flex flex-col justify-center items-center text-white">
        <div className="border border-1 bg-black border-amber-200 px-4 py-5 rounded-lg m-4">
          <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-4">
              <h3 className="text-base font-semibold leading-6 text-amber-200">Add data to your wallet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your data will be encrypted and saved to the chain. <br></br>The wallet you have permission to retrieve it.
              </p>
            </div>
            <div className="ml-4 mt-4 flex-shrink-0">
              <button
                type="button"
                className="relative text-black inline-flex items-center rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                onClick={() => setOpen(true)}
              >
                Add data
              </button>
            </div>
          </div>
          <h3 className="text-base font-semibold leading-6 text-amber-200 mt-8">Current data in your wallet</h3>
          <ul role="list" className="divide-y divide-gray-100">
            {messages && messages.length > 0 ? (
              messages.map((file: any) => (
                <li key={file.title} className="flex justify-between gap-x-6 py-5">
                  <div className="flex gap-x-4">
                    {" "}
                    <div className="flex-auto">
                      <p className="text-sm mt-1 font-semibold leading-6 text-amber-200">{file.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <button className="flex flex-row gap-2  text-cyan-500" onClick={() => handleView(file.id)}>
                      Reveal <BsEye className="h-6 w-6  text-cyan-500" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>Nothing to hide</p>
            )}
          </ul>
        </div>
      </WavyBackground>
    </main>
  );
}
