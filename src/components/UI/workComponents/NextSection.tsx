import React, { SetStateAction, Dispatch, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";

type NextType = {
  role: string;
  company: string;
};

type Props = {
  next: NextType;
  setNext: Dispatch<SetStateAction<NextType>>;
};

type Inputs = {
  name: string;
  email: string;
  role: string;
  company: string;
  body: string;
};

export default function NextSection({ setNext, next }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [send, setSend] = useState<boolean>(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      setSend(true);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center  justify-center ">
      {send && (
        <h1 className="text-2xl mb-5 text-center font-bold">
          All good! Mail received!
        </h1>
      )}
      <div className="w-1/2 text-2xl px-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          id="contactForm"
          className="w-full space-y-4"
        >
          <div className="text-lg  font-medium mb-5">
            <div className="flex flex-row items-center  gap-x-2">
              <span>To: </span>
              <span className="">bertoBautista03@gmail.com</span>
              <Image
                alt="mail"
                src={"/images/Contact/Mail.svg"}
                height={40}
                width={40}
                className="mb-3 hover:rotate-45 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-row gap-x-2">
            <div className="flex flex-col w-1/2 ">
              <label htmlFor="role" className="text-sm font-medium mb-1">
                Role
              </label>
              <input
                type="text"
                id="role"
                className=" border-gray-300 border-b focus:outline-none focus:ring-0 focus:ring-black "
                {...register("role", { required: false })}
                onChange={(e) => {
                  setNext({ ...next, role: e.target.value });
                }}
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label htmlFor="company" className="text-sm font-medium mb-1">
                Company
              </label>
              <input
                type="company"
                id="company"
                className="border-b border-gray-300  focus:outline-none focus:ring-0 focus:ring-black "
                {...register("company", { required: false })}
                onChange={(e) => {
                  setNext({ ...next, company: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              className="p-1 border-b border-gray-300  focus:outline-none focus:ring-0 focus:ring-black "
              {...register("email", { required: true })}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              className="p-1 border-b border-gray-300  focus:outline-none focus:ring-0 focus:ring-black "
              {...register("name", { required: true })}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="body" className="text-sm font-medium mb-3">
              Your Message *
            </label>
            <textarea
              id="body"
              rows={5}
              className="p-1 border rounded-md border-gray-300  focus:outline-none focus:ring-0 focus:ring-black "
              {...register("body", { required: true })}
            ></textarea>
          </div>
          <button
            type="submit"
            className=" text-lg w-full border rounded-md border-custom-red text-black  py-2  transition-colors cursor-pointer"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
