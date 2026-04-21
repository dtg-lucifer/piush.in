"use client";

import { useEffect, useRef, useState } from "react";
import ConnectSection from "@/components/home/connect-section";
import ExperienceSection from "@/components/home/experience-section";
import IntroSection from "@/components/home/intro-section";
import ThoughtsSection from "@/components/home/thoughts-section";
import WorkSection from "@/components/home/work-section";
import { useLenis } from "@/hooks/useLenis";
import { useExperiences, useProjects } from "@/hooks/useProjects";
import SkillsSection from "../components/home/skills-section";

export default function Home() {
    const [activeSection, setActiveSection] = useState("");
    const { projects, isLoading, loadingMessage } = useProjects();
    const featuredProjects = projects.filter((project) =>
        project.featured === true
    );
    const {
        experiences,
        isLoading: experiencesLoading,
        loadingMessage: experiencesLoadingMessage,
    } = useExperiences();
    const sectionsRef = useRef<(HTMLElement | null)[]>([]);
    const lenisRef = useLenis();

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
                        if (
                            entry.intersectionRatio !==
                                bestEntry.intersectionRatio
                        ) {
                            return entry.intersectionRatio >
                                    bestEntry.intersectionRatio
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
                    {[
                        "intro",
                        "experience",
                        "skills",
                        "work",
                        "thoughts",
                        "connect",
                    ].map((section) => (
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
                    projects={featuredProjects}
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
