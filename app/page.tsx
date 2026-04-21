"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import ConnectSection from "@/components/home/connect-section";
import ExperienceSection from "@/components/home/experience-section";
import IntroSection from "@/components/home/intro-section";
import ThoughtsSection from "@/components/home/thoughts-section";
import WorkSection from "@/components/home/work-section";
import { useExperiences, useProjects } from "@/hooks/useProjects";
import SkillsSection from "../components/home/skills-section";

type ThemeMode = "dark" | "light";

const faviconAssets: Record<ThemeMode, Record<string, string>> = {
  light: {
    manifest: "/favicon/light/site.webmanifest",
    icon16: "/favicon/light/favicon-16x16.png",
    icon32: "/favicon/light/favicon-32x32.png",
    iconIco: "/favicon/light/favicon.ico",
    apple: "/favicon/light/apple-touch-icon.png",
  },
  dark: {
    manifest: "/favicon/dark/site.webmanifest",
    icon16: "/favicon/dark/favicon-16x16.png",
    icon32: "/favicon/dark/favicon-32x32.png",
    iconIco: "/favicon/dark/favicon.ico",
    apple: "/favicon/dark/apple-touch-icon.png",
  },
};

function updateLinkElement(
  selector: string,
  rel: string,
  href: string,
  attributes: Record<string, string> = {},
) {
  let linkElement = document.head.querySelector(selector) as
    | HTMLLinkElement
    | null;

  if (!linkElement) {
    linkElement = document.createElement("link");
    linkElement.rel = rel;
    document.head.appendChild(linkElement);
  }

  linkElement.href = href;

  for (const [attributeName, attributeValue] of Object.entries(attributes)) {
    linkElement.setAttribute(attributeName, attributeValue);
  }
}

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { projects, isLoading, loadingMessage } = useProjects();
  const {
    experiences,
    isLoading: experiencesLoading,
    loadingMessage: experiencesLoadingMessage,
  } = useExperiences();
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const isFirefox = /firefox|fxios/i.test(navigator.userAgent);

    if (isFirefox) {
      return;
    }

    const lenis = new Lenis();
    lenisRef.current = lenis;

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setIsDark(savedTheme === "dark");
      return;
    }

    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    const assets = faviconAssets[theme];

    updateLinkElement('link[rel="manifest"]', "manifest", assets.manifest);
    updateLinkElement(
      'link[rel="icon"][sizes="16x16"]',
      "icon",
      assets.icon16,
      {
        type: "image/png",
        sizes: "16x16",
      },
    );
    updateLinkElement(
      'link[rel="icon"][sizes="32x32"]',
      "icon",
      assets.icon32,
      {
        type: "image/png",
        sizes: "32x32",
      },
    );
    updateLinkElement(
      'link[rel="icon"][href$="favicon.ico"]',
      "icon",
      assets.iconIco,
    );
    updateLinkElement(
      'link[rel="apple-touch-icon"]',
      "apple-touch-icon",
      assets.apple,
    );
  }, [isDark]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter((entry) =>
          entry.isIntersecting
        );

        if (intersectingEntries.length === 0) {
          return;
        }

        const currentSection = intersectingEntries.reduce(
          (bestEntry, entry) => {
            if (entry.intersectionRatio !== bestEntry.intersectionRatio) {
              return entry.intersectionRatio > bestEntry.intersectionRatio
                ? entry
                : bestEntry;
            }

            return entry.boundingClientRect.top <
                bestEntry.boundingClientRect.top
              ? entry
              : bestEntry;
          },
        );

        currentSection.target.classList.add("animate-fade-in-up");
        setActiveSection(currentSection.target.id);
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);

    const target = document.getElementById(section);

    if (!target) {
      return;
    }

    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(target, { duration: 1 });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative bg-background min-h-screen text-foreground">
      <nav className="hidden lg:block top-1/2 left-8 z-10 fixed -translate-y-1/2">
        <div className="flex flex-col gap-4">
          {["intro", "experience", "skills", "work", "thoughts", "connect"].map(
            (section) => (
              <button
                aria-label={`Navigate to ${section}`}
                className={`h-8 w-2 rounded-full transition-all duration-500 ${
                  activeSection === section
                    ? "bg-foreground"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                key={section}
                onClick={() => handleNavigate(section)}
                type="button"
              />
            ),
          )}
        </div>
      </nav>

      <main className="mx-auto px-6 sm:px-8 lg:px-16 max-w-4xl">
        <IntroSection
          sectionRef={(el) => {
            sectionsRef.current[0] = el;
          }}
        />

        <ExperienceSection
          experiences={experiences}
          experiencesLoading={experiencesLoading}
          experiencesLoadingMessage={experiencesLoadingMessage}
          sectionRef={(el) => {
            sectionsRef.current[1] = el;
          }}
        />

        <SkillsSection
          sectionRef={(el: HTMLElement | null) => {
            sectionsRef.current[2] = el;
          }}
        />

        <WorkSection
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          projects={projects}
          sectionRef={(el) => {
            sectionsRef.current[3] = el;
          }}
        />

        <ThoughtsSection
          sectionRef={(el) => {
            sectionsRef.current[4] = el;
          }}
        />

        <ConnectSection
          isDark={isDark}
          onToggleTheme={toggleTheme}
          sectionRef={(el) => {
            sectionsRef.current[5] = el;
          }}
        />
      </main>

      <div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none">
      </div>
    </div>
  );
}
