"use client";
import React, { useEffect, useState, useRef } from "react";
import CursorTip from "./CursorTip";
import gsap from "gsap";
import Link from "next/link";

type Project = {
  id: number;
  title: string;
  description: string;
  demo: string;
  type: string;
  link: {
    github: string;
    website: string;
    post: string;
  };
};

type ProjectProps = {
  project: Project;
  setHoverProject: (args: ProjectState) => void;
};

type ProjectState = {
  demo: string | null;
  state: boolean;
};

const proejcts: Project[] = [
  {
    id: 1,
    title: "Viniltify",
    description: "",
    demo: "/videos/viniltify.mp4",
    type: "3D Web experience ",
    link: {
      github: "https://github.com/BertovDev/viniltify_app",
      website: "",
      post: "https://x.com/tongenjs/status/1870993576059933130",
    },
  },
  {
    id: 2,
    title: "My Daily Bliss Blog",
    description: "",
    demo: "/videos/blog.mp4",
    type: "Blog",
    link: {
      github: "https://github.com/BertovDev/myDailyBlissBlog",
      website: "https://daily-bliss-blog.netlify.app/",
      post: "",
    },
  },
  {
    id: 3,
    title: "Canvas Camera Shader",
    description: "",
    demo: "/videos/cameraShader.mp4",
    type: "Shader",
    link: {
      github: "",
      website: "",
      post: "https://x.com/tongenjs/status/1892994665084854467",
    },
  },
  {
    id: 4,
    title: "Canvas Hologram Camera",
    description: "",
    demo: "/videos/holograme.mp4",
    type: "Shader ",
    link: {
      github: "",
      website: "",
      post: "",
    },
  },
  {
    id: 5,
    title: "Join The Evolution",
    description: "",
    demo: "/videos/evolution.mkv",
    type: "Shader | Gesture detection ",
    link: {
      github: "https://github.com/BertovDev/Join-the-evolution",
      website: "",
      post: "",
    },
  },
  {
    id: 6,
    title: "Isavet",
    description: "",
    demo: "/videos/isavet.mkv",
    type: "Business solution ",
    link: {
      github: "https://github.com/BertovDev/IsaVet",
      website: "https://isavet.netlify.app/",
      post: "",
    },
  },
  {
    id: 7,
    title: "3D Connect Four",
    description: "",
    demo: "/videos/connect.mkv",
    type: "3D Web experience ",
    link: {
      github: "https://github.com/BertovDev/3D-Connect-Four",
      website: "https://connectfour3d.netlify.app/",
      post: "https://x.com/tongenjs/status/1516384493262802944",
    },
  },
];

function ProjectItem({ ...props }: ProjectProps) {
  const ref: React.RefObject<HTMLLIElement | null> = React.createRef();

  return (
    <li className="flex flex-row gap-2 item" ref={ref}>
      <div
        onPointerEnter={() =>
          props.setHoverProject({ demo: props.project.demo, state: true })
        }
        onPointerLeave={() =>
          props.setHoverProject({ demo: null, state: false })
        }
      >
        <span className="font-bold  cursor-pointer">{props.project.title}</span>{" "}
        ~ <span className="font-normal ">{props.project.type}</span>~{" "}
      </div>{" "}
      <div className="font-normal text-gray-600">
        {props.project.link.github && (
          <Link
            href={props.project.link.github}
            target="_blank"
            className=" underline hover:text-custom-red"
          >
            GitHub
          </Link>
        )}{" "}
        {props.project.link.website && (
          <Link
            href={props.project.link.website}
            target="_blank"
            className=" underline  hover:text-custom-red"
          >
            Website
          </Link>
        )}{" "}
        {props.project.link.post && (
          <Link
            href={props.project.link.post}
            target="_blank"
            className=" underline hover:text-custom-red"
          >
            Post
          </Link>
        )}
      </div>
    </li>
  );
}

export default function Projects() {
  const [hoverProject, setHoverProject] = useState<ProjectState>({
    state: false,
    demo: "",
  });

  const [currentDemo, setCurrentDemo] = useState<string | null>("");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (hoverProject.demo !== null) {
      setCurrentDemo(hoverProject.demo);
    }
  }, [hoverProject.state]);

  useEffect(() => {
    if (listRef.current) {
      const items: HTMLLIElement[] = gsap.utils.toArray(
        listRef.current.children
      );
      items.forEach((item, index) => {
        console.log(item);

        gsap.set(item, {
          opacity: 0,
          x: index > 2 ? 50 : -50,
          y: -20,
        });

        gsap.to(item, {
          opacity: 1,
          x: 0,
          y: 0,
          stagger: 0.2,
          duration: 0.5,
          delay: index * 0.1,
        });
      });
    }
  }, []);

  return (
    <div className="cursor-auto w-full h-full 0 font-inter flex justify-start flex-col">
      <h1 className="text-3xl font-bold mt-5 ml-5">
        Projects and Experiments Archive_
      </h1>
      <div className="flex justify-center h-full items-center mb-10">
        <ul
          ref={listRef}
          className="flex text-center items-center justify-center flex-col gap-4 text-5xl font-semibold"
        >
          {proejcts.map((project, index) => {
            return (
              <ProjectItem
                key={index}
                project={project}
                setHoverProject={setHoverProject}
              />
            );
          })}
        </ul>
      </div>
      <CursorTip
        isHovering={hoverProject.state}
        textContent={""}
        imageContent={currentDemo}
      />
    </div>
  );
}
