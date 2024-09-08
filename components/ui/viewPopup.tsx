import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

export default function ViewPopup({ open, setOpen, data }: { open: boolean; setOpen: (isOpen: boolean) => void; data: { title: string; message: string; type: string } }) {
  if (!data) {
    return null;
  }

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative transform overflow-hidden rounded-lg bg-black px-4 pb-4 pt-5 text-left shadow-xl w-full max-w-sm sm:my-8 sm:p-6">
          <div>
            <div className="space-y-12">
              <div className="border-b border-white/10 pb-12">
                <p className="mt-1 text-sm leading-6 text-gray-400">This information will be encrypted and saved to the chain.</p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                        value={data.title}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="mt-3 text-sm leading-6 text-gray-400">Your message to keep.</p>
                      {data.type === "text" ? (
                        <textarea
                          id="message"
                          name="message"
                          rows={3}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-amber-200 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-amber-200 sm:text-sm sm:leading-6"
                          value={data.message}
                        />
                      ) : (
                        <img src={data.message} alt="Secret" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="rounded-md bg-black border border-1 border-amber-200 text-amber-200 px-3 py-2 text-sm font-semibold text-amber-200 shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
