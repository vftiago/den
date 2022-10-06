import { Form, Link } from "@remix-run/react";

export const Header = ({ username }: { username?: string }) => {
	return (
		<header>
			<Link to="/">
				<h1>Proverbial Remix</h1>
			</Link>
			<nav>
				<ul>
					<li>
						<Link to="/proverbs">List</Link>
					</li>
					<li>
						<Link to=".">Random</Link>
					</li>

					<li>
						<Link to="/proverbs/new" className="button">
							Add your own
						</Link>
					</li>
					{username ? (
						<li className="user-info">
							<span>{`Hi ${username}!`}</span>
							<Form action="/logout" method="post">
								<button type="submit" className="button">
									Logout
								</button>
							</Form>
						</li>
					) : (
						<li>
							<Link to="/login">Login</Link>
						</li>
					)}
				</ul>
			</nav>
		</header>
	);
};
