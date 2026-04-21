"use client";

import ConnectSection from "@/components/home/connect-section";
import ExperienceSection from "@/components/home/experience-section";
import IntroSection from "@/components/home/intro-section";
import ThoughtsSection from "@/components/home/thoughts-section";
import WorkSection from "@/components/home/work-section";
import SkillsSection from "../components/home/skills-section";
import { useExperiences, useProjects } from "@/hooks/useProjects";
import { useEffect, useRef, useState } from "react";

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
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter(
          (entry) => entry.isIntersecting,
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
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative bg-background min-h-screen text-foreground">
      <nav className="hidden lg:block top-1/2 left-8 z-10 fixed -translate-y-1/2">
        <div className="flex flex-col gap-4">
          {[
            "intro",
            "experience",
            "skills",
            "work",
            "thoughts",
            "connect",
          ].map((section) => (
            <button
              type="button"
              key={section}
              onClick={() => handleNavigate(section)}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section
                  ? "bg-foreground"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="mx-auto px-6 sm:px-8 lg:px-16 max-w-4xl">
        <IntroSection
          sectionRef={(el) => {
            sectionsRef.current[0] = el;
          }}
        />

        <ExperienceSection
          sectionRef={(el) => {
            sectionsRef.current[1] = el;
          }}
          experiences={experiences}
          experiencesLoading={experiencesLoading}
          experiencesLoadingMessage={experiencesLoadingMessage}
        />

        <SkillsSection
          sectionRef={(el: HTMLElement | null) => {
            sectionsRef.current[2] = el;
          }}
        />

        <WorkSection
          sectionRef={(el) => {
            sectionsRef.current[3] = el;
          }}
          projects={projects}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
        />

        <ThoughtsSection
          sectionRef={(el) => {
            sectionsRef.current[4] = el;
          }}
        />

        <ConnectSection
          sectionRef={(el) => {
            sectionsRef.current[5] = el;
          }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      </main>

      <div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none">
      </div>
    </div>
  );
}
