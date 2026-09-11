import type { ComponentType } from "react";
import { BiLogoVisualStudio } from "react-icons/bi";
import { FaAws, FaGolang, FaJava, FaPython, FaReact, FaRust } from "react-icons/fa6";
import { RiNextjsFill } from "react-icons/ri";
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
	SiLangchain,
	SiLanggraph,
	SiNestjs,
	SiNumpy,
	SiOllama,
	SiOpenaigym,
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

type SkillItem = {
	name: string;
	Icon: ComponentType<{ className?: string }>;
};

type SkillGroup = {
	number: string;
	label: string;
	description: string;
	skills: SkillItem[];
};

const skillGroups: SkillGroup[] = [
	{
		number: "01",
		label: "Languages",
		description: "Languages I use to build production systems, low-level tooling, and APIs.",
		skills: [
			{ name: "Rust", Icon: FaRust },
			{ name: "Go", Icon: FaGolang },
			{ name: "TypeScript", Icon: SiTypescript },
			{ name: "C++", Icon: SiCplusplus },
			{ name: "Python", Icon: FaPython },
			{ name: "Java", Icon: FaJava },
		],
	},
	{
		number: "02",
		label: "Cloud & DevOps",
		description: "Infrastructure, container orchestration, and observability platforms.",
		skills: [
			{ name: "Kubernetes", Icon: SiKubernetes },
			{ name: "AWS", Icon: FaAws },
			{ name: "Google Cloud", Icon: SiGooglecloud },
			{ name: "Docker", Icon: SiDocker },
			{ name: "Terraform", Icon: SiTerraform },
			{ name: "Ansible", Icon: SiAnsible },
			{ name: "Prometheus", Icon: SiPrometheus },
			{ name: "Grafana", Icon: SiGrafana },
		],
	},
	{
		number: "03",
		label: "Frameworks & Web",
		description: "Modern frameworks and runtimes for web applications and backend microservices.",
		skills: [
			{ name: "React", Icon: FaReact },
			{ name: "Next.js", Icon: RiNextjsFill },
			{ name: "Tailwind CSS", Icon: SiTailwindcss },
			{ name: "Hono", Icon: SiHono },
			{ name: "Express", Icon: SiExpress },
			{ name: "NestJS", Icon: SiNestjs },
			{ name: "Actix", Icon: SiActix },
			{ name: "Gin", Icon: SiGin },
			{ name: "Vite", Icon: SiVite },
			{ name: "SvelteKit", Icon: SiSvelte },
		],
	},
	{
		number: "04",
		label: "AI & Machine Learning",
		description: "Libraries, agent orchestration frameworks, and LLM tooling.",
		skills: [
			{ name: "PyTorch", Icon: SiPytorch },
			{ name: "TensorFlow", Icon: SiTensorflow },
			{ name: "scikit-learn", Icon: SiScikitlearn },
			{ name: "LangChain", Icon: SiLangchain },
			{ name: "LangGraph", Icon: SiLanggraph },
			{ name: "Hugging Face", Icon: SiHuggingface },
			{ name: "Ollama", Icon: SiOllama },
			{ name: "OpenAI", Icon: SiOpenaigym },
			{ name: "Gemini", Icon: SiGooglegemini },
			{ name: "NumPy", Icon: SiNumpy },
			{ name: "Pandas", Icon: SiPandas },
		],
	},
	{
		number: "05",
		label: "Developer Tooling",
		description: "IDEs, API suites, and developer infrastructure that power my day-to-day work.",
		skills: [
			{ name: "Supabase", Icon: SiSupabase },
			{ name: "Postman", Icon: SiPostman },
			{ name: "GitLab", Icon: SiGitlab },
			{ name: "VS Code", Icon: BiLogoVisualStudio },
			{ name: "IntelliJ", Icon: SiIntellijidea },
		],
	},
];

interface SkillsSectionProps {
	className?: string;
}

export default function SkillsSection({ className = "" }: SkillsSectionProps) {
	return (
		<section className={`skills page-section ${className}`} id="skills" aria-label="Technical skills and tools">
			<div className="section-heading">
				<p className="eyebrow">Skills &amp; Arsenal</p>
				<p className="section-note">
					A breakdown of the languages, systems,
					<br />
					and platforms I reach for daily.
				</p>
			</div>

			<div className="skills-grid">
				{skillGroups.map((group) => (
					<div className="skill-group-row" key={group.label}>
						<div className="skill-group-meta">
							<span className="skill-group-number">{group.number}</span>
							<h3 className="skill-group-title">{group.label}</h3>
							<p className="skill-group-description">{group.description}</p>
						</div>
						<div className="skill-items-container">
							{group.skills.map(({ name, Icon }) => (
								<div className="skill-item-chip" key={name}>
									<Icon className="skill-item-icon" aria-hidden="true" />
									<span className="skill-item-name">{name}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
