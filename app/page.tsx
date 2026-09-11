import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/site-nav";
import LenisScroll from "@/components/lenis-scroll";
import GlitchRevealText from "@/components/glitch-text";
import LatexText from "@/components/latex-text";
import SkillsSection from "@/components/home/skills-section";
import GitHubCommitGraph from "@/components/home/github-commit-graph";
import projectsDataRaw from "@/public/projects/__data.json";
import articlesDataRaw from "@/public/articles/__data.json";
import experiencesDataRaw from "@/public/experiences.json";
import type { Project, ArticleMeta, Experience } from "@/hooks/useProjects";

function formatPeriod(startDate: string, endDate: string): string {
	const format = (dateStr: string) => {
		if (!dateStr || dateStr === "CURRENT") return "Present";
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
	};
	return `${format(startDate)} — ${format(endDate)}`;
}

// Dynamically derived from public/projects/__data.json (only featured: true shown on homepage)
const projects = (projectsDataRaw as Project[])
	.filter((p) => p.featured === true)
	.map((project, index) => ({
		number: String(index + 1).padStart(2, "0"),
		name: project.name,
		type: project.tags.slice(0, 2).join(" / "),
		languages: project.languages || [],
		description: project.description,
		href: project.demoUrl || project.repoUrl,
	}));

// Dynamically derived from public/experiences.json (only featured: true shown on homepage)
const roles = (experiencesDataRaw as Experience[])
	.filter((exp) => exp.featured !== false)
	.map((exp) => ({
		period: formatPeriod(exp.start_date, exp.end_date),
		role: exp.position,
		company: exp.organization,
		detail: exp.brief,
	}));

// Dynamically derived from public/articles/__data.json (only featured: true shown on homepage)
const thoughts = (articlesDataRaw as ArticleMeta[])
	.filter((a) => a.featured === true)
	.map((article) => ({
		title: article.title,
		href: `/blog/${article.slug}`,
	}));

const skills = [
	"Rust",
	"Go",
	"TypeScript",
	"Kubernetes",
	"AWS / GCP",
	"PyTorch",
	"PostgreSQL",
	"Kafka",
	"Docker",
	"C++",
	"Solidity",
];

export default function Home() {
	return (
		<main id="top" className="min-h-screen">
			<LenisScroll />
			<SiteNav />

			{/* Hero Section */}
			<section className="hero page-section" id="hero">
				<div className="hero-copy">
					<p className="eyebrow">Software &amp; Machine Learning Engineer / Kolkata, India</p>

					{/* Mobile Hero Visual Lockup (placed intentionally at top of mobile hero) */}
					<div className="mobile-hero-visual-wrapper md:hidden">
						<div className="hero-visual-frame" aria-label="Hero photo with decorative grid">
							<div className="hero-grid-element" aria-hidden="true" />
							<div className="hero-image-frame">
								<Image
									src="/assets/images/hero_image.webp"
									alt="Piush Bose"
									width={216}
									height={216}
									priority
									className="w-full h-full object-cover rounded-none block"
								/>
							</div>
						</div>
					</div>

					<h1>
						Building the
						<br />
						<em>
							<GlitchRevealText text="infrastructure" retriggerOnHover={false} />
						</em>
						<br />
						behind good ideas.
					</h1>
					<p className="hero-intro">
						I&apos;m Piush Bose, an indie software and machine learning engineer building scalable,
						event-driven systems, resilient backends, and applied AI infrastructure.
					</p>
					<div className="hero-links">
						<a className="button button-dark" href="#work">
							See selected work <span aria-hidden="true">↓</span>
						</a>
						<a
							className="text-link"
							href="https://github.com/dtg-lucifer"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub profile <span aria-hidden="true">↗</span>
						</a>
						<a
							className="text-link"
							href="/resume.pdf"
							target="_blank"
							rel="noopener noreferrer"
						>
							Resume <span aria-hidden="true">↗</span>
						</a>
					</div>
				</div>

				<div className="hero-right">
					{/* Desktop Picture with Underneath Grid Element (hidden on mobile) */}
					<div className="hidden md:block hero-visual-frame" aria-label="Hero photo with decorative grid">
						{/* Grid pattern (offset down-right, underneath) */}
						<div className="hero-grid-element" aria-hidden="true" />
						{/* Picture (top-left, on top, sharp corners without rounded corners) */}
						<div className="hero-image-frame">
							<Image
								src="/assets/images/hero_image.webp"
								alt="Piush Bose"
								width={216}
								height={216}
								className="w-full h-full object-cover rounded-none block"
							/>
						</div>
					</div>

					<div className="hero-aside" aria-label="Current role">
						<div className="signal-mark">
							<span />
							<span />
							<span />
						</div>
						<p>
							<strong>Available for work</strong>
							<br />
							Backend, ML/AI systems, cloud,
							<br />
							and distributed infrastructure.
						</p>
						<span className="aside-index">/ NetpieDev · SDE II</span>
					</div>
				</div>
			</section>

			{/* Ticker Section */}
			<section className="ticker" aria-label="Areas of practice">
				<div className="ticker-track">
					<span>Machine learning systems</span>
					<b>✳</b>
					<span>Distributed systems</span>
					<b>✳</b>
					<span>Low-level software</span>
					<b>✳</b>
					<span>Web3 &amp; blockchain</span>
					<b>✳</b>
					<span>Cloud-native systems</span>
					<b>✳</b>
					<span>Event-driven architecture</span>
					<b>✳</b>
					{/* Duplicate for seamless infinite loop on mobile */}
					<span className="ticker-duplicate">Machine learning systems</span>
					<b className="ticker-duplicate">✳</b>
					<span className="ticker-duplicate">Distributed systems</span>
					<b className="ticker-duplicate">✳</b>
					<span className="ticker-duplicate">Low-level software</span>
					<b className="ticker-duplicate">✳</b>
					<span className="ticker-duplicate">Web3 &amp; blockchain</span>
					<b className="ticker-duplicate">✳</b>
					<span className="ticker-duplicate">Cloud-native systems</span>
					<b className="ticker-duplicate">✳</b>
					<span className="ticker-duplicate">Event-driven architecture</span>
					<b className="ticker-duplicate">✳</b>
				</div>
			</section>

			{/* Selected Work Section */}
			<section className="work page-section" id="work">
				<div className="section-heading">
					<p className="eyebrow">Selected work</p>
					<div className="flex flex-col gap-2">
						<p className="section-note">
							A few things I&apos;ve made
							<br />
							to understand systems better.
						</p>
						<Link href="/projects" className="text-link self-start text-xs mt-2">
							View all projects <span aria-hidden="true">↗</span>
						</Link>
					</div>
				</div>
				<div className="project-list">
					{projects.map((project) => (
						<a
							className="project"
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
							key={project.name}
						>
							<span className="project-number">{project.number}</span>
							<div className="project-main">
								<p className="project-type">{project.type}</p>
								<h2>{project.name}</h2>
								<p className="project-description">
									<LatexText text={project.description} />
								</p>
								{project.languages && project.languages.length > 0 && (
									<div className="project-languages">
										{project.languages.map((lang) => (
											<span className="project-lang-tag" key={lang}>
												{lang}
											</span>
										))}
									</div>
								)}
							</div>
							<span className="project-arrow" aria-hidden="true">
								↗
							</span>
						</a>
					))}
				</div>
			</section>

			{/* Experience Section */}
			<section className="experience" id="experience">
				<div className="section-heading">
					<p className="eyebrow">Experience</p>
					<p className="section-note">
						Four roles, one steadily
						<br />
						more systems-shaped path.
					</p>
				</div>
				<div className="role-list">
					{roles.map((role) => (
						<div className="role" key={`${role.company}-${role.period}`}>
							<span className="role-period">{role.period}</span>
							<div>
								<h2>{role.role}</h2>
								<p>{role.company}</p>
							</div>
							<span className="role-detail">{role.detail}</span>
						</div>
					))}
				</div>
			</section>

			{/* Skills & Arsenal Section */}
			<SkillsSection />

			{/* About Section */}
			<section className="about page-section" id="about">
				<div className="section-heading">
					<p className="eyebrow">A little context</p>
				</div>
				<div className="about-content">
					<p className="about-lede">
						I like working close to the metal, close to the models, and close to the people who use the software.
					</p>
					<div className="about-details">
						<p>
							From Kafka-backed workflows and machine learning systems to a tiny virtual machine, I enjoy
							making complex systems feel legible, reliable, and useful. I work at the intersection of systems
							engineering and applied machine learning, and I&apos;m currently studying Cloud Technology &amp; Information
							Security at Techno India University.
						</p>
						<div className="skill-list">
							{skills.map((skill) => (
								<span key={skill}>{skill}</span>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Recent Thoughts Section */}
			<section className="thoughts page-section" id="thoughts">
				<div className="section-heading">
					<p className="eyebrow">Recent thoughts</p>
					<Link className="text-link" href="/blog">
						Read all articles <span aria-hidden="true">↗</span>
					</Link>
				</div>
				<div className="thought-list">
					{thoughts.map((thought, index) => (
						<Link className="thought" href={thought.href} key={thought.title}>
							<span className="thought-index">0{index + 1}</span>
							<GlitchRevealText
								as="strong"
								text={thought.title}
								triggerOnScroll
								delay={index * 120}
								retriggerOnHover={true}
							/>
							<b aria-hidden="true">↗</b>
						</Link>
					))}
				</div>
			</section>

			{/* GitHub Commit Graph Section (Placed after recent thoughts) */}
			<GitHubCommitGraph />

			{/* Contact Section */}
			<section className="contact" id="contact">
				<div className="page-section-inner">
					<p className="eyebrow">Available for work · mail@piush.in</p>
					<h2>
						Let&apos;s make
						<br />
						<em>something useful.</em>
					</h2>
					<a className="button button-light" href="mailto:mail@piush.in">
						mail@piush.in <span aria-hidden="true">↗</span>
					</a>
				</div>
			</section>
		</main>
	);
}
