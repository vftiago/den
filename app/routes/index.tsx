import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = () => ({
	title: "Proverbial Remix",
	description: "The Proverbial Remix app.",
});

export default function IndexRoute() {
	return (
		<div className="container">
			<div className="content">
				<h1>
					Remix <span>Proverbs!</span>
				</h1>
				<nav>
					<ul>
						<li>
							<Link to="proverbs">Read Proverbs</Link>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
}
