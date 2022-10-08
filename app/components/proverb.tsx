import {
	ClipboardIcon,
	PencilIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import type { Proverb } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { copyToCliboard } from "~/utils/copyToClipboard";
import { Modal } from "./modal";

type ActionData = {
	formError?: string;
	fieldErrors?: {
		content: string | undefined;
	};
	fields?: {
		content: string;
		language: string;
	};
};

type UserPermissions = {
	canEdit: boolean;
	canDelete: boolean;
};

export function ProverbDisplay({
	proverb,
	userPermissions,
	actionData,
}: {
	proverb: Pick<Proverb, "content" | "language">;
	userPermissions: UserPermissions;
	actionData?: ActionData;
}) {
	const { canEdit, canDelete } = userPermissions;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	return (
		<div>
			<div className="proverb-content">
				<p>{proverb.content}</p>
			</div>
			<div className="action-buttons">
				<button
					className="button"
					onClick={() => copyToCliboard(window.location.href)}
				>
					<ClipboardIcon></ClipboardIcon>
				</button>
				{canEdit && (
					<button
						className="button"
						onClick={() => {
							setIsModalOpen(true);
						}}
					>
						<PencilIcon></PencilIcon>
					</button>
				)}
				{canDelete && (
					<button
						className="button"
						onClick={() => {
							setIsDeleteModalOpen(true);
						}}
					>
						<TrashIcon></TrashIcon>
					</button>
				)}
			</div>
			{isModalOpen && (
				<Modal
					onClose={() => {
						setIsModalOpen(false);
					}}
				>
					<Form method="post">
						<input type="hidden" name="_method" value="put" />
						<div>
							<label>
								Content:{" "}
								<textarea
									defaultValue={actionData?.fields?.content || proverb.content}
									name="content"
									aria-invalid={
										Boolean(actionData?.fieldErrors?.content) || undefined
									}
									aria-errormessage={
										actionData?.fieldErrors?.content
											? "content-error"
											: undefined
									}
								/>
							</label>
						</div>
						<div>
							<label>
								Language:{" "}
								<textarea
									name="language"
									defaultValue={
										actionData?.fields?.language || proverb.language
									}
								/>
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
								Save
							</button>
						</div>
					</Form>
				</Modal>
			)}
			{isDeleteModalOpen && (
				<Modal
					onClose={() => {
						setIsDeleteModalOpen(false);
					}}
				>
					<Form method="post">
						<input type="hidden" name="_method" value="delete" />
						<p>Are you sure you want to delete this proverb?</p>
						<button
							onClick={() => {
								setIsDeleteModalOpen(false);
							}}
							type="button"
							className="button"
						>
							Cancel
						</button>
						<button type="submit" className="button">
							Delete
						</button>
					</Form>
				</Modal>
			)}
		</div>
	);
}
