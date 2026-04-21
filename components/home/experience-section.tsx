"use client";

import { calculateDuration, type Experience } from "@/hooks/useProjects";

interface ExperienceSectionProps {
    sectionRef: (el: HTMLElement | null) => void;
    experiences: Experience[];
    experiencesLoading: boolean;
    experiencesLoadingMessage: string;
}

export default function ExperienceSection({
    sectionRef,
    experiences,
    experiencesLoading,
    experiencesLoadingMessage,
}: ExperienceSectionProps) {
    return (
        <section
            id="experience"
            ref={sectionRef}
            className="py-20 sm:py-32 min-h-screen"
        >
            <div className="space-y-12 sm:space-y-16">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                    <h2 className="font-light text-3xl sm:text-4xl">
                        Past Roles & Experiences
                    </h2>
                    <div className="font-mono text-muted-foreground text-sm">
                        {experiencesLoading
                            ? experiencesLoadingMessage
                            : `${experiences.length} Roles`}
                    </div>
                </div>

                <div className="space-y-8 sm:space-y-12">
                    {experiences.map((exp) => (
                        <div
                            key={`${exp.organization}-${exp.position}`}
                            className="group items-start gap-4 sm:gap-8 grid lg:grid-cols-12 py-6 sm:py-8 border-border/50 hover:border-border border-b transition-colors duration-500"
                        >
                            <div className="lg:col-span-2">
                                <div className="font-light text-muted-foreground group-hover:text-foreground text-xl sm:text-2xl transition-colors duration-500">
                                    {exp.end_date === "CURRENT"
                                        ? "Present"
                                        : calculateDuration(
                                            exp.start_date,
                                            exp.end_date,
                                        )}
                                </div>
                            </div>

                            <div className="space-y-3 lg:col-span-6">
                                <div>
                                    <h3 className="font-medium text-lg sm:text-xl">
                                        {exp.position}
                                    </h3>
                                    <div className="text-muted-foreground text-sm">
                                        <span>{exp.organization}</span>
                                        {" · "}
                                        <span>{exp.location}</span>
                                    </div>
                                </div>
                                <p className="max-w-lg text-muted-foreground leading-relaxed">
                                    {exp.brief}
                                </p>
                            </div>

                            <div className="flex flex-wrap lg:justify-end gap-2 lg:col-span-4 mt-2 lg:mt-0">
                                <span className="px-2 py-1 group-hover:border-muted-foreground/50 rounded text-muted-foreground text-xs transition-colors duration-500">
                                    {exp.employment_type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
