"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {};

type Inputs = {
  name: string;
  email: string;
  subject: string;
  company: string;
  body: string;
};

export default function ContactForm({}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

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

      const resinfo = await res.json();
      console.log("Success:", resinfo);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className=" w-1/2 h-2/3 flex flex-col items-center justify-start p-8">
      <h1 className="text-2xl font-bold mb-6">Contact me</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        id="contactForm"
        className="w-full space-y-4"
      >
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            {...register("name", { required: true })}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            {...register("email", { required: true })}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium mb-1">
            Company (Optional)
          </label>
          <input
            type="company"
            id="company"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            {...register("company", { required: false })}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="subject" className="text-sm font-medium mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            {...register("subject", { required: true })}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="body" className="text-sm font-medium mb-1">
            Message *
          </label>
          <textarea
            id="body"
            rows={5}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            {...register("body", { required: true })}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
