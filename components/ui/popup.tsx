"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useState } from "react";

export default function Popup({ open, setOpen, handleForm }: { open: boolean; setOpen: (isOpen: boolean) => void; handleForm: (formData: any) => void }) {
  const [formData, setFormData] = useState<{
    title: string;
    message: string;
    file: File | null;
    type: "text" | "file";
  }>({
    title: "",
    message: "",
    file: null,
    type: "text",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    setFormData((prevData) => ({
      ...prevData,
      file: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleForm(formData);
  };

  const handleInputTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      type: e.target.value as "text" | "file",
    }));
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-black px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-12">
                  <div className="border-b border-white/10 pb-12">
                    <p className="mt-1 text-sm leading-6 text-gray-400">This information will be encrypted and saved to the chain.</p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="col-span-full">
                        <fieldset>
                          <legend className="block text-sm font-medium leading-6 text-gray-400">Secret Type</legend>
                          <div className="mt-4  flex flex-row gap-2">
                            <div className="flex items-center">
                              <input
                                id="text-option"
                                name="inputType"
                                type="radio"
                                value="text"
                                checked={formData.type === "text"}
                                onChange={handleInputTypeChange}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="text-option" className="ml-3 block text-sm font-medium leading-6 text-gray-400">
                                Text
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="file-option"
                                name="inputType"
                                type="radio"
                                value="file"
                                checked={formData.type === "file"}
                                onChange={handleInputTypeChange}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="file-option" className="ml-3 block text-sm font-medium leading-6 text-gray-400">
                                File
                              </label>
                            </div>
                          </div>
                        </fieldset>
                      </div>

                      {formData.type === "text" && (
                        <div className="col-span-full">
                          <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-400">
                            Title
                          </label>
                          <div className="mt-2">
                            <input
                              id="title"
                              name="title"
                              type="text"
                              autoComplete="title"
                              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-amber-200 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-amber-200 sm:text-sm sm:leading-6"
                              value={formData.title}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="mt-2">
                            <p className="mt-3 text-sm leading-6 text-gray-400">Write your message to keep.</p>
                            <textarea
                              id="message"
                              name="message"
                              rows={3}
                              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-amber-200 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-amber-200 sm:text-sm sm:leading-6"
                              value={formData.message}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      )}

                      {formData.type === "file" && (
                        <div className="col-span-full">
                          <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-400">
                            Title
                          </label>
                          <div className="mt-2">
                            <input
                              id="title"
                              name="title"
                              type="text"
                              autoComplete="title"
                              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-amber-200 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-amber-200 sm:text-sm sm:leading-6"
                              value={formData.title}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                            <div className="text-center">
                              <div className="mt-4 flex text-sm leading-6 text-gray-400">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer rounded-md bg-gray-900 font-semibold text-amber-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-200 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-indigo-500"
                                >
                                  <span>Upload a file</span>
                                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF, PDF, MP3, WAV, ZIP up to 20MB</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button"
                    className="rounded-md bg-black border border-1 border-amber-200 text-amber-200 px-3 py-2 text-sm font-semibold text-amber-200 shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-amber-200 text-black px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
