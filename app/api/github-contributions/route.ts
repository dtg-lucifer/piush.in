import { NextResponse } from "next/server";

const GITHUB_USERNAME = "dtg-lucifer";

const CALENDAR_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    createdAt
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }
    }
  }
}
`;

// Per-year query fetches:
//   totalCommitContributions  — commits on default branch of non-fork repos
//   restrictedContributionsCount — private contributions (visible when queried
//     with the account owner's own token, regardless of the profile toggle)
function buildLifetimeQuery(startYear: number, endYear: number): string {
	const fields = [];
	for (let year = startYear; year <= endYear; year++) {
		const from = `${year}-01-01T00:00:00Z`;
		const to = year === endYear ? new Date().toISOString() : `${year}-12-31T23:59:59Z`;
		fields.push(
			`year${year}: contributionsCollection(from: "${from}", to: "${to}") {
        totalCommitContributions
        restrictedContributionsCount
      }`,
		);
	}
	return `query($username: String!) { user(login: $username) { ${fields.join("\n")} } }`;
}

async function graphql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
	const res = await fetch("https://api.github.com/graphql", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
		next: { revalidate: 3600 },
	});

	if (!res.ok) throw new Error(`GitHub API ${res.status}`);

	const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
	if (json.errors?.length) throw new Error(json.errors[0].message);
	if (!json.data) throw new Error("No data returned");

	return json.data;
}

export async function GET() {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		return NextResponse.json({ error: "GITHUB_TOKEN not set" }, { status: 500 });
	}

	const now = new Date();
	const from = new Date();
	from.setFullYear(from.getFullYear() - 1);

	try {
		// Step 1: calendar for the last year + account creation date
		const calendarData = await graphql<{
			user: {
				createdAt: string;
				contributionsCollection: {
					contributionCalendar: {
						totalContributions: number;
						weeks: {
							contributionDays: {
								date: string;
								contributionCount: number;
								weekday: number;
							}[];
						}[];
					};
				};
			};
		}>(token, CALENDAR_QUERY, {
			username: GITHUB_USERNAME,
			from: from.toISOString(),
			to: now.toISOString(),
		});

		const calendar = calendarData.user.contributionsCollection.contributionCalendar;
		const accountCreatedYear = new Date(calendarData.user.createdAt).getFullYear();
		const currentYear = now.getFullYear();

		// Step 2: lifetime commits — sum public commits + restricted (private) commits
		// across every year since account creation, all in one batched GraphQL request.
		const lifetimeQuery = buildLifetimeQuery(accountCreatedYear, currentYear);
		const lifetimeData = await graphql<{
			user: Record<
				string,
				{ totalCommitContributions: number; restrictedContributionsCount: number }
			>;
		}>(token, lifetimeQuery, { username: GITHUB_USERNAME });

		let totalCommits = 0;
		for (let year = accountCreatedYear; year <= currentYear; year++) {
			const yearData = lifetimeData.user[`year${year}`];
			if (yearData) {
				totalCommits +=
					yearData.totalCommitContributions + yearData.restrictedContributionsCount;
			}
		}

		return NextResponse.json(
			{ ...calendar, totalCommits },
			{
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
				},
			},
		);
	} catch (err) {
		console.error("[github-contributions]", err);
		return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
	}
}
