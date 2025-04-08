"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  name: string;
  email: string;
  body: string;
};

export default function ContactForm() {
  const { register, handleSubmit } = useForm<Inputs>();

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
    <div className=" w-1/2 h-2/3 flex flex-col  justify-start p-8">
      {send && (
        <h1 className="text-2xl mb-5 text-center font-bold">
          All good! Mail received!
        </h1>
      )}
      <div className="flex flex-row items-center gap-x-5">
        <h1 className="text-3xl font-medium mb-3">So contact me</h1>
        <Image
          alt="mail"
          src={"/images/Contact/Mail.svg"}
          height={50}
          width={50}
          className="mb-3 hover:rotate-45 transition-all"
        />
      </div>
      <div className="h-full border-b border-gray-300 mb-3"></div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        id="contactForm"
        className="w-full space-y-4"
      >
        <div className="text-lg  font-medium mb-5">
          <span>To: </span>
          <span className="">bertoBautista03@gmail.com</span>
        </div>
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            className="p-2  border-gray-300 border-b focus:outline-none focus:ring-0 focus:ring-black "
            {...register("name", { required: true })}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium mb-1">
            Your Email *
          </label>
          <input
            type="email"
            id="email"
            className="p-2 border-b border-gray-300  focus:outline-none focus:ring-0 focus:ring-black "
            {...register("email", { required: true })}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="body" className="text-sm font-medium mb-3">
            Your Message *
          </label>
          <textarea
            id="body"
            rows={5}
            className="p-2 border rounded-md border-gray-300  focus:outline-none focus:ring-0 focus:ring-black "
            {...register("body", { required: true })}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full border rounded-md border-custom-red text-black  py-2  transition-colors cursor-pointer"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
