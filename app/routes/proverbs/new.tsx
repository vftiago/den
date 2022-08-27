import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	Form,
	Link,
	useActionData,
	useCatch,
	useTransition,
} from "@remix-run/react";
import { ProverbDisplay } from "~/components/proverb";

import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request);
	if (!userId) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return json({});
};

function validateProverbContent(content: string) {
	if (content.length < 10) {
		return `Proverbs must have at least 10 characters.`;
	}
}

type ActionData = {
	formError?: string;
	fieldErrors?: {
		content: string | undefined;
	};
	fields?: {
		content: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);
	const form = await request.formData();
	const content = form.get("content");
	const language = form.get("language");

	if (typeof content !== "string" || typeof language !== "string") {
		return badRequest({
			formError: `Form not submitted correctly.`,
		});
	}

	const fields = { content, language };

	const fieldErrors = {
		content: validateProverbContent(content),
	};

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const proverb = await db.proverb.create({
		data: {
			...fields,
			approved: false,
			baseColor: "red",
			authorId: userId,
		},
	});
	return redirect(`/proverbs/${proverb.id}`);
};

export default function NewProverbRoute() {
	const actionData = useActionData<ActionData>();
	const transition = useTransition();

	if (transition.submission) {
		const content = transition.submission.formData.get("content");
		if (typeof content === "string" && !validateProverbContent(content)) {
			return (
				<ProverbDisplay
					proverb={{ content }}
					isOwner={true}
					canDelete={false}
				/>
			);
		}
	}

	return (
		<div>
			<p>Add your own proverb</p>
			<Form method="post">
				<div>
					<label>
						Content:{" "}
						<textarea
							defaultValue={actionData?.fields?.content}
							name="content"
							aria-invalid={
								Boolean(actionData?.fieldErrors?.content) || undefined
							}
							aria-errormessage={
								actionData?.fieldErrors?.content ? "content-error" : undefined
							}
						/>
					</label>
				</div>
				<div>
					<label>
						Language: <textarea name="language" />
					</label>
				</div>
				<div>
					{actionData?.fieldErrors?.content ? (
						<p
							className="form-validation-error"
							role="alert"
							id="content-error"
						>
							{actionData.fieldErrors.content}
						</p>
					) : null}
					<button type="submit" className="button">
						Add
					</button>
				</div>
			</Form>
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 401) {
		return (
			<div className="error-container">
				<p>You must be logged in to create a proverb.</p>
				<Link to="/login">Login</Link>
			</div>
		);
	}
}

export function ErrorBoundary() {
	return (
		<div className="error-container">
			Something unexpected went wrong. Sorry about that.
		</div>
	);
}
