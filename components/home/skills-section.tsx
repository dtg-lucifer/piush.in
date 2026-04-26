"use client";

import { BiLogoVisualStudio } from "react-icons/bi";
import { FaAws, FaGolang, FaJava, FaPython, FaReact, FaRust } from "react-icons/fa6";
import { RiNextjsFill } from "react-icons/ri";
import type { ComponentType } from "react";
import { BarChart2, LineChart } from "lucide-react";
import {
	SiActix,
	SiAnsible,
	SiCplusplus,
	SiDocker,
	SiExpress,
	SiGin,
	SiGitlab,
	SiGooglecloud,
	SiGrafana,
	SiGooglegemini,
	SiHono,
	SiHuggingface,
	SiIntellijidea,
	SiKubernetes,
	SiNestjs,
	SiNumpy,
	SiOllama,
	SiOpenai,
	SiPandas,
	SiPostman,
	SiPrometheus,
	SiPytorch,
	SiScikitlearn,
	SiSupabase,
	SiSvelte,
	SiTailwindcss,
	SiTensorflow,
	SiTerraform,
	SiTypescript,
	SiVite,
} from "react-icons/si";

interface SkillsSectionProps {
	sectionRef: (el: HTMLElement | null) => void;
}

type SkillGroup = {
	label: string;
	description: string;
	icons: { name: string; Icon: ComponentType<{ className?: string }> }[];
	accent: string;
};

const skillGroups: SkillGroup[] = [
	{
		label: "Frameworks",
		description: "The stack I reach for when I want to move fast without losing structure.",
		accent: "from-cyan-500/25 via-transparent to-transparent",
		icons: [
			{ name: "React", Icon: FaReact },
			{ name: "Next.js", Icon: RiNextjsFill },
			{ name: "Tailwind CSS", Icon: SiTailwindcss },
			{ name: "Express", Icon: SiExpress },
			{ name: "Hono", Icon: SiHono },
			{ name: "Vite", Icon: SiVite },
			{ name: "NestJS", Icon: SiNestjs },
			{ name: "Gin", Icon: SiGin },
			{ name: "Actix", Icon: SiActix },
			{ name: "SvelteKit", Icon: SiSvelte },
		],
	},
	{
		label: "Languages",
		description: "Languages I use to build product, systems, and tooling across the stack.",
		accent: "from-amber-500/25 via-transparent to-transparent",
		icons: [
			{ name: "TypeScript", Icon: SiTypescript },
			{ name: "Go", Icon: FaGolang },
			{ name: "Rust", Icon: FaRust },
			{ name: "Java", Icon: FaJava },
			{ name: "Python", Icon: FaPython },
			{ name: "C++", Icon: SiCplusplus },
		],
	},
	{
		label: "Tools",
		description: "The editor, delivery, and API tooling that keeps my workflow tight.",
		accent: "from-fuchsia-500/25 via-transparent to-transparent",
		icons: [
			{ name: "VS Code", Icon: BiLogoVisualStudio },
			{ name: "IntelliJ", Icon: SiIntellijidea },
			{ name: "Postman", Icon: SiPostman },
			{ name: "Docker", Icon: SiDocker },
			{ name: "Supabase", Icon: SiSupabase },
			{ name: "GitLab", Icon: SiGitlab },
		],
	},
	{
		label: "Cloud & DevOps",
		description: "Infrastructure and observability tools I am comfortable shipping with.",
		accent: "from-emerald-500/25 via-transparent to-transparent",
		icons: [
			{ name: "Google Cloud", Icon: SiGooglecloud },
			{ name: "AWS", Icon: FaAws },
			{ name: "Kubernetes", Icon: SiKubernetes },
			{ name: "Ansible", Icon: SiAnsible },
			{ name: "Terraform", Icon: SiTerraform },
			{ name: "Grafana", Icon: SiGrafana },
			{ name: "Prometheus", Icon: SiPrometheus },
		],
	},
];

const aiMlGroup: SkillGroup = {
	label: "AI / ML",
	description: "Libraries and platforms I use for machine learning, data science, and working with LLMs.",
	accent: "from-violet-500/25 via-transparent to-transparent",
	icons: [
		{ name: "TensorFlow", Icon: SiTensorflow },
		{ name: "PyTorch", Icon: SiPytorch },
		{ name: "scikit-learn", Icon: SiScikitlearn },
		{ name: "NumPy", Icon: SiNumpy },
		{ name: "Pandas", Icon: SiPandas },
		{ name: "Matplotlib", Icon: LineChart },
		{ name: "Seaborn", Icon: BarChart2 },
		{ name: "Ollama", Icon: SiOllama },
		{ name: "OpenAI", Icon: SiOpenai },
		{ name: "Gemini", Icon: SiGooglegemini },
		{ name: "Hugging Face", Icon: SiHuggingface },
	],
};

export default function SkillsSection({ sectionRef }: SkillsSectionProps) {
	return (
		<section id="skills" ref={sectionRef} className="py-20 sm:py-32 min-h-screen">
			<div className="space-y-10 sm:space-y-14">
				<div className="space-y-4 max-w-2xl">
					<div className="font-mono text-muted-foreground text-sm uppercase tracking-[0.3em]">
						Relevant Skills
					</div>
					<h2 className="font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight">
						A compact view of the tools and stacks I use most.
					</h2>
				</div>

				<div className="gap-4 sm:gap-6 grid md:grid-cols-2">
					{skillGroups.map((group) => (
						<article
							key={group.label}
							className="group relative bg-card/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm p-6 sm:p-7 border border-border/70 overflow-hidden transition-transform hover:-translate-y-1 duration-300"
						>
							<div className={`absolute inset-0 bg-linear-to-br ${group.accent} opacity-80`} />
							<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/30" />

							<div className="relative space-y-5">
								<div className="flex justify-between items-end gap-4">
									<div>
										<div className="font-mono text-muted-foreground/80 text-xs uppercase tracking-[0.28em]">
											Group
										</div>
										<h3 className="mt-2 font-medium text-2xl sm:text-3xl">{group.label}</h3>
									</div>
									<div className="hidden sm:block bg-background/60 px-3 py-1 border border-border/70 rounded-full text-muted-foreground text-xs">
										{group.icons.length} skills
									</div>
								</div>

								<p className="max-w-md text-muted-foreground leading-relaxed">{group.description}</p>

								<div className="gap-3 grid grid-cols-3 sm:grid-cols-4">
									{group.icons.map(({ name, Icon }) => (
										<div
											key={name}
											className="group/icon flex flex-col justify-center items-center gap-2 bg-background/70 hover:bg-background px-3 py-4 border border-border/70 hover:border-foreground/30 rounded-2xl text-center transition-all duration-300"
										>
											<Icon className="w-7 sm:w-8 h-7 sm:h-8 text-foreground/90 group-hover/icon:scale-110 transition-transform duration-300" />
											<span className="text-[11px] text-muted-foreground sm:text-xs leading-tight">
												{name}
											</span>
										</div>
									))}
								</div>
							</div>
						</article>
					))}
				</div>

				{/* AI / ML — full width, spans both columns */}
				<article className="group relative bg-card/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm p-6 sm:p-7 border border-border/70 overflow-hidden transition-transform hover:-translate-y-1 duration-300">
					<div className={`absolute inset-0 bg-linear-to-br ${aiMlGroup.accent} opacity-80`} />
					<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/30" />

					<div className="relative space-y-5">
						<div className="flex justify-between items-end gap-4">
							<div>
								<div className="font-mono text-muted-foreground/80 text-xs uppercase tracking-[0.28em]">
									Group
								</div>
								<h3 className="mt-2 font-medium text-2xl sm:text-3xl">{aiMlGroup.label}</h3>
							</div>
							<div className="hidden sm:block bg-background/60 px-3 py-1 border border-border/70 rounded-full text-muted-foreground text-xs">
								{aiMlGroup.icons.length} skills
							</div>
						</div>

						<p className="max-w-2xl text-muted-foreground leading-relaxed">{aiMlGroup.description}</p>

						<div className="gap-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
							{aiMlGroup.icons.map(({ name, Icon }) => (
								<div
									key={name}
									className="group/icon flex flex-col justify-center items-center gap-2 bg-background/70 hover:bg-background px-3 py-4 border border-border/70 hover:border-foreground/30 rounded-2xl text-center transition-all duration-300"
								>
									<Icon className="w-7 sm:w-8 h-7 sm:h-8 text-foreground/90 group-hover/icon:scale-110 transition-transform duration-300" />
									<span className="text-[11px] text-muted-foreground sm:text-xs leading-tight">
										{name}
									</span>
								</div>
							))}
						</div>
					</div>
				</article>
			</div>
		</section>
	);
}
