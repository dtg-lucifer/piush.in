import { useEffect, useState } from "react";

export interface Project {
	name: string;
	description: string;
	image: string;
	repoUrl: string;
	demoUrl: string;
	tags: string[];
	wip: boolean;
	featured?: boolean;
}

export interface Experience {
	organization: string;
	employment_type: string;
	location: string;
	position: string;
	start_date: string;
	end_date: string;
	brief: string;
}

interface UseJsonResult<T> {
	data: T[];
	isLoading: boolean;
	loadingMessage: string;
}

// Generic hook for loading any JSON file
export function useJsonData<T>(filePath: string): UseJsonResult<T> {
	const [data, setData] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingMessage, setLoadingMessage] = useState("Thinking.");

	useEffect(() => {
		if (!isLoading) {
			return;
		}

		const messages = ["Thinking.", "Thinking..", "Thinking..."];
		let messageIndex = 0;

		const interval = window.setInterval(() => {
			messageIndex = (messageIndex + 1) % messages.length;
			setLoadingMessage(messages[messageIndex]);
		}, 500);

		return () => {
			window.clearInterval(interval);
		};
	}, [isLoading]);

	useEffect(() => {
		let active = true;

		const loadData = async () => {
			try {
				const response = await fetch(filePath, {
					method: "GET",
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error(`Unable to load ${filePath}`);
				}

				const loadedData = (await response.json()) as T[];
				if (active) {
					setData(loadedData);
				}
			} catch {
				if (active) {
					setData([]);
				}
			} finally {
				if (active) {
					setIsLoading(false);
				}
			}
		};

		loadData();

		return () => {
			active = false;
		};
	}, [filePath]);

	return { data, isLoading, loadingMessage };
}

// Convenience hook for projects
export function useProjects() {
	const { data: projects, isLoading, loadingMessage } = useJsonData<Project>("/projects/__data.json");
	return { projects, isLoading, loadingMessage };
}

export interface ArticleMeta {
	title: string;
	seoTitle: string;
	seoDescription: string;
	datePublished: string;
	cuid: string;
	slug: string;
	cover: string;
	ogImage: string;
	tags: string[];
	featured?: boolean;
}

// Convenience hook for articles
export function useArticles() {
	const { data: articles, isLoading, loadingMessage } = useJsonData<ArticleMeta>("/articles/__data.json");
	return { articles, isLoading, loadingMessage };
}

// Convenience hook for experiences
export function useExperiences() {
	const { data: experiences, isLoading, loadingMessage } = useJsonData<Experience>("/experiences.json");
	return { experiences, isLoading, loadingMessage };
}

// Helper function to calculate duration between two dates
export function calculateDuration(startDate: string, endDate: string): string {
	const start = new Date(startDate);
	const end = new Date(endDate);

	const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

	if (months < 1) {
		return "< 1 month";
	}

	if (months < 12) {
		return `${months} month${months > 1 ? "s" : ""}`;
	}

	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (remainingMonths === 0) {
		return `${years} year${years > 1 ? "s" : ""}`;
	}

	return `${years}y ${remainingMonths}m`;
}
