import type { Proverb } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

export function ProverbDisplay({
	proverb,
	canDelete,
}: {
	proverb: Pick<Proverb, "content">;
	canDelete?: boolean;
}) {
	return (
		<div>
			<p>{proverb.content}</p>
			<Link to=".">Permalink</Link>
			{canDelete ? (
				<Form method="post">
					<input type="hidden" name="_method" value="delete" />
					<button type="submit" className="button" disabled={!canDelete}>
						Delete
					</button>
				</Form>
			) : null}
		</div>
	);
}
